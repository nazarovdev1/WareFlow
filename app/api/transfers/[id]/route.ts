import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

// GET /api/transfers/[id] — Get single transfer
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await checkPermission('view_warehouse');
    if (error) return error;

    const { id } = await params;
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        fromWarehouse: {
          select: {
            name: true,
            branch: { select: { id: true, name: true } },
          },
        },
        toWarehouse: {
          select: {
            name: true,
            branch: { select: { id: true, name: true } },
          },
        },
        items: {
          include: {
            product: { select: { name: true, sku: true, imageUrl: true } },
          },
        },
      },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer topilmadi' }, { status: 404 });
    }

    return NextResponse.json(transfer);
  } catch (error) {
    console.error('GET /api/transfers/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/transfers/[id] — Update transfer status (approve, send, complete, cancel)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await checkPermission('edit_warehouse');
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const { action } = body as { action: 'approve' | 'send' | 'complete' | 'cancel' };

    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer topilmadi' }, { status: 404 });
    }

    switch (action) {
      case 'approve':
        // PENDING -> IN_TRANSIT
        if (transfer.status !== 'PENDING') {
          return NextResponse.json({ error: 'Faqat PENDING transferni tasdiqlash mumkin' }, { status: 400 });
        }

        // Reserve stock from source warehouse
        await prisma.$transaction(async (tx) => {
          for (const item of transfer.items) {
            await tx.stockEntry.update({
              where: {
                productId_warehouseId: {
                  productId: item.productId,
                  warehouseId: transfer.fromWarehouseId,
                },
              },
              data: {
                reserved: { increment: item.quantity },
              },
            });
          }

          await tx.transfer.update({
            where: { id },
            data: { status: 'IN_TRANSIT' },
          });
        });

        break;

      case 'complete':
        // IN_TRANSIT -> COMPLETED (actual stock movement)
        if (transfer.status !== 'IN_TRANSIT') {
          return NextResponse.json({ error: 'Faqat IN_TRANSIT transferni yakunlash mumkin' }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
          for (const item of transfer.items) {
            // Decrease from source warehouse
            const sourceStock = await tx.stockEntry.findUnique({
              where: {
                productId_warehouseId: {
                  productId: item.productId,
                  warehouseId: transfer.fromWarehouseId,
                },
              },
            });

            if (!sourceStock || sourceStock.quantity < item.quantity) {
              throw new Error(`Yetarli zaxira yo'q: ${item.productId}`);
            }

            await tx.stockEntry.update({
              where: {
                productId_warehouseId: {
                  productId: item.productId,
                  warehouseId: transfer.fromWarehouseId,
                },
              },
              data: {
                quantity: { decrement: item.quantity },
                reserved: { decrement: item.quantity },
              },
            });

            // Increase in target warehouse (upsert)
            const targetStock = await tx.stockEntry.findUnique({
              where: {
                productId_warehouseId: {
                  productId: item.productId,
                  warehouseId: transfer.toWarehouseId,
                },
              },
            });

            if (targetStock) {
              await tx.stockEntry.update({
                where: { id: targetStock.id },
                data: {
                  quantity: { increment: item.quantity },
                },
              });
            } else {
              await tx.stockEntry.create({
                data: {
                  productId: item.productId,
                  warehouseId: transfer.toWarehouseId,
                  quantity: item.quantity,
                  costPrice: sourceStock.costPrice,
                },
              });
            }
          }

          await tx.transfer.update({
            where: { id },
            data: { status: 'COMPLETED' },
          });
        });

        break;

      case 'cancel':
        // PENDING/IN_TRANSIT -> CANCELLED
        if (transfer.status === 'COMPLETED') {
          return NextResponse.json({ error: 'COMPLETED transferni bekor qilib bo\'lmaydi' }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
          // If IN_TRANSIT, release reserved stock
          if (transfer.status === 'IN_TRANSIT') {
            for (const item of transfer.items) {
              await tx.stockEntry.update({
                where: {
                  productId_warehouseId: {
                    productId: item.productId,
                    warehouseId: transfer.fromWarehouseId,
                  },
                },
                data: {
                  reserved: { decrement: item.quantity },
                },
              });
            }
          }

          await tx.transfer.update({
            where: { id },
            data: { status: 'CANCELLED' },
          });
        });

        break;

      default:
        return NextResponse.json({ error: 'Noto\'g\'ri action' }, { status: 400 });
    }

    // Return updated transfer
    const updatedTransfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        fromWarehouse: {
          select: {
            name: true,
            branch: { select: { id: true, name: true } },
          },
        },
        toWarehouse: {
          select: {
            name: true,
            branch: { select: { id: true, name: true } },
          },
        },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
    });

    return NextResponse.json(updatedTransfer);
  } catch (error) {
    console.error('PATCH /api/transfers/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
