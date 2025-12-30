export interface Document {
    id: string;
    name: string;
    content: string;
    isModified: boolean;
    isManuallyNamed: boolean;
    source: 'local' | 'github' | 'cloud';
    githubInfo?: GitHubFileInfo;
    cursor: CursorPosition;
    scroll: ScrollPosition;
    createdAt: Date;
    updatedAt: Date;
    // Cloud sync fields
    folderId?: string | null;
    syncVersion?: number;
    syncedAt?: Date | null;
}

export interface GitHubFileInfo {
    owner: string;
    repo: string;
    path: string;
    sha: string;
    branch: string;
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
