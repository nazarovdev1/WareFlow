import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getToken } from 'next-auth/jwt';

async function callTelegramAPI(token: string, method: string, body?: Record<string, any>) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || (token as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { chatId, message, parseMode, botConfigId, broadcast } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (broadcast) {
      const configId = botConfigId;
      if (!configId) {
        return NextResponse.json({ error: 'botConfigId is required for broadcast' }, { status: 400 });
      }

      const config = await prisma.telegramBotConfig.findUnique({ where: { id: configId } });
      if (!config) {
        return NextResponse.json({ error: 'Bot config not found' }, { status: 404 });
      }

      const chats = await prisma.telegramChat.findMany({
        where: { botConfigId: configId, isActive: true },
      });

      if (chats.length === 0) {
        return NextResponse.json({ error: 'No active chats found for this bot' }, { status: 404 });
      }

      const results = await Promise.allSettled(
        chats.map(chat =>
          callTelegramAPI(config.botToken, 'sendMessage', {
            chat_id: chat.chatId,
            text: message,
            parse_mode: parseMode || 'HTML',
          })
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return NextResponse.json({
        message: `Broadcast sent to ${succeeded} chats`,
        succeeded,
        failed,
        total: chats.length,
      });
    }

    if (!chatId) {
      return NextResponse.json({ error: 'chatId is required for direct message' }, { status: 400 });
    }

    const chat = await prisma.telegramChat.findUnique({ where: { chatId } });
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const config = await prisma.telegramBotConfig.findUnique({ where: { id: chat.botConfigId } });
    if (!config) {
      return NextResponse.json({ error: 'Bot config not found' }, { status: 404 });
    }

    const result = await callTelegramAPI(config.botToken, 'sendMessage', {
      chat_id: chatId,
      text: message,
      parse_mode: parseMode || 'HTML',
    });

    if (!result.ok) {
      return NextResponse.json({
        error: 'Failed to send message',
        details: result.description,
      }, { status: 502 });
    }

    return NextResponse.json({
      message: 'Message sent successfully',
      result,
    });
  } catch (error) {
    console.error('POST /api/telegram/send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
