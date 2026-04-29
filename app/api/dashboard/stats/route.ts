import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try { return await fn(); } catch { return fallback; }
};

async function fetchCBURate(): Promise<number | null> {
  try {
    const res = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/', { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const usd = data.find((c: { Ccy: string }) => c.Ccy === 'USD');
    return usd ? parseFloat(usd.Rate) : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { error, user } = await checkPermission('view_sales');
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const branchId = searchParams.get('branchId');

    // Build base filters
    const companyFilter: Record<string, unknown> = {};
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      companyFilter.companyId = user.companyId;
    }

    // Branch filter for order/purchase queries
    const branchFilter: Record<string, unknown> = {};
    if (branchId) {
      branchFilter.branchId = branchId;
    } else if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.branchId) {
      branchFilter.branchId = user.branchId;
    }

    // Warehouse filter for stock queries
    const warehouseFilter: Record<string, unknown> = {};
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      warehouseFilter.companyId = user.companyId;
    }
    if (branchId) {
      warehouseFilter.branchId = branchId;
    } else if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.branchId) {
      warehouseFilter.branchId = user.branchId;
    }

    const orderWhere = { ...companyFilter, ...branchFilter };
    const purchaseWhere = { ...companyFilter, ...branchFilter };

    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const dateFilter = { date: { gte: startDate } };

    const [
      totalProducts,
      customerDebt,
      supplierDebt,
      orders,
      purchases,
      categories,
      cashboxes,
      recentOrders,
      topProducts,
      warehouses,
      exchangeRate,
      cbuRateData,
    ] = await Promise.all([
      safe(() => prisma.product.count({ where: companyFilter }), 0),
      safe(() => prisma.customer.aggregate({ where: companyFilter, _sum: { balanceUSD: true, balanceUZS: true } }), { _sum: { balanceUSD: 0, balanceUZS: 0 } }),
      safe(() => prisma.supplier.aggregate({ where: companyFilter, _sum: { balanceUSD: true, balanceUZS: true } }), { _sum: { balanceUSD: 0, balanceUZS: 0 } }),
      safe(() => prisma.order.findMany({
        where: { ...orderWhere, status: 'COMPLETED', ...dateFilter },
        select: { date: true, finalAmount: true },
        orderBy: { date: 'asc' },
      }), []),
      safe(() => prisma.purchase.findMany({
        where: { ...purchaseWhere, status: 'COMPLETED', ...dateFilter },
        select: { date: true, totalAmount: true },
        orderBy: { date: 'asc' },
      }), []),
      safe(() => prisma.category.findMany({
        where: companyFilter,
        include: { _count: { select: { products: true } } },
      }), []),
      safe(() => prisma.cashbox.findMany({
        where: { ...companyFilter, ...branchFilter },
        select: { balance: true, currency: true },
      }), []),
      safe(() => prisma.order.findMany({
        where: orderWhere,
        take: 5,
        orderBy: { date: 'desc' },
        include: {
          customer: { select: { fullName: true } },
          _count: { select: { items: true } },
        },
      }), []),
      safe(async () => {
        const items = await prisma.orderItem.findMany({
          where: { order: orderWhere },
          select: {
            productId: true,
            product: { select: { name: true } },
            quantity: true,
            total: true,
          },
        });
        const map = new Map<string, { name: string; totalQty: number; totalRevenue: number }>();
        for (const item of items) {
          const existing = map.get(item.productId);
          if (existing) {
            existing.totalQty += Number(item.quantity) || 0;
            existing.totalRevenue += Number(item.total) || 0;
          } else {
            map.set(item.productId, {
              name: item.product.name,
              totalQty: Number(item.quantity) || 0,
              totalRevenue: Number(item.total) || 0,
            });
          }
        }
        return Array.from(map.values())
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5);
      }, []),
      safe(() => prisma.warehouse.findMany({
        where: warehouseFilter,
        include: {
          _count: { select: { stockEntries: true } },
          stockEntries: { select: { quantity: true, costPrice: true } },
        },
        orderBy: { name: 'asc' },
      }), []),
      safe(() => prisma.exchangeRate.findFirst({
        where: { currency: 'USD' },
        orderBy: { date: 'desc' },
      }), null),
      fetchCBURate(),
    ]);

    const salesByDate = (orders as unknown[]).reduce((acc: Record<string, { date: string; amount: number }>, order: unknown) => {
      const o = order as { date: Date; finalAmount: number };
      const dateStr = o.date.toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = { date: dateStr, amount: 0 };
      acc[dateStr].amount += Number(o.finalAmount) || 0;
      return acc;
    }, {} as Record<string, { date: string; amount: number }>);

    const purchasesByDate = (purchases as unknown[]).reduce((acc: Record<string, { date: string; amount: number }>, purchase: unknown) => {
      const p = purchase as { date: Date; totalAmount: number };
      const dateStr = p.date.toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = { date: dateStr, amount: 0 };
      acc[dateStr].amount += Number(p.totalAmount) || 0;
      return acc;
    }, {} as Record<string, { date: string; amount: number }>);

    const allDates = new Set([...Object.keys(salesByDate), ...Object.keys(purchasesByDate)]);
    const chartData = Array.from(allDates).sort().map(date => {
      const sales = salesByDate[date]?.amount || 0;
      const purchase = purchasesByDate[date]?.amount || 0;
      return {
        name: new Date(date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }),
        savdo: Math.round(sales * 100) / 100,
        kirim: Math.round(purchase * 100) / 100,
        foyda: Math.round((sales - purchase) * 100) / 100,
      };
    });

    const categoryChartData = (categories as unknown[])
      .map((cat: unknown) => {
        const c = cat as { name: string; _count: { products: number } };
        return { name: c.name, value: c._count.products };
      })
      .filter(cat => cat.value > 0);

    const totalCashUSD = (cashboxes as unknown[])
      .filter((cb: unknown) => (cb as { currency: string }).currency === 'USD')
      .reduce((sum: number, cb: unknown) => sum + (cb as { balance: number }).balance, 0);

    const totalCashUZS = (cashboxes as unknown[])
      .filter((cb: unknown) => (cb as { currency: string }).currency === 'UZS')
      .reduce((sum: number, cb: unknown) => sum + (cb as { balance: number }).balance, 0);

    const recentOrdersData = (recentOrders as unknown[]).map((order: unknown) => {
      const o = order as { id: string; docNumber: string; customer: { fullName: string } | null; finalAmount: number; date: Date; _count: { items: number }; paymentMethod: string | null; status: string };
      return {
        id: o.id,
        docNumber: o.docNumber,
        customer: o.customer?.fullName || 'Noma\'lum',
        amount: o.finalAmount,
        date: o.date,
        itemsCount: o._count?.items || 0,
        paymentMethod: o.paymentMethod,
        status: o.status,
      };
    });

    const warehouseStockData = (warehouses as unknown[]).map((wh: unknown) => {
      const w = wh as { id: string; name: string; district: string | null; _count: { stockEntries: number }; stockEntries: { quantity: number; costPrice: number }[] };
      const totalQty = w.stockEntries.reduce((s: number, e: { quantity: number }) => s + e.quantity, 0);
      const totalVal = w.stockEntries.reduce((s: number, e: { quantity: number; costPrice: number }) => s + (e.quantity * e.costPrice), 0);
      return {
        id: w.id,
        name: w.name,
        district: w.district,
        productCount: w._count?.stockEntries || 0,
        totalQuantity: Math.round(totalQty),
        totalValue: Math.round(totalVal * 100) / 100,
      };
    });

    const debtData = customerDebt as { _sum: { balanceUSD: number | null; balanceUZS: number | null } };
    const suppDebtData = supplierDebt as { _sum: { balanceUSD: number | null; balanceUZS: number | null } };

    const financialSummary = {
      cashUSD: Math.round(totalCashUSD * 100) / 100,
      cashUZS: Math.round(totalCashUZS * 100) / 100,
      customerDebtUSD: debtData._sum.balanceUSD || 0,
      customerDebtUZS: debtData._sum.balanceUZS || 0,
      supplierDebtUSD: suppDebtData._sum.balanceUSD || 0,
      supplierDebtUZS: suppDebtData._sum.balanceUZS || 0,
      netBalance: Math.round(((totalCashUSD - (suppDebtData._sum.balanceUSD || 0) + (debtData._sum.balanceUSD || 0)) * 100)) / 100,
    };

    const effectiveRate = (cbuRateData as number | null) || (exchangeRate as { rate: number } | null)?.rate || 12500;

    return NextResponse.json({
      totalProducts,
      totalCashUSD: financialSummary.cashUSD,
      customerDebtUSD: financialSummary.customerDebtUSD,
      supplierDebtUSD: financialSummary.supplierDebtUSD,
      salesPurchasesChart: chartData,
      categoryChart: categoryChartData,
      recentOrders: recentOrdersData,
      topProducts: topProducts as unknown[],
      warehouseStock: warehouseStockData,
      financialSummary,
      exchangeRate: {
        rate: effectiveRate,
        cbuRate: cbuRateData as number | null,
        manualRate: (exchangeRate as { rate: number } | null)?.rate || null,
        source: (cbuRateData as number | null) ? 'CBU' : (exchangeRate ? 'MANUAL' : 'DEFAULT'),
        date: new Date().toISOString(),
      },
      period,
      startDate,
      endDate: now,
    });
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
