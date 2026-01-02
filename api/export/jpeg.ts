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
                quality?: number;
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
        const { generateImage } = await import('../../src/server/utils/browser');

        const imageBuffer = await generateImage(html, {
            type: 'jpeg',
            quality: options?.quality || 90,
            fullPage: true
        });

        // Set response headers for JPEG download
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}.jpg"`);
        res.setHeader('Content-Length', imageBuffer.length.toString());
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        return res.send(imageBuffer);
    } catch (error) {
        console.error('JPEG export error:', error);
        return res.status(500).json({
            error: 'Failed to generate JPEG',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
