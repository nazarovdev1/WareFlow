'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Truck, Package, Filter, X } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MobilePurchasesReport() {
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
    fetch(`/api/reports/purchases?${params}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dateFrom, dateTo]);

  const summary = (data as Record<string, Record<string, number>>)?.summary || {};
  const chartData = (Array.isArray((data as Record<string, unknown>)?.chartData) ? (data as Record<string, unknown>).chartData : []) as Record<string, unknown>[];
  const tableData = (Array.isArray((data as Record<string, unknown>)?.tableData) ? (data as Record<string, unknown>).tableData : []) as Record<string, unknown>[];

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Xarid Hisoboti" backHref="/mobile/reports"
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
              <ShoppingBag size={14} className="text-rose-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Xaridlar</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{loading ? '...' : (summary.totalPurchases || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={14} className="text-violet-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Jami summa</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">${loading ? '...' : (summary.totalAmount || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={14} className="text-indigo-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">{`Ta'minotchilar`}</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{loading ? '...' : (summary.totalSuppliers || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Package size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Mahsulotlar</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{loading ? '...' : (summary.totalItems || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Xaridlar dinamikasi</h3>
          {loading ? (
            <div className="h-48 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="xarid" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{`So'nggi xaridlar`}</h3>
          <div className="space-y-2">
            {loading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-100 dark:border-slate-800" />)
            ) : tableData.slice(0, 20).map((row, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{String(row.docNumber || '-')}</p>
                    <p className="text-[11px] text-slate-500">{String(row.supplier || '-')} • {String(row.date || '-')}</p>
                  </div>
                  <p className="text-sm font-black text-rose-600">${String(row.amount || '0')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
