import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const UpdateSchema = z.object({
  name: z.string().min(1, "Ombor nomi majburiy").optional(),
  address: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: { select: { stockEntries: true, transfersFrom: true, transfersTo: true } },
        stockEntries: { select: { quantity: true, costPrice: true } },
      },
    });
    if (!warehouse) return NextResponse.json({ error: 'Ombor topilmadi' }, { status: 404 });
    return NextResponse.json(warehouse);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = UpdateSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: 'Validatsiya xatosi' }, { status: 400 });

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: result.data,
    });
    return NextResponse.json(warehouse);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: { _count: { select: { stockEntries: true } } },
    });
    if (!warehouse) return NextResponse.json({ error: 'Ombor topilmadi' }, { status: 404 });
    if (warehouse._count.stockEntries > 0) {
      return NextResponse.json({ error: 'Omborda mahsulotlar bor, o\'chirib bo\'lmaydi' }, { status: 400 });
    }

    await prisma.warehouse.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
