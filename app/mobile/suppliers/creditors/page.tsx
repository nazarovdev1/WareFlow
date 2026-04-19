'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Search, ArrowUpRight, Truck, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function MobileCreditorsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/suppliers/creditors')
      .then(r => r.json())
      .then(data => {
        setTransactions(data.data || data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = transactions.filter(t =>
    (t.supplier?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalUSD = transactions.filter(t => t.currency === 'USD' && t.type === 'DEBT').reduce((s, t) => s + (Number(t.amount) || 0), 0)
    - transactions.filter(t => t.currency === 'USD' && t.type === 'PAYMENT').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalUZS = transactions.filter(t => t.currency === 'UZS' && t.type === 'DEBT').reduce((s, t) => s + (Number(t.amount) || 0), 0)
    - transactions.filter(t => t.currency === 'UZS' && t.type === 'PAYMENT').reduce((s, t) => s + (Number(t.amount) || 0), 0);

  return (
    <div className="w-full min-h-screen pb-28">
      <div className="px-6 pt-8 pb-4 flex items-center gap-3 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-40">
        <Link href="/mobile/suppliers" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform">
          <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </Link>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Kreditorlar</h1>
      </div>

      <div className="px-6 mb-5 mt-2 grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-4 rounded-2xl text-white">
          <div className="text-[9px] font-bold text-rose-100 uppercase tracking-wider mb-1">Qarz USD</div>
          <div className="text-xl font-black">${Math.abs(totalUSD).toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-2xl text-white">
          <div className="text-[9px] font-bold text-amber-100 uppercase tracking-wider mb-1">Qarz UZS</div>
          <div className="text-xl font-black">{Math.abs(totalUZS).toLocaleString()}</div>
        </div>
      </div>

      <div className="px-6 mb-5">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Qidirish..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm text-slate-800 dark:text-white" />
        </div>
      </div>

      <div className="px-6 space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : filtered.length > 0 ? (
          filtered.map((tx: any) => (
            <div key={tx.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'DEBT' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <DollarSign size={18} />
                </div>
                <div>
                  <div className="text-[12px] font-bold text-slate-800 dark:text-white">{tx.supplier?.name || "Noma'lum"}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar size={9} />
                    {tx.date ? new Date(tx.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) : '-'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[13px] font-black ${tx.type === 'DEBT' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {tx.type === 'DEBT' ? '+' : '-'}{Number(tx.amount).toLocaleString()} {tx.currency}
                </div>
                <div className="text-[9px] text-slate-400">{tx.type === 'DEBT' ? 'Qarz' : "To'lov"}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Truck size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tranzaksiyalar yo'q</p>
          </div>
        )}
      </div>
    </div>
  );
}
