import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const CustomerSchema = z.object({
  fullName: z.string().min(1, "Mijoz ismi majburiy"),
  companyName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  groupId: z.string().optional().nullable(),
  balanceUSD: z.coerce.number().default(0),
  balanceUZS: z.coerce.number().default(0),
  creditLimit: z.coerce.number().default(0),
});


// GET /api/customers — List customers with filters
export async function GET(req: NextRequest) {
  try {
    const { error } = await checkPermission('view_customers');
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const region = searchParams.get('region');
    const groupId = searchParams.get('groupId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const isDebtor = searchParams.get('isDebtor') === 'true';

    const where: any = {};
    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ]
      });
    }
    if (region) andConditions.push({ region });
    if (groupId) andConditions.push({ groupId });
    if (status) andConditions.push({ status });

    if (isDebtor) {
      andConditions.push({
        OR: [
          { balanceUSD: { lt: 0 } },
          { balanceUZS: { lt: 0 } }
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

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
      where,
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
    const { error } = await checkPermission('create_customers');
    if (error) return error;

    const body = await req.json();
    
    // Validate with Zod
    const result = CustomerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Validatsiya xatosi', 
        details: result.error.issues.map(e => e.message) 
      }, { status: 400 });
    }

    const {
      fullName,
      companyName,
      phone,
      region,
      status,
      groupId,
      balanceUSD,
      balanceUZS,
    } = result.data;

    const customer = await prisma.customer.create({
      data: {
        fullName,
        companyName: companyName || null,
        phone: phone || null,
        region: region || null,
        status,
        groupId: groupId || null,
        balanceUSD,
        balanceUZS,
      },
      include: { group: true },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('POST /api/customers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
