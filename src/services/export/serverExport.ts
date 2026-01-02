/**
 * Server-side export utilities
 * Used to prepare HTML for Puppeteer rendering
 */

export interface ServerExportOptions {
    title?: string;
    theme?: 'light' | 'dark';
}

/**
 * Get comprehensive styles for PDF/Image export
 * These styles match the GitHub preview theme exactly
 */
function getExportStyles(theme: 'light' | 'dark'): string {
    // GitHub theme colors - matching src/styles/preview-themes/github.css
    const colors =
        theme === 'dark'
            ? {
                  bg: '#0d1117',
                  text: '#e6edf3',
                  textMuted: '#8d96a0',
                  link: '#4493f8',
                  border: '#3d444d',
                  codeBg: '#161b22',
                  codeText: '#e6edf3',
                  blockquoteBorder: '#3d444d',
                  blockquoteText: '#8d96a0',
                  tableBorder: '#3d444d',
                  tableHeaderBg: '#161b22',
                  hr: '#3d444db3'
              }
            : {
                  bg: '#ffffff',
                  text: '#1f2328',
                  textMuted: '#656d76',
                  link: '#0969da',
                  border: '#d1d9e0',
                  codeBg: '#f6f8fa',
                  codeText: '#1f2328',
                  blockquoteBorder: '#d1d9e0',
                  blockquoteText: '#656d76',
                  tableBorder: '#d1d9e0',
                  tableHeaderBg: '#f6f8fa',
                  hr: '#d1d9e0b3'
              };

    return `
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        html, body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: ${colors.text};
            background-color: ${colors.bg} !important;
        }

        .export-content {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background-color: ${colors.bg};
        }

        /* Headings */
        h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
            line-height: 1.25;
            color: ${colors.text};
        }

        h1 {
            font-size: 2em;
            border-bottom: 1px solid ${colors.border};
            padding-bottom: 0.3em;
        }

        h2 {
            font-size: 1.5em;
            border-bottom: 1px solid ${colors.border};
            padding-bottom: 0.3em;
        }

        h3 { font-size: 1.25em; }
        h4 { font-size: 1em; }
        h5 { font-size: 0.875em; }
        h6 { font-size: 0.85em; color: ${colors.textMuted}; }

        /* Paragraphs */
        p {
            margin-top: 0;
            margin-bottom: 1em;
        }

        /* Links */
        a {
            color: ${colors.link};
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        /* Code */
        code {
            background-color: ${colors.codeBg};
            color: ${colors.codeText};
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-family: "JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace;
            font-size: 0.875em;
        }

        pre {
            background-color: ${colors.codeBg};
            padding: 1em;
            border-radius: 6px;
            overflow-x: auto;
            margin: 1em 0;
            font-size: 0.875em;
            line-height: 1.45;
        }

        pre code {
            background: transparent;
            padding: 0;
            font-size: inherit;
            border-radius: 0;
        }

        /* Blockquotes */
        blockquote {
            margin: 0 0 1em 0;
            padding: 0 1em;
            border-left: 4px solid ${colors.blockquoteBorder};
            color: ${colors.blockquoteText};
        }

        blockquote > :first-child {
            margin-top: 0;
        }

        blockquote > :last-child {
            margin-bottom: 0;
        }

        /* Lists */
        ul, ol {
            margin-top: 0;
            margin-bottom: 1em;
            padding-left: 2em;
        }

        li {
            margin-bottom: 0.25em;
        }

        li > p {
            margin-bottom: 0.5em;
        }

        li > ul, li > ol {
            margin: 0.25em 0;
        }

        /* Task lists */
        input[type="checkbox"] {
            margin-right: 0.5em;
            vertical-align: middle;
        }

        /* Tables */
        table {
            border-collapse: collapse;
            border-spacing: 0;
            width: 100%;
            margin-bottom: 1em;
        }

        th, td {
            border: 1px solid ${colors.tableBorder};
            padding: 0.5em 1em;
            text-align: left;
        }

        th {
            background-color: ${colors.tableHeaderBg};
            font-weight: 600;
        }

        /* Horizontal rules */
        hr {
            height: 2px;
            margin: 1.5em 0;
            padding: 0;
            border: 0;
            background-color: ${colors.hr};
        }

        /* Images */
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1em 0;
        }

        /* Callouts - GitHub-style alerts */
        .callout {
            padding: 1em;
            border-radius: 6px;
            margin: 1em 0;
            border-left: 4px solid;
        }

        .callout-note {
            background: ${theme === 'dark' ? '#0d1d31' : '#ddf4ff'};
            border-color: #0969da;
            color: ${theme === 'dark' ? '#a5d6ff' : '#0969da'};
        }

        .callout-warning {
            background: ${theme === 'dark' ? '#2a2100' : '#fff8c5'};
            border-color: #9a6700;
            color: ${theme === 'dark' ? '#d4a72c' : '#9a6700'};
        }

        .callout-tip {
            background: ${theme === 'dark' ? '#04260f' : '#d1f7c4'};
            border-color: #1a7f37;
            color: ${theme === 'dark' ? '#56d364' : '#1a7f37'};
        }

        .callout-important {
            background: ${theme === 'dark' ? '#271030' : '#fbefff'};
            border-color: #8250df;
            color: ${theme === 'dark' ? '#d2a8ff' : '#8250df'};
        }

        .callout-caution {
            background: ${theme === 'dark' ? '#2d0d0d' : '#ffebe9'};
            border-color: #cf222e;
            color: ${theme === 'dark' ? '#ff7b72' : '#cf222e'};
        }

        /* Mermaid diagrams */
        .mermaid, .mermaid-diagram {
            text-align: center;
            margin: 1em 0;
            background-color: ${colors.bg};
        }

        /* KaTeX math */
        .katex {
            font-size: 1.1em;
            color: ${colors.text};
        }

        .katex-display {
            margin: 1em 0;
            overflow-x: auto;
        }

        /* Syntax highlighting - ensure visibility */
        pre[style], code[style] {
            color: inherit;
        }

        /* Print styles - preserve colors for PDF */
        @media print {
            html, body {
                background-color: ${colors.bg} !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            pre, code {
                white-space: pre-wrap !important;
                word-break: break-word !important;
            }

            .page-break {
                page-break-before: always;
            }
        }
    `;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/**
 * CDN URLs for external dependencies
 */
const KATEX_VERSION = '0.16.11';
const KATEX_CSS_CDN = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css`;

const MERMAID_VERSION = '10.9.1';
const MERMAID_JS_CDN = `https://cdn.jsdelivr.net/npm/mermaid@${MERMAID_VERSION}/dist/mermaid.min.js`;

/**
 * Get Mermaid initialization script
 * Processes mermaid code blocks and renders them as SVG diagrams
 * Uses traditional script loading for better Puppeteer compatibility
 */
function getMermaidScript(theme: 'light' | 'dark'): string {
    const mermaidTheme = theme === 'dark' ? 'dark' : 'default';

    return `
    <script src="${MERMAID_JS_CDN}"></script>
    <script>
        (function() {
            // Mermaid diagram keywords
            var MERMAID_KEYWORDS = [
                'graph ', 'graph\\n', 'flowchart ', 'flowchart\\n',
                'sequenceDiagram', 'classDiagram', 'stateDiagram',
                'erDiagram', 'gantt', 'pie ', 'pie\\n', 'gitGraph',
                'journey', 'mindmap', 'timeline', 'quadrantChart',
                'sankey', 'xychart', 'block-beta', 'architecture',
                'zenuml', 'packet-beta', 'kanban'
            ];

            function isMermaidContent(content) {
                var trimmed = content.trim();
                return MERMAID_KEYWORDS.some(function(k) { return trimmed.startsWith(k); });
            }

            function renderMermaidBlocks() {
                // Initialize mermaid
                mermaid.initialize({
                    startOnLoad: false,
                    theme: '${mermaidTheme}',
                    securityLevel: 'loose',
                    fontFamily: 'inherit'
                });

                var codeBlocks = document.querySelectorAll('pre > code, pre code');
                var promises = [];

                codeBlocks.forEach(function(block) {
                    var content = block.textContent || '';
                    var isMermaid = block.classList.contains('language-mermaid') || isMermaidContent(content);

                    if (!isMermaid) return;

                    var pre = block.closest('pre');
                    if (!pre || pre.classList.contains('mermaid-processed')) return;
                    pre.classList.add('mermaid-processed');

                    var chart = content.trim();
                    if (!chart) return;

                    var container = document.createElement('div');
                    container.className = 'mermaid-diagram';
                    container.style.textAlign = 'center';
                    container.style.margin = '1em 0';

                    var id = 'mermaid-' + Math.random().toString(36).substring(2, 9);

                    var promise = mermaid.render(id, chart).then(function(result) {
                        container.innerHTML = result.svg;
                        pre.parentNode.replaceChild(container, pre);
                    }).catch(function(error) {
                        container.innerHTML = '<pre style="color: red; font-size: 0.8em;">Mermaid Error: ' + error.message + '</pre>';
                        pre.parentNode.replaceChild(container, pre);
                    });

                    promises.push(promise);
                });

                // Wait for all diagrams to render
                Promise.all(promises).then(function() {
                    // Signal that rendering is complete
                    document.body.setAttribute('data-mermaid-rendered', 'true');
                });
            }

            // Run when mermaid is loaded and DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', renderMermaidBlocks);
            } else {
                renderMermaidBlocks();
            }
        })();
    </script>`;
}

/**
 * Wrap HTML content for server-side export (PDF/Image)
 * Creates a complete HTML document with all necessary styles
 */
export function wrapHtmlForExport(htmlContent: string, options: ServerExportOptions = {}): string {
    const { title = 'Document', theme = 'light' } = options;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="MarkView">
    <title>${escapeHtml(title)}</title>
    <!-- KaTeX CSS for math rendering -->
    <link rel="stylesheet" href="${KATEX_CSS_CDN}" crossorigin="anonymous">
    <style>
        ${getExportStyles(theme)}
    </style>
</head>
<body>
    <div class="export-content">
        ${htmlContent}
    </div>
    <!-- Mermaid.js for diagram rendering -->
    ${getMermaidScript(theme)}
</body>
</html>`;
}

/**
 * Export request body type
 */
export interface ExportRequestBody {
    html: string;
    filename: string;
    theme: 'light' | 'dark';
    options?: {
        pageSize?: 'A4' | 'Letter' | 'Legal' | 'A3';
        landscape?: boolean;
        quality?: number;
    };
}

/**
 * Validate export request body
 */
export function validateExportRequest(body: unknown): body is ExportRequestBody {
    if (!body || typeof body !== 'object') return false;

    const { html, filename, theme } = body as Record<string, unknown>;

    if (typeof html !== 'string' || html.length === 0) return false;
    if (typeof filename !== 'string' || filename.length === 0) return false;
    if (theme !== 'light' && theme !== 'dark') return false;

    return true;
}
