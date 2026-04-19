'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Search, Truck, Plus, Phone, X, Check, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileSuppliersPage() {
  const { success, error } = useNotification();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', contactPerson: '', phone: '', category: 'WHOLESALER' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/suppliers')
      .then(r => r.json())
      .then(data => {
        setSuppliers(data.data || data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = suppliers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    (s.contactPerson || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name.trim()) { error('Xatolik', 'Nom kiritilishi shart'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', "Ta'minotchi qo'shildi");
        setShowAdd(false);
        setForm({ name: '', contactPerson: '', phone: '', category: 'WHOLESALER' });
        const r = await fetch('/api/suppliers');
        const d = await r.json();
        setSuppliers(d.data || d || []);
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
      <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <Link href="/mobile" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Ta'minotchilar</h1>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="p-2.5 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform">
          <Plus size={20} />
        </button>
      </div>

      <div className="px-6 mb-5 mt-2">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Qidirish..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm text-slate-800 dark:text-white" />
        </div>
      </div>

      <div className="px-6 space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : filtered.length > 0 ? (
          filtered.map(supplier => (
            <div key={supplier.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Truck size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{supplier.name}</div>
                  {supplier.contactPerson && <div className="text-[11px] text-slate-400">{supplier.contactPerson}</div>}
                </div>
                <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  supplier.category === 'MANUFACTURER' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                  supplier.category === 'WHOLESALER' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                }`}>
                  {supplier.category === 'MANUFACTURER' ? 'Ishlab chiqaruvchi' : supplier.category === 'WHOLESALER' ? 'Ulgorituvchi' : 'Mahalliy'}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800/50">
                {supplier.phone && (
                  <a href={`tel:${supplier.phone}`} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                    <Phone size={11} /> {supplier.phone}
                  </a>
                )}
                <Link href="/mobile/suppliers/creditors"
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-black active:scale-95 transition-transform">
                  <Building2 size={12} /> Qarzlar
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Truck size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ta'minotchilar topilmadi</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center px-6" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-5">Yangi ta'minotchi</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Nomi *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ta'minotchi nomi"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Kontakt shaxs</label>
                <input type="text" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                  placeholder="Ism familiya"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Telefon</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Kategoriya</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white">
                  <option value="WHOLESALER">Ulgorituvchi</option>
                  <option value="MANUFACTURER">Ishlab chiqaruvchi</option>
                  <option value="LOCAL">Mahalliy</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[12px] rounded-2xl active:scale-95 transition-transform">Bekor</button>
              <button onClick={handleAdd} disabled={submitting}
                className="flex-1 py-3.5 bg-emerald-600 text-white font-black text-[12px] rounded-2xl active:scale-95 transition-transform disabled:opacity-50">
                {submitting ? 'Yuborilmoqda...' : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
