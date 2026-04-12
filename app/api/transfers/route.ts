import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const TransferSchema = z.object({
  docNumber: z.string().optional(),
  date: z.string().or(z.date()).optional(),
  fromWarehouseId: z.string().min(1, "Jo'natuvchi ombor majburiy"),
  toWarehouseId: z.string().min(1, "Qabul qiluvchi ombor majburiy"),
  responsiblePerson: z.string().optional().nullable(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().min(0.001, "Miqdor 0 dan katta bo'lishi kerak"),
  })).min(1, "Kamida bitta mahsulot bo'lishi shart"),
});


// GET /api/transfers — List warehouse transfers with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const fromWarehouseId = searchParams.get('fromWarehouseId');
    const toWarehouseId = searchParams.get('toWarehouseId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.docNumber = { contains: search, mode: 'insensitive' };
    }
    if (fromWarehouseId) where.fromWarehouseId = fromWarehouseId;
    if (toWarehouseId) where.toWarehouseId = toWarehouseId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        include: {
          fromWarehouse: true,
          toWarehouse: true,
          items: { include: { product: true } },
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.transfer.count({ where }),
    ]);

    return NextResponse.json({
      data: transfers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/transfers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/transfers — Create a new transfer with items
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate with Zod
    const result = TransferSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Validatsiya xatosi', 
        details: result.error.errors.map(e => e.message) 
      }, { status: 400 });
    }

    const { docNumber, date, fromWarehouseId, toWarehouseId, responsiblePerson, items } = result.data;

    if (fromWarehouseId === toWarehouseId) {
      return NextResponse.json({ error: 'Jo\'natuvchi va qabul qiluvchi ombor bir xil bo\'lmasligi kerak' }, { status: 400 });
    }

    const transfer = await prisma.$transaction(async (tx) => {
      // Create transfer with items
      const newTransfer = await tx.transfer.create({
        data: {
          docNumber: docNumber || `TR-${Date.now()}`,
          date: date ? new Date(date) : new Date(),
          fromWarehouseId,
          toWarehouseId,
          responsiblePerson: responsiblePerson || null,
          status: 'PENDING',
          items: {
            create: (items || []).map((item: any) => ({
              productId: item.productId,
              quantity: parseFloat(item.quantity),
            })),
          },
        },
        include: {
          fromWarehouse: true,
          toWarehouse: true,
          items: { include: { product: true } },
        },
      });

      // Update stock: subtract from source, add to destination
      for (const item of newTransfer.items) {
        // Reduce from source warehouse
        await tx.stockEntry.updateMany({
          where: { productId: item.productId, warehouseId: fromWarehouseId },
          data: { quantity: { decrement: item.quantity } },
        });

        // Add to destination warehouse (upsert)
        await tx.stockEntry.upsert({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: toWarehouseId,
            },
          },
          update: { quantity: { increment: item.quantity } },
          create: {
            productId: item.productId,
            warehouseId: toWarehouseId,
            quantity: item.quantity,
          },
        });
      }

      return newTransfer;
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/transfers error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu hujjat raqami allaqachon mavjud' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
