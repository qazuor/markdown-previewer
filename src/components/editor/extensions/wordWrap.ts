import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

/**
 * Create word wrap extension
 * @param enabled - Whether word wrap should be enabled
 */
export function createWordWrapExtension(enabled = true): Extension {
    if (!enabled) {
        return [];
    }
    return EditorView.lineWrapping;
}
