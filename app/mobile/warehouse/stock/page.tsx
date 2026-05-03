'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Search, Package, Filter, X, ChevronDown, Building } from 'lucide-react';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileWarehouseStock() {
  const { error } = useNotification();
  const [stock, setStock] = useState<Record<string, unknown>[]>([]);
  const [summary, setSummary] = useState({ totalQuantity: 0, totalValue: 0 });
  const [warehouses, setWarehouses] = useState<Record<string, unknown>[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(data => setWarehouses(Array.isArray(data) ? data : data.data || []))
      .catch(() => { error('Xatolik', 'Omborlarni yuklashda xato'); });
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (selectedWarehouse) query.append('warehouseId', selectedWarehouse);

    fetch(`/api/stock?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setStock(data.data);
          setSummary(data.summary || { totalQuantity: 0, totalValue: 0 });
        } else if (Array.isArray(data)) {
          setStock(data);
        }
        setLoading(false);
      })
      .catch(() => { error('Xatolik', 'Qoldiq ma\'lumotlarini yuklashda xato'); setLoading(false); });
  }, [search, selectedWarehouse]);

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Ombor qoldiq" backHref="/mobile"
        rightAction={
          <button onClick={() => setShowFilters(!showFilters)} className="p-2.5 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 active:scale-95 transition-transform">
            <Filter size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
        }
      />

      {showFilters && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]" onClick={() => setShowFilters(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Filtrlar</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Ombor</label>
                <div className="relative">
                  <select value={selectedWarehouse} onChange={e => setSelectedWarehouse(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm appearance-none">
                    <option value="">Barcha omborlar</option>
                    {warehouses.map((w: Record<string, unknown>) => (
                      <option key={String(w.id)} value={String(w.id)}>{String(w.name)}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <button onClick={() => setShowFilters(false)} className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-transform">{`Qo'llash`}</button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 mt-2 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Package size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Jami miqdor</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{loading ? '...' : summary.totalQuantity.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Building size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Jami qiymat</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">${loading ? '...' : summary.totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Mahsulot nomi yoki SKU..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm text-slate-800 dark:text-white" />
        </div>

        {/* Stock List */}
        <div className="space-y-2">
          {loading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
          ) : stock.length > 0 ? stock.map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{String(item.productName || item.name || '-')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">SKU: {String(item.sku || '-')} • {String(item.warehouseName || '-')}</p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{String(item.quantity || '0')} dona</p>
                  <p className="text-[11px] text-slate-500">${String(item.value || item.totalValue || '0')}</p>
                </div>
              </div>
              {(Number(item.quantity) || 0) <= 5 && (Number(item.quantity) || 0) > 0 && (
                <div className="mt-2 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Kam qolgan!</span>
                </div>
              )}
              {(Number(item.quantity) || 0) === 0 && (
                <div className="mt-2 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400">Tugagan</span>
                </div>
              )}
            </div>
          )) : (
            <div className="text-center py-12 text-slate-400">
              <Package size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Mahsulot topilmadi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
