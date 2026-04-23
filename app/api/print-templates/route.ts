import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const templates = await prisma.printTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error('GET /api/print-templates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.type || !body.content) {
      return NextResponse.json({ error: 'name, type, and content are required' }, { status: 400 });
    }

    if (body.isDefault) {
      await prisma.printTemplate.updateMany({
        where: { type: body.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.printTemplate.create({
      data: {
        name: body.name,
        type: body.type,
        content: body.content,
        isActive: body.isActive ?? true,
        isDefault: body.isDefault ?? false,
        paperSize: body.paperSize || 'A4',
        orientation: body.orientation || 'portrait',
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('POST /api/print-templates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
