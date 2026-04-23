import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const CategorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
  budget: z.number().positive().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    const { error } = await checkPermission('view_expenses');
    if (error) return error;

    const categories = await prisma.expenseCategory.findMany({
      where: { isActive: true },
      include: {
        expenses: {
          select: {
            amount: true,
            status: true,
            currency: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const data = categories.map((cat) => {
      const approvedExpenses = cat.expenses.filter(
        (e) => e.status === 'APPROVED' || e.status === 'PAID',
      );
      const totalSpent = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
      const expenseCount = cat.expenses.length;
      const budgetRemaining = cat.budget ? cat.budget - totalSpent : null;

      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        budget: cat.budget,
        isActive: cat.isActive,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
        stats: {
          totalSpent,
          expenseCount,
          budgetRemaining,
        },
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/expense-categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await checkPermission('create_expenses');
    if (error) return error;

    const body = await request.json();
    const result = CategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { name, icon, color, budget, isActive } = result.data;

    const existing = await prisma.expenseCategory.findFirst({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: 'Bunday nomli kategoriya allaqachon mavjud' }, { status: 409 });
    }

    const category = await prisma.expenseCategory.create({
      data: {
        name,
        icon: icon || null,
        color: color || null,
        budget: budget || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('POST /api/expense-categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
