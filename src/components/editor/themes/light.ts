import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

const lightColors = {
    background: '#ffffff',
    foreground: '#1e293b',
    caret: '#0ea5e9',
    selection: '#bae6fd',
    selectionMatch: '#e0f2fe',
    lineHighlight: '#f1f5f9',
    gutterBackground: '#f8fafc',
    gutterForeground: '#94a3b8',
    gutterBorder: '#e2e8f0'
};

const lightTheme = EditorView.theme(
    {
        '&': {
            color: lightColors.foreground,
            backgroundColor: lightColors.background,
            fontSize: '14px'
        },
        '.cm-content': {
            caretColor: lightColors.caret,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            padding: '16px 0'
        },
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: lightColors.caret,
            borderLeftWidth: '2px'
        },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
            backgroundColor: lightColors.selection
        },
        '.cm-selectionMatch': {
            backgroundColor: lightColors.selectionMatch
        },
        '.cm-activeLine': {
            backgroundColor: lightColors.lineHighlight
        },
        '.cm-gutters': {
            backgroundColor: lightColors.gutterBackground,
            color: lightColors.gutterForeground,
            border: 'none',
            borderRight: `1px solid ${lightColors.gutterBorder}`
        },
        '.cm-activeLineGutter': {
            backgroundColor: lightColors.lineHighlight,
            color: lightColors.foreground
        },
        '.cm-lineNumbers .cm-gutterElement': {
            padding: '0 16px 0 8px'
        },
        '.cm-scroller': {
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
        }
    },
    { dark: false }
);

const lightHighlightStyle = HighlightStyle.define([
    // Headings
    { tag: t.heading1, color: '#0369a1', fontWeight: 'bold', fontSize: '1.5em' },
    { tag: t.heading2, color: '#0369a1', fontWeight: 'bold', fontSize: '1.3em' },
    { tag: t.heading3, color: '#0369a1', fontWeight: 'bold', fontSize: '1.1em' },
    { tag: t.heading4, color: '#0369a1', fontWeight: 'bold' },
    { tag: t.heading5, color: '#0369a1', fontWeight: 'bold' },
    { tag: t.heading6, color: '#0369a1', fontWeight: 'bold' },

    // Emphasis
    { tag: t.strong, fontWeight: 'bold', color: '#1e293b' },
    { tag: t.emphasis, fontStyle: 'italic', color: '#475569' },
    { tag: t.strikethrough, textDecoration: 'line-through', color: '#64748b' },

    // Links and URLs
    { tag: t.link, color: '#0ea5e9', textDecoration: 'underline' },
    { tag: t.url, color: '#0284c7' },

    // Code
    { tag: t.monospace, color: '#c026d3', backgroundColor: '#fdf4ff', padding: '2px 4px', borderRadius: '3px' },

    // Lists
    { tag: t.list, color: '#64748b' },

    // Quotes
    { tag: t.quote, color: '#64748b', fontStyle: 'italic' },

    // Meta and processing
    { tag: t.meta, color: '#94a3b8' },
    { tag: t.processingInstruction, color: '#64748b' },

    // Comments
    { tag: t.comment, color: '#94a3b8', fontStyle: 'italic' },

    // Content separators
    { tag: t.contentSeparator, color: '#cbd5e1' }
]);

export const lightEditorTheme: Extension = [lightTheme, syntaxHighlighting(lightHighlightStyle)];
