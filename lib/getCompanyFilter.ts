import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

interface CompanyFilterResult {
  companyId: string | null;
  branchId: string | null;
  warehouseId: string | null;
  role: string;
  userId: string;
  permissions: string[];
  error?: never;
}

interface CompanyFilterError {
  error: ReturnType<typeof NextResponse.json>;
  companyId?: never;
  branchId?: never;
  warehouseId?: never;
  role?: never;
  userId?: never;
  permissions?: never;
}

type CompanyFilterResponse = CompanyFilterResult | CompanyFilterError;

/**
 * Get the current user's company/branch/warehouse context from session.
 * Returns company filter info for API route handlers.
 */
export async function getCompanyFilter(): Promise<CompanyFilterResponse> {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Tizimga kiring' }, { status: 401 }),
    };
  }

  return {
    companyId: user.companyId || null,
    branchId: user.branchId || null,
    warehouseId: user.warehouseId || null,
    role: user.role,
    userId: user.id,
    permissions: user.permissions || [],
  };
}

/**
 * Build a Prisma where clause with company isolation.
 * SUPER_ADMIN sees all data. Other roles see only their company's data.
 * 
 * @param user - User object from checkPermission or getCompanyFilter
 * @param extraFilters - Additional Prisma where filters
 * @returns Prisma where clause with company filter applied
 */
export function buildCompanyWhere(
  user: { role: string; companyId?: string | null },
  extraFilters?: Record<string, any>
): Record<string, any> {
  const where: Record<string, any> = { ...extraFilters };

  // SUPER_ADMIN sees everything, others see only their company
  if (user.role !== 'SUPER_ADMIN' && user.companyId) {
    where.companyId = user.companyId;
  }

  return where;
}

/**
 * Build a Prisma where clause with branch isolation.
 * Filters by branch through the warehouse relation or direct branchId.
 * 
 * @param user - User object with role, companyId, branchId
 * @param branchIdParam - Optional branchId from query params (for admin switching)
 * @param extraFilters - Additional Prisma where filters
 * @returns Prisma where clause with company + branch filter
 */
export function buildBranchWhere(
  user: { role: string; companyId?: string | null; branchId?: string | null },
  branchIdParam?: string | null,
  extraFilters?: Record<string, any>
): Record<string, any> {
  const where = buildCompanyWhere(user, extraFilters);

  // If a specific branch is requested (from branch selector)
  if (branchIdParam) {
    where.branchId = branchIdParam;
  } else if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.branchId) {
    // Non-admin users are restricted to their own branch
    where.branchId = user.branchId;
  }

  return where;
}

/**
 * Build a Prisma where clause for warehouse-based filtering.
 * Used for entities that belong to a warehouse (StockEntry, ProductBatch, etc.)
 * 
 * @param user - User object
 * @param branchIdParam - Optional branchId from query params
 * @param warehouseIdParam - Optional warehouseId from query params
 * @returns Prisma where clause with warehouse filter
 */
export function buildWarehouseWhere(
  user: { role: string; companyId?: string | null; branchId?: string | null; warehouseId?: string | null },
  branchIdParam?: string | null,
  warehouseIdParam?: string | null,
): Record<string, any> {
  const warehouseWhere: Record<string, any> = {};

  // Company isolation
  if (user.role !== 'SUPER_ADMIN' && user.companyId) {
    warehouseWhere.companyId = user.companyId;
  }

  // Branch filtering
  if (branchIdParam) {
    warehouseWhere.branchId = branchIdParam;
  } else if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.branchId) {
    warehouseWhere.branchId = user.branchId;
  }

  // Specific warehouse
  if (warehouseIdParam) {
    warehouseWhere.id = warehouseIdParam;
  } else if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.warehouseId) {
    warehouseWhere.id = user.warehouseId;
  }

  return warehouseWhere;
}
