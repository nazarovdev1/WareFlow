'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, Search, Plus, Minus, Trash2, MapPin, User, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileNewSalePage() {
  const router = useRouter();
  const { success, error } = useNotification();
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod] = useState('CASH');
  const [discount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
      fetch('/api/products').then(r => r.json())
    ]).then(([cData, wData, pData]) => {
      setCustomers(Array.isArray(cData) ? cData : cData.data || []);
      setWarehouses(Array.isArray(wData) ? wData : wData.data || []);
      setProducts(Array.isArray(pData) ? pData : pData.data || []);
      if (Array.isArray(wData) && wData.length > 0) setSelectedWarehouse(wData[0].id);
      else if (wData.data && wData.data.length > 0) setSelectedWarehouse(wData.data[0].id);
    }).catch(console.error);
  }, []);

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
        quantity: 1,
        price: product.sellPrice || 0,
      }]);
    }
    setSearch('');
  };

  const updateQuantity = (id: string, q: number) => {
    if (q < 1) return;
    setCartItems(cartItems.map(item => item.productId === id ? { ...item, quantity: q } : item));
  };

  const removeFromCart = (id: string) => setCartItems(cartItems.filter(i => i.productId !== id));

  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const total = subtotal - discount;

  const handleSubmit = async () => {
    if (!selectedWarehouse) { error('Xatolik', 'Ombor tanlanmagan'); return; }
    if (cartItems.length === 0) { error('Xatolik', 'Mahsulot tanlanmagan'); return; }
    
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
          items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.price })),
        }),
      });
      if (!res.ok) throw new Error();
      success('Muvaffaqiyatli', 'Sotuv amalga oshirildi');
      router.push('/mobile/sales');
    } catch {
      error('Xatolik', 'Sotuvni yakunlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full min-h-screen pb-48">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <Link href="/mobile/sales" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Yangi savdo</h1>
        </div>
      </div>

      {/* Main Form */}
      <div className="px-6 space-y-6 mt-4">
        {/* Warehouse & Customer */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <MapPin size={12} /> Ombor *
            </label>
            <select 
              value={selectedWarehouse} 
              onChange={e => setSelectedWarehouse(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 dark:text-white"
            >
              <option value="">Omborni tanlang...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <User size={12} /> Mijoz
            </label>
            <select 
              value={selectedCustomer} 
              onChange={e => setSelectedCustomer(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 dark:text-white"
            >
              <option value="">Mijozsiz (Naqd)</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </div>
        </div>

        {/* Product Search */}
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Mahsulot qidirish..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 dark:text-white"
          />
          {search && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl z-50 max-h-60 overflow-y-auto overflow-x-hidden p-2">
              {filteredProducts.slice(0, 10).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => addToCart(p)}
                  className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl border-b border-slate-50 dark:border-slate-800 last:border-0 flex justify-between items-center"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{p.name}</div>
                    <div className="text-[11px] text-slate-500">${p.sellPrice} / {p.unit?.name || 'dona'}</div>
                  </div>
                  <Plus size={18} className="text-indigo-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="space-y-3">
          <h2 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 px-1">Tanlangan mahsulotlar</h2>
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <div key={item.productId} className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.productName}</div>
                  <div className="text-[11px] text-indigo-600 font-bold tracking-tighter">${item.price} / dona</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 border border-slate-100 dark:border-slate-700">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1.5 text-slate-500 hover:text-indigo-600"><Minus size={14} /></button>
                    <span className="w-6 text-center text-sm font-bold text-slate-800 dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1.5 text-slate-500 hover:text-indigo-600"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-xl active:scale-95 transition-transform"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <ShoppingCart size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Savatcha bo&apos;sh</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Summary */}
      <div className="fixed bottom-24 left-6 right-6 z-40">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 p-5 rounded-[40px] shadow-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jami summa</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">${total.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chegirma</div>
              <div className="text-sm font-bold text-rose-500">-${discount}</div>
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading || cartItems.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {loading ? 'Yuborilmoqda...' : (
              <>
                Sotuvni yakunlash <CheckCircle2 size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
