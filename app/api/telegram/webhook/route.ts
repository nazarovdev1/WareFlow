import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

async function callTelegramAPI(token: string, method: string, body?: Record<string, any>) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function sendMessage(token: string, chatId: string, text: string, parseMode: string = 'HTML') {
  return callTelegramAPI(token, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
  });
}

async function handleStart(token: string, chatId: string, config: any) {
  const welcome = config.welcomeMessage || (
    `👋 Welcome to <b>${config.botName || 'WareFlow Bot'}</b>!\n\n` +
    'Available commands:\n' +
    '/status — System status overview\n' +
    '/stock — Low stock alerts\n' +
    '/debt — Customer debts summary\n' +
    '/orders — Recent orders\n' +
    '/help — List all commands'
  );
  return sendMessage(token, chatId, welcome);
}

async function handleStatus(token: string, chatId: string) {
  try {
    const [totalProducts, cashboxes, customerDebt, supplierDebt, orderCount] = await Promise.all([
      prisma.product.count(),
      prisma.cashbox.findMany({ select: { balance: true, currency: true } }),
      prisma.customer.aggregate({ _sum: { balanceUSD: true, balanceUZS: true } }),
      prisma.supplier.aggregate({ _sum: { balanceUSD: true, balanceUZS: true } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
    ]);

    const cashUSD = cashboxes.filter(c => c.currency === 'USD').reduce((s, c) => s + c.balance, 0);
    const cashUZS = cashboxes.filter(c => c.currency === 'UZS').reduce((s, c) => s + c.balance, 0);

    const text =
      `📊 <b>System Status</b>\n\n` +
      `📦 Total Products: <b>${totalProducts}</b>\n` +
      `🛒 Completed Orders: <b>${orderCount}</b>\n\n` +
      `💰 <b>Cash:</b>\n` +
      `  USD: $${cashUSD.toFixed(2)}\n` +
      `  UZS: ${(cashUZS).toLocaleString()}\n\n` +
      `📥 Customer Debts:\n` +
      `  USD: $${(customerDebt._sum.balanceUSD || 0).toFixed(2)}\n` +
      `  UZS: ${(customerDebt._sum.balanceUZS || 0).toLocaleString()}\n\n` +
      `📤 Supplier Debts:\n` +
      `  USD: $${(supplierDebt._sum.balanceUSD || 0).toFixed(2)}\n` +
      `  UZS: ${(supplierDebt._sum.balanceUZS || 0).toLocaleString()}`;

    return sendMessage(token, chatId, text);
  } catch (error) {
    console.error('handleStatus error:', error);
    return sendMessage(token, chatId, '❌ Failed to fetch system status.');
  }
}

async function handleStock(token: string, chatId: string) {
  try {
    const lowStockEntries = await prisma.stockEntry.findMany({
      where: { quantity: { lte: 5 } },
      include: { product: { select: { name: true } }, warehouse: { select: { name: true } } },
      orderBy: { quantity: 'asc' },
      take: 20,
    });

    if (lowStockEntries.length === 0) {
      return sendMessage(token, chatId, '✅ No low stock products found. All items are well-stocked.');
    }

    const lines = lowStockEntries.map((entry: any) =>
      `  • ${entry.product.name} — <b>${entry.quantity}</b> (${entry.warehouse.name})`
    );

    const text =
      `⚠️ <b>Low Stock Products (${lowStockEntries.length})</b>\n\n` +
      lines.join('\n');

    return sendMessage(token, chatId, text);
  } catch (error) {
    console.error('handleStock error:', error);
    return sendMessage(token, chatId, '❌ Failed to fetch stock data.');
  }
}

async function handleDebt(token: string, chatId: string) {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { balanceUSD: { gt: 0 } },
          { balanceUZS: { gt: 0 } },
        ],
      },
      orderBy: { balanceUSD: 'desc' },
      take: 20,
    });

    if (customers.length === 0) {
      return sendMessage(token, chatId, '✅ No outstanding customer debts.');
    }

    const totalUSD = customers.reduce((s, c) => s + (c.balanceUSD || 0), 0);
    const totalUZS = customers.reduce((s, c) => s + (c.balanceUZS || 0), 0);

    const lines = customers.map((c: any) => {
      const parts: string[] = [];
      if (c.balanceUSD > 0) parts.push(`$${c.balanceUSD.toFixed(2)}`);
      if (c.balanceUZS > 0) parts.push(`${c.balanceUZS.toLocaleString()} UZS`);
      return `  • ${c.fullName} — ${parts.join(', ')}`;
    });

    const text =
      `💰 <b>Customer Debts (${customers.length})</b>\n\n` +
      lines.join('\n') +
      `\n\n📋 <b>Total:</b>\n  USD: $${totalUSD.toFixed(2)}\n  UZS: ${totalUZS.toLocaleString()}`;

    return sendMessage(token, chatId, text);
  } catch (error) {
    console.error('handleDebt error:', error);
    return sendMessage(token, chatId, '❌ Failed to fetch debt data.');
  }
}

