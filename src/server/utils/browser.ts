import type { Browser } from 'puppeteer-core';

/**
 * Get a Puppeteer browser instance.
 * Uses @sparticuz/chromium in Vercel, local Chrome otherwise.
 */
export async function getBrowser(): Promise<Browser> {
    if (process.env.VERCEL) {
        // Production: Use @sparticuz/chromium for Vercel serverless
        const chromium = await import('@sparticuz/chromium');
        const puppeteer = await import('puppeteer-core');

        return puppeteer.default.launch({
            args: [...chromium.default.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            defaultViewport: { width: 1200, height: 800 },
            executablePath: await chromium.default.executablePath(),
            headless: true
        });
    }

    // Development: Use local Chrome via puppeteer
    const puppeteer = await import('puppeteer');
    return puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
}

/**
 * PDF generation options
 */
export interface PdfOptions {
    format?: 'A4' | 'Letter' | 'Legal' | 'A3';
    landscape?: boolean;
    margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    printBackground?: boolean;
}

/**
 * Image generation options
 */
export interface ImageOptions {
    type: 'png' | 'jpeg';
    quality?: number; // 0-100 for jpeg
    fullPage?: boolean;
}

/**
 * Wait for page to be fully rendered including external resources
 */
async function waitForRender(page: Awaited<ReturnType<Browser['newPage']>>): Promise<void> {
    // Wait for network to be mostly idle (allows 2 pending requests for CDN resources)
    await page
        .setContent(await page.content(), {
            waitUntil: 'networkidle2'
        })
        .catch(() => {
            // Content already set, just ensuring network is idle
        });

    // Check if there are any Mermaid diagrams to render
    const hasMermaid = await page.evaluate(() => {
        const MERMAID_KEYWORDS = [
            'graph ',
            'flowchart ',
            'sequenceDiagram',
            'classDiagram',
            'stateDiagram',
            'erDiagram',
            'gantt',
            'pie ',
            'gitGraph'
        ];
        const codeBlocks = document.querySelectorAll('pre > code, pre code');
        for (const block of codeBlocks) {
            const content = (block.textContent || '').trim();
            if (block.classList.contains('language-mermaid') || MERMAID_KEYWORDS.some((k) => content.startsWith(k))) {
                return true;
            }
        }
        return false;
    });

    if (hasMermaid) {
        // Wait for Mermaid to signal completion via data attribute
        await page
            .waitForFunction(() => document.body.getAttribute('data-mermaid-rendered') === 'true', { timeout: 15000 })
            .catch(() => {
                // Timeout - Mermaid may have failed, continue anyway
                console.warn('Mermaid rendering timeout - continuing with available content');
            });
    }

    // Additional wait for fonts, styles, and any remaining async rendering
    await new Promise((resolve) => setTimeout(resolve, 1000));
}

/**
 * Generate PDF from HTML content
 */
export async function generatePdf(html: string, options: PdfOptions = {}): Promise<Buffer> {
    const browser = await getBrowser();

    try {
        const page = await browser.newPage();

        // Set content and wait for initial load
        await page.setContent(html, {
            waitUntil: ['networkidle2', 'domcontentloaded']
        });

        // Wait for full rendering including Mermaid diagrams
        await waitForRender(page);

        const pdfBuffer = await page.pdf({
            format: options.format || 'A4',
            landscape: options.landscape || false,
            printBackground: options.printBackground ?? true,
            margin: options.margin || {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await browser.close();
    }
}

/**
 * Generate image (PNG/JPEG) from HTML content
 */
export async function generateImage(html: string, options: ImageOptions): Promise<Buffer> {
    const browser = await getBrowser();

    try {
        const page = await browser.newPage();

        // Set viewport for consistent rendering
        await page.setViewport({ width: 1200, height: 800 });

        // Set content and wait for initial load
        await page.setContent(html, {
            waitUntil: ['networkidle2', 'domcontentloaded']
        });

        // Wait for full rendering including Mermaid diagrams
        await waitForRender(page);

        // Build screenshot options - quality only applies to JPEG
        const screenshotOptions =
            options.type === 'jpeg'
                ? {
                      type: 'jpeg' as const,
                      fullPage: options.fullPage ?? true,
                      quality: options.quality ?? 90
                  }
                : {
                      type: 'png' as const,
                      fullPage: options.fullPage ?? true
                  };

        const imageBuffer = await page.screenshot(screenshotOptions);

        return Buffer.from(imageBuffer);
    } finally {
        await browser.close();
    }
}
