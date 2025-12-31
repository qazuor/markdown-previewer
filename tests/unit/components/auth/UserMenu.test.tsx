import { UserMenu } from '@/components/auth/UserMenu';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/components/auth/AuthProvider', () => ({
    useAuth: () => mockUseAuth()
}));

// Mock auth-client
const mockSignOut = vi.fn();
vi.mock('@/lib/auth-client', () => ({
    signOut: () => mockSignOut()
}));

// Mock uiStore
const mockOpenModal = vi.fn();
vi.mock('@/stores', () => ({
    useUIStore: (selector: (state: { openModal: typeof mockOpenModal }) => unknown) => selector({ openModal: mockOpenModal })
}));

// Mock LoginModal
vi.mock('@/components/auth/LoginModal', () => ({
    LoginModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? (
            <div data-testid="login-modal">
                <button type="button" onClick={onClose}>
                    Close
                </button>
            </div>
        ) : null
}));

// Mock UI components
vi.mock('@/components/ui/Button', () => ({
    Button: ({
        children,
        onClick,
        className,
        variant
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        className?: string;
        variant?: string;
    }) => (
        <button type="button" onClick={onClick} className={className} data-variant={variant}>
            {children}
        </button>
    )
}));

let mockIsDropdownOpen = false;

vi.mock('@/components/ui/DropdownMenu', () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown">{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
        <button
            type="button"
            data-testid="dropdown-trigger"
            onClick={() => {
                mockIsDropdownOpen = !mockIsDropdownOpen;
            }}
        >
            {children}
        </button>
    ),
    DropdownMenuContent: ({ children }: { children: React.ReactNode; align?: string; className?: string }) => (
        <div data-testid="dropdown-content" style={{ display: mockIsDropdownOpen ? 'block' : 'none' }}>
            {children}
        </div>
    ),
    DropdownMenuItem: ({
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
        <button type="button" onClick={onClick} disabled={disabled} className={className} data-testid="dropdown-item">
            {children}
        </button>
    ),
    DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-label">{children}</div>,
    DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />
}));

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
    value: { reload: mockReload },
    writable: true
});

describe('UserMenu', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsDropdownOpen = false;
    });

    describe('when loading', () => {
        it('should show loading spinner', () => {
            mockUseAuth.mockReturnValue({
                user: null,
                isLoading: true,
                isAuthenticated: false
            });

            const { container } = render(<UserMenu />);

            expect(container.querySelector('.animate-spin')).toBeInTheDocument();
        });
    });

    describe('when not authenticated', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: null,
                isLoading: false,
                isAuthenticated: false
            });
        });

        it('should show sign in button', () => {
            render(<UserMenu />);

            expect(screen.getByText('auth.sign_in')).toBeInTheDocument();
        });

        it('should open login modal when sign in button is clicked', () => {
            render(<UserMenu />);

            fireEvent.click(screen.getByText('auth.sign_in'));

            expect(screen.getByTestId('login-modal')).toBeInTheDocument();
        });

        it('should close login modal when onClose is called', () => {
            render(<UserMenu />);

            fireEvent.click(screen.getByText('auth.sign_in'));
            expect(screen.getByTestId('login-modal')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Close'));
            expect(screen.queryByTestId('login-modal')).not.toBeInTheDocument();
        });
    });

    describe('when authenticated', () => {
        const mockUser = {
            id: '123',
            name: 'John Doe',
            email: 'john@example.com',
            image: 'https://example.com/avatar.jpg'
        };

        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true
            });
        });

        it('should show user avatar', () => {
            render(<UserMenu />);

            const avatar = screen.getByAltText('John Doe');
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
        });

        it('should show user name', () => {
            render(<UserMenu />);

            // Multiple elements have user name (trigger + dropdown label)
            const names = screen.getAllByText('John Doe');
            expect(names.length).toBeGreaterThan(0);
        });

        it('should show dropdown with user info when opened', () => {
            render(<UserMenu />);

            fireEvent.click(screen.getByTestId('dropdown-trigger'));

            expect(screen.getByText('john@example.com')).toBeInTheDocument();
        });

        it('should show settings option in dropdown', () => {
            render(<UserMenu />);

            fireEvent.click(screen.getByTestId('dropdown-trigger'));

            expect(screen.getByText('common.settings')).toBeInTheDocument();
        });

        it('should open settings modal when settings is clicked', () => {
            render(<UserMenu />);

            fireEvent.click(screen.getByTestId('dropdown-trigger'));
            fireEvent.click(screen.getByText('common.settings'));

            expect(mockOpenModal).toHaveBeenCalledWith('settings');
        });

        it('should show sign out option in dropdown', () => {
            render(<UserMenu />);

            fireEvent.click(screen.getByTestId('dropdown-trigger'));

            expect(screen.getByText('auth.sign_out')).toBeInTheDocument();
        });

        it('should call signOut and reload page when sign out is clicked', async () => {
            mockSignOut.mockResolvedValue(undefined);
            render(<UserMenu />);

            fireEvent.click(screen.getByTestId('dropdown-trigger'));
            fireEvent.click(screen.getByText('auth.sign_out'));

            await waitFor(() => {
                expect(mockSignOut).toHaveBeenCalled();
                expect(mockReload).toHaveBeenCalled();
            });
        });
    });

    describe('avatar fallback', () => {
        it('should show initial when image is not provided', () => {
            mockUseAuth.mockReturnValue({
                user: {
                    id: '123',
                    name: 'John Doe',
                    email: 'john@example.com',
                    image: null
                },
                isLoading: false,
                isAuthenticated: true
            });

            render(<UserMenu />);

            expect(screen.getByText('J')).toBeInTheDocument();
        });

        it('should show fallback initial when image fails to load', () => {
            mockUseAuth.mockReturnValue({
                user: {
                    id: '123',
                    name: 'John Doe',
                    email: 'john@example.com',
                    image: 'https://example.com/broken-image.jpg'
                },
                isLoading: false,
                isAuthenticated: true
            });

            render(<UserMenu />);

            const avatar = screen.getByAltText('John Doe');
            fireEvent.error(avatar);

            expect(screen.getByText('J')).toBeInTheDocument();
        });

        it('should show U when name is not provided', () => {
            mockUseAuth.mockReturnValue({
                user: {
                    id: '123',
                    name: null,
                    email: 'john@example.com',
                    image: null
                },
                isLoading: false,
                isAuthenticated: true
            });

            render(<UserMenu />);

            expect(screen.getByText('U')).toBeInTheDocument();
        });
    });

    describe('sign out error handling', () => {
        it('should handle sign out errors gracefully', async () => {
            mockUseAuth.mockReturnValue({
                user: {
                    id: '123',
                    name: 'John Doe',
                    email: 'john@example.com',
                    image: null
                },
                isLoading: false,
                isAuthenticated: true
            });

            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            mockSignOut.mockRejectedValue(new Error('Sign out failed'));

            render(<UserMenu />);

            fireEvent.click(screen.getByTestId('dropdown-trigger'));
            fireEvent.click(screen.getByText('auth.sign_out'));

            await waitFor(() => {
                expect(consoleError).toHaveBeenCalledWith('Sign out failed:', expect.any(Error));
            });

            consoleError.mockRestore();
        });
    });
});
