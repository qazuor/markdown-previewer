import type { Command } from '@codemirror/view';
import { toggleLinePrefix } from '../utils/selection';

/**
 * Toggle bullet list on current/selected lines
 * Prefixes/unprefixes with "- "
 */
export const toggleBulletList: Command = (view) => {
    toggleLinePrefix(view, '- ');
    return true;
};

/**
 * Toggle numbered list on current/selected lines
 * Prefixes/unprefixes with "1. "
 */
export const toggleNumberedList: Command = (view) => {
    toggleLinePrefix(view, '1. ');
    return true;
};

/**
 * Toggle task list on current/selected lines
 * Prefixes/unprefixes with "- [ ] "
 */
export const toggleTaskList: Command = (view) => {
    toggleLinePrefix(view, '- [ ] ');
    return true;
};
