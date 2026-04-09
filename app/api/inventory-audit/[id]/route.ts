import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/inventory-audit/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const audit = await prisma.inventoryAudit.findUnique({
      where: { id: params.id },
      include: {
        warehouse: true,
        items: { include: { product: { include: { unit: true } } } },
      },
    });
    if (!audit) {
      return NextResponse.json({ error: 'Invertarizatsiya topilmadi' }, { status: 404 });
    }
    return NextResponse.json(audit);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/inventory-audit/[id] — finalize/complete an audit
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const audit = await prisma.inventoryAudit.update({
      where: { id: params.id },
      data: {
        status: body.status || 'COMPLETED',
        responsiblePerson: body.responsiblePerson,
      },
      include: {
        warehouse: true,
        items: { include: { product: true } },
      },
    });
    return NextResponse.json(audit);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Invertarizatsiya topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