async function handleOrders(token: string, chatId: string) {
  try {
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      include: {
        customer: { select: { fullName: true } },
        _count: { select: { items: true } },
      },
    });

    if (orders.length === 0) {
      return sendMessage(token, chatId, '📭 No orders found.');
    }

    const statusEmoji: Record<string, string> = {
      PENDING: '🕐',
      CONFIRMED: '✅',
      COMPLETED: '✔️',
      CANCELLED: '❌',
    };

    const lines = orders.map((o: any) => {
      const emoji = statusEmoji[o.status] || '📋';
      const customer = o.customer?.fullName || 'Unknown';
      const date = new Date(o.date).toLocaleDateString('uz-UZ');
      return `  ${emoji} <b>#${o.docNumber || o.id.slice(-6)}</b> — ${customer} | $${Number(o.finalAmount).toFixed(2)} | ${date}`;
    });

    const text =
      `📋 <b>Recent Orders (${orders.length})</b>\n\n` +
      lines.join('\n');

    return sendMessage(token, chatId, text);
  } catch (error) {
    console.error('handleOrders error:', error);
    return sendMessage(token, chatId, '❌ Failed to fetch orders.');
  }
}

async function handleHelp(token: string, chatId: string) {
  const text =
    `📖 <b>Available Commands</b>\n\n` +
    '/start — Welcome message & instructions\n' +
    '/status — System overview (products, cash, debts)\n' +
    '/stock — Low stock product alerts\n' +
    '/debt — Customer debts summary\n' +
    '/orders — Recent orders list\n' +
    '/help — Show this message';

  return sendMessage(token, chatId, text);
}

const commandHandlers: Record<string, (token: string, chatId: string, config?: any) => Promise<any>> = {
  '/start': (token, chatId, config) => handleStart(token, chatId, config),
  '/status': handleStatus,
  '/stock': handleStock,
  '/debt': handleDebt,
  '/orders': handleOrders,
  '/help': handleHelp,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.message || !body.message.chat) {
      return NextResponse.json({ ok: true });
    }

    const chat = body.message.chat;
    const text: string = body.message.text || '';
    const chatId = String(chat.id);

    const configs = await prisma.telegramBotConfig.findMany({ where: { isActive: true } });
    if (configs.length === 0) {
      return NextResponse.json({ ok: true });
    }

    const config = configs[0];
    const token = config.botToken;

    await prisma.telegramChat.upsert({
      where: { chatId },
      create: {
        chatId,
        chatType: chat.type || 'private',
        username: chat.username,
        firstName: chat.first_name,
        lastName: chat.last_name,
        botConfigId: config.id,
      },
      update: {
        chatType: chat.type || 'private',
        username: chat.username,
        firstName: chat.first_name,
        lastName: chat.last_name,
        isActive: true,
      },
    });

    if (!text.startsWith('/')) {
      return NextResponse.json({ ok: true });
    }

    const command = text.split(' ')[0].toLowerCase();
    const handler = commandHandlers[command];

    if (handler) {
      await handler(token, chatId, config);
    } else {
      await sendMessage(token, chatId, `❓ Unknown command: ${command}\nType /help to see available commands.`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/telegram/webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challenge = searchParams.get('hub.challenge');

    if (challenge) {
      return new Response(challenge, { status: 200 });
    }

    const configs = await prisma.telegramBotConfig.findMany({
      where: { isActive: true },
      select: {
        id: true,
        botName: true,
        isActive: true,
        _count: { select: { chats: true } },
      },
    });

    return NextResponse.json({
      status: 'ok',
      activeBots: configs.length,
      bots: configs,
    });
  } catch (error) {
    console.error('GET /api/telegram/webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
