'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Save, User, Mail, Phone, Lock, Shield, Building2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';
import { AdminGuard } from '@/components/mobile/PermissionGuard';
import type { LucideIcon } from 'lucide-react';

interface PermissionItem {
  key: string;
  label: string;
  Icon: LucideIcon;
}

interface PermissionGroup {
  key: string;
  label: string;
  Icon: LucideIcon;
  permissions: PermissionItem[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'warehouse',
    label: 'Omborni boshqarish',
    Icon: Building2,
    permissions: [
      { key: 'view_warehouse', label: `Ko\u2019rish`, Icon: Check },
      { key: 'edit_warehouse', label: 'Tahrirlash', Icon: Check },
      { key: 'delete_warehouse', label: `O\u2019chirish`, Icon: Check },
    ],
  },
  {
    key: 'products',
    label: 'Mahsulotlarni boshqarish',
    Icon: Shield,
    permissions: [
      { key: 'view_products', label: `Ko\u2019rish`, Icon: Check },
      { key: 'create_products', label: 'Yaratish', Icon: Check },
      { key: 'edit_products', label: 'Tahrirlash', Icon: Check },
      { key: 'delete_products', label: `O\u2019chirish`, Icon: Check },
    ],
  },
  {
    key: 'customers',
    label: 'Mijozlarni boshqarish',
    Icon: User,
    permissions: [
      { key: 'view_customers', label: `Ko\u2019rish`, Icon: Check },
      { key: 'create_customers', label: 'Yaratish', Icon: Check },
      { key: 'edit_customers', label: 'Tahrirlash', Icon: Check },
      { key: 'delete_customers', label: `O\u2019chirish`, Icon: Check },
    ],
  },
  {
    key: 'sales',
    label: 'Savdoni boshqarish',
    Icon: Shield,
    permissions: [
      { key: 'view_sales', label: `Ko\u2019rish`, Icon: Check },
      { key: 'create_sales', label: 'Yaratish', Icon: Check },
      { key: 'edit_sales', label: 'Tahrirlash', Icon: Check },
      { key: 'delete_sales', label: `O\u2019chirish`, Icon: Check },
    ],
  },
  {
    key: 'reports',
    label: `Hisobotlarni ko\u2019rish`,
    Icon: Shield,
    permissions: [
      { key: 'view_reports', label: `Ko\u2019rish`, Icon: Check },
      { key: 'export_reports', label: 'Eksport', Icon: Check },
    ],
  },
];

export default function MobileAddUserPage() {
  const router = useRouter();
  const { success, error } = useNotification();
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
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
    fetch('/api/warehouses')
      .then(r => r.json())
      .then(data => setWarehouses(data.data || data || []))
      .catch(() => {});
  }, []);

  const togglePermission = (perm: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupKey) ? prev.filter(k => k !== groupKey) : [...prev, groupKey]
    );
  };

  const toggleAllGroupPerms = (group: PermissionGroup) => {
    const allKeys = group.permissions.map(p => p.key);
    const allEnabled = allKeys.every(k => form.permissions.includes(k));
    if (allEnabled) {
      setForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => !allKeys.includes(p)) }));
    } else {
      setForm(prev => ({ ...prev, permissions: Array.from(new Set([...prev.permissions, ...allKeys])) }));
    }
  };

  const handleSubmit = async () => {
    if (!form.email.trim()) {
      error('Xatolik', 'Email kiritilishi shart');
      return;
    }
    if (!form.password || form.password.length < 6) {
      error('Xatolik', 'Parol kamida 6 belgidan iborat bo\u2019lishi kerak');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          warehouseId: form.warehouseId || null,
        }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Foydalanuvchi yaratildi');
        router.push('/mobile/users');
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Yaratishda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setLoading(false);
  };

  return (
    <AdminGuard>
      <div className="w-full min-h-screen pb-28">
        <MobileHeader
          title="Yangi foydalanuvchi"
          backHref="/mobile/users"
          rightAction={
            <button onClick={handleSubmit} disabled={loading}
              className="px-3 py-1.5 bg-amber-600 text-white text-[11px] font-black rounded-xl active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1">
              <Save size={12} /> Saqlash
            </button>
          }
        />

        <div className="px-6 space-y-4 mt-2">
          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asosiy ma\u2019lumotlar</div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
                <User size={10} /> Ism
              </label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Masalan: Sardor Aliyev"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-white" />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
                <Mail size={10} /> Email *
              </label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="sardor@example.com"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-white" />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
                <Lock size={10} /> Parol *
              </label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Kamida 6 belgi"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-white" />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
                <Phone size={10} /> Telefon
              </label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-white" />
            </div>
          </div>

          {/* Role & Warehouse */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rol va ombor</div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
                <Shield size={10} /> Rol *
              </label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-white">
                <option value="STAFF">Xodim - Cheklangan</option>
                <option value="MANAGER">Boshqaruvchi - O\u2019z ombori</option>
                <option value="ADMIN">Administrator - To\u2019liq huquq</option>
              </select>
              <p className="mt-1 text-[10px] text-slate-400">Admin: to\u2019liq huquq, Manager: o\u2019z ombori, Staff: cheklangan</p>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
                <Building2 size={10} /> Omborxona
              </label>
              <select value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-white">
                <option value="">Biriktirilmagan</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between py-2">
              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Holat</span>
              <button onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`w-12 h-7 rounded-full transition-colors ${form.isActive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isActive ? 'translate-x-6.5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Permissions */}
          {form.role !== 'ADMIN' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Shield size={10} /> Ruxsatlar
              </div>
              <p className="text-[10px] text-slate-400">Foydalanuvchiga qaysi funksiyalarni berishni tanlang.</p>

              <div className="space-y-2">
                {PERMISSION_GROUPS.map(group => {
                  const isExpanded = expandedGroups.includes(group.key);
                  const enabledCount = group.permissions.filter(p => form.permissions.includes(p.key)).length;
                  const allEnabled = enabledCount === group.permissions.length;
                  const GroupIcon = group.Icon;

                  return (
                    <div key={group.key} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.key)}
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <GroupIcon size={18} className={allEnabled ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'} />
                          <div className="text-left">
                            <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{group.label}</div>
                            {enabledCount > 0 && (
                              <div className="text-[10px] text-amber-500">{enabledCount}/{group.permissions.length} tanlangan</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleAllGroupPerms(group); }}
                            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${allEnabled ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                          >
                            {allEnabled ? `Hammasini olib tashlash` : 'Hammasini tanlash'}
                          </button>
                          {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
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
                                className="w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-white dark:hover:bg-slate-700"
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isEnabled ? 'bg-amber-500 border-amber-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                  {isEnabled && <Check size={12} className="text-white" />}
                                </div>
                                <span className={`text-[12px] font-medium ${isEnabled ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>{perm.label}</span>
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

          {/* Submit Button */}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 bg-amber-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50">
            <Save size={18} />
            {loading ? 'Yaratilmoqda...' : 'Foydalanuvchi yaratish'}
          </button>
        </div>
      </div>
    </AdminGuard>
  );
}
