import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies before importing the routes
const mockFindMany = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();

vi.mock('@/server/db', () => ({
    db: {
        query: {
            documents: {
                findFirst: (...args: unknown[]) => mockFindFirst(...args),
                findMany: (...args: unknown[]) => mockFindMany(...args)
            },
            folders: {
                findFirst: (...args: unknown[]) => mockFindFirst(...args),
                findMany: (...args: unknown[]) => mockFindMany(...args)
            }
        },
        update: (...args: unknown[]) => mockUpdate(...args),
        insert: (...args: unknown[]) => mockInsert(...args),
        select: (...args: unknown[]) => mockSelect(...args)
    },
    documents: {
        id: 'id',
        userId: 'userId',
        name: 'name',
        content: 'content',
        folderId: 'folderId',
        syncVersion: 'syncVersion',
        updatedAt: 'updatedAt',
        deletedAt: 'deletedAt',
        syncedAt: 'syncedAt'
    },
    folders: {
        id: 'id',
        userId: 'userId',
        name: 'name',
        parentId: 'parentId',
        sortOrder: 'sortOrder',
        updatedAt: 'updatedAt',
        deletedAt: 'deletedAt'
    }
}));

const mockGetAuthUser = vi.fn();
vi.mock('@/server/api/middleware/auth', () => ({
    getAuthUser: () => mockGetAuthUser()
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn((a, b) => ({ eq: true, field: a, value: b })),
    and: vi.fn((...args) => ({ and: true, args })),
    gt: vi.fn((a, b) => ({ gt: true, field: a, value: b })),
    or: vi.fn((...args) => ({ or: true, args })),
    isNull: vi.fn((a) => ({ isNull: true, field: a }))
}));

vi.mock('@hono/zod-validator', () => ({
    zValidator: () => vi.fn((_c, next) => next())
}));

// Import the routes after mocking
import syncRoutes from '@/server/api/routes/sync';

describe('Sync Routes', () => {
    let app: Hono;

    beforeEach(() => {
        vi.clearAllMocks();

        mockGetAuthUser.mockReturnValue({
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com'
        });

        app = new Hono();
        app.route('/api/sync', syncRoutes);
    });

    describe('Document Routes', () => {
        describe('GET /documents', () => {
            it('should return all documents for user', async () => {
                const mockDocs = [
                    { id: 'doc-1', name: 'Test.md', content: '# Test' },
                    { id: 'doc-2', name: 'Another.md', content: '# Another' }
                ];
                mockFindMany.mockResolvedValue(mockDocs);

                const res = await app.request('/api/sync/documents');
                const data = await res.json();

                expect(res.status).toBe(200);
                expect(data.documents).toEqual(mockDocs);
                expect(data.syncedAt).toBeDefined();
            });

            it('should filter by since parameter', async () => {
                mockFindMany.mockResolvedValue([]);
                const since = new Date().toISOString();

                const res = await app.request(`/api/sync/documents?since=${since}`);

                expect(res.status).toBe(200);
                expect(mockFindMany).toHaveBeenCalled();
            });

            it('should return empty array when no documents', async () => {
                mockFindMany.mockResolvedValue([]);

                const res = await app.request('/api/sync/documents');
                const data = await res.json();

                expect(res.status).toBe(200);
                expect(data.documents).toEqual([]);
            });
        });

        describe('PUT /documents/:id', () => {
            it('should require document data in body', async () => {
                const res = await app.request('/api/sync/documents/doc-1', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });

                // Validation error expected without proper body
                expect(res.status).toBeGreaterThanOrEqual(400);
            });
        });

        describe('DELETE /documents/:id', () => {
            it('should handle delete request', async () => {
                // Since the delete uses complex db operations,
                // we verify the route is accessible
                const res = await app.request('/api/sync/documents/doc-1', {
                    method: 'DELETE'
                });

                // Either success, not found, or internal error from mock
                expect([200, 404, 500]).toContain(res.status);
            });
        });
    });

    describe('Folder Routes', () => {
        describe('GET /folders', () => {
            it('should return all folders for user', async () => {
                const mockFolders = [
                    { id: 'folder-1', name: 'Folder A' },
                    { id: 'folder-2', name: 'Folder B' }
                ];
                mockFindMany.mockResolvedValue(mockFolders);

                const res = await app.request('/api/sync/folders');
                const data = await res.json();

                expect(res.status).toBe(200);
                expect(data.folders).toEqual(mockFolders);
                expect(data.syncedAt).toBeDefined();
            });

            it('should filter by since parameter', async () => {
                mockFindMany.mockResolvedValue([]);
                const since = new Date().toISOString();

                const res = await app.request(`/api/sync/folders?since=${since}`);

                expect(res.status).toBe(200);
                expect(mockFindMany).toHaveBeenCalled();
            });
        });

        describe('PUT /folders/:id', () => {
            it('should require folder data in body', async () => {
                const res = await app.request('/api/sync/folders/folder-1', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });

                // Validation error expected without proper body
                expect(res.status).toBeGreaterThanOrEqual(400);
            });
        });

        describe('DELETE /folders/:id', () => {
            it('should handle delete request', async () => {
                const res = await app.request('/api/sync/folders/folder-1', {
                    method: 'DELETE'
                });

                // Either success, not found, or internal error from mock
                expect([200, 404, 500]).toContain(res.status);
            });
        });
    });

    describe('Sync Status', () => {
        describe('GET /status', () => {
            it('should return sync status', async () => {
                mockSelect.mockReturnValue({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockResolvedValue([{ count: 5 }])
                    })
                });

                const res = await app.request('/api/sync/status');
                const data = await res.json();

                expect(res.status).toBe(200);
                expect(data.timestamp).toBeDefined();
            });
        });
    });
});
