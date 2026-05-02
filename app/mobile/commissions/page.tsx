'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Clock, DollarSign, User } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useNotification } from '@/lib/NotificationContext';

interface Commission {
  id: string;
  agentId: string;
  agent?: { name: string; phone?: string };
  orderId?: string;
  order?: { docNumber: string };
  amount: number;
  rate: number;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

export default function MobileCommissionsPage() {
  const { success, error } = useNotification();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/commissions');
      if (res.ok) {
        const data = await res.json();
        setCommissions(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/commissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: true, paidAt: new Date().toISOString() }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', `Komissiya to\u2019landi`);
        loadCommissions();
      } else {
        error('Xatolik', `To'lovni tasdiqlashda xatolik`);
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const filteredCommissions = commissions.filter(c => {
    const matchesSearch = !search ||
      c.agent?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.order?.docNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'paid' && c.isPaid) ||
      (statusFilter === 'unpaid' && !c.isPaid);
    return matchesSearch && matchesStatus;
  });

  const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0);
  const paidAmount = commissions.filter(c => c.isPaid).reduce((sum, c) => sum + c.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Komissiyalar"
        backHref="/mobile"
      />

      <div className="px-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <DollarSign size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jami</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{totalAmount.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{`To\u2019langan`}</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{paidAmount.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
              <Clock size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kutilmoqda</div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">{pendingAmount.toLocaleString()}</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl transition-colors ${showFilters ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Filter */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            >
              <option value="all">Barcha</option>
              <option value="paid">{`To\u2019langan`}</option>
              <option value="unpaid">{`To\u2019lanmagan`}</option>
            </select>
          </div>
        )}

        {/* Commission Cards */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="animate-pulse text-sm">Yuklanmoqda...</div>
          </div>
        ) : filteredCommissions.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Komissiyalar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCommissions.map(commission => (
              <div
                key={commission.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User size={14} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {commission.agent?.name || `Noma\u2019lum`}
                      </span>
                    </div>
                    {commission.order && (
                      <div className="text-xs text-slate-500">
                        Buyurtma: {commission.order.docNumber}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {commission.amount.toLocaleString()} {`so\u2019m`}
                    </div>
                    <div className="text-[10px] text-slate-400">{commission.rate}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {commission.isPaid ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center gap-1">
                        <CheckCircle size={10} /> {`To\u2019langan`}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full flex items-center gap-1">
                        <Clock size={10} /> Kutilmoqda
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {new Date(commission.createdAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  {!commission.isPaid && (
                    <button
                      onClick={() => handleMarkPaid(commission.id)}
                      className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg active:scale-95 transition-transform"
                    >
                      {`To\u2019lash`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
