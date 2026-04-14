'use client';
import { Plus, FileText, Edit2, Trash2, ChevronLeft, ChevronRight, Clock, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PricesPage() {
  const { t } = useLanguage();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/price-lists')
      .then(r => r.json())
      .then(data => {
        setLists(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);
  return (
    <div className="p-8 font-sans w-full h-full flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{t('products', 'title')} / <span className="text-slate-800 dark:text-slate-200">{t('products', 'priceLists')}</span></div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-[#0f172a] dark:text-slate-100 tracking-tight">{t('products', 'priceLists')}</h1>
          <Link href="/prices/add" className="flex items-center px-6 py-3 bg-[#0f172a] dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold rounded-lg shadow-xl shadow-slate-900/10 transition">
            <Plus size={18} className="mr-2" /> {t('common', 'add')} {t('products', 'priceLists').toLowerCase()}
          </Link>
        </div>
      </div>

      {/* 4 Top Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
         <div className="bg-white dark:bg-slate-800 p-6 pb-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-[6px] border-l-[#0f172a] dark:border-l-slate-400">
           <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{t('common', 'total')} {t('products', 'priceLists').toUpperCase()}</div>
           <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{lists.length} ta</div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 pb-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-[6px] border-l-[#3bf6d7]">
           <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{t('common', 'active')} {t('products', 'priceLists').toUpperCase()}</div>
           <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{lists.filter(l => l.isActive).length} ta</div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 pb-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-[6px] border-l-yellow-600">
           <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{t('sales', 'title')} {t('products', 'priceLists').toUpperCase()}</div>
           <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{lists.filter(l => l.type === 'SALE').length} ta</div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 pb-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-[6px] border-l-slate-300 dark:border-l-slate-500">
           <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{t('purchases', 'title')} {t('products', 'priceLists').toUpperCase()}</div>
           <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{lists.filter(l => l.type === 'PURCHASE').length} ta</div>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-800 flex-1 overflow-hidden flex flex-col">
        <table className="w-full text-left text-sm border-t border-slate-100 dark:border-slate-700">
          <thead>
            <tr>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">#</th>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('products', 'priceLists')} {t('common', 'name')}</th>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('suppliers', 'category')}</th>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('products', 'title')} {t('common', 'total')}</th>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'date')}</th>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'status')}</th>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('common', 'actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 font-bold text-slate-500 dark:text-slate-400">{t('common', 'loading')}</td></tr>
            ) : lists.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 font-bold text-slate-500 dark:text-slate-400">{t('products', 'priceLists')} {t('common', 'noData')}</td></tr>
            ) : lists.map((item: any, i: number) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-6 text-slate-500 dark:text-slate-400 font-medium">{i + 1}</td>
                <td className="px-6 py-6 font-bold text-slate-900 dark:text-slate-100 flex items-center">
                  <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 flex justify-center items-center mr-3">
                    <FileText size={16} />
                  </div>
                  {item.name}
                </td>
                <td className="px-6 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.type === 'SALE' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>
                    {item.type === 'SALE' ? t('sales', 'title') : t('purchases', 'title')}
                  </span>
                </td>
                <td className="px-6 py-6 font-medium text-slate-600 dark:text-slate-300">{item._count?.items || 0} {'dona'}</td>
                <td className="px-6 py-6 font-medium text-slate-600 dark:text-slate-300">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-6">
                  <div className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase">
                    <span className={`w-2 h-2 rounded-full mr-2 ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'}`}></span>
                    {item.isActive ? t('common', 'active') : t('common', 'inactive')}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex justify-end space-x-3 text-slate-400 dark:text-slate-500">
                    <button className="hover:text-slate-900 dark:hover:text-slate-200 transition"><Edit2 size={18} /></button>
                    <button className="hover:text-red-500 dark:hover:text-red-400 transition"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-6 mt-auto border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
           <div className="flex items-center space-x-4">
             <span>{"Ko'rsatilmoqda"}: 1 - 4 {t('common', 'total')} 24</span>
             <div className="flex items-center space-x-2 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700">
               <span>10 ta</span>
               <ChevronDown size={14} className="text-slate-400 dark:text-slate-500" />
             </div>
           </div>

           <div className="flex items-center space-x-1 font-black">
             <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><ChevronLeft size={16} /></button>
             <button className="w-8 h-8 flex justify-center items-center bg-[#0f172a] dark:bg-slate-600 text-white rounded">1</button>
             <button className="w-8 h-8 flex justify-center items-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded">2</button>
             <button className="w-8 h-8 flex justify-center items-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded">3</button>
             <span className="px-2 text-slate-400 dark:text-slate-600">...</span>
             <button className="w-8 h-8 flex justify-center items-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded">6</button>
             <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><ChevronRight size={16} /></button>
           </div>
        </div>

        {/* Footer Info */}
        <div className="px-6 pb-6 pt-2 flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
          <div className="flex items-center">
            <Clock size={12} className="mr-2" /> {"Ma'lumotlar oxirgi marta bugun 14:45 da yangilandi"}
          </div>
          <div>WALLPAPER WM V2.4.0</div>
        </div>
      </div>
    </div>
  );
}
