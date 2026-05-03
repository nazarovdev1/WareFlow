import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Require authentication for API routes.
 * Returns the session if authenticated, or a 401 NextResponse if not.
 */
export async function requireAuth(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Autentifikatsiya talab qilinadi' },
      { status: 401 }
    );
  }
  return session;
}

/**
 * Require a specific permission for API routes.
 * Returns the session if authorized, or a 403 NextResponse if not.
 */
export async function requirePermission(request: Request, permission: string) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult; // 401

  const session = authResult;
  const userRole = (session.user as any)?.role;
  const userPermissions: string[] = (session.user as any)?.permissions || [];

  // Admin has all permissions
  if (userRole === 'ADMIN') return session;

  // Check if user has the required permission
  if (!userPermissions.includes(permission)) {
    return NextResponse.json(
      { error: 'Ruxsat berilmagan' },
      { status: 403 }
    );
  }

  return session;
}

/**
 * Check if the request is from an admin user.
 * Returns the session if admin, or a 403 NextResponse if not.
 */
export async function requireAdmin(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult; // 401

  const session = authResult;
  const userRole = (session.user as any)?.role;

  if (userRole !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Faqat administrator uchun' },
      { status: 403 }
    );
  }

  return session;
}

/**
 * Type guard to check if the result is an error response
 */
export function isAuthError(result: any): result is NextResponse {
  return result instanceof NextResponse;
}
