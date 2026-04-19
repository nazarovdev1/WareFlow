'use client';

import { useState, useEffect } from 'react';
import { Search, ArrowDownRight, ChevronLeft, Eye, Calendar, Truck, X, AlertTriangle, Plus } from 'lucide-react';
import Link from 'next/link';

export default function MobilePurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch('/api/purchases?limit=50')
      .then(r => r.json())
      .then(data => {
        setPurchases(data.data || data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = purchases.filter(p =>
    p.docNumber?.toLowerCase().includes(search.toLowerCase()) ||
    (p.supplier?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleView = async (id: string) => {
    try {
      const res = await fetch(`/api/purchases/${id}`);
      if (res.ok) setSelectedPurchase(await res.json());
    } catch {}
  };

  const handleCancel = async () => {
    if (!selectedPurchase) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/purchases/${selectedPurchase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (res.ok) {
        setPurchases(prev => prev.map(p => p.id === selectedPurchase.id ? { ...p, status: 'CANCELLED' } : p));
        setSelectedPurchase({ ...selectedPurchase, status: 'CANCELLED' });
        setShowCancel(false);
      }
    } catch {}
    setCancelling(false);
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <Link href="/mobile" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Xaridlar</h1>
        </div>
        <Link href="/mobile/purchases/new" className="p-2.5 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform">
          <Plus size={20} />
        </Link>
      </div>

      <div className="px-6 mb-5">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Hujjat yoki ta'minotchi..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm text-slate-800 dark:text-white" />
        </div>
      </div>

      <div className="px-6 space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : filtered.length > 0 ? (
          filtered.map(purchase => (
            <div key={purchase.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <ArrowDownRight size={18} />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{purchase.docNumber || `XP-${purchase.id.slice(0, 6)}`}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar size={9} />
                      {new Date(purchase.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-slate-900 dark:text-white">${Number(purchase.totalAmount).toLocaleString()}</div>
                  <div className={`text-[9px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${
                    purchase.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                    purchase.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                    'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                  }`}>
                    {purchase.status === 'COMPLETED' ? 'Bajarilgan' : purchase.status === 'CANCELLED' ? 'Bekor' : 'Kutilmoqda'}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Truck size={11} className="text-slate-500" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                    {purchase.supplier?.name || "Ta'minotchisiz"}
                  </span>
                </div>
                <button onClick={() => handleView(purchase.id)}
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-black active:scale-95 transition-transform">
                  Ko'rish <Eye size={13} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
              <ArrowDownRight size={28} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Xaridlar topilmadi</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPurchase && !showCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center px-6" onClick={() => setSelectedPurchase(null)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedPurchase.docNumber || `XP-${selectedPurchase.id.slice(0, 6)}`}</h3>
                <p className="text-[11px] text-slate-400">{new Date(selectedPurchase.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className={`text-[10px] font-black px-3 py-1 rounded-full ${
                selectedPurchase.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                selectedPurchase.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                'bg-amber-50 text-amber-600'
              }`}>
                {selectedPurchase.status === 'COMPLETED' ? 'Bajarilgan' : selectedPurchase.status === 'CANCELLED' ? 'Bekor' : 'Kutilmoqda'}
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Ta'minotchi</span>
                <span className="text-[12px] font-bold text-slate-800 dark:text-white">{selectedPurchase.supplier?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Ombor</span>
                <span className="text-[12px] font-bold text-slate-800 dark:text-white">{selectedPurchase.warehouse?.name || '-'}</span>
              </div>
            </div>

            {selectedPurchase.items?.length > 0 && (
              <div className="mb-5">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">Mahsulotlar</h4>
                <div className="space-y-2">
                  {selectedPurchase.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div>
                        <div className="text-[12px] font-bold text-slate-800 dark:text-white">{item.product?.name || 'Mahsulot'}</div>
                        <div className="text-[10px] text-slate-400">{item.quantity} × ${item.price}</div>
                      </div>
                      <span className="text-[12px] font-black text-slate-800 dark:text-white">${Number(item.total).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center py-3 border-t border-slate-100 dark:border-slate-800 mb-5">
              <span className="text-sm font-black text-slate-800 dark:text-white">Jami</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">${Number(selectedPurchase.totalAmount).toLocaleString()}</span>
            </div>

            {selectedPurchase.status === 'COMPLETED' && (
              <button onClick={() => setShowCancel(true)}
                className="w-full py-3.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-[12px] rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <AlertTriangle size={16} /> Xaridni bekor qilish
              </button>
            )}
            <button onClick={() => setSelectedPurchase(null)}
              className="w-full py-3.5 mt-2 text-slate-400 font-bold text-[12px] rounded-2xl active:scale-[0.98] transition-transform">
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center px-6">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-rose-500" />
            </div>
            <h3 className="text-center text-lg font-black text-slate-900 dark:text-white mb-2">Bekor qilish</h3>
            <p className="text-center text-sm text-slate-500 mb-6">Xaridni bekor qilmoqchimisiz? Zaxira va balans tiklanadi.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[12px] rounded-2xl active:scale-95 transition-transform">Orqaga</button>
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 py-3 bg-rose-600 text-white font-black text-[12px] rounded-2xl active:scale-95 transition-transform disabled:opacity-50">
                {cancelling ? 'Bekor qilinmoqda...' : 'Bekor qilish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
