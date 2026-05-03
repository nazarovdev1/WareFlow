'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Sliders, Plus, ChevronDown } from 'lucide-react';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileStockAdjustment() {
  const { error } = useNotification();
  const [adjustments, setAdjustments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [warehouses, setWarehouses] = useState<Record<string, unknown>[]>([]);
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    warehouseId: '',
    productId: '',
    quantity: '',
    reason: '',
    type: 'INCREASE',
  });

  useEffect(() => {
    fetch('/api/inventory-adjustments')
      .then(r => r.json())
      .then(d => { setAdjustments(Array.isArray(d) ? d : d.data || []); setLoading(false); })
      .catch(() => { error('Xatolik', 'Tahrirlashlar ro\'yxatini yuklashda xato'); setLoading(false); });
    fetch('/api/warehouses')
      .then(r => r.json())
      .then(d => setWarehouses(Array.isArray(d) ? d : d.data || []))
      .catch(() => { error('Xatolik', 'Omborlarni yuklashda xato'); });
    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : d.data || []))
      .catch(() => { error('Xatolik', 'Mahsulotlarni yuklashda xato'); });
  }, []);

  const handleCreate = async () => {
    if (!form.warehouseId || !form.productId || !form.quantity) return;
    setSaving(true);
    try {
      const res = await fetch('/api/inventory-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId: form.warehouseId,
          productId: form.productId,
          quantity: Number(form.quantity),
          reason: form.reason,
          type: form.type,
        }),
      });
      if (res.ok) {
        const newAdj = await res.json();
        setAdjustments([newAdj, ...adjustments]);
        setShowNew(false);
        setForm({ warehouseId: '', productId: '', quantity: '', reason: '', type: 'INCREASE' });
      }
    } catch {}
    setSaving(false);
  };

  const typeColors: Record<string, string> = {
    INCREASE: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    DECREASE: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  };

  const typeLabels: Record<string, string> = {
    INCREASE: '+ Oshirish',
    DECREASE: '- Kamaytirish',
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Korrektirovka" backHref="/mobile"
        rightAction={
          <button onClick={() => setShowNew(true)} className="p-2.5 bg-teal-600 text-white rounded-full shadow-lg shadow-teal-500/30 active:scale-95 transition-transform">
            <Plus size={20} />
          </button>
        }
      />

      {/* New Adjustment Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]" onClick={() => setShowNew(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-w-md mx-auto max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Yangi korrektirovka</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Turi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setForm({ ...form, type: 'INCREASE' })}
                    className={`py-3 rounded-xl text-sm font-bold transition-all ${form.type === 'INCREASE' ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    + Oshirish
                  </button>
                  <button onClick={() => setForm({ ...form, type: 'DECREASE' })}
                    className={`py-3 rounded-xl text-sm font-bold transition-all ${form.type === 'DECREASE' ? 'bg-red-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    - Kamaytirish
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Ombor</label>
                <div className="relative">
                  <select value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm appearance-none">
                    <option value="">Tanlang...</option>
                    {warehouses.map((w: Record<string, unknown>) => (
                      <option key={String(w.id)} value={String(w.id)}>{String(w.name)}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Mahsulot</label>
                <div className="relative">
                  <select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm appearance-none">
                    <option value="">Tanlang...</option>
                    {products.map((p: Record<string, unknown>) => (
                      <option key={String(p.id)} value={String(p.id)}>{String(p.name)}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Miqdor</label>
                <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                  placeholder="Miqdorni kiriting"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Sabab</label>
                <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="Korrektirovka sababini yozing..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowNew(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm">Bekor</button>
                <button onClick={handleCreate} disabled={saving || !form.warehouseId || !form.productId || !form.quantity}
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-transform disabled:opacity-50">
                  {saving ? 'Saqlanmoq...' : 'Saqlash'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 mt-2 space-y-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : adjustments.length > 0 ? adjustments.map((adj) => {
          const adjType = String(adj.type || 'INCREASE');
          return (
            <div key={String(adj.id)} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{String(adj.productName || adj.productId || '-')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{String(adj.warehouseName || adj.warehouseId || '-')}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${typeColors[adjType] || typeColors.INCREASE}`}>
                  {typeLabels[adjType] || adjType}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {adjType === 'INCREASE' ? '+' : '-'}{String(adj.quantity || '0')} dona
                </span>
                <span className="text-[11px] text-slate-500">
                  {String(adj.createdAt ? new Date(String(adj.createdAt)).toLocaleDateString('uz') : '-')}
                </span>
              </div>
              {adj.reason ? (
                <p className="text-[11px] text-slate-500 mt-2 italic">{String(adj.reason)}</p>
              ) : null}
            </div>
          );
        }) : (
          <div className="text-center py-16 text-slate-400">
            <Sliders size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Korrektirovkalar yo{'\u2019'}q</p>
            <p className="text-xs mt-1">Yangi korrektirovka yaratish uchun + tugmasini bosing</p>
          </div>
        )}
      </div>
    </div>
  );
}
