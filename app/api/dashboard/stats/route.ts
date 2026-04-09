import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/dashboard/stats — Aggregated dashboard statistics
export async function GET() {
  try {
    const [
      totalProducts,
      totalWarehouses,
      totalCustomers,
      totalSuppliers,
      stockStats,
      customerDebt,
      supplierDebt,
      todayTransfers,
      activePriceLists,
      outOfStockCount,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.warehouse.count(),
      prisma.customer.count(),
      prisma.supplier.count(),
      prisma.stockEntry.aggregate({
        _sum: { quantity: true },
      }),
      prisma.customer.aggregate({
        _sum: { balanceUSD: true, balanceUZS: true },
      }),
      prisma.supplier.aggregate({
        _sum: { balanceUSD: true, balanceUZS: true },
      }),
      prisma.transfer.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.priceList.count({ where: { isActive: true } }),
      prisma.stockEntry.count({ where: { quantity: { lte: 0 } } }),
    ]);

    return NextResponse.json({
      totalProducts,
      totalWarehouses,
      totalCustomers,
      totalSuppliers,
      totalStockQuantity: stockStats._sum.quantity || 0,
      customerDebtUSD: customerDebt._sum.balanceUSD || 0,
      customerDebtUZS: customerDebt._sum.balanceUZS || 0,
      supplierDebtUSD: supplierDebt._sum.balanceUSD || 0,
      supplierDebtUZS: supplierDebt._sum.balanceUZS || 0,
      todayTransfers,
      activePriceLists,
      outOfStockCount,
    });
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
