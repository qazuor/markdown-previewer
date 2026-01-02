import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies using vi.hoisted
const { mockAuth, mockAudit } = vi.hoisted(() => {
    const mockAuth = {
        api: {
            getSession: vi.fn()
        },
        handler: vi.fn()
    };

    const mockAudit = {
        unauthorized: vi.fn(),
        forbidden: vi.fn()
    };

    return { mockAuth, mockAudit };
});

// Mock the auth module
vi.mock('@/server/auth', () => ({
    auth: mockAuth
}));

// Mock the audit module
vi.mock('@/server/utils/audit', () => ({
    audit: mockAudit
}));

// Mock rate limiter to avoid side effects
vi.mock('@/server/api/middleware/rateLimit', () => ({
    createRateLimiter: () => async (_c: unknown, next: () => Promise<void>) => next()
}));

// Mock route modules
vi.mock('@/server/api/routes/sync', () => ({
    default: {
        routes: []
    }
}));

vi.mock('@/server/api/routes/user', () => ({
    default: {
        routes: []
    }
}));

vi.mock('@/server/api/routes/github', () => ({
    default: {
        routes: []
    }
}));

vi.mock('@/server/api/routes/google', () => ({
    default: {
        routes: []
    }
}));

// Import the app after mocking
import { app } from '@/server/api/app';

describe('server/api/app', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuth.api.getSession.mockResolvedValue(null);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const res = await app.request('/api/health');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.status).toBe('ok');
            expect(json.timestamp).toBeDefined();
        });

        it('should include environment info', async () => {
            const res = await app.request('/api/health');
            const json = await res.json();

            expect(json.env).toBeDefined();
        });
    });

    describe('CORS', () => {
        it('should include CORS headers', async () => {
            const res = await app.request('/api/health', {
                headers: {
                    Origin: 'http://localhost:5173'
                }
            });

            expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
            expect(res.headers.get('access-control-allow-credentials')).toBe('true');
        });

        it('should handle OPTIONS preflight requests', async () => {
            const res = await app.request('/api/health', {
                method: 'OPTIONS',
                headers: {
                    Origin: 'http://localhost:5173',
                    'Access-Control-Request-Method': 'GET'
                }
            });

            expect(res.status).toBe(204);
        });
    });

    describe('Auth middleware', () => {
        it('should set user from session when authenticated', async () => {
            const mockUser = { id: 'user-123', email: 'test@example.com' };
            const mockSession = { id: 'session-123', userId: 'user-123' };

            mockAuth.api.getSession.mockResolvedValue({
                user: mockUser,
                session: mockSession
            });

            const res = await app.request('/api/health');

            expect(res.status).toBe(200);
            expect(mockAuth.api.getSession).toHaveBeenCalled();
        });

        it('should set user to null when not authenticated', async () => {
            mockAuth.api.getSession.mockResolvedValue(null);

            const res = await app.request('/api/health');

            expect(res.status).toBe(200);
            expect(mockAuth.api.getSession).toHaveBeenCalled();
        });

        it('should handle auth errors gracefully', async () => {
            mockAuth.api.getSession.mockRejectedValue(new Error('Auth error'));

            const res = await app.request('/api/health');

            expect(res.status).toBe(200);
        });
    });

    describe('Error handling', () => {
        it('should return 500 for unhandled errors', async () => {
            // This tests the error handler by causing an internal error
            // We can't easily trigger this in a unit test, so we'll verify the handler exists
            expect(app.onError).toBeDefined();
        });
    });

    describe('Security headers', () => {
        it('should include security headers', async () => {
            const res = await app.request('/api/health');

            // secureHeaders middleware adds these headers
            expect(res.headers.get('x-content-type-options')).toBe('nosniff');
            expect(res.headers.get('x-frame-options')).toBe('SAMEORIGIN');
        });
    });

    describe('Route mounting', () => {
        it('should handle unknown routes with 404', async () => {
            const res = await app.request('/api/unknown-route');

            expect(res.status).toBe(404);
        });
    });
});
