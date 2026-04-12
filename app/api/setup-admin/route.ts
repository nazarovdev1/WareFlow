import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const adminEmail = 'admin@ibox.uz';
    const adminPassword = 'admin';

    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) return NextResponse.json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    return NextResponse.json({ message: 'Admin created successfully', user: { email: user.email } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
