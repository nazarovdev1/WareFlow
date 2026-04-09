import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/customer-transactions — Debtors list with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.customerTransaction.findMany({
        where,
        include: { customer: true },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.customerTransaction.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/customer-transactions — Record a debt or payment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, type, amount, currency, dueDate, description } = body;

    if (!customerId || !type || !amount) {
      return NextResponse.json({ error: 'customerId, type va amount majburiy' }, { status: 400 });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const newTx = await tx.customerTransaction.create({
        data: {
          customerId,
          type,
          amount: parseFloat(amount),
          currency: currency || 'USD',
          dueDate: dueDate ? new Date(dueDate) : null,
          description: description || null,
        },
        include: { customer: true },
      });

      // Update customer balance
      const balanceField = (currency || 'USD') === 'USD' ? 'balanceUSD' : 'balanceUZS';
      const adjustedAmount = type === 'DEBT' ? -parseFloat(amount) : parseFloat(amount);

      await tx.customer.update({
        where: { id: customerId },
        data: { [balanceField]: { increment: adjustedAmount } },
      });

      return newTx;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('POST /api/customer-transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
