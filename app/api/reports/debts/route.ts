import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try { return await fn(); } catch { return fallback; }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const debtType = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';
    const groupBy = searchParams.get('groupBy') || 'type';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let customers: any[] = [];
    let suppliers: any[] = [];

    const customerWhere: any = {};
    const supplierWhere: any = {};

    if (debtType === 'customer' || debtType === 'all') {
      customers = await prisma.customer.findMany({
        where: customerWhere,
        select: {
          id: true,
          fullName: true,
          phone: true,
          balanceUSD: true,
          balanceUZS: true,
        },
        orderBy: { balanceUSD: 'desc' },
      });
    }

    if (debtType === 'supplier' || debtType === 'all') {
      suppliers = await prisma.supplier.findMany({
        where: supplierWhere,
        select: {
          id: true,
          name: true,
          phone: true,
          balanceUSD: true,
          balanceUZS: true,
        },
        orderBy: { balanceUSD: 'desc' },
      });
    }

    const totalCustomerDebt = customers.reduce((sum, c) => sum + Number(c.balanceUSD), 0);
    const totalSupplierDebt = suppliers.reduce((sum, s) => sum + Number(s.balanceUSD), 0);

    const allDebts = [
      ...customers.map(c => ({
        id: c.id,
        type: 'customer' as const,
        name: c.fullName,
        phone: c.phone,
        balance: Number(c.balanceUSD),
        balanceUZS: Number(c.balanceUZS),
      })),
      ...suppliers.map(s => ({
        id: s.id,
        type: 'supplier' as const,
        name: s.name,
        phone: s.phone,
        balance: Number(s.balanceUSD),
        balanceUZS: Number(s.balanceUZS),
      })),
    ].filter(d => d.balance !== 0);

    const pageData = allDebts.slice((page - 1) * limit, page * limit);

    let chartData: any[] = [];
    if (groupBy === 'type') {
      chartData = [
        { type: 'Mijozlar', amount: totalCustomerDebt, count: customers.length },
        { type: 'Ta\'minotchilar', amount: totalSupplierDebt, count: suppliers.length },
      ];
    } else if (groupBy === 'range') {
      const ranges = [
        { range: '$0-100', min: 0, max: 100 },
        { range: '$100-500', min: 100, max: 500 },
        { range: '$500-1000', min: 500, max: 1000 },
        { range: '$1000+', min: 1000, max: Infinity },
      ];
      chartData = ranges.map(r => ({
        range: r.range,
        amount: allDebts.filter(d => d.balance >= r.min && d.balance < r.max).reduce((sum, d) => sum + d.balance, 0),
        count: allDebts.filter(d => d.balance >= r.min && d.balance < r.max).length,
      }));
    }

    return NextResponse.json({
      summary: {
        totalCustomerDebt,
        totalSupplierDebt,
        totalDebt: totalCustomerDebt + totalSupplierDebt,
        activeDebtors: customers.filter(c => c.balanceUSD < 0).length,
        activeCreditors: suppliers.filter(s => s.balanceUSD < 0).length,
      },
      chartData,
      tableData: pageData,
      pagination: {
        total: allDebts.length,
        page,
        limit,
        totalPages: Math.ceil(allDebts.length / limit),
      },
    });
  } catch (err) {
    console.error('Debts report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}