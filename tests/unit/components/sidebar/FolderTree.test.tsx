import { FolderTree } from '@/components/sidebar/FolderTree';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    AlertCircle: () => <span data-testid="icon-alert" />,
    ChevronDown: () => <span data-testid="icon-chevron-down" />,
    ChevronRight: () => <span data-testid="icon-chevron-right" />,
    File: () => <span data-testid="icon-file" />,
    Folder: () => <span data-testid="icon-folder" />,
    FolderOpen: () => <span data-testid="icon-folder-open" />,
    GitBranch: () => <span data-testid="icon-git-branch" />,
    HardDrive: () => <span data-testid="icon-hard-drive" />,
    Loader2: () => <span data-testid="icon-loader" />,
    X: () => <span data-testid="icon-x" />
}));

// Mock DragDropContext
vi.mock('@/components/sidebar/DragDropContext', () => ({
    DragDropProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="drag-drop-provider">{children}</div>,
    useDraggable: () => ({
        draggable: true,
        onDragStart: vi.fn(),
        onDragEnd: vi.fn()
    }),
    useDroppable: () => ({
        isOver: false,
        onDragOver: vi.fn(),
        onDragLeave: vi.fn(),
        onDrop: vi.fn()
    })
}));

// Mock FolderItem
vi.mock('@/components/sidebar/FolderItem', () => ({
    FolderItem: ({ folder, children }: { folder: { id: string; name: string }; children?: React.ReactNode }) => (
        <div data-testid={`folder-item-${folder.id}`}>
            <span>{folder.name}</span>
            {children}
        </div>
    )
}));

// Mock FolderContextMenu
vi.mock('@/components/sidebar/FolderContextMenu', () => ({
    FolderContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="folder-context-menu">{children}</div>
}));

// Mock FileContextMenu
vi.mock('@/components/sidebar/FileContextMenu', () => ({
    FileContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="file-context-menu">{children}</div>
}));

// Mock EditableTabName
vi.mock('@/components/tabs/EditableTabName', () => ({
    EditableTabName: ({ name }: { name: string }) => <span data-testid="editable-tab-name">{name}</span>
}));

// Mock NewFolderModal
vi.mock('@/components/sidebar/NewFolderModal', () => ({
    getIconComponent: () => () => <span data-testid="custom-icon" />
}));

// Mock Tooltip
vi.mock('@/components/ui', () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

// Mock folder store
const mockFolders = new Map();
const mockGetRootFolders = vi.fn().mockReturnValue([]);
const mockGetChildFolders = vi.fn().mockReturnValue([]);
const mockIsExpanded = vi.fn().mockReturnValue(false);

vi.mock('@/stores/folderStore', () => ({
    useFolderStore: (selector: (state: unknown) => unknown) => {
        const state = {
            folders: mockFolders,
            getRootFolders: mockGetRootFolders,
            getChildFolders: mockGetChildFolders,
            isExpanded: mockIsExpanded,
            toggleExpanded: vi.fn(),
            setExpanded: vi.fn(),
            updateFolder: vi.fn()
        };
        return selector(state);
    }
}));

// Mock document store
const mockDocuments = new Map();
const mockGetDocumentsByFolder = vi.fn().mockReturnValue([]);

vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: (selector: (state: unknown) => unknown) => {
        const state = {
            documents: mockDocuments,
            activeDocumentId: null,
            openDocument: vi.fn(),
            closeDocument: vi.fn(),
            getDocumentsByFolder: mockGetDocumentsByFolder,
            moveToFolder: vi.fn()
        };
        return selector(state);
    }
}));

