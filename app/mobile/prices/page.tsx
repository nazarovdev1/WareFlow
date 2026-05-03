'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';

export default function MobilePriceLists() {
  const { error } = useNotification();
  const [priceLists, setPriceLists] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/price-lists')
      .then(r => r.json())
      .then(d => { setPriceLists(Array.isArray(d) ? d : d.data || []); setLoading(false); })
      .catch(() => { error('Xatolik', 'Narx ro\'yxatini yuklashda xato'); setLoading(false); });
  }, []);

  const filtered = priceLists.filter(pl =>
    !search || String(pl.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Narx ro{'\u2019'}yxatlari" backHref="/mobile"
        rightAction={
          <Link href="/mobile/prices/add" className="p-2.5 bg-teal-600 text-white rounded-full shadow-lg shadow-teal-500/30 active:scale-95 transition-transform">
            <Plus size={20} />
          </Link>
        }
      />

      <div className="px-6 mt-2 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Narx ro\u2019yxatini qidirish..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm text-slate-800 dark:text-white" />
        </div>

        <div className="space-y-2">
          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
          ) : filtered.length > 0 ? filtered.map((pl) => (
            <Link key={String(pl.id)} href={`/mobile/prices/${String(pl.id)}`} className="block bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{String(pl.name || '-')}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-slate-500">{String(pl.itemCount || pl.items || 0)} mahsulot</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pl.isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
                      {pl.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            </Link>
          )) : (
            <div className="text-center py-12 text-slate-400">
              <DollarSign size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Narx ro\u2019yxatlari topilmadi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
