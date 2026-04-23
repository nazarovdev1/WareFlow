import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('view_commissions');
    if (error) return error;

    const { id } = await params;
    const commission = await prisma.commission.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, name: true, phone: true, commissionRate: true } },
        order: { select: { id: true, docNumber: true, finalAmount: true, status: true } },
      },
    });
    if (!commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }
    return NextResponse.json(commission);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('edit_commissions');
    if (error) return error;

    const { id } = await params;
    const body = await req.json();

    const data: any = {};
    if (body.isPaid !== undefined) {
      data.isPaid = body.isPaid;
      if (body.isPaid && !body.paidDate) {
        data.paidDate = new Date();
      }
    }
    if (body.paidDate !== undefined) data.paidDate = body.paidDate ? new Date(body.paidDate) : null;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.amount !== undefined) data.amount = body.amount;
    if (body.rate !== undefined) data.rate = body.rate;
    if (body.saleAmount !== undefined) data.saleAmount = body.saleAmount;
    if (body.period !== undefined) data.period = body.period;

    const commission = await prisma.commission.update({
      where: { id },
      data,
      include: {
        agent: { select: { id: true, name: true, phone: true, commissionRate: true } },
        order: { select: { id: true, docNumber: true, finalAmount: true, status: true } },
      },
    });
    return NextResponse.json(commission);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('delete_commissions');
    if (error) return error;

    const { id } = await params;
    await prisma.commission.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
