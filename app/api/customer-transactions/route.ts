import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const CustomerTransactionSchema = z.object({
  customerId: z.string().min(1, "Mijoz tanlanishi shart"),
  type: z.enum(['DEBT', 'PAYMENT']),
  amount: z.coerce.number().min(0.01, "Summa 0 dan katta bo'lishi shart"),
  currency: z.enum(['USD', 'UZS']).default('USD'),
  dueDate: z.string().or(z.date()).optional().nullable(),
  description: z.string().optional().nullable(),
});


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

    // Validate with Zod
    const result = CustomerTransactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Validatsiya xatosi', 
        details: result.error.errors.map(e => e.message) 
      }, { status: 400 });
    }

    const { customerId, type, amount, currency, dueDate, description } = result.data;

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
