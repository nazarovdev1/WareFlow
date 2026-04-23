import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const thresholds = await prisma.stockThreshold.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(thresholds);
  } catch (err) {
    console.error('Stock thresholds fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, warehouseId, minStock, enabled } = body;

    if (!productId || !warehouseId) {
      return NextResponse.json({ error: 'Product and warehouse are required' }, { status: 400 });
    }

    const threshold = await prisma.stockThreshold.upsert({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      create: {
        productId,
        warehouseId,
        minStock: minStock || 0,
        enabled: enabled !== undefined ? enabled : true,
      },
      update: {
        minStock: minStock || 0,
        enabled: enabled !== undefined ? enabled : true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(threshold);
  } catch (err) {
    console.error('Stock threshold create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}