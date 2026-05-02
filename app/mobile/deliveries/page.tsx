'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Truck, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Filter, Route, User, Package, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import MobileHeader from '@/components/mobile/MobileHeader';

interface Delivery {
  id: string;
  docNumber: string;
  date: string;
  orderId?: string;
  order?: { docNumber: string };
  customerId?: string;
  customer?: { fullName: string; phone?: string };
  warehouseId: string;
  warehouse?: { name: string };
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  status: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  totalWeight?: number;
  deliveredAt?: string;
  items?: DeliveryItem[];
  createdAt: string;
  updatedAt: string;
}

interface DeliveryItem {
  id: string;
  productId: string;
  product?: { name: string; sku?: string };
  quantity: number;
  deliveredQty: number;
  notes?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: LucideIcon }> = {
  PREPARING: { label: 'Tayyorlanmoqda', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
  LOADED: { label: 'Yuklangan', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: Package },
  IN_TRANSIT: { label: `Yo\u2019lda`, color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: Truck },
  DELIVERED: { label: 'Yetkazib berildi', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle },
  PARTIALLY_DELIVERED: { label: 'Qisman yetkazildi', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: AlertCircle },
  RETURNED: { label: 'Qaytarildi', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30', icon: XCircle },
  CANCELLED: { label: 'Bekor qilindi', color: 'text-slate-700 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/30', icon: XCircle },
};

export default function MobileDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/deliveries');
      if (res.ok) {
        const data = await res.json();
        setDeliveries(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = !search ||
      d.docNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      d.driverName?.toLowerCase().includes(search.toLowerCase()) ||
      d.vehicleNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inProgressCount = deliveries.filter(d => ['PREPARING', 'LOADED', 'IN_TRANSIT'].includes(d.status)).length;
  const deliveredToday = deliveries.filter(d =>
    d.status === 'DELIVERED' &&
    new Date(d.deliveredAt || d.date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Yetkazib berishlar"
        backHref="/mobile"
        rightAction={
          <Link href="/mobile/deliveries/add" className="p-2 rounded-xl bg-indigo-600 text-white active:scale-95 transition-transform">
            <Plus size={18} />
          </Link>
        }
      />

      <div className="px-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <Truck size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jarayonda</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{inProgressCount}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bugun</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{deliveredToday}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center text-violet-600 dark:text-violet-400 mb-2">
              <Route size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jami</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{deliveries.length}</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Qidirish..."
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
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            >
              <option value="all">Barcha holatlar</option>
              <option value="PREPARING">Tayyorlanmoqda</option>
              <option value="LOADED">Yuklangan</option>
              <option value="IN_TRANSIT">{`Yo\u2019lda`}</option>
              <option value="DELIVERED">Yetkazib berildi</option>
              <option value="PARTIALLY_DELIVERED">Qisman</option>
              <option value="RETURNED">Qaytarildi</option>
              <option value="CANCELLED">Bekor qilindi</option>
            </select>
          </div>
        )}

        {/* Delivery Cards */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="animate-pulse text-sm">Yuklanmoqda...</div>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Truck size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Yetkazib berishlar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDeliveries.map(delivery => {
              const cfg = statusConfig[delivery.status] || statusConfig.PREPARING;
              const StatusIcon = cfg.icon;
              return (
                <Link
                  key={delivery.id}
                  href={`/mobile/deliveries/${delivery.id}`}
                  className="block bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {delivery.docNumber}
                        </h3>
                        <span className={`px-2 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.color} rounded-full flex items-center gap-1 shrink-0`}>
                          <StatusIcon size={10} />
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                      {new Date(delivery.date).toLocaleDateString('uz-UZ')}
                    </div>
                  </div>

                  {delivery.customer && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <User size={12} />
                      <span className="truncate">{delivery.customer.fullName}</span>
                    </div>
                  )}

                  {delivery.address && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <MapPin size={12} />
                      <span className="truncate">{delivery.address}</span>
                    </div>
                  )}

                  {delivery.driverName && (
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Truck size={12} />
                        {delivery.driverName}
                      </span>
                      {delivery.vehicleNumber && (
                        <span>{delivery.vehicleNumber}</span>
                      )}
                    </div>
                  )}

                  {delivery.totalWeight && (
                    <div className="text-xs text-slate-500 mt-1">
                      {delivery.totalWeight} kg
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
