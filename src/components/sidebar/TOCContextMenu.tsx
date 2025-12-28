import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui';
import { ClipboardCopy, Hash, Navigation } from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface TOCContextMenuProps {
    children: React.ReactNode;
    headingId: string;
    headingText: string;
    headingLine: number;
    onNavigate: (line: number) => void;
}

/**
 * Context menu for TOC items
 */
export function TOCContextMenu({ children, headingId, headingText, headingLine, onNavigate }: TOCContextMenuProps) {
    const { t } = useTranslation();

    const handleGoToSection = useCallback(() => {
        onNavigate(headingLine);
    }, [headingLine, onNavigate]);

    const handleCopySectionLink = useCallback(async () => {
        // Create anchor link (slug format)
        const anchor = `#${headingId}`;
        await navigator.clipboard.writeText(anchor);
    }, [headingId]);

    const handleCopySectionText = useCallback(async () => {
        await navigator.clipboard.writeText(headingText);
    }, [headingText]);

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-52">
                <ContextMenuItem onClick={handleGoToSection}>
                    <Navigation className="mr-2 h-4 w-4" />
                    {t('contextMenu.goToSection')}
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem onClick={handleCopySectionLink}>
                    <Hash className="mr-2 h-4 w-4" />
                    {t('contextMenu.copySectionLink')}
                </ContextMenuItem>

                <ContextMenuItem onClick={handleCopySectionText}>
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    {t('contextMenu.copySectionText')}
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