describe('FolderTree', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFolders.clear();
        mockDocuments.clear();
        mockGetRootFolders.mockReturnValue([]);
        mockGetDocumentsByFolder.mockReturnValue([]);
    });

    describe('rendering', () => {
        it('should render with DragDropProvider', () => {
            render(<FolderTree />);

            expect(screen.getByTestId('drag-drop-provider')).toBeInTheDocument();
        });

        it('should render empty state when no files', () => {
            render(<FolderTree />);

            expect(screen.getByText('sidebar.noFiles')).toBeInTheDocument();
        });

        it('should render folders', () => {
            const folder = {
                id: 'folder-1',
                name: 'Test Folder',
                parentId: null,
                color: null,
                icon: null,
                sortOrder: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockFolders.set('folder-1', folder);
            mockGetRootFolders.mockReturnValue([folder]);

            render(<FolderTree />);

            expect(screen.getByTestId('folder-item-folder-1')).toBeInTheDocument();
            expect(screen.getByText('Test Folder')).toBeInTheDocument();
        });

        it('should render documents', () => {
            const doc = {
                id: 'doc-1',
                name: 'Test Document.md',
                content: '',
                folderId: null,
                source: 'local' as const,
                syncStatus: 'synced' as const,
                isManuallyNamed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockDocuments.set('doc-1', doc);
            mockGetDocumentsByFolder.mockReturnValue([doc]);

            render(<FolderTree />);

            expect(screen.getByText('Test Document.md')).toBeInTheDocument();
        });
    });

    describe('filtering', () => {
        it('should filter documents by name', () => {
            const doc1 = {
                id: 'doc-1',
                name: 'README.md',
                content: '',
                folderId: null,
                source: 'local' as const,
                syncStatus: 'synced' as const,
                isManuallyNamed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const doc2 = {
                id: 'doc-2',
                name: 'Notes.md',
                content: '',
                folderId: null,
                source: 'local' as const,
                syncStatus: 'synced' as const,
                isManuallyNamed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockDocuments.set('doc-1', doc1);
            mockDocuments.set('doc-2', doc2);
            mockGetDocumentsByFolder.mockImplementation((folderId) => {
                if (folderId === null) {
                    return [doc1, doc2];
                }
                return [];
            });

            render(<FolderTree filter="README" />);

            expect(screen.getByText('README.md')).toBeInTheDocument();
            expect(screen.queryByText('Notes.md')).not.toBeInTheDocument();
        });

        it('should show no matching files message when filter has no results', () => {
            mockDocuments.set('doc-1', {
                id: 'doc-1',
                name: 'README.md',
                content: '',
                folderId: null,
                source: 'local' as const,
                syncStatus: 'synced' as const,
                isManuallyNamed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            mockGetDocumentsByFolder.mockReturnValue([]);

            render(<FolderTree filter="nonexistent" />);

            expect(screen.getByText('fileExplorer.noMatchingFiles')).toBeInTheDocument();
        });

        it('should filter case-insensitively', () => {
            const doc = {
                id: 'doc-1',
                name: 'README.md',
                content: '',
                folderId: null,
                source: 'local' as const,
                syncStatus: 'synced' as const,
                isManuallyNamed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockDocuments.set('doc-1', doc);
            mockGetDocumentsByFolder.mockReturnValue([doc]);

            render(<FolderTree filter="readme" />);

            expect(screen.getByText('README.md')).toBeInTheDocument();
        });
    });

    describe('document source icons', () => {
        it('should show local icon for local documents', () => {
            const doc = {
                id: 'doc-1',
                name: 'Local.md',
                content: '',
                folderId: null,
                source: 'local' as const,
                syncStatus: 'synced' as const,
                isManuallyNamed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockDocuments.set('doc-1', doc);
            mockGetDocumentsByFolder.mockReturnValue([doc]);

            render(<FolderTree />);

            expect(screen.getByTestId('icon-file')).toBeInTheDocument();
        });

        it('should show github icon for github documents', () => {
            const doc = {
                id: 'doc-1',
                name: 'GitHub.md',
                content: '',
                folderId: null,
                source: 'github' as const,
                syncStatus: 'synced' as const,
                isManuallyNamed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockDocuments.set('doc-1', doc);
            mockGetDocumentsByFolder.mockReturnValue([doc]);

            render(<FolderTree />);

            expect(screen.getByTestId('icon-git-branch')).toBeInTheDocument();
        });

        it('should show gdrive icon for gdrive documents', () => {
            const doc = {
                id: 'doc-1',
                name: 'GDrive.md',
                content: '',
                folderId: null,
                source: 'gdrive' as const,
                syncStatus: 'synced' as const,
                isManuallyNamed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockDocuments.set('doc-1', doc);
            mockGetDocumentsByFolder.mockReturnValue([doc]);

            render(<FolderTree />);

            expect(screen.getByTestId('icon-hard-drive')).toBeInTheDocument();
        });
    });

    describe('document sync status', () => {
        it('should show loader for syncing documents', () => {
            const doc = {
                id: 'doc-1',
                name: 'Syncing.md',
                content: '',
                folderId: null,
                source: 'local' as const,
                syncStatus: 'syncing' as const,
                isManuallyNamed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockDocuments.set('doc-1', doc);
            mockGetDocumentsByFolder.mockReturnValue([doc]);

            render(<FolderTree />);

            expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
        });

        it('should show alert for error documents', () => {
            const doc = {
                id: 'doc-1',
                name: 'Error.md',
                content: '',
                folderId: null,
                source: 'local' as const,
                syncStatus: 'error' as const,
                isManuallyNamed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockDocuments.set('doc-1', doc);
            mockGetDocumentsByFolder.mockReturnValue([doc]);

            render(<FolderTree />);

            expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
        });
    });

    describe('nested folders', () => {
        it('should render nested folder structure', () => {
            const parentFolder = {
                id: 'parent',
                name: 'Parent',
                parentId: null,
                color: null,
                icon: null,
                sortOrder: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const childFolder = {
                id: 'child',
                name: 'Child',
                parentId: 'parent',
                color: null,
                icon: null,
                sortOrder: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockFolders.set('parent', parentFolder);
            mockFolders.set('child', childFolder);
            mockGetRootFolders.mockReturnValue([parentFolder]);
            mockGetChildFolders.mockImplementation((parentId: string) => {
                if (parentId === 'parent') return [childFolder];
                return [];
            });

            render(<FolderTree />);

            expect(screen.getByText('Parent')).toBeInTheDocument();
            expect(screen.getByText('Child')).toBeInTheDocument();
        });
    });
});
