import { Tooltip } from '@/components/ui';
import { useDocumentStore } from '@/stores/documentStore';
import type { Folder } from '@/stores/folderStore';
import { useFolderStore } from '@/stores/folderStore';
import { cn } from '@/utils/cn';
import { ChevronDown, ChevronRight, Folder as FolderIcon, FolderOpen } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef, useCallback, useMemo } from 'react';
import type { DragItem } from './DragDropContext';
import { useDraggable, useDroppable } from './DragDropContext';
import { getIconComponent } from './NewFolderModal';

interface FolderItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    folder: Folder;
    level: number;
    children?: ReactNode;
}

/**
 * Single folder item with expand/collapse and drag-drop functionality
 */
export const FolderItem = forwardRef<HTMLDivElement, FolderItemProps>(function FolderItem(
    { folder, level, children, className, ...restProps },
    ref
) {
    const isExpanded = useFolderStore((s) => s.isExpanded(folder.id));
    const toggleExpanded = useFolderStore((s) => s.toggleExpanded);
    const setExpanded = useFolderStore((s) => s.setExpanded);
    const getChildFolders = useFolderStore((s) => s.getChildFolders);
    const updateFolder = useFolderStore((s) => s.updateFolder);
    const moveToFolder = useDocumentStore((s) => s.moveToFolder);

    const hasChildren = getChildFolders(folder.id).length > 0 || children !== undefined;

    // Drag: make folder draggable
    const dragProps = useDraggable({
        type: 'folder',
        id: folder.id,
        name: folder.name,
        currentFolderId: folder.parentId
    });

    // Drop: accept documents and folders
    const canDrop = useCallback(
        (item: DragItem) => {
            // Can't drop on itself
            if (item.type === 'folder' && item.id === folder.id) return false;
            // Can't drop a parent folder into its child
            if (item.type === 'folder') {
                // Check if target folder is a descendant of the dragged folder
                let currentId: string | null = folder.id;
                while (currentId) {
                    if (currentId === item.id) return false;
                    const currentFolder = useFolderStore.getState().folders.get(currentId);
                    currentId = currentFolder?.parentId ?? null;
                }
            }
            return true;
        },
        [folder.id]
    );

    const handleDrop = useCallback(
        (item: DragItem) => {
            if (item.type === 'document') {
                moveToFolder(item.id, folder.id);
            } else if (item.type === 'folder') {
                updateFolder(item.id, { parentId: folder.id });
            }
            // Auto-expand folder when something is dropped in
            setExpanded(folder.id, true);
        },
        [folder.id, moveToFolder, updateFolder, setExpanded]
    );

    const { isOver, ...dropProps } = useDroppable(folder.id, handleDrop, canDrop);

    const handleToggle = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            toggleExpanded(folder.id);
        },
        [folder.id, toggleExpanded]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleExpanded(folder.id);
            }
        },
        [folder.id, toggleExpanded]
    );

    // Get the icon component - use custom icon if set, otherwise default folder icon
    const Icon = useMemo(() => {
        if (folder.icon) {
            return getIconComponent(folder.icon);
        }
        return isExpanded ? FolderOpen : FolderIcon;
    }, [folder.icon, isExpanded]);

    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

    return (
        <div ref={ref} className={cn('select-none', className)} {...restProps}>
            {/* Folder row - draggable and droppable */}
            <button
                type="button"
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                style={{ paddingLeft: `${level * 12 + 4}px` }}
                className={cn(
                    'group w-full flex items-center gap-1 py-1.5 pr-2 rounded-md cursor-pointer',
                    'text-sm text-text-secondary text-left',
                    'hover:bg-bg-tertiary',
                    'transition-colors',
                    'focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500',
                    isOver && 'bg-primary-500/20 ring-1 ring-primary-500'
                )}
                {...dragProps}
                {...dropProps}
            >
                {/* Chevron for expand/collapse */}
                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                    {hasChildren ? <ChevronIcon className="h-3.5 w-3.5 text-text-muted" /> : <span className="w-3.5" />}
                </span>

                {/* Folder icon with optional color */}
                <Tooltip content={folder.name}>
                    <span className="shrink-0">
                        <Icon className="h-4 w-4" style={{ color: folder.color || 'currentColor' }} />
                    </span>
                </Tooltip>

                {/* Folder name */}
                <span className="flex-1 truncate text-text-primary">{folder.name}</span>
            </button>

            {/* Children (nested folders and documents) */}
            {isExpanded && children && <div className="folder-children">{children}</div>}
        </div>
    );
});
