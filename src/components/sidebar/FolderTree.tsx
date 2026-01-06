import { EditableTabName } from '@/components/tabs/EditableTabName';
import { Tooltip } from '@/components/ui';
import { useDocumentStore } from '@/stores/documentStore';
import type { Folder } from '@/stores/folderStore';
import { useFolderStore } from '@/stores/folderStore';
import type { Document, SyncStatus } from '@/types';
import { cn } from '@/utils/cn';
import { AlertCircle, File, GitBranch, HardDrive, Loader2, X } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { DragItem } from './DragDropContext';
import { DragDropProvider, useDraggable, useDroppable } from './DragDropContext';
import { FileContextMenu } from './FileContextMenu';
import { FolderContextMenu } from './FolderContextMenu';
import { FolderItem } from './FolderItem';

/**
 * Get icon and color based on document source
 */
function getSourceIcon(source: Document['source']) {
    switch (source) {
        case 'github':
            return { icon: GitBranch, color: 'text-[#6e5494]', labelKey: 'fileExplorer.source.github' };
        case 'gdrive':
            return { icon: HardDrive, color: 'text-[#4285f4]', labelKey: 'fileExplorer.source.gdrive' };
        default:
            return { icon: File, color: 'text-text-muted', labelKey: 'fileExplorer.source.local' };
    }
}

/**
 * Get sync status indicator style
 */
function getSyncStatusStyle(status: SyncStatus) {
    switch (status) {
        case 'synced':
        case 'local':
            return { bgColor: '#22c55e', textColor: '#22c55e', labelKey: 'fileExplorer.status.synced', showDot: true };
        case 'modified':
            return { bgColor: '#f97316', textColor: '#f97316', labelKey: 'fileExplorer.status.modified', showDot: true };
        case 'syncing':
            return { bgColor: '#3b82f6', textColor: '#3b82f6', labelKey: 'fileExplorer.status.syncing', showDot: false };
        case 'cloud-pending':
            return { bgColor: '#06b6d4', textColor: '#06b6d4', labelKey: 'fileExplorer.status.cloudPending', showDot: true };
        case 'error':
            return { bgColor: '#ef4444', textColor: '#ef4444', labelKey: 'fileExplorer.status.error', showDot: false };
        default:
            return { bgColor: '#22c55e', textColor: '#22c55e', labelKey: 'fileExplorer.status.synced', showDot: true };
    }
}

interface DocumentItemProps {
    doc: Document;
    level: number;
    isActive: boolean;
    onOpen: (id: string) => void;
    onClose: (e: React.MouseEvent, id: string) => void;
}

/**
 * Single document item in the tree - draggable
 */
