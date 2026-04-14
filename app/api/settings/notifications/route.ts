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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse notification settings from user metadata or return defaults
    // For now, return default settings (can be extended to store in DB)
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

    // In a real app, you would save this to a user_settings table
    // For now, we'll just acknowledge the update
    // You can create a UserSettings model in Prisma if needed

    return NextResponse.json({
      message: 'Notification settings updated',
      settings: { email, push, lowStock, orders },
    });
  } catch (error) {
    console.error('PUT /api/settings/notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
