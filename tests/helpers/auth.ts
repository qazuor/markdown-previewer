import { vi } from 'vitest';

/**
 * Create mock Better Auth client
 */
export function createMockAuthClient() {
    return {
        signIn: {
            social: vi.fn().mockResolvedValue({ user: null, error: null })
        },
        signOut: vi.fn().mockResolvedValue(undefined),
        useSession: vi.fn().mockReturnValue({
            data: null,
            isPending: false,
            error: null
        }),
        getSession: vi.fn().mockResolvedValue(null)
    };
}

/**
 * Create mock auth handler for Hono
 */
export function createMockAuthHandler() {
    return {
        handler: vi.fn().mockImplementation(async (c) => {
            return c.json({ ok: true });
        }),
        api: {
            getSession: vi.fn().mockResolvedValue(null)
        }
    };
}

/**
 * Mock fetch for external API calls
 */
export function createMockFetch(
    responses: Array<{
        ok: boolean;
        status: number;
        data?: unknown;
        headers?: Record<string, string>;
    }> = []
) {
    let callIndex = 0;

    return vi.fn().mockImplementation(() => {
        const response = responses[callIndex] || { ok: true, status: 200, data: {} };
        callIndex++;

        return Promise.resolve({
            ok: response.ok,
            status: response.status,
            json: () => Promise.resolve(response.data),
            text: () => Promise.resolve(JSON.stringify(response.data)),
            headers: new Headers(response.headers || {})
        });
    });
}
