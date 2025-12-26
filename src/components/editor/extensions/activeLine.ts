import type { Extension } from '@codemirror/state';
import { highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';

/**
 * Create active line highlight extension
 */
export function createActiveLineExtension(): Extension {
    return [highlightActiveLine(), highlightActiveLineGutter()];
}
