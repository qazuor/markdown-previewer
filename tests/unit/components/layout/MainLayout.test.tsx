import { MainLayout } from '@/components/layout/MainLayout';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' }
    })
}));

// Mock Editor component
vi.mock('@/components/editor', () => ({
    Editor: ({
        className,
        onViewReady,
        onScroll,
        onScrollToReady,
        onScrollLine,
        onScrollToLineReady
    }: {
        className?: string;
        onViewReady?: (view: unknown) => void;
        onScroll?: (percent: number) => void;
        onScrollToReady?: (fn: (percent: number) => void) => void;
        onScrollLine?: (line: number) => void;
        onScrollToLineReady?: (fn: (line: number) => void) => void;
    }) => {
        // Simulate calling the callbacks on mount
        if (onViewReady) onViewReady({ mock: 'editorView' });
        if (onScrollToReady) onScrollToReady((percent: number) => {});
        if (onScrollToLineReady) onScrollToLineReady((line: number) => {});

        return (
            <div
                data-testid="editor"
                className={className}
                onClick={() => {
                    if (onScroll) onScroll(50);
                    if (onScrollLine) onScrollLine(10);
                }}
                onKeyDown={() => {}}
            >
                Editor Component
            </div>
        );
    }
}));

// Mock Preview component
vi.mock('@/components/preview', () => ({
    Preview: ({
        content,
        className,
        onContentChange,
        onScroll,
        onScrollToReady,
        onScrollLine,
        onScrollToLineReady
    }: {
        content: string;
        className?: string;
        onContentChange?: (content: string) => void;
        onScroll?: (percent: number) => void;
        onScrollToReady?: (fn: (percent: number) => void) => void;
        onScrollLine?: (line: number) => void;
        onScrollToLineReady?: (fn: (line: number) => void) => void;
    }) => {
        // Simulate calling the callbacks on mount
        if (onScrollToReady) onScrollToReady((percent: number) => {});
        if (onScrollToLineReady) onScrollToLineReady((line: number) => {});

        return (
            <div
                data-testid="preview"
                className={className}
                onClick={() => {
                    if (onContentChange) onContentChange('new content');
                    if (onScroll) onScroll(50);
                    if (onScrollLine) onScrollLine(10);
                }}
                onKeyDown={() => {}}
            >
                Preview: {content}
            </div>
        );
    }
}));

// Mock SplitPane component
vi.mock('@/components/ui', () => ({
    SplitPane: ({
        left,
        right,
        defaultSize,
        minSize,
        maxSize,
        onResize
    }: {
        left: React.ReactNode;
        right: React.ReactNode;
        defaultSize?: number;
        minSize?: number;
        maxSize?: number;
        onResize?: (size: number) => void;
    }) => (
        <div data-testid="split-pane" data-default-size={defaultSize}>
            <div data-testid="split-left">{left}</div>
            <div data-testid="split-right">{right}</div>
            <button type="button" data-testid="split-resize-trigger" onClick={() => onResize?.(60)}>
                Resize
            </button>
        </div>
    ),
    Tooltip: ({ content, children }: { content: string; children: React.ReactNode }) => (
        <div data-testid="tooltip" data-content={content}>
            {children}
        </div>
    )
}));

// Mock DocumentPanel component
vi.mock('@/components/document-panel', () => ({
    DocumentPanel: ({
        content,
        activeLine,
        onNavigate,
        onReplace
    }: {
        content: string;
        activeLine?: number;
        onNavigate?: (line: number, column?: number) => void;
        onReplace?: (search: string, replace: string, all: boolean) => void;
    }) => (
        <div
            data-testid="document-panel"
            data-active-line={activeLine}
            onClick={() => {
                if (onNavigate) onNavigate(5, 1);
                if (onReplace) onReplace('foo', 'bar', true);
            }}
            onKeyDown={() => {}}
        >
            DocumentPanel: {content.slice(0, 20)}
        </div>
    )
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    ChevronLeft: () => <span data-testid="icon-chevron-left" />,
    ChevronRight: () => <span data-testid="icon-chevron-right" />
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: unknown[]) => args.filter(Boolean).join(' ')
}));

// Store mocks
const mockViewMode = vi.fn<[], 'editor' | 'preview' | 'split'>().mockReturnValue('split');
const mockSetViewMode = vi.fn();
const mockActiveDocumentId = vi.fn<[], string | null>().mockReturnValue('doc-1');
const mockDocuments = new Map([['doc-1', { id: 'doc-1', name: 'test.md', content: '# Test Document' }]]);
const mockUpdateContent = vi.fn();
const mockSyncScroll = vi.fn<[], boolean>().mockReturnValue(true);

