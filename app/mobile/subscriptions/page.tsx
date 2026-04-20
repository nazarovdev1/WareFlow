'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Search, CreditCard, Check, Clock, AlertTriangle, DollarSign, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';
import { AdminGuard } from '@/components/mobile/PermissionGuard';

export default function MobileSubscriptionsPage() {
  const { success, error } = useNotification();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ userId: '', amount: '', currency: 'USD', dueDate: '', note: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/subscriptions').then(r => r.json()),
      fetch('/api/users?limit=50').then(r => r.json()),
    ]).then(([pData, uData]) => {
      setPayments(pData.data || pData || []);
      setUsers(uData.data || uData || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p => statusFilter === 'ALL' || p.status === statusFilter);

  const totalPaid = payments.filter(p => p.isPaid).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalPending = payments.filter(p => !p.isPaid).reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const togglePaid = async (p: any) => {
    try {
      const res = await fetch(`/api/subscriptions/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: !p.isPaid }),
      });
      if (res.ok) {
        setPayments(prev => prev.map(item => item.id === p.id ? { ...item, isPaid: !p.isPaid } : item));
      }
    } catch {}
  };

  const handleAdd = async () => {
    if (!form.userId || !form.amount) { error('Xatolik', 'Maydonlarni to\'ldiring'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', "To'lov qo'shildi");
        setShowAdd(false);
        setForm({ userId: '', amount: '', currency: 'USD', dueDate: '', note: '' });
        const pData = await fetch('/api/subscriptions').then(r => r.json());
        setPayments(pData.data || pData || []);
      } else {
        error('Xatolik', "Qo'shishda xatolik");
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSubmitting(false);
  };

  return (
    <AdminGuard>
      <div className="w-full min-h-screen pb-28">
        <MobileHeader 
          title="To'lovlar" 
          backHref="/mobile" 
          rightAction={
            <button onClick={() => setShowAdd(true)}
              className="p-2.5 bg-pink-600 text-white rounded-full shadow-lg shadow-pink-500/30 active:scale-95 transition-transform">
              <Plus size={20} />
            </button>
          } 
        />

        <div className="px-6 mb-4 mt-2 grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-slate-900 dark:text-white">
            <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">To'langan</div>
            <div className="text-xl font-black">${totalPaid.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-slate-900 dark:text-white">
            <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Kutilmoqda</div>
            <div className="text-xl font-black">${totalPending.toLocaleString()}</div>
          </div>
        </div>

        <div className="px-6 mb-5 flex gap-2">
          {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${statusFilter === s ? 'bg-pink-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200/60 dark:border-slate-800'}`}>
              {s === 'ALL' ? 'Hammasi' : s === 'PAID' ? "To'langan" : s === 'OVERDUE' ? 'Kechikkan' : 'Kutilmoqda'}
            </button>
          ))}
        </div>

        <div className="px-6 space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
          ) : filtered.length > 0 ? (
            filtered.map(p => (
              <div key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <button onClick={() => togglePaid(p)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform ${
                    p.isPaid ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                  {p.isPaid ? <Check size={20} /> : <Clock size={20} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-slate-800 dark:text-white truncate">{p.user?.name || p.user?.email || 'User'}</div>
                  <div className="text-[10px] text-slate-400">
                    {p.dueDate ? new Date(p.dueDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) : '-'}
                    {p.note && <span className="ml-2">{p.note}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[13px] font-black text-slate-900 dark:text-white">{Number(p.amount).toLocaleString()} {p.currency}</div>
                  <div className={`text-[9px] font-bold ${
                    p.isPaid ? 'text-emerald-600' : new Date(p.dueDate) < new Date() ? 'text-rose-500' : 'text-amber-500'
                  }`}>
                    {p.isPaid ? "To'langan" : new Date(p.dueDate) < new Date() ? 'Kechikkan' : 'Kutilmoqda'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <CreditCard size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">To'lovlar yo'q</p>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center px-6">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-5">Yangi to'lov</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">Foydalanuvchi *</label>
                  <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20">
                    <option value="">Tanlang...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">Summa *</label>
                    <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                      placeholder="0" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">Valyuta</label>
                    <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20">
                      <option value="USD">USD</option>
                      <option value="UZS">UZS</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">Muddat</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">Izoh</label>
                  <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                    placeholder="Izoh..." className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[12px] rounded-2xl active:scale-95 transition-transform">Bekor</button>
                <button onClick={handleAdd} disabled={submitting}
                  className="flex-1 py-3 bg-pink-600 text-white font-black text-[12px] rounded-2xl active:scale-95 transition-transform disabled:opacity-50">
                  {submitting ? 'Yuborilmoqda...' : "Qo'shish"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
