'use client';

import { Bell, ArrowDownRight, Package, ShoppingCart, Users, Wallet, Activity, ChevronRight, TrendingUp, ArrowRightLeft, Trophy, Building, RefreshCw, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MobileDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [converterDir, setConverterDir] = useState<'USD_UZS' | 'UZS_USD'>('USD_UZS');
  const [converterAmount, setConverterAmount] = useState('');

  useEffect(() => {
    fetch('/api/dashboard/stats?period=month')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const balance = stats?.financialSummary?.cashUSD || 0;
  const expected = stats?.financialSummary?.customerDebtUSD || 0;
  const recentOrders = stats?.recentOrders || [];
  const rate = stats?.exchangeRate?.rate || 12500;
  const topMax = stats?.topProducts?.[0]?.totalRevenue || 1;
  const RANK_COLORS = ['#fbbf24', '#94a3b8', '#d97706'];

  return (
    <div className="w-full">
      <div className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-40">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Xush kelibsiz</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Admin</h1>
        </div>
        <button className="relative p-2.5 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform">
          <Bell size={20} className="text-slate-600 dark:text-slate-300" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="px-6 mb-6 mt-2">
        <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 p-6 rounded-3xl shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-8 -mb-8"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                <Wallet size={14} className="text-indigo-50" />
                <span className="text-[11px] font-bold text-indigo-50 uppercase tracking-wider">Umumiy Balans</span>
              </div>
              <Activity size={20} className="text-indigo-200/80" />
            </div>
            <div className="text-4xl font-black mb-2 tracking-tight">${loading ? '...' : balance.toLocaleString()}</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-indigo-100 font-medium bg-white/10 px-3 py-1 rounded-full border border-white/5">
                <TrendingUp size={14} className="text-emerald-300" />
                <span>Kutilayotgan: <span className="font-bold text-white">${loading ? '...' : Math.abs(expected).toLocaleString()}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <h2 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 px-1">Tezkor amallar</h2>
        <div className="grid grid-cols-4 gap-3">
          <ActionBtn href="/mobile/sales/new" icon={ShoppingCart} label="Savdo" color="from-emerald-400 to-emerald-600" shadow="shadow-emerald-500/20" />
          <ActionBtn href="/mobile/purchases/new" icon={ArrowDownRight} label="Kirim" color="from-blue-400 to-blue-600" shadow="shadow-blue-500/20" />
          <ActionBtn href="/mobile/inventory" icon={Package} label="Ombor" color="from-amber-400 to-amber-600" shadow="shadow-amber-500/20" />
          <ActionBtn href="/mobile/customers" icon={Users} label="Mijozlar" color="from-rose-400 to-rose-600" shadow="shadow-rose-500/20" />
        </div>
      </div>

      {/* Financial Mini Cards */}
      <div className="px-6 mb-6 grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Package size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mahsulotlar</span>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{loading ? '...' : (stats?.totalProducts || 0)}</div>
        </div>
        <Link href="/mobile/cashbox" className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Wallet size={14} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kassa</span>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">${loading ? '...' : (stats?.totalCashUSD || 0).toLocaleString()}</div>
        </Link>
        <Link href="/mobile/customers/debtors" className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
              <TrendingDown size={14} className="text-rose-600 dark:text-rose-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qarzdorlar</span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">${loading ? '...' : (stats?.customerDebtUSD || 0).toLocaleString()}</div>
        </Link>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
              <Activity size={14} className="text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sof balans</span>
          </div>
          <div className="text-2xl font-black text-violet-600 dark:text-violet-400">${loading ? '...' : (stats?.financialSummary?.netBalance || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Exchange Rate + Converter */}
      <div className="px-6 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft size={16} className="text-indigo-500" />
              <span className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Valyuta kursi</span>
            </div>
            {stats?.exchangeRate?.source === 'CBU' && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <RefreshCw size={9} /> CBU.uz
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-sm text-slate-400">1 USD =</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{rate.toLocaleString()}</span>
            <span className="text-sm text-slate-400">UZS</span>
          </div>

          {/* Converter */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex gap-2 mb-3">
              <button onClick={() => { setConverterDir('USD_UZS'); setConverterAmount(''); }}
                className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all ${converterDir === 'USD_UZS' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                USD → UZS
              </button>
              <button onClick={() => { setConverterDir('UZS_USD'); setConverterAmount(''); }}
                className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all ${converterDir === 'UZS_USD' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                UZS → USD
              </button>
            </div>
            <div className="relative">
              <input type="number" value={converterAmount} onChange={e => setConverterAmount(e.target.value)}
                placeholder={converterDir === 'USD_UZS' ? 'Dollar kiriting...' : "So'm kiriting..."}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white pr-14" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                {converterDir === 'USD_UZS' ? 'USD' : 'UZS'}
              </span>
            </div>
            {converterAmount && Number(converterAmount) > 0 && (
              <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Natija:</div>
                <div className="text-xl font-black text-indigo-700 dark:text-indigo-300">
                  {converterDir === 'USD_UZS'
                    ? `${(Number(converterAmount) * rate).toLocaleString('uz-UZ', { maximumFractionDigits: 2 })} so'm`
                    : `$${(Number(converterAmount) / rate).toLocaleString('uz-UZ', { maximumFractionDigits: 2 })}`
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      {stats?.topProducts?.length > 0 && (
        <div className="px-6 mb-6">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500" /> Top mahsulotlar
            </h2>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
            {stats.topProducts.slice(0, 5).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black ${i < 3 ? 'text-white' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'}`}
                  style={i < 3 ? { backgroundColor: RANK_COLORS[i] } : undefined}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold text-slate-800 dark:text-white truncate mr-2">{p.name}</span>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 whitespace-nowrap">${p.totalRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(p.totalRevenue / topMax) * 100}%`, backgroundColor: i < 3 ? RANK_COLORS[i] : '#94a3b8' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warehouses */}
      {stats?.warehouseStock?.length > 0 && (
        <div className="px-6 mb-6">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building size={14} className="text-teal-500" /> Omborlar
            </h2>
            <Link href="/mobile/inventory" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 active:scale-95 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-full">
              Barchasi <ChevronRight size={10} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.warehouseStock.slice(0, 3).map((wh: any) => (
              <div key={wh.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                    <Building size={18} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-slate-800 dark:text-white">{wh.name}</div>
                    {wh.district && <div className="text-[10px] text-slate-400">{wh.district}</div>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-black text-slate-900 dark:text-white">{wh.totalQuantity?.toLocaleString()} dona</div>
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">${wh.totalValue?.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="px-6 mb-6">
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">So'nggi savdolar</h2>
          <Link href="/mobile/sales" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 active:scale-95 transition-transform bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-full">
            Barchasi <ChevronRight size={10} />
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-1">
          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)
          ) : recentOrders.length > 0 ? (
            recentOrders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{order.customer || "Noma'lum"}</div>
                    <div className="text-[10px] text-slate-400">{order.docNumber}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-black text-emerald-600 dark:text-emerald-400">+${Number(order.amount).toLocaleString()}</div>
                  <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block ${
                    order.paymentMethod === 'CASH' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                    order.paymentMethod === 'CARD' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                    'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                  }`}>
                    {order.paymentMethod || 'Naqd'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ShoppingCart size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">Ma'lumot yo'q</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ href, icon: Icon, label, color, shadow }: { href: string; icon: any; label: string; color: string; shadow: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 group active:scale-90 transition-all duration-200">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg ${shadow} border border-white/20`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{label}</span>
    </Link>
  );
}
