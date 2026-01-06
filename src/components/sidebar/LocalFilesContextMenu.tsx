import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { FilePlus, FolderPlus, Import } from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';
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
    const openNewFolderModal = useUIStore((s) => s.openNewFolderModal);

    const handleNewFolder = useCallback(() => {
        openNewFolderModal(null);
    }, [openNewFolderModal]);

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={onNewDocument}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    {t('contextMenu.newDocument')}
                </ContextMenuItem>
                <ContextMenuItem onClick={handleNewFolder}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    {t('fileExplorer.folder.new')}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onImport}>
                    <Import className="mr-2 h-4 w-4" />
                    {t('contextMenu.importFile')}
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
