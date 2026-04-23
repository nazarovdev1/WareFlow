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
    const categoryId = searchParams.get('categoryId');
    const customerId = searchParams.get('customerId');
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
    if (customerId) whereClause.customerId = customerId;

    const [totalOrders, totalRevenue, orders, recentOrders] = await Promise.all([
      safe(() => prisma.order.count({ where: whereClause }), 0),
      safe(() => prisma.order.aggregate({
        where: whereClause,
        _sum: { finalAmount: true },
      }), { _sum: { finalAmount: null } }),
      prisma.order.findMany({
        where: whereClause,
        include: {
          customer: { select: { id: true, fullName: true } },
          warehouse: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      safe(() => prisma.order.findMany({
        where: { date: { gte: startDate, lte: endDate }, status: 'COMPLETED' },
        select: { date: true, finalAmount: true },
        orderBy: { date: 'asc' },
      }), []),
    ]);

    let chartData: any[] = [];
    if (groupBy === 'day') {
      const ordersByDate = recentOrders.reduce((acc: any, order) => {
        const dateStr = order.date.toISOString().split('T')[0];
        if (!acc[dateStr]) acc[dateStr] = { date: dateStr, amount: 0, orders: 0 };
        acc[dateStr].amount += Number(order.finalAmount) || 0;
        acc[dateStr].orders += 1;
        return acc;
      }, {});
      chartData = Object.values(ordersByDate);
    } else if (groupBy === 'category' && categoryId) {
      const items = await prisma.orderItem.findMany({
        where: { order: whereClause },
        include: { product: { select: { categoryId: true, category: { select: { name: true } } } } },
      });
      const byCategory = items.reduce((acc: any, item) => {
        const cat = item.product.category?.name || 'Unknown';
        if (!acc[cat]) acc[cat] = { category: cat, amount: 0 };
        acc[cat].amount += Number(item.total) || 0;
        return acc;
      }, {});
      chartData = Object.values(byCategory);
    }

    const totalRevenueVal = Number(totalRevenue._sum?.finalAmount) || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenueVal / totalOrders : 0;

    let topProduct = '-';
    let topCustomer = '-';
    if (recentOrders.length > 0) {
      const topProductResult = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: whereClause },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 1,
      });
      if (topProductResult.length > 0) {
        const product = await prisma.product.findUnique({
          where: { id: topProductResult[0].productId },
          select: { name: true },
        });
        topProduct = product?.name || '-';
      }
    }

    const tableData = orders.map(order => ({
      id: order.id,
      docNumber: order.docNumber,
      date: order.date,
      customer: order.customer?.fullName || 'Noma\'lum',
      warehouse: order.warehouse?.name || 'Noma\'lum',
      amount: Number(order.finalAmount) || 0,
      items: order._count?.items || 0,
      status: order.status,
    }));

    return NextResponse.json({
      summary: {
        totalOrders,
        totalRevenue: totalRevenueVal,
        avgOrderValue,
        topProduct,
        topCustomer,
      },
      chartData,
      tableData,
      pagination: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (err) {
    console.error('Sales report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}