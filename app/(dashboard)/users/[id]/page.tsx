'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { ArrowLeft, Save, Building2, User, Mail, Phone, Lock, Shield, Calendar, DollarSign, Check, X, Package, Send, Search, Trash2, ChevronDown, Eye, Pencil, Trash, Plus, Warehouse, Users, Truck, BarChart3, ShoppingCart, ClipboardList, RotateCcw, Download } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSession } from 'next-auth/react';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  permissions: string[];
  warehouse: { id: string; name: string } | null;
  subscriptions: Array<{
    id: string;
    amount: number;
    currency: string;
    dueDate: string;
    isPaid: boolean;
    paidDate: string | null;
    note: string | null;
  }>;
  createdAt: string;
}

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  sellPrice: number;
}

interface SubscriptionForm {
  amount: string;
  currency: string;
  dueDate: string;
  note: string;
}

const PERMISSION_GROUPS = [
  {
    key: 'warehouse',
    label: 'Omborni boshqarish',
    Icon: Warehouse,
    permissions: [
      { key: 'view_warehouse', label: 'Ko\'rish', Icon: Eye },
      { key: 'edit_warehouse', label: 'Tahrirlash', Icon: Pencil },
      { key: 'delete_warehouse', label: 'O\'chirish', Icon: Trash },
    ],
  },
  {
    key: 'products',
    label: 'Mahsulotlarni boshqarish',
    Icon: Package,
    permissions: [
      { key: 'view_products', label: 'Ko\'rish', Icon: Eye },
      { key: 'create_products', label: 'Yaratish', Icon: Plus },
      { key: 'edit_products', label: 'Tahrirlash', Icon: Pencil },
      { key: 'delete_products', label: 'O\'chirish', Icon: Trash },
    ],
  },
  {
    key: 'customers',
    label: 'Mijozlarni boshqarish',
    Icon: Users,
    permissions: [
      { key: 'view_customers', label: 'Ko\'rish', Icon: Eye },
      { key: 'create_customers', label: 'Yaratish', Icon: Plus },
      { key: 'edit_customers', label: 'Tahrirlash', Icon: Pencil },
      { key: 'delete_customers', label: 'O\'chirish', Icon: Trash },
    ],
  },
  {
    key: 'suppliers',
    label: 'Yetkazib beruvchilar',
    Icon: Truck,
    permissions: [
      { key: 'view_suppliers', label: 'Ko\'rish', Icon: Eye },
      { key: 'create_suppliers', label: 'Yaratish', Icon: Plus },
      { key: 'edit_suppliers', label: 'Tahrirlash', Icon: Pencil },
      { key: 'delete_suppliers', label: 'O\'chirish', Icon: Trash },
    ],
  },
  {
    key: 'sales',
    label: 'Savdoni boshqarish',
    Icon: ShoppingCart,
    permissions: [
      { key: 'view_sales', label: 'Ko\'rish', Icon: Eye },
      { key: 'create_sales', label: 'Yaratish', Icon: Plus },
      { key: 'edit_sales', label: 'Tahrirlash', Icon: Pencil },
      { key: 'delete_sales', label: 'O\'chirish', Icon: Trash },
      { key: 'refund_sales', label: 'Qaytarish', Icon: RotateCcw },
    ],
  },
  {
    key: 'purchases',
    label: 'Xaridni boshqarish',
    Icon: ClipboardList,
    permissions: [
      { key: 'view_purchases', label: 'Ko\'rish', Icon: Eye },
      { key: 'create_purchases', label: 'Yaratish', Icon: Plus },
      { key: 'edit_purchases', label: 'Tahrirlash', Icon: Pencil },
      { key: 'delete_purchases', label: 'O\'chirish', Icon: Trash },
      { key: 'receive_purchases', label: 'Qabul qilish', Icon: Check },
    ],
  },
  {
    key: 'reports',
    label: 'Hisobotlarni ko\'rish',
    Icon: BarChart3,
    permissions: [
      { key: 'view_reports', label: 'Ko\'rish', Icon: Eye },
      { key: 'export_reports', label: 'Eksport', Icon: Download },
    ],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key));

