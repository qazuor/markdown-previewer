import { buildTocTree, extractToc } from '@/services/markdown/toc';
import { describe, expect, it } from 'vitest';

describe('toc service', () => {
    describe('extractToc', () => {
        it('should extract single heading', () => {
            const content = '# Hello World';
            const toc = extractToc(content);

            expect(toc).toHaveLength(1);
            expect(toc[0]).toMatchObject({
                level: 1,
                text: 'Hello World',
                line: 1
            });
        });

        it('should extract multiple headings', () => {
            const content = `# Heading 1
## Heading 2
### Heading 3`;
            const toc = extractToc(content);

            expect(toc).toHaveLength(3);
            expect(toc[0]?.level).toBe(1);
            expect(toc[1]?.level).toBe(2);
            expect(toc[2]?.level).toBe(3);
        });

        it('should extract all heading levels', () => {
            const content = `# H1
## H2
### H3
#### H4
##### H5
###### H6`;
            const toc = extractToc(content);

            expect(toc).toHaveLength(6);
            expect(toc.map((h) => h.level)).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it('should track correct line numbers', () => {
            const content = `
# First Heading
Some content

## Second Heading
More content

### Third Heading`;

            const toc = extractToc(content);

            expect(toc[0]?.line).toBe(2);
            expect(toc[1]?.line).toBe(5);
            expect(toc[2]?.line).toBe(8);
        });

        it('should generate unique IDs', () => {
            const content = `# Introduction
## Getting Started
### Installation`;

            const toc = extractToc(content);

            expect(toc[0]?.id).toBeTruthy();
            expect(toc[1]?.id).toBeTruthy();
            expect(toc[2]?.id).toBeTruthy();

            // IDs should be unique
            const ids = toc.map((h) => h.id);
            expect(new Set(ids).size).toBe(ids.length);
        });

        it('should generate IDs from heading text', () => {
            const content = '# Getting Started';
            const toc = extractToc(content);

            expect(toc[0]?.id).toContain('getting-started');
        });

        it('should handle special characters in headings', () => {
            const content = '# Hello, World! (Test)';
            const toc = extractToc(content);

            expect(toc[0]?.text).toBe('Hello, World! (Test)');
            expect(toc[0]?.id).toMatch(/hello-world-test/);
        });

        it('should ignore headings in code blocks', () => {
            const content = `# Real Heading

\`\`\`markdown
# Not a heading
## Also not a heading
\`\`\`

## Another Real Heading`;

            const toc = extractToc(content);

            expect(toc).toHaveLength(2);
            expect(toc[0]?.text).toBe('Real Heading');
            expect(toc[1]?.text).toBe('Another Real Heading');
        });

        it('should handle code blocks with different delimiters', () => {
            const content = `# Heading 1

~~~
# Not a heading
~~~

## Heading 2`;

            const toc = extractToc(content);

            expect(toc).toHaveLength(2);
            expect(toc.map((h) => h.text)).toEqual(['Heading 1', 'Heading 2']);
        });

        it('should handle empty content', () => {
            const toc = extractToc('');

            expect(toc).toEqual([]);
        });

        it('should handle content with no headings', () => {
            const content = `Some paragraph text
More text
Even more text`;

            const toc = extractToc(content);

            expect(toc).toEqual([]);
        });

        it('should handle headings with extra spaces', () => {
            const content = '#    Heading with spaces   ';
            const toc = extractToc(content);

            expect(toc[0]?.text).toBe('Heading with spaces');
        });

        it('should handle duplicate heading texts', () => {
            const content = `# Installation
## Setup
# Installation
## Setup`;

            const toc = extractToc(content);

            expect(toc).toHaveLength(4);
            // All IDs should be unique despite duplicate text
            const ids = toc.map((h) => h.id);
            expect(new Set(ids).size).toBe(4);
        });

        it('should handle headings without space after hash', () => {
            const content = '#NoSpace';
            const toc = extractToc(content);

            // Should not match headings without space
            expect(toc).toHaveLength(0);
        });

        it('should handle mixed content', () => {
            const content = `# Title

Some **bold** and *italic* text.

## Section 1

- List item 1
- List item 2

### Subsection

\`\`\`js
const code = true;
\`\`\`

## Section 2

> A quote

### Another Subsection`;

            const toc = extractToc(content);

            expect(toc).toHaveLength(5);
            expect(toc.map((h) => h.text)).toEqual(['Title', 'Section 1', 'Subsection', 'Section 2', 'Another Subsection']);
        });

        it('should handle headings with inline code', () => {
            const content = '# Using `const` in JavaScript';
            const toc = extractToc(content);

            expect(toc[0]?.text).toBe('Using `const` in JavaScript');
        });

        it('should handle headings with links', () => {
            const content = '# Check out [GitHub](https://github.com)';
            const toc = extractToc(content);

            expect(toc[0]?.text).toBe('Check out [GitHub](https://github.com)');
        });
    });

    describe('buildTocTree', () => {
        it('should return flat list for now', () => {
            const items = [
                { id: '1', level: 1, text: 'H1', line: 1 },
                { id: '2', level: 2, text: 'H2', line: 2 },
                { id: '3', level: 3, text: 'H3', line: 3 }
            ];

            const tree = buildTocTree(items);

            expect(tree).toEqual(items);
        });

        it('should handle empty items', () => {
            const tree = buildTocTree([]);

            expect(tree).toEqual([]);
        });
    });
});
