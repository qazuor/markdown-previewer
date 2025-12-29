import { usePWA } from '@/hooks/usePWA';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('usePWA', () => {
    beforeEach(() => {
        // Reset localStorage
        localStorage.clear();

        // Mock navigator.onLine
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
        });

        // Mock window.matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn()
            }))
        });

        // Mock workbox-window
        vi.mock('workbox-window', () => ({
            Workbox: vi.fn().mockImplementation(() => ({
                addEventListener: vi.fn(),
                register: vi.fn().mockResolvedValue(undefined),
                messageSkipWaiting: vi.fn()
            }))
        }));
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => usePWA());

        expect(result.current.isInstallable).toBe(false);
        expect(result.current.isInstalled).toBe(false);
        expect(result.current.isOnline).toBe(true);
        expect(result.current.hasUpdate).toBe(false);
    });

    it('should detect online status', () => {
        const { result } = renderHook(() => usePWA());

        expect(result.current.isOnline).toBe(true);

        // Simulate going offline
        act(() => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });
            window.dispatchEvent(new Event('offline'));
        });

        expect(result.current.isOnline).toBe(false);
    });

    it('should detect standalone mode', () => {
        // Mock standalone mode
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: query === '(display-mode: standalone)',
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn()
            }))
        });

        const { result } = renderHook(() => usePWA());

        expect(result.current.isInstalled).toBe(true);
    });

    it('should handle install dismissal', () => {
        const { result } = renderHook(() => usePWA());

        act(() => {
            result.current.dismissInstall();
        });

        expect(localStorage.getItem('pwa-install-dismissed')).toBe('true');
    });

    it('should provide promptInstall function', () => {
        const { result } = renderHook(() => usePWA());

        expect(typeof result.current.promptInstall).toBe('function');
    });

    it('should provide updateServiceWorker function', () => {
        const { result } = renderHook(() => usePWA());

        expect(typeof result.current.updateServiceWorker).toBe('function');
    });
});
