import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Create database backup
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all data from all tables
    const [
      users,
      products,
      categories,
      folders,
      units,
      warehouses,
      stockEntries,
      customers,
      customerGroups,
      customerTransactions,
      suppliers,
      supplierTransactions,
      orders,
      orderItems,
      purchases,
      purchaseItems,
      transfers,
      transferItems,
      inventoryAudits,
      inventoryAuditItems,
      priceLists,
      priceListItems,
      cashboxes,
      cashTransactions,
      exchangeRates,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.product.findMany(),
      prisma.category.findMany(),
      prisma.folder.findMany(),
      prisma.unit.findMany(),
      prisma.warehouse.findMany(),
      prisma.stockEntry.findMany(),
      prisma.customer.findMany(),
      prisma.customerGroup.findMany(),
      prisma.customerTransaction.findMany(),
      prisma.supplier.findMany(),
      prisma.supplierTransaction.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
      prisma.purchase.findMany(),
      prisma.purchaseItem.findMany(),
      prisma.transfer.findMany(),
      prisma.transferItem.findMany(),
      prisma.inventoryAudit.findMany(),
      prisma.inventoryAuditItem.findMany(),
      prisma.priceList.findMany(),
      prisma.priceListItem.findMany(),
      prisma.cashbox.findMany(),
      prisma.cashTransaction.findMany(),
      prisma.exchangeRate.findMany(),
    ]);

    const backup = {
      backupDate: new Date().toISOString(),
      version: '1.0',
      database: 'IBOX',
      tables: {
        users,
        products,
        categories,
        folders,
        units,
        warehouses,
        stockEntries,
        customers,
        customerGroups,
        customerTransactions,
        suppliers,
        supplierTransactions,
        orders,
        orderItems,
        purchases,
        purchaseItems,
        transfers,
        transferItems,
        inventoryAudits,
        inventoryAuditItems,
        priceLists,
        priceListItems,
        cashboxes,
        cashTransactions,
        exchangeRates,
      },
      statistics: {
        totalUsers: users.length,
        totalProducts: products.length,
        totalCategories: categories.length,
        totalWarehouses: warehouses.length,
        totalCustomers: customers.length,
        totalSuppliers: suppliers.length,
        totalOrders: orders.length,
        totalPurchases: purchases.length,
      },
    };

    return NextResponse.json(backup);
  } catch (error) {
    console.error('POST /api/settings/backup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
