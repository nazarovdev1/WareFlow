import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/stock — Stock entries with product info, filterable by warehouse
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get('warehouseId');
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (search) {
      where.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      };
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
    });
  } catch (error) {
    console.error('GET /api/stock error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
