import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/stock — Stock entries with product info, filterable by warehouse
// GET /api/stock?allWarehouses=true — Stock across all warehouses (for checking availability)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userWarehouseId = (session?.user as any)?.warehouseId;
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get('warehouseId');
    const allWarehouses = searchParams.get('allWarehouses') === 'true';
    const search = searchParams.get('search') || '';

    const where: any = {};
    
    // Non-admin users can only see their own warehouse
    if (userRole !== 'ADMIN') {
      if (warehouseId) {
        where.warehouseId = warehouseId;
      } else if (userWarehouseId) {
        where.warehouseId = userWarehouseId;
      }
    } else if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (search) {
      where.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // If allWarehouses is true, return stock from all warehouses (for checking availability)
    if (allWarehouses) {
      const stockEntries = await prisma.stockEntry.findMany({
        where,
        include: {
          product: { include: { unit: true } },
          warehouse: true,
        },
        orderBy: { product: { name: 'asc' } },
      });

      // Group by product to show availability across warehouses
      const productMap = new Map();
      for (const entry of stockEntries) {
        if (!productMap.has(entry.productId)) {
          productMap.set(entry.productId, {
            product: entry.product,
            warehouses: [],
          });
        }
        productMap.get(entry.productId).warehouses.push({
          warehouseId: entry.warehouse.id,
          warehouseName: entry.warehouse.name,
          quantity: entry.quantity,
          reserved: entry.reserved,
          costPrice: entry.costPrice,
        });
      }

      return NextResponse.json({
        data: Array.from(productMap.values()),
        type: 'allWarehouses',
      });
    }

    const stockEntries = await prisma.stockEntry.findMany({
      where,
      include: {
        product: { include: { unit: true } },
        warehouse: true,
      },
      orderBy: { product: { name: 'asc' } },
    });

    // Calculate summary stats
    const totalQuantity = stockEntries.reduce((sum, e) => sum + e.quantity, 0);
    const totalValue = stockEntries.reduce((sum, e) => sum + e.quantity * e.costPrice, 0);

    return NextResponse.json({
      data: stockEntries,
      summary: {
        totalQuantity,
        totalValue,
        totalItems: stockEntries.length,
      },
      type: 'singleWarehouse',
    });
  } catch (error) {
    console.error('GET /api/stock error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}