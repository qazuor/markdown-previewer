import { TOCContextMenu } from '@/components/sidebar/TOCContextMenu';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
    clipboard: {
        writeText: mockWriteText
    }
});

describe('TOCContextMenu', () => {
    const defaultProps = {
        headingId: 'test-heading',
        headingText: 'Test Heading',
        headingLine: 10,
        onNavigate: vi.fn()
    };

    beforeEach(() => {
        mockWriteText.mockClear();
    });

    it('should render children', () => {
        render(
            <TOCContextMenu {...defaultProps}>
                <button type="button">TOC Item</button>
            </TOCContextMenu>
        );

        expect(screen.getByText('TOC Item')).toBeInTheDocument();
    });

    it('should show context menu on right click', async () => {
        render(
            <TOCContextMenu {...defaultProps}>
                <button type="button">TOC Item</button>
            </TOCContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('TOC Item'));

        expect(await screen.findByText('contextMenu.goToSection')).toBeInTheDocument();
        expect(await screen.findByText('contextMenu.copySectionLink')).toBeInTheDocument();
        expect(await screen.findByText('contextMenu.copySectionText')).toBeInTheDocument();
    });

    it('should call onNavigate when Go to Section is clicked', async () => {
        const onNavigate = vi.fn();

        render(
            <TOCContextMenu {...defaultProps} onNavigate={onNavigate}>
                <button type="button">TOC Item</button>
            </TOCContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('TOC Item'));

        const goToItem = await screen.findByText('contextMenu.goToSection');
        fireEvent.click(goToItem);

        expect(onNavigate).toHaveBeenCalledWith(10);
    });

    it('should copy section link to clipboard', async () => {
        render(
            <TOCContextMenu {...defaultProps}>
                <button type="button">TOC Item</button>
            </TOCContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('TOC Item'));

        const copyLinkItem = await screen.findByText('contextMenu.copySectionLink');
        fireEvent.click(copyLinkItem);

        expect(mockWriteText).toHaveBeenCalledWith('#test-heading');
    });

    it('should copy section text to clipboard', async () => {
        render(
            <TOCContextMenu {...defaultProps}>
                <button type="button">TOC Item</button>
            </TOCContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('TOC Item'));

        const copyTextItem = await screen.findByText('contextMenu.copySectionText');
        fireEvent.click(copyTextItem);

        expect(mockWriteText).toHaveBeenCalledWith('Test Heading');
    });
});
