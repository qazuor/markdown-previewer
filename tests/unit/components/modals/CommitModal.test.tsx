import { CommitModal } from '@/components/modals/CommitModal';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: Record<string, string>) => {
            if (params?.fileName) return `Update ${params.fileName}`;
            return key;
        }
    })
}));

// Mock Modal component
vi.mock('@/components/ui/Modal', () => ({
    Modal: ({
        children,
        isOpen,
        title
    }: {
        children: React.ReactNode;
        isOpen: boolean;
        onClose: () => void;
        title: string;
        size?: string;
    }) =>
        isOpen ? (
            <dialog open>
                <h2>{title}</h2>
                {children}
            </dialog>
        ) : null,
    ModalFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="modal-footer">{children}</div>
}));

describe('CommitModal', () => {
    const mockOnClose = vi.fn();
    const mockOnCommit = vi.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onCommit: mockOnCommit,
        fileName: 'test.md',
        repoName: 'owner/repo',
        branch: 'main',
        filePath: 'docs/test.md'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockOnCommit.mockResolvedValue(undefined);
    });

    describe('rendering', () => {
        it('should render when open', () => {
            render(<CommitModal {...defaultProps} />);

            expect(screen.getByText('github.commit.title')).toBeInTheDocument();
        });

        it('should not render when closed', () => {
            render(<CommitModal {...defaultProps} isOpen={false} />);

            expect(screen.queryByText('github.commit.title')).not.toBeInTheDocument();
        });

        it('should show file name', () => {
            render(<CommitModal {...defaultProps} />);

            expect(screen.getByText('test.md')).toBeInTheDocument();
        });

        it('should show repo name', () => {
            render(<CommitModal {...defaultProps} />);

            expect(screen.getByText('owner/repo')).toBeInTheDocument();
        });

        it('should show branch', () => {
            render(<CommitModal {...defaultProps} />);

            expect(screen.getByText('main')).toBeInTheDocument();
        });

        it('should show file path', () => {
            render(<CommitModal {...defaultProps} />);

            expect(screen.getByText('docs/test.md')).toBeInTheDocument();
        });

        it('should show commit message textarea', () => {
            render(<CommitModal {...defaultProps} />);

            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('should show default commit message', async () => {
            render(<CommitModal {...defaultProps} />);

            await act(async () => {
                await new Promise((r) => setTimeout(r, 150));
            });

            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            expect(textarea.value).toBe('Update test.md');
        });

        it('should show commit button', () => {
            render(<CommitModal {...defaultProps} />);

            expect(screen.getByText('github.commit.commit')).toBeInTheDocument();
        });

        it('should show cancel button', () => {
            render(<CommitModal {...defaultProps} />);

            expect(screen.getByText('common.cancel')).toBeInTheDocument();
        });
    });

    describe('form submission', () => {
        it('should call onCommit when form is submitted with default message', async () => {
            render(<CommitModal {...defaultProps} />);

            await act(async () => {
                await new Promise((r) => setTimeout(r, 150));
            });

            const textarea = screen.getByRole('textbox');
            const form = textarea.closest('form') as HTMLFormElement;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockOnCommit).toHaveBeenCalledWith('Update test.md');
            });
        });

        it('should close modal after successful commit', async () => {
            render(<CommitModal {...defaultProps} />);

            await act(async () => {
                await new Promise((r) => setTimeout(r, 150));
            });

            const textarea = screen.getByRole('textbox');
            const form = textarea.closest('form') as HTMLFormElement;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockOnClose).toHaveBeenCalled();
            });
        });

        it('should show error when commit fails', async () => {
            mockOnCommit.mockRejectedValue(new Error('Commit failed'));

            render(<CommitModal {...defaultProps} />);

            await act(async () => {
                await new Promise((r) => setTimeout(r, 150));
            });

            const textarea = screen.getByRole('textbox');
            const form = textarea.closest('form') as HTMLFormElement;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.getByText('Commit failed')).toBeInTheDocument();
            });
        });

        it('should show loading state while committing', async () => {
            let resolveCommit: (() => void) | undefined;
            mockOnCommit.mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        resolveCommit = resolve;
                    })
            );

            render(<CommitModal {...defaultProps} />);

            await act(async () => {
                await new Promise((r) => setTimeout(r, 150));
            });

            const textarea = screen.getByRole('textbox');
            const form = textarea.closest('form') as HTMLFormElement;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.getByText('github.commit.committing')).toBeInTheDocument();
            });

            resolveCommit?.();
        });
    });

    describe('cancel button', () => {
        it('should call onClose when cancel is clicked', () => {
            render(<CommitModal {...defaultProps} />);

            const cancelButton = screen.getByText('common.cancel');
            fireEvent.click(cancelButton);

            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should disable cancel button while committing', async () => {
            mockOnCommit.mockImplementation(() => new Promise(() => {}));

            render(<CommitModal {...defaultProps} />);

            await act(async () => {
                await new Promise((r) => setTimeout(r, 150));
            });

            const textarea = screen.getByRole('textbox');
            const form = textarea.closest('form') as HTMLFormElement;
            fireEvent.submit(form);

            await waitFor(() => {
                const cancelButton = screen.getByText('common.cancel');
                expect(cancelButton).toBeDisabled();
            });
        });
    });

    describe('character count', () => {
        it('should show character count', async () => {
            render(<CommitModal {...defaultProps} />);

            await act(async () => {
                await new Promise((r) => setTimeout(r, 150));
            });

            expect(screen.getByText(/\d+ github\.commit\.characters/)).toBeInTheDocument();
        });
    });
});
