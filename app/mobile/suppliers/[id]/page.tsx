'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Save, Trash2, Phone, Building2, Truck, AlertTriangle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileSupplierDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { success, error } = useNotification();

  const [supplier, setSupplier] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    category: 'WHOLESALER',
  });

  useEffect(() => {
    fetch(`/api/suppliers/${id}`)
      .then(r => r.json())
      .then(data => {
        setSupplier(data);
        setForm({
          name: data.name || '',
          contactPerson: data.contactPerson || '',
          phone: data.phone || '',
          category: data.category || 'WHOLESALER',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      error('Xatolik', 'Nom kiritilishi shart');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setSupplier(updated);
        setEditing(false);
        success('Muvaffaqiyatli', `Ta\u2019minotchi ma\u2019lumotlari saqlandi`);
      } else {
        error('Xatolik', 'Saqlashda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('Muvaffaqiyatli', `Ta\u2019minotchi o\u2019chirildi`);
        router.push('/mobile/suppliers');
      } else {
        error('Xatolik', `O\u2019chirishda xatolik`);
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSaving(false);
    setShowDeleteConfirm(false);
  };

  const categoryLabel = (c: string) => {
    switch (c) {
      case 'MANUFACTURER': return 'Ishlab chiqaruvchi';
      case 'WHOLESALER': return 'Ulgorituvchi';
      case 'LOCAL': return 'Mahalliy';
      default: return c;
    }
  };

  const categoryColor = (c: string) => {
    switch (c) {
      case 'MANUFACTURER': return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400';
      case 'WHOLESALER': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'LOCAL': return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Yuklanmoqda..." backHref="/mobile/suppliers" />
        <div className="px-6 space-y-4 mt-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)}
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Topilmadi" backHref="/mobile/suppliers" />
        <div className="text-center py-20">
          <Truck size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-400">{`Ta\u2019minotchi topilmadi`}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title={editing ? `Ta\u2019minotchini tahrirlash` : String(supplier.name)}
        backHref="/mobile/suppliers"
        rightAction={
          !editing ? (
            <button onClick={() => setEditing(true)}
              className="px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-black rounded-xl active:scale-95 transition-transform">
              Tahrirlash
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-black rounded-xl active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1">
              <Save size={12} /> Saqlash
            </button>
          )
        }
      />

      <div className="px-6 space-y-4 mt-2">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Truck size={32} />
            </div>
            <div className="flex-1">
              {editing ? (
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="text-lg font-black text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 w-full" />
              ) : (
                <div className="text-lg font-black text-slate-900 dark:text-white">{String(supplier.name)}</div>
              )}
              <div className="flex items-center gap-2 mt-1">
                {editing ? (
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none">
                    <option value="WHOLESALER">Ulgorituvchi</option>
                    <option value="MANUFACTURER">Ishlab chiqaruvchi</option>
                    <option value="LOCAL">Mahalliy</option>
                  </select>
                ) : (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${categoryColor(String(supplier.category))}`}>
                    {categoryLabel(String(supplier.category))}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {editing ? (
              <>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Kontakt shaxs</label>
                  <input type="text" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Telefon</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              </>
            ) : (
              <>
                {supplier.contactPerson && (
                  <div className="flex items-center gap-3">
                    <Building2 size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{String(supplier.contactPerson)}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-slate-400" />
                    <a href={`tel:${supplier.phone}`} className="text-sm text-emerald-600 dark:text-emerald-400">{String(supplier.phone)}</a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Balance info */}
        {(Number(supplier.balanceUSD || 0) !== 0 || Number(supplier.balanceUZS || 0) !== 0) && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Balans</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-bold">USD</div>
                <div className={`text-xl font-black ${Number(supplier.balanceUSD || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  ${Math.abs(Number(supplier.balanceUSD || 0)).toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-bold">UZS</div>
                <div className={`text-xl font-black ${Number(supplier.balanceUZS || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {Math.abs(Number(supplier.balanceUZS || 0)).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Button */}
        {editing && (
          <button onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform border border-rose-200 dark:border-rose-500/20">
            <Trash2 size={16} />
            {`Ta\u2019minotchini o\u2019chirish`}
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center px-6" onClick={() => setShowDeleteConfirm(false)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
                <AlertTriangle size={28} className="text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <h3 className="text-lg font-black text-center text-slate-900 dark:text-white mb-2">{`Ta\u2019minotchini o\u2019chirish`}</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
              {`${String(supplier.name)} ta\u2019minotchisini o\u2019chirishni tasdiqlaysizmi? Bu amalni qaytarib bo\u2019lmaydi.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[12px] rounded-2xl active:scale-95 transition-transform">
                Bekor qilish
              </button>
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-3 bg-rose-600 text-white font-black text-[12px] rounded-2xl active:scale-95 transition-transform disabled:opacity-50">
                {saving ? `O\u2019chirilmoqda...` : `O\u2019chirish`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
