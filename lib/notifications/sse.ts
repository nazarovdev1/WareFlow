// SSE notification broadcaster
// Global SSE clients store (in-memory for single instance)
// For production with multiple instances, use Redis Pub/Sub

const clients = new Map<string, Set<ReadableStreamDefaultController>>();

export function addClient(userId: string, controller: ReadableStreamDefaultController) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId)!.add(controller);
}

export function removeClient(userId: string, controller: ReadableStreamDefaultController) {
  clients.get(userId)?.delete(controller);
  if (clients.get(userId)?.size === 0) {
    clients.delete(userId);
  }
}

/**
 * Broadcast a notification to specific users or all connected clients
 */
export function broadcastNotification(
  notification: {
    type: 'stock_alert' | 'order' | 'info' | 'warning';
    title: string;
    message: string;
    link?: string;
    data?: Record<string, unknown>;
  },
  targetUserIds?: string[]
) {
  const payload = JSON.stringify({
    ...notification,
    timestamp: new Date().toISOString(),
  });

  const message = `data: ${payload}\n\n`;

  if (targetUserIds && targetUserIds.length > 0) {
    targetUserIds.forEach((userId) => {
      const userClients = clients.get(userId);
      userClients?.forEach((controller) => {
        try {
          controller.enqueue(message);
        } catch {
          userClients.delete(controller);
        }
      });
    });
  } else {
    clients.forEach((userClients) => {
      userClients.forEach((controller) => {
        try {
          controller.enqueue(message);
        } catch {
          userClients.delete(controller);
        }
      });
    });
  }
}

/**
 * Get connected clients count (for monitoring)
 */
export function getConnectedClientsCount(): number {
  let count = 0;
  clients.forEach((set) => {
    count += set.size;
  });
  return count;
}
