import type { Session, User } from 'better-auth';
import { Hono } from 'hono';
import { generateImage, generatePdf } from '../../utils/browser';

type Variables = {
    user: User | null;
    session: Session | null;
};

const exportRoutes = new Hono<{ Variables: Variables }>();

/**
 * POST /api/export/pdf
 * Generate PDF from HTML content
 */
exportRoutes.post('/pdf', async (c) => {
    try {
        const body = await c.req.json<{
            html: string;
            filename: string;
            options?: {
                pageSize?: 'A4' | 'Letter' | 'Legal' | 'A3';
                landscape?: boolean;
            };
        }>();

        if (!body.html || typeof body.html !== 'string') {
            return c.json({ error: 'Missing or invalid html' }, 400);
        }

        if (!body.filename || typeof body.filename !== 'string') {
            return c.json({ error: 'Missing or invalid filename' }, 400);
        }

        const pdfBuffer = await generatePdf(body.html, {
            format: body.options?.pageSize || 'A4',
            landscape: body.options?.landscape || false,
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });

        return new Response(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(body.filename)}.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
    } catch (error) {
        console.error('PDF export error:', error);
        return c.json(
            {
                error: 'Failed to generate PDF',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            500
        );
    }
});

/**
 * POST /api/export/png
 * Generate PNG image from HTML content
 */
exportRoutes.post('/png', async (c) => {
    try {
        const body = await c.req.json<{
            html: string;
            filename: string;
        }>();

        if (!body.html || typeof body.html !== 'string') {
            return c.json({ error: 'Missing or invalid html' }, 400);
        }

        if (!body.filename || typeof body.filename !== 'string') {
            return c.json({ error: 'Missing or invalid filename' }, 400);
        }

        const imageBuffer = await generateImage(body.html, {
            type: 'png',
            fullPage: true
        });

        return new Response(new Uint8Array(imageBuffer), {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(body.filename)}.png"`,
                'Content-Length': imageBuffer.length.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
    } catch (error) {
        console.error('PNG export error:', error);
        return c.json(
            {
                error: 'Failed to generate PNG',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            500
        );
    }
});

/**
 * POST /api/export/jpeg
 * Generate JPEG image from HTML content
 */
exportRoutes.post('/jpeg', async (c) => {
    try {
        const body = await c.req.json<{
            html: string;
            filename: string;
            options?: {
                quality?: number;
            };
        }>();

        if (!body.html || typeof body.html !== 'string') {
            return c.json({ error: 'Missing or invalid html' }, 400);
        }

        if (!body.filename || typeof body.filename !== 'string') {
            return c.json({ error: 'Missing or invalid filename' }, 400);
        }

        const imageBuffer = await generateImage(body.html, {
            type: 'jpeg',
            quality: body.options?.quality || 90,
            fullPage: true
        });

        return new Response(new Uint8Array(imageBuffer), {
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(body.filename)}.jpg"`,
                'Content-Length': imageBuffer.length.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
    } catch (error) {
        console.error('JPEG export error:', error);
        return c.json(
            {
                error: 'Failed to generate JPEG',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            500
        );
    }
});

export default exportRoutes;
