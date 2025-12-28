import mermaid from 'mermaid';
import { useEffect, useId } from 'react';

// Initialize mermaid with default config
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'inherit'
});

interface MermaidProps {
    chart: string;
    className?: string;
}

/**
 * Component to render a Mermaid diagram
 */
export function Mermaid({ chart, className }: MermaidProps) {
    const id = useId().replace(/:/g, '-');

    useEffect(() => {
        const renderChart = async () => {
            const element = document.getElementById(id);
            if (!element) return;

            try {
                const { svg } = await mermaid.render(`mermaid-${id}`, chart);
                element.innerHTML = svg;
            } catch (error) {
                console.error('Mermaid render error:', error);
                element.innerHTML = `<pre class="text-red-500 text-sm p-2">Mermaid Error: ${error instanceof Error ? error.message : 'Unknown error'}</pre>`;
            }
        };

        renderChart();
    }, [id, chart]);

    return <div id={id} className={className} />;
}

/**
 * Update mermaid theme based on document theme
 */
export function updateMermaidTheme(isDark: boolean): void {
    mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit'
    });
}

// Mermaid diagram type keywords that indicate a mermaid code block
const MERMAID_KEYWORDS = [
    'graph ',
    'graph\n',
    'flowchart ',
    'flowchart\n',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'erDiagram',
    'gantt',
    'pie ',
    'pie\n',
    'gitGraph',
    'journey',
    'mindmap',
    'timeline',
    'quadrantChart',
    'sankey',
    'xychart',
    'block-beta',
    'architecture',
    'zenuml',
    'packet-beta',
    'kanban'
];

/**
 * Check if content appears to be a mermaid diagram
 */
function isMermaidContent(content: string): boolean {
    const trimmed = content.trim();
    return MERMAID_KEYWORDS.some((keyword) => trimmed.startsWith(keyword));
}

/**
 * Process mermaid code blocks in the preview HTML
 * Converts ```mermaid code blocks into rendered diagrams
 */
export async function processMermaidBlocks(container: HTMLElement, isDark: boolean): Promise<void> {
    // Update theme before processing
    updateMermaidTheme(isDark);

    // Find all code blocks - check both by class and by content
    // (Shiki may transform the class, so we also detect by content)
    const allCodeBlocks = container.querySelectorAll('pre > code, pre code');
    const mermaidBlocks: Element[] = [];

    for (const block of allCodeBlocks) {
        // Check if it has the language-mermaid class
        if (block.classList.contains('language-mermaid')) {
            mermaidBlocks.push(block);
            continue;
        }

        // Check if the content looks like mermaid (for Shiki-processed blocks)
        const content = block.textContent ?? '';
        if (isMermaidContent(content)) {
            mermaidBlocks.push(block);
        }
    }

    for (const block of mermaidBlocks) {
        const pre = block.closest('pre');
        if (!pre) continue;

        // Skip if already processed
        if (pre.classList.contains('mermaid-processed')) continue;
        pre.classList.add('mermaid-processed');

        const chart = block.textContent ?? '';
        if (!chart.trim()) continue;

        // Create container for the diagram
        const diagramContainer = document.createElement('div');
        diagramContainer.className = 'mermaid-diagram my-4 flex justify-center overflow-x-auto';

        const diagramId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

        try {
            const { svg } = await mermaid.render(diagramId, chart);
            diagramContainer.innerHTML = svg;

            // Replace the pre block with the diagram
            pre.parentNode?.replaceChild(diagramContainer, pre);
        } catch (error) {
            console.error('Mermaid render error:', error);
            diagramContainer.innerHTML = `
                <div class="border border-red-300 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-950">
                    <p class="text-red-600 dark:text-red-400 text-sm font-medium">Mermaid Diagram Error</p>
                    <pre class="text-red-500 text-xs mt-2 overflow-auto">${error instanceof Error ? error.message : 'Unknown error'}</pre>
                </div>
            `;
            pre.parentNode?.replaceChild(diagramContainer, pre);
        }
    }
}
