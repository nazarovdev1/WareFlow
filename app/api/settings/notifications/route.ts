import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET user notification settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { settings: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return settings if exist, otherwise defaults
    if (user.settings) {
      return NextResponse.json({
        email: user.settings.emailNotifications,
        push: user.settings.pushNotifications,
        lowStock: user.settings.lowStockAlerts,
        orders: user.settings.orderNotifications,
      });
    }

    // Return defaults
    return NextResponse.json({
      email: true,
      push: false,
      lowStock: true,
      orders: true,
    });
  } catch (error) {
    console.error('GET /api/settings/notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update notification settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, push, lowStock, orders } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upsert user settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        emailNotifications: email ?? true,
        pushNotifications: push ?? false,
        lowStockAlerts: lowStock ?? true,
        orderNotifications: orders ?? true,
      },
      create: {
        userId: user.id,
        emailNotifications: email ?? true,
        pushNotifications: push ?? false,
        lowStockAlerts: lowStock ?? true,
        orderNotifications: orders ?? true,
      },
    });

    return NextResponse.json({
      message: 'Notification settings updated',
      settings: {
        email: settings.emailNotifications,
        push: settings.pushNotifications,
        lowStock: settings.lowStockAlerts,
        orders: settings.orderNotifications,
      },
    });
  } catch (error) {
    console.error('PUT /api/settings/notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
