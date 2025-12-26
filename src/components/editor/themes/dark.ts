import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

const darkColors = {
    background: '#0f172a',
    foreground: '#e2e8f0',
    caret: '#38bdf8',
    selection: '#1e3a5f',
    selectionMatch: '#1e293b',
    lineHighlight: '#1e293b',
    gutterBackground: '#020617',
    gutterForeground: '#64748b',
    gutterBorder: '#334155'
};

const darkTheme = EditorView.theme(
    {
        '&': {
            color: darkColors.foreground,
            backgroundColor: darkColors.background,
            fontSize: '14px'
        },
        '.cm-content': {
            caretColor: darkColors.caret,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            padding: '16px 0'
        },
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: darkColors.caret,
            borderLeftWidth: '2px'
        },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
            backgroundColor: darkColors.selection
        },
        '.cm-selectionMatch': {
            backgroundColor: darkColors.selectionMatch
        },
        '.cm-activeLine': {
            backgroundColor: darkColors.lineHighlight
        },
        '.cm-gutters': {
            backgroundColor: darkColors.gutterBackground,
            color: darkColors.gutterForeground,
            border: 'none',
            borderRight: `1px solid ${darkColors.gutterBorder}`
        },
        '.cm-activeLineGutter': {
            backgroundColor: darkColors.lineHighlight,
            color: darkColors.foreground
        },
        '.cm-lineNumbers .cm-gutterElement': {
            padding: '0 16px 0 8px'
        },
        '.cm-scroller': {
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
        }
    },
    { dark: true }
);

const darkHighlightStyle = HighlightStyle.define([
    // Headings
    { tag: t.heading1, color: '#7dd3fc', fontWeight: 'bold', fontSize: '1.5em' },
    { tag: t.heading2, color: '#7dd3fc', fontWeight: 'bold', fontSize: '1.3em' },
    { tag: t.heading3, color: '#7dd3fc', fontWeight: 'bold', fontSize: '1.1em' },
    { tag: t.heading4, color: '#7dd3fc', fontWeight: 'bold' },
    { tag: t.heading5, color: '#7dd3fc', fontWeight: 'bold' },
    { tag: t.heading6, color: '#7dd3fc', fontWeight: 'bold' },

    // Emphasis
    { tag: t.strong, fontWeight: 'bold', color: '#f1f5f9' },
    { tag: t.emphasis, fontStyle: 'italic', color: '#cbd5e1' },
    { tag: t.strikethrough, textDecoration: 'line-through', color: '#94a3b8' },

    // Links and URLs
    { tag: t.link, color: '#38bdf8', textDecoration: 'underline' },
    { tag: t.url, color: '#0ea5e9' },

    // Code
    { tag: t.monospace, color: '#f0abfc', backgroundColor: '#4a044e', padding: '2px 4px', borderRadius: '3px' },

    // Lists
    { tag: t.list, color: '#94a3b8' },

    // Quotes
    { tag: t.quote, color: '#94a3b8', fontStyle: 'italic' },

    // Meta and processing
    { tag: t.meta, color: '#64748b' },
    { tag: t.processingInstruction, color: '#94a3b8' },

    // Comments
    { tag: t.comment, color: '#64748b', fontStyle: 'italic' },

    // Content separators
    { tag: t.contentSeparator, color: '#475569' }
]);

export const darkEditorTheme: Extension = [darkTheme, syntaxHighlighting(darkHighlightStyle)];
