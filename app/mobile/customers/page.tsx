'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, Plus, Users, Phone, MapPin, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function MobileCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/customers?limit=100')
      .then(r => r.json())
      .then(data => {
        setCustomers(data.data || data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase()) ||
    (c.companyName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen pb-28">
      <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <Link href="/mobile" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Mijozlar</h1>
        </div>
        <Link href="/mobile/customers/add" className="p-2.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform">
          <Plus size={20} />
        </Link>
      </div>

      <div className="px-6 mb-5 mt-2">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Ism, telefon, kompaniya..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm text-slate-800 dark:text-white" />
        </div>
      </div>

      <div className="px-6 space-y-3">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : filtered.length > 0 ? (
          filtered.map(customer => (
            <div key={customer.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <UserCircle size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{customer.fullName}</div>
                  <div className="text-[11px] text-slate-400">{customer.companyName || 'Jismoniy shaxs'}</div>
                </div>
                <div className="text-right">
                  <div className={`text-[13px] font-black ${(customer.balanceUSD || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    ${Math.abs(customer.balanceUSD || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                {customer.phone && (
                  <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Phone size={10} /> {customer.phone}
                  </a>
                )}
                {customer.region && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin size={10} /> {customer.region}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Users size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mijoz topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}
