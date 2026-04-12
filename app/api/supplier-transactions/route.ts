import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const SupplierTransactionSchema = z.object({
  supplierId: z.string().min(1, "Ta'minotchi tanlanishi shart"),
  type: z.enum(['DEBT', 'PAYMENT']),
  amount: z.coerce.number().min(0.01, "Summa 0 dan katta bo'lishi shart"),
  currency: z.enum(['USD', 'UZS']).default('USD'),
  dueDate: z.string().or(z.date()).optional().nullable(),
  description: z.string().optional().nullable(),
});


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

    // Validate with Zod
    const result = SupplierTransactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Validatsiya xatosi', 
        details: result.error.errors.map(e => e.message) 
      }, { status: 400 });
    }

    const { supplierId, type, amount, currency, dueDate, description } = result.data;

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
