import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const payments = await prisma.contractPayment.findMany({
      where: { contractId: params.id },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({ data: payments });
  } catch (error) {
    console.error('GET /api/contracts/[id]/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    if (!body.amount || !body.dueDate) {
      return NextResponse.json({ error: 'amount and dueDate are required' }, { status: 400 });
    }

    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const payment = await prisma.contractPayment.create({
      data: {
        contractId: params.id,
        amount: body.amount,
        currency: body.currency || 'USD',
        dueDate: new Date(body.dueDate),
        notes: body.notes || null,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('POST /api/contracts/[id]/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
    }

    const payment = await prisma.contractPayment.findFirst({
      where: { id: paymentId, contractId: params.id },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const updated = await prisma.contractPayment.update({
      where: { id: paymentId },
      data: {
        isPaid: true,
        paidDate: body.paidDate ? new Date(body.paidDate) : new Date(),
        notes: body.notes || payment.notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/contracts/[id]/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
