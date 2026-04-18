'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, Search, Filter, ChevronLeft, ChevronRight, Check, X, AlertTriangle, Clock, DollarSign, User as UserIcon } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Subscription {
  id: string;
  amount: number;
  currency: string;
  dueDate: string;
  isPaid: boolean;
  paidDate: string | null;
  note: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    warehouse: { id: string; name: string } | null;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

export default function SubscriptionsPage() {
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ userId: '', amount: '', currency: 'USD', dueDate: '', note: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
    fetchUsers();
  }, [page, search, statusFilter, userFilter, monthFilter]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (userFilter) params.append('userId', userFilter);
      if (monthFilter) params.append('month', monthFilter);

      const res = await fetch(`/api/subscriptions?${params}`);
      const data = await res.json();
      setSubscriptions(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users?limit=100');
      const data = await res.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const togglePaid = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPaid: !currentStatus,
          paidDate: !currentStatus ? new Date().toISOString() : null,
        }),
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error toggling paid status:', error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.userId,
          amount: parseFloat(form.amount),
          currency: form.currency,
          dueDate: form.dueDate,
          note: form.note || undefined,
        }),
      });
      if (!res.ok) throw new Error('Xatolik');
      setShowAddModal(false);
      setForm({ userId: '', amount: '', currency: 'USD', dueDate: '', note: '' });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error adding subscription:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (sub: Subscription) => {
    if (sub.isPaid) {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><Check size={10} className="mr-1" /> To'langan</span>;
    }
    if (new Date(sub.dueDate) < new Date()) {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"><AlertTriangle size={10} className="mr-1" /> Qarzdor</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><Clock size={10} className="mr-1" /> Kutilmoqda</span>;
  };

  const stats = {
    total: subscriptions.length,
    paid: subscriptions.filter(s => s.isPaid).length,
    overdue: subscriptions.filter(s => !s.isPaid && new Date(s.dueDate) < new Date()).length,
    pending: subscriptions.filter(s => !s.isPaid && new Date(s.dueDate) >= new Date()).length,
  };

  return (
    <div className="p-6 font-sans w-full h-full flex flex-col text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <CreditCard className="text-teal-600 dark:text-teal-400" size={28} />
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">To'lovlar</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Userlarning oylik to'lovlari</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center px-5 py-2.5 bg-[#0f172a] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-bold rounded-lg shadow-lg transition">
          <span className="mr-2">+</span> Yangi To'lov
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold uppercase text-slate-500 mb-1">Jami</div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{pagination.total}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 border-l-4 border-l-emerald-500">
          <div className="text-xs font-bold uppercase text-emerald-600 mb-1">To'langan</div>
          <div className="text-2xl font-black text-emerald-600">{stats.paid}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-amber-200 dark:border-amber-800 border-l-4 border-l-amber-500">
          <div className="text-xs font-bold uppercase text-amber-600 mb-1">Kutilmoqda</div>
          <div className="text-2xl font-black text-amber-600">{stats.pending}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-red-200 dark:border-red-800 border-l-4 border-l-red-500">
          <div className="text-xs font-bold uppercase text-red-600 mb-1">Qarzdor</div>
          <div className="text-2xl font-black text-red-600">{stats.overdue}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="User qidirish..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
            </div>
          </div>
          <select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
            <option value="">Barcha userlar</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
            <option value="">Barcha holatlar</option>
            <option value="paid">To'langan</option>
            <option value="pending">Kutilmoqda</option>
            <option value="overdue">Qarzdor</option>
          </select>
          <input type="month" value={monthFilter} onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Yangi To'lov</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">User *</label>
                <select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  <option value="">User tanlang</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Summa *</label>
                  <input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Valyuta</label>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                    <option value="USD">USD</option>
                    <option value="UZS">UZS</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Muddat *</label>
                <input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Izoh</label>
                <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition">Bekor</button>
                <button type="submit" disabled={saving}
                  className="flex items-center px-5 py-2.5 bg-[#0f172a] dark:bg-teal-600 text-white font-bold rounded-lg disabled:opacity-50">
                  {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <DollarSign size={18} className="mr-2" />}
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 flex-1">
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Omborxona</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Summa</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Muddat</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Holat</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">Yuklanmoqda...</td></tr>
            ) : subscriptions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">To'lovlar topilmadi</td></tr>
            ) : subscriptions.map(sub => (
              <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs mr-3">
                      {sub.user.name?.charAt(0).toUpperCase() || sub.user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{sub.user.name || 'Noma\'lum'}</div>
                      <div className="text-xs text-slate-500">{sub.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{sub.user.warehouse?.name || 'Biriktirilmagan'}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-black text-slate-900 dark:text-slate-100">{sub.amount} {sub.currency}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-600 dark:text-slate-300">{new Date(sub.dueDate).toLocaleDateString('uz-UZ')}</div>
                  {sub.paidDate && <div className="text-xs text-emerald-600 mt-0.5">To'langan: {new Date(sub.paidDate).toLocaleDateString('uz-UZ')}</div>}
                </td>
                <td className="px-6 py-4 text-center">{getStatusBadge(sub)}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => togglePaid(sub.id, sub.isPaid)}
                    className={`p-2 rounded-lg transition ${sub.isPaid ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600'}`}
                    title={sub.isPaid ? 'To\'lovni bekor qilish' : 'To\'lovni tasdiqlash'}>
                    {sub.isPaid ? <X size={16} /> : <Check size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold bg-slate-50 dark:bg-slate-700/50">
          <span className="text-slate-500 dark:text-slate-400">Ko'rsatilmoqda: {subscriptions.length} ta</span>
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
    </div>
  );
}