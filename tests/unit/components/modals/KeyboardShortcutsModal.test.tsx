import { KeyboardShortcutsModal } from '@/components/modals/KeyboardShortcutsModal';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock Modal component
vi.mock('@/components/ui', () => ({
    Modal: ({
        isOpen,
        onClose,
        title,
        children
    }: {
        isOpen: boolean;
        onClose: () => void;
        title: string;
        children: React.ReactNode;
        size?: string;
    }) =>
        isOpen ? (
            <dialog data-testid="modal" open aria-label={title}>
                <h2>{title}</h2>
                <button type="button" onClick={onClose} aria-label="Close">
                    Close
                </button>
                {children}
            </dialog>
        ) : null
}));

describe('KeyboardShortcutsModal', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should not render when isOpen is false', () => {
            render(<KeyboardShortcutsModal isOpen={false} onClose={mockOnClose} />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('should render when isOpen is true', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('should show shortcuts title', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('shortcuts.title')).toBeInTheDocument();
        });

        it('should show search placeholder', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByPlaceholderText('shortcuts.searchPlaceholder')).toBeInTheDocument();
        });
    });

    describe('shortcut groups', () => {
        it('should show text formatting group', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('shortcuts.groups.textFormatting')).toBeInTheDocument();
        });

        it('should show headings group', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('shortcuts.groups.headings')).toBeInTheDocument();
        });

        it('should show lists group', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('shortcuts.groups.lists')).toBeInTheDocument();
        });

        it('should show insert group', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('shortcuts.groups.insert')).toBeInTheDocument();
        });

        it('should show editor group', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('shortcuts.groups.editor')).toBeInTheDocument();
        });

        it('should show view group', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('shortcuts.groups.view')).toBeInTheDocument();
        });
    });

    describe('shortcuts', () => {
        it('should show bold shortcut', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            // Ctrl+B appears twice (bold + toggle sidebar), so use getAllByText
            const ctrlBs = screen.getAllByText('Ctrl+B');
            expect(ctrlBs.length).toBeGreaterThan(0);
            expect(screen.getByText('shortcuts.actions.bold')).toBeInTheDocument();
        });

        it('should show italic shortcut', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('Ctrl+I')).toBeInTheDocument();
            expect(screen.getByText('shortcuts.actions.italic')).toBeInTheDocument();
        });

        it('should show heading shortcuts', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('Ctrl+1')).toBeInTheDocument();
            expect(screen.getByText('Ctrl+2')).toBeInTheDocument();
            expect(screen.getByText('Ctrl+3')).toBeInTheDocument();
        });

        it('should show undo/redo shortcuts', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('Ctrl+Z')).toBeInTheDocument();
        });

        it('should show save shortcut', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
            expect(screen.getByText('shortcuts.actions.saveFile')).toBeInTheDocument();
        });
    });

    describe('search filter', () => {
        it('should filter shortcuts by key', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            const searchInput = screen.getByPlaceholderText('shortcuts.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'Ctrl+B' } });

            // Should still show Ctrl+B (might be multiple matches)
            const ctrlBs = screen.getAllByText('Ctrl+B');
            expect(ctrlBs.length).toBeGreaterThan(0);
        });

        it('should show no shortcuts found when filter matches nothing', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            const searchInput = screen.getByPlaceholderText('shortcuts.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });

            expect(screen.getByText('shortcuts.noShortcutsFound')).toBeInTheDocument();
        });

        it('should clear filter when input is cleared', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            const searchInput = screen.getByPlaceholderText('shortcuts.searchPlaceholder');

            // Filter to something
            fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });
            expect(screen.getByText('shortcuts.noShortcutsFound')).toBeInTheDocument();

            // Clear filter
            fireEvent.change(searchInput, { target: { value: '' } });
            expect(screen.queryByText('shortcuts.noShortcutsFound')).not.toBeInTheDocument();
        });
    });

    describe('footer', () => {
        it('should show close hint', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            // Text is split across elements, so check for partial matches
            expect(screen.getByText(/shortcuts\.press/)).toBeInTheDocument();
            expect(screen.getByText(/Esc/)).toBeInTheDocument();
            expect(screen.getByText(/shortcuts\.toClose/)).toBeInTheDocument();
        });
    });

    describe('close behavior', () => {
        it('should call onClose when close button is clicked', () => {
            render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);

            fireEvent.click(screen.getByLabelText('Close'));

            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
