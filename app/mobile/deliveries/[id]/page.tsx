'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, MapPin, User, Truck, CheckCircle, Route, Edit, Save, X } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useNotification } from '@/lib/NotificationContext';
import dynamic from 'next/dynamic';

const RouteMap = dynamic(() => import('@/components/maps/RouteMap').then(mod => ({ default: mod.RouteMap })), {
  ssr: false,
  loading: () => <div className="h-[200px] bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />,
});

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

interface Delivery {
  id: string;
  docNumber: string;
  date: string;
  orderId?: string;
  order?: { docNumber: string };
  customerId?: string;
  customer?: { fullName: string; phone?: string; address?: string };
  warehouseId: string;
  warehouse?: { name: string; address?: string; latitude?: number; longitude?: number };
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
  route?: {
    id: string;
    totalDistance: number;
    estimatedTime?: number;
    optimizedOrder?: string;
    polyline?: string;
    stops?: DeliveryRouteStop[];
  };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PREPARING: { label: 'Tayyorlanmoqda', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  LOADED: { label: 'Yuklangan', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  IN_TRANSIT: { label: `Yo\u2019lda`, color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  DELIVERED: { label: 'Yetkazib berildi', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  PARTIALLY_DELIVERED: { label: 'Qisman yetkazildi', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  RETURNED: { label: 'Qaytarildi', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  CANCELLED: { label: 'Bekor qilindi', color: 'text-slate-700 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/30' },
};

export default function MobileDeliveryDetailPage() {
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
        router.push('/mobile/deliveries');
      }
    } catch {
      error('Xatolik', `Ma\u2019lumotlarni yuklashda xatolik`);
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
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
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
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
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
        success('Muvaffaqiyatli', `Ma\u2019lumotlar yangilandi`);
        setEditMode(false);
        loadDelivery();
      } else {
        error('Xatolik', 'Yangilashda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Yetkazib berish" backHref="/mobile/deliveries" />
        <div className="px-4 py-12 text-center text-slate-400">
          <div className="animate-pulse text-sm">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Yetkazib berish" backHref="/mobile/deliveries" />
        <div className="px-4 py-12 text-center text-slate-400">Topilmadi</div>
      </div>
    );
  }

  const cfg = statusConfig[delivery.status] || statusConfig.PREPARING;
  const totalQuantity = delivery.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const deliveredQuantity = delivery.items?.reduce((sum, item) => sum + item.deliveredQty, 0) || 0;

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title={delivery.docNumber}
        backHref="/mobile/deliveries"
        rightAction={
          !editMode && delivery.status === 'PREPARING' ? (
            <button onClick={() => setEditMode(true)} className="p-2 text-slate-400">
              <Edit size={18} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-bold ${cfg.bg} ${cfg.color} rounded-full`}>
            {cfg.label}
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {new Date(delivery.date).toLocaleDateString('uz-UZ')}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{totalQuantity}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Yetkazildi</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{deliveredQuantity}</div>
          </div>
          {delivery.route && (
            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Masofa</div>
              <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{delivery.route.totalDistance.toFixed(1)} km</div>
            </div>
          )}
        </div>

        {/* Driver Info */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">{`Haydovchi ma\u2019lumotlari`}</h3>
          {editMode ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Haydovchi ismi</label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Telefon</label>
                <input
                  type="tel"
                  value={formData.driverPhone}
                  onChange={e => setFormData({ ...formData, driverPhone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Avtomobil raqami</label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Izohlar</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform">
                  <Save size={14} /> Saqlash
                </button>
                <button onClick={() => setEditMode(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1">
                  <X size={14} /> Bekor
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span className="text-sm text-slate-800 dark:text-white">{delivery.driverName || 'Belgilanmagan'}</span>
              </div>
              {delivery.driverPhone && (
                <div className="text-sm text-slate-600 dark:text-slate-400 ml-6">{delivery.driverPhone}</div>
              )}
              {delivery.vehicleNumber && (
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{delivery.vehicleNumber}</span>
                </div>
              )}
              {delivery.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{delivery.address}</span>
                </div>
              )}
              {delivery.notes && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 mb-1">Izohlar</div>
                  <div className="text-sm text-slate-800 dark:text-white">{delivery.notes}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Update */}
        {!editMode && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">{`Holatni o\u2019zgartirish`}</h3>
            <div className="space-y-2">
              {delivery.status === 'PREPARING' && (
                <button
                  onClick={() => updateStatus('LOADED')}
                  disabled={updatingStatus}
                  className="w-full py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  <Package size={16} /> Yuklash
                </button>
              )}
              {delivery.status === 'LOADED' && (
                <button
                  onClick={() => updateStatus('IN_TRANSIT')}
                  disabled={updatingStatus}
                  className="w-full py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  <Truck size={16} /> {`Yo\u2019lga chiqish`}
                </button>
              )}
              {delivery.status === 'IN_TRANSIT' && (
                <button
                  onClick={() => updateStatus('DELIVERED')}
                  disabled={updatingStatus}
                  className="w-full py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  <CheckCircle size={16} /> Yetkazib berildi
                </button>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Mahsulotlar</h3>
            {delivery.status === 'PREPARING' && (
              <button
                onClick={optimizeRoute}
                disabled={optimizing}
                className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1"
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
                  <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.product?.name || `Noma\u2019lum`}</div>
                  {item.product?.sku && <div className="text-xs text-slate-500">{item.product.sku}</div>}
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm font-bold text-slate-800 dark:text-white">{item.quantity}</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">{item.deliveredQty} yetkazildi</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Map */}
        {delivery.route && delivery.route.stops && delivery.warehouse && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Marshrut xaritasi</h3>
            {(delivery.warehouse as Record<string, unknown>).latitude &&
            (delivery.warehouse as Record<string, unknown>).longitude ? (
              <div className="mb-3 rounded-xl overflow-hidden">
                <RouteMap
                  origin={{
                    latitude: Number((delivery.warehouse as Record<string, unknown>).latitude),
                    longitude: Number((delivery.warehouse as Record<string, unknown>).longitude),
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
                  height="200px"
                />
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-amber-700 dark:text-amber-300 text-xs mb-3">
                {`Xarita ko\u2019rsatish uchun ombor koordinatalari kiritilmagan.`}
              </div>
            )}
            <div className="space-y-2">
              {delivery.route.stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{stop.customer?.fullName || `To\u2019xtash nuqtasi`}</div>
                    {stop.address && <div className="text-xs text-slate-500 truncate">{stop.address}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
