import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, phone: true, role: true, warehouseId: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('GET /api/settings/profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if new email is already taken by another user
    if (email && email !== session.user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
    }

    // Check if new phone is already taken by another user
    if (phone) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { phone: true },
      });
      if (phone !== currentUser?.phone) {
        const phoneTaken = await prisma.user.findUnique({ where: { phone } });
        if (phoneTaken) {
          return NextResponse.json({ error: 'Phone already in use' }, { status: 400 });
        }
      }
    }

    const updateData: any = { name };
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('PUT /api/settings/profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
