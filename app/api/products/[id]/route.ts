import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/products/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        folder: true,
        unit: true,
        stockEntries: { include: { warehouse: true } },
        priceListItems: { include: { priceList: true } },
      },
    });
    if (!product) {
      return NextResponse.json({ error: 'Mahsulot topilmadi' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/products/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        sku: body.sku,
        barcode: body.barcode,
        barcodeType: body.barcodeType,
        imageUrl: body.imageUrl,
        sellPrice: body.sellPrice !== undefined ? parseFloat(body.sellPrice) : undefined,
        wholesalePrice: body.wholesalePrice !== undefined ? parseFloat(body.wholesalePrice) : undefined,
        minPrice: body.minPrice !== undefined ? parseFloat(body.minPrice) : undefined,
        categoryId: body.categoryId || null,
        folderId: body.folderId || null,
        unitId: body.unitId || null,
      },
      include: {
        category: true,
        folder: true,
        unit: true,
        stockEntries: { include: { warehouse: true } },
      },
    });
    return NextResponse.json(product);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Mahsulot topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.$transaction([
      prisma.stockEntry.deleteMany({ where: { productId: id } }),
      prisma.transferItem.deleteMany({ where: { productId: id } }),
      prisma.inventoryAuditItem.deleteMany({ where: { productId: id } }),
      prisma.priceListItem.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE Error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Mahsulot topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: `Xatolik: ${error.message}` }, { status: 500 });
  }
}
