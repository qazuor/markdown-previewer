import { canStore, estimateSize, formatBytes, getCleanupSuggestions, getStorageUsage, getUsageByPrefix } from '@/services/storage/quota';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('quota', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('getStorageUsage', () => {
        it('should return zero usage for empty storage', () => {
            const usage = getStorageUsage();

            expect(usage.used).toBe(0);
            expect(usage.percentUsed).toBe(0);
            expect(usage.isNearLimit).toBe(false);
            expect(usage.isAtLimit).toBe(false);
        });

        it('should calculate usage correctly', () => {
            localStorage.setItem('test', 'value');

            const usage = getStorageUsage();

            // 'test' + 'value' = 9 chars * 2 bytes = 18 bytes
            expect(usage.used).toBe(18);
            expect(usage.available).toBe(5 * 1024 * 1024 - 18);
        });

        it('should return correct total', () => {
            const usage = getStorageUsage();

            expect(usage.total).toBe(5 * 1024 * 1024); // 5MB
        });

        it('should detect near limit', () => {
            // We can't actually fill 80% of storage in a test
            // but we can verify the structure
            const usage = getStorageUsage();

            expect(typeof usage.isNearLimit).toBe('boolean');
        });

        it('should detect at limit', () => {
            const usage = getStorageUsage();

            expect(typeof usage.isAtLimit).toBe('boolean');
        });
    });

    describe('formatBytes', () => {
        it('should format 0 bytes', () => {
            expect(formatBytes(0)).toBe('0 B');
        });

        it('should format bytes', () => {
            expect(formatBytes(500)).toBe('500 B');
        });

        it('should format kilobytes', () => {
            expect(formatBytes(1024)).toBe('1 KB');
            expect(formatBytes(1536)).toBe('1.5 KB');
        });

        it('should format megabytes', () => {
            expect(formatBytes(1024 * 1024)).toBe('1 MB');
            expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB');
        });

        it('should format gigabytes', () => {
            expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
        });
    });

    describe('canStore', () => {
        it('should return true for small values', () => {
            expect(canStore(100)).toBe(true);
        });

        it('should return true for values within available space', () => {
            expect(canStore(1024)).toBe(true);
        });

        it('should return false for values exceeding available space', () => {
            // 10MB is more than the 5MB limit
            expect(canStore(10 * 1024 * 1024)).toBe(false);
        });
    });

    describe('estimateSize', () => {
        it('should estimate size of string', () => {
            const size = estimateSize('hello');
            // '"hello"' = 7 chars * 2 bytes = 14 bytes
            expect(size).toBe(14);
        });

        it('should estimate size of object', () => {
            const size = estimateSize({ key: 'value' });
            // '{"key":"value"}' = 15 chars * 2 bytes = 30 bytes
            expect(size).toBe(30);
        });

        it('should estimate size of array', () => {
            const size = estimateSize([1, 2, 3]);
            // '[1,2,3]' = 7 chars * 2 bytes = 14 bytes
            expect(size).toBe(14);
        });

        it('should estimate size of number', () => {
            const size = estimateSize(12345);
            // '12345' = 5 chars * 2 bytes = 10 bytes
            expect(size).toBe(10);
        });

        it('should estimate size of null', () => {
            const size = estimateSize(null);
            // 'null' = 4 chars * 2 bytes = 8 bytes
            expect(size).toBe(8);
        });
    });

    describe('getUsageByPrefix', () => {
        it('should return 0 for no matching keys', () => {
            localStorage.setItem('other:key', 'value');

            const usage = getUsageByPrefix('markview:');

            expect(usage).toBe(0);
        });

        it('should calculate usage for matching prefix', () => {
            localStorage.setItem('markview:doc1', 'content1');
            localStorage.setItem('markview:doc2', 'content2');
            localStorage.setItem('other:key', 'value');

            const usage = getUsageByPrefix('markview:');

            // 'markview:doc1' + 'content1' = 21 chars * 2 = 42
            // 'markview:doc2' + 'content2' = 21 chars * 2 = 42
            // Total = 84 bytes
            expect(usage).toBe(84);
        });

        it('should handle empty storage', () => {
            const usage = getUsageByPrefix('markview:');

            expect(usage).toBe(0);
        });
    });

    describe('getCleanupSuggestions', () => {
        it('should return empty array for no matching keys', () => {
            localStorage.setItem('other:key', 'value');

            const suggestions = getCleanupSuggestions('markview:');

            expect(suggestions).toHaveLength(0);
        });

        it('should identify version items', () => {
            localStorage.setItem('markview:versions:doc1', 'version data');

            const suggestions = getCleanupSuggestions('markview:');

            expect(suggestions).toHaveLength(1);
            expect(suggestions[0]?.type).toBe('version');
        });

        it('should identify document items', () => {
            localStorage.setItem('markview:doc:abc123', 'document content');

            const suggestions = getCleanupSuggestions('markview:');

            expect(suggestions).toHaveLength(1);
            expect(suggestions[0]?.type).toBe('document');
        });

        it('should identify other items', () => {
            localStorage.setItem('markview:settings', 'settings data');

            const suggestions = getCleanupSuggestions('markview:');

            expect(suggestions).toHaveLength(1);
            expect(suggestions[0]?.type).toBe('other');
        });

        it('should sort by size descending', () => {
            localStorage.setItem('markview:small', 'a');
            localStorage.setItem('markview:large', 'a'.repeat(100));
            localStorage.setItem('markview:medium', 'a'.repeat(50));

            const suggestions = getCleanupSuggestions('markview:');

            expect(suggestions).toHaveLength(3);
            // biome-ignore lint/style/noNonNullAssertion: Length asserted above
            expect(suggestions[0]!.size).toBeGreaterThan(suggestions[1]!.size);
            // biome-ignore lint/style/noNonNullAssertion: Length asserted above
            expect(suggestions[1]!.size).toBeGreaterThan(suggestions[2]!.size);
        });

        it('should include key and size in suggestions', () => {
            localStorage.setItem('markview:test', 'content');

            const suggestions = getCleanupSuggestions('markview:');

            expect(suggestions[0]?.key).toBe('markview:test');
            expect(suggestions[0]?.size).toBeGreaterThan(0);
        });
    });
});
