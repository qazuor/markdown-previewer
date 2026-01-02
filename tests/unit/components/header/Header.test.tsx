import { Header } from '@/components/header/Header';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock assets
vi.mock('@/assets/welcome-es.md?raw', () => ({ default: '# Bienvenido' }));
vi.mock('@/assets/welcome.md?raw', () => ({ default: '# Welcome' }));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' }
    })
}));

// Mock hooks
const mockIsMobile = vi.fn(() => false);
vi.mock('@/hooks', () => ({
    useMobile: () => ({ isMobile: mockIsMobile() }),
    useTheme: () => ({ isDark: false, theme: 'light', resolvedTheme: 'light' })
}));

// Mock UserMenu component
vi.mock('@/components/auth', () => ({
    UserMenu: () => <div data-testid="user-menu">UserMenu</div>
}));

// Mock markdown service
vi.mock('@/services/markdown', () => ({
    renderMarkdown: vi.fn().mockResolvedValue('<p>rendered</p>')
}));

// Mock document store
const mockCreateDocument = vi.fn().mockReturnValue('new-doc-id');
vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: (selector: (state: unknown) => unknown) => {
        const state = {
            createDocument: mockCreateDocument,
            activeDocumentId: 'doc-1',
            documents: new Map([['doc-1', { id: 'doc-1', name: 'test.md', content: '# Test' }]])
        };
        return selector(state);
    }
}));

// Mock UI store
const mockOpenModal = vi.fn();
const mockSetViewMode = vi.fn();
const mockToggleSidebar = vi.fn();
const mockSetPendingRenameDocumentId = vi.fn();
vi.mock('@/stores/uiStore', () => ({
    useUIStore: (selector: (state: unknown) => unknown) => {
        const state = {
            openModal: mockOpenModal,
            setViewMode: mockSetViewMode,
            toggleSidebar: mockToggleSidebar,
            setPendingRenameDocumentId: mockSetPendingRenameDocumentId
        };
        return selector(state);
    }
}));

// Mock settings store
const mockZoomIn = vi.fn();
const mockZoomOut = vi.fn();
const mockResetZoom = vi.fn();
vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: (selector: (state: unknown) => unknown) => {
        const state = {
            theme: 'light',
            zoomIn: mockZoomIn,
            zoomOut: mockZoomOut,
            resetZoom: mockResetZoom,
            getZoomPercentage: () => 100
        };
        return selector(state);
    }
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    BookOpen: () => <span data-testid="icon-book-open" />,
    ChevronDown: () => <span data-testid="icon-chevron-down" />,
    Columns2: () => <span data-testid="icon-columns2" />,
    Download: () => <span data-testid="icon-download" />,
    ExternalLink: () => <span data-testid="icon-external-link" />,
    FileCode: () => <span data-testid="icon-file-code" />,
    FilePlus: () => <span data-testid="icon-file-plus" />,
    FileText: () => <span data-testid="icon-file-text" />,
    FileType: () => <span data-testid="icon-file-type" />,
    FolderOpen: () => <span data-testid="icon-folder-open" />,
    Image: () => <span data-testid="icon-image" />,
    Info: () => <span data-testid="icon-info" />,
    Keyboard: () => <span data-testid="icon-keyboard" />,
    Menu: () => <span data-testid="icon-menu" />,
    Minus: () => <span data-testid="icon-minus" />,
    PanelLeft: () => <span data-testid="icon-panel-left" />,
    PanelRight: () => <span data-testid="icon-panel-right" />,
    Plus: () => <span data-testid="icon-plus" />,
    RotateCcw: () => <span data-testid="icon-rotate-ccw" />,
    Settings: () => <span data-testid="icon-settings" />
}));

