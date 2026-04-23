'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Building2, Users, Package, DollarSign, MoreVertical, Edit, Trash2, Eye, TrendingUp, CreditCard, Shield } from 'lucide-react';
import { useNotification } from '@/lib/NotificationContext';
import Link from 'next/link';

interface Tenant {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  inn?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    warehouses: number;
  };
}

interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalWarehouses: number;
  monthlyRevenue: number;
}

export default function TenantsPage() {
  const { success, error, warning } = useNotification();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    inn: '',
    logo: '',
  });

  useEffect(() => {
    loadTenants();
    loadStats();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenants');
      if (res.ok) {
        const data = await res.json();
        setTenants(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      error('Xatolik', 'Tenantlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/tenants/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      warning('Diqqat', 'Kompaniya nomini kiritishingiz shart');
      return;
    }

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Tenant yaratildi');
        setShowModal(false);
        resetForm();
        loadTenants();
        loadStats();
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Yaratishda xatolik');
      }
    } catch (err) {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const handleUpdate = async () => {
    if (!editingTenant || !formData.name.trim()) {
      warning('Diqqat', 'Kompaniya nomini kiritishingiz shart');
      return;
    }

    try {
      const res = await fetch(`/api/tenants/${editingTenant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Tenant yangilandi');
        setShowModal(false);
        setEditingTenant(null);
        resetForm();
        loadTenants();
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Yangilashda xatolik');
      }
    } catch (err) {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi? Bu kompaniyadagi barcha ma\'lumotlar o\'chiriladi.')) return;

    try {
      await fetch(`/api/tenants/${id}`, { method: 'DELETE' });
      success('O\'chirildi', 'Tenant muvaffaqiyatli o\'chirildi');
      loadTenants();
      loadStats();
    } catch (err) {
      error('Xatolik', 'O\'chirishda xatolik');
    }
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !tenant.isActive }),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', tenant.isActive ? 'Tenant nofaol qilindi' : 'Tenant faol qilindi');
        loadTenants();
        loadStats();
      } else {
        error('Xatolik', 'O\'zgartirishda xatolik');
      }
    } catch (err) {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      inn: '',
      logo: '',
    });
  };

  const openEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      address: tenant.address || '',
      phone: tenant.phone || '',
      email: tenant.email || '',
      inn: tenant.inn || '',
      logo: tenant.logo || '',
    });
    setShowModal(true);
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.inn?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && t.isActive) ||
      (statusFilter === 'inactive' && !t.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="text-indigo-600" />
              Kompaniyalar (Tenants)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-tenant/SaaS boshqaruvi
            </p>
          </div>
          <button
            onClick={() => { setEditingTenant(null); resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
          >
            <Plus size={18} />
            Yangi kompaniya
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Building2 size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami kompaniyalar</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{stats?.totalTenants || 0}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Faol kompaniyalar</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{stats?.activeTenants || 0}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Users size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami foydalanuvchilar</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{stats?.totalUsers || 0}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Package size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami omborlar</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{stats?.totalWarehouses || 0}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Oylik daromad</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">${stats?.monthlyRevenue?.toLocaleString() || 0}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Kompaniya qidirish..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="all">Barchasi</option>
                  <option value="active">Faol</option>
                  <option value="inactive">Nofaol</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Building2 size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Kompaniyalar topilmadi</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTenants.map(tenant => (
                <div key={tenant.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {tenant.logo ? (
                        <img src={tenant.logo} alt={tenant.name} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Building2 size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{tenant.name}</h3>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tenant.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                            {tenant.isActive ? 'Faol' : 'Nofaol'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {tenant.inn && <span>INN: {tenant.inn}</span>}
                          {tenant.phone && <span>• {tenant.phone}</span>}
                          {tenant.email && <span>• {tenant.email}</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            <Users size={12} className="inline mr-1" />
                            {tenant._count?.users || 0} foydalanuvchi
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            <Package size={12} className="inline mr-1" />
                            {tenant._count?.warehouses || 0} ombor
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            Yaratilgan: {new Date(tenant.createdAt).toLocaleDateString('uz-UZ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(tenant)}
                        className={`p-2 rounded-lg transition-colors ${tenant.isActive ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title={tenant.isActive ? 'Nofaol qilish' : 'Faol qilish'}
                      >
                        <Shield size={16} />
                      </button>
                      <Link
                        href={`/tenants/${tenant.id}`}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        title="Ko'rish"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => openEditModal(tenant)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(tenant.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTenant ? 'Kompaniyani tahrirlash' : 'Yangi kompaniya'}
              </h3>
              <button
                onClick={() => { setShowModal(false); setEditingTenant(null); resetForm(); }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Kompaniya nomi *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Kompaniya nomi"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">INN</label>
                <input
                  type="text"
                  value={formData.inn}
                  onChange={e => setFormData({ ...formData, inn: e.target.value })}
                  placeholder="123456789"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Manzil</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Manzil"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@company.uz"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Logo URL</label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={e => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => { setShowModal(false); setEditingTenant(null); resetForm(); }}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor
              </button>
              <button
                onClick={editingTenant ? handleUpdate : handleSave}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
              >
                {editingTenant ? 'Yangilash' : 'Yaratish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
