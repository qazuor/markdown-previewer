import { GoogleDriveExplorer } from '@/components/sidebar/GoogleDriveExplorer';
import type { DriveFileTreeNode } from '@/types/gdrive';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
        i18n: { language: 'en' }
    })
}));

// Mock Google Drive services
const mockCheckConnection = vi.fn();
const mockFetchFileTree = vi.fn();
const mockFetchFileContent = vi.fn();
const mockFilterMarkdownOnly = vi.fn((nodes: DriveFileTreeNode[]) => nodes.filter((n) => n.isMarkdown || n.type === 'folder'));
const mockGetQuota = vi.fn();

vi.mock('@/services/gdrive', () => ({
    checkConnection: () => mockCheckConnection(),
    fetchFileTree: (...args: unknown[]) => mockFetchFileTree(...args),
    fetchFileContent: (...args: unknown[]) => mockFetchFileContent(...args),
    filterMarkdownOnly: (nodes: DriveFileTreeNode[]) => mockFilterMarkdownOnly(nodes),
    getQuota: () => mockGetQuota()
}));

// Mock modals
vi.mock('@/components/modals', () => ({
    CreateGoogleDriveFileModal: ({
        isOpen,
        onClose,
        onSuccess
    }: { isOpen: boolean; onClose: () => void; onSuccess: (fileId: string, name: string) => void }) =>
        isOpen ? (
            <div data-testid="create-file-modal">
                <button type="button" data-testid="close-create-modal" onClick={onClose}>
                    Close
                </button>
                <button type="button" data-testid="create-file-success" onClick={() => onSuccess('file123', 'test.md')}>
                    Create
                </button>
            </div>
        ) : null,
    DeleteGoogleDriveFileModal: ({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) =>
        isOpen ? (
            <div data-testid="delete-file-modal">
                <button type="button" data-testid="close-delete-modal" onClick={onClose}>
                    Close
                </button>
                <button type="button" data-testid="delete-file-success" onClick={onSuccess}>
                    Delete
                </button>
            </div>
        ) : null
}));

// Mock context menus
vi.mock('@/components/sidebar/GoogleDriveContextMenus', () => ({
    GoogleDriveEmptyContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="empty-context-menu">{children}</div>,
    GoogleDriveFileContextMenu: ({
        children,
        onDelete,
        node
    }: { children: React.ReactNode; onDelete: (node: DriveFileTreeNode) => void; node: DriveFileTreeNode }) => (
        <div data-testid="file-context-menu" onClick={() => onDelete(node)} onKeyDown={() => {}}>
            {children}
        </div>
    ),
    GoogleDriveFolderContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="folder-context-menu">{children}</div>
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    ChevronDown: () => <span data-testid="icon-chevron-down" />,
    ChevronRight: () => <span data-testid="icon-chevron-right" />,
    File: () => <span data-testid="icon-file" />,
    FilePlus: () => <span data-testid="icon-file-plus" />,
    FileText: () => <span data-testid="icon-file-text" />,
    Folder: () => <span data-testid="icon-folder" />,
    FolderOpen: () => <span data-testid="icon-folder-open" />,
    HardDrive: () => <span data-testid="icon-hard-drive" />,
    Loader2: () => <span data-testid="icon-loader" />,
    Plus: () => <span data-testid="icon-plus" />,
    RefreshCw: () => <span data-testid="icon-refresh" />,
    Search: () => <span data-testid="icon-search" />,
    Trash2: () => <span data-testid="icon-trash" />
}));

// Store mocks
const mockIsConnected = vi.fn<[], boolean>().mockReturnValue(false);
const mockIsLoading = vi.fn<[], boolean>().mockReturnValue(false);
const mockError = vi.fn<[], string | null>().mockReturnValue(null);
const mockUser = vi.fn<[], { name: string; email: string; picture: string } | null>().mockReturnValue(null);
const mockFileTree = vi.fn<[], DriveFileTreeNode[]>().mockReturnValue([]);
const mockTreeLoading = vi.fn<[], boolean>().mockReturnValue(false);
const mockExpandedPaths = new Set<string>();
const mockQuota = vi.fn<[], { used: number; limit: number } | null>().mockReturnValue(null);
const mockSetConnected = vi.fn();
const mockSetLoading = vi.fn();
const mockSetError = vi.fn();
const mockSetFileTree = vi.fn();
const mockSetTreeLoading = vi.fn();
const mockToggleExpanded = vi.fn();
const mockSetQuota = vi.fn();

vi.mock('@/stores/gdriveStore', () => ({
    useGoogleDriveStore: () => ({
        isConnected: mockIsConnected(),
        isLoading: mockIsLoading(),
        error: mockError(),
        user: mockUser(),
        fileTree: mockFileTree(),
        treeLoading: mockTreeLoading(),
        expandedPaths: mockExpandedPaths,
        quota: mockQuota(),
        setConnected: mockSetConnected,
        setLoading: mockSetLoading,
        setError: mockSetError,
        setFileTree: mockSetFileTree,
        setTreeLoading: mockSetTreeLoading,
        toggleExpanded: mockToggleExpanded,
        setQuota: mockSetQuota
    })
}));

const mockCreateDocument = vi.fn();
const mockFindDocumentByDrive = vi.fn();
const mockOpenDocument = vi.fn();

vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: () => ({
        createDocument: mockCreateDocument,
        findDocumentByDrive: mockFindDocumentByDrive,
        openDocument: mockOpenDocument
    })
}));

