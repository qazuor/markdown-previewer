import { history, historyKeymap, redo, undo } from '@codemirror/commands';
import type { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';

/**
 * Create history extension for undo/redo
 * @param depth - Maximum number of undo steps to keep
 */
export function createHistoryExtension(depth = 100): Extension {
    return [history({ minDepth: depth }), keymap.of(historyKeymap)];
}

export { undo, redo };
