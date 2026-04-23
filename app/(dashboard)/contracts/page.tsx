'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Calendar, AlertCircle, CheckCircle, Clock, Filter, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: string;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  startDate: string;
  endDate?: string;
  value?: number;
  currency: string;
  description?: string;
  customerId?: string;
  customer?: { fullName: string };
  supplierId?: string;
  supplier?: { name: string };
  createdAt: string;
  updatedAt: string;
}

export default function ContractsPage() {
  const { success, error } = useNotification();
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contracts');
      if (res.ok) {
        const data = await res.json();
        setContracts(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      error('Xatolik', 'Shartnomalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-full">Qoralama</span>;
      case 'ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Faol</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-700 rounded-full flex items-center gap-1"><Clock size={12} /> Muddati tugagan</span>;
      case 'TERMINATED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-full">Bekor qilingan</span>;
      default:
        return null;
    }
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = !search || 
      contract.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
      contract.title.toLowerCase().includes(search.toLowerCase()) ||
      contract.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      contract.supplier?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const activeCount = contracts.filter(c => c.status === 'ACTIVE').length;
  const expiredCount = contracts.filter(c => c.status === 'EXPIRED').length;
  const expiringSoon = contracts.filter(c => {
    if (c.status !== 'ACTIVE' || !c.endDate) return false;
    return getDaysUntilExpiry(c.endDate) <= 30 && getDaysUntilExpiry(c.endDate) > 0;
  }).length;

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Shartnomalar</h1>
          <Link
            href="/contracts/add"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
          >
            <Plus size={18} />
            Yangi shartnoma
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Faol</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{activeCount}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertCircle size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Muddati yaqinlashgan (30 kun)</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{expiringSoon}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Clock size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Muddati tugagan</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{expiredCount}</div>
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
                    placeholder="Shartnomalarni qidirish..."
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
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="DRAFT">Qoralama</option>
                  <option value="ACTIVE">Faol</option>
                  <option value="EXPIRED">Muddati tugagan</option>
                  <option value="TERMINATED">Bekor qilingan</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="all">Barcha turlar</option>
                  <option value="customer">Mijoz</option>
                  <option value="supplier">Ta'minotchi</option>
                  <option value="partnership">Hamkorlik</option>
                  <option value="service">Xizmat</option>
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : filteredContracts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Shartnomalar topilmadi</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContracts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(contract => {
                const daysUntilExpiry = contract.endDate ? getDaysUntilExpiry(contract.endDate) : null;
                const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
                
                return (
                  <div key={contract.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {contract.title}
                          </h3>
                          {getStatusBadge(contract.status)}
                          {isExpiringSoon && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
                              <AlertCircle size={10} />
                              {daysUntilExpiry} kun
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-2">
                          <span className="font-mono">{contract.contractNumber}</span>
                          <span>•</span>
                          <span className="capitalize">{contract.type}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <FileText size={12} />
                            {contract.customer ? contract.customer.fullName : contract.supplier?.name || 'Noma\'lum'}
                          </span>
                          {contract.endDate && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(contract.endDate).toLocaleDateString('uz-UZ')}
                                {isExpired && ' (muddati tugagan)'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {contract.value && (
                          <div className="flex items-center gap-1 mb-1">
                            <DollarSign size={14} className="text-slate-400" />
                            <div className="text-lg font-black text-slate-900 dark:text-white">
                              {contract.value.toLocaleString()} {contract.currency}
                            </div>
                          </div>
                        )}
                        <Link
                          href={`/contracts/${contract.id}`}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Tafsilotlar →
                        </Link>
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
