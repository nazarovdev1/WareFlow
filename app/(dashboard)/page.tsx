'use client';
import { TrendingDown, Building, Package, DollarSign, Wallet, Activity, ShoppingCart, ArrowRightLeft, MapPin, Edit3, X, Check, Trophy, TrendingUp, RefreshCw, Calculator } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const RANK_COLORS = ['#fbbf24', '#94a3b8', '#d97706'];

export default function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [period, setPeriod] = useState('month');
  const [retryCount, setRetryCount] = useState(0);
  const [editingRate, setEditingRate] = useState(false);
  const [newRate, setNewRate] = useState('');
  const [savingRate, setSavingRate] = useState(false);
  const [converterDir, setConverterDir] = useState<'USD_UZS' | 'UZS_USD'>('USD_UZS');
  const [converterAmount, setConverterAmount] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let cancelled = false;

    fetch(`/api/dashboard/stats?period=${period}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`Server xatosi: ${res.status}`);
        return res.json();
      })
      .then(data => {
        clearTimeout(timeout);
        if (!cancelled) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch(err => {
        clearTimeout(timeout);
        if (cancelled) return;
        if (err.name === 'AbortError') {
          setError('Server javob bermadi. Qayta urinib ko\'ring.');
        } else {
          setError(err.message);
        }
        setLoading(false);
      });

    return () => { cancelled = true; clearTimeout(timeout); controller.abort(); };
  }, [period, retryCount]);

  const handleSaveRate = async () => {
    if (!newRate || Number(newRate) <= 0) return;
    setSavingRate(true);
    try {
      const res = await fetch('/api/settings/exchange-rate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: Number(newRate) }),
      });
      if (res.ok) {
        setStats((prev: any) => ({
          ...prev,
          exchangeRate: { ...prev.exchangeRate, rate: Number(newRate) },
        }));
        setEditingRate(false);
      }
    } catch {}
    setSavingRate(false);
  };

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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md text-center">
          <h3 className="text-red-800 dark:text-red-400 font-bold mb-2">Xatolik</h3>
          <p className="text-red-600 dark:text-red-300 text-sm mb-4">{error}</p>
          <button onClick={() => setRetryCount(c => c + 1)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">Qayta urinish</button>
        </div>
      </div>
    );
  }

  const fs = stats?.financialSummary;
  const topMax = stats?.topProducts?.[0]?.totalRevenue || 1;

  return (
    <div className="p-6 font-sans w-full h-full bg-slate-50 dark:bg-slate-900 transition-colors overflow-y-auto">
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
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
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
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center"><Package size={20} /></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{t('dashboard', 'totalCash')}</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${(stats?.totalCashUSD || 0).toLocaleString()}</div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center"><DollarSign size={20} /></div>
        </div>
        <Link href="/customers" className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{t('dashboard', 'customerDebt')}</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">${(stats?.customerDebtUSD || 0).toLocaleString()}</div>
          </div>
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center"><TrendingDown size={20} /></div>
        </Link>
        <Link href="/suppliers/creditors" className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{t('dashboard', 'supplierDebt')}</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">${(stats?.supplierDebtUSD || 0).toLocaleString()}</div>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center"><Building size={20} /></div>
        </Link>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <Wallet size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Kassa balansi</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">${fs?.cashUSD?.toLocaleString() || 0}</div>
            <div className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{((fs?.cashUZS || 0) * (stats?.exchangeRate?.rate || 12500)).toLocaleString()} so'm</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Kutayotgan tushum</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">${Math.abs(fs?.customerDebtUSD || 0).toLocaleString()}</div>
            <div className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{stats?.financialSummary?.customerDebtUZS ? Math.abs(fs.customerDebtUZS).toLocaleString() + ' so\'m' : ''}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-600">
          <div className="w-12 h-12 bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center shrink-0">
            <Activity size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Sof balans</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">${fs?.netBalance?.toLocaleString() || 0}</div>
            <div className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Qarz va tushumlar hisobiga</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('dashboard', 'salesVsPurchases')}</h2>
          <div className="h-72">
            {stats?.salesPurchasesChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesPurchasesChart}>
                  <defs>
                    <linearGradient id="colorSavdo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorKirim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend formatter={(value: any) => value === 'savdo' ? 'Savdo' : 'Kirim'} wrapperStyle={{ color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="savdo" stroke="#0ea5e9" fill="url(#colorSavdo)" strokeWidth={2} name="Savdo" />
                  <Area type="monotone" dataKey="kirim" stroke="#8b5cf6" fill="url(#colorKirim)" strokeWidth={2} name="Kirim" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400"><p>{t('common', 'noData')}</p></div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('dashboard', 'categories')}</h2>
          <div className="h-64">
            {stats?.categoryChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.categoryChart} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value"
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}>
                    {stats.categoryChart.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value: any, name: any) => [`${value} mahsulot`, name]}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-400 text-center">{t('common', 'noData')}</p>}
          </div>
          {stats?.categoryChart?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex flex-wrap gap-3 justify-center">
                {stats.categoryChart.map((cat: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{cat.name} ({cat.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exchange Rate + Top Products + Warehouse Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Exchange Rate + Converter */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft size={18} className="text-indigo-500" /> Valyuta kursi
            </h2>
            <div className="flex items-center gap-1">
              {stats?.exchangeRate?.source === 'CBU' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  <RefreshCw size={10} /> CBU.uz
                </span>
              )}
              {!editingRate && (
                <button onClick={() => { setEditingRate(true); setNewRate(String(stats?.exchangeRate?.manualRate || stats?.exchangeRate?.rate || 12500)); }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-lg transition-colors">
                  <Edit3 size={14} />
                </button>
              )}
            </div>
          </div>

          {editingRate ? (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-slate-500 font-medium">1 USD =</span>
              <input type="number" value={newRate} onChange={e => setNewRate(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="12500" />
              <button onClick={handleSaveRate} disabled={savingRate}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                <Check size={14} />
              </button>
              <button onClick={() => setEditingRate(false)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-slate-500">1 USD =</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">{(stats?.exchangeRate?.rate || 12500).toLocaleString()}</span>
                <span className="text-sm text-slate-500">UZS</span>
              </div>
              {stats?.exchangeRate?.cbuRate && stats?.exchangeRate?.manualRate && (
                <p className="text-xs text-slate-400 mt-1">
                  Markaziy bank: {stats.exchangeRate.cbuRate.toLocaleString()} so'm
                  {stats.exchangeRate.manualRate !== stats.exchangeRate.cbuRate && (
                    <span className="text-amber-500 ml-1">(Qo'lda: {stats.exchangeRate.manualRate.toLocaleString()})</span>
                  )}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                {new Date(stats?.exchangeRate?.date || Date.now()).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}

          <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={14} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Hisoblagich</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => { setConverterDir('USD_UZS'); setConverterAmount(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${converterDir === 'USD_UZS' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                USD → UZS
              </button>
              <button onClick={() => { setConverterDir('UZS_USD'); setConverterAmount(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${converterDir === 'UZS_USD' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                UZS → USD
              </button>
            </div>
            <div className="relative">
              <input type="number" value={converterAmount} onChange={e => setConverterAmount(e.target.value)}
                placeholder={converterDir === 'USD_UZS' ? 'Dollar kiriting...' : 'So\'m kiriting...'}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-16" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {converterDir === 'USD_UZS' ? 'USD' : 'UZS'}
              </span>
            </div>
            {converterAmount && Number(converterAmount) > 0 && (
              <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Natija:</div>
                <div className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                  {converterDir === 'USD_UZS'
                    ? `${(Number(converterAmount) * (stats?.exchangeRate?.rate || 12500)).toLocaleString('uz-UZ', { maximumFractionDigits: 2 })} UZS`
                    : `$${(Number(converterAmount) / (stats?.exchangeRate?.rate || 12500)).toLocaleString('uz-UZ', { maximumFractionDigits: 2 })}`
                  }
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {converterDir === 'USD_UZS'
                    ? `${Number(converterAmount)} × ${(stats?.exchangeRate?.rate || 12500).toLocaleString()}`
                    : `${Number(converterAmount)} ÷ ${(stats?.exchangeRate?.rate || 12500).toLocaleString()}`
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-amber-500" /> Top mahsulotlar
          </h2>
          {stats?.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.map((product: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'text-white' : 'text-slate-500 bg-slate-100 dark:bg-slate-700'}`}
                    style={i < 3 ? { backgroundColor: RANK_COLORS[i] } : undefined}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-800 dark:text-white truncate mr-2">{product.name}</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">${product.totalRevenue?.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(product.totalRevenue / topMax) * 100}%`, backgroundColor: i < 3 ? RANK_COLORS[i] : '#94a3b8' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-400 text-sm text-center py-4">{t('common', 'noData')}</p>}
        </div>

        {/* Warehouse Stock */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Building size={18} className="text-teal-500" /> Omborlar
          </h2>
          {stats?.warehouseStock?.length > 0 ? (
            <div className="space-y-3">
              {stats.warehouseStock.map((wh: any) => (
                <div key={wh.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{wh.name}</div>
                    {wh.district && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-slate-400" />
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{wh.district}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-black text-slate-900 dark:text-white">{wh.totalQuantity?.toLocaleString()} dona</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">${wh.totalValue?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-400 text-sm text-center py-4">{t('common', 'noData')}</p>}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart size={18} className="text-indigo-500" /> So'nggi buyurtmalar
          </h2>
          <Link href="/sales" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Barchasi →</Link>
        </div>
        {stats?.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Hujjat</th>
                  <th className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Mijoz</th>
                  <th className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Mahsulotlar</th>
                  <th className="text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Summa</th>
                  <th className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">To'lov</th>
                  <th className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Sana</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 text-sm font-medium text-slate-800 dark:text-white">{order.docNumber}</td>
                    <td className="py-3 text-sm text-slate-600 dark:text-slate-300">{order.customer}</td>
                    <td className="py-3 text-sm text-slate-600 dark:text-slate-300">{order.itemsCount} ta</td>
                    <td className="py-3 text-sm font-bold text-slate-900 dark:text-white text-right">${Number(order.amount).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.paymentMethod === 'CASH' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : order.paymentMethod === 'CARD' ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'}`}>
                        {order.paymentMethod === 'CASH' ? 'Naqd' : order.paymentMethod === 'CARD' ? 'Karta' : order.paymentMethod === 'TRANSFER' ? 'O\'tkazma' : order.paymentMethod || '-'}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-500 dark:text-slate-400">{new Date(order.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">{t('common', 'noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
