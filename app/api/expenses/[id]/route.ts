import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const UpdateExpenseSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'PAID']).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
  approvedBy: z.string().optional(),
  cashboxId: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('view_expenses');
    if (error) return error;

    const { id } = await params;
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true, budget: true } },
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Xarajat topilmadi' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('GET /api/expenses/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('edit_expenses');
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const result = UpdateExpenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return NextResponse.json({ error: 'Xarajat topilmadi' }, { status: 404 });
    }

    const { status, approvedBy, cashboxId, ...rest } = result.data;

    if (status === 'APPROVED') {
      const updated = await prisma.expense.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: approvedBy || null,
          approvedAt: new Date(),
          ...rest,
        },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
      });
      return NextResponse.json(updated);
    }

    if (status === 'PAID') {
      if (!cashboxId) {
        return NextResponse.json({ error: 'Kassa ID talab qilinadi' }, { status: 400 });
      }

      const cashbox = await prisma.cashbox.findUnique({ where: { id: cashboxId } });
      if (!cashbox) {
        return NextResponse.json({ error: 'Kassa topilmadi' }, { status: 404 });
      }

      if (cashbox.currency !== expense.currency) {
        return NextResponse.json(
          { error: `Kassa valyutasi (${cashbox.currency}) xarajat valyutasiga (${expense.currency}) mos kelmaydi` },
          { status: 400 },
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        const updatedExpense = await tx.expense.update({
          where: { id },
          data: {
            status: 'PAID',
            approvedBy: approvedBy || undefined,
            approvedAt: expense.approvedAt ? undefined : new Date(),
            ...rest,
          },
          include: {
            category: { select: { id: true, name: true, icon: true, color: true } },
          },
        });

        await tx.cashTransaction.create({
          data: {
            cashboxId,
            type: 'EXPENSE',
            amount: expense.amount,
            referenceId: id,
            description: `Xarajat: ${expense.description || expense.id}`,
          },
        });

        await tx.cashbox.update({
          where: { id: cashboxId },
          data: { balance: { decrement: expense.amount } },
        });

        return updatedExpense;
      });

      return NextResponse.json(updated);
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: { status, ...rest },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/expenses/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('delete_expenses');
    if (error) return error;

    const { id } = await params;
    const expense = await prisma.expense.findUnique({ where: { id } });

    if (!expense) {
      return NextResponse.json({ error: 'Xarajat topilmadi' }, { status: 404 });
    }

    if (expense.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Faqat kutilayotgan xarajatlarni o\'chirish mumkin' },
        { status: 400 },
      );
    }

    await prisma.expense.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/expenses/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
