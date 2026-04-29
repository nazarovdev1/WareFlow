'use client';

import { useState, useEffect } from 'react';
import { useBranch } from '@/lib/BranchContext';
import { useSession } from 'next-auth/react';
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Package,
  DollarSign,
  Warehouse,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface BranchSummary {
  branchId: string | null;
  branchName: string;
  period: string;
  summary: {
    totalSales: number;
    totalPurchases: number;
    grossProfit: number;
    orderCount: number;
    averageOrderValue: number;
  };
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  stockValue: number;
  cashBalance: { USD: number; UZS: number };
  customerDebt: { USD: number; UZS: number };
  supplierDebt: { USD: number; UZS: number };
  warehouses: number;
}

interface BranchComparison {
  branches: Array<{
    branchId: string;
    branchName: string;
    branchType: string;
    totalSales: number;
    totalPurchases: number;
    profit: number;
    orderCount: number;
    stockValue: number;
    warehouseCount: number;
  }>;
  totals: {
    totalSales: number;
    totalPurchases: number;
    totalProfit: number;
    totalOrders: number;
  };
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(Math.round(num));
}

function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800 dark:text-white">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}

export default function BranchReportsPage() {
  const { selectedBranch, branches } = useBranch();
  const { data: session } = useSession();
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState<BranchSummary | null>(null);
  const [comparison, setComparison] = useState<BranchComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'single' | 'comparison'>('single');

  const userRole = (session?.user as { role?: string })?.role;
  const canCompare = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  useEffect(() => {
    if (viewMode === 'single') {
      fetchSummary();
    } else {
      fetchComparison();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch, period, viewMode]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (selectedBranch?.id) params.set('branchId', selectedBranch.id);
      const res = await fetch(`/api/reports/branch-summary?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/branch-comparison?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setComparison(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary && !comparison) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 size={28} className="text-teal-500" />
            Filial Hisobotlari
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {viewMode === 'single'
              ? summary?.branchName || 'Filial tanlanmagan'
              : 'Filiallar taqqoslash'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          >
            <option value="today">Bugun</option>
            <option value="week">Hafta</option>
            <option value="month">Oy</option>
            <option value="year">Yil</option>
          </select>

          {/* View mode toggle */}
          {canCompare && (
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'single'
                    ? 'bg-white dark:bg-slate-600 text-teal-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Filial hisoboti
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'comparison'
                    ? 'bg-white dark:bg-slate-600 text-teal-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Taqqoslash
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Single Branch Report */}
      {viewMode === 'single' && summary && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Jami savdo"
              value={`$${formatNumber(summary.summary.totalSales)}`}
              icon={TrendingUp}
              color="bg-green-500"
              subtitle={`${summary.summary.orderCount} ta buyurtma`}
            />
            <StatCard
              title="Jami xarid"
              value={`$${formatNumber(summary.summary.totalPurchases)}`}
              icon={ShoppingCart}
              color="bg-blue-500"
            />
            <StatCard
              title="Brutto foyda"
              value={`$${formatNumber(summary.summary.grossProfit)}`}
              icon={DollarSign}
              color={summary.summary.grossProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500'}
              subtitle={`O'rtacha buyurtma: $${formatNumber(summary.summary.averageOrderValue)}`}
            />
            <StatCard
              title="Zaxira qiymati"
              value={`$${formatNumber(summary.stockValue)}`}
              icon={Package}
              color="bg-purple-500"
              subtitle={`${summary.warehouses} ta ombor`}
            />
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                <Users size={16} /> Moliyaviy holat
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Kassa (USD)</span>
                  <span className="font-semibold text-green-600">${formatNumber(summary.cashBalance.USD)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Kassa (UZS)</span>
                  <span className="font-semibold text-green-600">{formatNumber(summary.cashBalance.UZS)} so'm</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <ArrowUpRight size={14} className="text-orange-500" /> Mijoz qarzi (USD)
                    </span>
                    <span className="font-semibold text-orange-600">${formatNumber(summary.customerDebt.USD)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <ArrowDownRight size={14} className="text-red-500" /> Yetkazib beruvchi qarzi (USD)
                  </span>
                  <span className="font-semibold text-red-600">${formatNumber(summary.supplierDebt.USD)}</span>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                <Warehouse size={16} /> Top mahsulotlar
              </h3>
              <div className="space-y-2">
                {summary.topProducts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Ma'lumot yo'q</p>
                ) : (
                  summary.topProducts.map((product, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                          {product.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-800 dark:text-white">
                          ${formatNumber(product.revenue)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatNumber(product.quantity)} dona
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Branch Comparison */}
      {viewMode === 'comparison' && comparison && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white">Filiallar taqqoslash</h3>
            <p className="text-xs text-slate-400 mt-1">
              Jami savdo: ${formatNumber(comparison.totals.totalSales)} | 
              Jami foyda: ${formatNumber(comparison.totals.totalProfit)}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Filial</th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Savdo</th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Xarid</th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Foyda</th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Buyurtmalar</th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Zaxira</th>
                </tr>
              </thead>
              <tbody>
                {comparison.branches.map((branch) => (
                  <tr key={branch.branchId} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-slate-800 dark:text-white">{branch.branchName}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{branch.branchType}</div>
                    </td>
                    <td className="text-right px-5 py-3 text-sm font-semibold text-green-600">
                      ${formatNumber(branch.totalSales)}
                    </td>
                    <td className="text-right px-5 py-3 text-sm text-blue-600">
                      ${formatNumber(branch.totalPurchases)}
                    </td>
                    <td className={`text-right px-5 py-3 text-sm font-semibold ${branch.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ${formatNumber(branch.profit)}
                    </td>
                    <td className="text-right px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {branch.orderCount}
                    </td>
                    <td className="text-right px-5 py-3 text-sm text-purple-600">
                      ${formatNumber(branch.stockValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                  <td className="px-5 py-3 text-sm font-bold text-slate-800 dark:text-white">JAMI</td>
                  <td className="text-right px-5 py-3 text-sm font-bold text-green-600">
                    ${formatNumber(comparison.totals.totalSales)}
                  </td>
                  <td className="text-right px-5 py-3 text-sm font-bold text-blue-600">
                    ${formatNumber(comparison.totals.totalPurchases)}
                  </td>
                  <td className={`text-right px-5 py-3 text-sm font-bold ${comparison.totals.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${formatNumber(comparison.totals.totalProfit)}
                  </td>
                  <td className="text-right px-5 py-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                    {comparison.totals.totalOrders}
                  </td>
                  <td className="text-right px-5 py-3 text-sm text-slate-400">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
