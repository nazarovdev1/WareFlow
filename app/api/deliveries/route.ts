import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const DeliverySchema = z.object({
  date: z.string(),
  orderId: z.string().optional(),
  customerId: z.string().optional(),
  warehouseId: z.string(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  vehicleNumber: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
  totalWeight: z.number().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    notes: z.string().optional(),
  })).min(1),
});

export async function GET(request: Request) {
  try {
    const { error } = await checkPermission('view_sales');
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const warehouseId = searchParams.get('warehouseId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const driverName = searchParams.get('driverName');

    const where: any = {};
    if (status) where.status = status;
    if (warehouseId) where.warehouseId = warehouseId;
    if (driverName) where.driverName = { contains: driverName, mode: 'insensitive' };
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          warehouse: { select: { id: true, name: true, address: true } },
          order: { select: { id: true, docNumber: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
          route: {
            include: {
              stops: {
                include: {
                  customer: { select: { id: true, fullName: true } },
                },
                orderBy: { stopOrder: 'asc' },
              },
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.delivery.count({ where }),
    ]);

    return NextResponse.json({
      data: deliveries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/deliveries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await checkPermission('create_sales');
    if (error) return error;

    const body = await request.json();
    const result = DeliverySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const {
      date, orderId, customerId, warehouseId,
      driverName, driverPhone, vehicleNumber,
      address, latitude, longitude, notes, totalWeight, items,
    } = result.data;

    const count = await prisma.delivery.count();
    const docNumber = `DL-${String(count + 1).padStart(6, '0')}`;

    const delivery = await prisma.delivery.create({
      data: {
        docNumber,
        date: new Date(date),
        orderId: orderId || null,
        customerId: customerId || null,
        warehouseId,
        driverName: driverName || null,
        driverPhone: driverPhone || null,
        vehicleNumber: vehicleNumber || null,
        address: address || null,
        latitude: latitude || null,
        longitude: longitude || null,
        notes: notes || null,
        totalWeight: totalWeight || null,
        status: 'PREPARING',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            deliveredQty: 0,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        customer: { select: { id: true, fullName: true, phone: true } },
        warehouse: { select: { id: true, name: true, address: true } },
        order: { select: { id: true, docNumber: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });

    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    console.error('POST /api/deliveries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
