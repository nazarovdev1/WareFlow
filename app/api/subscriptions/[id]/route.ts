import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const UpdateSubscriptionSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  dueDate: z.string().transform(s => new Date(s)).optional(),
  isPaid: z.boolean().optional(),
  paidDate: z.string().transform(s => new Date(s)).optional(),
  note: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const userRole = (session?.user as any)?.role;
    
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'tmagan' }, { status: 401 });
    }

    const { id } = await params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          include: { warehouse: true },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    if (userRole !== 'ADMIN' && subscription.userId !== userId) {
      return NextResponse.json({ error: 'Huquq yetarli emas' }, { status: 403 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('GET /api/subscriptions/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin huquqi talab qilinadi' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = UpdateSubscriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: result.data,
      include: {
        user: {
          include: { warehouse: true },
        },
      },
    });

    return NextResponse.json(subscription);
  } catch (error: any) {
    console.error('PUT /api/subscriptions/[id] error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin huquqi talab qilinadi' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.subscription.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'O\'chirildi' });
  } catch (error: any) {
    console.error('DELETE /api/subscriptions/[id] error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}