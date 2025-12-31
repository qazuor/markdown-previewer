import { OnboardingModal } from '@/components/modals/OnboardingModal';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock Modal component
vi.mock('@/components/ui/Modal', () => ({
    Modal: ({
        children,
        isOpen,
        onClose
    }: {
        children: React.ReactNode;
        isOpen: boolean;
        onClose: () => void;
        size?: string;
    }) =>
        isOpen ? (
            <dialog open data-testid="modal">
                <button type="button" onClick={onClose} data-testid="modal-close">
                    Close
                </button>
                {children}
            </dialog>
        ) : null,
    ModalFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <footer data-testid="modal-footer" className={className}>
            {children}
        </footer>
    )
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    ArrowRight: () => <span data-testid="icon-arrow-right" />,
    Check: () => <span data-testid="icon-check" />,
    ChevronLeft: () => <span data-testid="icon-chevron-left" />,
    ChevronRight: () => <span data-testid="icon-chevron-right" />,
    Cloud: () => <span data-testid="icon-cloud" />,
    Code: () => <span data-testid="icon-code" />,
    Eye: () => <span data-testid="icon-eye" />,
    Keyboard: () => <span data-testid="icon-keyboard" />,
    ListTree: () => <span data-testid="icon-list-tree" />,
    Zap: () => <span data-testid="icon-zap" />
}));

