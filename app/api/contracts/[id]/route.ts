import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        customer: { select: { id: true, fullName: true, phone: true, companyName: true } },
        supplier: { select: { id: true, name: true, phone: true } },
        attachments: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { dueDate: 'asc' } },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('GET /api/contracts/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const existing = await prisma.contract.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (body.status) {
      const validTransitions: Record<string, string[]> = {
        DRAFT: ['ACTIVE'],
        ACTIVE: ['EXPIRED', 'TERMINATED'],
      };
      const allowed = validTransitions[existing.status];
      if (allowed && !allowed.includes(body.status)) {
        return NextResponse.json({
          error: `Cannot transition from ${existing.status} to ${body.status}`,
        }, { status: 400 });
      }
    }

    const contract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.startDate !== undefined && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.value !== undefined && { value: body.value }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.terms !== undefined && { terms: body.terms }),
        ...(body.customerId !== undefined && { customerId: body.customerId || null }),
        ...(body.supplierId !== undefined && { supplierId: body.supplierId || null }),
      },
      include: {
        customer: { select: { id: true, fullName: true } },
        supplier: { select: { id: true, name: true } },
        attachments: true,
        payments: true,
      },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error('PATCH /api/contracts/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.contract.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    await prisma.contract.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/contracts/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
