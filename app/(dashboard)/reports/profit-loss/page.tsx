'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportChart } from '@/components/reports/ReportChart';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ExportButton } from '@/components/reports/ExportButton';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ProfitLossReportPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string; warehouseId?: string }>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
        )
      );

      const res = await fetch(`/api/reports/profit-loss?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/reports" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Foyda va Zarar</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Moliyaviy tahlil - foyda marjinasi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw size={18} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <ReportCard
              title="Jami daromad"
              value={formatCurrency(data?.summary?.totalRevenue || 0)}
              icon={<TrendingUp size={20} />}
              color="emerald"
            />
            <ReportCard
              title="Sotuv xarajati"
              value={formatCurrency(data?.summary?.totalCost || 0)}
              icon={<TrendingDown size={20} />}
              color="rose"
            />
            <ReportCard
              title="Sof foyda"
              value={formatCurrency(data?.summary?.netProfit || 0)}
              icon={<DollarSign size={20} />}
              color={(data?.summary?.netProfit || 0) >= 0 ? 'emerald' : 'rose'}
            />
            <ReportCard
              title="Foyda marjinasi"
              value={`${data?.summary?.grossMargin || 0}%`}
              icon={<Percent size={20} />}
              color={(parseFloat(data?.summary?.grossMargin || '0') || 0) >= 0 ? 'violet' : 'rose'}
            />
          </div>

          {data?.chartData?.length > 0 && (
            <div className="mb-6">
              <ReportChart
                type="bar"
                data={data.chartData}
                config={{
                  nameKey: 'name',
                  lines: [
                    { key: 'value', color: '#0ea5e9', name: 'Qiymat ($)' },
                  ],
                }}
              />
            </div>
          )}

          <ReportFilters
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters({})}
          />

          {data?.topProducts?.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white">Top mahsulotlar (foyda bo'yicha)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mahsulot</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Soni</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Daromad</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Xarajat</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Foyda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((product: any, index: number) => (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 text-right">{product.quantity}</td>
                        <td className="px-6 py-4 text-sm text-emerald-600 dark:text-emerald-400 text-right font-medium">{formatCurrency(product.revenue)}</td>
                        <td className="px-6 py-4 text-sm text-rose-600 dark:text-rose-400 text-right font-medium">{formatCurrency(product.cost)}</td>
                        <td className={`px-6 py-4 text-sm text-right font-bold ${product.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {formatCurrency(product.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <ExportButton
            type="profit-loss"
            data={data?.topProducts || []}
            filename="profit-loss-report"
            columns={[
              { key: 'name', label: 'Mahsulot' },
              { key: 'quantity', label: 'Soni' },
              { key: 'revenue', label: 'Daromad ($)' },
              { key: 'cost', label: 'Xarajat ($)' },
              { key: 'profit', label: 'Foyda ($)' },
            ]}
          />
        </>
      )}
    </div>
  );
}