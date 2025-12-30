import type { Context } from 'hono';

/**
 * Audit event types
 */
export type AuditEventType =
    // Auth events
    | 'auth.login'
    | 'auth.logout'
    | 'auth.login.failed'
    | 'auth.token.refresh'
    | 'auth.token.revoked'
    // User events
    | 'user.settings.updated'
    | 'user.deleted'
    // Document events
    | 'document.created'
    | 'document.updated'
    | 'document.deleted'
    | 'document.synced'
    // Integration events
    | 'github.connected'
    | 'github.disconnected'
    | 'github.file.created'
    | 'github.file.updated'
    | 'github.file.deleted'
    | 'google.connected'
    | 'google.disconnected'
    | 'google.file.created'
    | 'google.file.updated'
    | 'google.file.deleted'
    // Security events
    | 'security.rate_limited'
    | 'security.unauthorized'
    | 'security.forbidden';

/**
 * Audit log entry
 */
export interface AuditLogEntry {
    timestamp: string;
    event: AuditEventType;
    userId: string | null;
    ip: string | null;
    userAgent: string | null;
    metadata: Record<string, unknown>;
    success: boolean;
    error?: string;
}

/**
 * Audit logger configuration
 */
interface AuditLoggerConfig {
    /** Enable console logging in development */
    consoleLog?: boolean;
    /** Enable structured JSON logging */
    jsonFormat?: boolean;
}

const config: AuditLoggerConfig = {
    consoleLog: process.env.NODE_ENV === 'development',
    jsonFormat: process.env.NODE_ENV === 'production'
};

/**
 * Get client IP from Hono context
 */
function getClientIP(c: Context): string | null {
    const xForwardedFor = c.req.header('x-forwarded-for');
    if (xForwardedFor) {
        const ip = xForwardedFor.split(',')[0];
        return ip ? ip.trim() : null;
    }

    const xRealIp = c.req.header('x-real-ip');
    if (xRealIp) {
        return xRealIp;
    }

    const cfConnectingIp = c.req.header('cf-connecting-ip');
    if (cfConnectingIp) {
        return cfConnectingIp;
    }

    return null;
}

/**
 * Get user agent from Hono context
 */
function getUserAgent(c: Context): string | null {
    return c.req.header('user-agent') || null;
}

/**
 * Format audit log entry for output
 */
function formatEntry(entry: AuditLogEntry): string {
    if (config.jsonFormat) {
        return JSON.stringify(entry);
    }

    const status = entry.success ? '✓' : '✗';
    const userInfo = entry.userId ? `user:${entry.userId}` : 'anonymous';
    const metaStr = Object.keys(entry.metadata).length > 0 ? ` | ${JSON.stringify(entry.metadata)}` : '';
    const errorStr = entry.error ? ` | error: ${entry.error}` : '';

    return `[AUDIT] ${entry.timestamp} ${status} ${entry.event} | ${userInfo} | ip:${entry.ip || 'unknown'}${metaStr}${errorStr}`;
}

/**
 * Log an audit event
 */
export function auditLog(
    event: AuditEventType,
    options: {
        c?: Context;
        userId?: string | null;
        success?: boolean;
        error?: string;
        metadata?: Record<string, unknown>;
    } = {}
): AuditLogEntry {
    const { c, userId = null, success = true, error, metadata = {} } = options;

    const entry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        event,
        userId: userId || (c ? c.get('user')?.id || null : null),
        ip: c ? getClientIP(c) : null,
        userAgent: c ? getUserAgent(c) : null,
        metadata,
        success,
        error
    };

    // Output the log
    if (config.consoleLog || config.jsonFormat) {
        const formatted = formatEntry(entry);

        if (success) {
            console.log(formatted);
        } else {
            console.warn(formatted);
        }
    }

    // In production, you would also:
    // - Send to external logging service (Sentry, LogRocket, etc.)
    // - Store in database for compliance
    // - Send to analytics

    return entry;
}

/**
 * Create audit logger bound to a context
 */
export function createAuditLogger(c: Context) {
    return {
        log: (
            event: AuditEventType,
            options: {
                success?: boolean;
                error?: string;
                metadata?: Record<string, unknown>;
            } = {}
        ) => auditLog(event, { c, ...options }),

        success: (event: AuditEventType, metadata?: Record<string, unknown>) => auditLog(event, { c, success: true, metadata }),

        failure: (event: AuditEventType, error: string, metadata?: Record<string, unknown>) =>
            auditLog(event, { c, success: false, error, metadata })
    };
}

// Pre-configured audit loggers for common events
export const audit = {
    // Auth events
    loginSuccess: (c: Context, provider: string) => auditLog('auth.login', { c, metadata: { provider } }),

    loginFailed: (c: Context, provider: string, error: string) =>
        auditLog('auth.login.failed', { c, success: false, error, metadata: { provider } }),

    logout: (c: Context) => auditLog('auth.logout', { c }),

    tokenRefresh: (c: Context, provider: string) => auditLog('auth.token.refresh', { c, metadata: { provider } }),

    // Security events
    rateLimited: (c: Context, endpoint: string) => auditLog('security.rate_limited', { c, success: false, metadata: { endpoint } }),

    unauthorized: (c: Context, endpoint: string) => auditLog('security.unauthorized', { c, success: false, metadata: { endpoint } }),

    forbidden: (c: Context, endpoint: string, reason?: string) =>
        auditLog('security.forbidden', { c, success: false, metadata: { endpoint, reason } }),

    // Document events
    documentCreated: (c: Context, documentId: string) => auditLog('document.created', { c, metadata: { documentId } }),

    documentUpdated: (c: Context, documentId: string) => auditLog('document.updated', { c, metadata: { documentId } }),

    documentDeleted: (c: Context, documentId: string) => auditLog('document.deleted', { c, metadata: { documentId } }),

    // Settings events
    settingsUpdated: (c: Context) => auditLog('user.settings.updated', { c }),

    // GitHub events
    githubFileCreated: (c: Context, repo: string, path: string) => auditLog('github.file.created', { c, metadata: { repo, path } }),

    githubFileUpdated: (c: Context, repo: string, path: string) => auditLog('github.file.updated', { c, metadata: { repo, path } }),

    githubFileDeleted: (c: Context, repo: string, path: string) => auditLog('github.file.deleted', { c, metadata: { repo, path } }),

    // Google events
    googleFileCreated: (c: Context, fileId: string, name: string) => auditLog('google.file.created', { c, metadata: { fileId, name } }),

    googleFileUpdated: (c: Context, fileId: string, name: string) => auditLog('google.file.updated', { c, metadata: { fileId, name } }),

    googleFileDeleted: (c: Context, fileId: string, name: string) => auditLog('google.file.deleted', { c, metadata: { fileId, name } })
};
