import type { SSEConnectionState } from '@/types/sse';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

interface SessionSyncState {
    // SSE Connection state
    connectionState: SSEConnectionState;
    connectionId: string | null;
    deviceId: string;
    reconnectAttempts: number;
    lastHeartbeat: number | null;

    // Sync state
    isSyncing: boolean;
    lastSyncError: string | null;

    // Actions
    setConnectionState: (state: SSEConnectionState) => void;
    setConnectionId: (id: string | null) => void;
    setDeviceId: (id: string) => void;
    setReconnectAttempts: (attempts: number) => void;
    updateHeartbeat: () => void;
    setIsSyncing: (syncing: boolean) => void;
    setSyncError: (error: string | null) => void;
    reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const getInitialDeviceId = (): string => {
    if (typeof window === 'undefined') {
        return 'server';
    }
    let id = sessionStorage.getItem('markview:deviceId');
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem('markview:deviceId', id);
    }
    return id;
};

const initialState = {
    connectionState: 'disconnected' as SSEConnectionState,
    connectionId: null,
    deviceId: typeof window !== 'undefined' ? getInitialDeviceId() : 'server',
    reconnectAttempts: 0,
    lastHeartbeat: null,
    isSyncing: false,
    lastSyncError: null
};

// ============================================================================
// Store
// ============================================================================

export const useSessionSyncStore = create<SessionSyncState>()(
    devtools(
        (set) => ({
            ...initialState,

            setConnectionState: (connectionState) => set({ connectionState }, false, 'setConnectionState'),

            setConnectionId: (connectionId) => set({ connectionId }, false, 'setConnectionId'),

            setDeviceId: (deviceId) => set({ deviceId }, false, 'setDeviceId'),

            setReconnectAttempts: (reconnectAttempts) => set({ reconnectAttempts }, false, 'setReconnectAttempts'),

            updateHeartbeat: () => set({ lastHeartbeat: Date.now() }, false, 'updateHeartbeat'),

            setIsSyncing: (isSyncing) => set({ isSyncing }, false, 'setIsSyncing'),

            setSyncError: (lastSyncError) => set({ lastSyncError }, false, 'setSyncError'),

            reset: () => set(initialState, false, 'reset')
        }),
        { name: 'SessionSyncStore' }
    )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectIsConnected = (state: SessionSyncState) => state.connectionState === 'connected';

export const selectIsReconnecting = (state: SessionSyncState) => state.connectionState === 'reconnecting';

export const selectDeviceId = (state: SessionSyncState) => state.deviceId;
