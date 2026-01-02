import { cn } from '@/utils/cn';
import { FileType, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ExportFormat = 'pdf' | 'png' | 'jpeg';

interface ExportOverlayProps {
    isVisible: boolean;
    format: ExportFormat | null;
    className?: string;
}

const formatIcons: Record<ExportFormat, React.ComponentType<{ className?: string }>> = {
    pdf: FileType,
    png: Image,
    jpeg: Image
};

const formatLabels: Record<ExportFormat, string> = {
    pdf: 'PDF',
    png: 'PNG',
    jpeg: 'JPEG'
};

/**
 * Full-screen overlay shown during PDF/image export generation
 */
export function ExportOverlay({ isVisible, format, className }: ExportOverlayProps) {
    const { t } = useTranslation();

    if (!isVisible || !format) return null;

    const Icon = formatIcons[format];

    return (
        <dialog
            open
            className={cn(
                'fixed inset-0 z-[100] flex items-center justify-center',
                'bg-black/50 backdrop-blur-sm',
                'animate-in fade-in duration-200',
                'm-0 max-w-none max-h-none w-screen h-screen border-none',
                className
            )}
            aria-labelledby="export-overlay-title"
            aria-describedby="export-overlay-description"
        >
            <div
                className={cn(
                    'flex flex-col items-center gap-4 p-8 rounded-xl',
                    'bg-bg-primary border border-border shadow-2xl',
                    'animate-in zoom-in-95 duration-200'
                )}
            >
                {/* Animated icon */}
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary-500/20" />
                    <div
                        className={cn(
                            'relative flex items-center justify-center',
                            'w-16 h-16 rounded-full',
                            'bg-primary-100 dark:bg-primary-900/30'
                        )}
                    >
                        <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                </div>

                {/* Spinner */}
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-300 border-t-primary-500" />

                {/* Text */}
                <div className="text-center">
                    <h3 id="export-overlay-title" className="text-lg font-semibold text-text-primary">
                        {t('export.generating', { format: formatLabels[format] })}
                    </h3>
                    <p id="export-overlay-description" className="text-sm text-text-secondary mt-1">
                        {t('export.pleaseWait')}
                    </p>
                </div>
            </div>
        </dialog>
    );
}
