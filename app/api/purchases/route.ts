import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const PurchaseSchema = z.object({
  supplierId: z.string(),
  warehouseId: z.string(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    price: z.number().positive(),
  })).min(1, 'Kamida bitta mahsulot bo\'lishi kerak'),
});

// GET /api/purchases — List all purchases (company + branch filtered)
export async function GET(request: Request) {
  try {
    const { error, user } = await checkPermission('view_purchases');
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');
    const warehouseId = searchParams.get('warehouseId');
    const branchId = searchParams.get('branchId');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    // Company isolation
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      where.companyId = user.companyId;
    }
    // Branch filter
    if (branchId) {
      where.branchId = branchId;
    } else if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.branchId) {
      where.branchId = user.branchId;
    }

    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (search) {
      where.OR = [
        { docNumber: { contains: search } },
        { supplier: { name: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          supplier: { select: { name: true, phone: true } },
          warehouse: { select: { name: true } },
          branch: { select: { id: true, name: true } },
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
      prisma.purchase.count({ where }),
    ]);

    return NextResponse.json({
      data: purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    console.error('GET /api/purchases error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/purchases — Create new purchase (company + branch isolated)
export async function POST(request: Request) {
  try {
    const { error, user } = await checkPermission('create_purchases');
    if (error) return error;

    const body = await request.json();
    const result = PurchaseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { supplierId, warehouseId, notes, items } = result.data;

    // Determine branchId from warehouse
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
      select: { branchId: true, companyId: true },
    });

    // Generate document number
    const count = await prisma.purchase.count();
    const docNumber = `PR-${String(count + 1).padStart(6, '0')}`;

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Create purchase with stock update
    const purchase = await prisma.$transaction(async (tx) => {
      const newPurchase = await tx.purchase.create({
        data: {
          docNumber,
          supplierId,
          warehouseId,
          totalAmount,
          status: 'COMPLETED',
          notes: notes || null,
          companyId: user.companyId || warehouse?.companyId || null,
          branchId: warehouse?.branchId || user.branchId || null,
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
          supplier: { select: { name: true } },
          warehouse: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true, sku: true } },
            },
          },
        },
      });

      // Update stock (increase) and cost price
      for (const item of items) {
        const existingStock = await tx.stockEntry.findUnique({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId,
            },
          },
        });

        if (existingStock) {
          await tx.stockEntry.update({
            where: { id: existingStock.id },
            data: {
              quantity: { increment: item.quantity },
              costPrice: item.price,
            },
          });
        } else {
          await tx.stockEntry.create({
            data: {
              productId: item.productId,
              warehouseId,
              quantity: item.quantity,
              costPrice: item.price,
            },
          });
        }
      }

      // Update supplier balance
      await tx.supplier.update({
        where: { id: supplierId },
        data: {
          balanceUSD: { increment: totalAmount },
        },
      });

      return newPurchase;
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error('POST /api/purchases error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
