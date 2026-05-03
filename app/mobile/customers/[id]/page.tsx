'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Save, Trash2, Phone, MapPin, Building2, UserCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';

interface Customer {
  id: string;
  fullName?: string;
  companyName?: string;
  phone?: string;
  region?: string;
  status?: string;
  balanceUSD?: number;
  balanceUZS?: number;
  group?: {
    id: string;
    name: string;
  };
}

export default function MobileCustomerDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { success, error } = useNotification();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    phone: '',
    region: '',
    status: 'ACTIVE',
    balanceUSD: 0,
    balanceUZS: 0,
  });

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then(r => r.json())
      .then(data => {
        setCustomer(data);
        setForm({
          fullName: data.fullName || '',
          companyName: data.companyName || '',
          phone: data.phone || '',
          region: data.region || '',
          status: data.status || 'ACTIVE',
          balanceUSD: data.balanceUSD || 0,
          balanceUZS: data.balanceUZS || 0,
        });
        setLoading(false);
      })
      .catch(() => { error('Xatolik', 'Mijoz ma\'lumotlarini yuklashda xato'); setLoading(false); });
  }, [id]);

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      error('Xatolik', 'Ism kiritilishi shart');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomer(updated);
        setEditing(false);
        success('Muvaffaqiyatli', `Mijoz ma\u2019lumotlari saqlandi`);
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
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Mijoz o\u2019chirildi');
        router.push('/mobile/customers');
      } else {
        error('Xatolik', `O\u2019chirishda xatolik`);
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSaving(false);
    setShowDeleteConfirm(false);
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'Aktiv';
      case 'INACTIVE': return 'Nofaol';
      case 'BLOCKED': return 'Bloklangan';
      default: return s;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'INACTIVE': return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
      case 'BLOCKED': return 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Yuklanmoqda..." backHref="/mobile/customers" />
        <div className="px-6 space-y-4 mt-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Mijoz topilmadi" backHref="/mobile/customers" />
        <div className="text-center py-20">
          <UserCircle size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-400">Mijoz ma\u2019lumotlari topilmadi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title={editing ? 'Mijozni tahrirlash' : (customer.fullName || 'Mijoz')}
        backHref="/mobile/customers"
        rightAction={
          !editing ? (
            <button onClick={() => setEditing(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-black rounded-xl active:scale-95 transition-transform">
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
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UserCircle size={32} />
            </div>
            <div className="flex-1">
              {editing ? (
                <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                  className="text-lg font-black text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 w-full" />
              ) : (
                <div className="text-lg font-black text-slate-900 dark:text-white">{customer.fullName}</div>
              )}
              <div className="flex items-center gap-2 mt-1">
                {editing ? (
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none">
                    <option value="ACTIVE">Aktiv</option>
                    <option value="INACTIVE">Nofaol</option>
                    <option value="BLOCKED">Bloklangan</option>
                  </select>
                ) : (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColor(customer.status || 'ACTIVE')}`}>
                    {statusLabel(customer.status || 'ACTIVE')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {editing ? (
              <>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Kompaniya</label>
                  <input type="text" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Telefon</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Viloyat</label>
                  <input type="text" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </>
            ) : (
              <>
                {!!customer.companyName && (
                  <div className="flex items-center gap-3">
                    <Building2 size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{customer.companyName}</span>
                  </div>
                )}
                {!!customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-slate-400" />
                    <a href={`tel:${customer.phone}`} className="text-sm text-indigo-600 dark:text-indigo-400">{customer.phone}</a>
                  </div>
                )}
                {!!customer.region && (
                  <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{customer.region}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Balans</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 font-bold">USD</div>
              <div className={`text-xl font-black ${(customer.balanceUSD || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                ${Math.abs(customer.balanceUSD || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 font-bold">UZS</div>
              <div className={`text-xl font-black ${(customer.balanceUZS || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {Math.abs(customer.balanceUZS || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Group info */}
        {!!customer.group && (
          <Link href={`/mobile/customers/groups/${customer.group.id}`}
            className="block bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Guruh</div>
            <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{customer.group.name}</div>
          </Link>
        )}

        {/* Delete Button */}
        {editing && (
          <button onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform border border-rose-200 dark:border-rose-500/20">
            <Trash2 size={16} />
            {`Mijozni o\u2019chirish`}
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
            <h3 className="text-lg font-black text-center text-slate-900 dark:text-white mb-2">Mijozni o\u2019chirish</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
              {`${customer.fullName} mijozini o\u2019chirishni tasdiqlaysizmi? Bu amalni qaytarib bo\u2019lmaydi.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[12px] rounded-2xl active:scale-95 transition-transform">
                Bekor qilish
              </button>
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-3 bg-rose-600 text-white font-black text-[12px] rounded-2xl active:scale-95 transition-transform disabled:opacity-50">
                {saving ? 'O\u2019chirilmoqda...' : `O\u2019chirish`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
