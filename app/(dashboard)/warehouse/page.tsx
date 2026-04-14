'use client';
import Link from 'next/link';
import { Plus, Search, Calendar, ChevronDown, PackageOpen, Check, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function WarehousePage() {
  const { t } = useLanguage();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch warehouses
  useEffect(() => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(data => setWarehouses(Array.isArray(data) ? data : data.data || []))
      .catch(console.error);
  }, []);

  // Fetch transfers
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (fromWarehouseId) query.append('fromWarehouseId', fromWarehouseId);
    if (toWarehouseId) query.append('toWarehouseId', toWarehouseId);

    fetch(`/api/transfers?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        setTransfers(data.data || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [search, fromWarehouseId, toWarehouseId]);

  return (
    <div className="p-8 font-sans w-full h-full flex flex-col bg-[#fdfdfd] dark:bg-slate-900 relative text-slate-800 dark:text-slate-200">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wide mb-2 uppercase">{t('dashboard', 'title')} &gt; {t('warehouse', 'title')} &gt; <span className="text-slate-800 dark:text-slate-200">{t('warehouse', 'transfers')}</span></div>
        <div className="flex justify-between items-center">
          <h1 className="text-[32px] font-black text-[#0f172a] dark:text-slate-100 tracking-tight">{t('warehouse', 'transfers')}</h1>
          <Link href="/warehouse/add" className="flex items-center px-5 py-3 bg-[#111827] dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition">
            <Plus size={18} className="mr-2" /> Yangi {t('common', 'description')}
          </Link>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative">
           <label className="text-[9px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-3">{t('common', 'search')}</label>
           <div className="relative flex items-center">
             <Search size={16} className="absolute left-0 text-slate-400 dark:text-slate-500" />
             <input
               type="text"
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder={t('common', 'description') + '...'}
               className="w-full pl-6 border-none outline-none text-sm font-medium placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 bg-transparent"
             />
           </div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
           <label className="text-[9px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-3">{t('warehouse', 'transferDate')}</label>
           <div className="relative flex items-center justify-between">
             <div className="flex items-center">
               <Calendar size={16} className="text-slate-400 dark:text-slate-500 mr-2" />
               <input type="text" placeholder={t('common', 'all')} disabled className="w-full border-none outline-none text-sm font-medium placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 bg-transparent opacity-50" />
             </div>
           </div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
           <label className="text-[9px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-3">{t('warehouse', 'fromWarehouse')}</label>
           <div className="relative flex items-center">
             <select
               value={fromWarehouseId}
               onChange={e => setFromWarehouseId(e.target.value)}
               className="w-full text-sm font-medium text-slate-700 dark:text-slate-200 bg-transparent outline-none cursor-pointer appearance-none"
             >
               <option value="" className="dark:bg-slate-700">{t('common', 'all')} {t('warehouse', 'title').toLowerCase()}lar</option>
               {warehouses.map(w => (
                 <option key={w.id} value={w.id} className="dark:bg-slate-700">{w.name}</option>
               ))}
             </select>
             <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 absolute right-0 pointer-events-none" />
           </div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
           <label className="text-[9px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-3">{t('warehouse', 'toWarehouse')}</label>
           <div className="relative flex items-center">
             <select
               value={toWarehouseId}
               onChange={e => setToWarehouseId(e.target.value)}
               className="w-full text-sm font-medium text-slate-700 dark:text-slate-200 bg-transparent outline-none cursor-pointer appearance-none"
             >
               <option value="" className="dark:bg-slate-700">{t('common', 'all')} {t('warehouse', 'title').toLowerCase()}lar</option>
               {warehouses.map(w => (
                 <option key={w.id} value={w.id} className="dark:bg-slate-700">{w.name}</option>
               ))}
             </select>
             <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 absolute right-0 pointer-events-none" />
           </div>
         </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-slate-800 flex-1 overflow-auto flex flex-col rounded-t-xl mb-4 shadow-sm border border-slate-100 dark:border-slate-700 min-h-[300px]">
        {loading ? (
           <div className="flex-1 flex items-center justify-center">
              <span className="text-slate-400 dark:text-slate-500 font-bold">{t('common', 'loading')}</span>
           </div>
        ) : transfers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
             <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-3xl flex justify-center items-center text-slate-300 dark:text-slate-600 mb-6">
               <PackageOpen size={48} strokeWidth={1.5} />
             </div>
             <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3">{t('common', 'noData')}</h2>
             <p className="text-slate-500 dark:text-slate-400 font-medium text-sm text-center max-w-sm leading-relaxed mb-8">
               {t('common', 'search')} {t('common', 'description')}
             </p>
             <div className="flex space-x-3">
               <button onClick={() => {setSearch(''); setFromWarehouseId(''); setToWarehouseId('');}} className="px-6 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition">
                 {t('common', 'clear')}
               </button>
               <Link href="/warehouse/add" className="px-6 py-2.5 bg-[#006A60] dark:bg-teal-700 text-white text-sm font-bold rounded-lg hover:bg-teal-800 dark:hover:bg-teal-600 shadow-md shadow-[#006A60]/20 transition">
                 {t('common', 'add')}
               </Link>
             </div>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'description')}</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'date')}</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('warehouse', 'fromWarehouse')}</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('warehouse', 'toWarehouse')}</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'status')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {transfers.map(tr => (
                 <tr key={tr.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                   <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{tr.docNumber}</td>
                   <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{new Date(tr.date).toLocaleDateString()}</td>
                   <td className="px-6 py-4"><span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-md text-xs font-bold">{tr.fromWarehouse?.name || '-'}</span></td>
                   <td className="px-6 py-4"><span className="bg-slate-100 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-md text-xs font-bold">{tr.toWarehouse?.name || '-'}</span></td>
                   <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${tr.status === 'COMPLETED' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>
                       {tr.status}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-right">
                     <button className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"><Eye size={18} /></button>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom overlay System Status */}
      <div className="absolute right-8 bottom-32 flex items-center pr-24 z-10">
         <div className="text-right mr-3">
            <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">System Status</div>
            <div className="text-[10px] text-teal-400 font-bold">{t('common', 'active')}</div>
         </div>
         <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center text-slate-300 dark:text-slate-500">
           <Check size={14} />
         </div>
      </div>

      {/* 3 Bottom Cards */}
      <div className="grid grid-cols-3 gap-6 mt-auto">
         <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 border-l-[4px] border-l-[#0f1522] dark:border-l-slate-400">
           <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{t('common', 'total')}</div>
           <div className="text-2xl font-black text-slate-900 dark:text-slate-100 flex justify-between items-baseline">
             {transfers.length} <span className="text-xs font-bold text-slate-500 dark:text-slate-400 lowercase tracking-normal">ta {t('common', 'description')}</span>
           </div>
         </div>
         <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 border-l-[4px] border-l-[#14b8a6]">
           <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{t('common', 'all')} {t('warehouse', 'title').toUpperCase()}</div>
           <div className="text-2xl font-black text-slate-900 dark:text-slate-100 flex justify-between items-baseline">
             {warehouses.length} <span className="text-xs font-bold text-slate-500 dark:text-slate-400 lowercase tracking-normal">ta {t('warehouse', 'title').toLowerCase()}</span>
           </div>
         </div>
         <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 border-l-[4px] border-l-[#d97706]">
           <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{t('common', 'description')}</div>
           <div className="text-2xl font-black text-slate-900 dark:text-slate-100 flex justify-between items-baseline">
             {transfers.filter(t => t.status === 'PENDING').length} <span className="text-xs font-bold text-slate-500 dark:text-slate-400 lowercase tracking-normal">{t('common', 'description')}</span>
           </div>
         </div>
      </div>
    </div>
  );
}
