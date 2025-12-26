import { IconButton, Tooltip } from '@/components/ui';
import { useDocumentStore } from '@/stores/documentStore';
import { cn } from '@/utils/cn';
import { File, FolderOpen, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FileContextMenu } from './FileContextMenu';

interface FileExplorerProps {
    className?: string;
}

/**
 * File explorer showing local and GitHub files
 */
export function FileExplorer({ className }: FileExplorerProps) {
    const { documents, activeDocumentId, openDocument, createDocument } = useDocumentStore();
    const [filter, setFilter] = useState('');

    const filteredDocuments = useMemo(() => {
        const docs = Array.from(documents.values());
        if (!filter) return docs;

        const lowerFilter = filter.toLowerCase();
        return docs.filter((doc) => doc.name.toLowerCase().includes(lowerFilter));
    }, [documents, filter]);

    const handleNewFile = () => {
        createDocument();
    };

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-semibold uppercase text-text-muted">Explorer</span>
                <Tooltip content="New file">
                    <IconButton icon={<Plus className="h-4 w-4" />} label="New file" onClick={handleNewFile} size="sm" />
                </Tooltip>
            </div>

            {/* Search filter */}
            <div className="px-3 py-2">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Filter files..."
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

            {/* Local files section */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-2 py-1">
                    <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-text-muted">
                        <FolderOpen className="h-3.5 w-3.5" />
                        <span>LOCAL FILES</span>
                    </div>
                </div>

                {/* File list */}
                <div className="px-2">
                    {filteredDocuments.length === 0 ? (
                        <div className="px-2 py-4 text-center text-xs text-text-muted">{filter ? 'No matching files' : 'No files yet'}</div>
                    ) : (
                        filteredDocuments.map((doc) => (
                            <FileContextMenu key={doc.id} documentId={doc.id}>
                                <button
                                    type="button"
                                    onClick={() => openDocument(doc.id)}
                                    className={cn(
                                        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md',
                                        'text-sm text-left',
                                        'hover:bg-bg-tertiary',
                                        'transition-colors',
                                        doc.id === activeDocumentId && 'bg-bg-tertiary text-primary-500'
                                    )}
                                >
                                    <File className="h-4 w-4 shrink-0" />
                                    <span className="truncate flex-1">{doc.name}</span>
                                    {doc.isModified && <span className="h-2 w-2 rounded-full bg-primary-500 shrink-0" />}
                                </button>
                            </FileContextMenu>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
