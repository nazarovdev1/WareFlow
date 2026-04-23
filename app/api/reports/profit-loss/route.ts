import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const warehouseId = searchParams.get('warehouseId');

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

    const orderWhere: any = {
      date: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
    };
    if (warehouseId) orderWhere.warehouseId = warehouseId;

    const purchaseWhere: any = {
      date: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
    };
    if (warehouseId) purchaseWhere.warehouseId = warehouseId;

    // Get sales revenue and cost
    const [orders, purchases] = await Promise.all([
      prisma.order.findMany({
        where: orderWhere,
        include: {
          items: {
            include: {
              product: {
                select: { name: true, sku: true },
              },
            },
          },
        },
      }),
      prisma.purchase.findMany({
        where: purchaseWhere,
        include: {
          items: {
            include: {
              product: {
                select: { name: true, sku: true },
              },
            },
          },
        },
      }),
    ]);

    // Calculate totals
    let totalRevenue = 0;
    let totalCost = 0;
    const revenueByProduct: Record<string, { name: string; revenue: number; cost: number; profit: number; quantity: number }> = {};

    for (const order of orders) {
      totalRevenue += Number(order.finalAmount);
      
      for (const item of order.items || []) {
        const productName = item.product?.name || 'Unknown';
        
        // Get cost price from stock entry
        const stockEntry = await prisma.stockEntry.findFirst({
          where: { productId: item.productId },
        });
        const costPrice = Number(stockEntry?.costPrice || 0);
        const itemCost = costPrice * item.quantity;
        
        totalCost += itemCost;

        if (!revenueByProduct[item.productId]) {
          revenueByProduct[item.productId] = {
            name: productName,
            revenue: 0,
            cost: 0,
            profit: 0,
            quantity: 0,
          };
        }
        revenueByProduct[item.productId].revenue += Number(item.total);
        revenueByProduct[item.productId].cost += itemCost;
        revenueByProduct[item.productId].quantity += item.quantity;
      }
    }

    // Calculate profit for each product
    for (const key in revenueByProduct) {
      revenueByProduct[key].profit = revenueByProduct[key].revenue - revenueByProduct[key].cost;
    }

    let totalPurchaseCost = 0;
    for (const purchase of purchases) {
      totalPurchaseCost += Number(purchase.totalAmount);
    }

    const grossProfit = totalRevenue - totalCost;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netProfit = grossProfit - totalPurchaseCost;

    return NextResponse.json({
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalRevenue,
        totalCost,
        totalPurchaseCost,
        grossProfit,
        grossMargin: grossMargin.toFixed(2),
        netProfit,
      },
      chartData: [
        { name: 'Daromad', value: totalRevenue },
        { name: 'Xarajat (sotuv)', value: totalCost },
        { name: 'Xarajat (xarid)', value: totalPurchaseCost },
        { name: 'Sof foyda', value: netProfit },
      ],
      topProducts: Object.values(revenueByProduct)
        .sort((a: any, b: any) => b.profit - a.profit)
        .slice(0, 10),
    });
  } catch (err) {
    console.error('Profit/Loss report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}