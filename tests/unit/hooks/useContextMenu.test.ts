import { useContextMenu, useContextMenuActions } from '@/hooks/useContextMenu';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('useContextMenu', () => {
    it('should initialize with closed state', () => {
        const { result } = renderHook(() => useContextMenu());

        expect(result.current.isOpen).toBe(false);
        expect(result.current.position).toEqual({ x: 0, y: 0 });
    });

    it('should open menu with correct position', () => {
        const { result } = renderHook(() => useContextMenu());

        const mockEvent = {
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
            clientX: 100,
            clientY: 200
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.open(mockEvent);
        });

        expect(result.current.isOpen).toBe(true);
        expect(result.current.position).toEqual({ x: 100, y: 200 });
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should close menu', () => {
        const { result } = renderHook(() => useContextMenu());

        const mockEvent = {
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
            clientX: 100,
            clientY: 200
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.open(mockEvent);
        });

        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.close();
        });

        expect(result.current.isOpen).toBe(false);
    });

    it('should toggle menu state', () => {
        const { result } = renderHook(() => useContextMenu());

        const mockEvent = {
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
            clientX: 50,
            clientY: 75
        } as unknown as React.MouseEvent;

        // Toggle on
        act(() => {
            result.current.toggle(mockEvent);
        });
        expect(result.current.isOpen).toBe(true);

        // Toggle off
        act(() => {
            result.current.toggle(mockEvent);
        });
        expect(result.current.isOpen).toBe(false);
    });
});

describe('useContextMenuActions', () => {
    it('should execute action by id', () => {
        const mockAction = vi.fn();

        const groups = [
            {
                id: 'group1',
                items: [
                    { id: 'action1', label: 'Action 1', onAction: mockAction },
                    { id: 'action2', label: 'Action 2', onAction: vi.fn() }
                ]
            }
        ];

        const { result } = renderHook(() => useContextMenuActions({ groups, data: { test: 'data' } }));

        act(() => {
            result.current.executeAction('action1');
        });

        expect(mockAction).toHaveBeenCalledWith({ test: 'data' });
    });

    it('should not execute disabled action', () => {
        const mockAction = vi.fn();

        const groups = [
            {
                id: 'group1',
                items: [{ id: 'action1', label: 'Action 1', onAction: mockAction, disabled: true }]
            }
        ];

        const { result } = renderHook(() => useContextMenuActions({ groups }));

        act(() => {
            result.current.executeAction('action1');
        });

        expect(mockAction).not.toHaveBeenCalled();
    });

    it('should get action by id', () => {
        const mockAction = vi.fn();

        const groups = [
            {
                id: 'group1',
                items: [
                    { id: 'action1', label: 'Action 1', onAction: mockAction },
                    { id: 'action2', label: 'Action 2', onAction: vi.fn() }
                ]
            }
        ];

        const { result } = renderHook(() => useContextMenuActions({ groups }));

        const action = result.current.getAction('action1');

        expect(action).toBeDefined();
        expect(action?.label).toBe('Action 1');
    });

    it('should return undefined for non-existent action', () => {
        const groups = [
            {
                id: 'group1',
                items: [{ id: 'action1', label: 'Action 1', onAction: vi.fn() }]
            }
        ];

        const { result } = renderHook(() => useContextMenuActions({ groups }));

        const action = result.current.getAction('non-existent');

        expect(action).toBeUndefined();
    });
});
