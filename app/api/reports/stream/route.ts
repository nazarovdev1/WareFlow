import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

interface ReportUpdates {
  sales: any[];
  purchases: any[];
  inventory: any[];
  cash: any[];
  debts: any[];
  lastCheck: Date;
}

async function fetchRecentUpdates(): Promise<ReportUpdates> {
  return {
    sales: [],
    purchases: [],
    inventory: [],
    cash: [],
    debts: [],
    lastCheck: new Date(),
  };
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`));

        const sendUpdates = async () => {
          try {
            const updates = await fetchRecentUpdates();

            if (updates.sales.length > 0) {
              controller.enqueue(encoder.encode(`event: sales_update\ndata: ${JSON.stringify(updates.sales)}\n\n`));
            }
            if (updates.purchases.length > 0) {
              controller.enqueue(encoder.encode(`event: purchase_update\ndata: ${JSON.stringify(updates.purchases)}\n\n`));
            }
            if (updates.inventory.length > 0) {
              controller.enqueue(encoder.encode(`event: inventory_update\ndata: ${JSON.stringify(updates.inventory)}\n\n`));
            }
            if (updates.cash.length > 0) {
              controller.enqueue(encoder.encode(`event: cash_update\ndata: ${JSON.stringify(updates.cash)}\n\n`));
            }
            if (updates.debts.length > 0) {
              controller.enqueue(encoder.encode(`event: debt_update\ndata: ${JSON.stringify(updates.debts)}\n\n`));
            }

            controller.enqueue(encoder.encode(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`));
          } catch (err) {
            console.error('SSE update error:', err);
          }
        };

        await sendUpdates();

        const interval = setInterval(sendUpdates, 10000);

        req.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      } catch (err) {
        console.error('SSE start error:', err);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}