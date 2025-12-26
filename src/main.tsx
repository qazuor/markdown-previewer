import { App } from '@/app/App';
import { Providers } from '@/app/Providers';
import '@/styles/globals.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element not found');
}

createRoot(rootElement).render(
    <StrictMode>
        <Providers>
            <App />
        </Providers>
    </StrictMode>
);
