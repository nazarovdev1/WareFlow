import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const UpdateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  budget: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('view_expenses');
    if (error) return error;

    const { id } = await params;
    const category = await prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        expenses: {
          select: {
            amount: true,
            status: true,
            currency: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });
    }

    const approvedExpenses = category.expenses.filter(
      (e) => e.status === 'APPROVED' || e.status === 'PAID',
    );
    const totalSpent = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const expenseCount = category.expenses.length;
    const budgetRemaining = category.budget ? category.budget - totalSpent : null;

    return NextResponse.json({
      ...category,
      stats: {
        totalSpent,
        expenseCount,
        budgetRemaining,
      },
    });
  } catch (error) {
    console.error('GET /api/expense-categories/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('edit_expenses');
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const result = UpdateCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const category = await prisma.expenseCategory.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });
    }

    if (result.data.name && result.data.name !== category.name) {
      const existing = await prisma.expenseCategory.findFirst({
        where: { name: result.data.name, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: 'Bunday nomli kategoriya allaqachon mavjud' }, { status: 409 });
      }
    }

    const updated = await prisma.expenseCategory.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/expense-categories/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('delete_expenses');
    if (error) return error;

    const { id } = await params;
    const category = await prisma.expenseCategory.findUnique({
      where: { id },
      include: { _count: { select: { expenses: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });
    }

    if (category._count.expenses > 0) {
      return NextResponse.json(
        { error: 'Xarajatlarga ega kategoriyani o\'chirish mumkin emas' },
        { status: 400 },
      );
    }

    await prisma.expenseCategory.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/expense-categories/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
