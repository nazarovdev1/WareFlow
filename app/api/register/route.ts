import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z.string().min(1, "Ism majburiy"),
  phone: z.string().min(9, "Telefon raqam noto'g'ri"),
  email: z.string().email("Email noto'g'ri").optional().or(z.literal('')),
  password: z.string().min(6, "Parol kamida 6 belgi"),
  warehouseId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { name, phone, email, password, warehouseId } = result.data;

    const existingUser = await prisma.user.findFirst({ 
      where: { 
        OR: [
          { phone },
          email ? { email } : undefined
        ].filter(Boolean) as any
      }
    });
    if (existingUser) {
      return NextResponse.json({ error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' }, { status: 409 });
    }

    const existingRequest = await prisma.userRequest.findUnique({ where: { phone } });
    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return NextResponse.json({ error: 'Sizning so\'rovingiz allaqachon kutilmoqda. Iltimos kuting.' }, { status: 409 });
      }
      if (existingRequest.status === 'REJECTED') {
        return NextResponse.json({ error: 'Sizning so\'rovingiz rad etilgan. Admin bilan bog\'laning.' }, { status: 403 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const request = await prisma.userRequest.create({
      data: {
        name,
        phone,
        email: email || null,
        password: hashedPassword,
        warehouseId: warehouseId || null,
        status: 'PENDING',
      },
    });

    // Admin uchun real notification yaratish (xato bo'lsa registratsiyani buzmaydi)
    try {
      await prisma.adminNotification.create({
        data: {
          type: 'new_user_request',
          title: 'Yangi foydalanuvchi so\'rovi',
          message: `${name} (${phone}) tizimga kirish uchun so'rov yubordi`,
          link: '/users?tab=requests',
        },
      });
    } catch (notifError) {
      console.error('AdminNotification yaratishda xato (kritik emas):', notifError);
    }

    return NextResponse.json({
      message: 'So\'rov yuborildi. Admin tasdig\'idan so\'ng login qilishingiz mumkin.',
      requestId: request.id,
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/register error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu telefon raqam allaqachon mavjud' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
