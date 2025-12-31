import {
    clearSession,
    hasSession,
    loadSession,
    registerSessionSaveHandler,
    saveActiveDocument,
    saveActivePanel,
    saveOpenTabs,
    saveSession,
    saveSidebarState
} from '@/services/storage/session';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('session', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        localStorage.clear();
        vi.useRealTimers();
    });

    describe('saveSession', () => {
        it('should save session state', () => {
            const result = saveSession({ openTabs: ['tab1', 'tab2'] });

            expect(result).toBe(true);
        });

        it('should merge with existing session', () => {
            saveSession({ openTabs: ['tab1'] });
            saveSession({ activeDocumentId: 'doc1' });

            const session = loadSession();

            expect(session.openTabs).toEqual(['tab1']);
            expect(session.activeDocumentId).toBe('doc1');
        });

        it('should update savedAt timestamp', () => {
            const now = new Date('2024-01-15T10:00:00Z');
            vi.setSystemTime(now);

            saveSession({ openTabs: ['tab1'] });

            const session = loadSession();
            expect(session.savedAt).toBe('2024-01-15T10:00:00.000Z');
        });
    });

    describe('loadSession', () => {
        it('should return default session when empty', () => {
            const session = loadSession();

            expect(session.openTabs).toEqual([]);
            expect(session.activeDocumentId).toBeNull();
            expect(session.sidebarCollapsed).toBe(false);
            expect(session.sidebarWidth).toBe(260);
            expect(session.activePanel).toBe('files');
        });

        it('should return saved session', () => {
            saveSession({
                openTabs: ['tab1', 'tab2'],
                activeDocumentId: 'doc1',
                sidebarCollapsed: true,
                sidebarWidth: 300
            });

            const session = loadSession();

            expect(session.openTabs).toEqual(['tab1', 'tab2']);
            expect(session.activeDocumentId).toBe('doc1');
            expect(session.sidebarCollapsed).toBe(true);
            expect(session.sidebarWidth).toBe(300);
        });
    });

    describe('clearSession', () => {
        it('should reset to default session', () => {
            saveSession({
                openTabs: ['tab1', 'tab2'],
                activeDocumentId: 'doc1'
            });

            clearSession();

            const session = loadSession();
            expect(session.openTabs).toEqual([]);
            expect(session.activeDocumentId).toBeNull();
        });
    });

    describe('saveOpenTabs', () => {
        it('should save tab IDs', () => {
            saveOpenTabs(['tab1', 'tab2', 'tab3']);

            const session = loadSession();
            expect(session.openTabs).toEqual(['tab1', 'tab2', 'tab3']);
        });

        it('should replace existing tabs', () => {
            saveOpenTabs(['old1', 'old2']);
            saveOpenTabs(['new1']);

            const session = loadSession();
            expect(session.openTabs).toEqual(['new1']);
        });
    });

    describe('saveActiveDocument', () => {
        it('should save active document ID', () => {
            saveActiveDocument('doc-123');

            const session = loadSession();
            expect(session.activeDocumentId).toBe('doc-123');
        });

        it('should handle null document ID', () => {
            saveActiveDocument('doc-123');
            saveActiveDocument(null);

            const session = loadSession();
            expect(session.activeDocumentId).toBeNull();
        });
    });

    describe('saveSidebarState', () => {
        it('should save sidebar collapsed state', () => {
            saveSidebarState(true, 280);

            const session = loadSession();
            expect(session.sidebarCollapsed).toBe(true);
            expect(session.sidebarWidth).toBe(280);
        });

        it('should save sidebar expanded state', () => {
            saveSidebarState(false, 260);

            const session = loadSession();
            expect(session.sidebarCollapsed).toBe(false);
            expect(session.sidebarWidth).toBe(260);
        });
    });

    describe('saveActivePanel', () => {
        it('should save active panel', () => {
            saveActivePanel('github');

            const session = loadSession();
            expect(session.activePanel).toBe('github');
        });
    });

    describe('hasSession', () => {
        it('should return false for no session', () => {
            expect(hasSession()).toBe(false);
        });

        it('should return false for empty tabs', () => {
            saveSession({ openTabs: [] });

            expect(hasSession()).toBe(false);
        });

        it('should return true when tabs exist', () => {
            saveSession({ openTabs: ['tab1'] });

            expect(hasSession()).toBe(true);
        });
    });

    describe('registerSessionSaveHandler', () => {
        it('should register beforeunload handler', () => {
            const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
            const getSession = vi.fn().mockReturnValue({ openTabs: ['tab1'] });

            registerSessionSaveHandler(getSession);

            expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

            addEventListenerSpy.mockRestore();
        });

        it('should return cleanup function', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
            const getSession = vi.fn().mockReturnValue({});

            const cleanup = registerSessionSaveHandler(getSession);
            cleanup();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });

        it('should save session on beforeunload', () => {
            const getSession = vi.fn().mockReturnValue({ openTabs: ['tab1', 'tab2'] });

            registerSessionSaveHandler(getSession);

            // Trigger beforeunload
            window.dispatchEvent(new Event('beforeunload'));

            expect(getSession).toHaveBeenCalled();
            const session = loadSession();
            expect(session.openTabs).toEqual(['tab1', 'tab2']);
        });
    });
});
