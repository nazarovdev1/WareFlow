'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Building, TrendingUp, Users, Package, Filter, X } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileBranchReport() {
  const { error } = useNotification();
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
    fetch(`/api/reports/branch?${params}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { error('Xatolik', 'Filial hisobotini yuklashda xato'); setLoading(false); });
  }, [dateFrom, dateTo]);

  const summary = (data as Record<string, Record<string, number>>)?.summary || {};
  const chartData = (Array.isArray((data as Record<string, unknown>)?.chartData) ? (data as Record<string, unknown>).chartData : []) as Record<string, unknown>[];
  const branches = (Array.isArray((data as Record<string, unknown>)?.branches) ? (data as Record<string, unknown>).branches : []) as Record<string, unknown>[];

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Filial Hisoboti" backHref="/mobile/reports"
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
              <Building size={14} className="text-cyan-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Filiallar</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{loading ? '...' : (summary.totalBranches || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Jami savdo</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">${loading ? '...' : (summary.totalSales || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-violet-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Xodimlar</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{loading ? '...' : (summary.totalEmployees || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Package size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Mahsulotlar</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{loading ? '...' : (summary.totalProducts || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Filiallar bo{'\u2019'}yicha savdo</h3>
          {loading ? (
            <div className="h-48 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="savdo" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Filiallar ro{'\u2019'}yxati</h3>
          <div className="space-y-2">
            {loading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-100 dark:border-slate-800" />)
            ) : branches.slice(0, 20).map((branch, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{String(branch.name || '-')}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{String(branch.address || '-')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600">${String(branch.revenue || '0')}</p>
                    <p className="text-[11px] text-slate-500">{String(branch.orders || '0')} buyurtma</p>
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
