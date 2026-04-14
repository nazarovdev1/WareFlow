import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Export all data as JSON
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all data in parallel
    const [
      products,
      categories,
      warehouses,
      customers,
      suppliers,
      orders,
      purchases,
    ] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: true,
          stockEntries: true,
        },
      }),
      prisma.category.findMany(),
      prisma.warehouse.findMany({
        include: {
          stockEntries: true,
        },
      }),
      prisma.customer.findMany({
        include: {
          group: true,
          transactions: true,
        },
      }),
      prisma.supplier.findMany({
        include: {
          transactions: true,
        },
      }),
      prisma.order.findMany({
        include: {
          items: true,
          customer: true,
        },
      }),
      prisma.purchase.findMany({
        include: {
          items: true,
          supplier: true,
        },
      }),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        products,
        categories,
        warehouses,
        customers,
        suppliers,
        orders,
        purchases,
      },
      summary: {
        totalProducts: products.length,
        totalCategories: categories.length,
        totalWarehouses: warehouses.length,
        totalCustomers: customers.length,
        totalSuppliers: suppliers.length,
        totalOrders: orders.length,
        totalPurchases: purchases.length,
      },
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('GET /api/settings/export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