function DocumentItem({ doc, level, isActive, onOpen, onClose }: DocumentItemProps) {
    const { t } = useTranslation();
    const { icon: Icon, color, labelKey } = getSourceIcon(doc.source);
    const { bgColor, textColor, labelKey: statusLabelKey, showDot } = getSyncStatusStyle(doc.syncStatus);

    // Make document draggable
    const dragProps = useDraggable({
        type: 'document',
        id: doc.id,
        name: doc.name,
        currentFolderId: doc.folderId ?? null
    });

    return (
        <FileContextMenu documentId={doc.id}>
            <div
                onClick={() => onOpen(doc.id)}
                style={{ paddingLeft: `${level * 12 + 24}px` }}
                className={cn(
                    'group w-full flex items-center gap-1.5 pr-2 py-1.5 rounded-md cursor-pointer',
                    'text-sm text-left',
                    'hover:bg-bg-tertiary',
                    'transition-colors',
                    isActive && 'bg-bg-tertiary text-primary-500'
                )}
                {...dragProps}
            >
                {/* Source icon */}
                <Tooltip content={t(labelKey)} side="right">
                    <span className="shrink-0">
                        <Icon className={cn('h-4 w-4', color)} />
                    </span>
                </Tooltip>

                {/* Document name */}
                <EditableTabName documentId={doc.id} name={doc.name} isActive={isActive} className="flex-1 min-w-0" />

                {/* Sync status / Close button */}
                <div className="w-4 h-4 shrink-0 flex items-center justify-center relative">
                    {doc.syncStatus === 'syncing' ? (
                        <Tooltip content={t(statusLabelKey)}>
                            <Loader2
                                className="h-3 w-3 animate-spin group-hover:opacity-0 transition-opacity"
                                style={{ color: textColor }}
                            />
                        </Tooltip>
                    ) : doc.syncStatus === 'error' ? (
                        <Tooltip content={t(statusLabelKey)}>
                            <AlertCircle className="h-3 w-3 group-hover:opacity-0 transition-opacity" style={{ color: textColor }} />
                        </Tooltip>
                    ) : showDot ? (
                        <Tooltip content={t(statusLabelKey)}>
                            <span
                                className="h-2 w-2 rounded-full group-hover:opacity-0 transition-opacity"
                                style={{ backgroundColor: bgColor }}
                            />
                        </Tooltip>
                    ) : null}
                    {/* Close button on hover */}
                    <button
                        type="button"
                        onClick={(e) => onClose(e, doc.id)}
                        className={cn(
                            'absolute inset-0 flex items-center justify-center rounded-sm',
                            'opacity-0 group-hover:opacity-100',
                            'hover:bg-bg-secondary',
                            'transition-opacity duration-150',
                            'focus:outline-none focus-visible:opacity-100'
                        )}
                        aria-label={`Close ${doc.name}`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </FileContextMenu>
    );
}

interface FolderTreeProps {
    filter?: string;
}

/**
 * Root drop zone for moving items to root level
 */
function RootDropZone() {
    const { t } = useTranslation();
    const moveToFolder = useDocumentStore((s) => s.moveToFolder);
    const updateFolder = useFolderStore((s) => s.updateFolder);

    const handleDrop = useCallback(
        (item: DragItem) => {
            if (item.type === 'document') {
                moveToFolder(item.id, null);
            } else if (item.type === 'folder') {
                updateFolder(item.id, { parentId: null });
            }
        },
        [moveToFolder, updateFolder]
    );

    // Only allow drop if item is not already at root
    const canDrop = useCallback((item: DragItem) => {
        return item.currentFolderId !== null;
    }, []);

    const { isOver, ...dropProps } = useDroppable('__root__', handleDrop, canDrop);

    return (
        <div
            className={cn(
                'mt-2 py-2 px-2 border-2 border-dashed rounded-md text-center text-xs text-text-muted transition-colors',
                isOver ? 'border-primary-500 bg-primary-500/10 text-primary-500' : 'border-transparent'
            )}
            {...dropProps}
        >
            {isOver ? t('fileExplorer.folder.moveToRoot') : ''}
        </div>
    );
}

/**
 * Hierarchical folder tree with documents
 */
function FolderTreeContent({ filter }: FolderTreeProps) {
    const { t } = useTranslation();
    const folders = useFolderStore((s) => s.folders);
    const getRootFolders = useFolderStore((s) => s.getRootFolders);
    const getChildFolders = useFolderStore((s) => s.getChildFolders);

    const documents = useDocumentStore((s) => s.documents);
    const activeDocumentId = useDocumentStore((s) => s.activeDocumentId);
    const openDocument = useDocumentStore((s) => s.openDocument);
    const closeDocument = useDocumentStore((s) => s.closeDocument);
    const getDocumentsByFolder = useDocumentStore((s) => s.getDocumentsByFolder);

    const handleCloseDocument = useCallback(
        (e: React.MouseEvent, docId: string) => {
            e.stopPropagation();
            closeDocument(docId);
        },
        [closeDocument]
    );

    // Filter documents if filter is provided
    const filterDocument = useCallback(
        (doc: Document) => {
            if (!filter) return true;
            return doc.name.toLowerCase().includes(filter.toLowerCase());
        },
        [filter]
    );

    // Render documents for a specific folder
    const renderDocuments = useCallback(
        (folderId: string | null, level: number) => {
            const docs = getDocumentsByFolder(folderId).filter(filterDocument);
            return docs.map((doc) => (
                <DocumentItem
                    key={doc.id}
                    doc={doc}
                    level={level}
                    isActive={doc.id === activeDocumentId}
                    onOpen={openDocument}
                    onClose={handleCloseDocument}
                />
            ));
        },
        [getDocumentsByFolder, filterDocument, activeDocumentId, openDocument, handleCloseDocument]
    );

    // Recursive render of folder tree
    const renderFolder = useCallback(
        (folder: Folder, level: number) => {
            const childFolders = getChildFolders(folder.id);
            const folderDocs = getDocumentsByFolder(folder.id).filter(filterDocument);

            // If filter is active and no matching content, hide the folder
            if (filter && childFolders.length === 0 && folderDocs.length === 0) {
                return null;
            }

            return (
                <FolderContextMenu key={folder.id} folder={folder}>
                    <FolderItem folder={folder} level={level}>
                        {/* Nested folders */}
                        {childFolders.map((child) => renderFolder(child, level + 1))}
                        {/* Documents in this folder */}
                        {renderDocuments(folder.id, level + 1)}
                    </FolderItem>
                </FolderContextMenu>
            );
        },
        [getChildFolders, getDocumentsByFolder, filterDocument, filter, renderDocuments]
    );

    const rootFolders = getRootFolders();
    const rootDocuments = getDocumentsByFolder(null).filter(filterDocument);
    const hasContent = rootFolders.length > 0 || rootDocuments.length > 0 || folders.size > 0;

    // If filtering and no results
    if (filter && rootFolders.length === 0 && rootDocuments.length === 0) {
        // Check if there are any matching documents in subfolders
        const allDocs = Array.from(documents.values()).filter(filterDocument);
        if (allDocs.length === 0) {
            return <div className="px-2 py-4 text-center text-xs text-text-muted">{t('fileExplorer.noMatchingFiles')}</div>;
        }
    }

    // No content at all
    if (!hasContent && !filter) {
        return <div className="px-2 py-4 text-center text-xs text-text-muted">{t('sidebar.noFiles')}</div>;
    }

    return (
        <div className="folder-tree">
            {/* Root folders */}
            {rootFolders.map((folder) => renderFolder(folder, 0))}
            {/* Root documents (not in any folder) */}
            {renderDocuments(null, 0)}
            {/* Root drop zone - only visible when dragging */}
            <RootDropZone />
        </div>
    );
}

/**
 * FolderTree wrapped with DragDropProvider
 */
export function FolderTree({ filter }: FolderTreeProps) {
    return (
        <DragDropProvider>
            <FolderTreeContent filter={filter} />
        </DragDropProvider>
    );
}
