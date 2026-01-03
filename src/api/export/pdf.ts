import type { VercelRequest, VercelResponse } from '@vercel/node';

// Force Node.js runtime (not Edge) for Puppeteer support
export const config = {
    runtime: 'nodejs',
    maxDuration: 60
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { html, filename, options } = req.body as {
            html: string;
            filename: string;
            options?: {
                pageSize?: 'A4' | 'Letter' | 'Legal' | 'A3';
                landscape?: boolean;
            };
        };

        // Validate input
        if (!html || typeof html !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid html' });
        }

        if (!filename || typeof filename !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid filename' });
        }

        // Dynamic import to avoid bundling issues
        const { generatePdf } = await import('@/server/utils/browser');

        const pdfBuffer = await generatePdf(html, {
            format: options?.pageSize || 'A4',
            landscape: options?.landscape || false,
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        return res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF export error:', error);
        return res.status(500).json({
            error: 'Failed to generate PDF',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
