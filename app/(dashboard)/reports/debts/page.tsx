'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportChart } from '@/components/reports/ReportChart';
import { ReportTable } from '@/components/reports/ReportTable';
import { ExportButton } from '@/components/reports/ExportButton';
import { useReportsStream } from '@/hooks/useReportsStream';
import { Users, Building2, AlertTriangle, DollarSign, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DebtsReportPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ type?: string }>({});
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

      const res = await fetch(`/api/reports/debts?${params}`);
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
    if (streamData?.debt_update && streamData.debt_update.length > 0) {
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
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Qarzlar Hisotobi</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Mijoz va ta'minotchi qarzlari</p>
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
            type="debts"
            data={data?.tableData || []}
            filename="debts-report"
            columns={[
              { key: 'type', label: 'Turi' },
              { key: 'name', label: 'Ism' },
              { key: 'phone', label: 'Telefon' },
              { key: 'balance', label: 'Balans (USD)' },
              { key: 'balanceUZS', label: 'Balans (UZS)' },
              { key: 'lastTransaction', label: 'Oxirgi tranzaksiya' },
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
              title="Mijozlar qarzi"
              value={`$${(data?.summary?.totalCustomerDebt || 0).toLocaleString()}`}
              icon={<Users size={20} />}
              color="blue"
            />
            <ReportCard
              title="Ta'minotchilar qarzi"
              value={`$${(data?.summary?.totalSupplierDebt || 0).toLocaleString()}`}
              icon={<Building2 size={20} />}
              color="violet"
            />
            <ReportCard
              title="Umumiy qarz"
              value={`$${(data?.summary?.totalDebt || 0).toLocaleString()}`}
              icon={<DollarSign size={20} />}
              color="amber"
            />
            <ReportCard
              title="Faol debitorlar"
              value={data?.summary?.activeDebtors || 0}
              icon={<AlertTriangle size={20} />}
              color="rose"
            />
          </div>

          {data?.chartData?.length > 0 && (
            <div className="mb-6">
              <ReportChart
                type="pie"
                data={data.chartData}
                config={{
                  dataKey: 'amount',
                  nameKey: 'type',
                }}
              />
            </div>
          )}

          <ReportTable
            columns={[
              { key: 'type', label: 'Tur', render: (v) => v === 'customer' ? <span className="text-blue-500 font-medium">Mijoz</span> : <span className="text-violet-500 font-medium">Ta'minotchi</span> },
              { key: 'name', label: 'Ism' },
              { key: 'phone', label: 'Telefon' },
              { key: 'balance', label: 'Balans (USD)', render: (v) => v < 0 ? <span className="text-rose-500 font-medium">${Math.abs(v).toLocaleString()}</span> : `$${v.toLocaleString()}` },
              { key: 'balanceUZS', label: 'Balans (UZS)', render: (v) => v < 0 ? <span className="text-rose-500 font-medium">${Math.abs(v).toLocaleString()}</span> : `$${v.toLocaleString()}` },
              { key: 'lastTransaction', label: 'Oxirgi tranzaksiya', render: (v) => v ? new Date(v).toLocaleDateString('uz-UZ') : '-' },
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