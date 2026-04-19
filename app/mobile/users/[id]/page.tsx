'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Mail, Phone, Building2, Shield, Save, ToggleLeft, ToggleRight, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';
import { AdminGuard } from '@/components/mobile/PermissionGuard';

const ALL_PERMISSIONS = [
  { key: 'manage_products', label: 'Mahsulotlar', desc: "Qo'shish, tahrirlash, o'chirish", icon: '📦' },
  { key: 'manage_warehouse', label: 'Ombor', desc: 'Operatsiyalar va hisobot', icon: '🏭' },
  { key: 'manage_customers', label: 'Mijozlar', desc: "Ro'yxat va tranzaktsiyalar", icon: '👥' },
  { key: 'manage_suppliers', label: "Ta'minotchilar", desc: "Bilan ishlash", icon: '🚚' },
  { key: 'view_reports', label: 'Hisobotlar', desc: 'Statistika va grafiklar', icon: '📊' },
  { key: 'manage_sales', label: 'Savdo', desc: 'Yaratish va tahrirlash', icon: '🛒' },
  { key: 'manage_purchases', label: 'Xarid', desc: 'Kirim yaratish va tahrirlash', icon: '📥' },
];

export default function MobileUserDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { success, error } = useNotification();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'STAFF', isActive: true, permissions: [] as string[] });
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${id}`).then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
    ]).then(([userData, wData]) => {
      setUser(userData);
      setForm({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'STAFF',
        isActive: userData.isActive ?? true,
        permissions: userData.permissions || [],
      });
      setSelectedWarehouse(userData.warehouse?.id || '');
      setWarehouses(wData.data || wData || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const togglePermission = (key: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: any = { ...form, warehouseId: selectedWarehouse || null };
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        setEditing(false);
        success('Muvaffaqiyatli', 'Ma\'lumotlar saqlandi');
      } else {
        error('Xatolik', 'Saqlashda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSaving(false);
  };

  const roleLabel = (r: string) => r === 'ADMIN' ? 'Administrator' : r === 'MANAGER' ? 'Boshqaruvchi' : 'Xodim';

  if (loading) {
    return (
      <AdminGuard>
        <div className="w-full min-h-screen pb-28">
          <div className="px-6 pt-8 pb-4 flex items-center gap-3">
            <Link href="/mobile/users" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-800">
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </Link>
          </div>
          <div className="px-6 space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)}</div>
        </div>
      </AdminGuard>
    );
  }

  const displayPermissions = editing ? form.permissions : (user?.permissions || []);

  return (
    <AdminGuard>
      <div className="w-full min-h-screen pb-28">
        <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-40">
          <div className="flex items-center gap-3">
            <Link href="/mobile/users" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform">
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </Link>
            <h1 className="text-lg font-black text-slate-900 dark:text-white">Foydalanuvchi</h1>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="px-4 py-2 bg-amber-600 text-white text-[11px] font-black rounded-xl active:scale-95 transition-transform shadow-sm">
              Tahrirlash
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', role: user?.role || 'STAFF', isActive: user?.isActive ?? true, permissions: user?.permissions || [] }); }}
                className="p-2 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl active:scale-95">
                <X size={16} />
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white text-[11px] font-black rounded-xl active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1">
                <Save size={14} /> Saqlash
              </button>
            </div>
          )}
        </div>

        <div className="px-6 space-y-4 mt-2">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl font-black">
                {(editing ? form.name : user?.name)?.[0] || '?'}
              </div>
              <div>
                {editing ? (
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="text-lg font-black text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 w-full" />
                ) : (
                  <div className="text-lg font-black text-slate-900 dark:text-white">{user?.name || 'Nomsiz'}</div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    (editing ? form.role : user?.role) === 'ADMIN' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                    (editing ? form.role : user?.role) === 'MANAGER' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {roleLabel(editing ? form.role : user?.role)}
                  </span>
                  <span className={`text-[9px] font-bold ${(editing ? form.isActive : user?.isActive) ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {(editing ? form.isActive : user?.isActive) ? 'Aktiv' : 'Nofaol'}
                  </span>
                </div>
              </div>
            </div>

            {editing && (
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Telefon</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Rol</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                    <option value="STAFF">Xodim</option>
                    <option value="MANAGER">Boshqaruvchi</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Ombor</label>
                  <select value={selectedWarehouse} onChange={e => setSelectedWarehouse(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                    <option value="">Tanlanmagan</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Holat</span>
                  <button onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className="flex items-center gap-2">
                    {form.isActive ? (
                      <ToggleRight size={28} className="text-emerald-600" />
                    ) : (
                      <ToggleLeft size={28} className="text-slate-400" />
                    )}
                    <span className={`text-[11px] font-bold ${form.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {form.isActive ? 'Aktiv' : 'Nofaol'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {!editing && (
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-[12px]">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-2 text-[12px]">
                    <Phone size={14} className="text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300">{user.phone}</span>
                  </div>
                )}
                {user?.warehouse && (
                  <div className="flex items-center gap-2 text-[12px]">
                    <Building2 size={14} className="text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300">{user.warehouse.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Permissions */}
          {(editing ? form.role !== 'ADMIN' : user?.role !== 'ADMIN') && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-amber-500" />
                <h3 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Ruxsatlar</h3>
              </div>
              <div className="space-y-1">
                {ALL_PERMISSIONS.map(perm => {
                  const isOn = displayPermissions.includes(perm.key);
                  return (
                    <div key={perm.key}
                      onClick={() => editing && togglePermission(perm.key)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${editing ? 'active:scale-[0.98] cursor-pointer' : ''} ${isOn ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''}`}>
                      <span className="text-lg">{perm.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-slate-800 dark:text-white">{perm.label}</div>
                        <div className="text-[10px] text-slate-400">{perm.desc}</div>
                      </div>
                      {editing ? (
                        isOn ? <ToggleRight size={24} className="text-emerald-600" /> : <ToggleLeft size={24} className="text-slate-300 dark:text-slate-600" />
                      ) : isOn ? (
                        <Check size={16} className="text-emerald-600" />
                      ) : (
                        <X size={16} className="text-slate-300" />
                      )}
                    </div>
                  );
                })}
              </div>
              {editing && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setForm(prev => ({ ...prev, permissions: ALL_PERMISSIONS.map(p => p.key) }))}
                    className="flex-1 py-2 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl active:scale-95 transition-transform">
                    Hammasini yoqish
                  </button>
                  <button onClick={() => setForm(prev => ({ ...prev, permissions: [] }))}
                    className="flex-1 py-2 text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-500/10 rounded-xl active:scale-95 transition-transform">
                    Hammasini o'chirish
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
