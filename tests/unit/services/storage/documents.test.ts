import {
    deleteDocument,
    documentExists,
    getDocumentCount,
    getDocumentList,
    loadAllDocuments,
    loadDocument,
    saveCursorPosition,
    saveDocument,
    saveScrollPosition,
    toDocument
} from '@/services/storage/documents';
import type { StoredDocument } from '@/services/storage/documents';
import type { Document } from '@/types';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('documents storage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    const createMockDocument = (overrides: Partial<Document> = {}): Document => ({
        id: 'doc-123',
        name: 'Test Document',
        content: '# Hello World',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
        syncStatus: 'local',
        isManuallyNamed: false,
        source: 'local',
        cursor: { line: 1, column: 1 },
        scroll: { line: 1, percentage: 0 },
        ...overrides
    });

    const createStoredDocument = (overrides: Partial<StoredDocument> = {}): StoredDocument => ({
        id: 'doc-123',
        name: 'Test Document',
        content: '# Hello World',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
        isManuallyNamed: false,
        ...overrides
    });

    describe('saveDocument', () => {
        it('should save a document successfully', () => {
            const doc = createMockDocument();

            const result = saveDocument(doc);

            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should store document data in localStorage', () => {
            const doc = createMockDocument({ id: 'my-doc' });

            saveDocument(doc);

            const stored = localStorage.getItem('markview:doc:my-doc');
            expect(stored).toBeTruthy();
            const parsed = JSON.parse(stored!);
            expect(parsed.id).toBe('my-doc');
            expect(parsed.content).toBe('# Hello World');
        });

        it('should update document index', () => {
            const doc = createMockDocument();

            saveDocument(doc);

            const list = getDocumentList();
            expect(list).toHaveLength(1);
            expect(list[0]?.id).toBe('doc-123');
        });

        it('should handle Date createdAt correctly', () => {
            const doc = createMockDocument({
                createdAt: new Date('2024-06-01T12:00:00Z')
            });

            saveDocument(doc);

            const loaded = loadDocument(doc.id);
            expect(loaded?.createdAt).toBe('2024-06-01T12:00:00.000Z');
        });

        it('should set updatedAt to current time', () => {
            const doc = createMockDocument();
            const before = Date.now();

            saveDocument(doc);

            const loaded = loadDocument(doc.id);
            expect(loaded).not.toBeNull();
            const after = Date.now();
            const updatedAt = new Date(loaded!.updatedAt).getTime();
            expect(updatedAt).toBeGreaterThanOrEqual(before);
            expect(updatedAt).toBeLessThanOrEqual(after);
        });

        it('should update existing document', () => {
            const doc = createMockDocument();
            saveDocument(doc);

            const updatedDoc = createMockDocument({ content: '# Updated content' });
            saveDocument(updatedDoc);

            const loaded = loadDocument(doc.id);
            expect(loaded?.content).toBe('# Updated content');

            const list = getDocumentList();
            expect(list).toHaveLength(1);
        });
    });

    describe('loadDocument', () => {
        it('should load existing document', () => {
            const doc = createMockDocument();
            saveDocument(doc);

            const loaded = loadDocument(doc.id);

            expect(loaded).not.toBeNull();
            expect(loaded?.id).toBe('doc-123');
            expect(loaded?.content).toBe('# Hello World');
        });

        it('should return null for non-existent document', () => {
            const loaded = loadDocument('non-existent');

            expect(loaded).toBeNull();
        });

        it('should return null for invalid data', () => {
            localStorage.setItem('markview:doc:invalid', 'not-json');

            const loaded = loadDocument('invalid');

            expect(loaded).toBeNull();
        });
    });

    describe('deleteDocument', () => {
        it('should delete existing document', () => {
            const doc = createMockDocument();
            saveDocument(doc);

            const result = deleteDocument(doc.id);

            expect(result.success).toBe(true);
            expect(loadDocument(doc.id)).toBeNull();
        });

        it('should remove from document index', () => {
            const doc = createMockDocument();
            saveDocument(doc);

            deleteDocument(doc.id);

            const list = getDocumentList();
            expect(list).toHaveLength(0);
        });

        it('should succeed even if document does not exist', () => {
            const result = deleteDocument('non-existent');

            expect(result.success).toBe(true);
        });
    });

    describe('getDocumentList', () => {
        it('should return empty array when no documents', () => {
            const list = getDocumentList();

            expect(list).toEqual([]);
        });

        it('should return list of documents', () => {
            saveDocument(createMockDocument({ id: 'doc-1', name: 'Doc 1' }));
            saveDocument(createMockDocument({ id: 'doc-2', name: 'Doc 2' }));

            const list = getDocumentList();

            expect(list).toHaveLength(2);
        });

        it('should sort by updatedAt descending', () => {
            saveDocument(createMockDocument({ id: 'doc-1', name: 'First' }));

            // Wait a bit to ensure different timestamps
            const now = Date.now();
            while (Date.now() - now < 10) {
                // busy wait
            }

            saveDocument(createMockDocument({ id: 'doc-2', name: 'Second' }));

            const list = getDocumentList();

            expect(list[0]?.id).toBe('doc-2');
            expect(list[1]?.id).toBe('doc-1');
        });

        it('should include document metadata', () => {
            saveDocument(createMockDocument({ id: 'doc-1', name: 'My Doc', content: 'Hello' }));

            const list = getDocumentList();

            expect(list[0]?.name).toBe('My Doc');
            expect(list[0]?.size).toBe(5); // 'Hello'.length
        });
    });

    describe('documentExists', () => {
        it('should return true for existing document', () => {
            saveDocument(createMockDocument());

            expect(documentExists('doc-123')).toBe(true);
        });

        it('should return false for non-existent document', () => {
            expect(documentExists('non-existent')).toBe(false);
        });
    });

    describe('getDocumentCount', () => {
        it('should return 0 when no documents', () => {
            expect(getDocumentCount()).toBe(0);
        });

        it('should return correct count', () => {
            saveDocument(createMockDocument({ id: 'doc-1' }));
            saveDocument(createMockDocument({ id: 'doc-2' }));
            saveDocument(createMockDocument({ id: 'doc-3' }));

            expect(getDocumentCount()).toBe(3);
        });
    });

    describe('saveCursorPosition', () => {
        it('should save cursor position for existing document', () => {
            saveDocument(createMockDocument());

            saveCursorPosition('doc-123', 10, 5);

            const loaded = loadDocument('doc-123');
            expect(loaded?.cursorPosition).toEqual({ line: 10, column: 5 });
        });

        it('should not error for non-existent document', () => {
            expect(() => saveCursorPosition('non-existent', 1, 1)).not.toThrow();
        });

        it('should update existing cursor position', () => {
            saveDocument(createMockDocument());
            saveCursorPosition('doc-123', 1, 1);

            saveCursorPosition('doc-123', 20, 15);

            const loaded = loadDocument('doc-123');
            expect(loaded?.cursorPosition).toEqual({ line: 20, column: 15 });
        });
    });

    describe('saveScrollPosition', () => {
        it('should save scroll position for existing document', () => {
            saveDocument(createMockDocument());

            saveScrollPosition('doc-123', 100, 0);

            const loaded = loadDocument('doc-123');
            expect(loaded?.scrollPosition).toEqual({ top: 100, left: 0 });
        });

        it('should not error for non-existent document', () => {
            expect(() => saveScrollPosition('non-existent', 0, 0)).not.toThrow();
        });
    });

    describe('toDocument', () => {
        it('should convert stored document to Document', () => {
            const stored = createStoredDocument();

            const doc = toDocument(stored);

            expect(doc.id).toBe('doc-123');
            expect(doc.name).toBe('Test Document');
            expect(doc.content).toBe('# Hello World');
            expect(doc.createdAt).toBeInstanceOf(Date);
            expect(doc.updatedAt).toBeInstanceOf(Date);
            expect(doc.syncStatus).toBe('local');
            expect(doc.isManuallyNamed).toBe(false);
            expect(doc.source).toBe('local');
        });

        it('should use stored cursor position if available', () => {
            const stored = createStoredDocument({
                cursorPosition: { line: 5, column: 10 }
            });

            const doc = toDocument(stored);

            expect(doc.cursor).toEqual({ line: 5, column: 10 });
        });

        it('should use default cursor position if not available', () => {
            const stored = createStoredDocument();

            const doc = toDocument(stored);

            expect(doc.cursor).toEqual({ line: 1, column: 1 });
        });

        it('should set default scroll position', () => {
            const stored = createStoredDocument();

            const doc = toDocument(stored);

            expect(doc.scroll).toEqual({ line: 1, percentage: 0 });
        });
    });

    describe('loadAllDocuments', () => {
        it('should return empty array when no documents', () => {
            const docs = loadAllDocuments();

            expect(docs).toEqual([]);
        });

        it('should load all documents', () => {
            saveDocument(createMockDocument({ id: 'doc-1', name: 'Doc 1' }));
            saveDocument(createMockDocument({ id: 'doc-2', name: 'Doc 2' }));

            const docs = loadAllDocuments();

            expect(docs).toHaveLength(2);
        });

        it('should return Document objects', () => {
            saveDocument(createMockDocument());

            const docs = loadAllDocuments();

            expect(docs[0]).toHaveProperty('createdAt');
            expect(docs[0]?.createdAt).toBeInstanceOf(Date);
            expect(docs[0]).toHaveProperty('syncStatus');
            expect(docs[0]).toHaveProperty('source');
        });

        it('should skip documents that fail to load', () => {
            saveDocument(createMockDocument({ id: 'valid-doc' }));

            // Corrupt index to include non-existent document
            const index = JSON.parse(localStorage.getItem('markview:documents') || '{}');
            index['invalid-doc'] = { id: 'invalid-doc', name: 'Invalid', updatedAt: new Date().toISOString(), size: 0 };
            localStorage.setItem('markview:documents', JSON.stringify(index));

            const docs = loadAllDocuments();

            expect(docs).toHaveLength(1);
            expect(docs[0]?.id).toBe('valid-doc');
        });
    });
});
