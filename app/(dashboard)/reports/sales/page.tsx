'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ShoppingCart, DollarSign, TrendingUp, Package } from 'lucide-react';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportChart } from '@/components/reports/ReportChart';
import { ReportTable } from '@/components/reports/ReportTable';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { useReportsStream } from '@/hooks/useReportsStream';
import { ExportButton } from '@/components/reports/ExportButton';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SalesReportPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
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

      const res = await fetch(`/api/reports/sales?${params}`);
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
    if (streamData?.sales_update && streamData.sales_update.length > 0) {
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
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Savdo Hisobotlari</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Savdo tahlillari va statistikasi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isConnected ? 'Real-time' : 'Offline'}
            </span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <RefreshCw size={18} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <ExportButton
            type="sales"
            data={data?.tableData || []}
            filename="sales-report"
            columns={[
              { key: 'docNumber', label: 'Hujjat №' },
              { key: 'date', label: 'Sana' },
              { key: 'customer', label: 'Mijoz' },
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
              title="Jami buyurtmalar"
              value={data?.summary?.totalOrders?.toLocaleString() || 0}
              icon={<ShoppingCart size={20} />}
              color="blue"
            />
            <ReportCard
              title="Jami daromad"
              value={`$${(data?.summary?.totalRevenue || 0).toLocaleString()}`}
              icon={<DollarSign size={20} />}
              color="emerald"
            />
            <ReportCard
              title="O'rtacha buyurtma"
              value={`$${(data?.summary?.avgOrderValue || 0).toFixed(2)}`}
              icon={<TrendingUp size={20} />}
              color="violet"
            />
            <ReportCard
              title="Top mahsulot"
              value={data?.summary?.topProduct || '-'}
              icon={<Package size={20} />}
              color="amber"
            />
          </div>

          {data?.chartData?.length > 0 && (
            <div className="mb-6">
              <ReportChart
                type="area"
                data={data.chartData}
                config={{
                  nameKey: 'date',
                  lines: [
                    { key: 'amount', color: '#0ea5e9', name: 'Daromad' },
                    { key: 'orders', color: '#10b981', name: 'Buyurtmalar' },
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
              { key: 'customer', label: 'Mijoz' },
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