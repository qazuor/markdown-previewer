import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies before importing the routes
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([])
    })
});
const mockInsert = vi.fn().mockReturnValue({
    values: vi.fn().mockResolvedValue([])
});
const mockDelete = vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue([])
});

vi.mock('@/server/db', () => ({
    db: {
        query: {
            userSettings: {
                findFirst: (...args: unknown[]) => mockFindFirst(...args)
            }
        },
        update: (...args: unknown[]) => mockUpdate(...args),
        insert: (...args: unknown[]) => mockInsert(...args),
        delete: (...args: unknown[]) => mockDelete(...args)
    },
    userSettings: {
        userId: 'userId',
        settings: 'settings',
        updatedAt: 'updatedAt'
    }
}));

const mockGetAuthUser = vi.fn();
vi.mock('@/server/api/middleware/auth', () => ({
    getAuthUser: () => mockGetAuthUser()
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn((a, b) => ({ field: a, value: b }))
}));

vi.mock('@hono/zod-validator', () => ({
    zValidator: () => vi.fn((_c, next) => next())
}));

// Import the routes after mocking
import userRoutes from '@/server/api/routes/user';

describe('User Routes', () => {
    let app: Hono;

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock user
        mockGetAuthUser.mockReturnValue({
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            image: 'https://example.com/avatar.png'
        });

        // Create a new app with the routes for each test
        app = new Hono();
        app.route('/api/user', userRoutes);
    });

    describe('GET /me', () => {
        it('should return current user info', async () => {
            const res = await app.request('/api/user/me');
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.user).toEqual({
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
                image: 'https://example.com/avatar.png'
            });
        });

        it('should return user without image', async () => {
            mockGetAuthUser.mockReturnValue({
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
                image: null
            });

            const res = await app.request('/api/user/me');
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.user.image).toBeNull();
        });
    });

    describe('GET /settings', () => {
        it('should return user settings when they exist', async () => {
            mockFindFirst.mockResolvedValue({
                id: 'settings-1',
                userId: 'user-1',
                settings: { theme: 'dark', fontSize: 16 }
            });

            const res = await app.request('/api/user/settings');
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.settings).toEqual({ theme: 'dark', fontSize: 16 });
        });

        it('should return empty settings when none exist', async () => {
            mockFindFirst.mockResolvedValue(null);

            const res = await app.request('/api/user/settings');
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.settings).toEqual({});
        });
    });

    describe('PUT /settings', () => {
        it('should require settings in body', async () => {
            const res = await app.request('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            // Validation error or server error expected without proper body
            expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('DELETE /settings', () => {
        it('should delete user settings', async () => {
            const mockWhereReturn = vi.fn().mockResolvedValue([]);
            mockDelete.mockReturnValue({
                where: mockWhereReturn
            });

            const res = await app.request('/api/user/settings', {
                method: 'DELETE'
            });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.settings).toEqual({});
        });
    });
});
