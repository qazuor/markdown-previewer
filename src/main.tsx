import { App } from '@/app/App';
import { PreviewWindow } from '@/app/PreviewWindow';
import { Providers } from '@/app/Providers';
import '@/styles/globals.css';
import 'katex/dist/katex.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element not found');
}

// Check if this is a preview window
const isPreviewWindow = new URLSearchParams(window.location.search).has('preview');

createRoot(rootElement).render(
    <StrictMode>
        <Providers>{isPreviewWindow ? <PreviewWindow /> : <App />}</Providers>
    </StrictMode>
);
