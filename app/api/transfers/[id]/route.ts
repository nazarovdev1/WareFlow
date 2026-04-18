import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/transfers/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: {
          include: {
            product: {
              include: { unit: true },
            },
          },
        },
      },
    });
    if (!transfer) {
      return NextResponse.json({ error: 'Ko\'chirish topilmadi' }, { status: 404 });
    }
    return NextResponse.json(transfer);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