export default function UserDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const routeParams = useParams();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userId = routeParams.id as string;
  const isEditMode = searchParams.get('edit') === 'true';
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const [user, setUser] = useState<UserData | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showSendProducts, setShowSendProducts] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    warehouseId: '',
    isActive: true,
    permissions: [] as string[],
  });
  const [paymentForm, setPaymentForm] = useState<SubscriptionForm>({
    amount: '',
    currency: 'USD',
    dueDate: '',
    note: '',
  });

  // Send products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [sendFromWarehouse, setSendFromWarehouse] = useState('');
  const [sendCart, setSendCart] = useState<{ productId: string; name: string; quantity: number }[]>([]);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      fetchUser();
      fetchWarehouses();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('User topilmadi');
      const data = await res.json();
      setUser(data);
      setForm({
        name: data.name || '',
        email: data.email || '',
        role: data.role,
        phone: data.phone || '',
        warehouseId: data.warehouse?.id || '',
        isActive: data.isActive,
        permissions: data.permissions || [],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/warehouses');
      const data = await res.json();
      setWarehouses(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          warehouseId: form.warehouseId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Xatolik');
      }
      router.push('/users');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (perm: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: parseFloat(paymentForm.amount),
          currency: paymentForm.currency,
          dueDate: paymentForm.dueDate,
          note: paymentForm.note || undefined,
        }),
      });
      if (!res.ok) throw new Error('Xatolik');
      setShowAddPayment(false);
      setPaymentForm({ amount: '', currency: 'USD', dueDate: '', note: '' });
      fetchUser();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const togglePaymentStatus = async (subId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/subscriptions/${subId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPaid: !currentStatus,
          paidDate: !currentStatus ? new Date().toISOString() : null,
        }),
      });
      fetchUser();
    } catch (err) {
      console.error('Error updating subscription:', err);
    }
  };

  // Send product functions
  const openSendProducts = () => {
    setShowSendProducts(true);
    setSendCart([]);
    setSendFromWarehouse('');
    setSendSuccess('');
    fetchProducts();
  };

  const addProductToSendCart = (product: Product) => {
    const existing = sendCart.find(i => i.productId === product.id);
    if (existing) {
      setSendCart(sendCart.map(i =>
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSendCart([...sendCart, { productId: product.id, name: product.name, quantity: 1 }]);
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleSendProducts = async () => {
    if (!sendFromWarehouse) {
      setError('Qaysi ombordan yuborilishini tanlang');
      return;
    }
    if (sendCart.length === 0) {
      setError('Kamida 1 ta mahsulot tanlang');
      return;
    }

    setSendLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${userId}/send-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromWarehouseId: sendFromWarehouse,
          items: sendCart.map(i => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik');

      setSendSuccess('Tovarlar muvaffaqiyatli yuborildi! ✅');
      setSendCart([]);
      setTimeout(() => {
        setShowSendProducts(false);
        setSendSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6 font-sans flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="p-6 font-sans">
        <Link href="/users" className="flex items-center text-teal-600 hover:underline mb-4">
          <ArrowLeft size={16} className="mr-1" /> Orqaga
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans w-full h-full flex flex-col text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/users" className="p-2 mr-4 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {user?.name || user?.email}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">User ma&apos;lumotlari</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && !isEditMode && (
            <button
              onClick={openSendProducts}
              className="flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-sm"
            >
              <Send size={16} className="mr-2" /> Tovar yuborish
            </button>
          )}
          {!isEditMode && isAdmin && (
            <Link href={`/users/${userId}?edit=true`}
              className="px-5 py-2.5 bg-[#0f172a] dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold rounded-lg transition">
              Tahrirlash
            </Link>
          )}
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Left Column - User Info */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {isEditMode ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Ism</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Telefon</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Rol</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Omborxona</label>
                <select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  <option value="">Biriktirilmagan</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-600 w-5 h-5 text-teal-600" />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium">Active</label>
              </div>

              {/* Permissions Section */}
              {isAdmin && form.role !== 'ADMIN' && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center">
                    <Shield size={16} className="mr-2 text-indigo-500" /> Ruxsatlar (Permissions)
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Foydalanuvchiga qaysi funksiyalarni berishni tanlang.</p>
                  <div className="space-y-2">
                    {PERMISSION_GROUPS.map(group => {
                      const isExpanded = expandedGroups.includes(group.key);
                      const enabledCount = group.permissions.filter(p => form.permissions.includes(p.key)).length;
                      const allEnabled = enabledCount === group.permissions.length;
                      return (
                        <div key={group.key} className="border-2 rounded-xl overflow-hidden transition-all border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => setExpandedGroups(prev => prev.includes(group.key) ? prev.filter(k => k !== group.key) : [...prev, group.key])}
                            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <group.Icon size={20} className={allEnabled ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'} />
                              <div className="text-left">
                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{group.label}</div>
                                {enabledCount > 0 && (
                                  <div className="text-xs text-indigo-500">{enabledCount}/{group.permissions.length} tanlangan</div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {group.permissions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const allKeys = group.permissions.map(p => p.key);
                                    if (allEnabled) {
                                      setForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => !allKeys.includes(p)) }));
                                    } else {
                                      setForm(prev => ({ ...prev, permissions: Array.from(new Set([...prev.permissions, ...allKeys])) }));
                                    }
                                  }}
                                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${allEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'}`}
                                >
                                  {allEnabled ? 'Hammasini olib tashlash' : 'Hammasini tanlash'}
                                </button>
                              )}
                              <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="border-t border-slate-100 dark:border-slate-700 p-3 space-y-2 bg-slate-50/50 dark:bg-slate-800/50">
                              {group.permissions.map(perm => {
                                const isEnabled = form.permissions.includes(perm.key);
                                return (
                                  <button
                                    key={perm.key}
                                    type="button"
                                    onClick={() => togglePermission(perm.key)}
                                    className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all hover:bg-white dark:hover:bg-slate-700"
                                  >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isEnabled ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                      {isEnabled && <Check size={12} className="text-white" />}
                                    </div>
                                    <perm.Icon size={16} className={isEnabled ? 'text-indigo-500' : 'text-slate-400'} />
                                    <span className={`text-sm font-medium ${isEnabled ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>{perm.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                <Link href={`/users/${userId}`} className="px-5 py-2.5 mr-3 text-slate-600 hover:bg-slate-100 rounded-lg transition">Bekor</Link>
                <button type="submit" disabled={saving}
                  className="flex items-center px-5 py-2.5 bg-[#0f172a] dark:bg-teal-600 text-white font-bold rounded-lg disabled:opacity-50">
                  {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                  Saqlash
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Noma\'lum'}</div>
                    <div className="text-sm text-slate-500">{user?.email}</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user?.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Rol</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{user?.role}</div>
                </div>
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Omborxona</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{user?.warehouse?.name || 'Biriktirilmagan'}</div>
                </div>
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Telefon</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{user?.phone || 'Kiritilmagan'}</div>
                </div>
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Ro&apos;yxatdan o&apos;tgan</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{new Date(user?.createdAt || '').toLocaleDateString('uz-UZ')}</div>
                </div>
              </div>

              {/* View Permissions */}
              {isAdmin && user?.permissions && user.permissions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
                    <Shield size={14} className="mr-2 text-indigo-500" /> Berilgan ruxsatlar
                  </h3>
                  <div className="space-y-2">
                    {PERMISSION_GROUPS.filter(g => g.permissions.some(p => user.permissions.includes(p.key))).map(group => {
                      const enabledPerms = group.permissions.filter(p => user.permissions.includes(p.key));
                      return (
                        <div key={group.key} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <group.Icon size={16} className="text-indigo-500" />
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{group.label}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 ml-6">
                            {enabledPerms.map(p => (
                              <span key={p.key} className="inline-flex items-center px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                                <p.Icon size={12} className="mr-1.5" />
                                {p.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Subscriptions */}
        <div className="w-[400px] bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <DollarSign size={18} className="mr-2 text-teal-600" /> To&apos;lovlar
            </h2>
            <button onClick={() => setShowAddPayment(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition">
              + To&apos;lov qo&apos;shish
            </button>
          </div>

          {showAddPayment && (
            <form onSubmit={handleAddPayment} className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Summa</label>
                  <input type="number" step="0.01" required value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Valyuta</label>
                  <select value={paymentForm.currency} onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm">
                    <option value="USD">USD</option>
                    <option value="UZS">UZS</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Muddat</label>
                <input type="date" required value={paymentForm.dueDate} onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Izoh</label>
                <input type="text" value={paymentForm.note} onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddPayment(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg text-sm">Bekor</button>
                <button type="submit"
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold">Saqlash</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {user?.subscriptions?.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <DollarSign size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">To&apos;lovlar yo&apos;q</p>
              </div>
            ) : (
              user?.subscriptions?.map(sub => {
                const isOverdue = !sub.isPaid && new Date(sub.dueDate) < new Date();
                return (
                  <div key={sub.id} className={`p-3 border rounded-xl ${isOverdue ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{sub.amount} {sub.currency}</span>
                      <button onClick={() => togglePaymentStatus(sub.id, sub.isPaid)}
                        className={`p-1 rounded ${sub.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600'}`}>
                        {sub.isPaid ? <Check size={14} /> : <X size={14} />}
                      </button>
                    </div>
                    <div className="text-xs text-slate-500">
                      <div>Muddat: {new Date(sub.dueDate).toLocaleDateString('uz-UZ')}</div>
                      {sub.paidDate && <div>To&apos;langan: {new Date(sub.paidDate).toLocaleDateString('uz-UZ')}</div>}
                      {sub.note && <div className="mt-1 text-slate-400">{sub.note}</div>}
                    </div>
                    {isOverdue && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded text-[10px] font-bold uppercase">Qarzdor</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Send Products Modal */}
      {showSendProducts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
                <Send size={20} className="mr-2 text-emerald-500" /> Tovar yuborish
              </h2>
              <button onClick={() => setShowSendProducts(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {sendSuccess ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{sendSuccess}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Target user info */}
                <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{user?.name}</div>
                    <div className="text-xs text-slate-500">Ombor: {user?.warehouse?.name || 'Yo\'q'}</div>
                  </div>
                </div>

                {/* From warehouse */}
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Qaysi ombordan *</label>
                  <select value={sendFromWarehouse} onChange={e => setSendFromWarehouse(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                    <option value="">Tanlang...</option>
                    {warehouses.filter(w => w.id !== user?.warehouse?.id).map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                {/* Product search */}
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Mahsulot qo&apos;shish</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Qidirish..."
                      value={productSearch}
                      onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                      onFocus={() => setShowProductDropdown(true)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
                    />
                    {showProductDropdown && productSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredProducts.length === 0 ? (
                          <div className="p-3 text-center text-sm text-slate-500">Topilmadi</div>
                        ) : (
                          filteredProducts.slice(0, 8).map(product => (
                            <button key={product.id} onClick={() => addProductToSendCart(product)}
                              className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-sm border-b dark:border-slate-700 last:border-0">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{product.name}</div>
                              <div className="text-xs text-slate-500">{product.sku || '-'}</div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Cart */}
                {sendCart.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 block">Tanlangan mahsulotlar</label>
                    {sendCart.map(item => (
                      <div key={item.productId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex-1">{item.name}</div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSendCart(sendCart.map(i => i.productId === item.productId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}
                            className="w-7 h-7 bg-white dark:bg-slate-600 border rounded flex items-center justify-center text-sm">-</button>
                          <input type="number" value={item.quantity} min={1}
                            onChange={e => setSendCart(sendCart.map(i => i.productId === item.productId ? { ...i, quantity: Math.max(1, parseInt(e.target.value) || 1) } : i))}
                            className="w-14 text-center border rounded py-1 text-sm bg-white dark:bg-slate-600 dark:border-slate-500 text-slate-900 dark:text-slate-100" />
                          <button onClick={() => setSendCart(sendCart.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i))}
                            className="w-7 h-7 bg-white dark:bg-slate-600 border rounded flex items-center justify-center text-sm">+</button>
                          <button onClick={() => setSendCart(sendCart.filter(i => i.productId !== item.productId))}
                            className="p-1 text-red-500 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">{error}</div>
                )}

                <button
                  onClick={handleSendProducts}
                  disabled={sendLoading || sendCart.length === 0 || !sendFromWarehouse}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition flex items-center justify-center"
                >
                  {sendLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Send size={16} className="mr-2" /> Yuborish ({sendCart.length} ta mahsulot)</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}