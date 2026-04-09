import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/suppliers/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: { transactions: { orderBy: { date: 'desc' }, take: 50 } },
    });
    if (!supplier) {
      return NextResponse.json({ error: 'Ta\'minotchi topilmadi' }, { status: 404 });
    }
    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/suppliers/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        name: body.name,
        contactPerson: body.contactPerson,
        phone: body.phone,
        category: body.category,
        status: body.status,
      },
    });
    return NextResponse.json(supplier);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Ta\'minotchi topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/suppliers/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.supplier.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Ta\'minotchi topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
