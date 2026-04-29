'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Plus,
  Trash2,
  Download,
  BarChart3,
  Filter,
  Columns,
  Group,
  Calculator,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ReportConfig, ReportResult, reportTemplates } from '@/lib/reports/types';

const dataSources = [
  { value: 'orders', label: 'Buyurtmalar' },
  { value: 'products', label: 'Mahsulotlar' },
  { value: 'customers', label: 'Mijozlar' },
  { value: 'suppliers', label: "Ta'minotchilar" },
  { value: 'purchases', label: 'Xaridlar' },
  { value: 'stock', label: 'Ombor qoldiqlari' },
  { value: 'transfers', label: 'Ombor ko\'chirishlari' },
];

const operators = [
  { value: 'eq', label: '=' },
  { value: 'neq', label: '!=' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '>=' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '<=' },
  { value: 'contains', label: 'O\'z ichiga oladi' },
  { value: 'startsWith', label: 'Bilan boshlanadi' },
  { value: 'endsWith', label: 'Bilan tugaydi' },
  { value: 'in', label: 'Ro\'yxatda' },
];

const aggTypes = [
  { value: 'sum', label: 'Yig\'indi' },
  { value: 'avg', label: 'O\'rtacha' },
  { value: 'count', label: 'Soni' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maksimum' },
];

const formats = [
  { value: '', label: 'Standart' },
  { value: 'number', label: 'Son' },
  { value: 'currency', label: 'Valyuta' },
  { value: 'date', label: 'Sana' },
  { value: 'datetime', label: 'Sana-vaqt' },
  { value: 'percent', label: 'Foiz' },
];

export default function ReportBuilderPage() {
  const { t } = useLanguage();
  const [config, setConfig] = useState<ReportConfig>({
    dataSource: 'orders',
    filters: [],
    columns: [],
    groupBy: [],
    aggregations: [],
    sortBy: [],
    limit: 100,
  });
  const [result, setResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    filters: true,
    columns: true,
    groupBy: true,
    aggregations: true,
    sortBy: true,
    dateRange: false,
  });

  const toggleSection = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateConfig = (updates: Partial<ReportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addFilter = () => {
    updateConfig({
      filters: [...(config.filters || []), { field: '', operator: 'eq', value: '' }],
    });
  };

  const removeFilter = (idx: number) => {
    updateConfig({
      filters: (config.filters || []).filter((_, i) => i !== idx),
    });
  };

  const updateFilter = (idx: number, updates: any) => {
    const filters = [...(config.filters || [])];
    filters[idx] = { ...filters[idx], ...updates };
    updateConfig({ filters });
  };

  const addColumn = () => {
    updateConfig({
      columns: [...(config.columns || []), { field: '', label: '' }],
    });
  };

  const removeColumn = (idx: number) => {
    updateConfig({
      columns: (config.columns || []).filter((_, i) => i !== idx),
    });
  };

  const updateColumn = (idx: number, updates: any) => {
    const columns = [...(config.columns || [])];
    columns[idx] = { ...columns[idx], ...updates };
    updateConfig({ columns });
  };

  const addGroupBy = () => {
    updateConfig({ groupBy: [...(config.groupBy || []), ''] });
  };

  const removeGroupBy = (idx: number) => {
    updateConfig({
      groupBy: (config.groupBy || []).filter((_, i) => i !== idx),
    });
  };

  const updateGroupBy = (idx: number, value: string) => {
    const groupBy = [...(config.groupBy || [])];
    groupBy[idx] = value;
    updateConfig({ groupBy });
  };

  const addAggregation = () => {
    updateConfig({
      aggregations: [...(config.aggregations || []), { field: '', type: 'sum' }],
    });
  };

  const removeAggregation = (idx: number) => {
    updateConfig({
      aggregations: (config.aggregations || []).filter((_, i) => i !== idx),
    });
  };

  const updateAggregation = (idx: number, updates: any) => {
    const aggregations = [...(config.aggregations || [])];
    aggregations[idx] = { ...aggregations[idx], ...updates };
    updateConfig({ aggregations });
  };

  const addSort = () => {
    updateConfig({
      sortBy: [...(config.sortBy || []), { field: '', direction: 'asc' }],
    });
  };

  const removeSort = (idx: number) => {
    updateConfig({
      sortBy: (config.sortBy || []).filter((_, i) => i !== idx),
    });
  };

  const updateSort = (idx: number, updates: any) => {
    const sortBy = [...(config.sortBy || [])];
    sortBy[idx] = { ...sortBy[idx], ...updates };
    updateConfig({ sortBy });
  };

  const loadTemplate = (key: string) => {
    const template = reportTemplates[key];
    if (template) {
      setConfig({ ...template });
      setResult(null);
    }
  };

  const runReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Xatolik yuz berdi');
      setResult(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!result?.data?.length) return;
    const headers = Object.keys(result.data[0]);
    const rows = result.data.map((row: any) =>
      headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${config.dataSource}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 font-sans w-full h-full text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/reports" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Hisobot Builder</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Dinamik hisobotlar yaratish</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {result && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              CSV
            </button>
          )}
          <button
            onClick={runReport}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Hisobot yaratish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Data Source */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Ma'lumot manbai</label>
            <select
              value={config.dataSource}
              onChange={e => updateConfig({ dataSource: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-slate-200"
            >
              {dataSources.map(ds => (
                <option key={ds.value} value={ds.value}>{ds.label}</option>
              ))}
            </select>
          </div>

          {/* Templates */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Shablonlar</label>
            <div className="space-y-2">
              {Object.entries(reportTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => loadTemplate(key)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {key.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button onClick={() => toggleSection('filters')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Filter size={16} className="text-teal-500" />
                Filterlar
              </div>
              {expanded.filters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expanded.filters && (
              <div className="px-5 pb-5 space-y-3">
                {(config.filters || []).map((filter, idx) => (
                  <div key={idx} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <input
                      type="text"
                      placeholder="Maydon"
                      value={filter.field}
                      onChange={e => updateFilter(idx, { field: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                    />
                    <select
                      value={filter.operator}
                      onChange={e => updateFilter(idx, { operator: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                    >
                      {operators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="Qiymat"
                      value={typeof filter.value === 'string' ? filter.value : JSON.stringify(filter.value)}
                      onChange={e => updateFilter(idx, { value: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                    />
                    <button onClick={() => removeFilter(idx)} className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1">
                      <Trash2 size={12} /> O'chirish
                    </button>
                  </div>
                ))}
                <button onClick={addFilter} className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
                  <Plus size={14} /> Filter qo'shish
                </button>
              </div>
            )}
          </div>

          {/* Columns */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button onClick={() => toggleSection('columns')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Columns size={16} className="text-teal-500" />
                Ustunlar
              </div>
              {expanded.columns ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expanded.columns && (
              <div className="px-5 pb-5 space-y-3">
                {(config.columns || []).map((col, idx) => (
                  <div key={idx} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <input
                      type="text"
                      placeholder="Maydon"
                      value={col.field}
                      onChange={e => updateColumn(idx, { field: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Sarlavha"
                      value={col.label}
                      onChange={e => updateColumn(idx, { label: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                    />
                    <select
                      value={col.format || ''}
                      onChange={e => updateColumn(idx, { format: e.target.value || undefined })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                    >
                      {formats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <button onClick={() => removeColumn(idx)} className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1">
                      <Trash2 size={12} /> O'chirish
                    </button>
                  </div>
                ))}
                <button onClick={addColumn} className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
                  <Plus size={14} /> Ustun qo'shish
                </button>
              </div>
            )}
          </div>

          {/* Group By */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button onClick={() => toggleSection('groupBy')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Group size={16} className="text-teal-500" />
                Guruhlash
              </div>
              {expanded.groupBy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expanded.groupBy && (
              <div className="px-5 pb-5 space-y-3">
                {(config.groupBy || []).map((field, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Maydon"
                      value={field}
                      onChange={e => updateGroupBy(idx, e.target.value)}
                      className="flex-1 px-2 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                    />
                    <button onClick={() => removeGroupBy(idx)} className="text-red-500 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={addGroupBy} className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
                  <Plus size={14} /> Guruh qo'shish
                </button>
              </div>
            )}
          </div>

          {/* Aggregations */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button onClick={() => toggleSection('aggregations')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Calculator size={16} className="text-teal-500" />
                Agregatsiyalar
              </div>
              {expanded.aggregations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expanded.aggregations && (
              <div className="px-5 pb-5 space-y-3">
                {(config.aggregations || []).map((agg, idx) => (
                  <div key={idx} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <input
                      type="text"
                      placeholder="Maydon"
                      value={agg.field}
                      onChange={e => updateAggregation(idx, { field: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                    />
                    <select
                      value={agg.type}
                      onChange={e => updateAggregation(idx, { type: e.target.value as any })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                    >
                      {aggTypes.map(at => <option key={at.value} value={at.value}>{at.label}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="Nomi (ixtiyoriy)"
                      value={agg.alias || ''}
                      onChange={e => updateAggregation(idx, { alias: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                    />
                    <button onClick={() => removeAggregation(idx)} className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1">
                      <Trash2 size={12} /> O'chirish
                    </button>
                  </div>
                ))}
                <button onClick={addAggregation} className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
                  <Plus size={14} /> Agregatsiya qo'shish
                </button>
              </div>
            )}
          </div>

          {/* Sort By */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button onClick={() => toggleSection('sortBy')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <BarChart3 size={16} className="text-teal-500" />
                Tartiblash
              </div>
              {expanded.sortBy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expanded.sortBy && (
              <div className="px-5 pb-5 space-y-3">
                {(config.sortBy || []).map((sort, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Maydon"
                      value={sort.field}
                      onChange={e => updateSort(idx, { field: e.target.value })}
                      className="flex-1 px-2 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                    />
                    <select
                      value={sort.direction}
                      onChange={e => updateSort(idx, { direction: e.target.value as any })}
                      className="px-2 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                    >
                      <option value="asc">O'sish</option>
                      <option value="desc">Kamayish</option>
                    </select>
                    <button onClick={() => removeSort(idx)} className="text-red-500 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={addSort} className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
                  <Plus size={14} /> Tartib qo'shish
                </button>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button onClick={() => toggleSection('dateRange')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Calendar size={16} className="text-teal-500" />
                Sana oralig'i
              </div>
              {expanded.dateRange ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expanded.dateRange && (
              <div className="px-5 pb-5 space-y-3">
                <input
                  type="text"
                  placeholder="Maydon (masalan: createdAt)"
                  value={config.dateRange?.field || ''}
                  onChange={e => updateConfig({ dateRange: { ...config.dateRange, field: e.target.value, from: config.dateRange?.from || '', to: config.dateRange?.to || '' } })}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                />
                <input
                  type="date"
                  value={config.dateRange?.from || ''}
                  onChange={e => updateConfig({ dateRange: { ...config.dateRange, from: e.target.value, to: config.dateRange?.to || '', field: config.dateRange?.field || '' } })}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                />
                <input
                  type="date"
                  value={config.dateRange?.to || ''}
                  onChange={e => updateConfig({ dateRange: { ...config.dateRange, to: e.target.value, from: config.dateRange?.from || '', field: config.dateRange?.field || '' } })}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                />
              </div>
            )}
          </div>

          {/* Limit */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Limit</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={config.limit || 100}
              onChange={e => updateConfig({ limit: parseInt(e.target.value) || 100 })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Summary */}
              {Object.keys(result.summary).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(result.summary).map(([key, value]) => (
                    <div key={key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">{key}</div>
                      <div className="text-xl font-black text-slate-900 dark:text-white">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Chart Data */}
              {result.chartData && result.chartData.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Grafik ma'lumotlar</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.chartData.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{item.sum ?? item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Natijalar ({result.totalCount} ta)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/50">
                        {result.data.length > 0 && Object.keys(result.data[0]).map(key => (
                          <th key={key} className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.data.map((row: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          {Object.values(row).map((val: any, vIdx: number) => (
                            <td key={vIdx} className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {val instanceof Date ? val.toLocaleDateString() : String(val ?? '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400 dark:text-slate-500">
              <BarChart3 size={48} className="mb-4 opacity-30" />
              <p className="text-sm">Hisobot sozlamalarini tanlang va "Hisobot yaratish" tugmasini bosing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
