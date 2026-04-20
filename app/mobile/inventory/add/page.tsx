'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Package, Tag, Barcode, DollarSign, MapPin, Check, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileAddProductPage() {
  const router = useRouter();
  const { success, error } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', sku: '', categoryId: '', barcode: '', barcodeType: 'EAN13',
    sellPrice: '', wholesalePrice: '', minPrice: '',
    warehouseId: '', quantity: '', costPrice: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
    ]).then(([cData, wData]) => {
      setCategories(cData.data || cData || []);
      const w = wData.data || wData || [];
      setWarehouses(w);
      if (w.length > 0) setForm(prev => ({ ...prev, warehouseId: w[0].id }));
    }).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) { error('Xatolik', 'Mahsulot nomi shart'); return; }
    setSubmitting(true);
    try {
      const body: any = {
        name: form.name,
        sku: form.sku || undefined,
        categoryId: form.categoryId || undefined,
        barcode: form.barcode || undefined,
        barcodeType: form.barcodeType,
        sellPrice: form.sellPrice ? Number(form.sellPrice) : 0,
        wholesalePrice: form.wholesalePrice ? Number(form.wholesalePrice) : 0,
        minPrice: form.minPrice ? Number(form.minPrice) : 0,
        unitId: undefined,
      };
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const product = await res.json();
        if (form.warehouseId && form.quantity && Number(form.quantity) > 0) {
          await fetch('/api/stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: product.id,
              warehouseId: form.warehouseId,
              quantity: Number(form.quantity),
              costPrice: form.costPrice ? Number(form.costPrice) : 0,
            }),
          });
        }
        success('Muvaffaqiyatli', "Mahsulot qo'shildi");
        router.push('/mobile/inventory');
      } else {
        error('Xatolik', "Qo'shishda xatolik");
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <div className="px-6 pt-8 pb-4 flex items-center gap-3 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-40">
        <Link href="/mobile/inventory" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform">
          <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </Link>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Yangi mahsulot</h1>
      </div>

      <div className="px-6 space-y-4 mt-4">
        {/* Basic Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Package size={12} /> Asosiy ma'lumotlar
          </h3>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Nomi *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Mahsulot nomi"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Tag size={12} /> SKU
            </label>
            <input type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
              placeholder="SKU kod"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Kategoriya</label>
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white">
              <option value="">Tanlang...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <DollarSign size={12} /> Narxlar (UZS)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1 block">Sotuv narxi</label>
              <input type="number" value={form.sellPrice} onChange={e => setForm({ ...form, sellPrice: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1 block">Ulgorgi narx</label>
              <input type="number" value={form.wholesalePrice} onChange={e => setForm({ ...form, wholesalePrice: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Initial Stock */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <MapPin size={12} /> Boshlang'ich zaxira
          </h3>
          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-1 block">Ombor</label>
            <select value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white">
              <option value="">Tanlang...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1 block">Miqdor</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1 block">Tan narxi</label>
              <input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 bg-indigo-600 text-white font-black text-[13px] rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50">
          {submitting ? 'Yuborilmoqda...' : <><Check size={18} /> Mahsulotni qo'shish</>}
        </button>
      </div>
    </div>
  );
}
