'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, MoreVertical, Users as UsersIcon, UserCheck, UserX, Eye, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  warehouse: { id: string; name: string } | null;
  _count: { subscriptions: number };
  createdAt: string;
}

interface Warehouse {
  id: string;
  name: string;
}

export default function UsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchWarehouses();
  }, [page, search, roleFilter, warehouseFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (warehouseFilter) params.append('warehouseId', warehouseFilter);
      if (statusFilter) params.append('isActive', statusFilter === 'active' ? 'true' : 'false');

      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/warehouses');
      const data = await res.json();
      setWarehouses(data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
    setShowDropdown(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Haqiqatan ham ushbu foydalanuvchini o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
    setShowDropdown(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'MANAGER': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border-slate-200 dark:border-slate-600';
    }
  };

  return (
    <div className="p-6 font-sans w-full h-full flex flex-col text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <UsersIcon className="text-teal-600 dark:text-teal-400" size={28} />
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Foydalanuvchilar</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Bozor ishchilari va ularning to'lovlari</p>
        </div>
        <Link href="/users/add" className="flex items-center px-5 py-2.5 bg-[#0f172a] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-bold rounded-lg shadow-lg transition">
          <Plus size={18} className="mr-2" /> Yangi Foydalanuvchi
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Qidirish..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
            </div>
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
            <option value="">Barcha rollar</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="STAFF">Staff</option>
          </select>
          <select value={warehouseFilter} onChange={(e) => { setWarehouseFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
            <option value="">Barcha omborlar</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
            <option value="">Barcha holatlar</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 flex-1">
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Foydalanuvchi</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Omborxona</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Holat</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Obuna</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ro'yxatdan o'tgan</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">Yuklanmoqda...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">Foydalanuvchilar topilmadi</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{user.name || 'Noma\'lum'}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-md">
                    {user.warehouse?.name || 'Biriktirilmagan'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {user.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{user._count.subscriptions}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(user.createdAt).toLocaleDateString('uz-UZ')}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="relative inline-block">
                    <button onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                      <MoreVertical size={16} className="text-slate-400" />
                    </button>
                    {showDropdown === user.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                        <Link href={`/users/${user.id}`} className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                          <Eye size={14} className="mr-2" /> Ko'rish
                        </Link>
                        <Link href={`/users/${user.id}?edit=true`} className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                          <Edit size={14} className="mr-2" /> Tahrirlash
                        </Link>
                        <button onClick={() => toggleUserStatus(user.id, user.isActive)} className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {user.isActive ? <><UserX size={14} className="mr-2" /> Blocklov</> : <><UserCheck size={14} className="mr-2" /> Activlashtirish</>}
                        </button>
                        <button onClick={() => deleteUser(user.id)} className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400">
                          <Trash2 size={14} className="mr-2" /> O'chirish
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold bg-slate-50 dark:bg-slate-700/50">
          <span className="text-slate-500 dark:text-slate-400">Ko'rsatilmoqda: {users.length} ta</span>
          <div className="flex items-center space-x-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 bg-[#0f172a] dark:bg-teal-600 text-white rounded-lg">{page}</span>
            <span className="text-slate-500 dark:text-slate-400 mx-2">/ {pagination.totalPages}</span>
            <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page === pagination.totalPages}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}