import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { buildCompanyWhere, buildBranchWhere } from './getCompanyFilter';

interface CheckPermissionResult {
  error: ReturnType<typeof NextResponse.json> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
}

export async function checkPermission(permission: string): Promise<CheckPermissionResult> {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;

  if (!user) {
    return { error: NextResponse.json({ error: 'Tizimga kiring' }, { status: 401 }), user: null };
  }

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isAdmin = user.role === 'ADMIN';
  const hasPermission = isSuperAdmin || isAdmin || user.permissions?.includes(permission);

  if (!hasPermission) {
    return { error: NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 }), user: null };
  }

  return {
    error: null,
    user: {
      ...user,
      id: user.id,
      role: user.role,
      companyId: user.companyId || null,
      branchId: user.branchId || null,
      warehouseId: user.warehouseId || null,
      permissions: user.permissions || [],
    },
  };
}

/**
 * Check permission and return company-filtered where clause.
 * Combines permission check with company isolation in one call.
 */
export async function checkPermissionWithFilter(
  permission: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraFilters?: Record<string, any>,
): Promise<{
  error: ReturnType<typeof NextResponse.json> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where: Record<string, any>;
}> {
  const { error, user } = await checkPermission(permission);
  if (error) return { error, user: null, where: {} };

  const where = buildCompanyWhere(user, extraFilters);
  return { error: null, user, where };
}

/**
 * Check permission and return branch-filtered where clause.
 */
export async function checkPermissionWithBranchFilter(
  permission: string,
  branchIdParam?: string | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraFilters?: Record<string, any>,
): Promise<{
  error: ReturnType<typeof NextResponse.json> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where: Record<string, any>;
}> {
  const { error, user } = await checkPermission(permission);
  if (error) return { error, user: null, where: {} };

  const where = buildBranchWhere(user, branchIdParam, extraFilters);
  return { error: null, user, where };
}

export { buildCompanyWhere, buildBranchWhere };
