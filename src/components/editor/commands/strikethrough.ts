import type { Command } from '@codemirror/view';
import { wrapSelection } from '../utils/selection';

/**
 * Toggle strikethrough formatting on selection
 * Wraps/unwraps with ~~
 */
export const toggleStrikethrough: Command = (view) => {
    wrapSelection(view, '~~', '~~', 'strikethrough text');
    return true;
};
