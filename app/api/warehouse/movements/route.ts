import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/warehouse/movements — Get all stock movements (transfers, purchases, orders)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch recent transfers
    const transfers = await prisma.transfer.findMany({
      where: warehouseId
        ? { OR: [{ fromWarehouseId: warehouseId }, { toWarehouseId: warehouseId }] }
        : {},
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        fromWarehouse: { select: { name: true } },
        toWarehouse: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
    });

    // Fetch recent purchases
    const purchases = await prisma.purchase.findMany({
      where: warehouseId ? { warehouseId } : {},
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        warehouse: { select: { name: true } },
        supplier: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
    });

    // Fetch recent orders (sales - stock outgoing)
    const orders = await prisma.order.findMany({
      where: warehouseId ? { warehouseId } : {},
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        warehouse: { select: { name: true } },
        customer: { select: { fullName: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
    });

    // Format and merge all movements
    const movements: any[] = [];

    // Add transfers
    transfers.forEach(transfer => {
      transfer.items.forEach(item => {
        movements.push({
          id: `${transfer.id}-${item.id}`,
          date: transfer.date,
          type: 'TRANSFER',
          subtype: transfer.status === 'COMPLETED' ? 'TRANSFER_OUT' : 'TRANSFER_IN',
          docNumber: transfer.docNumber,
          warehouse: transfer.fromWarehouse.name,
          targetWarehouse: transfer.toWarehouse.name,
          product: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          status: transfer.status,
          person: transfer.responsiblePerson || '-',
        });
      });
    });

    // Add purchases (stock in)
    purchases.forEach(purchase => {
      purchase.items.forEach(item => {
        movements.push({
          id: `${purchase.id}-${item.id}`,
          date: purchase.date,
          type: 'PURCHASE',
          subtype: 'STOCK_IN',
          docNumber: purchase.docNumber,
          warehouse: purchase.warehouse.name,
          targetWarehouse: null,
          product: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          status: purchase.status,
          person: purchase.supplier.name,
        });
      });
    });

    // Add orders (stock out)
    orders.forEach(order => {
      order.items.forEach(item => {
        movements.push({
          id: `${order.id}-${item.id}`,
          date: order.date,
          type: 'ORDER',
          subtype: 'STOCK_OUT',
          docNumber: order.docNumber,
          warehouse: order.warehouse.name,
          targetWarehouse: null,
          product: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          status: order.status,
          person: order.customer?.fullName || 'Noma\'lum mijoz',
        });
      });
    });

    // Sort by date (most recent first)
    movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Limit results
    const limitedMovements = movements.slice(0, limit);

    return NextResponse.json({
      movements: limitedMovements,
      total: movements.length,
    });
  } catch (error) {
    console.error('GET /api/warehouse/movements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
