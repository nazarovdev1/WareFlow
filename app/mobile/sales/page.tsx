'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Eye, Filter, Calendar, Users, TrendingUp, DollarSign, BarChart3, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import MobileHeader from '@/components/mobile/MobileHeader';

export default function MobileSalesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'list' | 'analytics'>('list');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetch('/api/orders?limit=50')
      .then(r => r.json())
      .then(data => {
        setOrders(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'analytics') {
      fetch('/api/dashboard/stats?period=month')
        .then(r => r.json())
        .then(d => setAnalytics(d))
        .catch(() => {});
    }
  }, [tab]);

  const filteredOrders = orders.filter(o =>
    o.docNumber?.toLowerCase().includes(search.toLowerCase()) ||
    (o.customer?.fullName || '').toLowerCase().includes(search.toLowerCase())
  );

  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((s, o) => s + (Number(o.finalAmount) || 0), 0);
  const avgCheck = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  const handleViewOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
      }
    } catch {}
  };

  const handleCancel = async () => {
    if (!selectedOrder) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'CANCELLED' } : o));
        setSelectedOrder({ ...selectedOrder, status: 'CANCELLED' });
        setShowCancel(false);
      }
    } catch {}
    setCancelling(false);
  };

  return (
    <div className="w-full min-h-screen pb-28">
      {/* Header */}
      <MobileHeader 
        title="Savdolar" 
        backHref="/mobile" 
        rightAction={
          <Link href="/mobile/sales/new" className="p-2.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform">
            <Plus size={20} />
          </Link>
        } 
      />

      {/* Tabs */}
      <div className="px-6 mb-5">
        <div className="flex gap-2">
          <button onClick={() => setTab('list')}
            className={`flex-1 py-2.5 text-[12px] font-black rounded-2xl transition-all ${tab === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200/60 dark:border-slate-800'}`}>
            Ro'yxat
          </button>
          <button onClick={() => setTab('analytics')}
            className={`flex-1 py-2.5 text-[12px] font-black rounded-2xl transition-all ${tab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200/60 dark:border-slate-800'}`}>
            <span className="flex items-center justify-center gap-1"><BarChart3 size={14} /> Tahlil</span>
          </button>
        </div>
      </div>

      {tab === 'list' && (
        <>
          {/* Search */}
          <div className="px-6 mb-5 flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Hujjat yoki mijoz..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm text-slate-800 dark:text-white" />
            </div>
          </div>

          {/* Order List */}
          <div className="px-6 space-y-3">
            {loading ? (
              Array(5).fill(0).map((_, i) => <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <div key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <ShoppingCart size={18} />
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{order.docNumber}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar size={9} />
                          {new Date(order.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-slate-900 dark:text-white">${Number(order.finalAmount).toLocaleString()}</div>
                      <div className={`text-[9px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${
                        order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                        'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Muvaffaqiyatli' : order.status === 'CANCELLED' ? 'Bekor' : 'Qaytarilgan'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users size={11} className="text-slate-500" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                        {order.customer?.fullName || 'Mijozsiz'}
                      </span>
                    </div>
                    <button onClick={() => handleViewOrder(order.id)}
                      className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-[11px] font-black active:scale-95 transition-transform">
                      Ko'rish <Eye size={13} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <ShoppingCart size={28} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Savdolar topilmadi</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'analytics' && (
        <div className="px-6 space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-slate-900 dark:text-white">
              <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Jami savdo</div>
              <div className="text-lg font-black">{completedOrders.length}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-slate-900 dark:text-white">
              <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Tushum</div>
              <div className="text-lg font-black">${totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-slate-900 dark:text-white">
              <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">O'rtacha</div>
              <div className="text-lg font-black">${Math.round(avgCheck).toLocaleString()}</div>
            </div>
          </div>

          {/* Top Products */}
          {analytics?.topProducts?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
              <h3 className="text-[12px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-500" /> Top mahsulotlar
              </h3>
              <div className="space-y-3">
                {analytics.topProducts.slice(0, 5).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${i < 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                        {i + 1}
                      </span>
                      <span className="text-[12px] font-bold text-slate-800 dark:text-white truncate max-w-[140px]">{p.name}</span>
                    </div>
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">${p.totalRevenue?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Customers */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
            <h3 className="text-[12px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
              <Users size={14} className="text-indigo-500" /> Top mijozlar
            </h3>
            <div className="space-y-3">
              {(() => {
                const customerMap = new Map<string, { name: string; total: number; count: number }>();
                completedOrders.forEach(o => {
                  const name = o.customer?.fullName || "Noma'lum";
                  const existing = customerMap.get(name);
                  if (existing) { existing.total += Number(o.finalAmount) || 0; existing.count++; }
                  else customerMap.set(name, { name, total: Number(o.finalAmount) || 0, count: 1 });
                });
                return Array.from(customerMap.values()).sort((a, b) => b.total - a.total).slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black bg-slate-100 text-slate-500 dark:bg-slate-800">{i + 1}</span>
                      <div>
                        <div className="text-[12px] font-bold text-slate-800 dark:text-white">{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.count} ta buyurtma</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">${c.total.toLocaleString()}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && !showCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center px-6" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedOrder.docNumber}</h3>
                <p className="text-[11px] text-slate-400">{new Date(selectedOrder.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className={`text-[10px] font-black px-3 py-1 rounded-full ${
                selectedOrder.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                selectedOrder.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                'bg-amber-50 text-amber-600'
              }`}>
                {selectedOrder.status === 'COMPLETED' ? 'Muvaffaqiyatli' : selectedOrder.status === 'CANCELLED' ? 'Bekor qilingan' : 'Qaytarilgan'}
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Mijoz</span>
                <span className="text-[12px] font-bold text-slate-800 dark:text-white">{selectedOrder.customer?.fullName || 'Mijozsiz'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Ombor</span>
                <span className="text-[12px] font-bold text-slate-800 dark:text-white">{selectedOrder.warehouse?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">To'lov</span>
                <span className="text-[12px] font-bold text-slate-800 dark:text-white">{selectedOrder.paymentMethod === 'CASH' ? 'Naqd' : selectedOrder.paymentMethod === 'CARD' ? 'Karta' : 'O\'tkazma'}</span>
              </div>
            </div>

            {/* Items */}
            {selectedOrder.items?.length > 0 && (
              <div className="mb-5">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">Mahsulotlar</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div>
                        <div className="text-[12px] font-bold text-slate-800 dark:text-white">{item.product?.name || 'Mahsulot'}</div>
                        <div className="text-[10px] text-slate-400">{item.quantity} × ${item.price}</div>
                      </div>
                      <span className="text-[12px] font-black text-slate-800 dark:text-white">${Number(item.total).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center py-3 border-t border-slate-100 dark:border-slate-800 mb-5">
              <span className="text-sm font-black text-slate-800 dark:text-white">Jami</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">${Number(selectedOrder.finalAmount).toLocaleString()}</span>
            </div>

            {selectedOrder.status === 'COMPLETED' && (
              <button onClick={() => setShowCancel(true)}
                className="w-full py-3.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-[12px] rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <AlertTriangle size={16} /> Buyurtmani bekor qilish
              </button>
            )}
            <button onClick={() => setSelectedOrder(null)}
              className="w-full py-3.5 mt-2 text-slate-400 font-bold text-[12px] rounded-2xl active:scale-[0.98] transition-transform">
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center px-6">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-rose-500" />
            </div>
            <h3 className="text-center text-lg font-black text-slate-900 dark:text-white mb-2">Bekor qilish</h3>
            <p className="text-center text-sm text-slate-500 mb-6">{selectedOrder?.docNumber} buyurtmasini bekor qilmoqchimisiz? Zaxira va balans tiklanadi.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[12px] rounded-2xl active:scale-95 transition-transform">
                Orqaga
              </button>
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 py-3 bg-rose-600 text-white font-black text-[12px] rounded-2xl active:scale-95 transition-transform disabled:opacity-50">
                {cancelling ? 'Bekor qilinmoqda...' : 'Bekor qilish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}