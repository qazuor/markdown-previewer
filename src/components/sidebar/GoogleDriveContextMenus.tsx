import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui';
import type { DriveFileTreeNode } from '@/types/gdrive';
import { FilePlus, FolderOpen, RefreshCw, Trash2 } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Context menu for empty area in Google Drive file tree
 */
interface GoogleDriveEmptyContextMenuProps {
    children: React.ReactNode;
    onNewFile: () => void;
    onRefresh: () => void;
}

export function GoogleDriveEmptyContextMenu({ children, onNewFile, onRefresh }: GoogleDriveEmptyContextMenuProps) {
    const { t } = useTranslation();

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={onNewFile}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    {t('contextMenu.newFile')}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onRefresh}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('contextMenu.refresh')}
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}

/**
 * Context menu for folders in Google Drive file tree
 */
interface GoogleDriveFolderContextMenuProps {
    children: React.ReactNode;
    folderId: string;
    folderName: string;
    onNewFileHere: (folderId: string, folderName: string) => void;
}

export function GoogleDriveFolderContextMenu({ children, folderId, folderName, onNewFileHere }: GoogleDriveFolderContextMenuProps) {
    const { t } = useTranslation();

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={() => onNewFileHere(folderId, folderName)}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    {t('contextMenu.newFileHere')}
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}

/**
 * Context menu for files in Google Drive file tree
 */
interface GoogleDriveFileContextMenuProps {
    children: React.ReactNode;
    node: DriveFileTreeNode;
    onOpen: (node: DriveFileTreeNode) => void;
    onDelete: (node: DriveFileTreeNode) => void;
}

export function GoogleDriveFileContextMenu({ children, node, onOpen, onDelete }: GoogleDriveFileContextMenuProps) {
    const { t } = useTranslation();

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={() => onOpen(node)} disabled={!node.isMarkdown}>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    {t('contextMenu.openFile')}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => onDelete(node)} className="text-red-500 focus:text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('contextMenu.deleteFile')}
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
