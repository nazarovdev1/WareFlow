import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    
    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin huquqi talab qilinadi' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [requests, total] = await Promise.all([
      prisma.userRequest.findMany({
        where,
        include: { warehouse: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userRequest.count({ where }),
    ]);

    return NextResponse.json({
      data: requests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/register/requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    
    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin huquqi talab qilinadi' }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, action, role, warehouseId, note, permissions } = body;

    if (!requestId || !action) {
      return NextResponse.json({ error: 'requestId va action majburiy' }, { status: 400 });
    }

    const request = await prisma.userRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      return NextResponse.json({ error: 'So\'rov topilmadi' }, { status: 404 });
    }

    if (action === 'approve') {
      const existingUser = await prisma.user.findFirst({ 
        where: { 
          OR: [
            { phone: request.phone },
            request.email ? { email: request.email } : undefined
          ].filter(Boolean) as any
        }
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Bu user allaqachon mavjud' }, { status: 409 });
      }

      const newUser = await prisma.user.create({
        data: {
          name: request.name,
          phone: request.phone,
          email: request.email,
          password: request.password,
          role: role || 'STAFF',
          warehouseId: warehouseId || request.warehouseId,
          isActive: true,
          permissions: permissions || [],
        },
      });

      await prisma.userRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', note },
      });

      return NextResponse.json({ message: 'User yaratildi va faollashdi', user: newUser });
    } 
    else if (action === 'reject') {
      await prisma.userRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED', note },
      });

      return NextResponse.json({ message: 'So\'rov rad etildi' });
    }

    return NextResponse.json({ error: 'Noto\'g\'ri action' }, { status: 400 });
  } catch (error) {
    console.error('PUT /api/register/requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
