'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Search, ShoppingCart, User, MapPin, CreditCard, Tag, Package, Eye, X, FileText, Download, TrendingUp, Users, DollarSign, BarChart3, ArrowUpDown, Printer } from 'lucide-react';
import { InvoicePrintButton } from '@/components/InvoiceTemplate';
import { useNotification } from '@/lib/NotificationContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type Tab = 'new' | 'list' | 'analytics';

export default function SalesPage() {
  const { success, error } = useNotification();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('new');

  // ─── NEW SALE STATE ────────────────────────────────
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchProducts, setSearchProducts] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ─── LIST STATE ───────────────────────────────────
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [returnReason, setReturnReason] = useState('');

  // ─── ANALYTICS STATE ──────────────────────────────
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');

  // Fetch data for new sale
  useEffect(() => {
    if (activeTab === 'new') {
      Promise.all([
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/warehouses').then(r => r.json()),
        fetch('/api/products').then(r => r.json())
      ]).then(([cData, wData, pData]) => {
        setCustomers(Array.isArray(cData) ? cData : cData.data || []);
        setWarehouses(Array.isArray(wData) ? wData : wData.data || []);
        setProducts(Array.isArray(pData) ? pData : pData.data || []);
      }).catch(console.error);
    }
  }, [activeTab]);

  // Fetch orders list
  const fetchOrders = useCallback((page = 1) => {
    setOrdersLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (filterSearch) params.append('search', filterSearch);
    if (filterStatus) params.append('status', filterStatus);
    if (filterWarehouse) params.append('warehouseId', filterWarehouse);

    fetch(`/api/orders?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setOrders(data.data || []);
        setOrdersTotal(data.pagination?.total || 0);
        setOrdersPage(page);
      })
      .catch(console.error)
      .finally(() => setOrdersLoading(false));
  }, [filterSearch, filterStatus, filterWarehouse]);

  useEffect(() => {
    if (activeTab === 'list') fetchOrders(1);
  }, [activeTab, filterSearch, filterStatus, filterWarehouse, fetchOrders]);

  // Fetch analytics
  useEffect(() => {
    if (activeTab === 'analytics') {
      setAnalyticsLoading(true);
      fetch(`/api/dashboard/stats?period=${analyticsPeriod}`)
        .then(r => r.json())
        .then(data => setAnalytics(data))
        .catch(console.error)
        .finally(() => setAnalyticsLoading(false));
    }
  }, [activeTab, analyticsPeriod]);

  // Fetch order detail
  const fetchOrderDetail = async (orderId: string) => {
    setOrderDetailLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const order = await res.json();
        setSelectedOrder(order);
      } else {
        error('Buyurtma ma\'lumotlarini olishda xatolik');
      }
    } catch (err) {
      console.error('Order detail error:', err);
      error('Buyurtma ma\'lumotlarini olishda xatolik');
    } finally {
      setOrderDetailLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProducts.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchProducts.toLowerCase()))
  );

  // Add to cart
  const addToCart = (product: any) => {
    const existing = cartItems.find(item => item.productId === product.id);
    if (existing) {
      setCartItems(cartItems.map(item =>
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        price: product.sellPrice || 0,
      }]);
    }
    setSearchProducts('');
    setShowProductSearch(false);
  };

  const removeFromCart = (productId: string) => setCartItems(cartItems.filter(i => i.productId !== productId));
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(cartItems.map(item => item.productId === productId ? { ...item, quantity } : item));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const finalAmount = subtotal - discount;

  // Submit order
  const handleSubmit = async () => {
    if (!selectedWarehouse) { error(t('messages', 'error'), t('warehouse', 'title')); return; }
    if (cartItems.length === 0) { error(t('messages', 'error'), t('messages', 'selectProduct')); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer || null,
          warehouseId: selectedWarehouse,
          discount,
          paymentMethod,
          notes,
          items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.price })),
        }),
      });
      if (!res.ok) throw new Error();
      success(t('messages', 'saved'), t('sales', 'newSale'));
      setCartItems([]);
      setDiscount(0);
      setNotes('');
      setSelectedCustomer('');
    } catch {
      error(t('messages', 'error'), 'Sotuv yaratishda xatolik');
    } finally { setLoading(false); }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (!res.ok) throw new Error();
      success(t('messages', 'saved'), 'Buyurtma bekor qilindi');
      setCancelModal(false);
      setSelectedOrder(null);
      fetchOrders(ordersPage);
    } catch {
      error(t('messages', 'error'), 'Buyurtmani bekor qilishda xatolik');
    } finally { setCancelLoading(false); }
  };

  // Return order
  const handleReturnOrder = async () => {
    if (!selectedOrder || returnItems.length === 0) {
      error('Xatolik', 'Qaytariladigan mahsulotlarni tanlang');
      return;
    }
    setReturnLoading(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'RETURNED',
          returnItems: returnItems.map(item => ({
            productId: item.productId,
            quantity: item.returnQuantity,
            price: item.price,
          })),
          returnReason,
        }),
      });
      if (!res.ok) throw new Error();
      success('Muvaffaqiyatli', 'Buyurtma qaytarildi');
      setReturnModal(false);
      setReturnItems([]);
      setReturnReason('');
      setSelectedOrder(null);
      fetchOrders(ordersPage);
    } catch {
      error(t('messages', 'error'), 'Buyurtmani qaytarishda xatolik');
    } finally { setReturnLoading(false); }
  };

  // Tab styling
  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'new', label: t('sales', 'newSale'), icon: Plus },
    { key: 'list', label: t('common', 'all'), icon: FileText },
    { key: 'analytics', label: 'Tahlil', icon: BarChart3 },
  ];

  return (
    <div className="p-6 font-sans w-full h-full text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">{t('sales', 'title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Sotuv va buyurtmalarni boshqarish</p>
        </div>
        {/* Tabs */}
        <div className="flex bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── NEW SALE TAB ─── */}
      {activeTab === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-auto">
          <div className="lg:col-span-2 space-y-4">
            {/* Customer & Warehouse */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                    <User size={14} className="inline mr-1" /> {t('sales', 'customer')} (ixtiyoriy)
                  </label>
                  <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200">
                    <option value="">Mijozsiz</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                    <MapPin size={14} className="inline mr-1" /> {t('warehouse', 'title')} *
                  </label>
                  <select value={selectedWarehouse} onChange={e => setSelectedWarehouse(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200">
                    <option value="">{t('common', 'select')}...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Search */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Mahsulot qidirish (nom yoki SKU)..." value={searchProducts}
                  onChange={e => { setSearchProducts(e.target.value); setShowProductSearch(true); }}
                  onFocus={() => setShowProductSearch(true)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200" />
                {showProductSearch && searchProducts && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">{t('common', 'noData')}</div>
                    ) : filteredProducts.slice(0, 10).map(product => (
                      <button key={product.id} onClick={() => addToCart(product)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.sku || '-'} • ${product.sellPrice}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 min-h-[300px]">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">
                <ShoppingCart size={18} className="inline mr-2" /> Savatcha ({cartItems.length})
              </h3>
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Package size={48} className="mb-3 opacity-30" />
                  <p className="text-sm">Savatcha bo&apos;sh</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.productName}</div>
                        <div className="text-xs text-slate-500">{item.sku || '-'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg flex items-center justify-center hover:bg-slate-100">-</button>
                          <input type="number" value={item.quantity} onChange={e => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                            className="w-16 text-center bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg py-1 text-sm text-slate-800 dark:text-slate-200" />
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg flex items-center justify-center hover:bg-slate-100">+</button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">${(item.quantity * item.price).toLocaleString()}</div>
                          <div className="text-xs text-slate-500">${item.price}/dona</div>
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">{t('sales', 'orderNumber')} {t('common', 'description')}</h3>
              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  <CreditCard size={14} className="inline mr-1" /> {t('sales', 'paymentMethod')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ value: 'CASH', label: t('sales', 'cash'), icon: '💵' }, { value: 'CARD', label: t('sales', 'card'), icon: '💳' }, { value: 'TRANSFER', label: t('sales', 'transfer'), icon: '🏦' }].map(m => (
                    <button key={m.value} onClick={() => setPaymentMethod(m.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${paymentMethod === m.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                      <div className="text-xl mb-1">{m.icon}</div>
                      <div className="text-xs font-bold">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2"><Tag size={14} className="inline mr-1" /> Chegirma ($)</label>
                <input type="number" value={discount} onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">{t('common', 'description')}</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ixtiyoriy izoh..." rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none text-slate-800 dark:text-slate-200" />
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-600">{t('common', 'total')}:</span><span className="font-bold">${subtotal.toLocaleString()}</span></div>
                {discount > 0 && <div className="flex justify-between text-sm text-red-600"><span>{t('sales', 'discount')}:</span><span className="font-bold">-${discount.toLocaleString()}</span></div>}
                <div className="flex justify-between text-lg font-black text-slate-900 dark:text-slate-100 border-t border-slate-200 pt-2">
                  <span>{t('sales', 'finalAmount')}:</span><span className="text-indigo-600">${finalAmount.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading || cartItems.length === 0}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg transition-colors">
                {loading ? t('common', 'loading') : t('sales', 'title') + 'ni ' + t('common', 'completed')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── LIST TAB ─── */}
      {activeTab === 'list' && (
        <div className="flex-1 overflow-auto flex flex-col">
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Qidiruv..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200" />
              </div>
              <select value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)}
                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none text-slate-800 dark:text-slate-200">
                <option value="">Barcha omborlar</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none text-slate-800 dark:text-slate-200">
                <option value="">Barcha statuslar</option>
                <option value="COMPLETED">Bajarilgan</option>
                <option value="CANCELLED">Bekor qilingan</option>
                <option value="RETURNED">Qaytarilgan</option>
              </select>
              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                Jami: <span className="font-bold text-slate-800 dark:text-white ml-1">{ordersTotal} ta buyurtma</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase">Hujjat</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase">Mijoz</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase text-right">Summa</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase">To'lov</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase">Ombor</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase">Sana</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase text-center">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {ordersLoading ? (
                  <tr><td colSpan={8} className="text-center py-12 font-bold text-slate-500">{t('common', 'loading')}</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 font-bold text-slate-500">{t('common', 'noData')}</td></tr>
                ) : orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{order.docNumber}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{order.customer?.fullName || 'Mijozsiz'}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">${Number(order.finalAmount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        order.paymentMethod === 'CASH' ? 'bg-emerald-50 text-emerald-700' :
                        order.paymentMethod === 'CARD' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                      }`}>{order.paymentMethod === 'CASH' ? 'Naqd' : order.paymentMethod === 'CARD' ? 'Karta' : 'O\'tkazma'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{order.warehouse?.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(order.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>{order.status === 'COMPLETED' ? 'Bajarilgan' : order.status === 'CANCELLED' ? 'Bekor' : 'Qaytarilgan'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => fetchOrderDetail(order.id)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-lg transition-colors" title="Ko'rish">
                          <Eye size={16} />
                        </button>
                        {order.status === 'COMPLETED' && (
                          <button onClick={() => { fetchOrderDetail(order.id); setCancelModal(true); }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors" title="Bekor qilish">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <button onClick={() => fetchOrders(ordersPage - 1)} disabled={ordersPage <= 1}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50">
              ← Oldingi
            </button>
            <span className="text-sm text-slate-500">{(ordersPage - 1) * 15 + 1}–{Math.min(ordersPage * 15, ordersTotal)} / {ordersTotal}</span>
            <button onClick={() => fetchOrders(ordersPage + 1)} disabled={ordersPage * 15 >= ordersTotal}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50">
              Keyingi →
            </button>
          </div>
        </div>
      )}

      {/* ─── ANALYTICS TAB ─── */}
      {activeTab === 'analytics' && (
        <div className="flex-1 overflow-auto">
          {/* Period */}
          <div className="flex gap-2 mb-4">
            {['today', 'week', 'month', 'year'].map(p => (
              <button key={p} onClick={() => setAnalyticsPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${analyticsPeriod === p ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700'}`}>
                {p === 'today' ? 'Bugun' : p === 'week' ? 'Hafta' : p === 'month' ? 'Oy' : 'Yil'}
              </button>
            ))}
          </div>

          {analyticsLoading ? (
            <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>
          ) : (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-5 rounded-2xl text-white">
                  <div className="flex items-center justify-between mb-3"><span className="text-xs font-bold text-indigo-100 uppercase">Jami sotuvlar</span><ShoppingCart size={18} className="text-indigo-200" /></div>
                  <div className="text-3xl font-black">{analytics?.recentOrders?.length || 0} ta</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 rounded-2xl text-white">
                  <div className="flex items-center justify-between mb-3"><span className="text-xs font-bold text-emerald-100 uppercase">Jami summa</span><DollarSign size={18} className="text-emerald-200" /></div>
                  <div className="text-3xl font-black">${(analytics?.financialSummary?.cashUSD || 0).toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-violet-500 to-violet-700 p-5 rounded-2xl text-white">
                  <div className="flex items-center justify-between mb-3"><span className="text-xs font-bold text-violet-100 uppercase">O'rtacha чек</span><TrendingUp size={18} className="text-violet-200" /></div>
                  <div className="text-3xl font-black">${analytics?.recentOrders?.length ? Math.round((analytics?.financialSummary?.cashUSD || 0) / analytics.recentOrders.length) : 0}</div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Sotuvlar dinamikasi</h2>
                <div className="h-72">
                  {analytics?.salesPurchasesChart?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.salesPurchasesChart}>
                        <defs>
                          <linearGradient id="colorSavdo" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} /><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} /></linearGradient>
                          <linearGradient id="colorKirim" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Legend formatter={(v: any) => v === 'savdo' ? 'Savdo' : 'Kirim'} />
                        <Area type="monotone" dataKey="savdo" stroke="#0ea5e9" fill="url(#colorSavdo)" strokeWidth={2} />
                        <Area type="monotone" dataKey="kirim" stroke="#8b5cf6" fill="url(#colorKirim)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-slate-400"><p>{t('common', 'noData')}</p></div>}
                </div>
              </div>

              {/* TOP Mijozlar & Mahsulotlar */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4"><Users size={18} className="text-indigo-500" /> Top mijozlar</h2>
                  {analytics?.recentOrders?.length > 0 ? (
                    <div className="space-y-3">
                      {(() => {
                        const grouped: Record<string, { name: string; count: number; amount: number }> = {};
                        (analytics.recentOrders || []).forEach((o: any) => {
                          const c = o.customer || 'Noma\'lum';
                          if (!grouped[c]) grouped[c] = { name: c, count: 0, amount: 0 };
                          grouped[c].count++;
                          grouped[c].amount += Number(o.amount);
                        });
                        return Object.values(grouped).sort((a, b) => b.amount - a.amount).slice(0, 5).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.name}</div>
                            <div className="text-right"><div className="font-black text-slate-900 dark:text-white">${item.amount.toLocaleString()}</div><div className="text-xs text-slate-500">{item.count} ta buyurtma</div></div>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : <p className="text-slate-400 text-center py-4">{t('common', 'noData')}</p>}
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4"><Package size={18} className="text-amber-500" /> Top mahsulotlar</h2>
                  {analytics?.topProducts?.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.topProducts.map((p: any, i: number) => (
                        <div key={p.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : 'bg-slate-300 dark:bg-slate-600'}`}>{i + 1}</div>
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.name}</span>
                          </div>
                          <div className="text-right"><div className="font-black text-slate-900 dark:text-white">${p.totalRevenue?.toLocaleString()}</div><div className="text-xs text-slate-500">{p.totalQty} dona</div></div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-slate-400 text-center py-4">{t('common', 'noData')}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── ORDER DETAIL MODAL ─── */}
      {selectedOrder && !cancelModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setSelectedOrder(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{orderDetailLoading ? 'Yuklanmoqda...' : selectedOrder.docNumber}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
            </div>
            {orderDetailLoading ? (
              <div className="p-6 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
              </div>
            ) : (
            <>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">Mijoz</div><div className="font-bold text-slate-800 dark:text-white">{selectedOrder.customer?.fullName || 'Mijozsiz'}</div></div>
                <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">Ombor</div><div className="font-bold text-slate-800 dark:text-white">{selectedOrder.warehouse?.name}</div></div>
                <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">Summa</div><div className="font-black text-2xl text-indigo-600">${Number(selectedOrder.finalAmount).toLocaleString()}</div></div>
                <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">Sana</div><div className="font-bold text-slate-800">{new Date(selectedOrder.date).toLocaleString('uz-UZ')}</div></div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="text-xs font-bold text-slate-500 uppercase mb-3">Mahsulotlar</div>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div><div className="font-bold text-sm text-slate-800 dark:text-white">{item.product?.name}</div><div className="text-xs text-slate-500">{item.quantity} × ${item.price}</div></div>
                      <div className="font-black text-slate-900 dark:text-white">${Number(item.total).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
              <InvoicePrintButton order={selectedOrder} />
              {selectedOrder.status === 'COMPLETED' && (
                <>
                  <button onClick={() => { setReturnModal(true); }}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors">
                    Qaytarish
                  </button>
                  <button onClick={() => { setCancelModal(true); }}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors">
                    Bekor qilish
                  </button>
                </>
              )}
              <button onClick={() => setSelectedOrder(null)} className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50">Yopish</button>
            </div>
            </>
            )}
          </div>
        </>
      )}

      {/* ─── CANCEL MODAL ─── */}
      {cancelModal && selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setCancelModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[70] w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><X size={32} className="text-red-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Buyurtmani bekor qilish</h3>
              <p className="text-sm text-slate-500">"{selectedOrder?.docNumber}" — bu buyurtmani bekor qilishni tasdiqlaysizmi?</p>
              <p className="text-xs text-slate-400 mt-1">Mahsulotlar zaxiraga qaytariladi, mijoz balansi tiklanadi.</p>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
              <button onClick={() => setCancelModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Bekor qilish</button>
              <button onClick={handleCancelOrder} disabled={cancelLoading}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
                {cancelLoading ? 'Bekor qilinmoqda...' : 'Ha, bekor qilish'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ─── RETURN MODAL ─── */}
      {returnModal && selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setReturnModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[80] w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mahsulotlarni qaytarish - {selectedOrder.docNumber}</h3>
              <button onClick={() => setReturnModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 dark:text-white">{item.product?.name}</div>
                        <div className="text-xs text-slate-500">{item.quantity} × ${item.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900 dark:text-white">${Number(item.total).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Qaytariladigan miqdor:</label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        defaultValue={item.quantity}
                        onChange={(e) => {
                          const qty = Math.min(Number(e.target.value), item.quantity);
                          setReturnItems(prev => {
                            const existing = prev.find(i => i.productId === item.productId);
                            if (existing) {
                              return prev.map(i => 
                                i.productId === item.productId 
                                  ? { ...i, returnQuantity: qty }
                                  : i
                              );
                            }
                            return [...prev, {
                              productId: item.productId,
                              productName: item.product?.name,
                              price: item.price,
                              quantity: item.quantity,
                              returnQuantity: qty,
                            }];
                          });
                        }}
                        className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200"
                      />
                      <span className="text-xs text-slate-500">/ {item.quantity} dona</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Qaytarish sababi (ixtiyoriy):</label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Qaytarish sababini yozing..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
              <button onClick={() => setReturnModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Bekor qilish</button>
              <button onClick={handleReturnOrder} disabled={returnLoading || returnItems.length === 0}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
                {returnLoading ? 'Qaytarilmoqda...' : 'Qaytarish'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}