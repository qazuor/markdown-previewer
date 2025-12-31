import {
    deleteAllVersions,
    deleteVersion,
    diffVersions,
    getVersion,
    getVersionCount,
    getVersions,
    hasVersions,
    saveVersion,
    updateVersionLabel
} from '@/services/storage/versions';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('versions', () => {
    const testDocId = 'test-doc-123';

    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('saveVersion', () => {
        it('should save a new version', () => {
            const result = saveVersion(testDocId, 'Test content');

            expect(result.success).toBe(true);
            expect(result.version).toBeDefined();
            expect(result.version?.content).toBe('Test content');
            expect(result.version?.docId).toBe(testDocId);
        });

        it('should save version with label', () => {
            const result = saveVersion(testDocId, 'Content', 'My Label');

            expect(result.success).toBe(true);
            expect(result.version?.label).toBe('My Label');
        });

        it('should add version ID and timestamps', () => {
            const result = saveVersion(testDocId, 'Content');

            expect(result.version?.id).toMatch(/^v_\d+_/);
            expect(result.version?.createdAt).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Asserted above with toBeDefined
            expect(new Date(result.version!.createdAt).getTime()).not.toBeNaN();
        });

        it('should calculate content size', () => {
            const content = 'Hello World';
            const result = saveVersion(testDocId, content);

            expect(result.version?.size).toBe(content.length);
        });

        it('should limit versions to max 10', () => {
            // Save 12 versions
            for (let i = 0; i < 12; i++) {
                saveVersion(testDocId, `Content ${i}`);
            }

            const versions = getVersions(testDocId);
            expect(versions.length).toBe(10);
        });

        it('should keep newest versions when exceeding max', () => {
            for (let i = 0; i < 12; i++) {
                saveVersion(testDocId, `Content ${i}`);
            }

            const versions = getVersions(testDocId);
            // Newest should be first
            expect(versions[0]?.content).toBe('Content 11');
        });
    });

    describe('getVersions', () => {
        it('should return empty array for no versions', () => {
            const versions = getVersions(testDocId);

            expect(versions).toEqual([]);
        });

        it('should return all versions for document', () => {
            saveVersion(testDocId, 'Version 1');
            saveVersion(testDocId, 'Version 2');

            const versions = getVersions(testDocId);

            expect(versions.length).toBe(2);
        });

        it('should return versions in reverse chronological order', () => {
            saveVersion(testDocId, 'First');
            saveVersion(testDocId, 'Second');

            const versions = getVersions(testDocId);

            expect(versions[0]?.content).toBe('Second');
            expect(versions[1]?.content).toBe('First');
        });
    });

    describe('getVersion', () => {
        it('should return specific version by ID', () => {
            const saved = saveVersion(testDocId, 'Test content');
            // biome-ignore lint/style/noNonNullAssertion: Version is created in saveVersion
            const versionId = saved.version!.id;

            const version = getVersion(testDocId, versionId);

            expect(version).not.toBeNull();
            expect(version?.content).toBe('Test content');
        });

        it('should return null for non-existent version', () => {
            const version = getVersion(testDocId, 'non-existent');

            expect(version).toBeNull();
        });

        it('should return null for wrong document', () => {
            const saved = saveVersion(testDocId, 'Content');
            // biome-ignore lint/style/noNonNullAssertion: Version is created in saveVersion
            const version = getVersion('other-doc', saved.version!.id);

            expect(version).toBeNull();
        });
    });

    describe('deleteVersion', () => {
        it('should delete specific version', () => {
            const v1 = saveVersion(testDocId, 'Version 1');
            saveVersion(testDocId, 'Version 2');
            // biome-ignore lint/style/noNonNullAssertion: Version is created in saveVersion
            const result = deleteVersion(testDocId, v1.version!.id);

            expect(result).toBe(true);
            expect(getVersions(testDocId).length).toBe(1);
        });

        it('should return false for non-existent version', () => {
            const result = deleteVersion(testDocId, 'non-existent');

            expect(result).toBe(false);
        });

        it('should remove storage key when last version deleted', () => {
            const saved = saveVersion(testDocId, 'Only version');
            // biome-ignore lint/style/noNonNullAssertion: Version is created in saveVersion
            deleteVersion(testDocId, saved.version!.id);

            expect(getVersions(testDocId)).toEqual([]);
        });
    });

    describe('deleteAllVersions', () => {
        it('should delete all versions for document', () => {
            saveVersion(testDocId, 'Version 1');
            saveVersion(testDocId, 'Version 2');

            const result = deleteAllVersions(testDocId);

            expect(result).toBe(true);
            expect(getVersions(testDocId)).toEqual([]);
        });

        it('should return true even if no versions exist', () => {
            const result = deleteAllVersions(testDocId);

            expect(result).toBe(true);
        });
    });

    describe('updateVersionLabel', () => {
        it('should update version label', () => {
            const saved = saveVersion(testDocId, 'Content', 'Old Label');
            // biome-ignore lint/style/noNonNullAssertion: Version is created in saveVersion
            const versionId = saved.version!.id;

            const result = updateVersionLabel(testDocId, versionId, 'New Label');

            expect(result).toBe(true);
            const version = getVersion(testDocId, versionId);
            expect(version?.label).toBe('New Label');
        });

        it('should return false for non-existent version', () => {
            const result = updateVersionLabel(testDocId, 'non-existent', 'Label');

            expect(result).toBe(false);
        });
    });

    describe('getVersionCount', () => {
        it('should return 0 for no versions', () => {
            expect(getVersionCount(testDocId)).toBe(0);
        });

        it('should return correct count', () => {
            saveVersion(testDocId, 'V1');
            saveVersion(testDocId, 'V2');
            saveVersion(testDocId, 'V3');

            expect(getVersionCount(testDocId)).toBe(3);
        });
    });

    describe('hasVersions', () => {
        it('should return false for no versions', () => {
            expect(hasVersions(testDocId)).toBe(false);
        });

        it('should return true when versions exist', () => {
            saveVersion(testDocId, 'Content');

            expect(hasVersions(testDocId)).toBe(true);
        });
    });

    describe('diffVersions', () => {
        it('should detect unchanged lines', () => {
            const diff = diffVersions('line1\nline2', 'line1\nline2');

            expect(diff).toHaveLength(2);
            expect(diff[0]?.type).toBe('unchanged');
            expect(diff[1]?.type).toBe('unchanged');
        });

        it('should detect added lines', () => {
            const diff = diffVersions('line1', 'line1\nline2');

            expect(diff).toHaveLength(2);
            expect(diff[0]?.type).toBe('unchanged');
            expect(diff[1]?.type).toBe('added');
            expect(diff[1]?.line).toBe('line2');
        });

        it('should detect removed lines', () => {
            const diff = diffVersions('line1\nline2', 'line1');

            expect(diff).toHaveLength(2);
            expect(diff[0]?.type).toBe('unchanged');
            expect(diff[1]?.type).toBe('removed');
            expect(diff[1]?.line).toBe('line2');
        });

        it('should detect changed lines', () => {
            const diff = diffVersions('old line', 'new line');

            expect(diff).toHaveLength(2);
            expect(diff[0]?.type).toBe('removed');
            expect(diff[0]?.line).toBe('old line');
            expect(diff[1]?.type).toBe('added');
            expect(diff[1]?.line).toBe('new line');
        });

        it('should include line numbers', () => {
            const diff = diffVersions('a\nb\nc', 'a\nb\nc');

            expect(diff[0]?.lineNumber).toBe(1);
            expect(diff[1]?.lineNumber).toBe(2);
            expect(diff[2]?.lineNumber).toBe(3);
        });

        it('should handle empty strings', () => {
            const diff = diffVersions('', '');

            expect(diff).toHaveLength(1);
            expect(diff[0]?.type).toBe('unchanged');
            expect(diff[0]?.line).toBe('');
        });

        it('should handle adding to empty', () => {
            const diff = diffVersions('', 'new content');

            // Empty string has one empty line, so we get removed + added
            expect(diff).toHaveLength(2);
            expect(diff[0]?.type).toBe('removed');
            expect(diff[1]?.type).toBe('added');
        });
    });
});
