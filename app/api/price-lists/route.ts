import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/price-lists
export async function GET() {
  try {
    const priceLists = await prisma.priceList.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(priceLists);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/price-lists
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Prays list nomi majburiy' }, { status: 400 });
    }
    const priceList = await prisma.priceList.create({
      data: {
        name: body.name,
        type: body.type || 'SALE',
        isActive: body.isActive !== undefined ? body.isActive : true,
        items: body.items ? {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            price: parseFloat(item.price),
          })),
        } : undefined,
      },
      include: { items: { include: { product: true } } },
    });
    return NextResponse.json(priceList, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
