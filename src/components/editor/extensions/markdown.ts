import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import type { Extension } from '@codemirror/state';

/**
 * Create Markdown language extension with GFM support
 */
export function createMarkdownExtension(): Extension {
    return markdown({
        base: markdownLanguage,
        codeLanguages: languages,
        addKeymap: true
    });
}
