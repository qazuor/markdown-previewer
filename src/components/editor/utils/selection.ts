import type { ChangeSpec, EditorState } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

/**
 * Get the currently selected text
 */
export function getSelectedText(view: EditorView): string {
    const { from, to } = view.state.selection.main;
    return view.state.sliceDoc(from, to);
}

/**
 * Replace the current selection with new text
 */
export function replaceSelection(view: EditorView, text: string): void {
    const { from, to } = view.state.selection.main;
    view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length }
    });
}

/**
 * Wrap the current selection with prefix and suffix
 * @param view - Editor view
 * @param prefix - Text to add before selection
 * @param suffix - Text to add after selection
 * @param placeholder - Text to insert if no selection
 */
export function wrapSelection(view: EditorView, prefix: string, suffix: string, placeholder = ''): void {
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);

    if (selectedText) {
        // Check if already wrapped
        const prefixLen = prefix.length;
        const suffixLen = suffix.length;
        const beforePrefix = from >= prefixLen ? view.state.sliceDoc(from - prefixLen, from) : '';
        const afterSuffix = view.state.sliceDoc(to, to + suffixLen);

        if (beforePrefix === prefix && afterSuffix === suffix) {
            // Unwrap
            view.dispatch({
                changes: [
                    { from: from - prefixLen, to: from, insert: '' },
                    { from: to, to: to + suffixLen, insert: '' }
                ],
                selection: { anchor: from - prefixLen, head: to - prefixLen }
            });
        } else {
            // Wrap
            view.dispatch({
                changes: [
                    { from, insert: prefix },
                    { from: to, insert: suffix }
                ],
                selection: { anchor: from + prefixLen, head: to + prefixLen }
            });
        }
    } else {
        // No selection, insert with placeholder
        const text = `${prefix}${placeholder}${suffix}`;
        view.dispatch({
            changes: { from, to, insert: text },
            selection: { anchor: from + prefix.length, head: from + prefix.length + placeholder.length }
        });
    }
}

/**
 * Insert text at the current cursor position
 */
export function insertAtCursor(view: EditorView, text: string): void {
    const { from } = view.state.selection.main;
    view.dispatch({
        changes: { from, insert: text },
        selection: { anchor: from + text.length }
    });
}

/**
 * Get the current line content
 */
export function getCurrentLine(state: EditorState): { from: number; to: number; text: string } {
    const { from } = state.selection.main;
    const line = state.doc.lineAt(from);
    return { from: line.from, to: line.to, text: line.text };
}

/**
 * Prefix the current line with given prefix
 * If already prefixed, remove it (toggle)
 */
export function toggleLinePrefix(view: EditorView, prefix: string): void {
    const { from, to } = view.state.selection.main;
    const startLine = view.state.doc.lineAt(from);
    const endLine = view.state.doc.lineAt(to);

    const changes: ChangeSpec[] = [];
    let allPrefixed = true;

    // Check if all lines are prefixed
    for (let i = startLine.number; i <= endLine.number; i++) {
        const line = view.state.doc.line(i);
        if (!line.text.startsWith(prefix)) {
            allPrefixed = false;
            break;
        }
    }

    // Toggle prefix
    for (let i = startLine.number; i <= endLine.number; i++) {
        const line = view.state.doc.line(i);
        if (allPrefixed) {
            // Remove prefix
            changes.push({ from: line.from, to: line.from + prefix.length, insert: '' });
        } else {
            // Add prefix
            if (!line.text.startsWith(prefix)) {
                changes.push({ from: line.from, insert: prefix });
            }
        }
    }

    view.dispatch({ changes });
}

/**
 * Replace heading level on current line
 */
export function setHeadingLevel(view: EditorView, level: number): void {
    const { from } = view.state.selection.main;
    const line = view.state.doc.lineAt(from);
    const lineText = line.text;

    // Match existing heading
    const headingMatch = lineText.match(/^(#{1,6})\s/);
    const newPrefix = `${'#'.repeat(level)} `;

    if (headingMatch) {
        // Replace existing heading
        const existingLength = headingMatch[0].length;
        view.dispatch({
            changes: { from: line.from, to: line.from + existingLength, insert: newPrefix }
        });
    } else {
        // Add heading prefix
        view.dispatch({
            changes: { from: line.from, insert: newPrefix }
        });
    }
}
