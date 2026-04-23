import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (status) where.status = status;

    const [logs, total] = await Promise.all([
      prisma.oneCSyncLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.oneCSyncLog.count({ where }),
    ]);

    return NextResponse.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/1c-sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entityTypes: string[] = body.entityTypes || ['orders', 'purchases', 'customers', 'products'];

    const config = await prisma.oneCConfig.findFirst({
      where: { isActive: true },
    });

    if (!config) {
      return NextResponse.json({ error: '1C integration is not configured or inactive' }, { status: 400 });
    }

    const results: any[] = [];

    for (const entityType of entityTypes) {
      let payload: any = {};

      if (entityType === 'orders') {
        const orders = await prisma.order.findMany({
          take: 100,
          orderBy: { updatedAt: 'desc' },
          include: {
            customer: { select: { fullName: true, phone: true } },
            items: { include: { product: { select: { name: true, sku: true } } } },
          },
        });
        payload = orders;
      } else if (entityType === 'purchases') {
        const purchases = await prisma.purchase.findMany({
          take: 100,
          orderBy: { updatedAt: 'desc' },
          include: {
            supplier: { select: { name: true, phone: true } },
            items: { include: { product: { select: { name: true, sku: true } } } },
          },
        });
        payload = purchases;
      } else if (entityType === 'customers') {
        const customers = await prisma.customer.findMany({
          take: 100,
          orderBy: { updatedAt: 'desc' },
        });
        payload = customers;
      } else if (entityType === 'products') {
        const products = await prisma.product.findMany({
          take: 100,
          orderBy: { updatedAt: 'desc' },
          include: {
            category: { select: { name: true } },
            stockEntries: { select: { quantity: true, warehouseId: true } },
          },
        });
        payload = products;
      } else {
        continue;
      }

      const log = await prisma.oneCSyncLog.create({
        data: {
          entityType,
          action: 'SYNC',
          status: 'PENDING',
          payload: JSON.stringify(payload),
        },
      });

      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({ entityType, data: payload }),
        });

        const responseText = await response.text();

        await prisma.oneCSyncLog.update({
          where: { id: log.id },
          data: {
            status: response.ok ? 'COMPLETED' : 'FAILED',
            response: responseText,
            syncedAt: new Date(),
          },
        });

        results.push({
          entityType,
          status: response.ok ? 'COMPLETED' : 'FAILED',
          logId: log.id,
        });
      } catch (syncError: any) {
        await prisma.oneCSyncLog.update({
          where: { id: log.id },
          data: {
            status: 'FAILED',
            error: syncError.message || 'Sync failed',
            syncedAt: new Date(),
          },
        });

        results.push({
          entityType,
          status: 'FAILED',
          error: syncError.message,
          logId: log.id,
        });
      }
    }

    await prisma.oneCConfig.update({
      where: { id: config.id },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('POST /api/1c-sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
