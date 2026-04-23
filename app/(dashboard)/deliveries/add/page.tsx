'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Save, Package, User, Truck, MapPin, Calendar, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

interface Warehouse {
  id: string;
  name: string;
}

export default function AddDeliveryPage() {
  const router = useRouter();
  const { success, error } = useNotification();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  
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
  
  const [cartItems, setCartItems] = useState<DeliveryCartItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  interface DeliveryCartItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }

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
    } catch (err) {
      error('Xatolik', 'Ma\'lumotlarni yuklashda xatolik');
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

  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.warehouseId) {
      newErrors.warehouseId = 'Ombor tanlanishi shart';
    }
    if (!formData.driverName) {
      newErrors.driverName = 'Haydovchi ismi kiritilishi shart';
    }
    if (cartItems.length === 0) {
      newErrors.items = 'Kamida bitta mahsulot tanlanishi shart';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateDocNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DL-${year}${month}${day}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      error('Xatolik', 'Barcha majburiy maydonlarni to\'ldiring');
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
        success('Muvaffaqiyatli', `Yetkazib berish ${docNumber} muvaffaqiyatli yaratildi`);
        router.push('/deliveries');
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Yetkazib berish yaratishda xatolik');
      }
    } catch (err) {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/deliveries" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Yangi yetkazib berish</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Asosiy ma'lumotlar
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <MapPin size={12} />
                      Ombor *
                    </label>
                    <select
                      value={formData.warehouseId}
                      onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white ${
                        errors.warehouseId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <option value="">Omborni tanlang...</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                    {errors.warehouseId && (
                      <p className="text-xs text-red-600 dark:text-red-400">{errors.warehouseId}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <User size={12} />
                      Mijoz
                    </label>
                    <select
                      value={formData.customerId}
                      onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                    >
                      <option value="">Mijozni tanlang...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Truck size={12} />
                      Haydovchi ismi *
                    </label>
                    <input
                      type="text"
                      value={formData.driverName}
                      onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                      placeholder="Ism familiya"
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white ${
                        errors.driverName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {errors.driverName && (
                      <p className="text-xs text-red-600 dark:text-red-400">{errors.driverName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={formData.driverPhone}
                      onChange={e => setFormData({ ...formData, driverPhone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      Avtomobil raqami
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      placeholder="01 A 123 AA"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Calendar size={12} />
                      Yetkazib berish sanasi
                    </label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <MapPin size={12} />
                    Manzil
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Yetkazib berish manzili"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    Qo'shimcha izohlar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    placeholder="Qo'shimcha ma'lumotlar..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Mahsulotlar
                </h2>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Mahsulot qidirish..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                  />
                  <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                {search && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                    {filteredProducts.slice(0, 5).map(p => (
                      <button
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center"
                      >
                        <span className="text-sm font-medium text-slate-800 dark:text-white">{p.name}</span>
                        <span className="text-xs text-slate-500">${p.sellPrice}</span>
                      </button>
                    ))}
                  </div>
                )}

                {errors.items && (
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.items}</p>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Savatcha ({cartItems.length})
                </h2>

                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-bold">Savatcha bo'sh</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {cartItems.map(item => (
                      <div key={item.productId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.productName}</div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400">${item.price} / dona</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 text-slate-500 hover:text-indigo-600"><Minus size={12} /></button>
                            <span className="w-6 text-center text-sm font-bold text-slate-800 dark:text-white">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 text-slate-500 hover:text-indigo-600"><Plus size={12} /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.productId)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {cartItems.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Jami summa</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">${subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <Link
              href="/deliveries"
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Bekor qilish
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Yuborilmoqda...' : (
                <>
                  <Save size={18} />
                  Saqlash
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
