'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { ChevronLeft, Package, Tag, DollarSign, Check } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileEditProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { success, error } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', sku: '', categoryId: '', sellPrice: '', wholesalePrice: '', minPrice: '' });

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([product, cData]) => {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        categoryId: product.categoryId || product.category?.id || '',
        sellPrice: String(product.sellPrice || ''),
        wholesalePrice: String(product.wholesalePrice || ''),
        minPrice: String(product.minPrice || ''),
      });
      setCategories(cData.data || cData || []);
      setLoading(false);
    }).catch(() => { error('Xatolik', 'Mahsulot topilmadi'); setLoading(false); });
  }, [id]);

  const handleSubmit = async () => {
    if (!form.name.trim()) { error('Xatolik', 'Nom shart'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku || null,
          categoryId: form.categoryId || null,
          sellPrice: form.sellPrice ? Number(form.sellPrice) : 0,
          wholesalePrice: form.wholesalePrice ? Number(form.wholesalePrice) : 0,
          minPrice: form.minPrice ? Number(form.minPrice) : 0,
        }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Mahsulot yangilandi');
        router.push('/mobile/inventory');
      } else {
        error('Xatolik', 'Yangilashda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Tahrirlash" backHref="/mobile/inventory" />
        <div className="px-6 space-y-4 mt-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)}</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-28">
      <div className="px-6 pt-8 pb-4 flex items-center gap-3 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-40">
        <Link href="/mobile/inventory" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform">
          <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </Link>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Tahrirlash</h1>
      </div>

      <div className="px-6 space-y-4 mt-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Package size={12} /> Asosiy</h3>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Nomi *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5"><Tag size={12} /> SKU</label>
            <input type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
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

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><DollarSign size={12} /> Narxlar (UZS)</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1 block">Sotuv narxi</label>
              <input type="number" value={form.sellPrice} onChange={e => setForm({ ...form, sellPrice: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1 block">Ulgurji narx</label>
              <input type="number" value={form.wholesalePrice} onChange={e => setForm({ ...form, wholesalePrice: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1 block">Minimal narx</label>
              <input type="number" value={form.minPrice} onChange={e => setForm({ ...form, minPrice: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 bg-indigo-600 text-white font-black text-[13px] rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50">
          {submitting ? 'Saqlanmoqda...' : <><Check size={18} /> Saqlash</>}
        </button>
      </div>
    </div>
  );
}
