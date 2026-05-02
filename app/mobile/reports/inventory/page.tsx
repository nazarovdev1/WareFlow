'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { PieChart, Package, AlertTriangle, TrendingDown, Filter, X } from 'lucide-react';
import { ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function MobileInventoryReport() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    setLoading(true);
    fetch(`/api/reports/inventory?${params}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dateFrom, dateTo]);

  const summary = (data as Record<string, Record<string, number>>)?.summary || {};
  const chartData = (Array.isArray((data as Record<string, unknown>)?.chartData) ? (data as Record<string, unknown>).chartData : []) as Record<string, unknown>[];
  const tableData = (Array.isArray((data as Record<string, unknown>)?.tableData) ? (data as Record<string, unknown>).tableData : []) as Record<string, unknown>[];

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Ombor Hisoboti" backHref="/mobile/reports"
        rightAction={
          <button onClick={() => setShowFilters(!showFilters)} className="p-2.5 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 active:scale-95 transition-transform">
            <Filter size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
        }
      />

      {showFilters && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]" onClick={() => setShowFilters(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Filtrlar</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Dan</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Gacha</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
              </div>
              <button onClick={() => setShowFilters(false)} className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-transform">{`Qo'llash`}</button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 mt-2 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Package size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Mahsulotlar</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{loading ? '...' : (summary.totalProducts || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Kam qolgan</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{loading ? '...' : (summary.lowStock || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={14} className="text-red-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Tugagan</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{loading ? '...' : (summary.outOfStock || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <PieChart size={14} className="text-violet-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Jami qiymat</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">${loading ? '...' : (summary.totalValue || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Kategoriyalar bo{'\u2019'}yicha</h3>
          {loading ? (
            <div className="h-48 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RPieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </RPieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Mahsulotlar ro{'\u2019'}yxati</h3>
          <div className="space-y-2">
            {loading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-100 dark:border-slate-800" />)
            ) : tableData.slice(0, 20).map((row, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{String(row.name || '-')}</p>
                    <p className="text-[11px] text-slate-500">{String(row.category || '-')} • SKU: {String(row.sku || '-')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{String(row.quantity || '0')} dona</p>
                    <p className="text-[11px] text-slate-500">${String(row.value || '0')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
