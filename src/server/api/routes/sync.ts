import { zValidator } from '@hono/zod-validator';
import type { Session, User } from 'better-auth';
import { and, eq, gt, isNull, or, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db, documents, folders, userSessionState } from '../../db';
import { connectionManager } from '../../sse/connectionManager';
import { getAuthUser } from '../middleware/auth';

type Variables = {
    user: User | null;
    session: Session | null;
};

const syncRoutes = new Hono<{ Variables: Variables }>();

// ============================================================================
// Schemas
// ============================================================================

const documentSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    content: z.string(),
    folderId: z.string().nullable().optional(),
    isManuallyNamed: z.boolean().optional(),
    cursor: z
        .object({
            line: z.number(),
            column: z.number()
        })
        .nullable()
        .optional(),
    scroll: z
        .object({
            line: z.number(),
            percentage: z.number()
        })
        .nullable()
        .optional(),
    syncVersion: z.number().optional(),
    // Add client timestamp for better conflict detection
    clientUpdatedAt: z.string().optional()
});

const folderSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    parentId: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    sortOrder: z.number().optional()
});

const sessionStateSchema = z.object({
    openDocumentIds: z.array(z.string()),
    activeDocumentId: z.string().nullable()
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Update session state to include a document ID and broadcast the change
 */
async function addDocumentToSessionState(
    userId: string,
    documentId: string,
    deviceId: string | undefined
): Promise<void> {
    try {
        const existing = await db.query.userSessionState.findFirst({
            where: eq(userSessionState.userId, userId)
        });

        let newOpenDocumentIds: string[];

        if (existing) {
            // Add document to list if not already present
            if (!existing.openDocumentIds.includes(documentId)) {
                newOpenDocumentIds = [...existing.openDocumentIds, documentId];
                await db
                    .update(userSessionState)
                    .set({
                        openDocumentIds: newOpenDocumentIds,
                        updatedAt: new Date()
                    })
                    .where(eq(userSessionState.userId, userId));
            } else {
                newOpenDocumentIds = existing.openDocumentIds;
            }
        } else {
            // Create new session state
            newOpenDocumentIds = [documentId];
            await db.insert(userSessionState).values({
                id: crypto.randomUUID(),
                userId,
                openDocumentIds: newOpenDocumentIds,
                activeDocumentId: documentId,
                updatedAt: new Date()
            });
        }

        // Broadcast session update to other devices
        connectionManager.broadcast(
            userId,
            'session:updated',
            {
                openDocumentIds: newOpenDocumentIds,
                activeDocumentId: existing?.activeDocumentId ?? documentId,
                updatedAt: new Date().toISOString()
            },
            deviceId
        );
    } catch (error) {
        console.error('[Sync] Failed to update session state:', error);
    }
}

// ============================================================================
// Document Routes
// ============================================================================

// GET /api/sync/documents - List all documents
syncRoutes.get('/documents', async (c) => {
    const user = getAuthUser(c);
    const since = c.req.query('since');

    const sinceDate = since ? new Date(since) : null;
    const query = db.query.documents.findMany({
        where: and(
            eq(documents.userId, user.id),
            sinceDate
                ? or(gt(documents.updatedAt, sinceDate), documents.deletedAt ? gt(documents.deletedAt, sinceDate) : undefined)
                : undefined
        ),
        orderBy: (docs, { desc }) => [desc(docs.updatedAt)]
    });

    const docs = await query;

    return c.json({
        documents: docs,
        syncedAt: new Date().toISOString()
    });
});

// PUT /api/sync/documents/:id - Create or update document
syncRoutes.put('/documents/:id', zValidator('json', documentSchema), async (c) => {
    const user = getAuthUser(c);
    const docId = c.req.param('id');
    const data = c.req.valid('json');
    const deviceId = c.req.header('X-Device-Id');

    // Check if document exists
    const existing = await db.query.documents.findFirst({
        where: and(eq(documents.id, docId), eq(documents.userId, user.id))
    });

    if (existing) {
        // Conflict detection strategy:
        // Only reject if server has a NEWER version AND the content is different
        // This allows rapid edits from the same client to succeed
        const clientVersion = data.syncVersion ?? 0;
        const serverVersion = existing.syncVersion;

        // Real conflict: server version is ahead AND this is not from the same edit session
        // We use a tolerance window - if versions are within 2, allow it (likely rapid edits)
        const versionDifference = serverVersion - clientVersion;
        const isSignificantConflict = versionDifference > 2;

        if (isSignificantConflict) {
            // Check if content actually differs (avoid false conflicts)
            if (existing.content !== data.content) {
                console.log(`[Sync] Conflict detected for document ${docId}: server v${serverVersion} vs client v${clientVersion}`);
                return c.json(
                    {
                        error: 'Conflict',
                        message: 'Document has been modified on another device',
                        serverVersion: existing.syncVersion,
                        serverDocument: existing
                    },
                    409
                );
            }
            // Content is the same, just update metadata and version
            console.log(`[Sync] Version mismatch but content identical for ${docId}, accepting update`);
        }

        // Update existing document
        const [updated] = await db
            .update(documents)
            .set({
                name: data.name,
                content: data.content,
                folderId: data.folderId,
                isManuallyNamed: data.isManuallyNamed ?? existing.isManuallyNamed,
                cursor: data.cursor,
                scroll: data.scroll,
                syncVersion: serverVersion + 1,
                updatedAt: new Date(),
                syncedAt: new Date(),
                deletedAt: null // Restore if was deleted
            })
            .where(and(eq(documents.id, docId), eq(documents.userId, user.id)))
            .returning();

        // Notify other devices via SSE
        if (updated) {
            connectionManager.broadcast(
                user.id,
                'document:updated',
                {
                    documentId: docId,
                    syncVersion: updated.syncVersion,
                    updatedAt: updated.updatedAt?.toISOString()
                },
                deviceId
            );
        }

        return c.json({ document: updated });
    }

    // Create new document
    const [created] = await db
        .insert(documents)
        .values({
            id: docId,
            userId: user.id,
            name: data.name,
            content: data.content,
            folderId: data.folderId,
            isManuallyNamed: data.isManuallyNamed ?? false,
            cursor: data.cursor,
            scroll: data.scroll,
            syncVersion: 1,
            syncedAt: new Date()
        })
        .returning();

    if (created) {
        // Notify other devices about the new document
        connectionManager.broadcast(
            user.id,
            'document:updated',
            {
                documentId: docId,
                syncVersion: created.syncVersion,
                updatedAt: created.updatedAt?.toISOString(),
                isNew: true // Flag to indicate this is a new document
            },
            deviceId
        );

        // Also update session state to include this document and notify other devices
        await addDocumentToSessionState(user.id, docId, deviceId);
    }

    return c.json({ document: created }, 201);
});

// DELETE /api/sync/documents/:id - Soft delete document
syncRoutes.delete('/documents/:id', async (c) => {
    const user = getAuthUser(c);
    const docId = c.req.param('id');
    const deviceId = c.req.header('X-Device-Id');

    const [deleted] = await db
        .update(documents)
        .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
            syncVersion: sql`${documents.syncVersion} + 1`
        })
        .where(and(eq(documents.id, docId), eq(documents.userId, user.id), isNull(documents.deletedAt)))
        .returning();

    if (!deleted) {
        return c.json({ error: 'Document not found' }, 404);
    }

    // Notify other devices via SSE
    connectionManager.broadcast(user.id, 'document:deleted', { documentId: docId }, deviceId);

    return c.json({ success: true, document: deleted });
});

