import { useDocumentStore } from '@/stores/documentStore';
import { cn } from '@/utils/cn';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { Copy, Download, Pencil, Trash2 } from 'lucide-react';
import type React from 'react';

interface FileContextMenuProps {
    documentId: string;
    children: React.ReactNode;
}

/**
 * Context menu for file operations
 */
export function FileContextMenu({ documentId, children }: FileContextMenuProps) {
    const { getDocument, deleteDocument, renameDocument, createDocument, documents } = useDocumentStore();

    const handleRename = () => {
        const doc = getDocument(documentId);
        if (!doc) return;

        const newName = prompt('Enter new name:', doc.name);
        if (newName?.trim()) {
            renameDocument(documentId, newName.trim(), true);
        }
    };

    const handleDuplicate = () => {
        const doc = getDocument(documentId);
        if (!doc) return;

        const newId = createDocument();
        const newDoc = documents.get(newId);
        if (newDoc) {
            renameDocument(newId, `${doc.name} (copy)`, true);
            useDocumentStore.getState().updateContent(newId, doc.content);
        }
    };

    const handleDownload = () => {
        const doc = getDocument(documentId);
        if (!doc) return;

        const blob = new Blob([doc.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.name}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDelete = () => {
        const doc = getDocument(documentId);
        if (!doc) return;

        const confirmed = confirm(`Are you sure you want to delete "${doc.name}"?`);
        if (confirmed) {
            deleteDocument(documentId);
        }
    };

    return (
        <ContextMenuPrimitive.Root>
            <ContextMenuPrimitive.Trigger asChild>{children}</ContextMenuPrimitive.Trigger>
            <ContextMenuPrimitive.Portal>
                <ContextMenuPrimitive.Content
                    className={cn(
                        'z-50 min-w-[160px] overflow-hidden rounded-md',
                        'bg-bg-primary border border-border shadow-lg',
                        'animate-in fade-in-0 zoom-in-95',
                        'p-1'
                    )}
                >
                    <ContextMenuPrimitive.Item
                        onClick={handleRename}
                        className={cn(
                            'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5',
                            'text-sm text-text-primary outline-none',
                            'focus:bg-bg-tertiary',
                            'transition-colors'
                        )}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                    </ContextMenuPrimitive.Item>

                    <ContextMenuPrimitive.Item
                        onClick={handleDuplicate}
                        className={cn(
                            'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5',
                            'text-sm text-text-primary outline-none',
                            'focus:bg-bg-tertiary',
                            'transition-colors'
                        )}
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                    </ContextMenuPrimitive.Item>

                    <ContextMenuPrimitive.Item
                        onClick={handleDownload}
                        className={cn(
                            'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5',
                            'text-sm text-text-primary outline-none',
                            'focus:bg-bg-tertiary',
                            'transition-colors'
                        )}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </ContextMenuPrimitive.Item>

                    <ContextMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-border" />

                    <ContextMenuPrimitive.Item
                        onClick={handleDelete}
                        className={cn(
                            'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5',
                            'text-sm text-red-500 outline-none',
                            'focus:bg-red-50 dark:focus:bg-red-950',
                            'transition-colors'
                        )}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </ContextMenuPrimitive.Item>
                </ContextMenuPrimitive.Content>
            </ContextMenuPrimitive.Portal>
        </ContextMenuPrimitive.Root>
    );
}
