export type SidebarSection = 'explorer' | 'github' | 'gdrive';

export type DocumentPanelType = 'toc' | 'search' | null;

export type ModalType = 'settings' | 'shortcuts' | 'onboarding' | 'versions' | 'export' | 'about' | null;

export type SaveStatus = 'saved' | 'saving' | 'modified' | 'error';

export type ViewMode = 'split' | 'editor' | 'preview';

export interface SearchResult {
    line: number;
    column: number;
    match: string;
    context: string;
}

export interface UIState {
    // Layout
    sidebarOpen: boolean;
    sidebarSection: SidebarSection;
    sidebarWidth: number;
    viewMode: ViewMode;
    zenMode: boolean;

    // Document panel (TOC/Search floating over preview)
    activeDocumentPanel: DocumentPanelType;

    // Modals
    activeModal: ModalType;

    // Search
    searchQuery: string;
    searchResults: SearchResult[];
    replaceQuery: string;
    searchCaseSensitive: boolean;
    searchRegex: boolean;

    // Status
    saveStatus: SaveStatus;
    lastSavedAt: Date | null;

    // Document renaming
    pendingRenameDocumentId: string | null;
}
