import { closeBrackets } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { useCallback, useEffect, useRef } from 'react';
import {
    createActiveLineExtension,
    createBracketMatchingExtension,
    createHistoryExtension,
    createLineNumbersExtension,
    createMarkdownExtension,
    createWordWrapExtension
} from '../extensions';
import { createDefaultKeymap, createMarkdownKeymap } from '../extensions/keymap';
import { darkEditorTheme, lightEditorTheme } from '../themes';

export interface UseCodeMirrorOptions {
    initialContent?: string;
    onChange?: (content: string) => void;
    onCursorChange?: (line: number, column: number) => void;
    theme?: 'light' | 'dark';
    lineNumbers?: boolean;
    wordWrap?: boolean;
    placeholderText?: string;
}

export interface UseCodeMirrorReturn {
    editorRef: React.RefObject<HTMLDivElement | null>;
    view: EditorView | null;
    focus: () => void;
    getValue: () => string;
    setValue: (value: string) => void;
}

export function useCodeMirror(options: UseCodeMirrorOptions = {}): UseCodeMirrorReturn {
    const {
        initialContent = '',
        onChange,
        onCursorChange,
        theme = 'light',
        lineNumbers = true,
        wordWrap = true,
        placeholderText = 'Start writing Markdown...'
    } = options;

    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const themeCompartment = useRef(new Compartment());
    const lineNumbersCompartment = useRef(new Compartment());
    const wordWrapCompartment = useRef(new Compartment());

    // Store callbacks in refs to avoid re-creating the editor
    const onChangeRef = useRef(onChange);
    const onCursorChangeRef = useRef(onCursorChange);
    onChangeRef.current = onChange;
    onCursorChangeRef.current = onCursorChange;

    // Store initial values in refs
    const initialContentRef = useRef(initialContent);
    const initialThemeRef = useRef(theme);
    const initialLineNumbersRef = useRef(lineNumbers);
    const initialWordWrapRef = useRef(wordWrap);
    const initialPlaceholderRef = useRef(placeholderText);

    // Initialize editor - only runs once
    useEffect(() => {
        if (!editorRef.current || viewRef.current) return;

        const updateListener = EditorView.updateListener.of((update) => {
            if (update.docChanged && onChangeRef.current) {
                onChangeRef.current(update.state.doc.toString());
            }

            if (update.selectionSet && onCursorChangeRef.current) {
                const pos = update.state.selection.main.head;
                const line = update.state.doc.lineAt(pos);
                onCursorChangeRef.current(line.number, pos - line.from + 1);
            }
        });

        const state = EditorState.create({
            doc: initialContentRef.current,
            extensions: [
                // Theme (compartmentalized for switching)
                themeCompartment.current.of(initialThemeRef.current === 'dark' ? darkEditorTheme : lightEditorTheme),

                // Editor configuration (compartmentalized)
                lineNumbersCompartment.current.of(createLineNumbersExtension(initialLineNumbersRef.current)),
                wordWrapCompartment.current.of(createWordWrapExtension(initialWordWrapRef.current)),

                // Core extensions
                createMarkdownExtension(),
                createActiveLineExtension(),
                createBracketMatchingExtension(),
                createHistoryExtension(),
                closeBrackets(),
                highlightSelectionMatches(),

                // Keymaps
                createMarkdownKeymap(),
                createDefaultKeymap(),
                keymap.of(searchKeymap),

                // Placeholder
                placeholder(initialPlaceholderRef.current),

                // Update listener
                updateListener
            ]
        });

        const view = new EditorView({
            state,
            parent: editorRef.current
        });

        viewRef.current = view;

        return () => {
            view.destroy();
            viewRef.current = null;
        };
    }, []);

    // Update theme when it changes
    useEffect(() => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            effects: themeCompartment.current.reconfigure(theme === 'dark' ? darkEditorTheme : lightEditorTheme)
        });
    }, [theme]);

    // Update line numbers when setting changes
    useEffect(() => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            effects: lineNumbersCompartment.current.reconfigure(createLineNumbersExtension(lineNumbers))
        });
    }, [lineNumbers]);

    // Update word wrap when setting changes
    useEffect(() => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            effects: wordWrapCompartment.current.reconfigure(createWordWrapExtension(wordWrap))
        });
    }, [wordWrap]);

    const focus = useCallback(() => {
        viewRef.current?.focus();
    }, []);

    const getValue = useCallback(() => {
        return viewRef.current?.state.doc.toString() ?? '';
    }, []);

    const setValue = useCallback((value: string) => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            changes: {
                from: 0,
                to: viewRef.current.state.doc.length,
                insert: value
            }
        });
    }, []);

    return {
        editorRef,
        view: viewRef.current,
        focus,
        getValue,
        setValue
    };
}
