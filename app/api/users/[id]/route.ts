import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email noto'g'ri").optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  warehouseId: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, "Parol kamida 6 belgi bo'lishi kerak"),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'tmagan' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        permissions: true,
        warehouseId: true,
        warehouse: true,
        subscriptions: {
          orderBy: { dueDate: 'desc' },
          take: 12,
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User topilmadi' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin huquqi talab qilinadi' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = UpdateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: result.data,
      include: {
        warehouse: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('PUT /api/users/[id] error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User topilmadi' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu email allaqachon band' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin huquqi talab qilinadi' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User o\'chirildi' });
  } catch (error: any) {
    console.error('DELETE /api/users/[id] error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'tmagan' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.type === 'password') {
      if ((session?.user as any)?.id !== id && (session?.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Huquq yetarli emas' }, { status: 403 });
      }

      const result = ChangePasswordSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({
          error: 'Validatsiya xatosi',
          details: result.error.issues.map(e => e.message),
        }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return NextResponse.json({ error: 'User topilmadi' }, { status: 404 });
      }

      const isValid = await bcrypt.compare(result.data.currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Joriy parol noto\'g\'ri' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(result.data.newPassword, 10);
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ message: 'Parol o\'zgartirildi' });
    }

    return NextResponse.json({ error: 'Noma\'lum operatsiya' }, { status: 400 });
  } catch (error) {
    console.error('PATCH /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}