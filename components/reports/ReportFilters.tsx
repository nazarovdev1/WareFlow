'use client';

import { Filter, X } from 'lucide-react';

interface ReportFiltersProps {
  filters: {
    warehouseId?: string;
    categoryId?: string;
    customerId?: string;
    supplierId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  };
  warehouses?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
  customers?: { id: string; fullName: string }[];
  suppliers?: { id: string; name: string }[];
  statusOptions?: { value: string; label: string }[];
  onChange: (filters: any) => void;
  onClear: () => void;
}

export function ReportFilters({ filters, warehouses, categories, customers, suppliers, statusOptions, onChange, onClear }: ReportFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Filter size={16} />
          <span>Filterlar</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
          >
            <X size={14} />
            Tozalash
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {warehouses && warehouses.length > 0 && (
          <select
            value={filters.warehouseId || ''}
            onChange={(e) => onChange({ ...filters, warehouseId: e.target.value || undefined })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Barcha omborlar</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>{wh.name}</option>
            ))}
          </select>
        )}

        {categories && categories.length > 0 && (
          <select
            value={filters.categoryId || ''}
            onChange={(e) => onChange({ ...filters, categoryId: e.target.value || undefined })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Barcha kategoriyalar</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        )}

        {customers && customers.length > 0 && (
          <select
            value={filters.customerId || ''}
            onChange={(e) => onChange({ ...filters, customerId: e.target.value || undefined })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Barcha mijozlar</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>
        )}

        {suppliers && suppliers.length > 0 && (
          <select
            value={filters.supplierId || ''}
            onChange={(e) => onChange({ ...filters, supplierId: e.target.value || undefined })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Barcha ta&apos;minotchilar</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}

        {statusOptions && statusOptions.length > 0 && (
          <select
            value={filters.status || ''}
            onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Barcha holatlar</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        )}

        <input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined })}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Boshlanish sanasi"
        />

        <input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined })}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Tugash sanasi"
        />
      </div>
    </div>
  );
}