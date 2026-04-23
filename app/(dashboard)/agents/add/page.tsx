'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Save, User, Percent, Building2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';

interface AppUser {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export default function AddAgentPage() {
  const router = useRouter();
  const { success, error } = useNotification();
  
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    phone: '',
    commissionRate: '10',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      error('Xatolik', 'Foydalanuvchilarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.userId && !formData.name) {
      newErrors.name = 'Foydalanuvchi tanlash yoki ism kiritish shart';
    }
    if (!formData.commissionRate || parseFloat(formData.commissionRate) < 0 || parseFloat(formData.commissionRate) > 100) {
      newErrors.commissionRate = 'Komissiya foizi 0-100% orasida bo\'lishi kerak';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      error('Xatolik', 'Barcha majburiy maydonlarni to\'ldiring');
      return;
    }

    setSubmitting(true);
    try {
      const selectedUser = users.find(u => u.id === formData.userId);
      const payload: any = {
        commissionRate: parseFloat(formData.commissionRate),
      };

      if (formData.userId) {
        payload.userId = formData.userId;
        payload.name = selectedUser?.name || '';
      } else {
        payload.name = formData.name;
        payload.phone = formData.phone;
      }

      const res = await fetch('/api/sales-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Agent muvaffaqiyatli yaratildi');
        router.push('/agents');
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Agent yaratishda xatolik');
      }
    } catch (err) {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/agents" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Yangi agent</h1>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Asosiy ma'lumotlar
              </h2>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <User size={12} />
                  Mavjud foydalanuvchi (ixtiyoriy)
                </label>
                <select
                  value={formData.userId}
                  onChange={e => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                >
                  <option value="">Foydalanuvchini tanlang...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email || u.phone || u.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center py-2">
                <span className="text-xs text-slate-500">- YOKI -</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  Ism *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Agent ismi"
                  disabled={!!formData.userId}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } ${formData.userId ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X size={12} />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  disabled={!!formData.userId}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Percent size={12} />
                  Komissiya foizi (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.commissionRate}
                  onChange={e => setFormData({ ...formData, commissionRate: e.target.value })}
                  placeholder="10"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white ${
                    errors.commissionRate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.commissionRate && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X size={12} />
                    {errors.commissionRate}
                  </p>
                )}
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    <Percent size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-1">Komissiya hisoblash</h4>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                      Har bir sotuvdan agentga avtomatik komissiya hisoblanadi: Sotuv summasi × {formData.commissionRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/agents"
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
              >
                Bekor qilish
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Yuborilmoqda...' : (
                  <>
                    <Save size={18} />
                    Saqlash
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
