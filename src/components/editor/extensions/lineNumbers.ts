import type { Extension } from '@codemirror/state';
import { lineNumbers as cmLineNumbers } from '@codemirror/view';

/**
 * Create line numbers extension
 * @param enabled - Whether line numbers should be visible
 */
export function createLineNumbersExtension(enabled = true): Extension {
    if (!enabled) {
        return [];
    }
    return cmLineNumbers();
}
