import { ContextualHint } from '@/components/onboarding/ContextualHint';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Lightbulb: () => <span data-testid="icon-lightbulb" />,
    X: () => <span data-testid="icon-x" />
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('ContextualHint', () => {
    const defaultProps = {
        message: 'This is a helpful hint',
        position: { x: 100, y: 200 },
        onDismiss: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        // Mock window dimensions
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 1024
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            value: 768
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('rendering', () => {
        it('should render the hint message', () => {
            render(<ContextualHint {...defaultProps} />);

            expect(screen.getByText('This is a helpful hint')).toBeInTheDocument();
        });

        it('should render lightbulb icon', () => {
            render(<ContextualHint {...defaultProps} />);

            expect(screen.getByTestId('icon-lightbulb')).toBeInTheDocument();
        });

        it('should render close button with X icon', () => {
            render(<ContextualHint {...defaultProps} />);

            expect(screen.getByTestId('icon-x')).toBeInTheDocument();
            expect(screen.getByLabelText('common.close')).toBeInTheDocument();
        });

        it('should render dismiss button with translated text', () => {
            render(<ContextualHint {...defaultProps} />);

            expect(screen.getByText('hints.dismiss')).toBeInTheDocument();
        });

        it('should position at specified coordinates', () => {
            const { container } = render(<ContextualHint {...defaultProps} position={{ x: 150, y: 250 }} />);

            const hint = container.firstChild as HTMLElement;
            // Position is adjusted (y + 20 to show below cursor)
            expect(hint.style.left).toBe('150px');
            expect(hint.style.top).toBe('270px'); // 250 + 20
        });
    });

    describe('animation', () => {
        it('should start with hidden state', () => {
            const { container } = render(<ContextualHint {...defaultProps} />);

            const hint = container.firstChild as HTMLElement;
            expect(hint.className).toContain('opacity-0');
            expect(hint.className).toContain('-translate-y-2');
        });

        it('should animate to visible state after delay', async () => {
            const { container } = render(<ContextualHint {...defaultProps} />);

            await vi.advanceTimersByTimeAsync(50);

            const hint = container.firstChild as HTMLElement;
            expect(hint.className).toContain('opacity-100');
            expect(hint.className).toContain('translate-y-0');
        });
    });

    describe('dismissal', () => {
        it('should call onDismiss when close button is clicked', async () => {
            render(<ContextualHint {...defaultProps} />);

            fireEvent.click(screen.getByLabelText('common.close'));

            // Wait for animation delay
            await vi.advanceTimersByTimeAsync(150);

            expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
        });

        it('should call onDismiss when dismiss text is clicked', async () => {
            render(<ContextualHint {...defaultProps} />);

            fireEvent.click(screen.getByText('hints.dismiss'));

            // Wait for animation delay
            await vi.advanceTimersByTimeAsync(150);

            expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
        });

        it('should fade out before calling onDismiss', () => {
            const { container } = render(<ContextualHint {...defaultProps} />);

            fireEvent.click(screen.getByText('hints.dismiss'));

            const hint = container.firstChild as HTMLElement;
            expect(hint.className).toContain('opacity-0');

            // onDismiss not called yet
            expect(defaultProps.onDismiss).not.toHaveBeenCalled();
        });
    });

    describe('position adjustment', () => {
        it('should adjust position when too close to right edge', () => {
            const { container } = render(<ContextualHint {...defaultProps} position={{ x: 900, y: 200 }} />);

            const hint = container.firstChild as HTMLElement;
            // Should be adjusted to stay within viewport (1024 - 280 - 16 = 728)
            expect(Number.parseInt(hint.style.left)).toBeLessThanOrEqual(728);
        });

        it('should adjust position when too close to left edge', () => {
            const { container } = render(<ContextualHint {...defaultProps} position={{ x: 5, y: 200 }} />);

            const hint = container.firstChild as HTMLElement;
            // Should be adjusted to minimum padding (16)
            expect(Number.parseInt(hint.style.left)).toBeGreaterThanOrEqual(16);
        });

        it('should show above cursor when near bottom edge', () => {
            const { container } = render(<ContextualHint {...defaultProps} position={{ x: 100, y: 700 }} />);

            const hint = container.firstChild as HTMLElement;
            // Should flip to show above (700 - 80 - 20 = 600)
            expect(Number.parseInt(hint.style.top)).toBeLessThan(700);
        });

        it('should show below cursor by default', () => {
            const { container } = render(<ContextualHint {...defaultProps} position={{ x: 100, y: 300 }} />);

            const hint = container.firstChild as HTMLElement;
            // Should be below cursor (300 + 20 = 320)
            expect(hint.style.top).toBe('320px');
        });
    });

    describe('accessibility', () => {
        it('should have accessible close button', () => {
            render(<ContextualHint {...defaultProps} />);

            const closeButton = screen.getByLabelText('common.close');
            expect(closeButton).toBeInTheDocument();
            expect(closeButton.tagName).toBe('BUTTON');
            expect(closeButton).toHaveAttribute('type', 'button');
        });

        it('should have dismissible text button', () => {
            render(<ContextualHint {...defaultProps} />);

            const dismissButton = screen.getByText('hints.dismiss');
            expect(dismissButton.tagName).toBe('BUTTON');
            expect(dismissButton).toHaveAttribute('type', 'button');
        });
    });

    describe('styling', () => {
        it('should have fixed positioning', () => {
            const { container } = render(<ContextualHint {...defaultProps} />);

            const hint = container.firstChild as HTMLElement;
            expect(hint.className).toContain('fixed');
        });

        it('should have high z-index', () => {
            const { container } = render(<ContextualHint {...defaultProps} />);

            const hint = container.firstChild as HTMLElement;
            expect(hint.className).toContain('z-50');
        });

        it('should allow pointer events', () => {
            const { container } = render(<ContextualHint {...defaultProps} />);

            const hint = container.firstChild as HTMLElement;
            expect(hint.className).toContain('pointer-events-auto');
        });
    });
});
