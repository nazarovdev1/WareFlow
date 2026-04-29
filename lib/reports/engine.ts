// Report Builder Engine - Dynamic Prisma query generator
import prisma from '@/lib/db';
import type { ReportConfig, ReportResult, ReportFilter } from './types';
export type { ReportConfig, ReportResult } from './types';

const modelMap: Record<string, string> = {
  orders: 'order',
  products: 'product',
  customers: 'customer',
  suppliers: 'supplier',
  purchases: 'purchase',
  stock: 'stockEntry',
  transfers: 'transfer',
};

/**
 * Build Prisma where clause from filters
 */
function buildWhereClause(filters?: ReportFilter[]): Record<string, unknown> {
  if (!filters || filters.length === 0) return {};

  const where: Record<string, unknown> = {};

  for (const filter of filters) {
    const { field, operator, value } = filter;

    switch (operator) {
      case 'eq':
        where[field] = { equals: value };
        break;
      case 'neq':
        where[field] = { not: value };
        break;
      case 'gt':
        where[field] = { gt: value };
        break;
      case 'gte':
        where[field] = { gte: value };
        break;
      case 'lt':
        where[field] = { lt: value };
        break;
      case 'lte':
        where[field] = { lte: value };
        break;
      case 'contains':
        where[field] = { contains: value, mode: 'insensitive' };
        break;
      case 'startsWith':
        where[field] = { startsWith: value, mode: 'insensitive' };
        break;
      case 'endsWith':
        where[field] = { endsWith: value, mode: 'insensitive' };
        break;
      case 'in':
        where[field] = { in: Array.isArray(value) ? value : [value] };
        break;
    }
  }

  return where;
}

/**
 * Add date range to where clause
 */
function addDateRange(
  where: Record<string, unknown>,
  dateRange?: { field: string; from: string; to: string }
): void {
  if (!dateRange) return;

  const { field, from, to } = dateRange;
  where[field] = {
    ...(where[field] as Record<string, unknown> || {}),
    gte: new Date(from),
    lte: new Date(to),
  };
}

/**
 * Generate report based on config
 */
export async function generateReport(config: ReportConfig): Promise<ReportResult> {
  const { dataSource, filters, groupBy, aggregations, columns, sortBy, dateRange, limit } = config;
  const modelName = modelMap[dataSource];

  if (!modelName) {
    throw new Error(`Unknown data source: ${dataSource}`);
  }

  // Build where clause
  const where = buildWhereClause(filters);
  addDateRange(where, dateRange);

  // Build select
  const select: Record<string, unknown> = {};
  if (columns) {
    for (const col of columns) {
      select[col.field] = true;
    }
  }

  // Build orderBy
  const orderBy: Record<string, string>[] = [];
  if (sortBy) {
    for (const sort of sortBy) {
      orderBy.push({ [sort.field]: sort.direction });
    }
  }

  // Fetch data using dynamic Prisma query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prismaModel = (prisma as any)[modelName];
  if (!prismaModel) {
    throw new Error(`Prisma model not found: ${modelName}`);
  }

  const [data, totalCount] = await Promise.all([
    prismaModel.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      select: Object.keys(select).length > 0 ? select : undefined,
      orderBy: orderBy.length > 0 ? orderBy : undefined,
      take: limit || 1000,
    }),
    prismaModel.count({
      where: Object.keys(where).length > 0 ? where : undefined,
    }),
  ]);

  // Calculate summary/aggregations
  const summary: Record<string, number> = {};
  if (aggregations && data.length > 0) {
    for (const agg of aggregations) {
      const { field, type, alias } = agg;
      const key = alias || `${field}_${type}`;
      const values = data.map((row: Record<string, unknown>) => Number(row[field]) || 0);

      switch (type) {
        case 'sum':
          summary[key] = values.reduce((a: number, b: number) => a + b, 0);
          break;
        case 'avg':
          summary[key] = values.reduce((a: number, b: number) => a + b, 0) / values.length;
          break;
        case 'count':
          summary[key] = values.length;
          break;
        case 'min':
          summary[key] = Math.min(...values);
          break;
        case 'max':
          summary[key] = Math.max(...values);
          break;
      }
    }
  }

  // Generate chart data if groupBy is specified
  let chartData: Record<string, unknown>[] | undefined;
  if (groupBy && groupBy.length > 0) {
    const grouped: Record<string, { count: number; sum: number }> = {};

    for (const row of data as Record<string, unknown>[]) {
      const key = groupBy.map((f) => String(row[f] || 'Unknown')).join(' | ');
      if (!grouped[key]) {
        grouped[key] = { count: 0, sum: 0 };
      }
      grouped[key].count += 1;
      if (aggregations?.[0]) {
        grouped[key].sum += Number(row[aggregations[0].field]) || 0;
      }
    }

    chartData = Object.entries(grouped).map(([name, values]) => ({
      name,
      ...values,
    }));
  }

  return {
    data: data as Record<string, unknown>[],
    summary,
    totalCount,
    chartData,
  };
}

