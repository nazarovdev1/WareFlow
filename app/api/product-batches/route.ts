import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const BatchSchema = z.object({
  batchNumber: z.string().optional(),
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.coerce.number().min(0).default(0),
  initialQty: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).default(0),
  manufactureDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  purchaseId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

function generateBatchNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BATCH-${y}${m}${d}-${rand}`;
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkPermission('view_products');
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const warehouseId = searchParams.get('warehouseId');
    const expiringSoon = searchParams.get('expiringSoon');
    const isActive = searchParams.get('isActive');
    const supplierId = searchParams.get('supplierId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (supplierId) where.supplierId = supplierId;
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    if (expiringSoon === 'true') {
      const now = new Date();
      const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
      const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      where.expiryDate = { gte: now, lte: in90 };
      where.isActive = true;

      const [batches30, batches60, batches90, allExpiring] = await Promise.all([
        prisma.productBatch.findMany({
          where: { ...where, expiryDate: { gte: now, lte: in30 } },
          include: { product: true, warehouse: true, supplier: true },
          orderBy: { expiryDate: 'asc' },
        }),
        prisma.productBatch.findMany({
          where: { ...where, expiryDate: { gte: now, lte: in60 } },
          include: { product: true, warehouse: true, supplier: true },
          orderBy: { expiryDate: 'asc' },
        }),
        prisma.productBatch.findMany({
          where: { ...where, expiryDate: { gte: now, lte: in90 } },
          include: { product: true, warehouse: true, supplier: true },
          orderBy: { expiryDate: 'asc' },
        }),
        prisma.productBatch.findMany({
          where: { expiryDate: { gte: now, lte: in90 }, isActive: true },
          include: { product: true, warehouse: true, supplier: true },
          orderBy: { expiryDate: 'asc' },
        }),
      ]);

      return NextResponse.json({
        expiringSoon: {
          within30Days: batches30,
          within60Days: batches60,
          within90Days: batches90,
        },
        totalExpiring: allExpiring.length,
        data: allExpiring,
      });
    }

    const fifo = searchParams.get('fifo');
    const fefo = searchParams.get('fefo');
    const summary = searchParams.get('summary');

    if (summary === 'true') {
      const batchSummary = await prisma.productBatch.groupBy({
        by: ['productId'],
        where: { isActive: true },
        _sum: { quantity: true, initialQty: true },
        _count: { id: true },
      });

      const productIds = batchSummary.map((s: any) => s.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      });

      const result = batchSummary.map((s: any) => ({
        productId: s.productId,
        product: products.find((p: any) => p.id === s.productId),
        totalQuantity: s._sum.quantity ?? 0,
        totalInitialQty: s._sum.initialQty ?? 0,
        batchCount: s._count.id,
      }));

      return NextResponse.json({ data: result });
    }

    let orderBy: any = { createdAt: 'desc' };
    if (fifo === 'true') {
      orderBy = { manufactureDate: 'asc' };
    } else if (fefo === 'true') {
      orderBy = { expiryDate: 'asc' };
    }

    const [batches, total] = await Promise.all([
      prisma.productBatch.findMany({
        where,
        include: { product: true, warehouse: true, supplier: true },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.productBatch.count({ where }),
    ]);

    return NextResponse.json({
      data: batches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/product-batches error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await checkPermission('create_products');
    if (error) return error;

    const body = await req.json();
    const result = BatchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validatsiya xatosi', details: result.error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    const data = result.data;
    const batchNumber = data.batchNumber || generateBatchNumber();
    const initialQty = data.initialQty ?? data.quantity;

    const batch = await prisma.productBatch.create({
      data: {
        batchNumber,
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        initialQty,
        costPrice: data.costPrice,
        manufactureDate: data.manufactureDate ? new Date(data.manufactureDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        supplierId: data.supplierId || null,
        purchaseId: data.purchaseId || null,
        notes: data.notes || null,
      },
      include: { product: true, warehouse: true, supplier: true },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/product-batches error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Batch number allaqachon mavjud' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
