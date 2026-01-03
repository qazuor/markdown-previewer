#!/usr/bin/env node
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
/**
 * Build API functions for Vercel deployment
 *
 * This script bundles the API functions with their dependencies
 * so that Vercel can deploy them as serverless functions.
 *
 * Source files: src/api/
 * Output files: api/ (bundled .js files)
 */
import * as esbuild from 'esbuild';

const srcApiDir = resolve('src/api');
const outApiDir = resolve('api');

// Find all TypeScript files in source api directory
function findApiFiles(dir, files = []) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            findApiFiles(fullPath, files);
        } else if (entry.endsWith('.ts')) {
            files.push(fullPath);
        }
    }
    return files;
}

const apiFiles = findApiFiles(srcApiDir);
console.log('📦 Building API functions...');

// Build each API file
for (const file of apiFiles) {
    const relativePath = file.replace(`${srcApiDir}/`, '');
    // Output to api/ folder with .js extension
    const outfile = join(outApiDir, relativePath.replace('.ts', '.js'));

    console.log(`  → ${relativePath}`);

    // Ensure output directory exists
    mkdirSync(dirname(outfile), { recursive: true });

    await esbuild.build({
        entryPoints: [file],
        bundle: true,
        platform: 'node',
        target: 'node20',
        format: 'esm',
        outfile,
        external: [
            // Don't bundle chromium binary (it's too large and has its own install)
            '@sparticuz/chromium',
            'puppeteer-core',
            'puppeteer'
        ],
        alias: {
            '@': resolve('src')
        },
        define: {
            'process.env.NODE_ENV': '"production"'
        },
        sourcemap: false,
        minify: true,
        treeShaking: true
    });

    console.log(`  ✓ Built ${outfile.replace(`${resolve('.')}/`, '')}`);
}

console.log('✅ API functions built successfully!');
