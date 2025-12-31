import { STORAGE_KEYS, getDocumentKey, getVersionsKey } from '@/services/storage/keys';
import { describe, expect, it } from 'vitest';

describe('STORAGE_KEYS', () => {
    it('should have correct document keys', () => {
        expect(STORAGE_KEYS.DOCUMENTS).toBe('markview:documents');
        expect(STORAGE_KEYS.DOCUMENT_PREFIX).toBe('markview:doc:');
    });

    it('should have correct settings keys', () => {
        expect(STORAGE_KEYS.SETTINGS).toBe('markview:settings');
        expect(STORAGE_KEYS.THEME).toBe('markview:theme');
    });

    it('should have correct UI state keys', () => {
        expect(STORAGE_KEYS.UI_STATE).toBe('markview:ui');
        expect(STORAGE_KEYS.SIDEBAR_STATE).toBe('markview:sidebar');
    });

    it('should have correct session keys', () => {
        expect(STORAGE_KEYS.SESSION).toBe('markview:session');
        expect(STORAGE_KEYS.ACTIVE_DOCUMENT).toBe('markview:active');
        expect(STORAGE_KEYS.OPEN_TABS).toBe('markview:tabs');
    });

    it('should have correct versions prefix', () => {
        expect(STORAGE_KEYS.VERSIONS_PREFIX).toBe('markview:versions:');
    });

    it('should have correct GitHub keys', () => {
        expect(STORAGE_KEYS.GITHUB_TOKEN).toBe('markview:github:token');
        expect(STORAGE_KEYS.GITHUB_REPOS).toBe('markview:github:repos');
    });
});

describe('getDocumentKey', () => {
    it('should generate correct document key', () => {
        expect(getDocumentKey('abc123')).toBe('markview:doc:abc123');
    });

    it('should handle empty id', () => {
        expect(getDocumentKey('')).toBe('markview:doc:');
    });

    it('should handle special characters in id', () => {
        expect(getDocumentKey('doc-with-dashes')).toBe('markview:doc:doc-with-dashes');
    });
});

describe('getVersionsKey', () => {
    it('should generate correct versions key', () => {
        expect(getVersionsKey('abc123')).toBe('markview:versions:abc123');
    });

    it('should handle empty id', () => {
        expect(getVersionsKey('')).toBe('markview:versions:');
    });

    it('should handle special characters in id', () => {
        expect(getVersionsKey('doc-with-dashes')).toBe('markview:versions:doc-with-dashes');
    });
});
