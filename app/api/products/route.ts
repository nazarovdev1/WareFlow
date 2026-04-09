import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/products — List products with search, category filter, pagination
export async function GET(req: NextRequest) {
  try {
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
    const body = await req.json();
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
      // Optional initial stock
      initialStock,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Mahsulot nomi majburiy' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku: sku || null,
        barcode: barcode || null,
        barcodeType: barcodeType || 'EAN13',
        imageUrl: imageUrl || null,
        sellPrice: sellPrice ? parseFloat(sellPrice) : 0,
        wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : 0,
        minPrice: minPrice ? parseFloat(minPrice) : 0,
        categoryId: categoryId || null,
        folderId: folderId || null,
        unitId: unitId || null,
      },
    });

    // Create initial stock entry if provided
    if (initialStock && initialStock.warehouseId && initialStock.quantity) {
      await prisma.stockEntry.create({
        data: {
          productId: product.id,
          warehouseId: initialStock.warehouseId,
          quantity: parseFloat(initialStock.quantity),
          costPrice: initialStock.costPrice ? parseFloat(initialStock.costPrice) : 0,
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
