import { DeleteDocumentModal } from '@/components/modals/DeleteDocumentModal';
import type { Document } from '@/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: Record<string, string>) => {
            if (params?.cloud) return key.replace('{cloud}', params.cloud);
            if (params?.fileName) return key.replace('{fileName}', params.fileName);
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

// Mock documentStore
const mockDeleteDocument = vi.fn();
vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: (selector: (state: { deleteDocument: typeof mockDeleteDocument }) => unknown) =>
        selector({ deleteDocument: mockDeleteDocument })
}));

// Mock gdrive service
const mockFileOperation = vi.fn();
const mockClearAllCaches = vi.fn();
vi.mock('@/services/gdrive', () => ({
    fileOperation: (args: unknown) => mockFileOperation(args),
    clearAllCaches: () => mockClearAllCaches()
}));

// Mock github service
const mockRemoveFile = vi.fn();
vi.mock('@/services/github', () => ({
    removeFile: (args: unknown) => mockRemoveFile(args)
}));

describe('DeleteDocumentModal', () => {
    const mockOnClose = vi.fn();

    const createDocument = (overrides: Partial<Document> = {}): Document =>
        ({
            id: 'doc-1',
            name: 'test.md',
            content: '# Test',
            createdAt: new Date(),
            updatedAt: new Date(),
            source: 'local',
            folderId: null,
            isManuallyNamed: false,
            syncStatus: 'synced',
            ...overrides
        }) as Document;

    beforeEach(() => {
        vi.clearAllMocks();
        mockFileOperation.mockResolvedValue({ success: true });
        mockRemoveFile.mockResolvedValue({ success: true });
    });

    describe('rendering', () => {
        it('should not render when document is null', () => {
            const { container } = render(<DeleteDocumentModal isOpen={true} onClose={mockOnClose} document={null} />);

            expect(container.firstChild).toBeNull();
        });

        it('should render when document is provided', () => {
            render(<DeleteDocumentModal isOpen={true} onClose={mockOnClose} document={createDocument()} />);

            expect(screen.getByText('deleteDocument.title')).toBeInTheDocument();
        });

        it('should show document name', () => {
            render(<DeleteDocumentModal isOpen={true} onClose={mockOnClose} document={createDocument({ name: 'my-doc.md' })} />);

            expect(screen.getByText('my-doc.md')).toBeInTheDocument();
        });

        it('should show warning banner', () => {
            render(<DeleteDocumentModal isOpen={true} onClose={mockOnClose} document={createDocument()} />);

            expect(screen.getByText('deleteDocument.warning')).toBeInTheDocument();
        });

        it('should show source for local document', () => {
            render(<DeleteDocumentModal isOpen={true} onClose={mockOnClose} document={createDocument({ source: 'local' })} />);

            expect(screen.getByText('fileExplorer.source.local')).toBeInTheDocument();
        });

        it('should show GitHub source', () => {
            render(
                <DeleteDocumentModal
                    isOpen={true}
                    onClose={mockOnClose}
                    document={createDocument({
                        source: 'github',
                        githubInfo: { owner: 'user', repo: 'repo', path: 'test.md', sha: 'abc', branch: 'main' }
                    })}
                />
            );

            expect(screen.getByText('GitHub')).toBeInTheDocument();
        });

        it('should show Google Drive source', () => {
            render(
                <DeleteDocumentModal
                    isOpen={true}
                    onClose={mockOnClose}
                    document={createDocument({
                        source: 'gdrive',
                        driveInfo: { fileId: 'file-1', name: 'test.md', mimeType: 'text/markdown' }
                    })}
                />
            );

            expect(screen.getByText('Google Drive')).toBeInTheDocument();
        });
    });

    describe('delete options for cloud documents', () => {
        it('should show delete options for GitHub document', () => {
            render(
                <DeleteDocumentModal
                    isOpen={true}
                    onClose={mockOnClose}
                    document={createDocument({
                        source: 'github',
                        githubInfo: { owner: 'user', repo: 'repo', path: 'test.md', sha: 'abc', branch: 'main' }
                    })}
                />
            );

            expect(screen.getByText('deleteDocument.chooseOption')).toBeInTheDocument();
            expect(screen.getByText('deleteDocument.localOnly')).toBeInTheDocument();
        });

        it('should show delete options for Google Drive document', () => {
            render(
                <DeleteDocumentModal
                    isOpen={true}
                    onClose={mockOnClose}
                    document={createDocument({
                        source: 'gdrive',
                        driveInfo: { fileId: 'file-1', name: 'test.md', mimeType: 'text/markdown' }
                    })}
                />
            );

            expect(screen.getByText('deleteDocument.chooseOption')).toBeInTheDocument();
        });

        it('should not show delete options for local document', () => {
            render(<DeleteDocumentModal isOpen={true} onClose={mockOnClose} document={createDocument({ source: 'local' })} />);

            expect(screen.queryByText('deleteDocument.chooseOption')).not.toBeInTheDocument();
        });

        it('should select local option by default', () => {
            render(
                <DeleteDocumentModal
                    isOpen={true}
                    onClose={mockOnClose}
                    document={createDocument({
                        source: 'github',
                        githubInfo: { owner: 'user', repo: 'repo', path: 'test.md', sha: 'abc', branch: 'main' }
                    })}
                />
            );

            const localOption = screen.getByText('deleteDocument.localOnly').closest('button');
            expect(localOption).toHaveClass('border-primary-500');
        });

        it('should allow selecting cloud delete option', () => {
            render(
                <DeleteDocumentModal
                    isOpen={true}
                    onClose={mockOnClose}
                    document={createDocument({
                        source: 'github',
                        githubInfo: { owner: 'user', repo: 'repo', path: 'test.md', sha: 'abc', branch: 'main' }
                    })}
                />
            );

            // Get all buttons and find the cloud option
            const buttons = screen.getAllByRole('button');
            const cloudOption = buttons.find((btn) => btn.textContent?.includes('deleteDocument.alsoFromCloud'));
            if (cloudOption) fireEvent.click(cloudOption);

            expect(cloudOption).toHaveClass('border-red-500');
        });
    });

    describe('delete actions', () => {
        it('should delete local document', async () => {
            render(<DeleteDocumentModal isOpen={true} onClose={mockOnClose} document={createDocument({ id: 'doc-1' })} />);

            const deleteButton = screen.getByText('common.delete');
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(mockDeleteDocument).toHaveBeenCalledWith('doc-1');
            });
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should delete GitHub document locally only by default', async () => {
            render(
                <DeleteDocumentModal
                    isOpen={true}
                    onClose={mockOnClose}
                    document={createDocument({
                        id: 'doc-1',
                        source: 'github',
                        githubInfo: { owner: 'user', repo: 'repo', path: 'test.md', sha: 'abc', branch: 'main' }
                    })}
                />
            );

            const deleteButton = screen.getByText('common.delete');
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(mockDeleteDocument).toHaveBeenCalledWith('doc-1');
            });
            expect(mockRemoveFile).not.toHaveBeenCalled();
        });

        it('should delete from GitHub when cloud option selected', async () => {
            render(
                <DeleteDocumentModal
                    isOpen={true}
                    onClose={mockOnClose}
                    document={createDocument({
                        id: 'doc-1',
                        source: 'github',
                        githubInfo: { owner: 'user', repo: 'repo', path: 'docs/test.md', sha: 'abc123', branch: 'main' }
                    })}
                />
            );

            // Select cloud option
            const buttons = screen.getAllByRole('button');
            const cloudOption = buttons.find((btn) => btn.textContent?.includes('deleteDocument.alsoFromCloud'));
            if (cloudOption) fireEvent.click(cloudOption);

            const deleteButton = screen.getByText('common.delete');
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(mockRemoveFile).toHaveBeenCalledWith({
                    repo: 'user/repo',
                    path: 'docs/test.md',
                    sha: 'abc123',
                    branch: 'main',
                    message: expect.any(String)
                });
            });
        });

        it('should delete from Google Drive when cloud option selected', async () => {
            render(
                <DeleteDocumentModal
                    isOpen={true}
                    onClose={mockOnClose}
                    document={createDocument({
                        id: 'doc-1',
                        source: 'gdrive',
                        driveInfo: { fileId: 'file-123', name: 'test.md', mimeType: 'text/markdown' }
                    })}
                />
            );

            // Select cloud option
            const buttons = screen.getAllByRole('button');
            const cloudOption = buttons.find((btn) => btn.textContent?.includes('deleteDocument.alsoFromCloud'));
            if (cloudOption) fireEvent.click(cloudOption);

            const deleteButton = screen.getByText('common.delete');
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(mockFileOperation).toHaveBeenCalledWith({
                    operation: 'delete',
                    fileId: 'file-123'
                });
            });
            expect(mockClearAllCaches).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should show error when GitHub delete fails', async () => {
            mockRemoveFile.mockResolvedValue({ success: false });

            render(
                <DeleteDocumentModal
                    isOpen={true}
                    onClose={mockOnClose}
                    document={createDocument({
                        source: 'github',
                        githubInfo: { owner: 'user', repo: 'repo', path: 'test.md', sha: 'abc', branch: 'main' }
                    })}
                />
            );

            // Select cloud option
            const buttons = screen.getAllByRole('button');
            const cloudOption = buttons.find((btn) => btn.textContent?.includes('deleteDocument.alsoFromCloud'));
            if (cloudOption) fireEvent.click(cloudOption);

            const deleteButton = screen.getByText('common.delete');
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(screen.getByText('deleteDocument.cloudError')).toBeInTheDocument();
            });
        });

        it('should show error when Google Drive delete fails', async () => {
            mockFileOperation.mockResolvedValue({ success: false, error: 'API Error' });

            render(
                <DeleteDocumentModal
                    isOpen={true}
                    onClose={mockOnClose}
                    document={createDocument({
                        source: 'gdrive',
                        driveInfo: { fileId: 'file-1', name: 'test.md', mimeType: 'text/markdown' }
                    })}
                />
            );

            // Select cloud option
            const buttons = screen.getAllByRole('button');
            const cloudOption = buttons.find((btn) => btn.textContent?.includes('deleteDocument.alsoFromCloud'));
            if (cloudOption) fireEvent.click(cloudOption);

            const deleteButton = screen.getByText('common.delete');
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(screen.getByText('API Error')).toBeInTheDocument();
            });
        });
    });

    describe('buttons', () => {
        it('should have delete button', () => {
            render(<DeleteDocumentModal isOpen={true} onClose={mockOnClose} document={createDocument()} />);

            expect(screen.getByText('common.delete')).toBeInTheDocument();
        });

        it('should have cancel button', () => {
            render(<DeleteDocumentModal isOpen={true} onClose={mockOnClose} document={createDocument()} />);

            expect(screen.getByText('common.cancel')).toBeInTheDocument();
        });
    });

    describe('cancel', () => {
        it('should close modal when cancel is clicked', () => {
            render(<DeleteDocumentModal isOpen={true} onClose={mockOnClose} document={createDocument()} />);

            const cancelButton = screen.getByText('common.cancel');
            fireEvent.click(cancelButton);

            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should reset state when closing', () => {
            render(
                <DeleteDocumentModal
                    isOpen={true}
                    onClose={mockOnClose}
                    document={createDocument({
                        source: 'github',
                        githubInfo: { owner: 'user', repo: 'repo', path: 'test.md', sha: 'abc', branch: 'main' }
                    })}
                />
            );

            // Select cloud option
            const buttons = screen.getAllByRole('button');
            const cloudOption = buttons.find((btn) => btn.textContent?.includes('deleteDocument.alsoFromCloud'));
            if (cloudOption) fireEvent.click(cloudOption);

            // Cancel
            const cancelButton = screen.getByText('common.cancel');
            fireEvent.click(cancelButton);

            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
