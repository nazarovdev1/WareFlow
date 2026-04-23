import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const ExpenseSchema = z.object({
  categoryId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('UZS'),
  description: z.string().optional(),
  date: z.string().optional(),
  receiptUrl: z.string().optional(),
  requestedBy: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { error } = await checkPermission('view_expenses');
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const currency = searchParams.get('currency');

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (currency) where.currency = currency;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await checkPermission('create_expenses');
    if (error) return error;

    const body = await request.json();
    const result = ExpenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { categoryId, amount, currency, description, date, receiptUrl, requestedBy, notes } = result.data;

    const category = await prisma.expenseCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });
    }

    const expense = await prisma.expense.create({
      data: {
        categoryId,
        amount,
        currency: currency || 'UZS',
        description: description || null,
        date: date ? new Date(date) : new Date(),
        status: 'PENDING',
        receiptUrl: receiptUrl || null,
        requestedBy: requestedBy || null,
        notes: notes || null,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('POST /api/expenses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
