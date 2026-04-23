import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const warehouseId = searchParams.get('warehouseId');

    if (!productId || !warehouseId) {
      return NextResponse.json({ error: 'productId and warehouseId are required' }, { status: 400 });
    }

    const batches = await prisma.productBatch.findMany({
      where: {
        productId,
        warehouseId,
        isActive: true,
        quantity: { gt: 0 },
      },
      include: {
        supplier: { select: { name: true } },
      },
      orderBy: [
        { expiryDate: 'asc' }, // FEFO: First expiring first
        { createdAt: 'asc' }, // FIFO: First created first
      ],
    });

    // Calculate total available quantity
    const totalQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0);

    return NextResponse.json({
      productId,
      warehouseId,
      totalQuantity,
      batches: batches.map(batch => ({
        id: batch.id,
        batchNumber: batch.batchNumber,
        quantity: batch.quantity,
        costPrice: batch.costPrice,
        expiryDate: batch.expiryDate,
        manufactureDate: batch.manufactureDate,
        supplier: batch.supplier?.name,
        isExpiringSoon: batch.expiryDate
          ? new Date(batch.expiryDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000 // 30 days
          : false,
        isExpired: batch.expiryDate
          ? new Date(batch.expiryDate) < new Date()
          : false,
      })),
    });
  } catch (error) {
    console.error('GET /api/product-batches/available error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
