'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Users, UserCircle, Phone, MapPin, Plus, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';

interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  defaultDiscount?: number;
}

interface Customer {
  id: string;
  fullName?: string;
  companyName?: string;
  phone?: string;
  region?: string;
  status?: string;
  balanceUSD?: number;
  balanceUZS?: number;
}

export default function MobileGroupDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { success, error } = useNotification();

  const [group, setGroup] = useState<CustomerGroup | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    Promise.all([
      fetch(`/api/customer-groups/${id}`).then(r => r.json()),
      fetch(`/api/customers?groupId=${id}&limit=100`).then(r => r.json()),
    ]).then(([groupData, customersData]) => {
      setGroup(groupData);
      setCustomers(customersData.data || customersData || []);
      setLoading(false);
    }).catch(() => { error('Xatolik', 'Guruh ma\'lumotlarini yuklashda xato'); setLoading(false); });
  }, [id]);

  const handleAddCustomer = async () => {
    if (!form.fullName.trim()) {
      error('Xatolik', 'Ism kiritilishi shart');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, groupId: id }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', `Mijoz guruhga qo\u2019shildi`);
        setShowAdd(false);
        setForm({ fullName: '', companyName: '', phone: '', region: '', status: 'ACTIVE', balanceUSD: 0, balanceUZS: 0 });
        const [, customersRes] = await Promise.all([
          fetch(`/api/customer-groups/${id}`).then(r => r.json()),
          fetch(`/api/customers?groupId=${id}&limit=100`).then(r => r.json()),
        ]);
        const groupRes = await fetch(`/api/customer-groups/${id}`);
        if (groupRes.ok) setGroup(await groupRes.json());
        setCustomers(customersRes.data || customersRes || []);
      } else {
        error('Xatolik', `Qo\u2019shishda xatolik`);
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Yuklanmoqda..." backHref="/mobile/customers/groups" />
        <div className="px-6 space-y-4 mt-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)}
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Topilmadi" backHref="/mobile/customers/groups" />
        <div className="text-center py-20">
          <Users size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-400">Guruh topilmadi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title={group.name}
        backHref="/mobile/customers/groups"
        rightAction={
          <button onClick={() => setShowAdd(true)}
            className="p-2.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-6 space-y-4 mt-2">
        {/* Group Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users size={24} />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{group.name}</div>
              <div className="text-[12px] text-slate-500 dark:text-slate-400">{group.description || `Tavsif yo\u2019q`}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 font-bold">Mijozlar</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{customers.length}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 font-bold">Chegirma</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{group.defaultDiscount || 0}%</div>
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="space-y-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Guruh mijozlari</div>
          {customers.length > 0 ? (
            customers.map(c => (
              <Link key={c.id} href={`/mobile/customers/${c.id}`}
                className="block bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <UserCircle size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{c.fullName}</div>
                    <div className="text-[11px] text-slate-400">{c.companyName || 'Jismoniy shaxs'}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[13px] font-black ${(c.balanceUSD || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      ${Math.abs(c.balanceUSD || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2 mt-2 border-t border-slate-50 dark:border-slate-800/50">
                  {!!c.phone && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Phone size={10} /> {c.phone}
                    </span>
                  )}
                  {!!c.region && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <MapPin size={10} /> {c.region}
                    </span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Users size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mijozlar yo\u2019q</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Mijoz qo\u2019shish</h3>
            <p className="text-[12px] text-slate-400 mb-5">{group.name} guruhiga</p>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Ism *</label>
                <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                  placeholder="To\u2019liq ism"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Kompaniya</label>
                <input type="text" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Kompaniya nomi"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Telefon</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
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
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[12px] rounded-2xl active:scale-95 transition-transform">Bekor qilish</button>
              <button onClick={handleAddCustomer} disabled={submitting}
                className="flex-1 py-3.5 bg-indigo-600 text-white font-black text-[12px] rounded-2xl active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={14} />
                {submitting ? 'Qo\u2019shilmoqda...' : `Qo\u2019shish`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
