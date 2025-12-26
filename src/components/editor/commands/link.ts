import type { Command } from '@codemirror/view';
import { getSelectedText } from '../utils/selection';

/**
 * Insert link syntax
 * If text is selected, uses it as link text
 * If URL in clipboard, auto-inserts it
 */
export const insertLink: Command = (view) => {
    const selectedText = getSelectedText(view);
    const { from, to } = view.state.selection.main;

    const linkText = selectedText || 'link text';
    const linkUrl = 'url';

    const fullLink = `[${linkText}](${linkUrl})`;

    view.dispatch({
        changes: { from, to, insert: fullLink },
        selection: {
            // Place cursor at URL position
            anchor: from + linkText.length + 3,
            head: from + linkText.length + 3 + linkUrl.length
        }
    });

    return true;
};
