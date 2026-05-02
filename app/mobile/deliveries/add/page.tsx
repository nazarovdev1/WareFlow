'use client';

import { useState, useEffect } from 'react';
import { Save, User, Truck, MapPin, Plus, Minus, Trash2, Search, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useNotification } from '@/lib/NotificationContext';

interface Product {
  id: string;
  name: string;
  sku?: string;
  sellPrice: number;
}

interface Customer {
  id: string;
  fullName: string;
  phone?: string;
  address?: string;
}

interface WarehouseItem {
  id: string;
  name: string;
}

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export default function MobileAddDeliveryPage() {
  const router = useRouter();
  const { success, error } = useNotification();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    warehouseId: '',
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
    address: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, wRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/customers'),
        fetch('/api/warehouses'),
      ]);
      if (pRes.ok) {
        const data = await pRes.json();
        setProducts(Array.isArray(data) ? data : data.data || []);
      }
      if (cRes.ok) {
        const data = await cRes.json();
        setCustomers(Array.isArray(data) ? data : data.data || []);
      }
      if (wRes.ok) {
        const data = await wRes.json();
        setWarehouses(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      error('Xatolik', `Ma\u2019lumotlarni yuklashda xatolik`);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
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
        price: product.sellPrice,
      }]);
    }
    setSearch('');
  };

  const updateQuantity = (id: string, q: number) => {
    if (q < 1) return;
    setCartItems(cartItems.map(item => item.productId === id ? { ...item, quantity: q } : item));
  };

  const removeFromCart = (id: string) => setCartItems(cartItems.filter(i => i.productId !== id));

  const generateDocNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DL-${year}${month}${day}-${random}`;
  };

  const handleSubmit = async () => {
    if (!formData.warehouseId) {
      error('Xatolik', 'Ombor tanlanishi shart');
      return;
    }
    if (!formData.driverName) {
      error('Xatolik', 'Haydovchi ismi kiritilishi shart');
      return;
    }
    if (cartItems.length === 0) {
      error('Xatolik', 'Kamida bitta mahsulot tanlanishi shart');
      return;
    }

    setSubmitting(true);
    try {
      const docNumber = generateDocNumber();
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docNumber,
          customerId: formData.customerId || null,
          warehouseId: formData.warehouseId,
          driverName: formData.driverName,
          driverPhone: formData.driverPhone,
          vehicleNumber: formData.vehicleNumber,
          address: formData.address || null,
          status: 'PREPARING',
          notes: formData.notes,
          date: formData.deliveryDate,
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', `Yetkazib berish ${docNumber} yaratildi`);
        router.push('/mobile/deliveries');
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Yetkazib berish yaratishda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Yangi yetkazib berish"
        backHref="/mobile/deliveries"
      />

      <div className="px-4 space-y-4">
        {/* Warehouse */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Ombor *</label>
          <select
            value={formData.warehouseId}
            onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="">Ombor tanlang</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {/* Customer */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Mijoz</label>
          <select
            value={formData.customerId}
            onChange={e => {
              setFormData({ ...formData, customerId: e.target.value });
              const cust = customers.find(c => c.id === e.target.value);
              if (cust?.address) {
                setFormData(prev => ({ ...prev, customerId: e.target.value, address: cust.address || prev.address }));
              }
            }}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="">Mijoz tanlang</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>
          {selectedCustomer?.phone && (
            <div className="mt-2 text-xs text-slate-500">{selectedCustomer.phone}</div>
          )}
        </div>

        {/* Driver Info */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{`Haydovchi ma\u2019lumotlari`}</h3>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Haydovchi ismi *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ism kiriting"
                value={formData.driverName}
                onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Telefon</label>
            <input
              type="tel"
              placeholder="+998 XX XXX XX XX"
              value={formData.driverPhone}
              onChange={e => setFormData({ ...formData, driverPhone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Avtomobil raqami</label>
            <div className="relative">
              <Truck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="01 A 123 AA"
                value={formData.vehicleNumber}
                onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Address & Date */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Manzil</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Yetkazib berish manzili"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Sana</label>
            <input
              type="date"
              value={formData.deliveryDate}
              onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Izohlar</label>
            <textarea
              placeholder="Qo'shimcha ma'lumot..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Products */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Mahsulotlar ({cartItems.length})
            </h3>
            <button
              onClick={() => setShowProductPicker(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg active:scale-95 transition-transform"
            >
              <Plus size={14} />
              {`Qo\u2019shish`}
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">{`Mahsulot qo\u2019shing`}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cartItems.map(item => (
                <div key={item.productId} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.productName}</div>
                    <div className="text-xs text-slate-500">{item.price.toLocaleString()} {`so\u2019m`}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold text-slate-800 dark:text-white w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="w-7 h-7 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <Save size={18} />
          {submitting ? 'Yaratilmoqda...' : 'Yetkazib berish yaratish'}
        </button>
      </div>

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowProductPicker(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Mahsulot tanlash</h3>
                <button onClick={() => setShowProductPicker(false)} className="text-slate-400 text-lg font-bold">&times;</button>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Mahsulot qidirish..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl active:scale-[0.98] transition-transform text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{product.name}</div>
                    {product.sku && <div className="text-xs text-slate-500">{product.sku}</div>}
                  </div>
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {product.sellPrice.toLocaleString()}
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-sm">Mahsulot topilmadi</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
