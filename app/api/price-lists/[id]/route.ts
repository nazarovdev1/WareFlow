import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/price-lists/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const priceList = await prisma.priceList.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!priceList) {
      return NextResponse.json({ error: 'Prays list topilmadi' }, { status: 404 });
    }
    return NextResponse.json(priceList);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/price-lists/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const priceList = await prisma.priceList.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        isActive: body.isActive,
      },
      include: { items: { include: { product: true } } },
    });
    return NextResponse.json(priceList);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Prays list topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/price-lists/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.priceListItem.deleteMany({ where: { priceListId: id } });
    await prisma.priceList.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Prays list topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
