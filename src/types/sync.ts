/**
 * Sync-related type definitions
 */

export interface SyncDocument {
    id: string;
    userId: string;
    name: string;
    content: string;
    folderId: string | null;
    isManuallyNamed: boolean;
    cursor: CursorPosition | null;
    scroll: ScrollPosition | null;
    syncVersion: number;
    createdAt: string;
    updatedAt: string;
    syncedAt: string | null;
    deletedAt: string | null;
}

export interface SyncFolder {
    id: string;
    userId: string;
    name: string;
    parentId: string | null;
    color: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface CursorPosition {
    line: number;
    column: number;
}

export interface ScrollPosition {
    line: number;
    percentage: number;
}

export interface SyncStatus {
    documentsCount: number;
    foldersCount: number;
    timestamp: string;
}

export interface SyncDocumentsResponse {
    documents: SyncDocument[];
    syncedAt: string;
}

export interface SyncFoldersResponse {
    folders: SyncFolder[];
    syncedAt: string;
}

export interface SyncDocumentResponse {
    document: SyncDocument;
}

export interface SyncFolderResponse {
    folder: SyncFolder;
}

export interface SyncConflictResponse {
    error: 'Conflict';
    message: string;
    serverVersion: number;
    serverDocument: SyncDocument;
}

export interface SyncDeleteResponse {
    success: boolean;
    document?: SyncDocument;
    folder?: SyncFolder;
}

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface SyncConflict {
    documentId: string;
    localDocument: SyncDocument;
    serverDocument: SyncDocument;
    resolvedAt?: string;
    resolution?: 'local' | 'server' | 'both';
}

export interface SyncQueueItem {
    id: string;
    type: 'document' | 'folder';
    operation: 'upsert' | 'delete';
    data: SyncDocument | SyncFolder | { id: string };
    timestamp: number;
    retries: number;
}

export interface DocumentUpsertPayload {
    id: string;
    name: string;
    content: string;
    folderId?: string | null;
    isManuallyNamed?: boolean;
    cursor?: CursorPosition | null;
    scroll?: ScrollPosition | null;
    syncVersion?: number;
}

export interface FolderUpsertPayload {
    id: string;
    name: string;
    parentId?: string | null;
    color?: string | null;
    sortOrder?: number;
}
