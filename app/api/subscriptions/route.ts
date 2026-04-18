import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const CreateSubscriptionSchema = z.object({
  userId: z.string(),
  amount: z.number().positive("Summa musbat bo'lishi kerak"),
  currency: z.string().default("USD"),
  dueDate: z.string().transform(s => new Date(s)),
  note: z.string().optional(),
});

const UpdateSubscriptionSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  dueDate: z.string().transform(s => new Date(s)).optional(),
  isPaid: z.boolean().optional(),
  paidDate: z.string().transform(s => new Date(s)).optional(),
  note: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'tmagan' }, { status: 401 });
    }

    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const status = searchParams.get('status');
    const month = searchParams.get('month');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userIdParam) {
      where.userId = userIdParam;
    }

    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    if (month) {
      const startDate = new Date(month + '-01');
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      where.dueDate = {
        gte: startDate,
        lt: endDate,
      };
    }

    let subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        user: {
          include: { warehouse: true },
        },
      },
      skip,
      take: limit,
      orderBy: { dueDate: 'desc' },
    });

    if (status === 'overdue') {
      const now = new Date();
      subscriptions = subscriptions.filter(s => !s.isPaid && new Date(s.dueDate) < now);
    } else if (status === 'paid') {
      subscriptions = subscriptions.filter(s => s.isPaid);
    } else if (status === 'pending') {
      const now = new Date();
      subscriptions = subscriptions.filter(s => !s.isPaid && new Date(s.dueDate) >= now);
    }

    const total = await prisma.subscription.count({ where });

    return NextResponse.json({
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/subscriptions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin huquqi talab qilinadi' }, { status: 403 });
    }

    const body = await req.json();
    const result = CreateSubscriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { userId, amount, currency, dueDate, note } = result.data;

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        amount,
        currency,
        dueDate,
        note,
      },
      include: {
        user: {
          include: { warehouse: true },
        },
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('POST /api/subscriptions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}