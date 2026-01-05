import { cn } from '@/utils/cn';
import { ArrowRight, ChevronLeft, ChevronRight, Cloud, Code, Eye, LayoutDashboard, PanelLeft, Timer, Wrench, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TourStep {
    id: string;
    target: string;
    title: string;
    description: string;
    tip?: string;
    icon: LucideIcon;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface FeatureTourProps {
    isActive: boolean;
    currentStep: number;
    onNext: () => void;
    onPrevious: () => void;
    onSkip: () => void;
    onComplete: () => void;
    onPause?: () => void;
}

/**
 * Feature tour that highlights UI elements
 */
export function FeatureTour({ isActive, currentStep, onNext, onPrevious, onSkip, onComplete, onPause }: FeatureTourProps) {
    const { t } = useTranslation();
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const tourSteps: TourStep[] = [
        {
            id: 'editor',
            target: '[data-tour="editor"]',
            title: t('tour.editor.title'),
            description: t('tour.editor.description'),
            tip: t('tour.editor.tip'),
            icon: Code,
            position: 'right'
        },
        {
            id: 'preview',
            target: '[data-tour="preview"]',
            title: t('tour.preview.title'),
            description: t('tour.preview.description'),
            tip: t('tour.preview.tip'),
            icon: Eye,
            position: 'left'
        },
        {
            id: 'toolbar',
            target: '[data-tour="toolbar"]',
            title: t('tour.toolbar.title'),
            description: t('tour.toolbar.description'),
            tip: t('tour.toolbar.tip'),
            icon: Wrench,
            position: 'bottom'
        },
        {
            id: 'sidebar',
            target: '[data-tour="sidebar"]',
            title: t('tour.sidebar.title'),
            description: t('tour.sidebar.description'),
            tip: t('tour.sidebar.tip'),
            icon: PanelLeft,
            position: 'right'
        },
        {
            id: 'cloud',
            target: '[data-tour="cloud"]',
            title: t('tour.cloud.title'),
            description: t('tour.cloud.description'),
            tip: t('tour.cloud.tip'),
            icon: Cloud,
            position: 'right'
        },
        {
            id: 'statusbar',
            target: '[data-tour="statusbar"]',
            title: t('tour.statusbar.title'),
            description: t('tour.statusbar.description'),
            tip: t('tour.statusbar.tip'),
            icon: LayoutDashboard,
            position: 'top'
        }
    ];

    const currentTourStep = tourSteps[currentStep];
    const isLastStep = currentStep === tourSteps.length - 1;

    // Update highlight and tooltip position when step changes
    useEffect(() => {
        if (!isActive || !currentTourStep) return;

        const updatePosition = () => {
            const targetElement = document.querySelector(currentTourStep.target);
            if (!targetElement || !tooltipRef.current) return;

            const targetRect = targetElement.getBoundingClientRect();
            setHighlightRect(targetRect);

            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const position = currentTourStep.position || 'bottom';

            let top = 0;
            let left = 0;

            const padding = 16;

            switch (position) {
                case 'top':
                    top = targetRect.top - tooltipRect.height - padding;
                    left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                    break;
                case 'bottom':
                    top = targetRect.bottom + padding;
                    left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                    break;
                case 'left':
                    top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                    left = targetRect.left - tooltipRect.width - padding;
                    break;
                case 'right':
                    top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                    left = targetRect.right + padding;
                    break;
            }

            // Keep tooltip within viewport
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (left < padding) left = padding;
            if (left + tooltipRect.width > viewportWidth - padding) {
                left = viewportWidth - tooltipRect.width - padding;
            }

            if (top < padding) top = padding;
            if (top + tooltipRect.height > viewportHeight - padding) {
                top = viewportHeight - tooltipRect.height - padding;
            }

            setTooltipPosition({ top, left });
        };

        // Initial update
        updatePosition();

        // Update on resize and scroll
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isActive, currentTourStep]);

    const animateTransition = useCallback((callback: () => void) => {
        setIsTransitioning(true);
        setTimeout(() => {
            callback();
            setTimeout(() => {
                setIsTransitioning(false);
            }, 50);
        }, 150);
    }, []);

    const handleNextWithAnimation = useCallback(() => {
        if (isTransitioning) return;
        if (isLastStep) {
            onComplete();
        } else {
            animateTransition(onNext);
        }
    }, [isLastStep, isTransitioning, onComplete, onNext, animateTransition]);

    const handlePreviousWithAnimation = useCallback(() => {
        if (isTransitioning) return;
        animateTransition(onPrevious);
    }, [isTransitioning, onPrevious, animateTransition]);

    if (!isActive || !currentTourStep) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-50 pointer-events-none">
                {/* Dark overlay with cutout */}
                <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                    <title>Tour highlight overlay</title>
                    <defs>
                        <mask id="tour-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            {highlightRect && (
                                <rect
                                    x={highlightRect.left - 4}
                                    y={highlightRect.top - 4}
                                    width={highlightRect.width + 8}
                                    height={highlightRect.height + 8}
                                    rx="8"
                                    fill="black"
                                    style={{ transition: 'all 0.2s ease-out' }}
                                />
                            )}
                        </mask>
                    </defs>
                    <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.7)" mask="url(#tour-mask)" />
                </svg>

                {/* Highlight border */}
                {highlightRect && (
                    <div
                        className="absolute border-2 border-primary-500 rounded-lg animate-pulse transition-all duration-200 ease-out"
                        style={{
                            top: highlightRect.top - 4,
                            left: highlightRect.left - 4,
                            width: highlightRect.width + 8,
                            height: highlightRect.height + 8
                        }}
                    />
                )}
            </div>

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className="fixed z-50 pointer-events-auto transition-all duration-200 ease-out"
                style={{
                    top: tooltipPosition.top,
                    left: tooltipPosition.left
                }}
            >
                <div
                    className={cn(
                        'bg-bg-primary border border-border rounded-lg shadow-xl p-5 w-80',
                        'animate-in fade-in zoom-in-95 duration-200',
                        'transition-opacity duration-150',
                        isTransitioning ? 'opacity-0' : 'opacity-100'
                    )}
                >
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onSkip}
                        className="absolute top-2 right-2 p-1 text-text-muted hover:text-text-primary transition-colors"
                        aria-label={t('common.close')}
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-500 transition-all duration-300 ease-out"
                                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium text-text-muted whitespace-nowrap">
                            {currentStep + 1} / {tourSteps.length}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                                <currentTourStep.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary">{currentTourStep.title}</h3>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">{currentTourStep.description}</p>
                        {currentTourStep.tip && (
                            <p className="text-xs text-text-muted italic flex items-center gap-1.5">
                                <Timer className="h-3 w-3" />
                                {currentTourStep.tip}
                            </p>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onSkip}
                                className="text-sm text-text-muted hover:text-text-primary transition-colors"
                            >
                                {t('tour.skip')}
                            </button>
                            {onPause && (
                                <button
                                    type="button"
                                    onClick={onPause}
                                    className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                                >
                                    {t('tour.pauseForLater')}
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {currentStep > 0 && (
                                <button
                                    type="button"
                                    onClick={handlePreviousWithAnimation}
                                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors"
                                    aria-label={t('common.previous')}
                                    disabled={isTransitioning}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleNextWithAnimation}
                                className={cn(
                                    'px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-1',
                                    'bg-primary-500 hover:bg-primary-600',
                                    isTransitioning && 'opacity-75 cursor-not-allowed'
                                )}
                                disabled={isTransitioning}
                            >
                                {isLastStep ? (
                                    <>
                                        {t('tour.finish')}
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        {t('common.next')}
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
