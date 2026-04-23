import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const supplierId = searchParams.get('supplierId');
    const expiringSoon = searchParams.get('expiringSoon');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (supplierId) where.supplierId = supplierId;
    if (expiringSoon === 'true') {
      const now = new Date();
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + 30);
      where.endDate = { gte: now, lte: threshold };
      where.status = 'ACTIVE';
    }

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          supplier: { select: { id: true, name: true, phone: true } },
          _count: { select: { attachments: true, payments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ]);

    return NextResponse.json({
      data: contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/contracts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.type || !body.startDate) {
      return NextResponse.json({ error: 'title, type, and startDate are required' }, { status: 400 });
    }

    const count = await prisma.contract.count();
    const contractNumber = `CTR-${String(count + 1).padStart(6, '0')}`;

    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        title: body.title,
        type: body.type,
        status: body.status || 'DRAFT',
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        value: body.value ?? null,
        currency: body.currency || 'USD',
        description: body.description || null,
        terms: body.terms || null,
        customerId: body.customerId || null,
        supplierId: body.supplierId || null,
      },
      include: {
        customer: { select: { id: true, fullName: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error('POST /api/contracts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
