import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui';
import type { FileTreeNode } from '@/types/github';
import { FilePlus, FolderOpen, RefreshCw, Trash2 } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Context menu for empty area in GitHub file tree
 */
interface GitHubEmptyContextMenuProps {
    children: React.ReactNode;
    onNewFile: () => void;
    onRefresh: () => void;
}

export function GitHubEmptyContextMenu({ children, onNewFile, onRefresh }: GitHubEmptyContextMenuProps) {
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
 * Context menu for folders in GitHub file tree
 */
interface GitHubFolderContextMenuProps {
    children: React.ReactNode;
    folderPath: string;
    onNewFileHere: (path: string) => void;
}

export function GitHubFolderContextMenu({ children, folderPath, onNewFileHere }: GitHubFolderContextMenuProps) {
    const { t } = useTranslation();

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={() => onNewFileHere(folderPath)}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    {t('contextMenu.newFileHere')}
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}

/**
 * Context menu for files in GitHub file tree
 */
interface GitHubFileContextMenuProps {
    children: React.ReactNode;
    node: FileTreeNode;
    onOpen: (node: FileTreeNode) => void;
    onDelete: (node: FileTreeNode) => void;
}

export function GitHubFileContextMenu({ children, node, onOpen, onDelete }: GitHubFileContextMenuProps) {
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
