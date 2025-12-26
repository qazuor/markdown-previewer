import { useDebounce } from '@/hooks/useDebounce';
import { useDocumentStore } from '@/stores/documentStore';
import { useCallback, useRef } from 'react';

interface UseEditorSyncOptions {
    debounceMs?: number;
}

interface UseEditorSyncReturn {
    content: string;
    documentId: string | null;
    handleChange: (newContent: string) => void;
    handleCursorChange: (line: number, column: number) => void;
}

/**
 * Hook to sync editor content with document store
 */
export function useEditorSync(options: UseEditorSyncOptions = {}): UseEditorSyncReturn {
    const { debounceMs = 300 } = options;

    const { activeDocumentId, getActiveDocument, updateContent, updateCursor } = useDocumentStore();

    const activeDocument = getActiveDocument();
    const content = activeDocument?.content ?? '';

    const pendingContent = useRef<string | null>(null);

    // Debounced update to store
    const debouncedUpdate = useDebounce((documentId: string, newContent: string) => {
        updateContent(documentId, newContent);
        pendingContent.current = null;
    }, debounceMs);

    const handleChange = useCallback(
        (newContent: string) => {
            if (!activeDocumentId) return;
            pendingContent.current = newContent;
            debouncedUpdate(activeDocumentId, newContent);
        },
        [activeDocumentId, debouncedUpdate]
    );

    const handleCursorChange = useCallback(
        (line: number, column: number) => {
            if (!activeDocumentId) return;
            updateCursor(activeDocumentId, line, column);
        },
        [activeDocumentId, updateCursor]
    );

    return {
        content: pendingContent.current ?? content,
        documentId: activeDocumentId,
        handleChange,
        handleCursorChange
    };
}
