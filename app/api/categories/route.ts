import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

// GET /api/categories
export async function GET(_req: NextRequest) {
  try {
    const { error, user } = await checkPermission('view_products');
    if (error) return error;

    const where: Record<string, unknown> = {};
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      where.companyId = user.companyId;
    }

    const categories = await prisma.category.findMany({
      where,
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(req: NextRequest) {
  try {
    const { error, user } = await checkPermission('create_products');
    if (error) return error;

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Kategoriya nomi majburiy' }, { status: 400 });
    }
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        companyId: user.companyId || null,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Bu kategoriya allaqachon mavjud' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
