import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const CreateProgramSchema = z.object({
  name: z.string().min(1, "Dastur nomi majburiy"),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  pointsPerDollar: z.coerce.number().min(0, "Points per dollar 0 dan katta bo'lishi kerak").default(1),
  bronzeThreshold: z.number().int().min(0).default(0),
  bronzeDiscount: z.coerce.number().min(0).default(0),
  silverThreshold: z.number().int().min(0).default(500),
  silverDiscount: z.coerce.number().min(0).default(5),
  goldThreshold: z.number().int().min(0).default(2000),
  goldDiscount: z.coerce.number().min(0).default(10),
  platinumThreshold: z.number().int().min(0).default(5000),
  platinumDiscount: z.coerce.number().min(0).default(15),
});

const UpdateProgramSchema = z.object({
  id: z.string().min(1, "ID majburiy"),
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  pointsPerDollar: z.coerce.number().min(0).optional(),
  bronzeThreshold: z.number().int().min(0).optional(),
  bronzeDiscount: z.coerce.number().min(0).optional(),
  silverThreshold: z.number().int().min(0).optional(),
  silverDiscount: z.coerce.number().min(0).optional(),
  goldThreshold: z.number().int().min(0).optional(),
  goldDiscount: z.coerce.number().min(0).optional(),
  platinumThreshold: z.number().int().min(0).optional(),
  platinumDiscount: z.coerce.number().min(0).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkPermission('view_customers');
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (isActive !== null) where.isActive = isActive === 'true';

    const programs = await prisma.loyaltyProgram.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: programs });
  } catch (error) {
    console.error('GET /api/loyalty/programs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await checkPermission('create_customers');
    if (error) return error;

    const body = await req.json();
    const result = CreateProgramSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const program = await prisma.loyaltyProgram.create({
      data: result.data,
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('POST /api/loyalty/programs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { error } = await checkPermission('edit_customers');
    if (error) return error;

    const body = await req.json();
    const result = UpdateProgramSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { id, ...data } = result.data;

    const existing = await prisma.loyaltyProgram.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Dastur topilmadi' }, { status: 404 });
    }

    const program = await prisma.loyaltyProgram.update({
      where: { id },
      data,
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error('PATCH /api/loyalty/programs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
