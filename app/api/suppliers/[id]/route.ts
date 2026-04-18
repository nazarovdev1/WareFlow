import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/suppliers/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supplier = await prisma.supplier.findUnique({
      where: { id },
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
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supplier = await prisma.supplier.update({
      where: { id },
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
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // DELETE related transactions first
    await prisma.supplierTransaction.deleteMany({ where: { supplierId: id } });
    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Ta\'minotchi topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
