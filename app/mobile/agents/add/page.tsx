'use client';

import { useState, useEffect } from 'react';
import { Save, User, Phone, Percent } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useNotification } from '@/lib/NotificationContext';

interface SystemUser {
  id: string;
  name: string;
  email: string;
}

export default function MobileAddAgentPage() {
  const router = useRouter();
  const { success, error } = useNotification();

  const [users, setUsers] = useState<SystemUser[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    commissionRate: '',
    userId: '',
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // silently handle
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      error('Xatolik', 'Agent ismi kiritilishi shart');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/sales-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || null,
          commissionRate: formData.commissionRate ? Number(formData.commissionRate) : 0,
          userId: formData.userId || null,
          isActive: formData.isActive,
        }),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Agent muvaffaqiyatli yaratildi');
        router.push('/mobile/agents');
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Agent yaratishda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Yangi agent"
        backHref="/mobile/agents"
      />

      <div className="px-4 space-y-4">
        {/* Name */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Agent ismi *</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ism kiriting"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Telefon</label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              placeholder="+998 XX XXX XX XX"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Commission Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Komissiya foizi</label>
          <div className="relative">
            <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              placeholder="0"
              value={formData.commissionRate}
              onChange={e => setFormData({ ...formData, commissionRate: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Link to User */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">{`Foydalanuvchi bog\u2019lash`}</label>
          <select
            value={formData.userId}
            onChange={e => setFormData({ ...formData, userId: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="">Tanlanmagan</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>

        {/* Active Toggle */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 dark:text-white">Faol</span>
            <button
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`w-12 h-7 rounded-full transition-colors ${formData.isActive ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.isActive ? 'translate-x-6.5' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <Save size={18} />
          {submitting ? 'Yaratilmoqda...' : 'Agent yaratish'}
        </button>
      </div>
    </div>
  );
}
