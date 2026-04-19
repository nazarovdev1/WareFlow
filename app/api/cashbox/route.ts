import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/cashbox — list all cashboxes
export async function GET() {
  try {
    const cashboxes = await prisma.cashbox.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { transactions: true } },
      },
    });
    return NextResponse.json(cashboxes);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cashbox — create new cashbox
export async function POST(request: Request) {
  try {
    const { name, type, currency } = await request.json();
    if (!name) return NextResponse.json({ error: 'Nomi majburiy' }, { status: 400 });

    const cashbox = await prisma.cashbox.create({
      data: {
        name,
        type: type || 'CASH',
        currency: currency || 'UZS',
      },
    });
    return NextResponse.json(cashbox, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}