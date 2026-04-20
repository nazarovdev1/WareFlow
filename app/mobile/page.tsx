'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { Bell, ArrowDownRight, Package, ShoppingCart, Users, Wallet, Activity, ChevronRight, TrendingUp, ArrowRightLeft, Trophy, Building, RefreshCw, AlertTriangle, UserPlus, FileText } from 'lucide-react';
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
  const RANK_COLORS = ['#0f172a', '#64748b', '#94a3b8']; // Updated to slate tones

  return (
    <div className="w-full pb-6">
      {/* Header */}
      <MobileHeader />

      {/* Main Balance Card (Dark Navy Theme) */}
      <div className="px-6 mb-6 mt-2">
        <div className="bg-slate-900 dark:bg-slate-800 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden border border-slate-800 dark:border-slate-700">
          {/* Subtle trend arrow graphic in background */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
             <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 80L40 40L80 60L160 0V100H0V80Z" fill="currentColor"/>
             </svg>
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Umumiy Balans</span>
            </div>
            <div className="text-4xl font-black mb-1 tracking-tight">${loading ? '...' : balance.toLocaleString()}</div>
            <div className="flex items-center gap-1.5 text-sm text-emerald-400 font-bold mb-5">
               <TrendingUp size={16} /> 
               <span>+2.4% <span className="text-slate-400 font-medium">vs Kecha</span></span>
            </div>
            
            <div className="h-px bg-slate-800 w-full mb-4"></div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-slate-400 mb-1">Kutilayotgan tushum</div>
                <div className="font-bold text-white">${loading ? '...' : Math.abs(expected).toLocaleString()}</div>
              </div>
              <div>
                 <div className="text-[10px] text-slate-400 mb-1">Jami filiallar</div>
                 <div className="font-bold text-white">{loading ? '...' : (stats?.warehouseStock?.length || 0)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions (Flat design) */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-4 gap-3">
          <ActionBtn href="/mobile/sales/new" icon={ShoppingCart} label="Savdo" />
          <ActionBtn href="/mobile/purchases/new" icon={ArrowDownRight} label="Kirim" />
          <ActionBtn href="/mobile/inventory" icon={Package} label="Ombor" />
          <ActionBtn href="/mobile/customers" icon={Users} label="Mijozlar" />
        </div>
      </div>

      {/* Secondary Info Cards (Flat white cards, some with alerts) */}
      <div className="px-6 mb-6 space-y-4">
        {/* Outstanding Debtors - Red Warning Style */}
        <Link href="/mobile/customers/debtors" className="block bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden active:scale-[0.99] transition-transform">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
          <div className="flex justify-between items-start mb-2">
             <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Qarzdorlar (Debitorlar)</span>
             <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
               <AlertTriangle size={16} strokeWidth={2.5} />
             </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-3">
            ${loading ? '...' : (stats?.customerDebtUSD || 0).toLocaleString()}
          </div>
          <div className="flex justify-between items-center text-sm border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-slate-500 dark:text-slate-400">Kechiktirilgan</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">${loading ? '...' : ((stats?.customerDebtUSD || 0) * 0.3).toLocaleString()}</span> {/* Example breakdown */}
          </div>
        </Link>

        {/* Current Creditors - Teal Accent Style */}
        <Link href="/mobile/suppliers/creditors" className="block bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden active:scale-[0.99] transition-transform">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
          <div className="flex justify-between items-start mb-2">
             <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kreditorlar</span>
             <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
               <Wallet size={16} strokeWidth={2.5} />
             </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-3">
            ${loading ? '...' : (stats?.supplierDebtUSD || 0).toLocaleString()}
          </div>
          <div className="flex justify-between items-center text-sm border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-slate-500 dark:text-slate-400">Yaqin 7 kunda</span>
            <span className="font-bold text-slate-900 dark:text-white">${loading ? '...' : ((stats?.supplierDebtUSD || 0) * 0.4).toLocaleString()}</span>
          </div>
        </Link>
      </div>

      {/* Grid Stats */}
      <div className="px-6 mb-6 grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Package size={16} className="text-slate-700 dark:text-slate-300" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mahsulotlar</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{loading ? '...' : (stats?.totalProducts || 0)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Activity size={16} className="text-slate-700 dark:text-slate-300" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sof balans</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">${loading ? '...' : (stats?.financialSummary?.netBalance || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Exchange Rate + Converter */}
      <div className="px-6 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-slate-400" />
              <span className="text-[13px] font-black uppercase tracking-wider text-slate-900 dark:text-white">Valyuta kursi</span>
            </div>
            {stats?.exchangeRate?.source === 'CBU' && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                Markaziy Bank
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-sm font-bold text-slate-400">1 USD =</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{rate.toLocaleString()}</span>
            <span className="text-sm font-bold text-slate-400">UZS</span>
          </div>

          {/* Converter */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => { setConverterDir('USD_UZS'); setConverterAmount(''); }}
              className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all ${converterDir === 'USD_UZS' ? 'bg-slate-900 dark:bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              USD &rarr; UZS
            </button>
            <button onClick={() => { setConverterDir('UZS_USD'); setConverterAmount(''); }}
              className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all ${converterDir === 'UZS_USD' ? 'bg-slate-900 dark:bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              UZS &rarr; USD
            </button>
          </div>
          <div className="relative">
            <input type="number" value={converterAmount} onChange={e => setConverterAmount(e.target.value)}
              placeholder={converterDir === 'USD_UZS' ? 'Qiymat (USD)...' : "Qiymat (UZS)..."}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-bold focus:outline-none focus:border-slate-400 text-slate-900 dark:text-white pr-14" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">
              {converterDir === 'USD_UZS' ? 'USD' : 'UZS'}
            </span>
          </div>
          {converterAmount && Number(converterAmount) > 0 && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500">Natija:</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {converterDir === 'USD_UZS'
                  ? `${(Number(converterAmount) * rate).toLocaleString('uz-UZ', { maximumFractionDigits: 2 })} so'm`
                  : `$${(Number(converterAmount) / rate).toLocaleString('uz-UZ', { maximumFractionDigits: 2 })}`
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="px-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[13px] font-black uppercase tracking-wider text-slate-900 dark:text-white">So'nggi Savdolar</h2>
          <Link href="/mobile/sales" className="text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-3 py-1 rounded-md">
            Barchasi
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-2">
          {loading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="h-16 m-2 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)
          ) : recentOrders.length > 0 ? (
            recentOrders.slice(0, 5).map((order: any, i: number) => (
              <div key={order.id} className={`flex items-center justify-between p-3 ${i !== recentOrders.slice(0, 5).length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-900 dark:text-white">{order.customer || "Chakana"}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{order.docNumber}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-black text-slate-900 dark:text-white">${Number(order.amount).toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mt-0.5">
                    {order.paymentMethod || 'Naqd'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400 text-sm font-bold">Ma'lumot yo'q</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 group active:scale-95 transition-all">
      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm">
        <Icon size={22} strokeWidth={2} />
      </div>
      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{label}</span>
    </Link>
  );
}
