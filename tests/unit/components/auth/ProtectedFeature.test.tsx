import { ProtectedFeature } from '@/components/auth/ProtectedFeature';
import { fireEvent, render, screen } from '@testing-library/react';
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

describe('ProtectedFeature', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('when loading', () => {
        it('should show loading spinner', () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                isLoading: true
            });

            const { container } = render(
                <ProtectedFeature feature="cloud-sync">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(container.querySelector('.animate-spin')).toBeInTheDocument();
        });

        it('should not show children when loading', () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                isLoading: true
            });

            render(
                <ProtectedFeature feature="cloud-sync">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });
    });

    describe('when authenticated', () => {
        it('should render children', () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: true,
                isLoading: false
            });

            render(
                <ProtectedFeature feature="cloud-sync">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });

        it('should not show sign in prompt', () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: true,
                isLoading: false
            });

            render(
                <ProtectedFeature feature="cloud-sync">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.queryByText('auth.sign_in')).not.toBeInTheDocument();
        });
    });

    describe('when not authenticated', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                isLoading: false
            });
        });

        it('should not render children', () => {
            render(
                <ProtectedFeature feature="cloud-sync">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });

        it('should show sign in prompt', () => {
            render(
                <ProtectedFeature feature="cloud-sync">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.getByText('auth.sign_in')).toBeInTheDocument();
        });

        it('should show feature-specific title', () => {
            render(
                <ProtectedFeature feature="cloud-sync">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.getByText('features.cloud_sync.title')).toBeInTheDocument();
        });

        it('should show feature-specific description', () => {
            render(
                <ProtectedFeature feature="cloud-sync">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.getByText('features.cloud_sync.description')).toBeInTheDocument();
        });

        it('should open login modal when sign in button is clicked', () => {
            render(
                <ProtectedFeature feature="cloud-sync">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            fireEvent.click(screen.getByText('auth.sign_in'));

            expect(screen.getByTestId('login-modal')).toBeInTheDocument();
        });

        it('should close login modal when onClose is called', () => {
            render(
                <ProtectedFeature feature="cloud-sync">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            fireEvent.click(screen.getByText('auth.sign_in'));
            expect(screen.getByTestId('login-modal')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Close'));
            expect(screen.queryByTestId('login-modal')).not.toBeInTheDocument();
        });
    });

    describe('custom fallback', () => {
        it('should render custom fallback when not authenticated', () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                isLoading: false
            });

            render(
                <ProtectedFeature feature="cloud-sync" fallback={<div>Custom Fallback</div>}>
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
            expect(screen.queryByText('auth.sign_in')).not.toBeInTheDocument();
        });
    });

    describe('custom title and description', () => {
        it('should use custom title when provided', () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                isLoading: false
            });

            render(
                <ProtectedFeature feature="cloud-sync" title="Custom Title">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.getByText('Custom Title')).toBeInTheDocument();
        });

        it('should use custom description when provided', () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                isLoading: false
            });

            render(
                <ProtectedFeature feature="cloud-sync" description="Custom Description">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.getByText('Custom Description')).toBeInTheDocument();
        });
    });

    describe('compact mode', () => {
        it('should render compact version when compact is true', () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                isLoading: false
            });

            render(
                <ProtectedFeature feature="cloud-sync" compact>
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.getByText('auth.sign_in_to_use')).toBeInTheDocument();
        });

        it('should open login modal in compact mode', () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                isLoading: false
            });

            render(
                <ProtectedFeature feature="cloud-sync" compact>
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            fireEvent.click(screen.getByRole('button'));
            expect(screen.getByTestId('login-modal')).toBeInTheDocument();
        });
    });

    describe('different features', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                isLoading: false
            });
        });

        it('should show github feature messages', () => {
            render(
                <ProtectedFeature feature="github-integration">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.getByText('features.github.title')).toBeInTheDocument();
        });

        it('should show google drive feature messages', () => {
            render(
                <ProtectedFeature feature="google-drive">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.getByText('features.google_drive.title')).toBeInTheDocument();
        });

        it('should show settings sync feature messages', () => {
            render(
                <ProtectedFeature feature="settings-sync">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.getByText('features.settings_sync.title')).toBeInTheDocument();
        });

        it('should show shared documents feature messages', () => {
            render(
                <ProtectedFeature feature="shared-documents">
                    <div>Protected Content</div>
                </ProtectedFeature>
            );

            expect(screen.getByText('features.shared_documents.title')).toBeInTheDocument();
        });
    });
});
