'use client';
import { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertTriangle, ScanLine, Printer } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function InventoryCheckPage() {
  const { t } = useLanguage();
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inventory-audit')
      .then(res => res.json())
      .then(data => {
        setAudits(Array.isArray(data) ? data : data.data || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-8 font-sans w-full h-full flex flex-col bg-[#fdfdfd] dark:bg-slate-900 relative text-slate-800 dark:text-slate-200">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wide mb-2 uppercase">{t('dashboard', 'title')} &gt; {t('warehouse', 'title')} &gt; <span className="text-slate-800 dark:text-slate-200">{t('warehouse', 'inventory')}</span></div>
          <h1 className="text-[32px] font-black text-[#0f172a] dark:text-slate-100 tracking-tight">{t('warehouse', 'inventory')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2">{t('warehouse', 'title')}dagi haqiqiy qoldiqni dastur qoldig&apos;i bilan solishtirish</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition">
            <Printer size={16} className="mr-2" /> {t('common', 'print')}
          </button>
          <button className="flex items-center px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-teal-600/20 transition cursor-pointer">
            <ScanLine size={16} className="mr-2" /> {'Yangi'} {t('warehouse', 'inventory').toLowerCase()}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 flex-1 overflow-hidden flex flex-col rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-20 text-slate-400 dark:text-slate-500 font-bold">{t('common', 'loading')}</div>
        ) : audits.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20">
             <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-200 dark:text-slate-600 mb-4">
                <ScanLine size={32} />
             </div>
             <p className="text-slate-400 dark:text-slate-500 font-bold">{t('common', 'noData')}</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{'Hujjat Raqami'}</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'date')}</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('warehouse', 'title')}</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{'Natija'}</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'status')}</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('warehouse', 'responsiblePerson')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {audits.map((item, i) => {
                const diffItems = item.items?.filter((it: any) => it.difference !== 0).length || 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 border-b border-transparent hover:border-slate-800 dark:hover:border-slate-400 cursor-pointer inline-block">{item.docNumber}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-md text-xs font-bold">{item.warehouse?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {diffItems > 0 ? (
                        <span className="text-rose-500 dark:text-rose-400 font-black px-2 py-1 bg-rose-50 dark:bg-rose-900/30 rounded text-[10px] uppercase tracking-wider">{diffItems} ta {'farq bor'}</span>
                      ) : (
                        <span className="text-teal-500 dark:text-teal-400 font-bold px-2 py-1 bg-teal-50 dark:bg-teal-900/30 rounded text-[10px] uppercase tracking-wider">{'Hamma mahsulot joyida'}</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {item.status === 'COMPLETED' ? (
                        <span className="flex items-center text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider">
                          <CheckCircle size={14} className="mr-1" /> {t('common', 'completed')}
                        </span>
                      ) : (
                        <span className="flex items-center text-orange-500 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider">
                          <AlertTriangle size={14} className="mr-1" /> {'Jarayonda'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-600 dark:text-slate-300">
                      {item.responsiblePerson || '-'}
                    </td>
                  </tr>
                )})}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
