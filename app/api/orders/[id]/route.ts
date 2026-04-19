import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const UpdateSchema = z.object({
  status: z.enum(['COMPLETED', 'CANCELLED', 'RETURNED']).optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/orders/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, phone: true, balanceUSD: true, balanceUZS: true } },
        warehouse: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
    });
    if (!order) return NextResponse.json({ error: 'Buyurtma topilmadi' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/orders/[id] — cancel order
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = UpdateSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: 'Noto\'g\'ri ma\'lumot' }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { select: { productId: true, quantity: true } } },
    });
    if (!order) return NextResponse.json({ error: 'Buyurtma topilmadi' }, { status: 404 });

    // Cancel order — restore stock and customer balance
    if (result.data.status === 'CANCELLED' && order.status === 'COMPLETED') {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.stockEntry.updateMany({
            where: { productId: item.productId, warehouseId: order.warehouseId },
            data: { quantity: { increment: item.quantity } },
          });
        }
        // Restore customer balance if was a customer order with amount
        if (order.customerId && order.finalAmount > 0) {
          await tx.customer.update({
            where: { id: order.customerId },
            data: { balanceUSD: { decrement: order.finalAmount } },
          });
        }
        // Update order status
        await tx.order.update({ where: { id }, data: { status: 'CANCELLED' } });
      });
    } else {
      await prisma.order.update({ where: { id }, data: result.data });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/orders/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}