import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addClient, removeClient } from '@/lib/notifications/sse';

export function GET(req: NextRequest) {
  return new Promise<Response>(async (resolve) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        resolve(new Response('Unauthorized', { status: 401 }));
        return;
      }

      const userId = session.user.id;

      const stream = new ReadableStream({
        start(controller) {
          addClient(userId, controller);

          // Send initial connection message
          const data = JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() });
          controller.enqueue(`data: ${data}\n\n`);

          // Keep-alive ping every 30 seconds
          const keepAlive = setInterval(() => {
            try {
              controller.enqueue(':ping\n\n');
            } catch {
              clearInterval(keepAlive);
            }
          }, 30000);

          // Cleanup on close
          req.signal.addEventListener('abort', () => {
            clearInterval(keepAlive);
            removeClient(userId, controller);
          });
        },
      });

      resolve(
        new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
          },
        })
      );
    } catch {
      resolve(new Response('Internal Server Error', { status: 500 }));
    }
  });
}
