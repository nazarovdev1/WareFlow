import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

// GET /api/customers/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('view_customers');
    if (error) return error;

    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        group: true,
        transactions: { orderBy: { date: 'desc' }, take: 50 },
      },
    });
    if (!customer) {
      return NextResponse.json({ error: 'Mijoz topilmadi' }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/customers/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('edit_customers');
    if (error) return error;

    const { id } = await params;
    const body = await req.json();
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        fullName: body.fullName,
        companyName: body.companyName,
        phone: body.phone,
        region: body.region,
        status: body.status,
        groupId: body.groupId || null,
      },
      include: { group: true },
    });
    return NextResponse.json(customer);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Mijoz topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/customers/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('delete_customers');
    if (error) return error;

    const { id } = await params;
    // Delete related transactions first to avoid FK constraint errors
    await prisma.customerTransaction.deleteMany({ where: { customerId: id } });
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Mijoz topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
