import type { Command } from '@codemirror/view';
import { wrapSelection } from '../utils/selection';

/**
 * Toggle italic formatting on selection
 * Wraps/unwraps with *
 */
export const toggleItalic: Command = (view) => {
    wrapSelection(view, '*', '*', 'italic text');
    return true;
};
