import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

// GET /api/cashbox — list all cashboxes (company + branch filtered)
export async function GET(request: Request) {
  try {
    const { error, user } = await checkPermission('view_warehouse');
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    const where: Record<string, unknown> = {};
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      where.companyId = user.companyId;
    }
    // Branch filter: from selector or user's own branch
    if (branchId) {
      where.branchId = branchId;
    } else if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.branchId) {
      where.branchId = user.branchId;
    }

    const cashboxes = await prisma.cashbox.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        branch: { select: { id: true, name: true } },
        _count: { select: { transactions: true } },
      },
    });
    return NextResponse.json(cashboxes);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cashbox — create new cashbox
export async function POST(request: Request) {
  try {
    const { error, user } = await checkPermission('edit_warehouse');
    if (error) return error;

    const { name, type, currency, branchId } = await request.json();
    if (!name) return NextResponse.json({ error: 'Nomi majburiy' }, { status: 400 });

    const cashbox = await prisma.cashbox.create({
      data: {
        name,
        type: type || 'CASH',
        currency: currency || 'UZS',
        companyId: user.companyId || null,
        branchId: branchId || user.branchId || null,
      },
    });
    return NextResponse.json(cashbox, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
