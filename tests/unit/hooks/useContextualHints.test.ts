import { type HintId, useContextualHints } from '@/hooks/useContextualHints';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'markview:hints-seen';

describe('useContextualHints', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('initialization', () => {
        it('should initialize with no active hint', () => {
            const { result } = renderHook(() => useContextualHints());

            expect(result.current.activeHint).toBeNull();
            expect(result.current.hintPosition).toBeNull();
        });

        it('should load seen hints from localStorage', () => {
            const seenHints: HintId[] = ['heading', 'bold'];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seenHints));

            const { result } = renderHook(() => useContextualHints());

            expect(result.current.hasSeenHint('heading')).toBe(true);
            expect(result.current.hasSeenHint('bold')).toBe(true);
            expect(result.current.hasSeenHint('link')).toBe(false);
        });

        it('should handle corrupted localStorage gracefully', () => {
            localStorage.setItem(STORAGE_KEY, 'invalid-json');
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const { result } = renderHook(() => useContextualHints());

            expect(result.current.activeHint).toBeNull();
            consoleSpy.mockRestore();
        });
    });

    describe('hasSeenHint', () => {
        it('should return false for unseen hints', () => {
            const { result } = renderHook(() => useContextualHints());

            expect(result.current.hasSeenHint('heading')).toBe(false);
            expect(result.current.hasSeenHint('code')).toBe(false);
        });

        it('should return true for seen hints', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(['heading']));

            const { result } = renderHook(() => useContextualHints());

            expect(result.current.hasSeenHint('heading')).toBe(true);
        });
    });

    describe('showHint', () => {
        it('should show hint at specified position', () => {
            const { result } = renderHook(() => useContextualHints());
            const position = { x: 100, y: 200 };

            act(() => {
                result.current.showHint('heading', position);
            });

            expect(result.current.activeHint).toEqual({
                id: 'heading',
                messageKey: 'hints.heading'
            });
            expect(result.current.hintPosition).toEqual(position);
        });

        it('should not show hint if already seen', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(['heading']));

            const { result } = renderHook(() => useContextualHints());

            act(() => {
                result.current.showHint('heading', { x: 100, y: 200 });
            });

            expect(result.current.activeHint).toBeNull();
        });

        it('should show different hints for different triggers', () => {
            const { result } = renderHook(() => useContextualHints());

            act(() => {
                result.current.showHint('code', { x: 50, y: 50 });
            });

            expect(result.current.activeHint?.id).toBe('code');
            expect(result.current.activeHint?.messageKey).toBe('hints.code');
        });
    });

    describe('dismissHint', () => {
        it('should clear active hint', () => {
            const { result } = renderHook(() => useContextualHints());

            act(() => {
                result.current.showHint('heading', { x: 100, y: 200 });
            });

            expect(result.current.activeHint).not.toBeNull();

            act(() => {
                result.current.dismissHint();
            });

            expect(result.current.activeHint).toBeNull();
            expect(result.current.hintPosition).toBeNull();
        });

        it('should mark hint as seen in localStorage', () => {
            const { result } = renderHook(() => useContextualHints());

            act(() => {
                result.current.showHint('heading', { x: 100, y: 200 });
            });

            act(() => {
                result.current.dismissHint();
            });

            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            expect(stored).toContain('heading');
        });

        it('should prevent showing the same hint again', () => {
            const { result } = renderHook(() => useContextualHints());

            // Show and dismiss
            act(() => {
                result.current.showHint('heading', { x: 100, y: 200 });
            });
            act(() => {
                result.current.dismissHint();
            });

            // Try to show again
            act(() => {
                result.current.showHint('heading', { x: 100, y: 200 });
            });

            expect(result.current.activeHint).toBeNull();
        });

        it('should do nothing if no active hint', () => {
            const { result } = renderHook(() => useContextualHints());

            act(() => {
                result.current.dismissHint();
            });

            expect(result.current.activeHint).toBeNull();
        });
    });

    describe('showHintWithAutoDismiss', () => {
        it('should show hint and auto-dismiss after delay', async () => {
            const { result } = renderHook(() => useContextualHints());

            act(() => {
                result.current.showHintWithAutoDismiss('heading', { x: 100, y: 200 }, 3000);
            });

            expect(result.current.activeHint).not.toBeNull();

            // Advance time
            await act(async () => {
                vi.advanceTimersByTime(3000);
            });

            expect(result.current.activeHint).toBeNull();
        });

        it('should use default delay of 5000ms', async () => {
            const { result } = renderHook(() => useContextualHints());

            act(() => {
                result.current.showHintWithAutoDismiss('heading', { x: 100, y: 200 });
            });

            expect(result.current.activeHint).not.toBeNull();

            await act(async () => {
                vi.advanceTimersByTime(4999);
            });

            expect(result.current.activeHint).not.toBeNull();

            await act(async () => {
                vi.advanceTimersByTime(1);
            });

            expect(result.current.activeHint).toBeNull();
        });

        it('should not auto-dismiss if hint was changed', async () => {
            const { result } = renderHook(() => useContextualHints());

            act(() => {
                result.current.showHintWithAutoDismiss('heading', { x: 100, y: 200 }, 3000);
            });

            // Show a different hint before auto-dismiss
            act(() => {
                result.current.showHint('bold', { x: 150, y: 250 });
            });

            // Advance time past original delay
            await act(async () => {
                vi.advanceTimersByTime(3000);
            });

            // Bold hint should still be visible
            expect(result.current.activeHint?.id).toBe('bold');
        });
    });

    describe('resetHints', () => {
        it('should clear all seen hints', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(['heading', 'bold', 'link']));

            const { result } = renderHook(() => useContextualHints());

            expect(result.current.hasSeenHint('heading')).toBe(true);

            act(() => {
                result.current.resetHints();
            });

            expect(result.current.hasSeenHint('heading')).toBe(false);
            expect(result.current.hasSeenHint('bold')).toBe(false);
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        });

        it('should clear active hint', () => {
            const { result } = renderHook(() => useContextualHints());

            act(() => {
                result.current.showHint('heading', { x: 100, y: 200 });
            });

            act(() => {
                result.current.resetHints();
            });

            expect(result.current.activeHint).toBeNull();
            expect(result.current.hintPosition).toBeNull();
        });
    });

    describe('hint types', () => {
        it.each<HintId>(['heading', 'bold', 'link', 'code', 'list', 'image', 'table'])(
            'should have correct message key for %s',
            (hintId) => {
                const { result } = renderHook(() => useContextualHints());

                act(() => {
                    result.current.showHint(hintId, { x: 100, y: 200 });
                });

                expect(result.current.activeHint?.messageKey).toBe(`hints.${hintId}`);
            }
        );
    });
});
