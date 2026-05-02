'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';

interface ReportColumn {
  key: string;
  label: string;
}

export default function MobileReportBuilder() {
  const [name, setName] = useState('');
  const [reportType, setReportType] = useState('sales');
  const [columns, setColumns] = useState<ReportColumn[]>([
    { key: 'docNumber', label: 'Hujjat №' },
    { key: 'date', label: 'Sana' },
    { key: 'amount', label: 'Summa' },
  ]);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [saving, setSaving] = useState(false);

  const reportTypes = [
    { value: 'sales', label: 'Savdo' },
    { value: 'purchases', label: 'Xaridlar' },
    { value: 'inventory', label: 'Ombor' },
    { value: 'financial', label: 'Moliyaviy' },
    { value: 'debts', label: 'Qarzlar' },
  ];

  const availableColumns = [
    { key: 'customer', label: 'Mijoz' },
    { key: 'supplier', label: 'Ta\u2019minotchi' },
    { key: 'warehouse', label: 'Ombor' },
    { key: 'category', label: 'Kategoriya' },
    { key: 'quantity', label: 'Miqdor' },
    { key: 'status', label: 'Holat' },
    { key: 'paymentType', label: 'To\u2019lov turi' },
  ];

  const handleRemoveColumn = (key: string) => {
    setColumns(columns.filter(c => c.key !== key));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/reports/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type: reportType, columns, dateFrom, dateTo }),
      });
    } catch {}
    setSaving(false);
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Hisobot Yaratish" backHref="/mobile/reports" />

      <div className="px-6 mt-2 space-y-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 mb-2 block">Hisobot nomi</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Masalan: Haftalik savdo hisoboti"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 mb-2 block">Hisobot turi</label>
          <div className="relative">
            <select value={reportType} onChange={e => setReportType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/20">
              {reportTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 mb-2 block">Sana oralig{'\u2019'}i</label>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold text-slate-500">Ustunlar</label>
            <button onClick={() => setShowAddColumn(true)} className="flex items-center gap-1 text-teal-600 dark:text-teal-400 text-xs font-bold active:scale-95">
              <Plus size={14} /> Qo{'\u2019'}shish
            </button>
          </div>
          <div className="space-y-2">
            {columns.map(col => (
              <div key={col.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{col.label}</span>
                <button onClick={() => handleRemoveColumn(col.key)} className="p-1 text-slate-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {showAddColumn && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]" onClick={() => setShowAddColumn(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-w-md mx-auto" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Ustun qo{'\u2019'}shish</h3>
              <div className="space-y-3">
                {availableColumns.filter(ac => !columns.find(c => c.key === ac.key)).map(ac => (
                  <button key={ac.key} onClick={() => { setColumns([...columns, { key: ac.key, label: ac.label }]); setShowAddColumn(false); }}
                    className="w-full text-left p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white active:scale-[0.98] transition-transform">
                    {ac.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAddColumn(false)} className="w-full mt-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm">Bekor qilish</button>
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={saving || !name}
          className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold text-sm active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100">
          {saving ? 'Saqlanmoq...' : 'Hisobotni saqlash'}
        </button>
      </div>
    </div>
  );
}
