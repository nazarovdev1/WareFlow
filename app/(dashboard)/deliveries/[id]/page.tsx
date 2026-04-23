'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Package, MapPin, User, Truck, Calendar, CheckCircle, Route, Edit, X, Save } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';
import dynamic from 'next/dynamic';

const RouteMap = dynamic(() => import('@/components/maps/RouteMap').then(mod => ({ default: mod.RouteMap })), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />,
});

interface Delivery {
  id: string;
  docNumber: string;
  date: string;
  orderId?: string;
  order?: { docNumber: string };
  customerId?: string;
  customer?: { fullName: string; phone?: string; address?: string };
  warehouseId: string;
  warehouse?: { name: string; address?: string };
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
  route?: {
    id: string;
    totalDistance: number;
    estimatedTime?: number;
    optimizedOrder?: string;
    polyline?: string;
    stops?: DeliveryRouteStop[];
  };
}

interface DeliveryItem {
  id: string;
  productId: string;
  product?: { name: string; sku?: string };
  quantity: number;
  deliveredQty: number;
  notes?: string;
}

interface DeliveryRouteStop {
  id: string;
  stopOrder: number;
  customerId?: string;
  customer?: { fullName: string };
  address?: string;
  latitude?: number;
  longitude?: number;
  plannedAt?: string;
  arrivedAt?: string;
  status: string;
  notes?: string;
}

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useNotification();
  
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
    notes: '',
  });

  useEffect(() => {
    loadDelivery();
  }, [params.id]);

  const loadDelivery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/deliveries/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setDelivery(data);
        setFormData({
          driverName: data.driverName || '',
          driverPhone: data.driverPhone || '',
          vehicleNumber: data.vehicleNumber || '',
          notes: data.notes || '',
        });
      } else {
        error('Xatolik', 'Yetkazib berish topilmadi');
        router.push('/deliveries');
      }
    } catch (err) {
      error('Xatolik', 'Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const optimizeRoute = async () => {
    if (!delivery) return;
    setOptimizing(true);
    try {
      const res = await fetch('/api/deliveries/route-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId: delivery.id }),
      });

      if (res.ok) {
        const data = await res.json();
        success('Muvaffaqiyatli', `Marshrut optimallashtirildi: ${data.totalDistance?.toFixed(1)} km`);
        loadDelivery();
      } else {
        error('Xatolik', 'Marshrut optimallashtirishda xatolik');
      }
    } finally {
      setOptimizing(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!delivery) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/deliveries/${delivery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Holat yangilandi');
        loadDelivery();
      } else {
        error('Xatolik', 'Holatni yangilashda xatolik');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!delivery) return;
    try {
      const res = await fetch(`/api/deliveries/${delivery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Ma\'lumotlar yangilandi');
        setEditMode(false);
        loadDelivery();
      } else {
        error('Xatolik', 'Yangilashda xatolik');
      }
    } catch (err) {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">Tayyorlanmoqda</span>;
      case 'LOADED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">Yuklangan</span>;
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-1 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">Yo'lda</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full">Yetkazib berildi</span>;
      case 'PARTIALLY_DELIVERED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full">Qisman yetkazildi</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-700 rounded-full">Qaytarildi</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-full">Bekor qilindi</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen pb-6">
        <div className="px-6 py-12 text-center text-slate-400">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="w-full min-h-screen pb-6">
        <div className="px-6 py-12 text-center text-slate-400">Yetkazib berish topilmadi</div>
      </div>
    );
  }

  const totalQuantity = delivery.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const deliveredQuantity = delivery.items?.reduce((sum, item) => sum + item.deliveredQty, 0) || 0;

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/deliveries" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{delivery.docNumber}</h1>
          {getStatusBadge(delivery.status)}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami mahsulot</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{totalQuantity}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Yetkazib berildi</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{deliveredQuantity}</div>
          </div>

          {delivery.route && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Masofa</div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{delivery.route.totalDistance.toFixed(1)} km</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Asosiy ma'lumotlar
                </h2>
                {!editMode && delivery.status === 'PREPARING' && (
                  <button onClick={() => setEditMode(true)} className="p-1.5 text-slate-400 hover:text-indigo-600">
                    <Edit size={16} />
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Haydovchi ismi</label>
                    <input
                      type="text"
                      value={formData.driverName}
                      onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={formData.driverPhone}
                      onChange={e => setFormData({ ...formData, driverPhone: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Avtomobil raqami</label>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Izohlar</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm">Saqlash</button>
                    <button onClick={() => setEditMode(false)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl text-sm">Bekor</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-slate-400" />
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Haydovchi</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-white">{delivery.driverName || 'Belgilanmagan'}</div>
                    </div>
                  </div>
                  {delivery.driverPhone && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">{delivery.driverPhone}</div>
                  )}
                  {delivery.vehicleNumber && (
                    <div className="flex items-center gap-3">
                      <Truck size={16} className="text-slate-400" />
                      <div className="text-sm text-slate-600 dark:text-slate-400">{delivery.vehicleNumber}</div>
                    </div>
                  )}
                  {delivery.address && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-slate-400" />
                      <div className="text-sm text-slate-600 dark:text-slate-400">{delivery.address}</div>
                    </div>
                  )}
                  {delivery.notes && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-500 mb-1">Izohlar</div>
                      <div className="text-sm text-slate-800 dark:text-white">{delivery.notes}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Holatni o'zgartirish
              </h2>
              <div className="space-y-2">
                {delivery.status === 'PREPARING' && (
                  <button
                    onClick={() => updateStatus('LOADED')}
                    disabled={updatingStatus}
                    className="w-full px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Package size={16} />
                    Yuklash
                  </button>
                )}
                {delivery.status === 'LOADED' && (
                  <button
                    onClick={() => updateStatus('IN_TRANSIT')}
                    disabled={updatingStatus}
                    className="w-full px-4 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Truck size={16} />
                    Yo'lga chiqish
                  </button>
                )}
                {delivery.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => updateStatus('DELIVERED')}
                    disabled={updatingStatus}
                    className="w-full px-4 py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl text-sm hover:bg-emerald-200 dark:hover:bg-emerald-900/50 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Yetkazib berildi
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Mahsulotlar
                </h2>
                {delivery.status === 'PREPARING' && (
                  <button
                    onClick={optimizeRoute}
                    disabled={optimizing}
                    className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Route size={12} />
                    {optimizing ? 'Optimallashtirilmoqda...' : 'Marshrut'}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {delivery.items?.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-800 dark:text-white">{item.product?.name || 'Noma\'lum'}</div>
                      {item.product?.sku && (
                        <div className="text-xs text-slate-500">{item.product.sku}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-800 dark:text-white">{item.quantity}</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">{item.deliveredQty} yetkazildi</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {delivery.route && delivery.route.stops && delivery.warehouse && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Marshrut xaritasi
                </h2>
                {delivery.warehouse.latitude && delivery.warehouse.longitude ? (
                  <div className="mb-4">
                    <RouteMap
                      origin={{
                        latitude: delivery.warehouse.latitude,
                        longitude: delivery.warehouse.longitude,
                      }}
                      stops={delivery.route.stops
                        .filter(s => s.latitude && s.longitude)
                        .map(s => ({
                          latitude: s.latitude!,
                          longitude: s.longitude!,
                          customerName: s.customer?.fullName,
                          address: s.address,
                          stopOrder: s.stopOrder,
                        }))}
                      height="300px"
                    />
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-amber-700 dark:text-amber-300 text-sm">
                    Xarita ko'rsatish uchun ombor koordinatalari kiritilmagan.
                  </div>
                )}
                <div className="space-y-2">
                  {delivery.route.stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 dark:text-white">{stop.customer?.fullName || 'To\'xtash nuqtasi'}</div>
                        {stop.address && (
                          <div className="text-xs text-slate-500 truncate">{stop.address}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
