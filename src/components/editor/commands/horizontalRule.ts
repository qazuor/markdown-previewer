import type { Command } from '@codemirror/view';

/**
 * Insert horizontal rule
 * Inserts --- with blank lines
 */
export const insertHorizontalRule: Command = (view) => {
    const { from } = view.state.selection.main;
    const line = view.state.doc.lineAt(from);

    // Add blank line before if not at start of line
    const prefix = line.from === from ? '' : '\n';
    const rule = `${prefix}\n---\n\n`;

    view.dispatch({
        changes: { from, insert: rule },
        selection: { anchor: from + rule.length }
    });

    return true;
};
