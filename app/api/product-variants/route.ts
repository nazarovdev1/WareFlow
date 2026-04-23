import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const active = searchParams.get('active');

    const where: any = {};
    if (productId) where.productId = productId;
    if (active === 'true') where.isActive = true;

    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(variants);
  } catch (err) {
    console.error('Product variants fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, name, sku, price, costPrice, quantity, imageUrl } = body;

    if (!productId || !name) {
      return NextResponse.json({ error: 'Product and name are required' }, { status: 400 });
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name,
        sku,
        price: price || 0,
        costPrice: costPrice || 0,
        quantity: quantity || 0,
        imageUrl,
      },
    });

    return NextResponse.json(variant);
  } catch (err) {
    console.error('Product variant create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}