import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import type { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import {
    insertCodeBlock,
    insertHorizontalRule,
    insertImage,
    insertLink,
    setHeading1,
    setHeading2,
    setHeading3,
    setHeading4,
    setHeading5,
    setHeading6,
    toggleBold,
    toggleBulletList,
    toggleInlineCode,
    toggleItalic,
    toggleNumberedList,
    toggleQuote,
    toggleStrikethrough,
    toggleTaskList
} from '../commands';

/**
 * Create markdown-specific keymap
 */
export function createMarkdownKeymap(): Extension {
    return keymap.of([
        // Formatting
        { key: 'Mod-b', run: toggleBold },
        { key: 'Mod-i', run: toggleItalic },
        { key: 'Mod-Shift-s', run: toggleStrikethrough },

        // Headings
        { key: 'Mod-1', run: setHeading1 },
        { key: 'Mod-2', run: setHeading2 },
        { key: 'Mod-3', run: setHeading3 },
        { key: 'Mod-4', run: setHeading4 },
        { key: 'Mod-5', run: setHeading5 },
        { key: 'Mod-6', run: setHeading6 },

        // Links and images
        { key: 'Mod-k', run: insertLink },
        { key: 'Mod-Shift-i', run: insertImage },

        // Code
        { key: 'Mod-`', run: toggleInlineCode },
        { key: 'Mod-Shift-`', run: insertCodeBlock },

        // Quotes and lists
        { key: 'Mod-Shift-q', run: toggleQuote },
        { key: 'Mod-Shift-u', run: toggleBulletList },
        { key: 'Mod-Shift-o', run: toggleNumberedList },
        { key: 'Mod-Shift-t', run: toggleTaskList },

        // Other
        { key: 'Mod-Shift-h', run: insertHorizontalRule },

        // Tab handling
        indentWithTab
    ]);
}

/**
 * Create default keymap extension
 */
export function createDefaultKeymap(): Extension {
    return keymap.of(defaultKeymap);
}
