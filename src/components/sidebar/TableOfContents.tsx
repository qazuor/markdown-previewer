import { type TocItem, extractToc } from '@/services/markdown/toc';
import { cn } from '@/utils/cn';
import { useMemo } from 'react';

interface TableOfContentsProps {
    content: string;
    activeLine?: number;
    onNavigate?: (line: number) => void;
    className?: string;
}

const levelIndent: Record<number, string> = {
    1: 'pl-0',
    2: 'pl-3',
    3: 'pl-6',
    4: 'pl-9',
    5: 'pl-12',
    6: 'pl-12'
};

/**
 * Table of contents panel
 */
export function TableOfContents({ content, activeLine, onNavigate, className }: TableOfContentsProps) {
    const toc = useMemo(() => extractToc(content), [content]);

    // Find active heading based on current line
    const activeId = useMemo(() => {
        if (!activeLine) return null;

        // Find the heading that's closest to but before the active line
        let closest: TocItem | null = null;
        for (const item of toc) {
            if (item.line <= activeLine) {
                closest = item;
            } else {
                break;
            }
        }
        return closest?.id ?? null;
    }, [toc, activeLine]);

    if (toc.length === 0) {
        return (
            <div className={cn('flex flex-col h-full', className)}>
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="text-xs font-semibold uppercase text-text-muted">Table of Contents</span>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-sm text-text-muted text-center">No headings found. Add headings to see the table of contents.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-semibold uppercase text-text-muted">Table of Contents</span>
                <span className="text-xs text-text-muted">{toc.length} headings</span>
            </div>

            {/* TOC list */}
            <nav className="flex-1 overflow-y-auto p-2">
                <ul className="space-y-0.5">
                    {toc.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => onNavigate?.(item.line)}
                                className={cn(
                                    'w-full text-left px-2 py-1 rounded-md',
                                    'text-sm truncate',
                                    'hover:bg-bg-tertiary',
                                    'transition-colors',
                                    levelIndent[item.level],
                                    item.level === 1 && 'font-medium',
                                    item.id === activeId ? 'bg-bg-tertiary text-primary-500' : 'text-text-secondary'
                                )}
                            >
                                {item.text}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
