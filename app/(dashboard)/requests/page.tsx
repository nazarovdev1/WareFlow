'use client';
import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, ChevronDown, Check, X, UserPlus, Building2, Clock, AlertTriangle, Shield, Eye, Pencil, Trash, Plus, Warehouse, Package, Users, Truck, BarChart3, ShoppingCart, ClipboardList, RotateCcw, Download } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface UserRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  warehouse: { id: string; name: string } | null;
  status: string;
  note: string | null;
  createdAt: string;
}

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

export default function RequestsPage() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  const [form, setForm] = useState({ role: 'STAFF', warehouseId: '', note: '', permissions: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  useEffect(() => {
    fetchRequests();
    fetchWarehouses();
  }, [page, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/register/requests?${params}`);
      const data = await res.json();
      setRequests(data.data || []);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
    } catch (error) {
      console.error('Error fetching requests:', error);
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

  const handleApprove = (request: UserRequest) => {
    setSelectedRequest(request);
    setForm({ role: 'STAFF', warehouseId: request.warehouse?.id || '', note: '', permissions: [] });
    setExpandedGroups([]);
    setShowApproveModal(true);
  };

  const togglePermission = (perm: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSubmit = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;
    setSaving(true);

    try {
      const res = await fetch('/api/register/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          action,
          role: form.role,
          warehouseId: form.warehouseId || null,
          note: form.note || null,
          permissions: form.permissions || [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Xatolik');
        return;
      }

      alert(action === 'approve' ? 'User yaratildi!' : 'Rad etildi');
      setShowApproveModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><Clock size={10} className="mr-1" /> Kutilmoqda</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><Check size={10} className="mr-1" /> Tasdiqlangan</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"><X size={10} className="mr-1" /> Rad etilgan</span>;
      default:
        return null;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="p-6 font-sans w-full h-full flex flex-col text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <UserPlus className="text-teal-600 dark:text-teal-400" size={28} />
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Ro'yxatdan o'tish so'rovlari</h1>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{pendingCount}</span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Yangi userlarni tasdiqlash</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex gap-4">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
            <option value="PENDING">Kutilmoqda</option>
            <option value="APPROVED">Tasdiqlangan</option>
            <option value="REJECTED">Rad etilgan</option>
            <option value="">Barchasi</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 flex-1">
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Foydalanuvchi</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Omborxona</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Holat</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sana</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">Yuklanmoqda...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">So'rovlar yo'q</td></tr>
            ) : requests.map(req => (
              <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                      {req.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{req.name}</div>
                      <div className="text-xs text-slate-500">{req.email}</div>
                      {req.phone && <div className="text-xs text-slate-400">{req.phone}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{req.warehouse?.name || 'Biriktirilmagan'}</span>
                </td>
                <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-500">{new Date(req.createdAt).toLocaleDateString('uz-UZ')}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  {req.status === 'PENDING' && (
                    <button onClick={() => handleApprove(req)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition">
                      Ko'rish
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold bg-slate-50 dark:bg-slate-700/50">
          <span className="text-slate-500 dark:text-slate-400">Ko'rsatilmoqda: {requests.length} ta</span>
          <div className="flex items-center space-x-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 bg-[#0f172a] dark:bg-teal-600 text-white rounded-lg">{page}</span>
            <span className="text-slate-500 mx-2">/ {pagination.totalPages}</span>
            <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page === pagination.totalPages}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">So'rovni ko'rish</h2>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold mr-4">
                  {selectedRequest.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{selectedRequest.name}</div>
                  <div className="text-sm text-slate-500">{selectedRequest.email}</div>
                  {selectedRequest.phone && <div className="text-xs text-slate-400">{selectedRequest.phone}</div>}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Rol *</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  <option value="STAFF">Staff - Oddiy xodim</option>
                  <option value="MANAGER">Manager - Murabbiy</option>
                  <option value="ADMIN">Admin - Administrator</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Omborxona</label>
                <select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  <option value="">Biriktirmasdan qoldirish</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              {form.role !== 'ADMIN' && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center">
                    <Shield size={16} className="mr-2 text-indigo-500" /> Ruxsatlar (Permissions)
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Foydalanuvchiga qaysi funksiyalarni berishni tanlang.</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
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

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Izoh</label>
                <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Izoh (ixtiyoriy)" />
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => handleSubmit('reject')} disabled={saving}
                className="flex-1 px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition disabled:opacity-50">
                <X size={16} className="inline mr-2" />
                Rad etish
              </button>
              <button onClick={() => handleSubmit('approve')} disabled={saving}
                className="flex-1 flex items-center justify-center px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition disabled:opacity-50">
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={16} className="mr-2" /> Tasdiqlash</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}