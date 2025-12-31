import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui';
import { FilePlus, Import } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

interface LocalFilesContextMenuProps {
    children: React.ReactNode;
    onNewDocument: () => void;
    onImport: () => void;
}

/**
 * Context menu for empty area in local files panel
 */
export function LocalFilesContextMenu({ children, onNewDocument, onImport }: LocalFilesContextMenuProps) {
    const { t } = useTranslation();

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={onNewDocument}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    {t('contextMenu.newDocument')}
                </ContextMenuItem>
                <ContextMenuItem onClick={onImport}>
                    <Import className="mr-2 h-4 w-4" />
                    {t('contextMenu.importFile')}
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
