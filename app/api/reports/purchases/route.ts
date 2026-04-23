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
    const warehouseId = searchParams.get('warehouseId');
    const supplierId = searchParams.get('supplierId');
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

    const whereClause: any = {
      date: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
    };
    if (warehouseId) whereClause.warehouseId = warehouseId;
    if (supplierId) whereClause.supplierId = supplierId;

    const [totalPurchases, totalSpent, purchases, recentPurchases] = await Promise.all([
      safe(() => prisma.purchase.count({ where: whereClause }), 0),
      safe(() => prisma.purchase.aggregate({
        where: whereClause,
        _sum: { totalAmount: true },
      }), { _sum: { totalAmount: null } }),
      prisma.purchase.findMany({
        where: whereClause,
        include: {
          supplier: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      safe(() => prisma.purchase.findMany({
        where: { date: { gte: startDate, lte: endDate }, status: 'COMPLETED' },
        select: { date: true, totalAmount: true },
        orderBy: { date: 'asc' },
      }), []),
    ]);

    const totalSpentVal = Number(totalSpent._sum?.totalAmount) || 0;
    const avgPurchaseValue = totalPurchases > 0 ? totalSpentVal / totalPurchases : 0;

    let chartData: any[] = [];
    if (groupBy === 'day') {
      const byDate = recentPurchases.reduce((acc: any, p) => {
        const dateStr = p.date.toISOString().split('T')[0];
        if (!acc[dateStr]) acc[dateStr] = { date: dateStr, amount: 0, purchases: 0 };
        acc[dateStr].amount += Number(p.totalAmount) || 0;
        acc[dateStr].purchases += 1;
        return acc;
      }, {});
      chartData = Object.values(byDate);
    } else if (groupBy === 'supplier') {
      const bySupplier = purchases.reduce((acc: any, p) => {
        const supplier = p.supplier?.name || 'Unknown';
        if (!acc[supplier]) acc[supplier] = { supplier, amount: 0, count: 0 };
        acc[supplier].amount += Number(p.totalAmount) || 0;
        acc[supplier].count += 1;
        return acc;
      }, {});
      chartData = Object.values(bySupplier);
    } else if (groupBy === 'warehouse') {
      const byWarehouse = purchases.reduce((acc: any, p) => {
        const warehouse = p.warehouse?.name || 'Unknown';
        if (!acc[warehouse]) acc[warehouse] = { warehouse, amount: 0, count: 0 };
        acc[warehouse].amount += Number(p.totalAmount) || 0;
        acc[warehouse].count += 1;
        return acc;
      }, {});
      chartData = Object.values(byWarehouse);
    }

    let topSupplier = '-';
    if (purchases.length > 0) {
      const supplierMap = purchases.reduce((acc: any, p) => {
        const sup = p.supplier?.name || 'Unknown';
        if (!acc[sup]) acc[sup] = { name: sup, total: 0 };
        acc[sup].total += Number(p.totalAmount) || 0;
        return acc;
      }, {});
      const sorted = Object.values(supplierMap).sort((a: any, b: any) => b.total - a.total) as any[];
      if (sorted.length > 0) topSupplier = sorted[0].name;
    }

    const tableData = purchases.map(p => ({
      id: p.id,
      docNumber: p.docNumber,
      date: p.date,
      supplier: p.supplier?.name || 'Noma\'lum',
      warehouse: p.warehouse?.name || 'Noma\'lum',
      amount: Number(p.totalAmount) || 0,
      items: p._count?.items || 0,
      status: p.status,
    }));

    return NextResponse.json({
      summary: {
        totalPurchases,
        totalSpent: totalSpentVal,
        avgPurchaseValue,
        topSupplier,
      },
      chartData,
      tableData,
      pagination: {
        total: totalPurchases,
        page,
        limit,
        totalPages: Math.ceil(totalPurchases / limit),
      },
    });
  } catch (err) {
    console.error('Purchases report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}