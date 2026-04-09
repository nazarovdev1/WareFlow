import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/customer-groups
export async function GET() {
  try {
    const groups = await prisma.customerGroup.findMany({
      include: { _count: { select: { customers: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/customer-groups
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Guruh nomi majburiy' }, { status: 400 });
    }
    const group = await prisma.customerGroup.create({
      data: {
        name: body.name,
        description: body.description || null,
        defaultDiscount: body.defaultDiscount ? parseFloat(body.defaultDiscount) : 0,
      },
    });
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
