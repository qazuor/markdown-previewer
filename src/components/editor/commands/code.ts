import type { Command } from '@codemirror/view';
import { wrapSelection } from '../utils/selection';

/**
 * Toggle inline code on selection
 * Wraps/unwraps with `
 */
export const toggleInlineCode: Command = (view) => {
    wrapSelection(view, '`', '`', 'code');
    return true;
};

/**
 * Insert code block
 * Inserts ```language\n\n```
 */
export const insertCodeBlock: Command = (view) => {
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);

    const codeBlock = selectedText ? `\`\`\`\n${selectedText}\n\`\`\`` : '```language\n\n```';

    view.dispatch({
        changes: { from, to, insert: codeBlock },
        selection: {
            // Place cursor at language position or inside block
            anchor: selectedText ? from + codeBlock.length : from + 3,
            head: selectedText ? from + codeBlock.length : from + 11
        }
    });

    return true;
};
