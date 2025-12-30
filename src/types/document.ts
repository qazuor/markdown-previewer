/**
 * Document sync status
 * - local: Local file only, no cloud sync (legacy, treated as synced)
 * - synced: Saved locally AND matches cloud version (green)
 * - modified: Has unsaved local changes (orange)
 * - syncing: Currently saving locally (blue/animated)
 * - cloud-pending: Saved locally but different from cloud, needs push (yellow)
 * - error: Sync failed (red)
 */
export type SyncStatus = 'local' | 'synced' | 'modified' | 'syncing' | 'cloud-pending' | 'error';

export interface Document {
    id: string;
    name: string;
    content: string;
    syncStatus: SyncStatus;
    isManuallyNamed: boolean;
    source: 'local' | 'github' | 'gdrive';
    githubInfo?: GitHubFileInfo;
    driveInfo?: DriveFileInfo;
    cursor: CursorPosition;
    scroll: ScrollPosition;
    createdAt: Date;
    updatedAt: Date;
    // Cloud sync fields
    folderId?: string | null;
    syncVersion?: number;
    syncedAt?: Date | null;
    // Original content hash for detecting changes (cloud files only)
    originalContentHash?: string;
}

export interface GitHubFileInfo {
    owner: string;
    repo: string;
    path: string;
    sha: string;
    branch: string;
}

export interface DriveFileInfo {
    fileId: string;
    name: string;
    mimeType: string;
}

export interface CursorPosition {
    line: number;
    column: number;
}

export interface ScrollPosition {
    line: number;
    percentage: number;
}

export interface Version {
    id: string;
    documentId: string;
    content: string;
    label?: string;
    createdAt: Date;
}

export interface DocumentStats {
    words: number;
    characters: number;
    charactersNoSpaces: number;
    lines: number;
    readingTime: number;
}

export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    color: string | null;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
