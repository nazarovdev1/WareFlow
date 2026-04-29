export interface ReportFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in';
  value: string | number | boolean | string[];
}

export interface ReportAggregation {
  field: string;
  type: 'sum' | 'avg' | 'count' | 'min' | 'max';
  alias?: string;
}

export interface ReportColumn {
  field: string;
  label: string;
  format?: 'number' | 'currency' | 'date' | 'datetime' | 'percent';
}

export interface ReportConfig {
  dataSource: 'orders' | 'products' | 'customers' | 'suppliers' | 'purchases' | 'stock' | 'transfers';
  filters?: ReportFilter[];
  groupBy?: string[];
  aggregations?: ReportAggregation[];
  columns?: ReportColumn[];
  sortBy?: { field: string; direction: 'asc' | 'desc' }[];
  dateRange?: { field: string; from: string; to: string };
  limit?: number;
}

export interface ReportResult {
  data: Record<string, unknown>[];
  summary: Record<string, number>;
  totalCount: number;
  chartData?: Record<string, unknown>[];
}

export const reportTemplates: Record<string, ReportConfig> = {
  sales_by_month: {
    dataSource: 'orders',
    columns: [
      { field: 'date', label: 'Sana', format: 'date' },
      { field: 'totalAmount', label: 'Summa', format: 'currency' },
      { field: 'status', label: 'Holat' },
    ],
    groupBy: ['status'],
    aggregations: [
      { field: 'totalAmount', type: 'sum', alias: 'totalSales' },
      { field: 'totalAmount', type: 'count', alias: 'orderCount' },
    ],
    sortBy: [{ field: 'date', direction: 'desc' }],
  },
  low_stock: {
    dataSource: 'stock',
    columns: [
      { field: 'productId', label: 'Mahsulot ID' },
      { field: 'quantity', label: 'Qoldiq', format: 'number' },
    ],
    filters: [{ field: 'quantity', operator: 'lte', value: 10 }],
    sortBy: [{ field: 'quantity', direction: 'asc' }],
  },
  top_customers: {
    dataSource: 'orders',
    columns: [
      { field: 'customerId', label: 'Mijoz' },
      { field: 'totalAmount', label: 'Summa', format: 'currency' },
    ],
    groupBy: ['customerId'],
    aggregations: [
      { field: 'totalAmount', type: 'sum', alias: 'totalSpent' },
      { field: 'id', type: 'count', alias: 'orderCount' },
    ],
    sortBy: [{ field: 'totalAmount', direction: 'desc' }],
    limit: 20,
  },
};
