import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/warehouses
export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: { select: { stockEntries: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(warehouses);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/warehouses
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Ombor nomi majburiy' }, { status: 400 });
    }
    const warehouse = await prisma.warehouse.create({
      data: {
        name: body.name,
        address: body.address || null,
        isDefault: body.isDefault || false,
      },
    });
    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
