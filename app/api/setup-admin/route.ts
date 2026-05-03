import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    // Check if any admin already exists - if so, disable this endpoint
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN', isActive: true },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists. This endpoint is disabled for security.' },
        { status: 403 }
      );
    }

    const { phone, password = 'admin123' } = await req.json();
    if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { phone },
      update: { role: 'ADMIN', isActive: true, password: hash, name: 'Admin' },
      create: { phone, name: 'Admin', password: hash, role: 'ADMIN', isActive: true },
    });
    return NextResponse.json({ message: 'Admin ready', phone: user.phone, role: user.role });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if any admin already exists - if so, disable this endpoint
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN', isActive: true },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists. This endpoint is disabled for security.' },
        { status: 403 }
      );
    }

    // Only allow creating default admin if no admin exists
    const adminPhone = '+998990901818';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const existing = await prisma.user.findUnique({ where: { phone: adminPhone } });
    if (existing) return NextResponse.json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const user = await prisma.user.create({
      data: {
        phone: adminPhone,
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    return NextResponse.json({ message: 'Admin created successfully', user: { phone: user.phone } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
