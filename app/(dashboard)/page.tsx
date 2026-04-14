'use client';
import { Calendar, TrendingDown, TrendingUp, Building, Filter, ImageIcon, Plus, Package, DollarSign, Wallet, Activity, Users, ShoppingCart, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line, LabelList
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/dashboard/stats?period=${period}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [period]);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-500 dark:text-slate-400">{t('common', 'loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-full">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md">
          <h3 className="text-red-800 dark:text-red-400 font-bold mb-2">Xatolik</h3>
          <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans w-full h-full bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('dashboard', 'title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">{t('dashboard', 'subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1">
            {[
              { key: 'today', label: t('dashboard', 'today') },
              { key: 'week', label: t('dashboard', 'week') },
              { key: 'month', label: t('dashboard', 'month') },
              { key: 'year', label: t('dashboard', 'year') },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="text-right bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Live</div>
             <div className="text-lg font-bold text-slate-800 dark:text-white tabular-nums">{currentTime}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
           <div>
             <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{t('dashboard', 'totalProducts')}</div>
             <div className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalProducts || 0}</div>
           </div>
           <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
             <Package size={20} />
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
           <div>
             <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{t('dashboard', 'totalCash')}</div>
             <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${(stats?.totalCashUSD || 0).toLocaleString()}</div>
           </div>
           <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
             <DollarSign size={20} />
           </div>
        </div>

        <Link href="/customers" className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
           <div>
             <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{t('dashboard', 'customerDebt')}</div>
             <div className="text-2xl font-black text-rose-600 dark:text-rose-400">${(stats?.customerDebtUSD || 0).toLocaleString()}</div>
           </div>
           <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center">
             <TrendingDown size={20} />
           </div>
        </Link>

        <Link href="/suppliers/creditors" className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
           <div>
             <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{t('dashboard', 'supplierDebt')}</div>
             <div className="text-2xl font-black text-amber-600 dark:text-amber-400">${(stats?.supplierDebtUSD || 0).toLocaleString()}</div>
           </div>
           <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center">
             <Building size={20} />
           </div>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('dashboard', 'salesVsPurchases')}</h2>
           <div className="h-72">
              {stats?.salesPurchasesChart?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.salesPurchasesChart}>
                    <defs>
                      <linearGradient id="colorSavdo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorKirim" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend formatter={(value: any) => value === 'savdo' ? 'Savdo' : 'Kirim'} wrapperStyle={{ color: '#94a3b8' }} />
                    <Area type="monotone" dataKey="savdo" stroke="#0ea5e9" fill="url(#colorSavdo)" strokeWidth={2} name="Savdo" />
                    <Area type="monotone" dataKey="kirim" stroke="#8b5cf6" fill="url(#colorKirim)" strokeWidth={2} name="Kirim" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <p>{t('common', 'noData')}</p>
                </div>
              )}
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('dashboard', 'categories')}</h2>
           <div className="h-64">
              {stats?.categoryChart?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                    >
                      {stats.categoryChart.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: any, name: any) => [`${value} mahsulot`, name]}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-slate-400 text-center">{t('common', 'noData')}</p>}
           </div>
           
           {/* Category Legend */}
           {stats?.categoryChart?.length > 0 && (
             <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
               <div className="flex flex-wrap gap-3 justify-center">
                 {stats.categoryChart.map((cat: any, i: number) => (
                   <div key={i} className="flex items-center gap-2">
                     <div 
                       className="w-3 h-3 rounded-full" 
                       style={{ backgroundColor: COLORS[i % COLORS.length] }}
                     />
                     <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                       {cat.name} ({cat.value})
                     </span>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
