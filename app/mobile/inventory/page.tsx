'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Search, Package, Plus, Edit3 } from 'lucide-react';
import Link from 'next/link';

export default function MobileInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(data => {
        setProducts(data.data || data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader 
        title="Mahsulotlar" 
        backHref="/mobile" 
        rightAction={
          <Link href="/mobile/inventory/add" className="p-2.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform">
            <Plus size={20} />
          </Link>
        } 
      />

      <div className="px-6 mb-5 mt-2">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Mahsulot nomi yoki SKU..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm text-slate-800 dark:text-white" />
        </div>
      </div>

      <div className="px-6 space-y-3">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : filtered.length > 0 ? (
          filtered.map(product => (
            <div key={product.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-11 h-11 rounded-xl object-cover" />
                  ) : (
                    <Package size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{product.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{product.sku || 'SKU yo\'q'}</div>
                  {product.category && (
                    <div className="inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {product.category.name || product.category}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[13px] font-black text-slate-900 dark:text-white">${product.sellPrice || 0}</div>
                  <div className="text-[10px] text-slate-400">{product.unit?.name || 'dona'}</div>
                </div>
              </div>
              <div className="flex justify-end mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                <Link href={`/mobile/inventory/${product.id}/edit`}
                  className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-[11px] font-black active:scale-95 transition-transform bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-xl">
                  <Edit3 size={12} /> Tahrirlash
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Package size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mahsulot topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}