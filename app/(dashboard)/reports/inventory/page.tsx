'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportChart } from '@/components/reports/ReportChart';
import { ReportTable } from '@/components/reports/ReportTable';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { useReportsStream } from '@/hooks/useReportsStream';
import { ExportButton } from '@/components/reports/ExportButton';
import { Package, Warehouse, DollarSign, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function InventoryReportPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ warehouseId?: string; categoryId?: string; lowStock?: boolean }>({});
  const { data: streamData, isConnected } = useReportsStream();
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '' && v !== false)
        ),
      });

      const res = await fetch(`/api/reports/inventory?${params}`);
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
    if (streamData?.inventory_update && streamData.inventory_update.length > 0) {
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
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Ombor Hisobotlari</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Ombor statistikasi va mahsulotlar</p>
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
            type="inventory"
            data={data?.tableData || []}
            filename="inventory-report"
            columns={[
              { key: 'product', label: 'Mahsulot' },
              { key: 'sku', label: 'SKU' },
              { key: 'category', label: 'Kategoriya' },
              { key: 'warehouse', label: 'Ombor' },
              { key: 'stock', label: 'Stock' },
              { key: 'reserved', label: 'Zahira' },
              { key: 'available', label: 'Mavjud' },
              { key: 'costPrice', label: 'Xarid narxi ($)' },
              { key: 'sellPrice', label: 'Sotuv narxi ($)' },
              { key: 'value', label: 'Umumiy qiymat ($)' },
              { key: 'lowStock', label: 'Kam qolgan' },
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
              title="Jami mahsulotlar"
              value={data?.summary?.totalProducts?.toLocaleString() || 0}
              icon={<Package size={20} />}
              color="blue"
            />
            <ReportCard
              title="Jami stock"
              value={data?.summary?.totalStock?.toLocaleString() || 0}
              icon={<Warehouse size={20} />}
              color="emerald"
            />
            <ReportCard
              title="Umumiy qiymat"
              value={`$${(data?.summary?.totalValue || 0).toLocaleString()}`}
              icon={<DollarSign size={20} />}
              color="violet"
            />
            <ReportCard
              title="Kam qolgan"
              value={data?.summary?.lowStockItems || 0}
              icon={<AlertTriangle size={20} />}
              color="amber"
            />
          </div>

          {data?.chartData?.length > 0 && (
            <div className="mb-6">
              <ReportChart
                type="bar"
                data={data.chartData}
                config={{
                  nameKey: data.chartData[0]?.category ? 'category' : 'warehouse',
                  lines: [
                    { key: 'stock', color: '#0ea5e9', name: 'Soni' },
                    { key: 'value', color: '#10b981', name: 'Qiymat' },
                  ],
                }}
              />
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={filters.lowStock || false}
                onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked || undefined })}
                className="w-4 h-4 text-teal-500 rounded border-slate-300 focus:ring-teal-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Faqat kam qolganlar</span>
            </label>
          </div>

          <ReportFilters
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters({})}
          />

          <ReportTable
            columns={[
              { key: 'product', label: 'Mahsulot' },
              { key: 'sku', label: 'SKU' },
              { key: 'category', label: 'Kategoriya' },
              { key: 'warehouse', label: 'Ombor' },
              { key: 'stock', label: 'Stock', render: (v) => v < 10 ? <span className="text-amber-500 font-medium">{v}</span> : v },
              { key: 'available', label: 'Mavjud' },
              { key: 'value', label: 'Qiymat', render: (v) => `$${v?.toLocaleString() || 0}` },
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