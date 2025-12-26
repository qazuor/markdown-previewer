import type { Command } from '@codemirror/view';
import { toggleLinePrefix } from '../utils/selection';

/**
 * Toggle blockquote on current/selected lines
 * Prefixes/unprefixes with "> "
 */
export const toggleQuote: Command = (view) => {
    toggleLinePrefix(view, '> ');
    return true;
};
