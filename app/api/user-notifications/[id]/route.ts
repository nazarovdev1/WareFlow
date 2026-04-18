import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PATCH: Notificationni o'qilgan deb belgilash
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'tmagan' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const { id } = await params;

    const notification = await prisma.userNotification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification topilmadi' }, { status: 404 });
    }

    await prisma.userNotification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({ message: 'O\'qilgan deb belgilandi' });
  } catch (error) {
    console.error('PATCH /api/user-notifications/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Notificationni o'chirish
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'tmagan' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const { id } = await params;

    const notification = await prisma.userNotification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification topilmadi' }, { status: 404 });
    }

    await prisma.userNotification.delete({ where: { id } });

    return NextResponse.json({ message: 'Notification o\'chirildi' });
  } catch (error) {
    console.error('DELETE /api/user-notifications/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
