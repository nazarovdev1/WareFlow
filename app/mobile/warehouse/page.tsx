'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Search, ArrowRightLeft, Calendar, Eye, X } from 'lucide-react';
import Link from 'next/link';

export default function MobileWarehousePage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);

  useEffect(() => {
    fetch('/api/warehouse-transfers?limit=30')
      .then(r => r.json())
      .then(data => {
        setTransfers(data.data || data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = transfers.filter(t =>
    t.docNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen pb-28">
      <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <Link href="/mobile" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Ko'chirish</h1>
        </div>
        <Link href="/mobile/warehouse/add" className="p-2.5 bg-teal-600 text-white rounded-full shadow-lg shadow-teal-500/30 active:scale-95 transition-transform">
          <ArrowRightLeft size={20} />
        </Link>
      </div>

      <div className="px-6 mb-5 mt-2">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Hujjat raqami..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm text-slate-800 dark:text-white" />
        </div>
      </div>

      <div className="px-6 space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : filtered.length > 0 ? (
          filtered.map(transfer => (
            <div key={transfer.id} onClick={() => setSelectedTransfer(transfer)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <ArrowRightLeft size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{transfer.docNumber || `WT-${transfer.id.slice(0, 6)}`}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar size={9} />
                    {transfer.date ? new Date(transfer.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) : '-'}
                  </div>
                </div>
                <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  transfer.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                  transfer.status === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                  'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {transfer.status === 'COMPLETED' ? 'Bajarilgan' : transfer.status === 'PENDING' ? 'Kutilmoqda' : transfer.status}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {transfer.fromWarehouse?.name || '?'}
                </span>
                <span className="text-slate-300">→</span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {transfer.toWarehouse?.name || '?'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <ArrowRightLeft size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ko'chirishlar yo'q</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center px-6" onClick={() => setSelectedTransfer(null)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{selectedTransfer.docNumber || `WT-${selectedTransfer.id.slice(0, 6)}`}</h3>
            <p className="text-[11px] text-slate-400 mb-4">{selectedTransfer.date ? new Date(selectedTransfer.date).toLocaleDateString('uz-UZ') : '-'}</p>

            <div className="flex items-center gap-2 mb-5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{selectedTransfer.fromWarehouse?.name || '?'}</span>
              <span className="text-slate-400">→</span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{selectedTransfer.toWarehouse?.name || '?'}</span>
            </div>

            {selectedTransfer.items?.length > 0 && (
              <div className="space-y-2 mb-5">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Mahsulotlar</h4>
                {selectedTransfer.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[12px] font-bold text-slate-800 dark:text-white">{item.product?.name || 'Mahsulot'}</span>
                    <span className="text-[12px] font-black text-teal-600">{item.quantity} dona</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setSelectedTransfer(null)}
              className="w-full py-3.5 text-slate-400 font-bold text-[12px] rounded-2xl active:scale-[0.98] transition-transform">
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
