import { createProcessor, parseMarkdown, parseMarkdownSync } from '@/services/markdown/parser';
import { describe, expect, it } from 'vitest';

describe('markdown parser', () => {
    describe('createProcessor', () => {
        it('should create a processor instance', () => {
            const processor = createProcessor();

            expect(processor).toBeDefined();
            expect(typeof processor.process).toBe('function');
            expect(typeof processor.processSync).toBe('function');
        });
    });

    describe('parseMarkdown', () => {
        it('should parse basic markdown to HTML', async () => {
            const markdown = '# Hello World\n\nThis is a test.';
            const html = await parseMarkdown(markdown);

            expect(html).toContain('<h1>Hello World</h1>');
            expect(html).toContain('<p>This is a test.</p>');
        });

        it('should parse headings', async () => {
            const markdown = `# H1
## H2
### H3
#### H4
##### H5
###### H6`;
            const html = await parseMarkdown(markdown);

            expect(html).toContain('<h1>H1</h1>');
            expect(html).toContain('<h2>H2</h2>');
            expect(html).toContain('<h3>H3</h3>');
            expect(html).toContain('<h4>H4</h4>');
            expect(html).toContain('<h5>H5</h5>');
            expect(html).toContain('<h6>H6</h6>');
        });

        it('should parse lists', async () => {
            const markdown = `- Item 1
- Item 2
- Item 3`;
            const html = await parseMarkdown(markdown);

            expect(html).toContain('<ul>');
            expect(html).toContain('<li>Item 1</li>');
            expect(html).toContain('<li>Item 2</li>');
            expect(html).toContain('</ul>');
        });

        it('should parse ordered lists', async () => {
            const markdown = `1. First
2. Second
3. Third`;
            const html = await parseMarkdown(markdown);

            expect(html).toContain('<ol>');
            expect(html).toContain('<li>First</li>');
            expect(html).toContain('</ol>');
        });

        it('should parse links', async () => {
            const markdown = '[Example](https://example.com)';
            const html = await parseMarkdown(markdown);

            expect(html).toContain('<a');
            expect(html).toContain('href="https://example.com"');
            expect(html).toContain('Example');
        });

        it('should parse code blocks', async () => {
            const markdown = '```javascript\nconsole.log("hello");\n```';
            const html = await parseMarkdown(markdown);

            expect(html).toContain('<pre>');
            expect(html).toContain('<code');
            expect(html).toContain('console.log');
        });

        it('should parse inline code', async () => {
            const markdown = 'Use `const` for constants.';
            const html = await parseMarkdown(markdown);

            expect(html).toContain('<code>const</code>');
        });

        it('should parse blockquotes', async () => {
            const markdown = '> This is a quote';
            const html = await parseMarkdown(markdown);

            expect(html).toContain('<blockquote>');
            expect(html).toContain('This is a quote');
            expect(html).toContain('</blockquote>');
        });

        it('should parse GFM tables', async () => {
            const markdown = `| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |`;
            const html = await parseMarkdown(markdown);

            expect(html).toContain('<table>');
            expect(html).toContain('<thead>');
            expect(html).toContain('<th>Header 1</th>');
            expect(html).toContain('<td>Cell 1</td>');
        });

        it('should parse strikethrough (GFM)', async () => {
            const markdown = '~~strikethrough~~';
            const html = await parseMarkdown(markdown);

            expect(html).toContain('<del>strikethrough</del>');
        });

        it('should parse task lists (GFM)', async () => {
            const markdown = `- [ ] Unchecked
- [x] Checked`;
            const html = await parseMarkdown(markdown);

            expect(html).toContain('<input');
            expect(html).toContain('type="checkbox"');
            expect(html).toContain('checked');
        });

        it('should handle frontmatter without rendering it', async () => {
            const markdown = `---
title: Test
---
# Content`;
            const html = await parseMarkdown(markdown);

            expect(html).not.toContain('title: Test');
            expect(html).toContain('<h1>Content</h1>');
        });

        it('should sanitize potentially dangerous HTML', async () => {
            const markdown = '<script>alert("xss")</script>';
            const html = await parseMarkdown(markdown);

            expect(html).not.toContain('<script>');
        });

        it('should handle empty markdown', async () => {
            const html = await parseMarkdown('');

            expect(html).toBeDefined();
            expect(typeof html).toBe('string');
        });

        it('should handle whitespace-only markdown', async () => {
            const html = await parseMarkdown('   \n\n  ');

            expect(html).toBeDefined();
        });
    });

    describe('parseMarkdownSync', () => {
        it('should parse markdown synchronously', () => {
            const markdown = '# Sync Test';
            const html = parseMarkdownSync(markdown);

            expect(html).toContain('<h1>Sync Test</h1>');
        });

        it('should produce same output as async version', async () => {
            const markdown = '# Test\n\n- Item 1\n- Item 2';

            const asyncHtml = await parseMarkdown(markdown);
            const syncHtml = parseMarkdownSync(markdown);

            expect(syncHtml).toBe(asyncHtml);
        });

        it('should handle complex markdown', () => {
            const markdown = `# Title

## Subtitle

This is **bold** and *italic*.

\`\`\`js
const x = 42;
\`\`\`

> Quote here

- List item
`;
            const html = parseMarkdownSync(markdown);

            expect(html).toContain('<h1>Title</h1>');
            expect(html).toContain('<strong>bold</strong>');
            expect(html).toContain('<em>italic</em>');
            expect(html).toContain('<blockquote>');
        });
    });
});
