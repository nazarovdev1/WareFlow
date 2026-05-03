'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, Package, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import MobileHeader from '@/components/mobile/MobileHeader';

interface Batch {
  id: string;
  batchNumber: string;
  productId: string;
  product?: { name: string; sku?: string };
  warehouseId: string;
  warehouse?: { name: string };
  quantity: number;
  initialQty?: number;
  costPrice: number;
  manufactureDate?: string;
  expiryDate?: string;
  supplierId?: string;
  supplier?: { fullName: string };
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export default function MobileBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState('all');

  const loadBatches = async (filter?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const activeFilter = filter ?? expiryFilter;
      if (activeFilter === 'expiring') params.set('expiringSoon', 'true');
      if (activeFilter === 'active') params.set('isActive', 'true');

      const res = await fetch(`/api/product-batches?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBatches(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    loadBatches(expiryFilter);
  }, [expiryFilter]);

  const filteredBatches = batches.filter(b => {
    const matchesSearch = !search ||
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.warehouse?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return { label: 'Muddati o\u2019tgan', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' };
    if (daysUntilExpiry <= 30) return { label: '30 kundan kam', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
    if (daysUntilExpiry <= 90) return { label: '90 kundan kam', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return null;
  };

  const activeCount = batches.filter(b => b.isActive).length;
  const expiringCount = batches.filter(b => {
    const status = getExpiryStatus(b.expiryDate);
    return status !== null;
  }).length;

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Partiyalar"
        backHref="/mobile"
        rightAction={
          <Link href="/mobile/batches/add" className="p-2 rounded-xl bg-indigo-600 text-white active:scale-95 transition-transform">
            <Plus size={18} />
          </Link>
        }
      />

      <div className="px-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <Package size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jami</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{batches.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <Package size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faol</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{activeCount}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
              <AlertTriangle size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Muddati yaqin</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{expiringCount}</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Partiya qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl transition-colors ${showFilters ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <select
              value={expiryFilter}
              onChange={e => setExpiryFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            >
              <option value="all">Barcha partiyalar</option>
              <option value="active">Faol partiyalar</option>
              <option value="expiring">Muddati yaqinlashgan</option>
            </select>
          </div>
        )}

        {/* Batch Cards */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="animate-pulse text-sm">Yuklanmoqda...</div>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Partiyalar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBatches.map(batch => {
              const expiryStatus = getExpiryStatus(batch.expiryDate);
              return (
                <div
                  key={batch.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {batch.batchNumber}
                        </h3>
                        {!batch.isActive && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                            Nofaol
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {batch.product?.name || `Noma\u2019lum mahsulot`}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-slate-900 dark:text-white">{batch.quantity}</div>
                      <div className="text-[10px] text-slate-400">dona</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                    {batch.warehouse && (
                      <span className="truncate">{batch.warehouse.name}</span>
                    )}
                    {batch.costPrice > 0 && (
                      <>
                        <span>&bull;</span>
                        <span>{batch.costPrice.toLocaleString()} {`so\u2019m`}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {batch.manufactureDate && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar size={10} />
                        Ishlab chiqarilgan: {new Date(batch.manufactureDate).toLocaleDateString('uz-UZ')}
                      </span>
                    )}
                    {batch.expiryDate && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar size={10} />
                        Yaroqlilik: {new Date(batch.expiryDate).toLocaleDateString('uz-UZ')}
                      </span>
                    )}
                    {expiryStatus && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold ${expiryStatus.bg} ${expiryStatus.color} rounded-full`}>
                        {expiryStatus.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
