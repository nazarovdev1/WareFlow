import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WAREHOUSE_PERMISSIONS } from '@/lib/permissions';

const WarehouseSchema = z.object({
  name: z.string().min(1, "Ombor nomi majburiy"),
  address: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
});


// GET /api/warehouses
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user) {
      return NextResponse.json({ error: 'Tizimga kiring' }, { status: 401 });
    }

    const isAdmin = user.role === 'ADMIN';
    const hasPermission = isAdmin || user.permissions?.includes(WAREHOUSE_PERMISSIONS[0]);

    if (!hasPermission) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
    }

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
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user) {
      return NextResponse.json({ error: 'Tizimga kiring' }, { status: 401 });
    }

    const isAdmin = user.role === 'ADMIN';
    const hasPermission = isAdmin || user.permissions?.includes(WAREHOUSE_PERMISSIONS[1]);

    if (!hasPermission) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
    }

    const body = await req.json();

    const result = WarehouseSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Validatsiya xatosi', 
        details: result.error.issues.map(e => e.message) 
      }, { status: 400 });
    }

    const { name, address, district, isDefault } = result.data;

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        address,
        district,
        isDefault,
      },
    });
    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
