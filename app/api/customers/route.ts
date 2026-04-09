import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/customers — List customers with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const region = searchParams.get('region');
    const groupId = searchParams.get('groupId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (region) where.region = region;
    if (groupId) where.groupId = groupId;
    if (status) where.status = status;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: { group: true },
        skip,
        take: limit,
        orderBy: { fullName: 'asc' },
      }),
      prisma.customer.count({ where }),
    ]);

    // Aggregated stats
    const stats = await prisma.customer.aggregate({
      _sum: { balanceUSD: true, balanceUZS: true },
      _count: true,
    });

    return NextResponse.json({
      data: customers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: {
        totalCustomers: stats._count,
        totalBalanceUSD: stats._sum.balanceUSD || 0,
        totalBalanceUZS: stats._sum.balanceUZS || 0,
      },
    });
  } catch (error) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/customers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.fullName) {
      return NextResponse.json({ error: 'Mijoz ismi majburiy' }, { status: 400 });
    }
    const customer = await prisma.customer.create({
      data: {
        fullName: body.fullName,
        companyName: body.companyName || null,
        phone: body.phone || null,
        region: body.region || null,
        status: body.status || 'ACTIVE',
        groupId: body.groupId || null,
        balanceUSD: body.balanceUSD ? parseFloat(body.balanceUSD) : 0,
        balanceUZS: body.balanceUZS ? parseFloat(body.balanceUZS) : 0,
      },
      include: { group: true },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