// ============================================================================
// Folder Routes
// ============================================================================

// GET /api/sync/folders - List all folders
syncRoutes.get('/folders', async (c) => {
    const user = getAuthUser(c);
    const since = c.req.query('since');

    const sinceDate = since ? new Date(since) : null;
    const flds = await db.query.folders.findMany({
        where: and(
            eq(folders.userId, user.id),
            sinceDate ? or(gt(folders.updatedAt, sinceDate), folders.deletedAt ? gt(folders.deletedAt, sinceDate) : undefined) : undefined
        ),
        orderBy: (f, { asc }) => [asc(f.sortOrder), asc(f.name)]
    });

    return c.json({
        folders: flds,
        syncedAt: new Date().toISOString()
    });
});

// PUT /api/sync/folders/:id - Create or update folder
syncRoutes.put('/folders/:id', zValidator('json', folderSchema), async (c) => {
    const user = getAuthUser(c);
    const folderId = c.req.param('id');
    const data = c.req.valid('json');
    const deviceId = c.req.header('X-Device-Id');

    // Check if folder exists
    const existing = await db.query.folders.findFirst({
        where: and(eq(folders.id, folderId), eq(folders.userId, user.id))
    });

    if (existing) {
        // Update existing
        const [updated] = await db
            .update(folders)
            .set({
                name: data.name,
                parentId: data.parentId,
                color: data.color,
                sortOrder: data.sortOrder ?? existing.sortOrder,
                updatedAt: new Date(),
                deletedAt: null
            })
            .where(and(eq(folders.id, folderId), eq(folders.userId, user.id)))
            .returning();

        // Notify other devices via SSE
        if (updated) {
            connectionManager.broadcast(
                user.id,
                'folder:updated',
                { folderId, updatedAt: updated.updatedAt?.toISOString() },
                deviceId
            );
        }

        return c.json({ folder: updated });
    }

    // Create new
    const [created] = await db
        .insert(folders)
        .values({
            id: folderId,
            userId: user.id,
            name: data.name,
            parentId: data.parentId,
            color: data.color,
            sortOrder: data.sortOrder ?? 0
        })
        .returning();

    // Notify other devices via SSE
    if (created) {
        connectionManager.broadcast(
            user.id,
            'folder:updated',
            { folderId, updatedAt: created.updatedAt?.toISOString() },
            deviceId
        );
    }

    return c.json({ folder: created }, 201);
});

