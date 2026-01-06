import type { Session, User } from 'better-auth';
import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { connectionManager } from '../../sse/connectionManager';
import { getAuthUser } from '../middleware/auth';

type Variables = {
    user: User | null;
    session: Session | null;
};

const sseRoutes = new Hono<{ Variables: Variables }>();

// ============================================================================
// SSE Connection Endpoint
// ============================================================================

/**
 * GET /api/sync/sse
 *
 * Establishes a Server-Sent Events connection for real-time sync.
 * Query params:
 *   - deviceId: Unique identifier for this device/tab
 *
 * Events sent:
 *   - connected: { connectionId, deviceId }
 *   - document:updated: { documentId, syncVersion, originDeviceId }
 *   - document:deleted: { documentId, originDeviceId }
 *   - folder:updated: { folderId, originDeviceId }
 *   - folder:deleted: { folderId, originDeviceId }
 *   - settings:updated: { originDeviceId }
 *   - session:updated: { openDocumentIds, activeDocumentId, originDeviceId }
 *   - heartbeat: { timestamp }
 */
sseRoutes.get('/', async (c) => {
    const user = getAuthUser(c);
    const deviceId = c.req.query('deviceId');

    if (!deviceId) {
        return c.json({ error: 'deviceId query parameter is required' }, 400);
    }

    // Set SSE headers
    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');
    c.header('X-Accel-Buffering', 'no'); // Disable nginx buffering

    return streamSSE(c, async (stream) => {
        const connectionId = connectionManager.addConnection(user.id, deviceId, stream);
        let isAborted = false;

        // Handle disconnect
        stream.onAbort(() => {
            isAborted = true;
            connectionManager.removeConnection(connectionId);
            console.log(`[SSE] Client disconnected: ${connectionId}`);
        });

        // Send connection confirmation
        await stream.writeSSE({
            event: 'connected',
            data: JSON.stringify({
                connectionId,
                deviceId,
                userId: user.id
            })
        });

        // Keep the connection alive with periodic heartbeats
        // This loop runs until the client disconnects
        while (!isAborted) {
            try {
                // Wait 30 seconds between heartbeats
                await stream.sleep(30000);

                if (isAborted) break;

                // Send heartbeat
                await stream.writeSSE({
                    event: 'heartbeat',
                    data: JSON.stringify({ timestamp: Date.now() })
                });
                connectionManager.updateHeartbeat(connectionId);
            } catch {
                // Connection is dead
                break;
            }
        }

        // Cleanup when loop exits
        connectionManager.removeConnection(connectionId);
    });
});

// ============================================================================
// SSE Stats Endpoint (for debugging)
// ============================================================================

/**
 * GET /api/sync/sse/stats
 * Returns statistics about current SSE connections
 */
sseRoutes.get('/stats', (c) => {
    const user = getAuthUser(c);
    const stats = connectionManager.getStats();
    const userConnections = connectionManager.getConnectionsForUser(user.id);

    return c.json({
        global: stats,
        user: {
            connections: userConnections.length,
            devices: userConnections.map((conn) => ({
                deviceId: conn.deviceId,
                connectedAt: new Date(conn.createdAt).toISOString(),
                lastHeartbeat: new Date(conn.lastHeartbeat).toISOString()
            }))
        }
    });
});

export default sseRoutes;
