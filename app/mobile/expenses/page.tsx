'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Receipt, Plus, Search, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function MobileExpensesList() {
  const [expenses, setExpenses] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch('/api/expenses')
      .then(r => r.json())
      .then(d => { setExpenses(Array.isArray(d) ? d : d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
    fetch('/api/expense-categories')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : d.data || []))
      .catch(() => {});
  }, []);

  const filtered = expenses.filter(e => {
    const matchSearch = !search || String(e.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || String(e.categoryId || e.category) === categoryFilter;
    return matchSearch && matchCategory;
  });

  const totalExpenses = filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Xarajatlar" backHref="/mobile"
        rightAction={
          <Link href="/mobile/expenses/add" className="p-2.5 bg-teal-600 text-white rounded-full shadow-lg shadow-teal-500/30 active:scale-95 transition-transform">
            <Plus size={20} />
          </Link>
        }
      />

      {showFilters && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]" onClick={() => setShowFilters(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Filtrlar</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Kategoriya</label>
                <div className="relative">
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm appearance-none">
                    <option value="">Barchasi</option>
                    {categories.map((c: Record<string, unknown>) => (
                      <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <button onClick={() => setShowFilters(false)} className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-transform">{`Qo'llash`}</button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 mt-2 space-y-4">
        {/* Total */}
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-1">
            <Receipt size={14} className="text-red-500" />
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">Jami xarajatlar</span>
          </div>
          <p className="text-2xl font-black text-red-700 dark:text-red-400">${totalExpenses.toLocaleString()}</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Qidirish..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm text-slate-800 dark:text-white" />
        </div>

        {/* List */}
        <div className="space-y-2">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
          ) : filtered.length > 0 ? filtered.map((expense) => (
            <div key={String(expense.id)} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{String(expense.description || '-')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{String(expense.categoryName || expense.category || '-')}</p>
                </div>
                <p className="text-sm font-black text-red-600 ml-3">${Number(expense.amount || 0).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">
                  {String(expense.date ? new Date(String(expense.date)).toLocaleDateString('uz') : '-')}
                </span>
                <span className="text-[11px] text-slate-500">
                  {String(expense.paymentMethod || '-')}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-slate-400">
              <Receipt size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Xarajatlar topilmadi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