// DELETE /api/sync/folders/:id - Soft delete folder
syncRoutes.delete('/folders/:id', async (c) => {
    const user = getAuthUser(c);
    const folderId = c.req.param('id');
    const deviceId = c.req.header('X-Device-Id');

    const [deleted] = await db
        .update(folders)
        .set({
            deletedAt: new Date(),
            updatedAt: new Date()
        })
        .where(and(eq(folders.id, folderId), eq(folders.userId, user.id), isNull(folders.deletedAt)))
        .returning();

    if (!deleted) {
        return c.json({ error: 'Folder not found' }, 404);
    }

    // Notify other devices via SSE
    connectionManager.broadcast(user.id, 'folder:deleted', { folderId }, deviceId);

    return c.json({ success: true, folder: deleted });
});

// ============================================================================
// Sync Status
// ============================================================================

// GET /api/sync/status - Get sync status
syncRoutes.get('/status', async (c) => {
    const user = getAuthUser(c);

    const [docCount] = await db
        .select({ count: documents.id })
        .from(documents)
        .where(and(eq(documents.userId, user.id), isNull(documents.deletedAt)));

    const [folderCount] = await db
        .select({ count: folders.id })
        .from(folders)
        .where(and(eq(folders.userId, user.id), isNull(folders.deletedAt)));

    return c.json({
        documentsCount: docCount?.count || 0,
        foldersCount: folderCount?.count || 0,
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// Session State Routes
// ============================================================================

// GET /api/sync/session - Get current session state (open documents, active document)
syncRoutes.get('/session', async (c) => {
    const user = getAuthUser(c);

    const sessionState = await db.query.userSessionState.findFirst({
        where: eq(userSessionState.userId, user.id)
    });

    if (!sessionState) {
        return c.json({
            openDocumentIds: [],
            activeDocumentId: null,
            updatedAt: null
        });
    }

    return c.json({
        openDocumentIds: sessionState.openDocumentIds,
        activeDocumentId: sessionState.activeDocumentId,
        updatedAt: sessionState.updatedAt?.toISOString()
    });
});

// PUT /api/sync/session - Update session state
syncRoutes.put('/session', zValidator('json', sessionStateSchema), async (c) => {
    const user = getAuthUser(c);
    const data = c.req.valid('json');
    const deviceId = c.req.header('X-Device-Id');

    // Check if session state exists
    const existing = await db.query.userSessionState.findFirst({
        where: eq(userSessionState.userId, user.id)
    });

    let result;
    if (existing) {
        // Update existing
        const [updated] = await db
            .update(userSessionState)
            .set({
                openDocumentIds: data.openDocumentIds,
                activeDocumentId: data.activeDocumentId,
                updatedAt: new Date()
            })
            .where(eq(userSessionState.userId, user.id))
            .returning();
        result = updated;
    } else {
        // Create new
        const [created] = await db
            .insert(userSessionState)
            .values({
                id: crypto.randomUUID(),
                userId: user.id,
                openDocumentIds: data.openDocumentIds,
                activeDocumentId: data.activeDocumentId,
                updatedAt: new Date()
            })
            .returning();
        result = created;
    }

    if (!result) {
        return c.json({ error: 'Failed to update session state' }, 500);
    }

    // Notify other devices via SSE
    connectionManager.broadcast(
        user.id,
        'session:updated',
        {
            openDocumentIds: result.openDocumentIds,
            activeDocumentId: result.activeDocumentId,
            updatedAt: result.updatedAt?.toISOString()
        },
        deviceId
    );

    return c.json({
        openDocumentIds: result.openDocumentIds,
        activeDocumentId: result.activeDocumentId,
        updatedAt: result.updatedAt?.toISOString()
    });
});

export default syncRoutes;
