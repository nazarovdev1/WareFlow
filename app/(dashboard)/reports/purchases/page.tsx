'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportChart } from '@/components/reports/ReportChart';
import { ReportTable } from '@/components/reports/ReportTable';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { useReportsStream } from '@/hooks/useReportsStream';
import { ExportButton } from '@/components/reports/ExportButton';
import { ShoppingBag, DollarSign, TrendingUp, Building2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PurchasesReportPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string; warehouseId?: string; supplierId?: string }>({});
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

      const res = await fetch(`/api/reports/purchases?${params}`);
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
    if (streamData?.purchase_update && streamData.purchase_update.length > 0) {
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
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Xarid Hisobotlari</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Xarid tahlillari va statistikasi</p>
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
            type="purchases"
            data={data?.tableData || []}
            filename="purchases-report"
            columns={[
              { key: 'docNumber', label: 'Hujjat №' },
              { key: 'date', label: 'Sana' },
              { key: 'supplier', label: 'Ta\'minotchi' },
              { key: 'warehouse', label: 'Ombor' },
              { key: 'amount', label: 'Summa ($)' },
              { key: 'items', label: 'Mahsulotlar soni' },
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
              title="Jami xaridlar"
              value={data?.summary?.totalPurchases?.toLocaleString() || 0}
              icon={<ShoppingBag size={20} />}
              color="blue"
            />
            <ReportCard
              title="Jami xarajat"
              value={`$${(data?.summary?.totalSpent || 0).toLocaleString()}`}
              icon={<DollarSign size={20} />}
              color="emerald"
            />
            <ReportCard
              title="O'rtacha xarid"
              value={`$${(data?.summary?.avgPurchaseValue || 0).toFixed(2)}`}
              icon={<TrendingUp size={20} />}
              color="violet"
            />
            <ReportCard
              title="Top ta'minotchi"
              value={data?.summary?.topSupplier || '-'}
              icon={<Building2 size={20} />}
              color="amber"
            />
          </div>

          {data?.chartData?.length > 0 && (
            <div className="mb-6">
              <ReportChart
                type="area"
                data={data.chartData}
                config={{
                  nameKey: data.chartData[0]?.date ? 'date' : data.chartData[0]?.supplier ? 'supplier' : 'warehouse',
                  lines: [
                    { key: 'amount', color: '#8b5cf6', name: 'Xarajat' },
                    { key: 'purchases', color: '#0ea5e9', name: 'Xaridlar soni' },
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
              { key: 'docNumber', label: 'Hujjat №' },
              { key: 'date', label: 'Sana', render: (v) => v ? new Date(v).toLocaleDateString('uz-UZ') : '-' },
              { key: 'supplier', label: 'Ta\'minotchi' },
              { key: 'warehouse', label: 'Ombor' },
              { key: 'amount', label: 'Summa', render: (v) => `$${v?.toLocaleString() || 0}` },
              { key: 'items', label: 'Mahsulotlar' },
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