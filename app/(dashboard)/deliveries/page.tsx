'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Truck, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Filter, Route, User, Package } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';

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
  status: 'PREPARING' | 'LOADED' | 'IN_TRANSIT' | 'DELIVERED' | 'PARTIALLY_DELIVERED' | 'RETURNED' | 'CANCELLED';
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

export default function DeliveriesPage() {
  const { success, error } = useNotification();
  
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [optimizingRoute, setOptimizingRoute] = useState<string | null>(null);

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
    } catch (err) {
      error('Xatolik', 'Yetkazib berishlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const optimizeRoute = async (deliveryId: string) => {
    setOptimizingRoute(deliveryId);
    try {
      const res = await fetch('/api/deliveries/route-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId }),
      });

      if (res.ok) {
        const data = await res.json();
        success('Muvaffaqiyatli', `Marshrut optimallashtirildi: ${data.totalDistance?.toFixed(1)} km`);
        loadDeliveries();
      } else {
        error('Xatolik', 'Marshrut optimallashtirishda xatolik');
      }
    } finally {
      setOptimizingRoute(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-700 rounded-full flex items-center gap-1"><Clock size={12} /> Tayyorlanmoqda</span>;
      case 'LOADED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full flex items-center gap-1"><Package size={12} /> Yuklangan</span>;
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-1 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full flex items-center gap-1"><Truck size={12} /> Yo'lda</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Yetkazib berildi</span>;
      case 'PARTIALLY_DELIVERED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1"><AlertCircle size={12} /> Qisman yetkazildi</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-700 rounded-full flex items-center gap-1"><XCircle size={12} /> Qaytarildi</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-full flex items-center gap-1"><XCircle size={12} /> Bekor qilindi</span>;
      default:
        return null;
    }
  };

  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = !search || 
      d.docNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      d.driverName?.toLowerCase().includes(search.toLowerCase()) ||
      d.vehicleNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesWarehouse = warehouseFilter === 'all' || d.warehouseId === warehouseFilter;
    const matchesDateFrom = !dateFrom || new Date(d.date) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(d.date) <= new Date(dateTo);
    
    return matchesSearch && matchesStatus && matchesWarehouse && matchesDateFrom && matchesDateTo;
  });

  const uniqueWarehouses = Array.from(new Set(deliveries.map(d => d.warehouseId).filter(Boolean)));
  const warehouseMap = new Map(deliveries.filter(d => d.warehouseId).map(d => [d.warehouseId, d.warehouse?.name || '']));

  const inProgressCount = deliveries.filter(d => ['PREPARING', 'LOADED', 'IN_TRANSIT'].includes(d.status)).length;
  const deliveredToday = deliveries.filter(d => 
    d.status === 'DELIVERED' && 
    new Date(d.deliveredAt || d.date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Yetkazib berishlar</h1>
          <Link
            href="/deliveries/add"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
          >
            <Plus size={18} />
            Yangi yetkazib berish
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Truck size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jarayonda</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{inProgressCount}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bugun yetkazildi</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{deliveredToday}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Route size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami yetkazib berish</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{deliveries.length}</div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Yetkazib berish qidirish..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                  <Filter size={16} />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-4 gap-3">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="PREPARING">Tayyorlanmoqda</option>
                  <option value="LOADED">Yuklangan</option>
                  <option value="IN_TRANSIT">Yo'lda</option>
                  <option value="DELIVERED">Yetkazib berildi</option>
                  <option value="PARTIALLY_DELIVERED">Qisman</option>
                  <option value="RETURNED">Qaytarildi</option>
                  <option value="CANCELLED">Bekor qilindi</option>
                </select>
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
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Truck size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Yetkazib berishlar topilmadi</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDeliveries.map(delivery => (
                <div key={delivery.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {delivery.docNumber}
                        </h3>
                        {getStatusBadge(delivery.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-2">
                        {delivery.customer && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {delivery.customer.fullName}
                          </span>
                        )}
                        {delivery.warehouse && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {delivery.warehouse.name}
                            </span>
                          </>
                        )}
                      </div>
                      {delivery.address && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                          <MapPin size={12} />
                          {delivery.address}
                        </div>
                      )}
                      {delivery.driverName && (
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {delivery.driverName}
                          </span>
                          {delivery.vehicleNumber && (
                            <>
                              <span>•</span>
                              <span>{delivery.vehicleNumber}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {new Date(delivery.date).toLocaleDateString('uz-UZ')}
                      </div>
                      {delivery.totalWeight && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {delivery.totalWeight} kg
                        </div>
                      )}
                      {['PREPARING', 'LOADED'].includes(delivery.status) && (
                        <button
                          onClick={() => optimizeRoute(delivery.id)}
                          disabled={optimizingRoute === delivery.id}
                          className="mt-2 w-full px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <Route size={12} />
                          {optimizingRoute === delivery.id ? 'Optimallashtirilmoqda...' : 'Marshrut'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
