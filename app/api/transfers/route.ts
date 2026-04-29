import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const TransferSchema = z.object({
  fromWarehouseId: z.string().min(1, 'Manba ombor majburiy'),
  toWarehouseId: z.string().min(1, 'Maqsad ombor majburiy'),
  responsiblePerson: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
  })).min(1, 'Kamida bitta mahsulot bo\'lishi kerak'),
});

// GET /api/transfers — List all transfers (company filtered)
export async function GET(request: Request) {
  try {
    const { error, user } = await checkPermission('view_warehouse');
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const warehouseId = searchParams.get('warehouseId');
    const branchId = searchParams.get('branchId');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    // Company isolation
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      where.companyId = user.companyId;
    }

    if (status) where.status = status;

    // Filter by warehouse (either from or to)
    if (warehouseId) {
      where.OR = [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId },
      ];
    }

    // Filter by branch through warehouses
    if (branchId) {
      const branchWarehouses = await prisma.warehouse.findMany({
        where: { branchId },
        select: { id: true },
      });
      const whIds = branchWarehouses.map(w => w.id);
      where.OR = [
        { fromWarehouseId: { in: whIds } },
        { toWarehouseId: { in: whIds } },
      ];
    }

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
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
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transfer.count({ where }),
    ]);

    return NextResponse.json({
      data: transfers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/transfers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/transfers — Create new transfer (company isolated)
export async function POST(request: Request) {
  try {
    const { error, user } = await checkPermission('edit_warehouse');
    if (error) return error;

    const body = await request.json();
    const result = TransferSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { fromWarehouseId, toWarehouseId, responsiblePerson, notes, items } = result.data;

    // Validate warehouses belong to same company
    if (fromWarehouseId === toWarehouseId) {
      return NextResponse.json({
        error: 'Manba va maqsad ombor bir xil bo\'lishi mumkin emas',
      }, { status: 400 });
    }

    // Check stock availability
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
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        return NextResponse.json({
          error: `Yetarli zaxira yo'q: ${product?.name || item.productId} (mavjud: ${stock?.quantity || 0}, so'ralgan: ${item.quantity})`,
        }, { status: 400 });
      }
    }

    // Generate document number
    const count = await prisma.transfer.count();
    const docNumber = `TR-${String(count + 1).padStart(6, '0')}`;

    // Get company from warehouse
    const fromWarehouse = await prisma.warehouse.findUnique({
      where: { id: fromWarehouseId },
      select: { companyId: true },
    });

    const transfer = await prisma.transfer.create({
      data: {
        docNumber,
        responsiblePerson: responsiblePerson || null,
        notes: notes || null,
        status: 'PENDING',
        companyId: user.companyId || fromWarehouse?.companyId || null,
        fromWarehouseId,
        toWarehouseId,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
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

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error('POST /api/transfers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
