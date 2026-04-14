import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET inventory adjustments
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const adjustments = await prisma.inventoryAudit.findMany({
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        items: {
          include: {
            product: true,
            warehouse: true,
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      data: adjustments,
      count: adjustments.length,
    });
  } catch (error) {
    console.error('GET /api/inventory-adjustments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create inventory adjustment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { note, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    // Create adjustment with items and update stock
    const adjustment = await prisma.$transaction(async (tx) => {
      // Create audit record
      const audit = await tx.inventoryAudit.create({
        data: {
          date: new Date(),
          note: note || 'Korrektirovka',
          userId: user.id,
        },
      });

      // Process each item
      for (const item of items) {
        const { productId, warehouseId, expectedQty, actualQty, reason } = item;
        const difference = actualQty - expectedQty;

        // Create audit item
        await tx.inventoryAuditItem.create({
          data: {
            auditId: audit.id,
            productId,
            warehouseId,
            expectedQty,
            actualQty,
            difference,
            reason: reason || 'Korrektirovka',
          },
        });

        // Update stock entry
        if (difference !== 0) {
          const stockEntry = await tx.stockEntry.findFirst({
            where: {
              productId,
              warehouseId,
            },
          });

          if (stockEntry) {
            await tx.stockEntry.update({
              where: { id: stockEntry.id },
              data: {
                quantity: stockEntry.quantity + difference,
              },
            });
          } else {
            // Create new stock entry if doesn't exist
            await tx.stockEntry.create({
              data: {
                productId,
                warehouseId,
                quantity: actualQty,
                costPrice: 0,
              },
            });
          }
        }
      }

      return audit;
    });

    return NextResponse.json(adjustment, { status: 201 });
  } catch (error) {
    console.error('POST /api/inventory-adjustments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
