'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FileText, Printer, Eye, Copy, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';

interface PrintTemplate {
  id: string;
  name: string;
  type: 'INVOICE' | 'RECEIPT' | 'WAYBILL' | 'ACT' | 'CUSTOM';
  content: string;
  isActive: boolean;
  isDefault: boolean;
  paperSize: string;
  orientation: string;
  createdAt: string;
  updatedAt: string;
}

const typeLabels: Record<string, string> = {
  INVOICE: 'Hisob-faktura',
  RECEIPT: 'Chek',
  WAYBILL: 'Yo\'l xati',
  ACT: 'Dalolatnoma',
  CUSTOM: 'Maxsus',
};

const typeColors: Record<string, string> = {
  INVOICE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  RECEIPT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  WAYBILL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ACT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  CUSTOM: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

export default function PrintTemplatesPage() {
  const { success, error } = useNotification();

  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<PrintTemplate | null>(null);

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
      error('Xatolik', 'Shablonlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;

    try {
      const res = await fetch(`/api/print-templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('O\'chirildi', 'Shablon muvaffaqiyatli o\'chirildi');
        loadTemplates();
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'O\'chirishda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const handleSetDefault = async (template: PrintTemplate) => {
    try {
      const res = await fetch(`/api/print-templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Standart shablon o\'zgartirildi');
        loadTemplates();
      } else {
        error('Xatolik', 'O\'zgartirishda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const handleDuplicate = async (template: PrintTemplate) => {
    try {
      const res = await fetch('/api/print-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (nusxa)`,
          type: template.type,
          content: template.content,
          paperSize: template.paperSize,
          orientation: template.orientation,
          isDefault: false,
          isActive: true,
        }),
      });
      if (res.ok) {
        success('Nusxa olindi', 'Shablon muvaffaqiyatli nusxa olindi');
        loadTemplates();
      } else {
        error('Xatolik', 'Nusxa olishda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      typeLabels[t.type].toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    byType: Object.entries(typeLabels).reduce((acc, [type, label]) => {
      acc[label] = templates.filter(t => t.type === type).length;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="w-full min-h-screen pb-12 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <FileText className="text-white" size={24} />
              </div>
              Chop etish shablonlari
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-1">
              Hisob-faktura, chek va boshqa hujjatlar shablonlarini boshqarish
            </p>
          </div>
          <Link
            href="/print-templates/add"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Plus size={18} />
            Yangi shablon
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-500/5 rounded-full" />
            <div className="relative">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <FileText size={24} />
              </div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami shablonlar</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.total}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-500/5 rounded-full" />
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <Printer size={24} />
              </div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Faol shablonlar</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.active}</div>
            </div>
          </div>

          {Object.entries(stats.byType).slice(0, 2).map(([label, count]) => (
            <div key={label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 dark:bg-slate-500/5 rounded-full" />
              <div className="relative">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-500/10 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400 mb-4">
                  <FileText size={24} />
                </div>
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{label}</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{count}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Shablon qidirish..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white shadow-sm"
                />
              </div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none text-slate-800 dark:text-white shadow-sm"
              >
                <option value="all">Barcha turlar</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center">
              <RefreshCw className="mx-auto mb-4 text-indigo-500 animate-spin" size={32} />
              <div className="text-slate-400 font-medium font-bold">Ma&apos;lumotlar yuklanmoqda...</div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FileText size={40} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">Shablonlar topilmadi</p>
              <Link href="/print-templates/add" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Yangi shablon yaratish
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {filteredTemplates.map(template => (
                <div key={template.id} className="px-8 py-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                        template.type === 'INVOICE' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                        template.type === 'RECEIPT' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                        template.type === 'WAYBILL' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                        'bg-slate-50 dark:bg-slate-800 text-slate-600'
                      }`}>
                        <FileText size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">
                            {template.name}
                          </h3>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${typeColors[template.type]}`}>
                            {typeLabels[template.type]}
                          </span>
                          {template.isDefault && (
                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm border border-amber-200/50 dark:border-amber-800/50">
                              Standart
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                          <span>{template.paperSize}</span>
                          <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                          <span>{template.orientation === 'portrait' ? 'Portret' : 'Landshaft'}</span>
                          <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                          <span>Yangilandi: {new Date(template.updatedAt).toLocaleDateString('uz-UZ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setPreviewTemplate(template); setShowPreview(true); }}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all active:scale-90"
                        title="Ko'rish"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(template)}
                        className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all active:scale-90"
                        title="Nusxa olish"
                      >
                        <Copy size={18} />
                      </button>
                      {!template.isDefault && (
                        <button
                          onClick={() => handleSetDefault(template)}
                          className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-2xl transition-all active:scale-90"
                          title="Standart qilish"
                        >
                          <FileText size={18} />
                        </button>
                      )}
                      <Link
                        href={`/print-templates/${template.id}/edit`}
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all active:scale-90"
                        title="Tahrirlash"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all active:scale-90"
                        title="O'chirish"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {previewTemplate.name}
                </h3>
                <p className="text-xs text-slate-500">{typeLabels[previewTemplate.type]} • {previewTemplate.paperSize}</p>
              </div>
              <button
                onClick={() => { setShowPreview(false); setPreviewTemplate(null); }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-80px)] flex justify-center">
              {(() => {
                const isThermal = previewTemplate.paperSize === '80mm' || previewTemplate.paperSize === '58mm';
                if (isThermal) {
                  return (
                    <div className="bg-white border border-slate-200 shadow-sm" style={{ width: 'auto', maxWidth: '100%' }}>
                      <div
                        style={{
                          width: previewTemplate.paperSize === '80mm' ? '80mm' : '58mm',
                          fontSize: '10pt',
                          fontFamily: "'Courier New', monospace",
                        }}
                        dangerouslySetInnerHTML={{ __html: previewTemplate.content }}
                      />
                    </div>
                  );
                }
                return (
                  <div
                    className="bg-white border border-slate-200 p-8 rounded-lg shadow-sm"
                    style={{
                      width: previewTemplate.paperSize === 'A4' ? '210mm' : '148mm',
                      minHeight: '297mm',
                    }}
                    dangerouslySetInnerHTML={{ __html: previewTemplate.content }}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
