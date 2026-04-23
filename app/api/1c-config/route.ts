import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const config = await prisma.oneCConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({
      config: {
        ...config,
        apiKey: config.apiKey ? '••••••••' : null,
      },
    });
  } catch (error) {
    console.error('GET /api/1c-config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.apiUrl || !body.apiKey) {
      return NextResponse.json({ error: 'apiUrl and apiKey are required' }, { status: 400 });
    }

    const existing = await prisma.oneCConfig.findFirst();

    let config;
    if (existing) {
      config = await prisma.oneCConfig.update({
        where: { id: existing.id },
        data: {
          apiUrl: body.apiUrl,
          apiKey: body.apiKey,
          isActive: body.isActive ?? true,
          syncInterval: body.syncInterval ?? null,
        },
      });
    } else {
      config = await prisma.oneCConfig.create({
        data: {
          apiUrl: body.apiUrl,
          apiKey: body.apiKey,
          isActive: body.isActive ?? true,
          syncInterval: body.syncInterval ?? null,
        },
      });
    }

    return NextResponse.json({
      config: {
        ...config,
        apiKey: '••••••••',
      },
    }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('POST /api/1c-config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const existing = await prisma.oneCConfig.findFirst();

    if (!existing) {
      return NextResponse.json({ error: 'Config not found. Use POST to create.' }, { status: 404 });
    }

    const config = await prisma.oneCConfig.update({
      where: { id: existing.id },
      data: {
        ...(body.apiUrl !== undefined && { apiUrl: body.apiUrl }),
        ...(body.apiKey !== undefined && { apiKey: body.apiKey }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.syncInterval !== undefined && { syncInterval: body.syncInterval }),
      },
    });

    return NextResponse.json({
      config: {
        ...config,
        apiKey: '••••••••',
      },
    });
  } catch (error) {
    console.error('PUT /api/1c-config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