// Test data
const mockFileTreeNodes: DriveFileTreeNode[] = [
    {
        id: 'folder1',
        name: 'Documents',
        type: 'folder',
        mimeType: 'application/vnd.google-apps.folder',
        isMarkdown: false,
        children: [
            {
                id: 'file1',
                name: 'notes.md',
                type: 'file',
                mimeType: 'text/markdown',
                isMarkdown: true
            }
        ]
    },
    {
        id: 'file2',
        name: 'README.md',
        type: 'file',
        mimeType: 'text/markdown',
        isMarkdown: true
    }
];

describe('GoogleDriveExplorer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsConnected.mockReturnValue(false);
        mockIsLoading.mockReturnValue(false);
        mockError.mockReturnValue(null);
        mockUser.mockReturnValue(null);
        mockFileTree.mockReturnValue([]);
        mockTreeLoading.mockReturnValue(false);
        mockQuota.mockReturnValue(null);
        mockExpandedPaths.clear();

        mockCheckConnection.mockResolvedValue({ connected: false });
        mockFetchFileTree.mockResolvedValue([]);
        mockFetchFileContent.mockResolvedValue({ content: '# Test' });
        mockGetQuota.mockResolvedValue(null);
        mockFilterMarkdownOnly.mockImplementation((nodes) => nodes);
    });

    describe('loading state', () => {
        it('should show loading spinner when checking connection', () => {
            mockIsLoading.mockReturnValue(true);

            render(<GoogleDriveExplorer />);

            expect(screen.getByText('Connecting to Google Drive...')).toBeInTheDocument();
        });
    });

    describe('not connected state', () => {
        it('should show connect button when not connected', () => {
            mockIsConnected.mockReturnValue(false);

            render(<GoogleDriveExplorer />);

            expect(screen.getByText('Not connected to Google Drive')).toBeInTheDocument();
            expect(screen.getByText('Connect Google Drive')).toBeInTheDocument();
        });

        it('should show error message if connection failed', () => {
            mockIsConnected.mockReturnValue(false);
            mockError.mockReturnValue('Authentication failed');

            render(<GoogleDriveExplorer />);

            expect(screen.getByText('Authentication failed')).toBeInTheDocument();
        });

        it('should have connect link pointing to Google auth', () => {
            mockIsConnected.mockReturnValue(false);

            render(<GoogleDriveExplorer />);

            const connectLink = screen.getByText('Connect Google Drive');
            expect(connectLink).toHaveAttribute('href', '/api/auth/google');
        });

        it('should show HardDrive icon', () => {
            mockIsConnected.mockReturnValue(false);

            render(<GoogleDriveExplorer />);

            expect(screen.getByTestId('icon-hard-drive')).toBeInTheDocument();
        });
    });

    describe('connected state - file browser', () => {
        beforeEach(() => {
            mockIsConnected.mockReturnValue(true);
            mockUser.mockReturnValue({ name: 'Test User', email: 'test@example.com', picture: 'https://example.com/avatar.png' });
            mockFileTree.mockReturnValue(mockFileTreeNodes);
        });

        it('should show user info in header', () => {
            render(<GoogleDriveExplorer />);

            expect(screen.getByText('Test User')).toBeInTheDocument();
            expect(screen.getByAltText('Test User')).toHaveAttribute('src', 'https://example.com/avatar.png');
        });

        it('should show search input', () => {
            render(<GoogleDriveExplorer />);

            expect(screen.getByPlaceholderText('Search files...')).toBeInTheDocument();
        });

        it('should show refresh button', () => {
            render(<GoogleDriveExplorer />);

            expect(screen.getByTitle('Refresh')).toBeInTheDocument();
        });

        it('should show create file button', () => {
            render(<GoogleDriveExplorer />);

            expect(screen.getByTitle('gdrive.createFile.title')).toBeInTheDocument();
        });

        it('should show markdown only checkbox', () => {
            render(<GoogleDriveExplorer />);

            expect(screen.getByText('Markdown only')).toBeInTheDocument();
        });

        it('should toggle markdown filter when checkbox clicked', () => {
            render(<GoogleDriveExplorer />);

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeChecked();

            fireEvent.click(checkbox);
            expect(checkbox).not.toBeChecked();
        });

        it('should show loading when fetching files', () => {
            mockTreeLoading.mockReturnValue(true);
            mockFileTree.mockReturnValue([]);

            render(<GoogleDriveExplorer />);

            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });

        it('should show no files message when empty', () => {
            mockFileTree.mockReturnValue([]);

            render(<GoogleDriveExplorer />);

            expect(screen.getByText('No markdown files found')).toBeInTheDocument();
        });

        it('should show no files found message when search has no results', () => {
            mockFileTree.mockReturnValue(mockFileTreeNodes);

            render(<GoogleDriveExplorer />);

            const searchInput = screen.getByPlaceholderText('Search files...');
            fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

            expect(screen.getByText('No files found')).toBeInTheDocument();
        });

        it('should render file tree nodes', () => {
            render(<GoogleDriveExplorer />);

            expect(screen.getByText('Documents')).toBeInTheDocument();
            expect(screen.getByText('README.md')).toBeInTheDocument();
        });

        it('should show folder icons for directories', () => {
            render(<GoogleDriveExplorer />);

            expect(screen.getByTestId('icon-folder')).toBeInTheDocument();
        });

        it('should show file text icons for markdown files', () => {
            render(<GoogleDriveExplorer />);

            expect(screen.getAllByTestId('icon-file-text').length).toBeGreaterThan(0);
        });

        it('should toggle folder expansion when clicked', () => {
            render(<GoogleDriveExplorer />);

            fireEvent.click(screen.getByText('Documents'));

            expect(mockToggleExpanded).toHaveBeenCalledWith('folder1');
        });

        it('should filter files by search query', () => {
            render(<GoogleDriveExplorer />);

            const searchInput = screen.getByPlaceholderText('Search files...');
            fireEvent.change(searchInput, { target: { value: 'README' } });

            expect(screen.getByText('README.md')).toBeInTheDocument();
        });
    });

    describe('quota display', () => {
        beforeEach(() => {
            mockIsConnected.mockReturnValue(true);
            mockUser.mockReturnValue({ name: 'Test User', email: 'test@example.com', picture: 'https://example.com/avatar.png' });
        });

        it('should show quota when available', () => {
            mockQuota.mockReturnValue({ used: 5 * 1024 * 1024 * 1024, limit: 15 * 1024 * 1024 * 1024 });

            render(<GoogleDriveExplorer />);

            expect(screen.getByText('5.00 GB / 15 GB')).toBeInTheDocument();
            expect(screen.getByText('33%')).toBeInTheDocument();
        });

        it('should not show quota when not available', () => {
            mockQuota.mockReturnValue(null);

            render(<GoogleDriveExplorer />);

            expect(screen.queryByText(/GB \/ /)).not.toBeInTheDocument();
        });
    });

    describe('file selection', () => {
        beforeEach(() => {
            mockIsConnected.mockReturnValue(true);
            mockUser.mockReturnValue({ name: 'Test User', email: 'test@example.com', picture: 'https://example.com/avatar.png' });
            mockFileTree.mockReturnValue(mockFileTreeNodes);
            mockFindDocumentByDrive.mockReturnValue(null);
        });

        it('should load and open file when markdown file clicked', async () => {
            const onFileOpened = vi.fn();
            mockFetchFileContent.mockResolvedValue({ content: '# Test' });

            render(<GoogleDriveExplorer onFileOpened={onFileOpened} />);

            fireEvent.click(screen.getByText('README.md'));

            await waitFor(() => {
                expect(mockFetchFileContent).toHaveBeenCalledWith('file2');
                expect(mockCreateDocument).toHaveBeenCalled();
                expect(onFileOpened).toHaveBeenCalled();
            });
        });

        it('should open existing document if already loaded', async () => {
            const existingDoc = { id: 'doc-1', name: 'README.md' };
            mockFindDocumentByDrive.mockReturnValue(existingDoc);
            const onFileOpened = vi.fn();

            render(<GoogleDriveExplorer onFileOpened={onFileOpened} />);

            fireEvent.click(screen.getByText('README.md'));

            await waitFor(() => {
                expect(mockOpenDocument).toHaveBeenCalledWith('doc-1');
                expect(onFileOpened).toHaveBeenCalled();
            });
        });

        it('should call onFileSelect callback when file is selected', async () => {
            const onFileSelect = vi.fn();
            mockFetchFileContent.mockResolvedValue({ content: '# Test' });

            render(<GoogleDriveExplorer onFileSelect={onFileSelect} />);

            fireEvent.click(screen.getByText('README.md'));

            await waitFor(() => {
                expect(onFileSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'README.md' }));
            });
        });
    });

    describe('file creation', () => {
        beforeEach(() => {
            mockIsConnected.mockReturnValue(true);
            mockUser.mockReturnValue({ name: 'Test User', email: 'test@example.com', picture: 'https://example.com/avatar.png' });
        });

        it('should open create file modal when plus button clicked', () => {
            render(<GoogleDriveExplorer />);

            fireEvent.click(screen.getByTitle('gdrive.createFile.title'));

            expect(screen.getByTestId('create-file-modal')).toBeInTheDocument();
        });

        it('should close create file modal', () => {
            render(<GoogleDriveExplorer />);

            fireEvent.click(screen.getByTitle('gdrive.createFile.title'));
            fireEvent.click(screen.getByTestId('close-create-modal'));

            expect(screen.queryByTestId('create-file-modal')).not.toBeInTheDocument();
        });

        it('should handle file creation success', async () => {
            mockFetchFileTree.mockResolvedValue(mockFileTreeNodes);

            render(<GoogleDriveExplorer />);

            fireEvent.click(screen.getByTitle('gdrive.createFile.title'));
            fireEvent.click(screen.getByTestId('create-file-success'));

            await waitFor(() => {
                expect(mockCreateDocument).toHaveBeenCalled();
            });
        });
    });

    describe('file deletion', () => {
        beforeEach(() => {
            mockIsConnected.mockReturnValue(true);
            mockUser.mockReturnValue({ name: 'Test User', email: 'test@example.com', picture: 'https://example.com/avatar.png' });
            mockFileTree.mockReturnValue(mockFileTreeNodes);
        });

        it('should open delete modal when delete is triggered', () => {
            render(<GoogleDriveExplorer />);

            const fileContextMenus = screen.getAllByTestId('file-context-menu');
            const lastMenu = fileContextMenus[fileContextMenus.length - 1];
            fireEvent.click(lastMenu);

            expect(screen.getByTestId('delete-file-modal')).toBeInTheDocument();
        });

        it('should close delete modal when cancel clicked', () => {
            render(<GoogleDriveExplorer />);

            const fileContextMenus = screen.getAllByTestId('file-context-menu');
            const lastMenu = fileContextMenus[fileContextMenus.length - 1];
            fireEvent.click(lastMenu);

            fireEvent.click(screen.getByTestId('close-delete-modal'));

            expect(screen.queryByTestId('delete-file-modal')).not.toBeInTheDocument();
        });

        it('should refresh file tree after successful deletion', async () => {
            mockFetchFileTree.mockResolvedValue([]);

            render(<GoogleDriveExplorer />);

            const fileContextMenus = screen.getAllByTestId('file-context-menu');
            const lastMenu = fileContextMenus[fileContextMenus.length - 1];
            fireEvent.click(lastMenu);

            fireEvent.click(screen.getByTestId('delete-file-success'));

            await waitFor(() => {
                expect(mockFetchFileTree).toHaveBeenCalled();
                expect(mockSetFileTree).toHaveBeenCalled();
            });
        });
    });

    describe('refresh', () => {
        beforeEach(() => {
            mockIsConnected.mockReturnValue(true);
            mockUser.mockReturnValue({ name: 'Test User', email: 'test@example.com', picture: 'https://example.com/avatar.png' });
        });

        it('should call refresh when refresh button clicked', async () => {
            mockFetchFileTree.mockResolvedValue([]);

            render(<GoogleDriveExplorer />);

            fireEvent.click(screen.getByTitle('Refresh'));

            await waitFor(() => {
                expect(mockFetchFileTree).toHaveBeenCalledWith(true);
            });
        });
    });

    describe('connection check on mount', () => {
        it('should check connection on mount', async () => {
            mockCheckConnection.mockResolvedValue({
                connected: true,
                user: { name: 'Test User', email: 'test@example.com', picture: 'https://example.com/avatar.png' }
            });

            render(<GoogleDriveExplorer />);

            await waitFor(() => {
                expect(mockCheckConnection).toHaveBeenCalled();
            });
        });

        it('should set connected state when connection succeeds', async () => {
            const user = { name: 'Test User', email: 'test@example.com', picture: 'https://example.com/avatar.png' };
            mockCheckConnection.mockResolvedValue({ connected: true, user });

            render(<GoogleDriveExplorer />);

            await waitFor(() => {
                expect(mockSetConnected).toHaveBeenCalledWith(true, user);
            });
        });

        it('should fetch quota when connected', async () => {
            mockCheckConnection.mockResolvedValue({
                connected: true,
                user: { name: 'Test User', email: 'test@example.com', picture: 'https://example.com/avatar.png' }
            });
            mockGetQuota.mockResolvedValue({ used: 1000, limit: 10000 });

            render(<GoogleDriveExplorer />);

            await waitFor(() => {
                expect(mockGetQuota).toHaveBeenCalled();
                expect(mockSetQuota).toHaveBeenCalled();
            });
        });

        it('should handle connection error', async () => {
            mockCheckConnection.mockRejectedValue(new Error('Network error'));

            render(<GoogleDriveExplorer />);

            await waitFor(() => {
                expect(mockSetConnected).toHaveBeenCalledWith(false);
                expect(mockSetError).toHaveBeenCalledWith('Network error');
            });
        });
    });
});
