import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const TransactionSchema = z.object({
  cashboxId: z.string(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive(),
  description: z.string().optional(),
  referenceId: z.string().optional(),
});

// GET /api/cashbox/transactions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cashboxId = searchParams.get('cashboxId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (cashboxId) where.cashboxId = cashboxId;

    const transactions = await prisma.cashTransaction.findMany({
      where,
      include: { cashbox: { select: { name: true, type: true, currency: true } } },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cashbox/transactions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = TransactionSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: 'Noto\'g\'ri ma\'lumot' }, { status: 400 });

    const { cashboxId, type, amount, description, referenceId } = result.data;

    const cashbox = await prisma.cashbox.findUnique({ where: { id: cashboxId } });
    if (!cashbox) return NextResponse.json({ error: 'Kassa topilmadi' }, { status: 404 });

    // Update balance
    const balanceChange = type === 'EXPENSE' ? -amount : amount;

    const [transaction] = await prisma.$transaction([
      prisma.cashTransaction.create({
        data: { cashboxId, type, amount, description, referenceId },
      }),
      prisma.cashbox.update({
        where: { id: cashboxId },
        data: { balance: { increment: balanceChange } },
      }),
    ]);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}