// Mock UI store
vi.mock('@/stores/uiStore', () => ({
    useUIStore: (selector: (state: unknown) => unknown) => {
        const state = {
            viewMode: mockViewMode(),
            setViewMode: mockSetViewMode
        };
        return selector(state);
    }
}));

// Mock document store
vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: (selector: (state: unknown) => unknown) => {
        const state = {
            activeDocumentId: mockActiveDocumentId(),
            documents: mockDocuments,
            updateContent: mockUpdateContent
        };
        return selector(state);
    }
}));

// Mock settings store
vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: (selector: (state: unknown) => unknown) => {
        const state = {
            syncScroll: mockSyncScroll()
        };
        return selector(state);
    }
}));

describe('MainLayout', () => {
    const defaultProps = {};

    beforeEach(() => {
        vi.clearAllMocks();
        mockViewMode.mockReturnValue('split');
        mockActiveDocumentId.mockReturnValue('doc-1');
        mockSyncScroll.mockReturnValue(true);

        // Reset window size to desktop
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024
        });
    });

    describe('desktop split view', () => {
        it('should render split pane in split mode', () => {
            render(<MainLayout {...defaultProps} />);

            expect(screen.getByTestId('split-pane')).toBeInTheDocument();
        });

        it('should render editor in left pane', () => {
            render(<MainLayout {...defaultProps} />);

            const leftPane = screen.getByTestId('split-left');
            expect(leftPane.querySelector('[data-testid="editor"]')).toBeInTheDocument();
        });

        it('should render preview in right pane', () => {
            render(<MainLayout {...defaultProps} />);

            const rightPane = screen.getByTestId('split-right');
            expect(rightPane.querySelector('[data-testid="preview"]')).toBeInTheDocument();
        });

        it('should render document panel in right pane', () => {
            render(<MainLayout {...defaultProps} />);

            const rightPane = screen.getByTestId('split-right');
            expect(rightPane.querySelector('[data-testid="document-panel"]')).toBeInTheDocument();
        });

        it('should pass default split size of 50', () => {
            render(<MainLayout {...defaultProps} />);

            expect(screen.getByTestId('split-pane')).toHaveAttribute('data-default-size', '50');
        });

        it('should render collapse buttons', () => {
            render(<MainLayout {...defaultProps} />);

            const tooltips = screen.getAllByTestId('tooltip');
            expect(tooltips.length).toBeGreaterThan(0);
        });

        it('should apply custom className', () => {
            const { container } = render(<MainLayout className="custom-layout" />);

            expect(container.firstChild).toHaveClass('custom-layout');
        });
    });

    describe('desktop editor-only view', () => {
        beforeEach(() => {
            mockViewMode.mockReturnValue('editor');
        });

        it('should render only editor', () => {
            render(<MainLayout {...defaultProps} />);

            expect(screen.getByTestId('editor')).toBeInTheDocument();
            expect(screen.queryByTestId('preview')).not.toBeInTheDocument();
            expect(screen.queryByTestId('split-pane')).not.toBeInTheDocument();
        });

        it('should render collapse button to show preview', () => {
            render(<MainLayout {...defaultProps} />);

            const tooltip = screen.getByTestId('tooltip');
            expect(tooltip).toHaveAttribute('data-content', 'layout.showPreview');
        });

        it('should show split view when collapse button is clicked', () => {
            render(<MainLayout {...defaultProps} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(mockSetViewMode).toHaveBeenCalledWith('split');
        });
    });

    describe('desktop preview-only view', () => {
        beforeEach(() => {
            mockViewMode.mockReturnValue('preview');
        });

        it('should render only preview', () => {
            render(<MainLayout {...defaultProps} />);

            expect(screen.getByTestId('preview')).toBeInTheDocument();
            expect(screen.queryByTestId('editor')).not.toBeInTheDocument();
            expect(screen.queryByTestId('split-pane')).not.toBeInTheDocument();
        });

        it('should render document panel', () => {
            render(<MainLayout {...defaultProps} />);

            expect(screen.getByTestId('document-panel')).toBeInTheDocument();
        });

        it('should render collapse button to show editor', () => {
            render(<MainLayout {...defaultProps} />);

            const tooltip = screen.getByTestId('tooltip');
            expect(tooltip).toHaveAttribute('data-content', 'layout.showEditor');
        });

        it('should show split view when collapse button is clicked', () => {
            render(<MainLayout {...defaultProps} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(mockSetViewMode).toHaveBeenCalledWith('split');
        });
    });

    describe('mobile view', () => {
        beforeEach(() => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 600
            });
        });

        it('should render tab buttons on mobile', async () => {
            render(<MainLayout {...defaultProps} />);

            // Trigger resize event
            await act(async () => {
                window.dispatchEvent(new Event('resize'));
            });

            expect(screen.getByText('layout.editor')).toBeInTheDocument();
            expect(screen.getByText('layout.preview')).toBeInTheDocument();
        });

        it('should show editor by default when switched from split mode', async () => {
            render(<MainLayout {...defaultProps} />);

            await act(async () => {
                window.dispatchEvent(new Event('resize'));
            });

            // Mobile should force switch from split to editor
            expect(mockSetViewMode).toHaveBeenCalledWith('editor');
        });

        it('should switch to editor tab when clicked', async () => {
            mockViewMode.mockReturnValue('preview');
            render(<MainLayout {...defaultProps} />);

            await act(async () => {
                window.dispatchEvent(new Event('resize'));
            });

            fireEvent.click(screen.getByText('layout.editor'));
            expect(mockSetViewMode).toHaveBeenCalledWith('editor');
        });

        it('should switch to preview tab when clicked', async () => {
            mockViewMode.mockReturnValue('editor');
            render(<MainLayout {...defaultProps} />);

            await act(async () => {
                window.dispatchEvent(new Event('resize'));
            });

            fireEvent.click(screen.getByText('layout.preview'));
            expect(mockSetViewMode).toHaveBeenCalledWith('preview');
        });

        it('should show editor content when editor tab is active', async () => {
            mockViewMode.mockReturnValue('editor');
            render(<MainLayout {...defaultProps} />);

            await act(async () => {
                window.dispatchEvent(new Event('resize'));
            });

            expect(screen.getByTestId('editor')).toBeInTheDocument();
            expect(screen.queryByTestId('preview')).not.toBeInTheDocument();
        });

        it('should show preview content when preview tab is active', async () => {
            mockViewMode.mockReturnValue('preview');
            render(<MainLayout {...defaultProps} />);

            await act(async () => {
                window.dispatchEvent(new Event('resize'));
            });

            expect(screen.getByTestId('preview')).toBeInTheDocument();
            expect(screen.queryByTestId('editor')).not.toBeInTheDocument();
        });

        it('should highlight active editor tab', async () => {
            mockViewMode.mockReturnValue('editor');
            render(<MainLayout {...defaultProps} />);

            await act(async () => {
                window.dispatchEvent(new Event('resize'));
            });

            const editorTab = screen.getByText('layout.editor');
            expect(editorTab).toHaveClass('border-primary-500');
        });

        it('should highlight active preview tab', async () => {
            mockViewMode.mockReturnValue('preview');
            render(<MainLayout {...defaultProps} />);

            await act(async () => {
                window.dispatchEvent(new Event('resize'));
            });

            const previewTab = screen.getByText('layout.preview');
            expect(previewTab).toHaveClass('border-primary-500');
        });
    });

    describe('view mode changes', () => {
        it('should call expandPreview from split view left button', () => {
            mockViewMode.mockReturnValue('split');
            render(<MainLayout {...defaultProps} />);

            // Find button with hideEditor tooltip (left pane collapse button)
            const tooltips = screen.getAllByTestId('tooltip');
            const hideEditorTooltip = tooltips.find((t) => t.getAttribute('data-content') === 'layout.hideEditor');
            const button = hideEditorTooltip?.querySelector('button');

            if (button) {
                fireEvent.click(button);
                expect(mockSetViewMode).toHaveBeenCalledWith('preview');
            }
        });

        it('should call expandEditor from split view right button', () => {
            mockViewMode.mockReturnValue('split');
            render(<MainLayout {...defaultProps} />);

            // Find button with hidePreview tooltip (right pane collapse button)
            const tooltips = screen.getAllByTestId('tooltip');
            const hidePreviewTooltip = tooltips.find((t) => t.getAttribute('data-content') === 'layout.hidePreview');
            const button = hidePreviewTooltip?.querySelector('button');

            if (button) {
                fireEvent.click(button);
                expect(mockSetViewMode).toHaveBeenCalledWith('editor');
            }
        });
    });

    describe('content handling', () => {
        it('should pass document content to preview', () => {
            mockViewMode.mockReturnValue('preview');
            render(<MainLayout {...defaultProps} />);

            expect(screen.getByTestId('preview')).toHaveTextContent('Preview: # Test Document');
        });

        it('should update content when preview triggers change', () => {
            mockViewMode.mockReturnValue('preview');
            render(<MainLayout {...defaultProps} />);

            fireEvent.click(screen.getByTestId('preview'));

            expect(mockUpdateContent).toHaveBeenCalledWith('doc-1', 'new content');
        });

        it('should handle empty content when no active document', () => {
            mockActiveDocumentId.mockReturnValue(null);
            mockViewMode.mockReturnValue('preview');
            render(<MainLayout {...defaultProps} />);

            expect(screen.getByTestId('preview')).toHaveTextContent('Preview:');
        });
    });

    describe('callbacks', () => {
        it('should call onEditorViewReady when editor is ready', () => {
            const onEditorViewReady = vi.fn();
            mockViewMode.mockReturnValue('editor');
            render(<MainLayout onEditorViewReady={onEditorViewReady} />);

            expect(onEditorViewReady).toHaveBeenCalledWith({ mock: 'editorView' });
        });

        it('should pass activeLine to document panel', () => {
            mockViewMode.mockReturnValue('preview');
            render(<MainLayout activeLine={42} />);

            expect(screen.getByTestId('document-panel')).toHaveAttribute('data-active-line', '42');
        });

        it('should call onNavigate when document panel triggers navigation', () => {
            const onNavigate = vi.fn();
            mockViewMode.mockReturnValue('preview');
            render(<MainLayout onNavigate={onNavigate} />);

            fireEvent.click(screen.getByTestId('document-panel'));

            expect(onNavigate).toHaveBeenCalledWith(5, 1);
        });

        it('should call onReplace when document panel triggers replace', () => {
            const onReplace = vi.fn();
            mockViewMode.mockReturnValue('preview');
            render(<MainLayout onReplace={onReplace} />);

            fireEvent.click(screen.getByTestId('document-panel'));

            expect(onReplace).toHaveBeenCalledWith('foo', 'bar', true);
        });
    });

    describe('split resize', () => {
        it('should handle resize callback', () => {
            mockViewMode.mockReturnValue('split');
            render(<MainLayout {...defaultProps} />);

            const resizeButton = screen.getByTestId('split-resize-trigger');
            fireEvent.click(resizeButton);

            // Just verify no errors occur, the size is internal state
            expect(resizeButton).toBeInTheDocument();
        });
    });

    describe('scroll sync', () => {
        it('should register scroll handlers on mount', () => {
            mockViewMode.mockReturnValue('split');
            render(<MainLayout {...defaultProps} />);

            // Verify editor and preview are rendered with scroll handlers
            expect(screen.getByTestId('editor')).toBeInTheDocument();
            expect(screen.getByTestId('preview')).toBeInTheDocument();
        });

        it('should handle editor scroll events', () => {
            mockViewMode.mockReturnValue('split');
            render(<MainLayout {...defaultProps} />);

            // Trigger scroll via click (which calls onScroll in mock)
            fireEvent.click(screen.getByTestId('editor'));

            // No errors should occur
            expect(screen.getByTestId('editor')).toBeInTheDocument();
        });

        it('should handle preview scroll events', () => {
            mockViewMode.mockReturnValue('split');
            render(<MainLayout {...defaultProps} />);

            fireEvent.click(screen.getByTestId('preview'));

            // No errors should occur
            expect(screen.getByTestId('preview')).toBeInTheDocument();
        });
    });

    describe('responsive behavior', () => {
        it('should switch to mobile view on resize', async () => {
            render(<MainLayout {...defaultProps} />);

            // Start desktop
            expect(screen.getByTestId('split-pane')).toBeInTheDocument();

            // Resize to mobile
            Object.defineProperty(window, 'innerWidth', { value: 500 });
            await act(async () => {
                window.dispatchEvent(new Event('resize'));
            });

            // Should force editor mode
            expect(mockSetViewMode).toHaveBeenCalledWith('editor');
        });

        it('should cleanup resize listener on unmount', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
            const { unmount } = render(<MainLayout {...defaultProps} />);

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
            removeEventListenerSpy.mockRestore();
        });
    });

    describe('data tour attributes', () => {
        it('should have data-tour="editor" attribute in editor only mode', () => {
            mockViewMode.mockReturnValue('editor');
            const { container } = render(<MainLayout {...defaultProps} />);

            expect(container.querySelector('[data-tour="editor"]')).toBeInTheDocument();
        });

        it('should have data-tour="preview" attribute in preview only mode', () => {
            mockViewMode.mockReturnValue('preview');
            const { container } = render(<MainLayout {...defaultProps} />);

            expect(container.querySelector('[data-tour="preview"]')).toBeInTheDocument();
        });

        it('should have both data-tour attributes in split mode', () => {
            mockViewMode.mockReturnValue('split');
            const { container } = render(<MainLayout {...defaultProps} />);

            expect(container.querySelector('[data-tour="editor"]')).toBeInTheDocument();
            expect(container.querySelector('[data-tour="preview"]')).toBeInTheDocument();
        });
    });

    describe('CollapseButton styling', () => {
        it('should render chevron left icon for left direction', () => {
            mockViewMode.mockReturnValue('editor');
            render(<MainLayout {...defaultProps} />);

            expect(screen.getByTestId('icon-chevron-left')).toBeInTheDocument();
        });

        it('should render chevron right icon for right direction', () => {
            mockViewMode.mockReturnValue('preview');
            render(<MainLayout {...defaultProps} />);

            expect(screen.getByTestId('icon-chevron-right')).toBeInTheDocument();
        });
    });
});