describe('Header', () => {
    const mockOnImport = vi.fn();
    const mockOnStartTour = vi.fn();

    const defaultProps = {
        onImport: mockOnImport,
        onStartTour: mockOnStartTour
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockIsMobile.mockReturnValue(false);
    });

    describe('rendering', () => {
        it('should render header element', () => {
            render(<Header {...defaultProps} />);

            expect(screen.getByRole('banner')).toBeInTheDocument();
        });

        it('should show app name', () => {
            render(<Header {...defaultProps} />);

            expect(screen.getByText('app.name')).toBeInTheDocument();
        });

        it('should show app version', () => {
            render(<Header {...defaultProps} />);

            expect(screen.getByText('app.version')).toBeInTheDocument();
        });

        it('should show user menu', () => {
            render(<Header {...defaultProps} />);

            expect(screen.getByTestId('user-menu')).toBeInTheDocument();
        });

        it('should show menu bar', () => {
            render(<Header {...defaultProps} />);

            expect(screen.getByRole('menubar')).toBeInTheDocument();
        });

        it('should show File menu', () => {
            render(<Header {...defaultProps} />);

            expect(screen.getByText('menu.file')).toBeInTheDocument();
        });

        it('should show View menu', () => {
            render(<Header {...defaultProps} />);

            expect(screen.getByText('menu.view')).toBeInTheDocument();
        });

        it('should show Help menu', () => {
            render(<Header {...defaultProps} />);

            expect(screen.getByText('menu.help')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            render(<Header {...defaultProps} className="custom-class" />);

            const header = screen.getByRole('banner');
            expect(header).toHaveClass('custom-class');
        });
    });

    describe('file menu', () => {
        it('should open file menu when clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.file'));

            expect(screen.getByText('common.new')).toBeInTheDocument();
            expect(screen.getByText('common.import')).toBeInTheDocument();
            expect(screen.getByText('common.export')).toBeInTheDocument();
        });

        it('should show settings option', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.file'));

            expect(screen.getByText('common.settings')).toBeInTheDocument();
        });

        it('should show shortcuts option', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.file'));

            expect(screen.getByText('shortcuts.title')).toBeInTheDocument();
        });

        it('should create new document when New is clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.file'));
            fireEvent.click(screen.getByText('common.new'));

            expect(mockCreateDocument).toHaveBeenCalled();
            expect(mockSetPendingRenameDocumentId).toHaveBeenCalledWith('new-doc-id');
        });

        it('should call onImport when Import is clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.file'));
            fireEvent.click(screen.getByText('common.import'));

            expect(mockOnImport).toHaveBeenCalled();
        });

        it('should open settings modal when Settings is clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.file'));
            fireEvent.click(screen.getByText('common.settings'));

            expect(mockOpenModal).toHaveBeenCalledWith('settings');
        });

        it('should open shortcuts modal when Shortcuts is clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.file'));
            fireEvent.click(screen.getByText('shortcuts.title'));

            expect(mockOpenModal).toHaveBeenCalledWith('shortcuts');
        });

        it('should show keyboard shortcuts in menu', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.file'));

            expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
            expect(screen.getByText('Ctrl+,')).toBeInTheDocument();
            expect(screen.getByText('Ctrl+/')).toBeInTheDocument();
        });
    });

    describe('view menu', () => {
        it('should open view menu when clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.view'));

            expect(screen.getByText('layout.showEditor')).toBeInTheDocument();
            expect(screen.getByText('layout.splitView')).toBeInTheDocument();
            expect(screen.getByText('layout.showPreview')).toBeInTheDocument();
        });

        it('should show zoom options', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.view'));

            expect(screen.getByText(/zoom\.zoomIn.*100%/)).toBeInTheDocument();
            expect(screen.getByText('zoom.zoomOut')).toBeInTheDocument();
            expect(screen.getByText('zoom.resetZoom')).toBeInTheDocument();
        });

        it('should set view mode to editor when clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.view'));
            fireEvent.click(screen.getByText('layout.showEditor'));

            expect(mockSetViewMode).toHaveBeenCalledWith('editor');
        });

        it('should set view mode to split when clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.view'));
            fireEvent.click(screen.getByText('layout.splitView'));

            expect(mockSetViewMode).toHaveBeenCalledWith('split');
        });

        it('should set view mode to preview when clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.view'));
            fireEvent.click(screen.getByText('layout.showPreview'));

            expect(mockSetViewMode).toHaveBeenCalledWith('preview');
        });

        it('should call zoomIn when Zoom In is clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.view'));
            fireEvent.click(screen.getByText(/zoom\.zoomIn/));

            expect(mockZoomIn).toHaveBeenCalled();
        });

        it('should call zoomOut when Zoom Out is clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.view'));
            fireEvent.click(screen.getByText('zoom.zoomOut'));

            expect(mockZoomOut).toHaveBeenCalled();
        });

        it('should call resetZoom when Reset Zoom is clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.view'));
            fireEvent.click(screen.getByText('zoom.resetZoom'));

            expect(mockResetZoom).toHaveBeenCalled();
        });

        it('should show open in new window option', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.view'));

            expect(screen.getByText('preview.openInNewWindow')).toBeInTheDocument();
        });
    });

    describe('help menu', () => {
        it('should open help menu when clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.help'));

            expect(screen.getByText('help.shortcuts')).toBeInTheDocument();
            expect(screen.getByText('help.restartTour')).toBeInTheDocument();
            expect(screen.getByText('help.welcome')).toBeInTheDocument();
            expect(screen.getByText('help.documentation')).toBeInTheDocument();
            expect(screen.getByText('help.about')).toBeInTheDocument();
        });

        it('should call onStartTour when Restart Tour is clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.help'));
            fireEvent.click(screen.getByText('help.restartTour'));

            expect(mockOnStartTour).toHaveBeenCalled();
        });

        it('should create welcome document when Welcome is clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.help'));
            fireEvent.click(screen.getByText('help.welcome'));

            expect(mockCreateDocument).toHaveBeenCalledWith({
                name: 'Welcome to MarkView',
                content: '# Welcome'
            });
        });

        it('should open about modal when About is clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.help'));
            fireEvent.click(screen.getByText('help.about'));

            expect(mockOpenModal).toHaveBeenCalledWith('about');
        });
    });

    describe('menu closing', () => {
        it('should close menu when clicking same menu button', () => {
            render(<Header {...defaultProps} />);

            // Open menu
            fireEvent.click(screen.getByText('menu.file'));
            expect(screen.getByText('common.new')).toBeInTheDocument();

            // Close menu
            fireEvent.click(screen.getByText('menu.file'));
            expect(screen.queryByText('common.new')).not.toBeInTheDocument();
        });

        it('should close menu when clicking backdrop', () => {
            render(<Header {...defaultProps} />);

            // Open menu
            fireEvent.click(screen.getByText('menu.file'));

            // Get backdrop (fixed inset-0 div) and click it
            const backdrop = document.querySelector('.fixed.inset-0');
            if (backdrop) {
                fireEvent.click(backdrop);
            }

            expect(screen.queryByText('common.new')).not.toBeInTheDocument();
        });
    });

    describe('mobile view', () => {
        beforeEach(() => {
            mockIsMobile.mockReturnValue(true);
        });

        it('should show hamburger menu on mobile', () => {
            render(<Header {...defaultProps} />);

            expect(screen.getByLabelText('common.menu')).toBeInTheDocument();
        });

        it('should toggle sidebar when hamburger menu is clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByLabelText('common.menu'));

            expect(mockToggleSidebar).toHaveBeenCalled();
        });

        it('should show settings button on mobile', () => {
            render(<Header {...defaultProps} />);

            expect(screen.getByLabelText('common.settings')).toBeInTheDocument();
        });

        it('should open settings when mobile settings button is clicked', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByLabelText('common.settings'));

            expect(mockOpenModal).toHaveBeenCalledWith('settings');
        });
    });

    describe('logo', () => {
        it('should show logo with Q', () => {
            render(<Header {...defaultProps} />);

            expect(screen.getByText('Q')).toBeInTheDocument();
        });
    });

    describe('export submenu', () => {
        it('should show export options in submenu', () => {
            render(<Header {...defaultProps} />);

            fireEvent.click(screen.getByText('menu.file'));

            // Find export submenu trigger
            const exportTrigger = screen.getByText('common.export');
            expect(exportTrigger).toBeInTheDocument();
        });
    });

    describe('accessibility', () => {
        it('should have menubar role for navigation', () => {
            render(<Header {...defaultProps} />);

            expect(screen.getByRole('menubar')).toBeInTheDocument();
        });

        it('should have aria-haspopup on menu triggers', () => {
            render(<Header {...defaultProps} />);

            const fileButton = screen.getByText('menu.file');
            expect(fileButton).toHaveAttribute('aria-haspopup', 'menu');
        });

        it('should have aria-expanded when menu is open', () => {
            render(<Header {...defaultProps} />);

            const fileButton = screen.getByText('menu.file');
            expect(fileButton).toHaveAttribute('aria-expanded', 'false');

            fireEvent.click(fileButton);
            expect(fileButton).toHaveAttribute('aria-expanded', 'true');
        });
    });
});
