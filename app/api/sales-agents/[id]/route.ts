import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('view_sales_agents');
    if (error) return error;

    const { id } = await params;
    const agent = await prisma.salesAgent.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        commissions: { orderBy: { createdAt: 'desc' }, take: 50 },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { id: true, docNumber: true, finalAmount: true, createdAt: true, status: true },
        },
      },
    });
    if (!agent) {
      return NextResponse.json({ error: 'Sales agent not found' }, { status: 404 });
    }

    const [totalEarnedResult, totalPaidResult, orderCount] = await Promise.all([
      prisma.commission.aggregate({ where: { agentId: id }, _sum: { amount: true, saleAmount: true } }),
      prisma.commission.aggregate({ where: { agentId: id, isPaid: true }, _sum: { amount: true } }),
      prisma.order.count({ where: { agentId: id } }),
    ]);

    const totalEarned = totalEarnedResult._sum.amount || 0;
    const totalPaid = totalPaidResult._sum.amount || 0;

    return NextResponse.json({
      ...agent,
      stats: {
        totalEarned,
        totalPaid,
        pending: totalEarned - totalPaid,
        totalSales: totalEarnedResult._sum.saleAmount || 0,
        orderCount,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('edit_sales_agents');
    if (error) return error;

    const { id } = await params;
    const body = await req.json();

    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.commissionRate !== undefined) data.commissionRate = body.commissionRate;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.userId !== undefined) data.userId = body.userId;

    const agent = await prisma.salesAgent.update({
      where: { id },
      data,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(agent);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Sales agent not found' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'User is already linked to another agent' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('delete_sales_agents');
    if (error) return error;

    const { id } = await params;
    const agent = await prisma.salesAgent.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json(agent);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Sales agent not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
