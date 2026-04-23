import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkPermission('view_commissions');
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');
    const isPaid = searchParams.get('isPaid');
    const period = searchParams.get('period');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (agentId) where.agentId = agentId;
    if (isPaid !== null && isPaid !== undefined && isPaid !== '') {
      where.isPaid = isPaid === 'true';
    }
    if (period) where.period = period;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agent: { select: { id: true, name: true, phone: true, commissionRate: true } },
          order: { select: { id: true, docNumber: true, finalAmount: true, status: true } },
        },
      }),
      prisma.commission.count({ where }),
    ]);

    return NextResponse.json({
      data: commissions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await checkPermission('create_commissions');
    if (error) return error;

    const body = await req.json();

    if (body.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: body.orderId },
        include: { agent: true },
      });
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      if (!order.agentId || !order.agent) {
        return NextResponse.json({ error: 'Order has no assigned sales agent' }, { status: 400 });
      }

      const existing = await prisma.commission.findUnique({ where: { orderId: body.orderId } });
      if (existing) {
        return NextResponse.json({ error: 'Commission already exists for this order' }, { status: 409 });
      }

      const saleAmount = order.finalAmount || 0;
      const rate = order.agent.commissionRate;
      const amount = saleAmount * (rate / 100);

      const commission = await prisma.commission.create({
        data: {
          agentId: order.agentId,
          orderId: body.orderId,
          amount,
          rate,
          saleAmount,
          isPaid: false,
          period: body.period || null,
          notes: body.notes || null,
        },
        include: {
          agent: { select: { id: true, name: true, phone: true, commissionRate: true } },
          order: { select: { id: true, docNumber: true, finalAmount: true, status: true } },
        },
      });
      return NextResponse.json(commission, { status: 201 });
    }

    if (!body.agentId) {
      return NextResponse.json({ error: 'agentId or orderId is required' }, { status: 400 });
    }

    const agent = await prisma.salesAgent.findUnique({ where: { id: body.agentId } });
    if (!agent) {
      return NextResponse.json({ error: 'Sales agent not found' }, { status: 404 });
    }

    const saleAmount = body.saleAmount || 0;
    const rate = body.rate ?? agent.commissionRate;
    const amount = body.amount ?? saleAmount * (rate / 100);

    const commission = await prisma.commission.create({
      data: {
        agentId: body.agentId,
        amount,
        rate,
        saleAmount,
        isPaid: body.isPaid || false,
        paidDate: body.isPaid ? new Date() : null,
        period: body.period || null,
        notes: body.notes || null,
      },
        include: {
          agent: { select: { id: true, name: true, phone: true, commissionRate: true } },
          order: { select: { id: true, docNumber: true, finalAmount: true, status: true } },
        },
    });
    return NextResponse.json(commission, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Commission already exists for this order' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
