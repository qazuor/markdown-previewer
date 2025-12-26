import type { Command } from '@codemirror/view';
import { wrapSelection } from '../utils/selection';

/**
 * Toggle bold formatting on selection
 * Wraps/unwraps with **
 */
export const toggleBold: Command = (view) => {
    wrapSelection(view, '**', '**', 'bold text');
    return true;
};
