import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/customer-groups/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const group = await prisma.customerGroup.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { customers: true } },
      },
    });
    if (!group) {
      return NextResponse.json({ error: 'Guruh topilmadi' }, { status: 404 });
    }
    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/customer-groups/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const group = await prisma.customerGroup.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        defaultDiscount: body.defaultDiscount !== undefined ? parseFloat(body.defaultDiscount) : undefined,
      },
    });
    return NextResponse.json(group);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Guruh topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/customer-groups/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.customerGroup.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Guruh topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
