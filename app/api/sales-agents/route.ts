import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkPermission('view_sales_agents');
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const [agents, total] = await Promise.all([
      prisma.salesAgent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { orders: true, commissions: true } },
        },
      }),
      prisma.salesAgent.count({ where }),
    ]);

    const agentIds = agents.map((a) => a.id);

    const commissionStats = await prisma.commission.groupBy({
      by: ['agentId'],
      where: { agentId: { in: agentIds } },
      _sum: { amount: true },
    });

    const paidStats = await prisma.commission.groupBy({
      by: ['agentId'],
      where: { agentId: { in: agentIds }, isPaid: true },
      _sum: { amount: true },
    });

    const totalEarnedMap = new Map(commissionStats.map((s) => [s.agentId, s._sum.amount || 0]));
    const paidMap = new Map(paidStats.map((s) => [s.agentId, s._sum.amount || 0]));

    const data = agents.map((agent) => {
      const totalEarned = totalEarnedMap.get(agent.id) || 0;
      const totalPaid = paidMap.get(agent.id) || 0;
      return {
        ...agent,
        stats: {
          totalEarned,
          totalPaid,
          pending: totalEarned - totalPaid,
          orderCount: agent._count.orders,
          commissionCount: agent._count.commissions,
        },
      };
    });

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await checkPermission('create_sales_agents');
    if (error) return error;

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 });
    }

    const data: any = {
      name: body.name,
      phone: body.phone || null,
      commissionRate: body.commissionRate ?? 0,
      isActive: body.isActive ?? true,
    };

    if (body.userId) {
      data.userId = body.userId;
    }

    const agent = await prisma.salesAgent.create({ data });
    return NextResponse.json(agent, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'User is already linked to another agent' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
