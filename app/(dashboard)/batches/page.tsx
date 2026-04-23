'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Package, AlertTriangle, Clock, CheckCircle, XCircle, Calendar, Filter, Warehouse, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';

interface Product {
  id: string;
  name: string;
  sku?: string;
}

interface Warehouse {
  id: string;
  name: string;
}

interface ProductBatch {
  id: string;
  batchNumber: string;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  initialQty: number;
  costPrice: number;
  manufactureDate?: string;
  expiryDate?: string;
  supplierId?: string;
  supplier?: { name: string };
  purchaseId?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BatchesPage() {
  const { success, error } = useNotification();
  
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'expiry' | 'quantity' | 'date'>('expiry');
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/product-batches');
      if (res.ok) {
        const data = await res.json();
        setBatches(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      error('Xatolik', 'Partiyalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return { status: 'safe', label: 'Muddat yo\'q', color: 'bg-slate-100 text-slate-600' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Muddati o\'tgan', color: 'bg-red-100 text-red-700' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'critical', label: `${daysUntilExpiry} kun qoldi`, color: 'bg-rose-100 text-rose-700' };
    } else if (daysUntilExpiry <= 60) {
      return { status: 'warning', label: `${daysUntilExpiry} kun qoldi`, color: 'bg-amber-100 text-amber-700' };
    } else if (daysUntilExpiry <= 90) {
      return { status: 'expiring', label: `${daysUntilExpiry} kun qoldi`, color: 'bg-yellow-100 text-yellow-700' };
    } else {
      return { status: 'safe', label: `${daysUntilExpiry} kun qoldi`, color: 'bg-emerald-100 text-emerald-700' };
    }
  };

  const filteredBatches = batches
    .filter(batch => {
      const matchesSearch = !search || 
        batch.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
        batch.product?.name.toLowerCase().includes(search.toLowerCase()) ||
        batch.product?.sku?.toLowerCase().includes(search.toLowerCase());
      const matchesWarehouse = warehouseFilter === 'all' || batch.warehouseId === warehouseFilter;
      const matchesStatus = statusFilter === 'all' || getExpiryStatus(batch.expiryDate).status === statusFilter;
      
      return matchesSearch && matchesWarehouse && matchesStatus && batch.isActive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'expiry':
          if (!a.expiryDate && !b.expiryDate) return 0;
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        case 'quantity':
          return a.quantity - b.quantity;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const expiredCount = batches.filter(b => getExpiryStatus(b.expiryDate).status === 'expired').length;
  const criticalCount = batches.filter(b => getExpiryStatus(b.expiryDate).status === 'critical').length;
  const warningCount = batches.filter(b => getExpiryStatus(b.expiryDate).status === 'warning').length;

  const uniqueWarehouses = Array.from(new Set(batches.map(b => b.warehouseId).filter(Boolean)));
  const warehouseMap = new Map(batches.filter(b => b.warehouseId).map(b => [b.warehouseId, b.warehouse?.name || '']));

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Partiyalar</h1>
          <Link
            href="/batches/add"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
          >
            <Plus size={18} />
            Yangi partiya
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                <XCircle size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Muddati o'tgan</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{expiredCount}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanqidiy (≤30 kun)</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{criticalCount}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                <Clock size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ogohlantirish (≤60 kun)</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{warningCount}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Xavfsiz</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {batches.filter(b => getExpiryStatus(b.expiryDate).status === 'safe').length}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Partiya, mahsulot yoki SKU qidirish..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                />
              </div>
              <select
                value={warehouseFilter}
                onChange={e => setWarehouseFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
              >
                <option value="all">Barcha omborlar</option>
                {uniqueWarehouses.map(id => (
                  <option key={id} value={id}>{warehouseMap.get(id) || id}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
              >
                <option value="all">Barcha holatlar</option>
                <option value="expired">Muddati o'tgan</option>
                <option value="critical">Tanqidiy (≤30 kun)</option>
                <option value="warning">Ogohlantirish (≤60 kun)</option>
                <option value="expiring">Yaqinlashmoqda (≤90 kun)</option>
                <option value="safe">Xavfsiz</option>
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'expiry' | 'quantity' | 'date')}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
              >
                <option value="expiry">Muddat bo'yicha</option>
                <option value="quantity">Miqdor bo'yicha</option>
                <option value="date">Sana bo'yicha</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <TrendingDown size={14} />
              <span>FIFO (Birinchi kiritilgan - birinchi chiqarilgan) tartibida saralanmoqda</span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Package size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Partiyalar topilmadi</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBatches.map(batch => {
                const expiryStatus = getExpiryStatus(batch.expiryDate);
                return (
                  <div key={batch.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {batch.product?.name || 'Noma\'lum mahsulot'}
                          </h3>
                          {batch.product?.sku && (
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded">
                              {batch.product.sku}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Warehouse size={12} />
                            {batch.warehouse?.name || 'Noma\'lum ombor'}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{batch.batchNumber}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {batch.expiryDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(batch.expiryDate).toLocaleDateString('uz-UZ')}
                            </span>
                          )}
                          {batch.supplier && (
                            <>
                              <span>•</span>
                              <span>{batch.supplier.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <div className="text-lg font-black text-slate-900 dark:text-white">
                            {batch.quantity.toLocaleString()}
                          </div>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${expiryStatus.color}`}>
                            {expiryStatus.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {batch.costPrice > 0 ? `$${batch.costPrice.toFixed(2)}` : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
