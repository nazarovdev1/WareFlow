'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building2, User, Mail, Phone, Lock, Shield, ChevronDown, Check, Eye, Pencil, Trash, Plus, Warehouse, Package, Users, Truck, BarChart3, ShoppingCart, ClipboardList, RotateCcw, Download } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Warehouse {
  id: string;
  name: string;
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

export default function AddUserPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
    phone: '',
    warehouseId: '',
    isActive: true,
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/warehouses');
      const data = await res.json();
      setWarehouses(data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          warehouseId: form.warehouseId || null,
          permissions: form.permissions || [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Xatolik yuz berdi');
      }

      router.push('/users');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 font-sans w-full h-full flex flex-col text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link href="/users" className="p-2 mr-4 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Yangi Foydalanuvchi</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Bozor ishchisi uchun account yaratish</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <User size={14} className="mr-1" /> Ism
            </label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="Masalan: Sardor Aliyev" />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <Mail size={14} className="mr-1" /> Email <span className="text-red-500 ml-1">*</span>
            </label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="sardor@example.com" />
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <Lock size={14} className="mr-1" /> Parol <span className="text-red-500 ml-1">*</span>
            </label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="Kamida 6 belgi" />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <Phone size={14} className="mr-1" /> Telefon
            </label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="+998 90 123 45 67" />
          </div>

          {/* Role */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <Shield size={14} className="mr-1" /> Rol <span className="text-red-500 ml-1">*</span>
            </label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
              <option value="STAFF">Staff - Oddiy xodim</option>
              <option value="MANAGER">Manager - Murabbiy</option>
              <option value="ADMIN">Admin - Administrator</option>
            </select>
            <p className="mt-1 text-xs text-slate-400">Admin: to'liq huquq, Manager: o'z ombori, Staff: cheklangan</p>
          </div>

          {/* Warehouse */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <Building2 size={14} className="mr-1" /> Omborxona
            </label>
            <select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
              <option value="">Biriktirilmagan</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <p className="mt-1 text-xs text-slate-400">User faqat shu omborxona ma'lumotlarini ko'radi</p>
          </div>

          {/* Permissions Section */}
          {form.role !== 'ADMIN' && (
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

          {/* Active Status */}
          <div className="flex items-center">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-600 w-5 h-5 text-teal-600 focus:ring-teal-500" />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Active holatda yaratish
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
            <Link href="/users" className="px-6 py-2.5 mr-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition font-medium">
              Bekor qilish
            </Link>
            <button type="submit" disabled={loading}
              className="flex items-center px-6 py-2.5 bg-[#0f172a] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-bold rounded-lg shadow transition disabled:opacity-50">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save size={18} className="mr-2" />
              )}
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}