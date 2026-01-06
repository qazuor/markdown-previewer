import { FileExplorer } from '@/components/sidebar/FileExplorer';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    FolderOpen: () => <span data-testid="icon-folder" />,
    FolderPlus: () => <span data-testid="icon-folder-plus" />,
    Plus: () => <span data-testid="icon-plus" />,
    Search: () => <span data-testid="icon-search" />
}));

// Mock document store
const mockCreateDocument = vi.fn(() => 'new-doc-id');

vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: (selector: (state: unknown) => unknown) => {
        const state = { createDocument: mockCreateDocument };
        return selector(state);
    }
}));

// Mock UI store
const mockSetPendingRenameDocumentId = vi.fn();
const mockOpenNewFolderModal = vi.fn();

vi.mock('@/stores/uiStore', () => ({
    useUIStore: (selector: (state: unknown) => unknown) => {
        const state = {
            setPendingRenameDocumentId: mockSetPendingRenameDocumentId,
            openNewFolderModal: mockOpenNewFolderModal
        };
        return selector(state);
    }
}));

// Mock folder store
const mockCreateFolder = vi.fn();

vi.mock('@/stores/folderStore', () => ({
    useFolderStore: (selector: (state: unknown) => unknown) => {
        const state = { createFolder: mockCreateFolder };
        return selector(state);
    }
}));

// Mock hooks
const mockOpenFileDialog = vi.fn();

vi.mock('@/hooks', () => ({
    useFileImport: () => ({
        openFileDialog: mockOpenFileDialog
    })
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
    IconButton: ({ onClick, label, icon }: { onClick?: () => void; label: string; icon: React.ReactNode }) => (
        <button type="button" onClick={onClick} aria-label={label}>
            {icon}
        </button>
    ),
    Tooltip: ({ children, content }: { children: React.ReactNode; content: string }) => <div title={content}>{children}</div>
}));

// Mock FolderTree
vi.mock('@/components/sidebar/FolderTree', () => ({
    FolderTree: ({ filter }: { filter?: string }) => (
        <div data-testid="folder-tree" data-filter={filter || ''}>
            <div data-testid="doc-item">Document 1.md</div>
        </div>
    )
}));

// Mock NewFolderModal
vi.mock('@/components/sidebar/NewFolderModal', () => ({
    NewFolderModal: () => <div data-testid="new-folder-modal" />
}));

// Mock LocalFilesContextMenu
vi.mock('@/components/sidebar/LocalFilesContextMenu', () => ({
    LocalFilesContextMenu: ({
        children,
        onNewDocument,
        onImport
    }: {
        children: React.ReactNode;
        onNewDocument: () => void;
        onImport: () => void;
    }) => (
        <div data-testid="local-files-context-menu">
            <button type="button" data-testid="context-new" onClick={onNewDocument}>
                New
            </button>
            <button type="button" data-testid="context-import" onClick={onImport}>
                Import
            </button>
            {children}
        </div>
    )
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('FileExplorer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render explorer header', () => {
            render(<FileExplorer />);

            expect(screen.getByText('sidebar.explorer')).toBeInTheDocument();
        });

        it('should render new file button', () => {
            render(<FileExplorer />);

            expect(screen.getByLabelText('common.new')).toBeInTheDocument();
        });

        it('should render new folder button', () => {
            render(<FileExplorer />);

            expect(screen.getByLabelText('fileExplorer.folder.new')).toBeInTheDocument();
        });

        it('should render search filter input', () => {
            render(<FileExplorer />);

            expect(screen.getByPlaceholderText('fileExplorer.filterPlaceholder')).toBeInTheDocument();
        });

        it('should render documents section header', () => {
            render(<FileExplorer />);

            expect(screen.getByText('fileExplorer.documents')).toBeInTheDocument();
        });

        it('should render FolderTree component', () => {
            render(<FileExplorer />);

            expect(screen.getByTestId('folder-tree')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            const { container } = render(<FileExplorer className="custom-class" />);

            expect(container.firstChild).toHaveClass('custom-class');
        });
    });

    describe('file filtering', () => {
        it('should pass filter to FolderTree', () => {
            render(<FileExplorer />);

            const filterInput = screen.getByPlaceholderText('fileExplorer.filterPlaceholder');
            fireEvent.change(filterInput, { target: { value: 'test' } });

            const folderTree = screen.getByTestId('folder-tree');
            expect(folderTree).toHaveAttribute('data-filter', 'test');
        });

        it('should pass empty filter when cleared', () => {
            render(<FileExplorer />);

            const filterInput = screen.getByPlaceholderText('fileExplorer.filterPlaceholder');
            fireEvent.change(filterInput, { target: { value: 'test' } });
            fireEvent.change(filterInput, { target: { value: '' } });

            const folderTree = screen.getByTestId('folder-tree');
            expect(folderTree).toHaveAttribute('data-filter', '');
        });
    });

    describe('document interactions', () => {
        it('should create new document when new button is clicked', () => {
            render(<FileExplorer />);

            fireEvent.click(screen.getByLabelText('common.new'));

            expect(mockCreateDocument).toHaveBeenCalled();
            expect(mockSetPendingRenameDocumentId).toHaveBeenCalledWith('new-doc-id');
        });
    });

    describe('context menu', () => {
        it('should render LocalFilesContextMenu', () => {
            render(<FileExplorer />);

            expect(screen.getByTestId('local-files-context-menu')).toBeInTheDocument();
        });

        it('should call createDocument from context menu new action', () => {
            render(<FileExplorer />);

            fireEvent.click(screen.getByTestId('context-new'));

            expect(mockCreateDocument).toHaveBeenCalled();
        });

        it('should call openFileDialog from context menu import action', () => {
            render(<FileExplorer />);

            fireEvent.click(screen.getByTestId('context-import'));

            expect(mockOpenFileDialog).toHaveBeenCalled();
        });
    });
});
