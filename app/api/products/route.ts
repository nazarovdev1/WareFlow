import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const ProductSchema = z.object({
  name: z.string().min(1, "Mahsulot nomi majburiy"),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  barcodeType: z.string().default('EAN13'),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  sellPrice: z.coerce.number().min(0).default(0),
  wholesalePrice: z.coerce.number().min(0).default(0),
  minPrice: z.coerce.number().min(0).default(0),
  categoryId: z.string().optional().nullable(),
  folderId: z.string().optional().nullable(),
  unitId: z.string().optional().nullable(),
  initialStock: z.object({
    warehouseId: z.string(),
    quantity: z.coerce.number().min(0),
    costPrice: z.coerce.number().min(0).optional(),
  }).optional(),
});


// GET /api/products — List products with search, category filter, pagination
export async function GET(req: NextRequest) {
  try {
    const { error } = await checkPermission('view_products');
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          folder: true,
          unit: true,
          stockEntries: {
            include: { warehouse: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/products — Create a new product (with optional initial stock)
export async function POST(req: NextRequest) {
  try {
    const { error } = await checkPermission('create_products');
    if (error) return error;

    const body = await req.json();
    
    // Validate with Zod
    const result = ProductSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Validatsiya xatosi', 
        details: result.error.issues.map(e => e.message) 
      }, { status: 400 });
    }

    const {
      name,
      sku,
      barcode,
      barcodeType,
      imageUrl,
      sellPrice,
      wholesalePrice,
      minPrice,
      categoryId,
      folderId,
      unitId,
      initialStock,
    } = result.data;

    const product = await prisma.product.create({
      data: {
        name,
        sku: sku || null,
        barcode: barcode || null,
        barcodeType,
        imageUrl: imageUrl || null,
        sellPrice,
        wholesalePrice,
        minPrice,
        categoryId,
        folderId,
        unitId,
      },
    });

    // Create initial stock entry if provided
    if (initialStock) {
      await prisma.stockEntry.create({
        data: {
          productId: product.id,
          warehouseId: initialStock.warehouseId,
          quantity: initialStock.quantity,
          costPrice: initialStock.costPrice || 0,
        },
      });
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        folder: true,
        unit: true,
        stockEntries: { include: { warehouse: true } },
      },
    });

    return NextResponse.json(fullProduct, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/products error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'SKU yoki shtrix-kod allaqachon mavjud' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
