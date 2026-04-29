import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

// GET /api/suppliers (company filtered)
export async function GET(req: NextRequest) {
  try {
    const { error, user } = await checkPermission('view_suppliers');
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      where.companyId = user.companyId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (category) where.category = category;

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.supplier.count({ where }),
    ]);

    return NextResponse.json({
      data: suppliers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/suppliers (company isolated)
export async function POST(req: NextRequest) {
  try {
    const { error, user } = await checkPermission('create_suppliers');
    if (error) return error;

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Ta\'minotchi nomi majburiy' }, { status: 400 });
    }
    const supplier = await prisma.supplier.create({
      data: {
        name: body.name,
        contactPerson: body.contactPerson || null,
        phone: body.phone || null,
        category: body.category || null,
        status: body.status || 'ACTIVE',
        companyId: user.companyId || null,
      },
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
