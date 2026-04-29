import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PATCH: Admin notificationni o'qilgan deb belgilash
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin huquqi talab qilinadi' }, { status: 403 });
    }

    const { id } = await params;

    const notification = await prisma.adminNotification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification topilmadi' }, { status: 404 });
    }

    await prisma.adminNotification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({ message: 'O\'qilgan deb belgilandi' });
  } catch (error) {
    console.error('PATCH /api/notifications/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Admin notificationni o'chirish
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin huquqi talab qilinadi' }, { status: 403 });
    }

    const { id } = await params;

    const notification = await prisma.adminNotification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification topilmadi' }, { status: 404 });
    }

    await prisma.adminNotification.delete({ where: { id } });

    return NextResponse.json({ message: 'Notification o\'chirildi' });
  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
