import type { Session, User } from 'better-auth';
import type { Context } from 'hono';
import { vi } from 'vitest';

/**
 * Create a mock User object
 */
export function createMockUser(overrides: Partial<User> = {}): User {
    return {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.png',
        emailVerified: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        ...overrides
    };
}

/**
 * Create a mock Session object
 */
export function createMockSession(overrides: Partial<Session> = {}): Session {
    return {
        id: 'session-123',
        userId: 'user-123',
        token: 'mock-session-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        ...overrides
    };
}

type AuthVariables = {
    user: User | null;
    session: Session | null;
};

/**
 * Create a mock Hono Context
 */
export function createMockContext(
    options: {
        user?: User | null;
        session?: Session | null;
        headers?: Record<string, string>;
        body?: unknown;
        params?: Record<string, string>;
        query?: Record<string, string>;
    } = {}
): Context<{ Variables: AuthVariables }> {
    const { user = null, session = null, headers = {}, body = {}, params = {}, query = {} } = options;

    const variables: AuthVariables = { user, session };

    const mockRequest = {
        header: vi.fn((name: string) => headers[name.toLowerCase()]),
        json: vi.fn().mockResolvedValue(body),
        param: vi.fn((name: string) => params[name]),
        query: vi.fn((name: string) => query[name]),
        queries: vi.fn((name: string) => (query[name] ? [query[name]] : [])),
        url: 'http://localhost:3000/api/test',
        method: 'GET'
    };

    return {
        get: vi.fn((key: string) => {
            if (key === 'user') return variables.user;
            if (key === 'session') return variables.session;
            return undefined;
        }),
        set: vi.fn((key: string, value: unknown) => {
            if (key === 'user') variables.user = value as User | null;
            if (key === 'session') variables.session = value as Session | null;
        }),
        req: mockRequest,
        json: vi.fn(),
        text: vi.fn(),
        status: vi.fn().mockReturnThis(),
        header: vi.fn(),
        body: vi.fn()
    } as unknown as Context<{ Variables: AuthVariables }>;
}

/**
 * Create a mock next function for middleware testing
 */
export function createMockNext() {
    return vi.fn().mockResolvedValue(undefined);
}
