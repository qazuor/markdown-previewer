import { downloadHtml } from './download';

export interface HtmlExportOptions {
    title?: string;
    includeStyles?: boolean;
    theme?: 'light' | 'dark';
}

/**
 * Generate standalone HTML document from rendered content
 */
export function generateHtmlDocument(htmlContent: string, options: HtmlExportOptions = {}): string {
    const { title = 'Document', includeStyles = true, theme = 'light' } = options;

    const styles = includeStyles
        ? `
    <style>
      :root {
        --text-primary: ${theme === 'dark' ? '#e5e7eb' : '#111827'};
        --text-secondary: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
        --bg-primary: ${theme === 'dark' ? '#1f2937' : '#ffffff'};
        --bg-secondary: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
        --border-color: ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
        --accent-color: #3b82f6;
      }

      * {
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        line-height: 1.6;
        color: var(--text-primary);
        background: var(--bg-primary);
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }

      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
        line-height: 1.25;
      }

      h1 { font-size: 2em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
      h2 { font-size: 1.5em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
      h3 { font-size: 1.25em; }

      p { margin: 1em 0; }

      a {
        color: var(--accent-color);
        text-decoration: none;
      }
      a:hover { text-decoration: underline; }

      code {
        background: var(--bg-secondary);
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'Fira Code', Consolas, Monaco, monospace;
        font-size: 0.9em;
      }

      pre {
        background: var(--bg-secondary);
        padding: 1em;
        border-radius: 6px;
        overflow-x: auto;
      }

      pre code {
        background: none;
        padding: 0;
      }

      blockquote {
        margin: 1em 0;
        padding: 0.5em 1em;
        border-left: 4px solid var(--accent-color);
        background: var(--bg-secondary);
        color: var(--text-secondary);
      }

      ul, ol { margin: 1em 0; padding-left: 2em; }
      li { margin: 0.5em 0; }

      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
      }

      th, td {
        border: 1px solid var(--border-color);
        padding: 0.5em;
        text-align: left;
      }

      th { background: var(--bg-secondary); font-weight: 600; }

      img { max-width: 100%; height: auto; }

      hr {
        border: none;
        border-top: 1px solid var(--border-color);
        margin: 2em 0;
      }

      input[type="checkbox"] {
        margin-right: 0.5em;
      }
    </style>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="MarkView">
  <title>${escapeHtml(title)}</title>
  ${styles}
</head>
<body>
  ${htmlContent}
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/**
 * Export rendered HTML to file
 */
export function exportHtml(htmlContent: string, filename: string, options: HtmlExportOptions = {}): void {
    const document = generateHtmlDocument(htmlContent, {
        ...options,
        title: filename.replace(/\.[^.]+$/, '')
    });
    downloadHtml(document, filename);
}

/**
 * Copy HTML to clipboard
 */
export async function copyHtmlToClipboard(htmlContent: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(htmlContent);
        return true;
    } catch (error) {
        console.error('Failed to copy HTML to clipboard:', error);
        return false;
    }
}
