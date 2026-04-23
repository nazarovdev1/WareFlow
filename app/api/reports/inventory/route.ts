import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try { return await fn(); } catch { return fallback; }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const categoryId = searchParams.get('categoryId');
    const lowStock = searchParams.get('lowStock') === 'true';
    const groupBy = searchParams.get('groupBy') || 'category';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const stockWhere: any = {};
    if (warehouseId) stockWhere.warehouseId = warehouseId;
    if (lowStock) stockWhere.quantity = { lt: 10 };

    const productWhere: any = {};
    if (categoryId) productWhere.categoryId = categoryId;

    const [totalProducts, stockEntries, warehouses, categories] = await Promise.all([
      safe(() => prisma.product.count({ where: productWhere }), 0),
      prisma.stockEntry.findMany({
        where: stockWhere,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              category: { select: { id: true, name: true } },
              sellPrice: true,
              minPrice: true,
            },
          },
          warehouse: { select: { id: true, name: true } },
        },
        orderBy: { quantity: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.warehouse.findMany({ select: { id: true, name: true } }),
      prisma.category.findMany({ select: { id: true, name: true } }),
    ]);

    const totalStock = stockEntries.reduce((sum, e) => sum + e.quantity, 0);
    const totalValue = stockEntries.reduce((sum, e) => sum + (e.quantity * e.costPrice), 0);

    let summary = {
      totalProducts,
      totalStock,
      totalValue,
      lowStockItems: stockEntries.filter(e => e.quantity < 10).length,
    };

    let chartData: any[] = [];
    if (groupBy === 'category') {
      const byCategory = stockEntries.reduce((acc: any, entry) => {
        const cat = entry.product.category?.name || 'Unknown';
        if (!acc[cat]) acc[cat] = { category: cat, stock: 0, value: 0 };
        acc[cat].stock += entry.quantity;
        acc[cat].value += entry.quantity * entry.costPrice;
        return acc;
      }, {});
      chartData = Object.values(byCategory);
    } else if (groupBy === 'warehouse') {
      const byWarehouse = stockEntries.reduce((acc: any, entry) => {
        const wh = entry.warehouse.name;
        if (!acc[wh]) acc[wh] = { warehouse: wh, stock: 0, value: 0 };
        acc[wh].stock += entry.quantity;
        acc[wh].value += entry.quantity * entry.costPrice;
        return acc;
      }, {});
      chartData = Object.values(byWarehouse);
    }

    const tableData = stockEntries.map(entry => ({
      id: entry.id,
      product: entry.product.name,
      sku: entry.product.sku,
      category: entry.product.category?.name || '-',
      warehouse: entry.warehouse.name,
      stock: entry.quantity,
      reserved: entry.reserved || 0,
      available: entry.quantity - (entry.reserved || 0),
      costPrice: entry.costPrice,
      sellPrice: entry.product.sellPrice,
      value: entry.quantity * entry.costPrice,
      lowStock: entry.quantity < 10,
    }));

    return NextResponse.json({
      summary,
      chartData,
      tableData,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (err) {
    console.error('Inventory report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}