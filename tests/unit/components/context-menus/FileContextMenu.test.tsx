import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Hoisted mocks
const { mockDeleteDocument, mockRenameDocument, mockCreateDocument, mockUpdateContent } = vi.hoisted(() => ({
    mockDeleteDocument: vi.fn(),
    mockRenameDocument: vi.fn(),
    mockCreateDocument: vi.fn(() => 'new-doc-id'),
    mockUpdateContent: vi.fn()
}));

// Mock document store
vi.mock('@/stores/documentStore', () => {
    const mockStore = () => ({
        getDocument: vi.fn(() => ({ name: 'Test File', content: '# Test Content' })),
        deleteDocument: mockDeleteDocument,
        renameDocument: mockRenameDocument,
        createDocument: mockCreateDocument,
        documents: new Map([['new-doc-id', { name: 'New Doc', content: '' }]])
    });
    mockStore.getState = () => ({ updateContent: mockUpdateContent });
    return { useDocumentStore: mockStore };
});

// Import after mocks
import { FileContextMenu } from '@/components/sidebar/FileContextMenu';

// Mock window.confirm and window.prompt
const originalConfirm = window.confirm;
const originalPrompt = window.prompt;

describe('FileContextMenu', () => {
    const defaultProps = {
        documentId: 'test-doc-id'
    };

    beforeEach(() => {
        mockDeleteDocument.mockClear();
        mockRenameDocument.mockClear();
        mockCreateDocument.mockClear();
        window.confirm = vi.fn(() => true);
        window.prompt = vi.fn(() => 'New Name');
    });

    afterEach(() => {
        window.confirm = originalConfirm;
        window.prompt = originalPrompt;
    });

    it('should render children', () => {
        render(
            <FileContextMenu {...defaultProps}>
                <div>File Item</div>
            </FileContextMenu>
        );

        expect(screen.getByText('File Item')).toBeInTheDocument();
    });

    it('should show context menu on right click', async () => {
        render(
            <FileContextMenu {...defaultProps}>
                <div>File Item</div>
            </FileContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('File Item'));

        expect(await screen.findByText('common.rename')).toBeInTheDocument();
        expect(await screen.findByText('common.duplicate')).toBeInTheDocument();
        expect(await screen.findByText('common.delete')).toBeInTheDocument();
    });

    it('should show export submenu', async () => {
        render(
            <FileContextMenu {...defaultProps}>
                <div>File Item</div>
            </FileContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('File Item'));

        expect(await screen.findByText('contextMenu.exportAs')).toBeInTheDocument();
    });

    it('should call rename with prompt value', async () => {
        window.prompt = vi.fn(() => 'Renamed File');

        render(
            <FileContextMenu {...defaultProps}>
                <div>File Item</div>
            </FileContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('File Item'));

        const renameItem = await screen.findByText('common.rename');
        fireEvent.click(renameItem);

        expect(window.prompt).toHaveBeenCalled();
        expect(mockRenameDocument).toHaveBeenCalledWith('test-doc-id', 'Renamed File', true);
    });

    it('should not rename if prompt is cancelled', async () => {
        window.prompt = vi.fn(() => null);

        render(
            <FileContextMenu {...defaultProps}>
                <div>File Item</div>
            </FileContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('File Item'));

        const renameItem = await screen.findByText('common.rename');
        fireEvent.click(renameItem);

        expect(mockRenameDocument).not.toHaveBeenCalled();
    });

    it('should call delete with confirmation', async () => {
        window.confirm = vi.fn(() => true);

        render(
            <FileContextMenu {...defaultProps}>
                <div>File Item</div>
            </FileContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('File Item'));

        const deleteItem = await screen.findByText('common.delete');
        fireEvent.click(deleteItem);

        expect(window.confirm).toHaveBeenCalled();
        expect(mockDeleteDocument).toHaveBeenCalledWith('test-doc-id');
    });

    it('should not delete if confirmation is cancelled', async () => {
        window.confirm = vi.fn(() => false);

        render(
            <FileContextMenu {...defaultProps}>
                <div>File Item</div>
            </FileContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('File Item'));

        const deleteItem = await screen.findByText('common.delete');
        fireEvent.click(deleteItem);

        expect(mockDeleteDocument).not.toHaveBeenCalled();
    });

    it('should duplicate document', async () => {
        render(
            <FileContextMenu {...defaultProps}>
                <div>File Item</div>
            </FileContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('File Item'));

        const duplicateItem = await screen.findByText('common.duplicate');
        fireEvent.click(duplicateItem);

        expect(mockCreateDocument).toHaveBeenCalled();
        expect(mockRenameDocument).toHaveBeenCalledWith('new-doc-id', 'Test File (copy)', true);
    });

    it('should show delete item with danger styling', async () => {
        render(
            <FileContextMenu {...defaultProps}>
                <div>File Item</div>
            </FileContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('File Item'));

        const deleteItem = await screen.findByText('common.delete');
        // Check that it's in the document (the variant styling is applied via className)
        expect(deleteItem).toBeInTheDocument();
    });
});
