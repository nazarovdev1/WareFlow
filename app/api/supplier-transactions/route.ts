import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/supplier-transactions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');
    const overdue = searchParams.get('overdue');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (overdue === 'true') {
      where.dueDate = { lt: new Date() };
      where.type = 'DEBT';
    }

    const [transactions, total] = await Promise.all([
      prisma.supplierTransaction.findMany({
        where,
        include: { supplier: true },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.supplierTransaction.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/supplier-transactions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplierId, type, amount, currency, dueDate, description } = body;

    if (!supplierId || !type || !amount) {
      return NextResponse.json({ error: 'supplierId, type va amount majburiy' }, { status: 400 });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const newTx = await tx.supplierTransaction.create({
        data: {
          supplierId,
          type,
          amount: parseFloat(amount),
          currency: currency || 'USD',
          dueDate: dueDate ? new Date(dueDate) : null,
          description: description || null,
        },
        include: { supplier: true },
      });

      const balanceField = (currency || 'USD') === 'USD' ? 'balanceUSD' : 'balanceUZS';
      const adjustedAmount = type === 'DEBT' ? -parseFloat(amount) : parseFloat(amount);

      await tx.supplier.update({
        where: { id: supplierId },
        data: { [balanceField]: { increment: adjustedAmount } },
      });

      return newTx;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('POST /api/supplier-transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
