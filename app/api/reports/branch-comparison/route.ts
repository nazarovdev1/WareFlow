import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try { return await fn(); } catch { return fallback; }
};

// GET /api/reports/branch-comparison?period=month
// Compares all branches of the company side by side
export async function GET(request: Request) {
  try {
    const { error, user } = await checkPermission('view_reports');
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // Company filter
    const companyFilter: Record<string, unknown> = {};
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      companyFilter.companyId = user.companyId;
    }

    // Date range
    const now = new Date();
    const startDate = new Date();
    switch (period) {
      case 'today': startDate.setHours(0, 0, 0, 0); break;
      case 'week': startDate.setDate(now.getDate() - 7); break;
      case 'month': startDate.setMonth(now.getMonth() - 1); break;
      case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
      default: startDate.setMonth(now.getMonth() - 1);
    }

    // Get all branches
    const branches = await prisma.branch.findMany({
      where: companyFilter,
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    });

    const branchData = await Promise.all(
      branches.map(async (branch) => {
        const branchFilter = { ...companyFilter, branchId: branch.id };

        // Get warehouses for this branch
        const warehouses = await prisma.warehouse.findMany({
          where: { branchId: branch.id, ...companyFilter },
          select: { id: true },
        });
        const warehouseIds = warehouses.map(w => w.id);

        const dateFilter = { date: { gte: startDate } };

        const [sales, purchases, orderCount, stockValue] = await Promise.all([
          safe(() => prisma.order.aggregate({
            where: { ...branchFilter, status: 'COMPLETED', ...dateFilter },
            _sum: { finalAmount: true },
          }), { _sum: { finalAmount: 0 } }),
          safe(() => prisma.purchase.aggregate({
            where: { ...branchFilter, status: 'COMPLETED', ...dateFilter },
            _sum: { totalAmount: true },
          }), { _sum: { totalAmount: 0 } }),
          safe(() => prisma.order.count({
            where: { ...branchFilter, status: 'COMPLETED', ...dateFilter },
          }), 0),
          safe(async () => {
            if (warehouseIds.length === 0) return 0;
            const entries = await prisma.stockEntry.findMany({
              where: { warehouseId: { in: warehouseIds } },
              select: { quantity: true, costPrice: true },
            });
            return entries.reduce((sum, e) => sum + (e.quantity * e.costPrice), 0);
          }, 0),
        ]);

        const totalSales = (sales as { _sum: { finalAmount: number | null } })._sum.finalAmount || 0;
        const totalPurchases = (purchases as { _sum: { totalAmount: number | null } })._sum.totalAmount || 0;

        return {
          branchId: branch.id,
          branchName: branch.name,
          branchType: branch.type,
          totalSales,
          totalPurchases,
          profit: totalSales - totalPurchases,
          orderCount,
          stockValue,
          warehouseCount: warehouses.length,
        };
      })
    );

    // Calculate totals
    const totals = branchData.reduce(
      (acc, b) => ({
        totalSales: acc.totalSales + b.totalSales,
        totalPurchases: acc.totalPurchases + b.totalPurchases,
        totalProfit: acc.totalProfit + b.profit,
        totalOrders: acc.totalOrders + b.orderCount,
      }),
      { totalSales: 0, totalPurchases: 0, totalProfit: 0, totalOrders: 0 }
    );

    return NextResponse.json({
      period,
      dateRange: { from: startDate, to: now },
      branches: branchData,
      totals,
    });
  } catch (error) {
    console.error('GET /api/reports/branch-comparison error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
