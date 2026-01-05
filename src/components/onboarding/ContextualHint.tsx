import { cn } from '@/utils/cn';
import { Lightbulb, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ContextualHintProps {
    message: string;
    position: { x: number; y: number };
    onDismiss: () => void;
}

/**
 * A small, non-intrusive tooltip that appears near the cursor
 * to provide helpful tips for first-time actions
 */
export function ContextualHint({ message, position, onDismiss }: ContextualHintProps) {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [adjustedPosition, setAdjustedPosition] = useState(position);

    // Animate in
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // Adjust position to stay within viewport
    useEffect(() => {
        const padding = 16;
        const tooltipWidth = 280;
        const tooltipHeight = 80;

        let { x, y } = position;

        // Adjust horizontal position
        if (x + tooltipWidth > window.innerWidth - padding) {
            x = window.innerWidth - tooltipWidth - padding;
        }
        if (x < padding) {
            x = padding;
        }

        // Prefer showing below cursor, but flip if near bottom
        if (y + tooltipHeight > window.innerHeight - padding) {
            y = position.y - tooltipHeight - 20;
        } else {
            y = position.y + 20;
        }

        setAdjustedPosition({ x, y });
    }, [position]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 150);
    };

    return (
        <div
            className={cn(
                'fixed z-50 pointer-events-auto',
                'transition-all duration-150 ease-out',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            )}
            style={{
                left: adjustedPosition.x,
                top: adjustedPosition.y
            }}
        >
            <div className="bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-lg shadow-lg p-3 max-w-[280px]">
                <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-primary-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary-900 dark:text-primary-100">{message}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="p-0.5 text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors flex-shrink-0"
                        aria-label={t('common.close')}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
                <button
                    type="button"
                    onClick={handleDismiss}
                    className="mt-2 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
                >
                    {t('hints.dismiss')}
                </button>
            </div>
        </div>
    );
}
