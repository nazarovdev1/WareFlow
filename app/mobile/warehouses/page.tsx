'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Plus, MapPin, Building, Package, Edit3, Trash2, X, Check, Search } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileWarehousesPage() {
  const { success, error } = useNotification();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', address: '', district: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadWarehouses = () => {
    fetch('/api/warehouses')
      .then(r => r.json())
      .then(data => {
        setWarehouses(Array.isArray(data) ? data : data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadWarehouses(); }, []);

  const filtered = warehouses.filter(w =>
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    (w.district || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', address: '', district: '' });
    setShowModal(true);
  };

  const openEdit = (w: any) => {
    setEditingId(w.id);
    setForm({ name: w.name, address: w.address || '', district: w.district || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { error('Xatolik', 'Ombor nomi shart'); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/warehouses/${editingId}` : '/api/warehouses';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', editingId ? 'Ombor yangilandi' : "Ombor qo'shildi");
        setShowModal(false);
        loadWarehouses();
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Xatolik yuz berdi');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/warehouses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Ombor o\'chirildi');
        loadWarehouses();
      } else {
        const data = await res.json();
        error('Xatolik', data.error || "O'chirib bo'lmadi");
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setDeleting(null);
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader 
        title="Filiallar" 
        backHref="/mobile" 
        rightAction={
          <button onClick={openAdd}
            className="p-2.5 bg-teal-600 text-white rounded-full shadow-lg shadow-teal-500/30 active:scale-95 transition-transform">
            <Plus size={20} />
          </button>
        } 
      />

      <div className="px-6 mb-5 mt-2">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Nom, viloyat, manzil..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm text-slate-800 dark:text-white" />
        </div>
      </div>

      <div className="px-6 space-y-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : filtered.length > 0 ? (
          filtered.map(wh => (
            <div key={wh.id}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0">
                    <Building size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-slate-800 dark:text-white">{wh.name}</div>
                    {wh.district && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={11} className="text-teal-500" />
                        <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">{wh.district}</span>
                      </div>
                    )}
                    {wh.address && (
                      <div className="text-[11px] text-slate-400 mt-0.5">{wh.address}</div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        <Package size={10} /> {wh._count?.stockEntries || 0} mahsulot
                      </div>
                      {wh.isDefault && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">Asosiy</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => openEdit(wh)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 active:bg-indigo-50 dark:active:bg-indigo-500/10 transition-colors">
                  <Edit3 size={13} /> Tahrirlash
                </button>
                <div className="w-px bg-slate-100 dark:bg-slate-800"></div>
                <button onClick={() => handleDelete(wh.id)} disabled={deleting === wh.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold text-rose-600 dark:text-rose-400 active:bg-rose-50 dark:active:bg-rose-500/10 transition-colors disabled:opacity-50">
                  <Trash2 size={13} /> {deleting === wh.id ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Building size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filiallar topilmadi</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center px-6" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-5">
              {editingId ? 'Filialni tahrirlash' : 'Yangi filial'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Building size={12} /> Nomi *
                </label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Filial nomi"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <MapPin size={12} /> Viloyat / Tuman
                </label>
                <input type="text" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}
                  placeholder="Masalan: Toshkent sh., Chilonzor t."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Manzil</label>
                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Ko'cha, uy raqami"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-white" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[12px] rounded-2xl active:scale-95 transition-transform">
                Bekor
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3.5 bg-teal-600 text-white font-black text-[12px] rounded-2xl active:scale-95 transition-transform disabled:opacity-50">
                {saving ? 'Saqlanmoqda...' : editingId ? 'Saqlash' : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}