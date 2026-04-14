'use client';
import { ChevronDown, Filter, ChevronRight, ChevronLeft, Map, TrendingUp, Search, X, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type Customer = {
  id: string;
  fullName: string;
  companyName?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  balanceUSD: number;
  balanceUZS: number;
  region?: string;
  groupId?: string;
};

export default function CustomersPage() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [regionFilter, setRegionFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;

  useEffect(() => {
    fetch('/api/customers?limit=500')
      .then(res => res.json())
      .then(data => {
        setCustomers(data.data || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...customers];

    if (regionFilter) {
      filtered = filtered.filter(c => c.region === regionFilter);
    }

    if (groupFilter) {
      filtered = filtered.filter(c => c.groupId === groupFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.fullName.toLowerCase().includes(query) ||
        c.companyName?.toLowerCase().includes(query) ||
        c.phone?.includes(query)
      );
    }

    setFilteredCustomers(filtered);
    setPage(1); // Reset to first page when filters change
  }, [customers, regionFilter, groupFilter, statusFilter, searchQuery]);

  const getInitials = (name: string) => {
    if (!name) return '??';
    const split = name.split(' ');
    if (split.length >= 2) return `${split[0][0]}${split[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getRegionCounts = () => {
    const counts: Record<string, number> = {};
    customers.forEach(c => {
      const r = c.region || 'Noma\'lum';
      counts[r] = (counts[r] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const clearFilters = () => {
    setRegionFilter('');
    setGroupFilter('');
    setStatusFilter('');
    setSearchQuery('');
  };

  const hasActiveFilters = regionFilter || groupFilter || statusFilter || searchQuery;

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / perPage);
  const paginatedCustomers = filteredCustomers.slice((page - 1) * perPage, page * perPage);

  // Stats
  const totalBalanceUSD = filteredCustomers.reduce((sum, c) => sum + c.balanceUSD, 0);
  const totalBalanceUZS = filteredCustomers.reduce((sum, c) => sum + c.balanceUZS, 0);
  const debtorCount = filteredCustomers.filter(c => c.balanceUSD < 0 || c.balanceUZS < 0).length;

  const regions = ['Toshkent', 'Samarqand', 'Farg\'ona', 'Andijon', 'Namangan', 'Buxoro', 'Xorazm', 'Navoiy', 'Qashqadaryo', 'Surxondaryo', 'Jizzax', 'Sirdaryo', 'Qoraqalpog\'iston'];

  return (
    <div className="p-6 font-sans w-full min-h-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{t('customers', 'title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('customers', 'allCustomers')} ({filteredCustomers.length})</p>
        </div>
        <Link href="/customers/add" className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition">
          + {t('customers', 'addCustomer')}
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Region Filter */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">{t('customers', 'region')}</label>
            <div className="relative">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 font-medium cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">{t('common', 'all')}</option>
                {regions.map(r => <option key={r} value={r} className="dark:bg-slate-700">{r}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">{t('common', 'search')}</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common', 'search')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">{t('common', 'status')}</label>
            <div className="flex bg-slate-50 dark:bg-slate-700 p-1 rounded-lg border border-slate-200 dark:border-slate-600">
              <button
                onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? '' : 'ACTIVE')}
                className={`flex-1 text-xs font-bold py-2 rounded-md transition ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t('common', 'active')}
              </button>
              <button
                onClick={() => setStatusFilter(statusFilter === 'INACTIVE' ? '' : 'INACTIVE')}
                className={`flex-1 text-xs font-bold py-2 rounded-md transition ${
                  statusFilter === 'INACTIVE'
                    ? 'bg-white dark:bg-slate-600 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t('common', 'inactive')}
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition border border-slate-200 dark:border-slate-600"
            >
              <Filter size={14} className="mr-2" /> {t('common', 'clear')}
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-end">
            <div className="w-full text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('common', 'total')}</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{filteredCustomers.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">{t('common', 'name')}</th>
                <th className="px-4 py-3 text-left text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase hidden lg:table-cell">{t('customers', 'companyName')}</th>
                <th className="px-4 py-3 text-left text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">{t('customers', 'phone')}</th>
                <th className="px-4 py-3 text-left text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase hidden md:table-cell">{t('customers', 'region')}</th>
                <th className="px-4 py-3 text-left text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">{t('common', 'status')}</th>
                <th className="px-4 py-3 text-right text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">USD</th>
                <th className="px-4 py-3 text-right text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase hidden lg:table-cell">UZS</th>
                <th className="px-4 py-3 text-right text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">{t('common', 'actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500 font-bold">
                    {t('common', 'loading')}
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500 font-bold">
                    {t('customers', 'title')} {t('common', 'noData')}
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c, i) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-xs mr-3 ${i % 2 === 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'}`}>
                          {getInitials(c.fullName)}
                        </div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{c.fullName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 hidden lg:table-cell">{c.companyName || '-'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">{c.phone || '-'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 hidden md:table-cell">{c.region || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'ACTIVE' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                        {c.status === 'ACTIVE' ? t('common', 'active') : t('common', 'inactive')}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${c.balanceUSD < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {c.balanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold hidden lg:table-cell ${c.balanceUZS < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {c.balanceUZS.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/customers/edit/${c.id}`} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                          <Edit size={16} />
                        </Link>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t('common', 'total')}: {filteredCustomers.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 flex justify-center items-center rounded text-sm font-bold transition ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Region Stats */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('customers', 'region')} {t('common', 'statistics')}</h3>
            <Map size={18} className="text-slate-400 dark:text-slate-500" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {getRegionCounts().slice(0, 8).map(([region, count]) => (
              <div key={region} className="p-3 border border-slate-100 dark:border-slate-700 rounded-lg relative overflow-hidden">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{region}</div>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{count}</div>
                <div className="absolute bottom-0 left-0 h-1 bg-indigo-500" style={{ width: `${(count / customers.length) * 100}%` }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Debtors Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          <TrendingUp size={20} className="mb-4 relative z-10" />
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1">{t('customers', 'debtors')}</h3>
            <p className="text-xs text-indigo-200 mb-4">{t('customers', 'title')} {t('common', 'total')} {t('customers', 'balance')}</p>
            <div className="text-2xl font-black mb-1">${totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="text-sm text-indigo-200">{totalBalanceUZS.toLocaleString()} UZS</div>
            <div className="mt-3 text-xs text-indigo-200">{debtorCount} {t('customers', 'active').toLowerCase()} {t('customers', 'debtors').toLowerCase()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
