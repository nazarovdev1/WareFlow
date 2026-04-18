import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const SendProductsSchema = z.object({
  fromWarehouseId: z.string().min(1, "Omborxona tanlang"),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive("Miqdor 0 dan katta bo'lishi kerak"),
  })).min(1, "Kamida 1 ta mahsulot tanlang"),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin huquqi talab qilinadi' }, { status: 403 });
    }

    const { id: userId } = await params;
    const body = await req.json();
    const result = SendProductsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { fromWarehouseId, items, notes } = result.data;

    // Get target user and their warehouse
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { warehouse: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }

    if (!targetUser.warehouseId) {
      return NextResponse.json({ error: 'Foydalanuvchiga omborxona biriktirilmagan' }, { status: 400 });
    }

    if (fromWarehouseId === targetUser.warehouseId) {
      return NextResponse.json({ error: 'Bir xil omborxonadan yuborib bo\'lmaydi' }, { status: 400 });
    }

    // Verify stock availability
    for (const item of items) {
      const stock = await prisma.stockEntry.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: fromWarehouseId,
          },
        },
      });

      if (!stock || stock.quantity < item.quantity) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        return NextResponse.json({
          error: `"${product?.name || item.productId}" uchun yetarli zaxira yo'q (mavjud: ${stock?.quantity || 0})`,
        }, { status: 400 });
      }
    }

    // Create transfer document
    const docNumber = `TRN-${Date.now().toString(36).toUpperCase()}`;

    const transfer = await prisma.transfer.create({
      data: {
        docNumber,
        fromWarehouseId,
        toWarehouseId: targetUser.warehouseId,
        responsiblePerson: (session.user as any)?.name || 'Admin',
        status: 'COMPLETED',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        fromWarehouse: true,
        toWarehouse: true,
      },
    });

    // Update stock entries
    for (const item of items) {
      // Decrease from source warehouse
      await prisma.stockEntry.update({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: fromWarehouseId,
          },
        },
        data: { quantity: { decrement: item.quantity } },
      });

      // Increase in target warehouse (create if doesn't exist)
      await prisma.stockEntry.upsert({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: targetUser.warehouseId,
          },
        },
        update: { quantity: { increment: item.quantity } },
        create: {
          productId: item.productId,
          warehouseId: targetUser.warehouseId,
          quantity: item.quantity,
          costPrice: 0,
        },
      });
    }

    // Create product names list for notification
    const productNames = transfer.items
      .map(i => `${i.product.name} (${i.quantity} dona)`)
      .join(', ');

    // Create notification for the user
    await prisma.userNotification.create({
      data: {
        userId,
        type: 'product_transfer',
        title: 'Sizga tovar yuborildi!',
        message: `${transfer.fromWarehouse.name} dan ${transfer.toWarehouse.name} ga: ${productNames}`,
        link: '/warehouse/stock',
      },
    });

    // Create admin notification (log)
    await prisma.adminNotification.create({
      data: {
        type: 'product_transfer',
        title: `Tovar yuborildi: ${targetUser.name || targetUser.email}`,
        message: `${productNames} — ${transfer.fromWarehouse.name} → ${transfer.toWarehouse.name}`,
        link: `/users/${userId}`,
      },
    });

    return NextResponse.json({
      message: 'Tovarlar muvaffaqiyatli yuborildi',
      transfer,
    });
  } catch (error) {
    console.error('POST /api/users/[id]/send-products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
