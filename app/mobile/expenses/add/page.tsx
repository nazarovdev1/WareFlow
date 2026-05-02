'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

export default function MobileAddExpense() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
  });

  useEffect(() => {
    fetch('/api/expense-categories')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : d.data || []))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!form.description || !form.amount) return;
    setSaving(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description,
          amount: Number(form.amount),
          categoryId: form.categoryId || undefined,
          date: form.date,
          paymentMethod: form.paymentMethod,
        }),
      });
      if (res.ok) {
        router.push('/mobile/expenses');
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Yangi xarajat" backHref="/mobile/expenses" />

      <div className="px-6 mt-2 space-y-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 mb-2 block">Tavsif</label>
          <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Xarajat tavsifi..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 mb-2 block">Summa ($)</label>
          <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 mb-2 block">Kategoriya</label>
          <div className="relative">
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm appearance-none">
              <option value="">Tanlang...</option>
              {categories.map((c: Record<string, unknown>) => (
                <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 mb-2 block">Sana</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 mb-2 block">To{'\u2019'}lov usuli</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setForm({ ...form, paymentMethod: 'CASH' })}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${form.paymentMethod === 'CASH' ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              Naqd
            </button>
            <button onClick={() => setForm({ ...form, paymentMethod: 'CARD' })}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${form.paymentMethod === 'CARD' ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              Karta
            </button>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving || !form.description || !form.amount}
          className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold text-sm active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100">
          {saving ? 'Saqlanmoq...' : 'Saqlash'}
        </button>
      </div>
    </div>
  );
}
