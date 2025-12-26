import type { Command } from '@codemirror/view';

/**
 * Insert image syntax
 * Inserts ![alt](url)
 */
export const insertImage: Command = (view) => {
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);

    const altText = selectedText || 'alt text';
    const imageUrl = 'image-url';

    const fullImage = `![${altText}](${imageUrl})`;

    view.dispatch({
        changes: { from, to, insert: fullImage },
        selection: {
            // Place cursor at URL position
            anchor: from + altText.length + 4,
            head: from + altText.length + 4 + imageUrl.length
        }
    });

    return true;
};
