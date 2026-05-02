'use client';

import { useState, useEffect } from 'react';
import { Search, Printer, Plus, FileText } from 'lucide-react';
import Link from 'next/link';
import MobileHeader from '@/components/mobile/MobileHeader';

interface PrintTemplate {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  updatedAt: string;
}

export default function MobilePrintTemplatesPage() {
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/print-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const typeLabels: Record<string, string> = {
    invoice: 'Hisob-faktura',
    receipt: 'Chek',
    waybill: 'Yo\u2019l varaqasi',
    label: 'Yorliq',
    contract: 'Shartnoma',
    act: 'Akt',
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Chop etish shablonlari"
        backHref="/mobile"
        rightAction={
          <Link href="/mobile/print-templates/add" className="p-2 rounded-xl bg-indigo-600 text-white active:scale-95 transition-transform">
            <Plus size={18} />
          </Link>
        }
      />

      <div className="px-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Shablon qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 mb-2">
              <Printer size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jami</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{templates.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <FileText size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faol</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{templates.filter(t => t.isActive).length}</div>
          </div>
        </div>

        {/* Template Cards */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="animate-pulse text-sm">Yuklanmoqda...</div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Printer size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Shablonlar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map(template => (
              <Link
                key={template.id}
                href={`/mobile/print-templates/${template.id}`}
                className="block bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{template.name}</h3>
                      {!template.isActive && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">Nofaol</span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full">
                      {typeLabels[template.type] || template.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 shrink-0">
                    {new Date(template.updatedAt).toLocaleDateString('uz-UZ')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
