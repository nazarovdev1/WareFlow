'use client';

import { useState } from 'react';
import { ChevronLeft, User, Phone, Building2, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileAddCustomerPage() {
  const router = useRouter();
  const { success, error } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '', companyName: '', phone: '', region: '', group: '',
    balanceUSD: '', balanceUZS: '', isActive: true,
  });

  const handleSubmit = async () => {
    if (!form.fullName.trim()) { error('Xatolik', 'Ism kiritilishi shart'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          companyName: form.companyName || undefined,
          phone: form.phone || undefined,
          region: form.region || undefined,
          balanceUSD: form.balanceUSD ? Number(form.balanceUSD) : 0,
          balanceUZS: form.balanceUZS ? Number(form.balanceUZS) : 0,
          isActive: form.isActive,
        }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', "Mijoz qo'shildi");
        router.push('/mobile/customers');
      } else {
        error('Xatolik', "Qo'shishda xatolik");
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <div className="px-6 pt-8 pb-4 flex items-center gap-3 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-40">
        <Link href="/mobile/customers" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform">
          <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </Link>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Yangi mijoz</h1>
      </div>

      <div className="px-6 space-y-4 mt-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
              <User size={12} /> Ism familiya *
            </label>
            <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
              placeholder="Ism familiya"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Building2 size={12} /> Kompaniya
            </label>
            <input type="text" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })}
              placeholder="Kompaniya nomi"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Phone size={12} /> Telefon
            </label>
            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+998 90 123 45 67"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Viloyat</label>
            <input type="text" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}
              placeholder="Viloyat"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Boshlang'ich balans</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1 block">USD</label>
              <input type="number" value={form.balanceUSD} onChange={e => setForm({ ...form, balanceUSD: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1 block">UZS</label>
              <input type="number" value={form.balanceUZS} onChange={e => setForm({ ...form, balanceUZS: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 bg-indigo-600 text-white font-black text-[13px] rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50">
          {submitting ? 'Yuborilmoqda...' : <><Check size={18} /> Mijozni qo'shish</>}
        </button>
      </div>
    </div>
  );
}
