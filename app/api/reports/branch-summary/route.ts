import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';
import { OrderStatus, PurchaseStatus } from '@prisma/client';

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try { return await fn(); } catch { return fallback; }
};

// GET /api/reports/branch-summary?branchId=xxx&period=month
export async function GET(request: Request) {
  try {
    const { error, user } = await checkPermission('view_reports');
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const period = searchParams.get('period') || 'month';

    // Build company filter
    const companyFilter: Record<string, unknown> = {};
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      companyFilter.companyId = user.companyId;
    }

    // Branch filter
    const branchFilter: Record<string, unknown> = {};
    if (branchId) {
      branchFilter.branchId = branchId;
    } else if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.branchId) {
      branchFilter.branchId = user.branchId;
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

    const dateFilter = { date: { gte: startDate } };

    // Get warehouses for this branch
    const warehouses = await prisma.warehouse.findMany({
      where: { ...companyFilter, ...branchFilter },
      select: { id: true, name: true },
    });
    const warehouseIds = warehouses.map(w => w.id);

    const orderWhere = {
      ...companyFilter,
      ...branchFilter,
      status: OrderStatus.COMPLETED,
      ...dateFilter,
    };

    const purchaseWhere = {
      ...companyFilter,
      ...branchFilter,
      status: PurchaseStatus.COMPLETED,
      ...dateFilter,
    };

    const [
      totalSales,
      totalPurchases,
      orderCount,
      topProducts,
      customerDebt,
      supplierDebt,
      stockValue,
      cashBalance,
    ] = await Promise.all([
      safe(() => prisma.order.aggregate({
        where: orderWhere,
        _sum: { finalAmount: true },
      }), { _sum: { finalAmount: 0 } }),
      safe(() => prisma.purchase.aggregate({
        where: purchaseWhere,
        _sum: { totalAmount: true },
      }), { _sum: { totalAmount: 0 } }),
      safe(() => prisma.order.count({ where: orderWhere }), 0),
      safe(async () => {
        const items = await prisma.orderItem.findMany({
          where: { order: orderWhere },
          select: {
            productId: true,
            product: { select: { name: true } },
            quantity: true,
            total: true,
          },
          take: 1000,
        });
        const map = new Map<string, { name: string; quantity: number; revenue: number }>();
        for (const item of items) {
          const existing = map.get(item.productId);
          if (existing) {
            existing.quantity += Number(item.quantity) || 0;
            existing.revenue += Number(item.total) || 0;
          } else {
            map.set(item.productId, {
              name: item.product.name,
              quantity: Number(item.quantity) || 0,
              revenue: Number(item.total) || 0,
            });
          }
        }
        return Array.from(map.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);
      }, []),
      safe(() => prisma.customer.aggregate({
        where: companyFilter,
        _sum: { balanceUSD: true, balanceUZS: true },
      }), { _sum: { balanceUSD: 0, balanceUZS: 0 } }),
      safe(() => prisma.supplier.aggregate({
        where: companyFilter,
        _sum: { balanceUSD: true, balanceUZS: true },
      }), { _sum: { balanceUSD: 0, balanceUZS: 0 } }),
      safe(async () => {
        if (warehouseIds.length === 0) return 0;
        const entries = await prisma.stockEntry.findMany({
          where: { warehouseId: { in: warehouseIds } },
          select: { quantity: true, costPrice: true },
        });
        return entries.reduce((sum, e) => sum + (e.quantity * e.costPrice), 0);
      }, 0),
      safe(async () => {
        const boxes = await prisma.cashbox.findMany({
          where: { ...companyFilter, ...branchFilter },
          select: { balance: true, currency: true },
        });
        const usd = boxes.filter(b => b.currency === 'USD').reduce((s, b) => s + b.balance, 0);
        const uzs = boxes.filter(b => b.currency === 'UZS').reduce((s, b) => s + b.balance, 0);
        return { USD: usd, UZS: uzs };
      }, { USD: 0, UZS: 0 }),
    ]);

    const salesAmount = (totalSales as { _sum: { finalAmount: number | null } })._sum.finalAmount || 0;
    const purchaseAmount = (totalPurchases as { _sum: { totalAmount: number | null } })._sum.totalAmount || 0;

    // Get branch info
    let branchName = 'Barcha filiallar';
    if (branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
        select: { name: true },
      });
      branchName = branch?.name || branchName;
    }

    return NextResponse.json({
      branchId,
      branchName,
      period,
      dateRange: { from: startDate, to: now },
      summary: {
        totalSales: salesAmount,
        totalPurchases: purchaseAmount,
        grossProfit: salesAmount - purchaseAmount,
        orderCount,
        averageOrderValue: orderCount > 0 ? salesAmount / orderCount : 0,
      },
      topProducts,
      stockValue,
      cashBalance,
      customerDebt: {
        USD: (customerDebt as { _sum: { balanceUSD: number | null; balanceUZS: number | null } })._sum.balanceUSD || 0,
        UZS: (customerDebt as { _sum: { balanceUSD: number | null; balanceUZS: number | null } })._sum.balanceUZS || 0,
      },
      supplierDebt: {
        USD: (supplierDebt as { _sum: { balanceUSD: number | null; balanceUZS: number | null } })._sum.balanceUSD || 0,
        UZS: (supplierDebt as { _sum: { balanceUSD: number | null; balanceUZS: number | null } })._sum.balanceUZS || 0,
      },
      warehouses: warehouses.length,
    });
  } catch (error) {
    console.error('GET /api/reports/branch-summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
