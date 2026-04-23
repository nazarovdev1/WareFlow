import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const CreateAccountSchema = z.object({
  customerId: z.string().min(1, "Mijoz tanlanishi shart"),
});

const UpdateAccountSchema = z.object({
  id: z.string().min(1, "ID majburiy"),
  points: z.number().int().optional(),
  tier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkPermission('view_customers');
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const tier = searchParams.get('tier');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const where: any = {};
    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        customer: {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (tier) andConditions.push({ tier });
    if (isActive !== null) andConditions.push({ isActive: isActive === 'true' });

    if (andConditions.length > 0) where.AND = andConditions;

    const [accounts, total] = await Promise.all([
      prisma.loyaltyAccount.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              companyName: true,
              phone: true,
            },
          },
          _count: { select: { transactions: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loyaltyAccount.count({ where }),
    ]);

    return NextResponse.json({
      data: accounts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/loyalty/accounts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await checkPermission('create_customers');
    if (error) return error;

    const body = await req.json();
    const result = CreateAccountSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { customerId } = result.data;

    const existing = await prisma.loyaltyAccount.findUnique({
      where: { customerId },
    });
    if (existing) {
      return NextResponse.json({
        error: 'Bu mijoz uchun sadfaqat hisob mavjud',
      }, { status: 409 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      return NextResponse.json({ error: 'Mijoz topilmadi' }, { status: 404 });
    }

    const account = await prisma.loyaltyAccount.create({
      data: {
        customerId,
        tier: 'BRONZE',
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('POST /api/loyalty/accounts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { error } = await checkPermission('edit_customers');
    if (error) return error;

    const body = await req.json();
    const result = UpdateAccountSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { id, points, tier, isActive, description } = result.data;

    const existing = await prisma.loyaltyAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Hisob topilmadi' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (points !== undefined && points !== existing.points) {
        const diff = points - existing.points;
        await tx.loyaltyTransaction.create({
          data: {
            accountId: id,
            type: 'adjust',
            points: diff,
            description: description || `Ball tahrirlandi: ${existing.points} -> ${points}`,
          },
        });
      }

      return tx.loyaltyAccount.update({
        where: { id },
        data: {
          ...(points !== undefined && { points }),
          ...(tier && { tier }),
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              companyName: true,
              phone: true,
            },
          },
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/loyalty/accounts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
