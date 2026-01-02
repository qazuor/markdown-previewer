import { LoginModal } from '@/components/auth/LoginModal';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock auth-client
const mockSignInWithGitHub = vi.fn();
const mockSignInWithGoogle = vi.fn();
vi.mock('@/lib/auth-client', () => ({
    signInWithGitHub: () => mockSignInWithGitHub(),
    signInWithGoogle: () => mockSignInWithGoogle()
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

// Mock Button component
vi.mock('@/components/ui/Button', () => ({
    Button: ({
        children,
        onClick,
        disabled,
        className
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
        className?: string;
    }) => (
        <button type="button" onClick={onClick} disabled={disabled} className={className}>
            {children}
        </button>
    )
}));

describe('LoginModal', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should not render when isOpen is false', () => {
            render(<LoginModal isOpen={false} onClose={mockOnClose} />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('should render when isOpen is true', () => {
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('should show sign in title', () => {
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('auth.sign_in')).toBeInTheDocument();
        });

        it('should show sign in description', () => {
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('auth.sign_in_description')).toBeInTheDocument();
        });

        it('should show GitHub login button', () => {
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('auth.continue_with_github')).toBeInTheDocument();
        });

        it('should show Google login button', () => {
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('auth.continue_with_google')).toBeInTheDocument();
        });

        it('should show terms notice', () => {
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('auth.terms_notice')).toBeInTheDocument();
        });
    });

    describe('GitHub login', () => {
        it('should call signInWithGitHub when GitHub button is clicked', async () => {
            mockSignInWithGitHub.mockResolvedValue(undefined);
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            fireEvent.click(screen.getByText('auth.continue_with_github'));

            await waitFor(() => {
                expect(mockSignInWithGitHub).toHaveBeenCalled();
            });
        });

        it('should call onClose after successful GitHub login', async () => {
            mockSignInWithGitHub.mockResolvedValue(undefined);
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            fireEvent.click(screen.getByText('auth.continue_with_github'));

            await waitFor(() => {
                expect(mockOnClose).toHaveBeenCalled();
            });
        });

        it('should show error message when GitHub login fails', async () => {
            mockSignInWithGitHub.mockRejectedValue(new Error('Login failed'));
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            fireEvent.click(screen.getByText('auth.continue_with_github'));

            await waitFor(() => {
                expect(screen.getByText('auth.errors.github_failed')).toBeInTheDocument();
            });
        });

        it('should disable buttons while GitHub login is in progress', async () => {
            // Create a promise that doesn't resolve immediately
            let resolveLogin: (() => void) | undefined;
            const loginPromise = new Promise<void>((resolve) => {
                resolveLogin = resolve;
            });
            mockSignInWithGitHub.mockReturnValue(loginPromise);

            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            fireEvent.click(screen.getByText('auth.continue_with_github'));

            // Buttons should be disabled while loading
            const buttons = screen.getAllByRole('button');
            for (const button of buttons) {
                if (button.textContent?.includes('auth.continue_with')) {
                    expect(button).toBeDisabled();
                }
            }

            // Resolve the login
            resolveLogin?.();
            await waitFor(() => {
                expect(mockOnClose).toHaveBeenCalled();
            });
        });
    });

    describe('Google login', () => {
        it('should call signInWithGoogle when Google button is clicked', async () => {
            mockSignInWithGoogle.mockResolvedValue(undefined);
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            fireEvent.click(screen.getByText('auth.continue_with_google'));

            await waitFor(() => {
                expect(mockSignInWithGoogle).toHaveBeenCalled();
            });
        });

        it('should call onClose after successful Google login', async () => {
            mockSignInWithGoogle.mockResolvedValue(undefined);
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            fireEvent.click(screen.getByText('auth.continue_with_google'));

            await waitFor(() => {
                expect(mockOnClose).toHaveBeenCalled();
            });
        });

        it('should show error message when Google login fails', async () => {
            mockSignInWithGoogle.mockRejectedValue(new Error('Login failed'));
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            fireEvent.click(screen.getByText('auth.continue_with_google'));

            await waitFor(() => {
                expect(screen.getByText('auth.errors.google_failed')).toBeInTheDocument();
            });
        });
    });

    describe('close behavior', () => {
        it('should call onClose when close button is clicked', () => {
            render(<LoginModal isOpen={true} onClose={mockOnClose} />);

            fireEvent.click(screen.getByLabelText('Close'));

            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
