import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const UpdateBranchSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['HEADQUARTERS', 'BRANCH', 'STORE', 'WAREHOUSE']).optional(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET /api/branches/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('view_warehouse');
    if (error) return error;

    const { id } = await params;
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, address: true, phone: true, email: true, inn: true } },
        manager: { select: { id: true, name: true, phone: true, email: true } },
        warehouses: { select: { id: true, name: true, address: true } },
        users: { select: { id: true, name: true, phone: true, role: true } },
        _count: {
          select: { warehouses: true, users: true },
        },
      },
    });

    if (!branch) {
      return NextResponse.json({ error: 'Filial topilmadi' }, { status: 404 });
    }

    return NextResponse.json(branch);
  } catch (error) {
    console.error('GET /api/branches/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/branches/[id]
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('edit_warehouse');
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const result = UpdateBranchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: result.data,
      include: {
        company: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(branch);
  } catch (error) {
    console.error('PATCH /api/branches/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/branches/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('delete_warehouse');
    if (error) return error;

    const { id } = await params;

    // Check if branch has warehouses
    const warehouseCount = await prisma.warehouse.count({
      where: { branchId: id },
    });

    if (warehouseCount > 0) {
      return NextResponse.json({
        error: `Filialda ${warehouseCount} ta ombor mavjud. Avval omborlarni o'chiring yoki boshqa filialga ko'chiring.`,
      }, { status: 400 });
    }

    await prisma.branch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/branches/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
