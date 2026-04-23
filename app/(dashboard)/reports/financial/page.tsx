'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportChart } from '@/components/reports/ReportChart';
import { ReportTable } from '@/components/reports/ReportTable';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { useReportsStream } from '@/hooks/useReportsStream';
import { ExportButton } from '@/components/reports/ExportButton';
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, Building2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function FinancialReportPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string; cashboxId?: string; type?: string }>({});
  const { data: streamData, isConnected } = useReportsStream();
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
        ),
      });

      const res = await fetch(`/api/reports/financial?${params}`);
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
  }, [filters, page]);

  useEffect(() => {
    if (streamData?.cash_update && streamData.cash_update.length > 0) {
      fetchData();
    }
  }, [streamData]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/reports" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Moliyaviy Hisobotlar</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Pul aylanmasi va kassa statistikasi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isConnected ? 'Real-time' : 'Offline'}
            </span>
          </div>
          <button onClick={fetchData} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <RefreshCw size={18} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <ExportButton
            type="financial"
            data={data?.tableData || []}
            filename="financial-report"
            columns={[
              { key: 'date', label: 'Sana' },
              { key: 'type', label: 'Turi' },
              { key: 'cashbox', label: 'Kassa' },
              { key: 'amount', label: 'Summa ($)' },
              { key: 'description', label: 'Izoh' },
              { key: 'reference', label: 'Havola' },
            ]}
          />
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
              title="Jami tushum"
              value={`$${(data?.summary?.totalIncome || 0).toLocaleString()}`}
              icon={<TrendingUp size={20} />}
              color="emerald"
            />
            <ReportCard
              title="Jami xarajat"
              value={`$${(data?.summary?.totalExpense || 0).toLocaleString()}`}
              icon={<TrendingDown size={20} />}
              color="rose"
            />
            <ReportCard
              title="Sof balans"
              value={`$${(data?.summary?.netBalance || 0).toLocaleString()}`}
              icon={<DollarSign size={20} />}
              color="violet"
            />
            <ReportCard
              title="Naqd pul"
              value={`$${(data?.summary?.cashBalance || 0).toLocaleString()}`}
              icon={<Wallet size={20} />}
              color="blue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Karta</div>
                <div className="text-xl font-black text-slate-900 dark:text-white">${(data?.summary?.cardBalance || 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Bank</div>
                <div className="text-xl font-black text-slate-900 dark:text-white">${(data?.summary?.bankBalance || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {data?.chartData?.length > 0 && (
            <div className="mb-6">
              <ReportChart
                type="area"
                data={data.chartData}
                config={{
                  nameKey: 'date',
                  lines: [
                    { key: 'income', color: '#10b981', name: 'Tushum' },
                    { key: 'expense', color: '#ef4444', name: 'Xarajat' },
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

          <ReportTable
            columns={[
              { key: 'date', label: 'Sana', render: (v) => v ? new Date(v).toLocaleDateString('uz-UZ') : '-' },
              { key: 'type', label: 'Tur', render: (v) => v === 'INCOME' ? <span className="text-emerald-500 font-medium">Tushum</span> : <span className="text-rose-500 font-medium">Xarajat</span> },
              { key: 'cashbox', label: 'Kassa' },
              { key: 'amount', label: 'Summa', render: (v) => `$${v?.toLocaleString() || 0}` },
              { key: 'description', label: 'Izoh' },
            ]}
            data={data?.tableData || []}
            pagination={data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 }}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}