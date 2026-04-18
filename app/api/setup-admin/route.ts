import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { phone, password = 'admin123' } = await req.json();
    if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { phone },
      update: { role: 'ADMIN', isActive: true, password: hash, name: 'Admin' },
      create: { phone, name: 'Admin', password: hash, role: 'ADMIN', isActive: true },
    });
    return NextResponse.json({ message: 'Admin ready', phone: user.phone, role: user.role });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
