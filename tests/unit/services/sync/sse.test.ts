import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock EventSource
class MockEventSource {
    static instances: MockEventSource[] = [];
    url: string;
    withCredentials: boolean;
    onopen: ((event: Event) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    listeners: Map<string, ((event: MessageEvent) => void)[]> = new Map();
    readyState = 0; // CONNECTING

    constructor(url: string, options?: { withCredentials?: boolean }) {
        this.url = url;
        this.withCredentials = options?.withCredentials ?? false;
        MockEventSource.instances.push(this);
    }

    addEventListener(type: string, listener: (event: MessageEvent) => void) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type)?.push(listener);
    }

    dispatchEvent(type: string, data: unknown) {
        const listeners = this.listeners.get(type) || [];
        const event = { data: JSON.stringify(data) } as MessageEvent;
        for (const listener of listeners) {
            listener(event);
        }
    }

    close() {
        this.readyState = 2; // CLOSED
    }

    static reset() {
        MockEventSource.instances = [];
    }
}

// Note: Original globals are saved but not restored as tests use vitest's global stubs

describe('SSEService', () => {
    let sseService: typeof import('@/services/sync/sse').sseService;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
        vi.resetModules();
        MockEventSource.reset();

        // Mock sessionStorage
        const sessionStorageData: Record<string, string> = {};
        const mockSessionStorage = {
            getItem: vi.fn((key: string) => sessionStorageData[key] || null),
            setItem: vi.fn((key: string, value: string) => {
                sessionStorageData[key] = value;
            }),
            removeItem: vi.fn((key: string) => {
                delete sessionStorageData[key];
            }),
            clear: vi.fn(() => {
                for (const key of Object.keys(sessionStorageData)) {
                    delete sessionStorageData[key];
                }
            })
        };

        // Mock globals
        vi.stubGlobal('EventSource', MockEventSource);
        vi.stubGlobal('sessionStorage', mockSessionStorage);
        vi.stubGlobal('navigator', { onLine: true });
        vi.stubGlobal('window', {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        });
        vi.stubGlobal('crypto', { randomUUID: () => 'test-device-id' });

        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Import fresh module
        const module = await import('@/services/sync/sse');
        sseService = module.sseService;
    });

    afterEach(() => {
        sseService.destroy();
        vi.unstubAllGlobals();
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('device ID management', () => {
        it('should create a new device ID if none exists', () => {
            expect(sseService.getDeviceId()).toBe('test-device-id');
        });

        it('should persist device ID to sessionStorage', () => {
            sseService.getDeviceId();
            expect(sessionStorage.setItem).toHaveBeenCalledWith('markview:deviceId', 'test-device-id');
        });
    });

    describe('connection management', () => {
        it('should start in disconnected state', () => {
            expect(sseService.getState()).toBe('disconnected');
            expect(sseService.isConnected()).toBe(false);
        });

        it('should connect to SSE endpoint', () => {
            sseService.connect();

            expect(MockEventSource.instances.length).toBe(1);
            expect(MockEventSource.instances[0]?.url).toContain('/api/sync/sse');
            expect(MockEventSource.instances[0]?.url).toContain('deviceId=test-device-id');
        });

        it('should set state to connecting when connecting', () => {
            sseService.connect();

            expect(sseService.getState()).toBe('connecting');
        });

        it('should set state to connected when EventSource opens', () => {
            sseService.connect();

            const eventSource = MockEventSource.instances[0];
            eventSource?.onopen?.(new Event('open'));

            expect(sseService.getState()).toBe('connected');
            expect(sseService.isConnected()).toBe(true);
        });

        it('should not create multiple connections', () => {
            sseService.connect();
            sseService.connect();
            sseService.connect();

            expect(MockEventSource.instances.length).toBe(1);
        });

        it('should disconnect properly', () => {
            sseService.connect();
            const eventSource = MockEventSource.instances[0];
            eventSource?.onopen?.(new Event('open'));

            sseService.disconnect();

            expect(sseService.getState()).toBe('disconnected');
            expect(sseService.isConnected()).toBe(false);
            expect(sseService.getConnectionId()).toBeNull();
        });

        it('should not connect when offline', () => {
            vi.stubGlobal('navigator', { onLine: false });

            sseService.connect();

            expect(MockEventSource.instances.length).toBe(0);
        });
    });

    describe('event handling', () => {
        it('should register event handlers', () => {
            const handler = vi.fn();

            const unsubscribe = sseService.onEvent('document:updated', handler);

            expect(typeof unsubscribe).toBe('function');
        });

        it('should call handlers when events are received', () => {
            const handler = vi.fn();
            sseService.onEvent('document:updated', handler);

            sseService.connect();
            const eventSource = MockEventSource.instances[0];
            eventSource?.onopen?.(new Event('open'));

            // Dispatch event
            eventSource?.dispatchEvent('document:updated', {
                documentId: 'doc-1',
                syncVersion: 1,
                originDeviceId: 'other-device'
            });

            expect(handler).toHaveBeenCalledWith({
                documentId: 'doc-1',
                syncVersion: 1,
                originDeviceId: 'other-device'
            });
        });

        it('should handle connected event and store connection ID', () => {
            sseService.connect();
            const eventSource = MockEventSource.instances[0];
            eventSource?.onopen?.(new Event('open'));

            eventSource?.dispatchEvent('connected', {
                connectionId: 'conn-123',
                deviceId: 'test-device-id'
            });

            expect(sseService.getConnectionId()).toBe('conn-123');
        });

        it('should handle heartbeat event and update timestamp', () => {
            sseService.connect();
            const eventSource = MockEventSource.instances[0];
            eventSource?.onopen?.(new Event('open'));

            expect(sseService.getLastHeartbeat()).toBeNull();

            eventSource?.dispatchEvent('heartbeat', {});

            expect(sseService.getLastHeartbeat()).toBeDefined();
            expect(typeof sseService.getLastHeartbeat()).toBe('number');
        });

        it('should unsubscribe handlers', () => {
            const handler = vi.fn();
            const unsubscribe = sseService.onEvent('document:updated', handler);

            sseService.connect();
            const eventSource = MockEventSource.instances[0];
            eventSource?.onopen?.(new Event('open'));

            // Unsubscribe
            unsubscribe();

            // Dispatch event
            eventSource?.dispatchEvent('document:updated', { documentId: 'doc-1' });

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('state change listeners', () => {
        it('should notify listeners on state change', () => {
            const listener = vi.fn();
            sseService.onStateChange(listener);

            sseService.connect();

            expect(listener).toHaveBeenCalledWith('connecting');

            const eventSource = MockEventSource.instances[0];
            eventSource?.onopen?.(new Event('open'));

            expect(listener).toHaveBeenCalledWith('connected');
        });

        it('should allow unsubscribing from state changes', () => {
            const listener = vi.fn();
            const unsubscribe = sseService.onStateChange(listener);

            unsubscribe();

            sseService.connect();

            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe('reconnection', () => {
        it('should track reconnect attempts', () => {
            expect(sseService.getReconnectAttempts()).toBe(0);
        });

        it('should reset reconnect attempts on successful connection', () => {
            sseService.connect();
            const eventSource = MockEventSource.instances[0];
            eventSource?.onopen?.(new Event('open'));

            expect(sseService.getReconnectAttempts()).toBe(0);
        });
    });

    describe('cleanup', () => {
        it('should clean up on destroy', () => {
            const handler = vi.fn();
            const stateListener = vi.fn();

            sseService.onEvent('document:updated', handler);
            sseService.onStateChange(stateListener);
            sseService.connect();

            sseService.destroy();

            expect(sseService.getState()).toBe('disconnected');
            expect(window.removeEventListener).toHaveBeenCalled();
        });
    });
});
