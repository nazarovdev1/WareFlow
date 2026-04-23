import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getToken } from 'next-auth/jwt';

async function checkSuperAdmin(req: Request) {
  const token = await getToken({ req });
  if (!token) return null;
  const role = (token as any).role;
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') return null;
  return token;
}

export async function GET(req: Request) {
  try {
    const admin = await checkSuperAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const [totalTenants, activeTenants, users, warehouses, subscriptions] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.warehouse.count(),
      prisma.subscription.findMany({
        where: { isPaid: true },
        include: { user: true },
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Calculate monthly revenue (simplified - in real app, use payment records)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyRevenue = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);

    return NextResponse.json({
      totalTenants,
      activeTenants,
      totalUsers: users,
      totalWarehouses: warehouses,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('GET /api/tenants/stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
