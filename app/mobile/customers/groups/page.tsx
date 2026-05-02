'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Plus, Users, Shield, Tag, Save } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';
import type { LucideIcon } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string | null;
  defaultDiscount: number;
  _count?: { customers: number };
}

const iconColors = [
  'bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400',
  'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400',
  'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400',
];

const iconMap: LucideIcon[] = [Shield, Users, Users, Tag];

export default function MobileCustomerGroupsPage() {
  const { success, error } = useNotification();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', defaultDiscount: 0 });

  useEffect(() => {
    fetch('/api/customer-groups')
      .then(r => r.json())
      .then(data => {
        setGroups(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim()) {
      error('Xatolik', 'Guruh nomi kiritilishi shart');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/customer-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Guruh yaratildi');
        setShowAdd(false);
        setForm({ name: '', description: '', defaultDiscount: 0 });
        const r = await fetch('/api/customer-groups');
        setGroups(await r.json());
      } else {
        error('Xatolik', 'Yaratishda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Mijozlar guruhlari"
        backHref="/mobile/customers"
        rightAction={
          <button onClick={() => setShowAdd(true)}
            className="p-2.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-6 space-y-3 mt-2">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : groups.length > 0 ? (
          groups.map((g, i) => {
            const IconComp = iconMap[i % 4];
            return (
              <Link key={g.id} href={`/mobile/customers/groups/${g.id}`}
                className="block bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColors[i % 4]}`}>
                    <IconComp size={22} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{g._count?.customers || 0}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">mijozlar</div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-[15px] font-black text-slate-800 dark:text-white">{g.name}</div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2">{g.description || `Tavsif yo\u2019q`}</div>
                </div>
                <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chegirma</span>
                  <span className={`text-sm font-black px-2 py-0.5 rounded-md ${g.defaultDiscount > 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {g.defaultDiscount}%
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-16">
            <Users size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guruhlar topilmadi</p>
          </div>
        )}
      </div>

      {/* Add Group Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-5">Yangi guruh</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Guruh nomi *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Masalan: VIP mijozlar"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Tavsif</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Guruh haqida..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white min-h-[80px]" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Standart chegirma (%)</label>
                <input type="number" min="0" max="100" value={form.defaultDiscount}
                  onChange={e => setForm({ ...form, defaultDiscount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[12px] rounded-2xl active:scale-95 transition-transform">Bekor qilish</button>
              <button onClick={handleAdd} disabled={submitting}
                className="flex-1 py-3.5 bg-indigo-600 text-white font-black text-[12px] rounded-2xl active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={14} />
                {submitting ? 'Yaratilmoqda...' : 'Yaratish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
