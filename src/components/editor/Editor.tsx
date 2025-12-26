import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/utils/cn';
import { useEffect, useRef } from 'react';
import { useCodeMirror } from './hooks/useCodeMirror';
import { useEditorSync } from './hooks/useEditorSync';
import { useEditorTheme } from './hooks/useEditorTheme';

interface EditorProps {
    className?: string;
}

export function Editor({ className }: EditorProps) {
    const theme = useEditorTheme();
    const { lineNumbers, wordWrap } = useSettingsStore();
    const { content, documentId, handleChange, handleCursorChange } = useEditorSync();

    const { editorRef, setValue, focus } = useCodeMirror({
        initialContent: content,
        onChange: handleChange,
        onCursorChange: handleCursorChange,
        theme,
        lineNumbers,
        wordWrap
    });

    // Store content in ref to avoid triggering effect on every content change
    const contentRef = useRef(content);
    contentRef.current = content;

    // Store setValue in ref
    const setValueRef = useRef(setValue);
    setValueRef.current = setValue;

    // Track previous documentId to detect document switches
    const prevDocumentIdRef = useRef<string | null>(null);

    // Sync content when document changes (user switches to a different document)
    useEffect(() => {
        if (documentId && documentId !== prevDocumentIdRef.current) {
            setValueRef.current(contentRef.current);
            prevDocumentIdRef.current = documentId;
        }
    }, [documentId]);

    // Focus editor when document is available
    useEffect(() => {
        if (documentId) {
            focus();
        }
    }, [documentId, focus]);

    return (
        <div
            className={cn(
                'h-full w-full overflow-hidden',
                'bg-white dark:bg-secondary-900',
                'border-r border-secondary-200 dark:border-secondary-700',
                className
            )}
        >
            <div
                ref={editorRef as React.RefObject<HTMLDivElement>}
                className="h-full w-full [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
            />
        </div>
    );
}
