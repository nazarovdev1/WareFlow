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

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Kamida bitta mahsulot kiriting' }, { status: 400 });
    }

    const audit = await prisma.inventoryAudit.create({
      data: {
        docNumber: docNumber || `INV-${Date.now()}`,
        warehouseId,
        responsiblePerson: responsiblePerson || null,
        status: 'IN_PROGRESS',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            // Support both field names from frontend
            systemQty: parseFloat(item.systemQty ?? item.expectedQty ?? 0),
            actualQty: parseFloat(item.actualQty ?? 0),
            difference: parseFloat(item.actualQty ?? 0) - parseFloat(item.systemQty ?? item.expectedQty ?? 0),
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
    console.error('POST /api/inventory-audit error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu hujjat raqami allaqachon mavjud' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
