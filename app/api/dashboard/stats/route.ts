import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try { return await fn(); } catch { return fallback; }
};

async function fetchCBURate(): Promise<number | null> {
  try {
    const res = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/', { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const usd = data.find((c: any) => c.Ccy === 'USD');
    return usd ? parseFloat(usd.Rate) : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    const now = new Date();
    let startDate = new Date();

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
      safe(() => prisma.product.count(), 0),
      safe(() => prisma.customer.aggregate({ _sum: { balanceUSD: true, balanceUZS: true } }), { _sum: { balanceUSD: 0, balanceUZS: 0 } }),
      safe(() => prisma.supplier.aggregate({ _sum: { balanceUSD: true, balanceUZS: true } }), { _sum: { balanceUSD: 0, balanceUZS: 0 } }),
      safe(() => prisma.order.findMany({
        where: { status: 'COMPLETED', date: { gte: startDate } },
        select: { date: true, finalAmount: true },
        orderBy: { date: 'asc' },
      }), []),
      safe(() => prisma.purchase.findMany({
        where: { status: 'COMPLETED', date: { gte: startDate } },
        select: { date: true, totalAmount: true },
        orderBy: { date: 'asc' },
      }), []),
      safe(() => prisma.category.findMany({
        include: { _count: { select: { products: true } } },
      }), []),
      safe(() => prisma.cashbox.findMany({
        select: { balance: true, currency: true },
      }), []),
      safe(() => prisma.order.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: {
          customer: { select: { fullName: true } },
          _count: { select: { items: true } },
        },
      }), []),
      safe(async () => {
        const items = await prisma.orderItem.findMany({
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

    const salesByDate = (orders as any[]).reduce((acc, order) => {
      const dateStr = order.date.toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = { date: dateStr, amount: 0 };
      acc[dateStr].amount += Number(order.finalAmount) || 0;
      return acc;
    }, {} as Record<string, { date: string; amount: number }>);

    const purchasesByDate = (purchases as any[]).reduce((acc, purchase) => {
      const dateStr = purchase.date.toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = { date: dateStr, amount: 0 };
      acc[dateStr].amount += Number(purchase.totalAmount) || 0;
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

    const categoryChartData = (categories as any[])
      .map((cat: any) => ({ name: cat.name, value: cat._count.products }))
      .filter(cat => cat.value > 0);

    const totalCashUSD = (cashboxes as any[])
      .filter((cb: any) => cb.currency === 'USD')
      .reduce((sum: number, cb: any) => sum + cb.balance, 0);

    const totalCashUZS = (cashboxes as any[])
      .filter((cb: any) => cb.currency === 'UZS')
      .reduce((sum: number, cb: any) => sum + cb.balance, 0);

    const recentOrdersData = (recentOrders as any[]).map((order: any) => ({
      id: order.id,
      docNumber: order.docNumber,
      customer: order.customer?.fullName || 'Noma\'lum',
      amount: order.finalAmount,
      date: order.date,
      itemsCount: order._count?.items || 0,
      paymentMethod: order.paymentMethod,
      status: order.status,
    }));

    const warehouseStockData = (warehouses as any[]).map((wh: any) => {
      const totalQty = wh.stockEntries.reduce((s: number, e: any) => s + e.quantity, 0);
      const totalVal = wh.stockEntries.reduce((s: number, e: any) => s + (e.quantity * e.costPrice), 0);
      return {
        id: wh.id,
        name: wh.name,
        district: wh.district,
        productCount: wh._count?.stockEntries || 0,
        totalQuantity: Math.round(totalQty),
        totalValue: Math.round(totalVal * 100) / 100,
      };
    });

    const financialSummary = {
      cashUSD: Math.round(totalCashUSD * 100) / 100,
      cashUZS: Math.round(totalCashUZS * 100) / 100,
      customerDebtUSD: customerDebt._sum.balanceUSD || 0,
      customerDebtUZS: customerDebt._sum.balanceUZS || 0,
      supplierDebtUSD: supplierDebt._sum.balanceUSD || 0,
      supplierDebtUZS: supplierDebt._sum.balanceUZS || 0,
      netBalance: Math.round(((totalCashUSD - (supplierDebt._sum.balanceUSD || 0) + (customerDebt._sum.balanceUSD || 0)) * 100)) / 100,
    };

    const effectiveRate = (cbuRateData as number | null) || (exchangeRate as any)?.rate || 12500;

    return NextResponse.json({
      totalProducts,
      totalCashUSD: financialSummary.cashUSD,
      customerDebtUSD: financialSummary.customerDebtUSD,
      supplierDebtUSD: financialSummary.supplierDebtUSD,
      salesPurchasesChart: chartData,
      categoryChart: categoryChartData,
      recentOrders: recentOrdersData,
      topProducts: topProducts as any[],
      warehouseStock: warehouseStockData,
      financialSummary,
      exchangeRate: {
        rate: effectiveRate,
        cbuRate: cbuRateData as number | null,
        manualRate: (exchangeRate as any)?.rate || null,
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