describe('OnboardingModal', () => {
    const mockOnClose = vi.fn();
    const mockOnComplete = vi.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onComplete: mockOnComplete
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render when open', () => {
            render(<OnboardingModal {...defaultProps} />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('should not render when closed', () => {
            render(<OnboardingModal {...defaultProps} isOpen={false} />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('should show progress indicator', () => {
            render(<OnboardingModal {...defaultProps} />);

            // 3 steps = 3 progress indicators
            const progressBars = document.querySelectorAll('.h-1.flex-1.rounded-full');
            expect(progressBars).toHaveLength(3);
        });

        it('should show welcome step by default', () => {
            render(<OnboardingModal {...defaultProps} />);

            expect(screen.getByText('onboarding.welcome.title')).toBeInTheDocument();
            expect(screen.getByText('onboarding.welcome.subtitle')).toBeInTheDocument();
        });

        it('should show zap icon on welcome step', () => {
            render(<OnboardingModal {...defaultProps} />);

            expect(screen.getByTestId('icon-zap')).toBeInTheDocument();
        });

        it('should show features list on welcome step', () => {
            render(<OnboardingModal {...defaultProps} />);

            expect(screen.getByText('onboarding.welcome.features.realtime')).toBeInTheDocument();
            expect(screen.getByText('onboarding.welcome.features.syntax')).toBeInTheDocument();
            expect(screen.getByText('onboarding.welcome.features.diagrams')).toBeInTheDocument();
            expect(screen.getByText('onboarding.welcome.features.math')).toBeInTheDocument();
        });
    });

    describe('step navigation', () => {
        it('should navigate to features step when clicking next', () => {
            render(<OnboardingModal {...defaultProps} />);

            const nextButton = screen.getByText('common.next');
            fireEvent.click(nextButton);

            expect(screen.getByText('onboarding.features.title')).toBeInTheDocument();
            expect(screen.getByText('onboarding.features.subtitle')).toBeInTheDocument();
        });

        it('should navigate to shortcuts step from features', () => {
            render(<OnboardingModal {...defaultProps} />);

            // Go to step 2
            fireEvent.click(screen.getByText('common.next'));
            // Go to step 3
            fireEvent.click(screen.getByText('common.next'));

            expect(screen.getByText('onboarding.shortcuts.title')).toBeInTheDocument();
        });

        it('should show previous button on second step', () => {
            render(<OnboardingModal {...defaultProps} />);

            // Go to features step
            fireEvent.click(screen.getByText('common.next'));

            expect(screen.getByText('common.previous')).toBeInTheDocument();
        });

        it('should navigate back when clicking previous', () => {
            render(<OnboardingModal {...defaultProps} />);

            // Go to features step
            fireEvent.click(screen.getByText('common.next'));
            // Go back
            fireEvent.click(screen.getByText('common.previous'));

            expect(screen.getByText('onboarding.welcome.title')).toBeInTheDocument();
        });

        it('should not show previous button on first step', () => {
            render(<OnboardingModal {...defaultProps} />);

            expect(screen.queryByText('common.previous')).not.toBeInTheDocument();
        });
    });

    describe('features step', () => {
        beforeEach(() => {
            render(<OnboardingModal {...defaultProps} />);
            fireEvent.click(screen.getByText('common.next'));
        });

        it('should show feature cards', () => {
            expect(screen.getByText('onboarding.features.editor.title')).toBeInTheDocument();
            expect(screen.getByText('onboarding.features.preview.title')).toBeInTheDocument();
            expect(screen.getByText('onboarding.features.cloud.title')).toBeInTheDocument();
            expect(screen.getByText('onboarding.features.toc.title')).toBeInTheDocument();
        });

        it('should show feature descriptions', () => {
            expect(screen.getByText('onboarding.features.editor.description')).toBeInTheDocument();
            expect(screen.getByText('onboarding.features.preview.description')).toBeInTheDocument();
            expect(screen.getByText('onboarding.features.cloud.description')).toBeInTheDocument();
            expect(screen.getByText('onboarding.features.toc.description')).toBeInTheDocument();
        });

        it('should show feature icons', () => {
            expect(screen.getByTestId('icon-code')).toBeInTheDocument();
            expect(screen.getByTestId('icon-eye')).toBeInTheDocument();
            expect(screen.getByTestId('icon-cloud')).toBeInTheDocument();
            expect(screen.getByTestId('icon-list-tree')).toBeInTheDocument();
        });
    });

    describe('shortcuts step', () => {
        beforeEach(() => {
            render(<OnboardingModal {...defaultProps} />);
            fireEvent.click(screen.getByText('common.next'));
            fireEvent.click(screen.getByText('common.next'));
        });

        it('should show keyboard shortcuts', () => {
            expect(screen.getByText('Ctrl+B')).toBeInTheDocument();
            expect(screen.getByText('Ctrl+I')).toBeInTheDocument();
            expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
            expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
            expect(screen.getByText('Ctrl+/')).toBeInTheDocument();
        });

        it('should show shortcut descriptions', () => {
            expect(screen.getByText('onboarding.shortcuts.bold')).toBeInTheDocument();
            expect(screen.getByText('onboarding.shortcuts.italic')).toBeInTheDocument();
            expect(screen.getByText('onboarding.shortcuts.link')).toBeInTheDocument();
            expect(screen.getByText('onboarding.shortcuts.save')).toBeInTheDocument();
            expect(screen.getByText('onboarding.shortcuts.allShortcuts')).toBeInTheDocument();
        });

        it('should show tip section', () => {
            // Tip text is wrapped in strong element with colon
            const tipElement = screen.getByText((content, element) => {
                return element?.tagName === 'STRONG' && content.includes('onboarding.shortcuts.tip');
            });
            expect(tipElement).toBeInTheDocument();
            expect(screen.getByText('onboarding.shortcuts.tipText')).toBeInTheDocument();
        });

        it('should show keyboard icon', () => {
            expect(screen.getByTestId('icon-keyboard')).toBeInTheDocument();
        });
    });

    describe('final step buttons', () => {
        beforeEach(() => {
            render(<OnboardingModal {...defaultProps} />);
            // Navigate to final step
            fireEvent.click(screen.getByText('common.next'));
            fireEvent.click(screen.getByText('common.next'));
        });

        it('should show Get Started button on final step', () => {
            expect(screen.getByText('onboarding.getStarted')).toBeInTheDocument();
        });

        it('should show Start Tour button on final step', () => {
            expect(screen.getByText('onboarding.startTour')).toBeInTheDocument();
        });

        it('should not show Next button on final step', () => {
            expect(screen.queryByText('common.next')).not.toBeInTheDocument();
        });

        it('should not show Skip button on final step', () => {
            expect(screen.queryByText('onboarding.skip')).not.toBeInTheDocument();
        });
    });

    describe('skip functionality', () => {
        it('should show skip button on first step', () => {
            render(<OnboardingModal {...defaultProps} />);

            expect(screen.getByText('onboarding.skip')).toBeInTheDocument();
        });

        it('should call onComplete with false when skip is clicked', () => {
            render(<OnboardingModal {...defaultProps} />);

            fireEvent.click(screen.getByText('onboarding.skip'));

            expect(mockOnComplete).toHaveBeenCalledWith(false);
        });

        it('should call onClose when skip is clicked', () => {
            render(<OnboardingModal {...defaultProps} />);

            fireEvent.click(screen.getByText('onboarding.skip'));

            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe('start tour', () => {
        beforeEach(() => {
            render(<OnboardingModal {...defaultProps} />);
            fireEvent.click(screen.getByText('common.next'));
            fireEvent.click(screen.getByText('common.next'));
        });

        it('should call onComplete with true when Start Tour is clicked', () => {
            fireEvent.click(screen.getByText('onboarding.startTour'));

            expect(mockOnComplete).toHaveBeenCalledWith(true);
        });

        it('should call onClose when Start Tour is clicked', () => {
            fireEvent.click(screen.getByText('onboarding.startTour'));

            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe('get started', () => {
        beforeEach(() => {
            render(<OnboardingModal {...defaultProps} />);
            fireEvent.click(screen.getByText('common.next'));
            fireEvent.click(screen.getByText('common.next'));
        });

        it('should call onComplete with false when Get Started is clicked', () => {
            fireEvent.click(screen.getByText('onboarding.getStarted'));

            expect(mockOnComplete).toHaveBeenCalledWith(false);
        });

        it('should call onClose when Get Started is clicked', () => {
            fireEvent.click(screen.getByText('onboarding.getStarted'));

            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe('dont show again checkbox', () => {
        it('should render checkbox', () => {
            render(<OnboardingModal {...defaultProps} />);

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeInTheDocument();
        });

        it('should have label', () => {
            render(<OnboardingModal {...defaultProps} />);

            expect(screen.getByText('onboarding.dontShowAgain')).toBeInTheDocument();
        });

        it('should be unchecked by default', () => {
            render(<OnboardingModal {...defaultProps} />);

            const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
            expect(checkbox.checked).toBe(false);
        });

        it('should toggle when clicked', () => {
            render(<OnboardingModal {...defaultProps} />);

            const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
            fireEvent.click(checkbox);

            expect(checkbox.checked).toBe(true);
        });
    });

    describe('modal close', () => {
        it('should call skip handler when modal close is triggered', () => {
            render(<OnboardingModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(mockOnComplete).toHaveBeenCalledWith(false);
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe('progress indicator', () => {
        it('should highlight first step initially', () => {
            render(<OnboardingModal {...defaultProps} />);

            const progressBars = document.querySelectorAll('.h-1.flex-1.rounded-full');
            expect(progressBars[0]).toHaveClass('bg-primary-500');
            expect(progressBars[1]).toHaveClass('bg-bg-tertiary');
            expect(progressBars[2]).toHaveClass('bg-bg-tertiary');
        });

        it('should highlight first two steps on second step', () => {
            render(<OnboardingModal {...defaultProps} />);
            fireEvent.click(screen.getByText('common.next'));

            const progressBars = document.querySelectorAll('.h-1.flex-1.rounded-full');
            expect(progressBars[0]).toHaveClass('bg-primary-500');
            expect(progressBars[1]).toHaveClass('bg-primary-500');
            expect(progressBars[2]).toHaveClass('bg-bg-tertiary');
        });

        it('should highlight all steps on final step', () => {
            render(<OnboardingModal {...defaultProps} />);
            fireEvent.click(screen.getByText('common.next'));
            fireEvent.click(screen.getByText('common.next'));

            const progressBars = document.querySelectorAll('.h-1.flex-1.rounded-full');
            expect(progressBars[0]).toHaveClass('bg-primary-500');
            expect(progressBars[1]).toHaveClass('bg-primary-500');
            expect(progressBars[2]).toHaveClass('bg-primary-500');
        });
    });
});
