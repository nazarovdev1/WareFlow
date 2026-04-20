'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { ChevronLeft, ArrowRightLeft, Search, Plus, Minus, Trash2, MapPin, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileWarehouseAddPage() {
  const router = useRouter();
  const { success, error } = useNotification();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/warehouses').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([wData, pData]) => {
      const w = wData.data || wData || [];
      setWarehouses(w);
      setProducts(pData.data || pData || []);
    }).catch(() => {});
  }, []);

  const addToCart = (product: any) => {
    const existing = cartItems.find(i => i.productId === product.id);
    if (existing) {
      setCartItems(cartItems.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCartItems([...cartItems, { productId: product.id, productName: product.name, quantity: 1 }]);
    }
    setSearch('');
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async () => {
    if (!fromWarehouse || !toWarehouse) { error('Xatolik', 'Omborlar tanlanmagan'); return; }
    if (fromWarehouse === toWarehouse) { error('Xatolik', 'Bir xil ombor tanlangan'); return; }
    if (cartItems.length === 0) { error('Xatolik', 'Mahsulot tanlanmagan'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/warehouse-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromWarehouseId: fromWarehouse,
          toWarehouseId: toWarehouse,
          items: cartItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', "Ko'chirish amalga oshirildi");
        router.push('/mobile/warehouse');
      } else {
        error('Xatolik', "Ko'chirishda xatolik");
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full min-h-screen pb-48">
      <MobileHeader title="Yangi ko'chirish" backHref="/mobile/warehouse" />

      <div className="px-6 space-y-5 mt-4">
        {/* Warehouses */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MapPin size={12} /> Dan (ombor)
            </label>
            <select value={fromWarehouse} onChange={e => setFromWarehouse(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-800 dark:text-white">
              <option value="">Tanlang...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <ArrowRightLeft size={18} />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MapPin size={12} /> Ga (ombor)
            </label>
            <select value={toWarehouse} onChange={e => setToWarehouse(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-800 dark:text-white">
              <option value="">Tanlang...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        {/* Product Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Mahsulot qidirish..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-800 dark:text-white" />
          {search && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto p-2">
              {filtered.slice(0, 8).map(p => (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border-b border-slate-50 dark:border-slate-800 last:border-0 flex justify-between items-center">
                  <div className="text-[12px] font-bold text-slate-800 dark:text-white">{p.name}</div>
                  <Plus size={16} className="text-teal-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="space-y-3">
          <h2 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 px-1">Tanlangan</h2>
          {cartItems.length > 0 ? cartItems.map(item => (
            <div key={item.productId} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <div className="text-[12px] font-bold text-slate-800 dark:text-white truncate">{item.productName}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-700">
                  <button onClick={() => { if (item.quantity > 1) setCartItems(cartItems.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity - 1 } : i)); }}
                    className="p-1.5 text-slate-500"><Minus size={14} /></button>
                  <span className="w-6 text-center text-[12px] font-bold text-slate-800 dark:text-white">{item.quantity}</span>
                  <button onClick={() => setCartItems(cartItems.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i))}
                    className="p-1.5 text-slate-500"><Plus size={14} /></button>
                </div>
                <button onClick={() => setCartItems(cartItems.filter(i => i.productId !== item.productId))}
                  className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-lg active:scale-95 transition-transform">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mahsulot tanlanmagan</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-24 left-6 right-6 z-40">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 p-5 rounded-[32px] shadow-2xl">
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mahsulotlar</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">{cartItems.length} ta</span>
          </div>
          <button onClick={handleSubmit} disabled={submitting || cartItems.length === 0}
            className="w-full bg-teal-600 disabled:opacity-50 text-white font-black py-4 rounded-full shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 transition-all active:scale-95">
            {submitting ? 'Yuborilmoqda...' : <><Check size={18} /> Ko'chirishni yakunlash</>}
          </button>
        </div>
      </div>
    </div>
  );
}
