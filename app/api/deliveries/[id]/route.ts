import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PREPARING: ['LOADED', 'CANCELLED'],
  LOADED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'PARTIALLY_DELIVERED', 'RETURNED', 'CANCELLED'],
  PARTIALLY_DELIVERED: ['DELIVERED', 'RETURNED'],
  DELIVERED: ['RETURNED'],
  RETURNED: [],
  CANCELLED: [],
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await checkPermission('view_sales');
    if (error) return error;

    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            companyName: true,
            address: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        order: {
          select: {
            id: true,
            docNumber: true,
            totalAmount: true,
            finalAmount: true,
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
                unit: true,
                weight: true,
              },
            },
          },
        },
        route: {
          include: {
            stops: {
              include: {
                customer: {
                  select: {
                    id: true,
                    fullName: true,
                    phone: true,
                    address: true,
                  },
                },
              },
              orderBy: { stopOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    return NextResponse.json(delivery);
  } catch (err) {
    console.error('GET /api/deliveries/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await checkPermission('create_sales');
    if (error) return error;

    const body = await req.json();
    const { status, deliveredItems, notes } = body;

    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: { items: true, route: { include: { stops: true } } },
    });

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    if (status) {
      const allowed = VALID_TRANSITIONS[delivery.status] || [];
      if (!allowed.includes(status)) {
        return NextResponse.json({
          error: `Invalid status transition: ${delivery.status} → ${status}. Allowed: [${allowed.join(', ')}]`,
        }, { status: 400 });
      }

      const updateData: any = { status };
      if (notes) updateData.notes = notes;

      if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      }

      if (deliveredItems && Array.isArray(deliveredItems)) {
        const itemUpdates = deliveredItems.map((di: any) =>
          prisma.deliveryItem.update({
            where: { id: di.id },
            data: { deliveredQty: di.deliveredQty },
          })
        );
        await Promise.all(itemUpdates);
      }

      const updated = await prisma.delivery.update({
        where: { id: params.id },
        data: updateData,
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          warehouse: { select: { id: true, name: true } },
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
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  } catch (err) {
    console.error('PATCH /api/deliveries/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await checkPermission('create_sales');
    if (error) return error;

    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
    });

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    if (delivery.status !== 'PREPARING') {
      return NextResponse.json({
        error: 'Only deliveries in PREPARING status can be cancelled',
      }, { status: 400 });
    }

    const updated = await prisma.delivery.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('DELETE /api/deliveries/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
