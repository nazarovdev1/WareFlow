import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/inventory-audit
export async function GET(req: NextRequest) {
  try {
    const audits = await prisma.inventoryAudit.findMany({
      include: {
        warehouse: true,
        items: { include: { product: true } },
      },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(audits);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/inventory-audit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { docNumber, warehouseId, responsiblePerson, items } = body;

    if (!warehouseId) {
      return NextResponse.json({ error: 'Ombor tanlanishi shart' }, { status: 400 });
    }

    const audit = await prisma.inventoryAudit.create({
      data: {
        docNumber: docNumber || `INV-${Date.now()}`,
        warehouseId,
        responsiblePerson: responsiblePerson || null,
        status: 'IN_PROGRESS',
        items: {
          create: (items || []).map((item: any) => ({
            productId: item.productId,
            systemQty: parseFloat(item.systemQty),
            actualQty: parseFloat(item.actualQty),
            difference: parseFloat(item.actualQty) - parseFloat(item.systemQty),
          })),
        },
      },
      include: {
        warehouse: true,
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(audit, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu hujjat raqami allaqachon mavjud' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
