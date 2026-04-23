import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            companyName: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                barcode: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('Order detail error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, returnItems, returnReason } = body;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true, customer: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (status === 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: params.id },
          data: { status: 'CANCELLED' },
        });

        for (const item of order.items) {
          await tx.stockEntry.updateMany({
            where: {
              productId: item.productId,
              warehouseId: order.warehouseId,
            },
            data: {
              quantity: { increment: item.quantity },
            },
          });
        }

        if (order.customerId && order.finalAmount) {
          await tx.customer.update({
            where: { id: order.customerId },
            data: {
              balanceUSD: { decrement: order.finalAmount },
            },
          });
        }
      });

      return NextResponse.json({ success: true });
    }

    if (status === 'RETURNED') {
      if (!returnItems || returnItems.length === 0) {
        return NextResponse.json({ error: 'Return items required' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: params.id },
          data: { 
            status: 'RETURNED',
            notes: returnReason ? (order.notes || '') + `\n\nQaytarish sababi: ${returnReason}` : order.notes,
          },
        });

        for (const returnItem of returnItems) {
          await tx.stockEntry.updateMany({
            where: {
              productId: returnItem.productId,
              warehouseId: order.warehouseId,
            },
            data: {
              quantity: { increment: returnItem.quantity },
            },
          });
        }

        const returnTotal = returnItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);

        if (order.customerId && returnTotal) {
          await tx.customer.update({
            where: { id: order.customerId },
            data: {
              balanceUSD: { decrement: returnTotal },
            },
          });
        }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  } catch (err) {
    console.error('Order update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}