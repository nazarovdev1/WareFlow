'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Phone, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import MobileHeader from '@/components/mobile/MobileHeader';

export default function MobileDebtorsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/customers?limit=200')
      .then(r => r.json())
      .then(data => {
        const all = data.data || data || [];
        setCustomers(all.filter((c: any) => (c.balanceUSD < 0 || c.balanceUZS < 0)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const totalDebtUSD = customers.reduce((s, c) => s + Math.abs(c.balanceUSD || 0), 0);
  const totalDebtUZS = customers.reduce((s, c) => s + Math.abs(c.balanceUZS || 0), 0);

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Qarzdorlar" backHref="/mobile/customers" />

      <div className="px-6 mb-5 mt-2 grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-4 rounded-2xl text-white">
          <div className="text-[9px] font-bold text-rose-100 uppercase tracking-wider mb-1">Qarz USD</div>
          <div className="text-xl font-black">${totalDebtUSD.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-2xl text-white">
          <div className="text-[9px] font-bold text-amber-100 uppercase tracking-wider mb-1">Qarz UZS</div>
          <div className="text-xl font-black">{totalDebtUZS.toLocaleString()}</div>
        </div>
      </div>

      <div className="px-6 mb-5">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Mijoz qidirish..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm text-slate-800 dark:text-white" />
        </div>
      </div>

      <div className="px-6 space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : filtered.length > 0 ? (
          filtered.map(customer => (
            <div key={customer.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <TrendingDown size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{customer.fullName}</div>
                  <div className="flex items-center gap-3 mt-1">
                    {customer.phone && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1"><Phone size={9} /> {customer.phone}</span>
                    )}
                    {customer.region && (
                      <span className="text-[10px] text-slate-400">{customer.region}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {customer.balanceUSD < 0 && (
                    <div className="text-[13px] font-black text-rose-600 dark:text-rose-400">${Math.abs(customer.balanceUSD).toLocaleString()}</div>
                  )}
                  {customer.balanceUZS < 0 && (
                    <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{Math.abs(customer.balanceUZS).toLocaleString()} so'm</div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Users size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Qarzdorlar yo'q</p>
          </div>
        )}
      </div>
    </div>
  );
}
