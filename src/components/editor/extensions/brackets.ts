import { bracketMatching } from '@codemirror/language';
import type { Extension } from '@codemirror/state';

/**
 * Create bracket matching extension
 */
export function createBracketMatchingExtension(): Extension {
    return bracketMatching();
}
