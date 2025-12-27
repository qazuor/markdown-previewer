import html2pdf from 'html2pdf.js';
import { generateHtmlDocument } from './html';

export interface PdfExportOptions {
    filename?: string;
    margin?: number;
    pageSize?: 'a4' | 'letter' | 'legal';
    orientation?: 'portrait' | 'landscape';
    theme?: 'light' | 'dark';
    onProgress?: (stage: string) => void;
}

/**
 * Export HTML content to PDF
 */
export async function exportToPdf(htmlContent: string, options: PdfExportOptions = {}): Promise<void> {
    const { filename = 'document.pdf', margin = 10, pageSize = 'a4', orientation = 'portrait', theme = 'light', onProgress } = options;

    // Generate a full HTML document with styles
    const fullHtml = generateHtmlDocument(htmlContent, {
        title: filename.replace(/\.pdf$/i, ''),
        includeStyles: true,
        theme
    });

    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = fullHtml;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; // A4 width for consistent rendering
    document.body.appendChild(container);

    try {
        onProgress?.('Rendering...');

        // Get page size dimensions
        const pageSizes = {
            a4: [210, 297] as const,
            letter: [215.9, 279.4] as const,
            legal: [215.9, 355.6] as const
        };
        const dimensions = pageSizes[pageSize] ?? pageSizes.a4;
        const width = dimensions[0];
        const height = dimensions[1];

        // Configure html2pdf options
        const opt = {
            margin,
            filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false
            },
            jsPDF: {
                unit: 'mm' as const,
                format: (orientation === 'landscape' ? [height, width] : [width, height]) as [number, number],
                orientation
            },
            pagebreak: { mode: 'avoid-all' as const, before: '.page-break' }
        };

        onProgress?.('Generating PDF...');

        // Generate and save PDF
        await html2pdf().set(opt).from(container).save();

        onProgress?.('Complete');
    } finally {
        // Clean up
        document.body.removeChild(container);
    }
}

/**
 * Export HTML content to PDF blob (for preview or custom handling)
 */
export async function generatePdfBlob(htmlContent: string, options: Omit<PdfExportOptions, 'filename'> = {}): Promise<Blob> {
    const { margin = 10, pageSize = 'a4', orientation = 'portrait', theme = 'light' } = options;

    const fullHtml = generateHtmlDocument(htmlContent, {
        title: 'Document',
        includeStyles: true,
        theme
    });

    const container = document.createElement('div');
    container.innerHTML = fullHtml;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm';
    document.body.appendChild(container);

    try {
        const pageSizes = {
            a4: [210, 297] as const,
            letter: [215.9, 279.4] as const,
            legal: [215.9, 355.6] as const
        };
        const dimensions = pageSizes[pageSize] ?? pageSizes.a4;
        const width = dimensions[0];
        const height = dimensions[1];

        const opt = {
            margin,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: {
                unit: 'mm' as const,
                format: (orientation === 'landscape' ? [height, width] : [width, height]) as [number, number],
                orientation
            }
        };

        const blob = await html2pdf().set(opt).from(container).outputPdf('blob');
        return blob as Blob;
    } finally {
        document.body.removeChild(container);
    }
}
