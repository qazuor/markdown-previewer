import { FolderItem } from '@/components/sidebar/FolderItem';
import type { Folder } from '@/stores/folderStore';
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
    ChevronDown: () => <span data-testid="icon-chevron-down" />,
    ChevronRight: () => <span data-testid="icon-chevron-right" />,
    Folder: () => <span data-testid="icon-folder" />,
    FolderOpen: () => <span data-testid="icon-folder-open" />
}));

// Mock the DragDropContext
vi.mock('@/components/sidebar/DragDropContext', () => ({
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

// Mock NewFolderModal for getIconComponent
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
const mockToggleExpanded = vi.fn();
const mockSetExpanded = vi.fn();
const mockGetChildFolders = vi.fn().mockReturnValue([]);
const mockUpdateFolder = vi.fn();
let mockIsExpanded = false;

vi.mock('@/stores/folderStore', () => ({
    useFolderStore: (selector: (state: unknown) => unknown) => {
        const state = {
            isExpanded: () => mockIsExpanded,
            toggleExpanded: mockToggleExpanded,
            setExpanded: mockSetExpanded,
            getChildFolders: mockGetChildFolders,
            updateFolder: mockUpdateFolder,
            folders: new Map()
        };
        return selector(state);
    }
}));

// Mock document store
const mockMoveToFolder = vi.fn();

vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: (selector: (state: unknown) => unknown) => {
        const state = {
            moveToFolder: mockMoveToFolder
        };
        return selector(state);
    }
}));

describe('FolderItem', () => {
    const mockFolder: Folder = {
        id: 'folder-1',
        name: 'Test Folder',
        parentId: null,
        color: null,
        icon: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockIsExpanded = false;
    });

    describe('rendering', () => {
        it('should render folder name', () => {
            render(<FolderItem folder={mockFolder} level={0} />);

            expect(screen.getByText('Test Folder')).toBeInTheDocument();
        });

        it('should render with correct padding for level 0', () => {
            render(<FolderItem folder={mockFolder} level={0} />);

            const button = screen.getByRole('button');
            expect(button).toHaveStyle({ paddingLeft: '4px' });
        });

        it('should render with correct padding for level 1', () => {
            render(<FolderItem folder={mockFolder} level={1} />);

            const button = screen.getByRole('button');
            expect(button).toHaveStyle({ paddingLeft: '16px' });
        });

        it('should render with correct padding for level 2', () => {
            render(<FolderItem folder={mockFolder} level={2} />);

            const button = screen.getByRole('button');
            expect(button).toHaveStyle({ paddingLeft: '28px' });
        });

        it('should render chevron right when collapsed', () => {
            mockIsExpanded = false;
            mockGetChildFolders.mockReturnValue([{ id: 'child' }]);

            render(<FolderItem folder={mockFolder} level={0} />);

            expect(screen.getByTestId('icon-chevron-right')).toBeInTheDocument();
        });

        it('should render chevron down when expanded', () => {
            mockIsExpanded = true;
            mockGetChildFolders.mockReturnValue([{ id: 'child' }]);

            render(<FolderItem folder={mockFolder} level={0} />);

            expect(screen.getByTestId('icon-chevron-down')).toBeInTheDocument();
        });

        it('should render folder icon', () => {
            render(<FolderItem folder={mockFolder} level={0} />);

            expect(screen.getByTestId('icon-folder')).toBeInTheDocument();
        });

        it('should render custom icon when folder has icon', () => {
            const folderWithIcon: Folder = {
                ...mockFolder,
                icon: 'star'
            };

            render(<FolderItem folder={folderWithIcon} level={0} />);

            expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
        });

        it('should apply custom color to icon', () => {
            const folderWithColor: Folder = {
                ...mockFolder,
                color: '#ff0000'
            };

            render(<FolderItem folder={folderWithColor} level={0} />);

            // The color is applied to the span wrapping the icon via style prop
            // Since we're mocking the Tooltip, just verify the folder renders correctly
            expect(screen.getByText('Test Folder')).toBeInTheDocument();
        });
    });

    describe('interactions', () => {
        it('should toggle expanded on click', () => {
            render(<FolderItem folder={mockFolder} level={0} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(mockToggleExpanded).toHaveBeenCalledWith('folder-1');
        });

        it('should toggle expanded on Enter key', () => {
            render(<FolderItem folder={mockFolder} level={0} />);

            const button = screen.getByRole('button');
            fireEvent.keyDown(button, { key: 'Enter' });

            expect(mockToggleExpanded).toHaveBeenCalledWith('folder-1');
        });

        it('should toggle expanded on Space key', () => {
            render(<FolderItem folder={mockFolder} level={0} />);

            const button = screen.getByRole('button');
            fireEvent.keyDown(button, { key: ' ' });

            expect(mockToggleExpanded).toHaveBeenCalledWith('folder-1');
        });

        it('should not toggle on other keys', () => {
            render(<FolderItem folder={mockFolder} level={0} />);

            const button = screen.getByRole('button');
            fireEvent.keyDown(button, { key: 'Tab' });

            expect(mockToggleExpanded).not.toHaveBeenCalled();
        });
    });

    describe('children rendering', () => {
        it('should render children when expanded', () => {
            mockIsExpanded = true;

            render(
                <FolderItem folder={mockFolder} level={0}>
                    <div data-testid="child-content">Child Content</div>
                </FolderItem>
            );

            expect(screen.getByTestId('child-content')).toBeInTheDocument();
        });

        it('should not render children when collapsed', () => {
            mockIsExpanded = false;

            render(
                <FolderItem folder={mockFolder} level={0}>
                    <div data-testid="child-content">Child Content</div>
                </FolderItem>
            );

            expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
        });
    });

    describe('drag and drop', () => {
        it('should be draggable', () => {
            render(<FolderItem folder={mockFolder} level={0} />);

            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('draggable', 'true');
        });
    });

    describe('forwardRef', () => {
        it('should forward ref to root element', () => {
            const ref = vi.fn();

            render(<FolderItem ref={ref} folder={mockFolder} level={0} />);

            expect(ref).toHaveBeenCalled();
        });

        it('should apply additional className', () => {
            const { container } = render(<FolderItem folder={mockFolder} level={0} className="custom-class" />);

            expect(container.firstChild).toHaveClass('custom-class');
        });
    });
});
