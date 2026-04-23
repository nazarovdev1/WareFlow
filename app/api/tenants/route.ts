import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getToken } from 'next-auth/jwt';

async function checkSuperAdmin(req: Request) {
  const token = await getToken({ req });
  if (!token) return null;
  const role = (token as any).role;
  // Only SUPER_ADMIN or ADMIN can manage tenants
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') return null;
  return token;
}

export async function GET(req: Request) {
  try {
    const admin = await checkSuperAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const tenants = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            warehouses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error('GET /api/tenants error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await checkSuperAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, address, phone, email, inn, logo } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const tenant = await prisma.company.create({
      data: {
        name,
        address,
        phone,
        email,
        inn,
        logo,
        isActive: true,
      },
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    console.error('POST /api/tenants error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
