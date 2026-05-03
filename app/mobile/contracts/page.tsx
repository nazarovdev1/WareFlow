'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { FileText, Search } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileContractsList() {
  const { error } = useNotification();
  const [contracts, setContracts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/contracts')
      .then(r => r.json())
      .then(d => { setContracts(Array.isArray(d) ? d : d.data || []); setLoading(false); })
      .catch(() => { error('Xatolik', 'Shartnomalarni yuklashda xato'); setLoading(false); });
  }, []);

  const filtered = contracts.filter(c =>
    !search || String(c.title || c.contractNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    EXPIRED: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    PENDING: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    TERMINATED: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Faol',
    EXPIRED: 'Muddati o\'tgan',
    PENDING: 'Kutilmoqda',
    TERMINATED: 'Bekor qilingan',
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Shartnomalar" backHref="/mobile" />

      <div className="px-6 mt-2 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Shartnoma qidirish..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm text-slate-800 dark:text-white" />
        </div>

        <div className="space-y-2">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
          ) : filtered.length > 0 ? filtered.map((contract) => {
            const status = String(contract.status || 'PENDING');
            return (
              <Link key={String(contract.id)} href={`/mobile/contracts/${String(contract.id)}`}
                className="block bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{String(contract.title || contract.contractNumber || '-')}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{String(contract.contractNumber || '-')}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ml-2 ${statusColors[status] || statusColors.PENDING}`}>
                    {statusLabels[status] || status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">
                    {String(contract.startDate ? new Date(String(contract.startDate)).toLocaleDateString('uz') : '-')} — {String(contract.endDate ? new Date(String(contract.endDate)).toLocaleDateString('uz') : '-')}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">${Number(contract.amount || 0).toLocaleString()}</span>
                </div>
              </Link>
            );
          }) : (
            <div className="text-center py-12 text-slate-400">
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Shartnomalar topilmadi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
