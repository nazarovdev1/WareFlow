import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const UpdateSchema = z.object({
  status: z.enum(['COMPLETED', 'CANCELLED', 'DRAFT']).optional(),
  notes: z.string().optional(),
});

// GET /api/purchases/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, name: true, phone: true } },
        warehouse: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
    });
    if (!purchase) return NextResponse.json({ error: 'Xarid topilmadi' }, { status: 404 });
    return NextResponse.json(purchase);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/purchases/[id] — cancel purchase
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = UpdateSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: 'Noto\'g\'ri ma\'lumot' }, { status: 400 });

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { items: { select: { productId: true, quantity: true } } },
    });
    if (!purchase) return NextResponse.json({ error: 'Xarid topilmadi' }, { status: 404 });

    if (result.data.status === 'CANCELLED' && purchase.status === 'COMPLETED') {
      await prisma.$transaction(async (tx) => {
        // Reduce stock from warehouse (reverse the purchase stock increase)
        for (const item of purchase.items) {
          await tx.stockEntry.updateMany({
            where: { productId: item.productId, warehouseId: purchase.warehouseId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
        // Restore supplier balance if had debt
        if (purchase.totalAmount > 0) {
          await tx.supplier.update({
            where: { id: purchase.supplierId },
            data: { balanceUSD: { decrement: purchase.totalAmount } },
          });
        }
        // Update purchase status
        await tx.purchase.update({ where: { id }, data: { status: 'CANCELLED' } });
      });
    } else {
      await prisma.purchase.update({ where: { id }, data: result.data });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/purchases/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}