'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Wallet, Calendar, TrendingUp, TrendingDown, MoreHorizontal, Check, X, DollarSign, AlertCircle, FileText, Clock } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';

interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  budget?: number;
  isActive: boolean;
  totalSpent?: number;
  expenseCount?: number;
  budgetRemaining?: number;
}

interface Expense {
  id: string;
  categoryId: string;
  category?: ExpenseCategory;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  receiptUrl?: string;
  requestedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export default function ExpensesPage() {
  const { success, error } = useNotification();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expRes, catRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/expense-categories'),
      ]);
      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(Array.isArray(expData) ? expData : expData.data || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(Array.isArray(catData) ? catData : catData.data || []);
      }
    } catch (err) {
      error('Xatolik', 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Xarajat tasdiqlandi');
        loadData();
      } else {
        error('Xatolik', 'Tasdiqlashda xatolik yuz berdi');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handlePay = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Xarajat to\'landi');
        loadData();
      } else {
        error('Xatolik', 'To\'lovda xatolik yuz berdi');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Xarajat rad etildi');
        loadData();
      } else {
        error('Xatolik', 'Rad etishda xatolik yuz berdi');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = !search || 
      exp.description?.toLowerCase().includes(search.toLowerCase()) ||
      exp.category?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || exp.categoryId === categoryFilter;
    const matchesDateFrom = !dateFrom || new Date(exp.date) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(exp.date) <= new Date(dateTo);
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDateFrom && matchesDateTo;
  });

  const totalPending = expenses
    .filter(e => e.status === 'PENDING')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalPaid = expenses
    .filter(e => e.status === 'PAID')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalBudget = categories.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpent = categories.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">Kutilmoqda</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">Tasdiqlangan</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">Rad etilgan</span>;
      case 'PAID':
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full">To\'langan</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Xarajatlar</h1>
          <Link
            href="/expenses/add"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
          >
            <Plus size={18} />
            Yangi xarajat
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock size={20} />
              </div>
              <TrendingUp size={16} className="text-slate-400" />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kutilmoqda</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              ${totalPending.toLocaleString()}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <DollarSign size={20} />
              </div>
              <TrendingDown size={16} className="text-emerald-500" />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">To'langan</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              ${totalPaid.toLocaleString()}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Wallet size={20} />
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Byudjet</div>
            </div>
            <div className="flex items-baseline gap-1">
              <div className="text-xl font-black text-slate-900 dark:text-white">
                ${totalSpent.toLocaleString()}
              </div>
              <span className="text-xs text-slate-400">/ ${totalBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-black text-slate-900 dark:text-white mb-4">Kategoriyalar</h2>
            <div className="space-y-3">
              {categories.map(cat => {
                const percentage = cat.budget ? ((cat.totalSpent || 0) / cat.budget) * 100 : 0;
                const isOverBudget = percentage > 100;
                return (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                      <span className={`text-xs font-bold ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                        ${(cat.totalSpent || 0).toLocaleString()} / ${(cat.budget || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-rose-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
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
                    placeholder="Xarajatlarni qidirish..."
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
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="PENDING">Kutilmoqda</option>
                  <option value="APPROVED">Tasdiqlangan</option>
                  <option value="REJECTED">Rad etilgan</option>
                  <option value="PAID">To'langan</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="all">Barcha kategoriyalar</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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
          ) : filteredExpenses.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Xarajatlar topilmadi</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map(expense => (
                <div key={expense.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {expense.category?.name || 'Noma\'lum kategoriya'}
                        </h3>
                        {getStatusBadge(expense.status)}
                      </div>
                      {expense.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{expense.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(expense.date).toLocaleDateString('uz-UZ')}
                        </span>
                        {expense.requestedBy && (
                          <span>{expense.requestedBy} tomonidan so'ralgan</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        ${expense.amount.toLocaleString()}
                      </div>
                      {expense.status === 'PENDING' && (
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => handleApprove(expense.id)}
                            disabled={actionLoading === expense.id}
                            className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 disabled:opacity-50"
                            title="Tasdiqlash"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handlePay(expense.id)}
                            disabled={actionLoading === expense.id}
                            className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50"
                            title="To'lash"
                          >
                            <DollarSign size={14} />
                          </button>
                          <button
                            onClick={() => handleReject(expense.id)}
                            disabled={actionLoading === expense.id}
                            className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50"
                            title="Rad etish"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
