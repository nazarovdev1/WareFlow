import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ALL_PERMISSIONS } from '@/lib/permissions';

const CreateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 belgi bo'lishi kerak"),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).default('STAFF'),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  warehouseId: z.string().optional().nullable(),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).default([]),
});

const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email noto'g'ri"),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  warehouseId: z.string().optional().nullable(),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'tmagan' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const warehouseId = searchParams.get('warehouseId');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (warehouseId) where.warehouseId = warehouseId;
    if (isActive !== null) where.isActive = isActive === 'true';

    if ((session?.user as any)?.role !== 'ADMIN') {
      where.warehouseId = (session?.user as any)?.warehouseId;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          warehouse: true,
          _count: { select: { subscriptions: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin huquqi talab qilinadi' }, { status: 403 });
    }

    const body = await req.json();
    const result = CreateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { name, email, password, role, phone, isActive, warehouseId, permissions } = result.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        isActive,
        warehouseId: warehouseId || null,
        permissions: permissions || [],
      },
      include: {
        warehouse: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/users error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}