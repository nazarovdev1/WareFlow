import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function checkPermission(permission: string) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user) {
    return { error: NextResponse.json({ error: 'Tizimga kiring' }, { status: 401 }), user: null };
  }

  const isAdmin = user.role === 'ADMIN';
  const hasPermission = isAdmin || user.permissions?.includes(permission);

  if (!hasPermission) {
    return { error: NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 }), user: null };
  }

  return { error: null, user };
}
