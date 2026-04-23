'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, Calendar, User, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { useNotification } from '@/lib/NotificationContext';

interface Commission {
  id: string;
  agentId: string;
  agent?: { name: string };
  orderId?: string;
  order?: { docNumber: string };
  amount: number;
  rate: number;
  saleAmount: number;
  isPaid: boolean;
  paidDate?: string;
  period?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Agent {
  id: string;
  name: string;
}

export default function CommissionsPage() {
  const { success, error } = useNotification();
  
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [payingCommission, setPayingCommission] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, aRes] = await Promise.all([
        fetch('/api/commissions'),
        fetch('/api/sales-agents'),
      ]);
      if (cRes.ok) {
        const data = await cRes.json();
        setCommissions(Array.isArray(data) ? data : data.data || []);
      }
      if (aRes.ok) {
        const data = await aRes.json();
        setAgents(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      error('Xatolik', 'Komissiyalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string) => {
    setPayingCommission(id);
    try {
      const res = await fetch(`/api/commissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: true, paidDate: new Date().toISOString() }),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Komissiya to\'landi');
        loadData();
      } else {
        error('Xatolik', 'To\'lovda xatolik');
      }
    } finally {
      setPayingCommission(null);
    }
  };

  const filteredCommissions = commissions.filter(c => {
    const matchesSearch = !search || 
      c.agent?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.order?.docNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesAgent = agentFilter === 'all' || c.agentId === agentFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'paid' && c.isPaid) ||
      (statusFilter === 'pending' && !c.isPaid);
    const matchesDateFrom = !dateFrom || new Date(c.createdAt) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(c.createdAt) <= new Date(dateTo);
    
    return matchesSearch && matchesAgent && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const totalPending = commissions.filter(c => !c.isPaid).reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = commissions.filter(c => c.isPaid).reduce((sum, c) => sum + c.amount, 0);
  const totalSales = commissions.reduce((sum, c) => sum + c.saleAmount, 0);

  const getCommissionStatus = (commission: Commission) => {
    if (commission.isPaid) {
      return { icon: <CheckCircle size={14} />, text: 'To\'langan', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' };
    }
    return { icon: <Clock size={14} />, text: 'Kutilmoqda', color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30' };
  };

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Komissiyalar</h1>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kutilmoqda</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">${totalPending.toLocaleString()}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">To'langan</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">${totalPaid.toLocaleString()}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami savdo</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">${totalSales.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Komissiyalarni qidirish..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                  <Filter size={16} />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-4 gap-3">
                <select
                  value={agentFilter}
                  onChange={e => setAgentFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="all">Barcha agentlar</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="pending">Kutilmoqda</option>
                  <option value="paid">To'langan</option>
                </select>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : filteredCommissions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Komissiyalar topilmadi</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCommissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(commission => {
                const status = getCommissionStatus(commission);
                return (
                  <div key={commission.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {commission.agent?.name || 'Noma\'lum agent'}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full flex items-center gap-1 ${status.color}`}>
                            {status.icon}
                            {status.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-2">
                          {commission.order && (
                            <span className="font-mono">{commission.order.docNumber}</span>
                          )}
                          {commission.period && (
                            <>
                              <span>•</span>
                              <span>{commission.period}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <DollarSign size={12} />
                            Sotuv: ${commission.saleAmount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp size={12} />
                            Foiz: {commission.rate}%
                          </span>
                        </div>
                        {commission.paidDate && (
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                            To'langan: {new Date(commission.paidDate).toLocaleDateString('uz-UZ')}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                          ${commission.amount.toLocaleString()}
                        </div>
                        {!commission.isPaid && (
                          <button
                            onClick={() => markAsPaid(commission.id)}
                            disabled={payingCommission === commission.id}
                            className="mt-2 w-full px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 disabled:opacity-50"
                          >
                            {payingCommission === commission.id ? 'To\'lanmoqda...' : 'To\'lash'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
