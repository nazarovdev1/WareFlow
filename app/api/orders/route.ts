import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const OrderSchema = z.object({
  customerId: z.string().optional(),
  warehouseId: z.string(),
  discount: z.number().default(0),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    price: z.number().positive(),
  })).min(1, 'Kamida bitta mahsulot bo\'lishi kerak'),
});

// GET /api/orders — List all orders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const warehouseId = searchParams.get('warehouseId');

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (search) {
      where.OR = [
        { docNumber: { contains: search } },
        { customer: { fullName: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { fullName: true, phone: true } },
          warehouse: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true, sku: true } },
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/orders — Create new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = OrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { customerId, warehouseId, discount, paymentMethod, notes, items } = result.data;

    // Generate document number
    const count = await prisma.order.count();
    const docNumber = `SL-${String(count + 1).padStart(6, '0')}`;

    // Calculate totals
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.quantity * item.price;
    }
    const finalAmount = totalAmount - discount;

    // Create order with stock update
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          docNumber,
          customerId: customerId || null,
          warehouseId,
          totalAmount,
          discount,
          finalAmount,
          paymentMethod: paymentMethod || null,
          notes: notes || null,
          status: 'COMPLETED',
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price,
            })),
          },
        },
        include: {
          customer: { select: { fullName: true } },
          warehouse: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true, sku: true } },
            },
          },
        },
      });

      // Update stock (decrease)
      for (const item of items) {
        await tx.stockEntry.updateMany({
          where: {
            productId: item.productId,
            warehouseId,
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });
      }

      // Update customer balance if exists
      if (customerId && finalAmount > 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            balanceUSD: { increment: finalAmount },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
