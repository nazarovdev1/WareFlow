import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

// Helper: convert empty strings to null for optional nullable fields
const emptyToNull = z.string().optional().nullable().transform(v => v === '' ? null : v);

const BranchSchema = z.object({
  name: z.string().min(1, 'Filial nomi majburiy'),
  type: z.enum(['HEADQUARTERS', 'BRANCH', 'STORE', 'WAREHOUSE']).default('BRANCH'),
  address: emptyToNull,
  phone: emptyToNull,
  companyId: z.string().min(1, 'Kompaniya tanlash majburiy'),
  managerId: emptyToNull,
  isActive: z.boolean().default(true),
});

// GET /api/branches — List branches
export async function GET(request: Request) {
  try {
    const { error, user } = await checkPermission('view_warehouse');
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const where: any = {};
    if (companyId) where.companyId = companyId;

    // Non-super-admin users see only their company branches
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      where.companyId = user.companyId;
    }

    const branches = await prisma.branch.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true, phone: true } },
        _count: {
          select: {
            warehouses: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: branches });
  } catch (error) {
    console.error('GET /api/branches error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/branches — Create branch
export async function POST(request: Request) {
  try {
    const { error, user } = await checkPermission('edit_warehouse');
    if (error) return error;

    const body = await request.json();
    const result = BranchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { name, type, address, phone, companyId, managerId, isActive } = result.data;

    const branch = await prisma.branch.create({
      data: {
        name,
        type,
        address: address || null,
        phone: phone || null,
        companyId,
        managerId: managerId || null,
        isActive,
      },
      include: {
        company: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    console.error('POST /api/branches error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Filialni saqlashda xatolik', details: errorMessage }, { status: 500 });
  }
}
