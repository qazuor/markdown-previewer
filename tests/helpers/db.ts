import { vi } from 'vitest';

/**
 * Create mock Drizzle query builder
 */
export function createMockDb() {
    const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        and: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
        execute: vi.fn().mockResolvedValue([])
    };

    return mockQueryBuilder;
}

/**
 * Create mock document for testing
 */
export function createMockDocument(overrides: Record<string, unknown> = {}) {
    return {
        id: 'doc-123',
        userId: 'user-123',
        name: 'Test Document',
        content: '# Hello World',
        folderId: null,
        isManuallyNamed: false,
        cursor: null,
        scroll: null,
        syncVersion: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        syncedAt: new Date('2024-01-01'),
        deletedAt: null,
        ...overrides
    };
}

/**
 * Create mock folder for testing
 */
export function createMockFolder(overrides: Record<string, unknown> = {}) {
    return {
        id: 'folder-123',
        userId: 'user-123',
        name: 'Test Folder',
        parentId: null,
        color: null,
        sortOrder: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
        ...overrides
    };
}

/**
 * Create mock user settings for testing
 */
export function createMockUserSettings(overrides: Record<string, unknown> = {}) {
    return {
        id: 'settings-123',
        userId: 'user-123',
        settings: {},
        updatedAt: new Date('2024-01-01'),
        ...overrides
    };
}

/**
 * Create mock account (OAuth provider) for testing
 */
export function createMockAccount(overrides: Record<string, unknown> = {}) {
    return {
        id: 'account-123',
        userId: 'user-123',
        accountId: 'github-user-123',
        providerId: 'github',
        accessToken: 'mock-access-token',
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: 'user:email repo',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        ...overrides
    };
}
