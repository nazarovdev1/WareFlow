import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try { return await fn(); } catch { return fallback; }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const cashboxId = searchParams.get('cashboxId');
    const type = searchParams.get('type') || 'all';
    const groupBy = searchParams.get('groupBy') || 'day';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const now = new Date();
    let startDate = startDateParam ? new Date(startDateParam) : new Date(now);
    let endDate = endDateParam ? new Date(endDateParam) : now;

    if (!startDateParam) {
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
    }
    if (!endDateParam) {
      endDate.setHours(23, 59, 59, 999);
    }

    const transactionWhere: any = { date: { gte: startDate, lte: endDate } };
    if (cashboxId) transactionWhere.cashboxId = cashboxId;
    if (type !== 'all') transactionWhere.type = type;

    const [cashboxes, transactions] = await Promise.all([
      prisma.cashbox.findMany({ select: { id: true, name: true, type: true, currency: true, balance: true } }),
      prisma.cashTransaction.findMany({
        where: transactionWhere,
        include: {
          cashbox: { select: { name: true, type: true, currency: true } },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const cashBalance = cashboxes
      .filter(cb => cb.type === 'CASH')
      .reduce((sum: number, cb: any) => sum + Number(cb.balance), 0);
    const cardBalance = cashboxes
      .filter(cb => cb.type === 'CARD')
      .reduce((sum: number, cb: any) => sum + Number(cb.balance), 0);
    const bankBalance = cashboxes
      .filter(cb => cb.type === 'BANK')
      .reduce((sum: number, cb: any) => sum + Number(cb.balance), 0);

    let chartData: any[] = [];
    if (groupBy === 'day') {
      const byDate = transactions.reduce((acc: any, t) => {
        const dateStr = t.date.toISOString().split('T')[0];
        if (!acc[dateStr]) acc[dateStr] = { date: dateStr, income: 0, expense: 0, balance: 0 };
        if (t.type === 'INCOME') acc[dateStr].income += Number(t.amount);
        if (t.type === 'EXPENSE') acc[dateStr].expense += Number(t.amount);
        acc[dateStr].balance = acc[dateStr].income - acc[dateStr].expense;
        return acc;
      }, {});
      chartData = Object.values(byDate);
    } else if (groupBy === 'type') {
      chartData = [
        { type: 'INCOME', amount: totalIncome },
        { type: 'EXPENSE', amount: totalExpense },
      ];
    } else if (groupBy === 'cashbox') {
      const byCashbox = transactions.reduce((acc: any, t) => {
        const cash = t.cashbox?.name || 'Unknown';
        if (!acc[cash]) acc[cash] = { cashbox: cash, income: 0, expense: 0 };
        if (t.type === 'INCOME') acc[cash].income += Number(t.amount);
        if (t.type === 'EXPENSE') acc[cash].expense += Number(t.amount);
        return acc;
      }, {});
      chartData = Object.values(byCashbox);
    }

    const tableData = transactions.map(t => ({
      id: t.id,
      date: t.date,
      type: t.type,
      cashbox: t.cashbox?.name || '-',
      amount: Number(t.amount),
      description: t.description || '-',
      reference: t.referenceId || '-',
    }));

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        cashBalance,
        cardBalance,
        bankBalance,
      },
      chartData,
      tableData,
      pagination: {
        total: transactions.length,
        page,
        limit,
        totalPages: Math.ceil(transactions.length / limit),
      },
    });
  } catch (err) {
    console.error('Financial report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}