import { AboutModal } from '@/components/modals/AboutModal';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock Modal component
vi.mock('@/components/ui/Modal', () => ({
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

describe('AboutModal', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should not render when isOpen is false', () => {
            render(<AboutModal isOpen={false} onClose={mockOnClose} />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('should render when isOpen is true', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('should show about title', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('about.title')).toBeInTheDocument();
        });

        it('should show app name', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('MarkView')).toBeInTheDocument();
        });

        it('should show MV logo', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('MV')).toBeInTheDocument();
        });

        it('should show tagline', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('about.tagline')).toBeInTheDocument();
        });

        it('should show version', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            // Version text contains both "about.version" and "0.1.0"
            expect(screen.getByText(/about\.version/)).toBeInTheDocument();
            expect(screen.getByText(/0\.1\.0/)).toBeInTheDocument();
        });

        it('should show description', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('about.description')).toBeInTheDocument();
        });
    });

    describe('features', () => {
        it('should show features title', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('about.featuresTitle')).toBeInTheDocument();
        });

        it('should show editor feature', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('about.features.editor')).toBeInTheDocument();
        });

        it('should show preview feature', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('about.features.preview')).toBeInTheDocument();
        });

        it('should show github feature', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('about.features.github')).toBeInTheDocument();
        });

        it('should show gdrive feature', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('about.features.gdrive')).toBeInTheDocument();
        });

        it('should show export feature', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('about.features.export')).toBeInTheDocument();
        });

        it('should show pwa feature', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('about.features.pwa')).toBeInTheDocument();
        });
    });

    describe('tech stack', () => {
        it('should show React', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('React')).toBeInTheDocument();
        });

        it('should show TypeScript', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('TypeScript')).toBeInTheDocument();
        });

        it('should show Vite', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('Vite')).toBeInTheDocument();
        });

        it('should show Tailwind CSS', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
        });

        it('should show CodeMirror', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('CodeMirror')).toBeInTheDocument();
        });
    });

    describe('links', () => {
        it('should show GitHub link', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            const githubLink = screen.getByRole('link', { name: /GitHub/i });
            expect(githubLink).toBeInTheDocument();
            expect(githubLink).toHaveAttribute('href', 'https://github.com/qazuor/markview');
            expect(githubLink).toHaveAttribute('target', '_blank');
            expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
        });

        it('should show author link', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            const authorLink = screen.getByRole('link', { name: 'qazuor' });
            expect(authorLink).toBeInTheDocument();
            expect(authorLink).toHaveAttribute('href', 'https://github.com/qazuor');
        });
    });

    describe('footer', () => {
        it('should show made with love message', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            // Text is split across elements with icons
            expect(screen.getByText(/about\.madeWith/)).toBeInTheDocument();
            expect(screen.getByText(/about\.by/)).toBeInTheDocument();
        });

        it('should show license', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('about.license')).toBeInTheDocument();
        });
    });

    describe('close behavior', () => {
        it('should call onClose when close button is clicked', () => {
            render(<AboutModal isOpen={true} onClose={mockOnClose} />);

            fireEvent.click(screen.getByLabelText('Close'));

            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
