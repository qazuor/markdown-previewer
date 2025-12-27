import { saveAs } from 'file-saver';

export interface DownloadOptions {
    filename: string;
    mimeType: string;
}

/**
 * Sanitize filename for download
 */
export function sanitizeFilename(filename: string): string {
    // Remove invalid characters for most file systems
    // Filter out control characters (0-31) and special chars
    let result = '';
    for (const char of filename) {
        const code = char.charCodeAt(0);
        // Skip control characters and invalid filename chars
        if (code >= 32 && !'<>:"/\\|?*'.includes(char)) {
            result += char;
        }
    }
    return result.replace(/\s+/g, '-').trim().substring(0, 200);
}

/**
 * Ensure filename has the correct extension
 */
export function ensureExtension(filename: string, extension: string): string {
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    if (!filename.toLowerCase().endsWith(ext.toLowerCase())) {
        return `${filename}${ext}`;
    }
    return filename;
}

/**
 * Download content as a file
 */
export function downloadFile(content: string | Blob, options: DownloadOptions): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: options.mimeType });
    const filename = ensureExtension(sanitizeFilename(options.filename), options.filename.split('.').pop() ?? '');
    saveAs(blob, filename);
}

/**
 * Download markdown content
 */
export function downloadMarkdown(content: string, filename: string): void {
    downloadFile(content, {
        filename: ensureExtension(filename, '.md'),
        mimeType: 'text/markdown;charset=utf-8'
    });
}

/**
 * Download HTML content
 */
export function downloadHtml(content: string, filename: string): void {
    downloadFile(content, {
        filename: ensureExtension(filename, '.html'),
        mimeType: 'text/html;charset=utf-8'
    });
}

/**
 * Download PDF blob
 */
export function downloadPdf(blob: Blob, filename: string): void {
    saveAs(blob, ensureExtension(sanitizeFilename(filename), '.pdf'));
}
