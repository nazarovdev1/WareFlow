import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth, isAuthError } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isAuthError(authResult)) return authResult;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const entity = searchParams.get('entity');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    const where: any = {};
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;
    if (type) where.type = type;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return NextResponse.json({
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Activity logs fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (isAuthError(authResult)) return authResult;
    const body = await req.json();
    const { userId, userName, userRole, type, entity, entityId, action, details, ipAddress, userAgent } = body;

    const log = await prisma.activityLog.create({
      data: {
        userId,
        userName,
        userRole,
        type,
        entity,
        entityId,
        action,
        details,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json(log);
  } catch (err) {
    console.error('Activity log create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}