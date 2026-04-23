import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getToken } from 'next-auth/jwt';

async function checkSuperAdmin(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return null;
  const role = (token as any).role;
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') return null;
  return token;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkSuperAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const tenant = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        warehouses: {
          select: {
            id: true,
            name: true,
            address: true,
            isDefault: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('GET /api/tenants/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkSuperAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, address, phone, email, inn, logo, isActive } = body;

    const existing = await prisma.company.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const tenant = await prisma.company.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(inn !== undefined && { inn }),
        ...(logo !== undefined && { logo }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('PATCH /api/tenants/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkSuperAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const existing = await prisma.company.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Delete all related data
    await prisma.$transaction(async (tx) => {
      // Delete users, warehouses, etc.
      await tx.user.deleteMany({
        where: { companyId: params.id },
      });

      await tx.warehouse.deleteMany({
        where: { companyId: params.id },
      });

      // Finally delete the tenant
      await tx.company.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tenants/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
