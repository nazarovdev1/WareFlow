import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.stockThreshold.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Stock threshold delete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { minStock, enabled } = body;

    const threshold = await prisma.stockThreshold.update({
      where: { id: params.id },
      data: {
        ...(minStock !== undefined && { minStock }),
        ...(enabled !== undefined && { enabled }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(threshold);
  } catch (err) {
    console.error('Stock threshold update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}