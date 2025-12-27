import { renderMarkdown } from '@/services/markdown';
import { useDocumentStore } from '@/stores/documentStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/utils/cn';
import { Download, FileCode, FileText, FileType } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ExportMenuProps {
    className?: string;
}

type ExportFormat = 'markdown' | 'html' | 'pdf';

export function ExportMenu({ className }: ExportMenuProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const theme = useSettingsStore((s) => s.theme);

    const activeDocumentId = useDocumentStore((s) => s.activeDocumentId);
    const documents = useDocumentStore((s) => s.documents);
    const currentDocument = activeDocumentId ? documents.get(activeDocumentId) : null;

    const handleExport = useCallback(
        async (format: ExportFormat) => {
            if (!currentDocument || isExporting) return;

            setIsExporting(true);
            setIsOpen(false);

            try {
                const filename = currentDocument.name || 'document';
                const exportTheme = theme === 'dark' ? 'dark' : 'light';

                if (format === 'markdown') {
                    const { downloadMarkdown } = await import('@/services/export');
                    downloadMarkdown(currentDocument.content, filename);
                } else if (format === 'html') {
                    const { exportHtml } = await import('@/services/export');
                    const htmlContent = await renderMarkdown(currentDocument.content, exportTheme);
                    exportHtml(htmlContent, filename, { theme: exportTheme });
                } else if (format === 'pdf') {
                    const { exportToPdf } = await import('@/services/export');
                    const htmlContent = await renderMarkdown(currentDocument.content, exportTheme);
                    await exportToPdf(htmlContent, {
                        filename,
                        theme: exportTheme
                    });
                }
            } catch (error) {
                console.error(`Export to ${format} failed:`, error);
            } finally {
                setIsExporting(false);
            }
        },
        [currentDocument, isExporting, theme]
    );

    const exportOptions: { format: ExportFormat; icon: React.ReactNode; label: string }[] = [
        { format: 'markdown', icon: <FileText className="h-4 w-4" />, label: t('export.markdown') },
        { format: 'html', icon: <FileCode className="h-4 w-4" />, label: t('export.html') },
        { format: 'pdf', icon: <FileType className="h-4 w-4" />, label: t('export.pdf') }
    ];

    return (
        <div ref={menuRef} className={cn('relative', className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={!currentDocument || isExporting}
                className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm',
                    'hover:bg-bg-hover active:bg-bg-active',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-colors duration-150'
                )}
                title={t('common.export')}
            >
                <Download className={cn('h-4 w-4', isExporting && 'animate-pulse')} />
                <span className="hidden sm:inline">{t('common.export')}</span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close menu */}
                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop is purely visual, keyboard users can press Escape */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    {/* Dropdown menu */}
                    <div
                        className={cn(
                            'absolute top-full right-0 mt-1 z-50',
                            'min-w-[160px] py-1',
                            'bg-bg-primary border border-border rounded-lg shadow-lg',
                            'animate-in fade-in slide-in-from-top-2 duration-150'
                        )}
                    >
                        {exportOptions.map(({ format, icon, label }) => (
                            <button
                                key={format}
                                type="button"
                                onClick={() => handleExport(format)}
                                className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                                    'hover:bg-bg-hover transition-colors duration-150'
                                )}
                            >
                                {icon}
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
