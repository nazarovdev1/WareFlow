'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Search, ShoppingCart, Truck, MapPin, Tag, Package, Eye, X, FileText, BarChart3 } from 'lucide-react';
import { useNotification } from '@/lib/NotificationContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type Tab = 'new' | 'list';

export default function PurchasesPage() {
  const { success, error } = useNotification();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('new');

  // ─── NEW PURCHASE STATE ────────────────────────────
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchProducts, setSearchProducts] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [notes, setNotes] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ─── LIST STATE ────────────────────────────────────
  const [purchases, setPurchases] = useState<any[]>([]);
  const [purchasesTotal, setPurchasesTotal] = useState(0);
  const [purchasesPage, setPurchasesPage] = useState(1);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch data for new purchase
  useEffect(() => {
    if (activeTab === 'new') {
      Promise.all([
        fetch('/api/suppliers').then(r => r.json()),
        fetch('/api/warehouses').then(r => r.json()),
        fetch('/api/products').then(r => r.json())
      ]).then(([sData, wData, pData]) => {
        setSuppliers(Array.isArray(sData) ? sData : sData.data || []);
        setWarehouses(Array.isArray(wData) ? wData : wData.data || []);
        setProducts(Array.isArray(pData) ? pData : pData.data || []);
      }).catch(console.error);
    }
  }, [activeTab]);

  // Fetch purchases list
  const fetchPurchases = useCallback((page = 1) => {
    setPurchasesLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (filterSearch) params.append('search', filterSearch);
    if (filterStatus) params.append('status', filterStatus);
    if (filterSupplier) params.append('supplierId', filterSupplier);
    if (filterWarehouse) params.append('warehouseId', filterWarehouse);

    fetch(`/api/purchases?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setPurchases(data.data || []);
        setPurchasesTotal(data.pagination?.total || 0);
        setPurchasesPage(page);
      })
      .catch(console.error)
      .finally(() => setPurchasesLoading(false));
  }, [filterSearch, filterStatus, filterSupplier, filterWarehouse]);

  useEffect(() => {
    if (activeTab === 'list') fetchPurchases(1);
  }, [activeTab, filterSearch, filterStatus, filterSupplier, filterWarehouse, fetchPurchases]);

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
        price: product.wholesalePrice || product.sellPrice || 0,
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

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // Submit purchase
  const handleSubmit = async () => {
    if (!selectedSupplier) { error(t('messages', 'error'), t('messages', 'selectSupplier')); return; }
    if (!selectedWarehouse) { error(t('messages', 'error'), t('warehouse', 'title')); return; }
    if (cartItems.length === 0) { error(t('messages', 'error'), t('messages', 'selectProduct')); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplier,
          warehouseId: selectedWarehouse,
          notes,
          items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.price })),
        }),
      });
      if (!res.ok) throw new Error();
      success(t('messages', 'saved'), t('purchases', 'newPurchase'));
      setCartItems([]);
      setNotes('');
      setSelectedSupplier('');
      setSelectedWarehouse('');
    } catch {
      error(t('messages', 'error'), 'Xarid yaratishda xatolik');
    } finally { setLoading(false); }
  };

  // Cancel purchase
  const handleCancelPurchase = async () => {
    if (!selectedPurchase) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/purchases/${selectedPurchase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (!res.ok) throw new Error();
      success(t('messages', 'saved'), 'Xarid bekor qilindi');
      setCancelModal(false);
      setSelectedPurchase(null);
      fetchPurchases(purchasesPage);
    } catch {
      error(t('messages', 'error'), 'Xaridni bekor qilishda xatolik');
    } finally { setCancelLoading(false); }
  };

  // Tab styling
  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'new', label: t('purchases', 'newPurchase'), icon: Plus },
    { key: 'list', label: t('common', 'all'), icon: FileText },
  ];

  return (
    <div className="p-6 font-sans w-full h-full text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">{t('purchases', 'title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Xarid va yetkazib berishlarni boshqarish</p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── NEW PURCHASE TAB ─── */}
      {activeTab === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-auto">
          <div className="lg:col-span-2 space-y-4">
            {/* Supplier & Warehouse */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                    <Truck size={14} className="inline mr-1" /> {t('purchases', 'supplier')} *
                  </label>
                  <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-slate-200">
                    <option value="">{t('common', 'select')}...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                    <MapPin size={14} className="inline mr-1" /> {t('purchases', 'warehouse')} *
                  </label>
                  <select value={selectedWarehouse} onChange={e => setSelectedWarehouse(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-slate-200">
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
                <input type="text" placeholder="Mahsulot qidirish..." value={searchProducts}
                  onChange={e => { setSearchProducts(e.target.value); setShowProductSearch(true); }}
                  onFocus={() => setShowProductSearch(true)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-slate-200" />
                {showProductSearch && searchProducts && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">{t('common', 'noData')}</div>
                    ) : filteredProducts.slice(0, 10).map(product => (
                      <button key={product.id} onClick={() => addToCart(product)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.sku || '-'} • ${product.wholesalePrice || product.sellPrice}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 min-h-[300px]">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">
                <ShoppingCart size={18} className="inline mr-2" /> Xarid ro&apos;yxati ({cartItems.length})
              </h3>
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Package size={48} className="mb-3 opacity-30" />
                  <p className="text-sm">{t('common', 'noData')}</p>
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
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">Xarid {t('common', 'description')}</h3>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">{t('common', 'description')}</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ixtiyoriy izoh..." rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none text-slate-800 dark:text-slate-200" />
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex justify-between text-lg font-black text-slate-900 dark:text-slate-100">
                  <span>{t('common', 'total')}:</span>
                  <span className="text-emerald-600">${totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading || cartItems.length === 0}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg transition-colors">
                {loading ? t('common', 'loading') : t('purchases', 'newPurchase') + ' ' + t('common', 'completed')}
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
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200" />
              </div>
              <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}
                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none text-slate-800 dark:text-slate-200">
                <option value="">Barcha ta&apos;minotchilar</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)}
                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none text-slate-800 dark:text-slate-200">
                <option value="">Barcha omborlar</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                Jami: <span className="font-bold text-slate-800 dark:text-white ml-1">{purchasesTotal} ta xarid</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase">Hujjat</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase">Ta&apos;minotchi</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase text-right">Summa</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase">Ombor</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase">Sana</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase text-center">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {purchasesLoading ? (
                  <tr><td colSpan={7} className="text-center py-12 font-bold text-slate-500">{t('common', 'loading')}</td></tr>
                ) : purchases.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 font-bold text-slate-500">{t('common', 'noData')}</td></tr>
                ) : purchases.map(purchase => (
                  <tr key={purchase.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{purchase.docNumber}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{purchase.supplier?.name}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">${Number(purchase.totalAmount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{purchase.warehouse?.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(purchase.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        purchase.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        purchase.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>{purchase.status === 'COMPLETED' ? 'Bajarilgan' : purchase.status === 'CANCELLED' ? 'Bekor' : 'Draft'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedPurchase(purchase)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded-lg transition-colors" title="Ko'rish">
                          <Eye size={16} />
                        </button>
                        {purchase.status === 'COMPLETED' && (
                          <button onClick={() => { setSelectedPurchase(purchase); setCancelModal(true); }}
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
            <button onClick={() => fetchPurchases(purchasesPage - 1)} disabled={purchasesPage <= 1}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50">
              ← Oldingi
            </button>
            <span className="text-sm text-slate-500">{(purchasesPage - 1) * 15 + 1}–{Math.min(purchasesPage * 15, purchasesTotal)} / {purchasesTotal}</span>
            <button onClick={() => fetchPurchases(purchasesPage + 1)} disabled={purchasesPage * 15 >= purchasesTotal}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50">
              Keyingi →
            </button>
          </div>
        </div>
      )}

      {/* ─── PURCHASE DETAIL MODAL ─── */}
      {selectedPurchase && !cancelModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setSelectedPurchase(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedPurchase.docNumber}</h3>
              <button onClick={() => setSelectedPurchase(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">Ta&apos;minotchi</div><div className="font-bold text-slate-800 dark:text-white">{selectedPurchase.supplier?.name}</div></div>
                <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">Ombor</div><div className="font-bold text-slate-800 dark:text-white">{selectedPurchase.warehouse?.name}</div></div>
                <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">Summa</div><div className="font-black text-2xl text-emerald-600">${Number(selectedPurchase.totalAmount).toLocaleString()}</div></div>
                <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">Sana</div><div className="font-bold text-slate-800">{new Date(selectedPurchase.date).toLocaleString('uz-UZ')}</div></div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="text-xs font-bold text-slate-500 uppercase mb-3">Mahsulotlar</div>
                <div className="space-y-2">
                  {selectedPurchase.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div><div className="font-bold text-sm text-slate-800 dark:text-white">{item.product?.name}</div><div className="text-xs text-slate-500">{item.quantity} × ${item.price}</div></div>
                      <div className="font-black text-slate-900 dark:text-white">${Number(item.total).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
              {selectedPurchase.status === 'COMPLETED' && (
                <button onClick={() => setCancelModal(true)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors">
                  Bekor qilish
                </button>
              )}
              <button onClick={() => setSelectedPurchase(null)} className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50">Yopish</button>
            </div>
          </div>
        </>
      )}

      {/* ─── CANCEL MODAL ─── */}
      {cancelModal && selectedPurchase && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setCancelModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[70] w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><X size={32} className="text-red-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Xaridni bekor qilish</h3>
              <p className="text-sm text-slate-500">"{selectedPurchase?.docNumber}" — bu xaridni bekor qilishni tasdiqlaysizmi?</p>
              <p className="text-xs text-slate-400 mt-1">Mahsulotlar zaxiradan chiqariladi, ta&apos;minotchi balansi tiklanadi.</p>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
              <button onClick={() => setCancelModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Bekor qilish</button>
              <button onClick={handleCancelPurchase} disabled={cancelLoading}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
                {cancelLoading ? 'Bekor qilinmoqda...' : 'Ha, bekor qilish'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}