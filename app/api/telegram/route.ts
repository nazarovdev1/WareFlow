import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getToken } from 'next-auth/jwt';

async function checkAdmin(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return null;
  if ((token as any).role !== 'ADMIN') return null;
  return token;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const configs = await prisma.telegramBotConfig.findMany({
      include: {
        _count: { select: { chats: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: configs });
  } catch (error) {
    console.error('GET /api/telegram error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { botToken, botName, isActive, welcomeMessage, notifyNewOrder, notifyLowStock, notifyPayment, notifyDailyReport, dailyReportTime } = body;

    if (!botToken) {
      return NextResponse.json({ error: 'Bot token is required' }, { status: 400 });
    }

    const existing = await prisma.telegramBotConfig.findUnique({ where: { botToken } });
    if (existing) {
      return NextResponse.json({ error: 'A bot config with this token already exists' }, { status: 409 });
    }

    const config = await prisma.telegramBotConfig.create({
      data: {
        botToken,
        botName,
        isActive: isActive ?? true,
        welcomeMessage,
        notifyNewOrder: notifyNewOrder ?? true,
        notifyLowStock: notifyLowStock ?? true,
        notifyPayment: notifyPayment ?? true,
        notifyDailyReport: notifyDailyReport ?? true,
        dailyReportTime: dailyReportTime ?? '09:00',
      },
    });

    return NextResponse.json({ data: config }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/telegram error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bot token already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await checkAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, botToken, botName, isActive, welcomeMessage, notifyNewOrder, notifyLowStock, notifyPayment, notifyDailyReport, dailyReportTime } = body;

    if (!id) {
      return NextResponse.json({ error: 'Config ID is required' }, { status: 400 });
    }

    const existing = await prisma.telegramBotConfig.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Bot config not found' }, { status: 404 });
    }

    const config = await prisma.telegramBotConfig.update({
      where: { id },
      data: {
        ...(botToken !== undefined && { botToken }),
        ...(botName !== undefined && { botName }),
        ...(isActive !== undefined && { isActive }),
        ...(welcomeMessage !== undefined && { welcomeMessage }),
        ...(notifyNewOrder !== undefined && { notifyNewOrder }),
        ...(notifyLowStock !== undefined && { notifyLowStock }),
        ...(notifyPayment !== undefined && { notifyPayment }),
        ...(notifyDailyReport !== undefined && { notifyDailyReport }),
        ...(dailyReportTime !== undefined && { dailyReportTime }),
      },
    });

    return NextResponse.json({ data: config });
  } catch (error: any) {
    console.error('PUT /api/telegram error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bot token already in use' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await checkAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Config ID is required' }, { status: 400 });
    }

    const existing = await prisma.telegramBotConfig.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Bot config not found' }, { status: 404 });
    }

    await prisma.telegramBotConfig.delete({ where: { id } });

    return NextResponse.json({ message: 'Bot config deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/telegram error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
