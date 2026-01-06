import { IconButton, Tooltip } from '@/components/ui';
import { useFileImport } from '@/hooks';
import { useDocumentStore } from '@/stores/documentStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { FolderOpen, FolderPlus, Plus, Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderTree } from './FolderTree';
import { LocalFilesContextMenu } from './LocalFilesContextMenu';
import { NewFolderModal } from './NewFolderModal';

interface FileExplorerProps {
    className?: string;
}

/**
 * File explorer showing documents organized in folders
 */
export function FileExplorer({ className }: FileExplorerProps) {
    const { t } = useTranslation();
    const createDocument = useDocumentStore((s) => s.createDocument);
    const setPendingRenameDocumentId = useUIStore((s) => s.setPendingRenameDocumentId);
    const openNewFolderModal = useUIStore((s) => s.openNewFolderModal);
    const { openFileDialog } = useFileImport();
    const [filter, setFilter] = useState('');

    const handleNewFile = useCallback(() => {
        const id = createDocument();
        setPendingRenameDocumentId(id);
    }, [createDocument, setPendingRenameDocumentId]);

    const handleNewFolder = useCallback(() => {
        openNewFolderModal(null);
    }, [openNewFolderModal]);

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-semibold uppercase text-text-muted">{t('sidebar.explorer')}</span>
                <div className="flex items-center gap-1">
                    <Tooltip content={t('fileExplorer.folder.new')}>
                        <IconButton
                            icon={<FolderPlus className="h-4 w-4" />}
                            label={t('fileExplorer.folder.new')}
                            onClick={handleNewFolder}
                            size="sm"
                        />
                    </Tooltip>
                    <Tooltip content={t('common.new')}>
                        <IconButton icon={<Plus className="h-4 w-4" />} label={t('common.new')} onClick={handleNewFile} size="sm" />
                    </Tooltip>
                </div>
            </div>

            {/* Search filter */}
            <div className="px-3 py-2">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <input
                        type="text"
                        placeholder={t('fileExplorer.filterPlaceholder')}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className={cn(
                            'w-full pl-7 pr-3 py-1.5',
                            'text-sm bg-bg-tertiary rounded-md',
                            'border border-transparent',
                            'focus:outline-none focus:border-primary-500',
                            'placeholder:text-text-muted'
                        )}
                    />
                </div>
            </div>

            {/* Documents section */}
            <LocalFilesContextMenu onNewDocument={handleNewFile} onImport={openFileDialog}>
                <div className="flex-1 overflow-y-auto">
                    <div className="px-2 py-1">
                        <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-text-muted">
                            <FolderOpen className="h-3.5 w-3.5" />
                            <span>{t('fileExplorer.documents')}</span>
                        </div>
                    </div>

                    {/* Folder tree with documents */}
                    <div className="px-2">
                        <FolderTree filter={filter} />
                    </div>
                </div>
            </LocalFilesContextMenu>

            {/* New folder modal */}
            <NewFolderModal />
        </div>
    );
}
