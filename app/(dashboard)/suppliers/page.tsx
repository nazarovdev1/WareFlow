'use client';
import { Search, ChevronDown, Filter, Plus, UserPlus, Eye, Edit2, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SuppliersPage() {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (status) query.append('status', status);
        if (category) query.append('category', category);

        const res = await fetch(`/api/suppliers?${query.toString()}`);
        const data = await res.json();
        setSuppliers(data.data || []);
      } catch (error) {
        console.error(t('messages', 'error'), error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSuppliers();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, status, category]);

  return (
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fdfdfd] dark:bg-slate-900 relative text-slate-800 dark:text-slate-200">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-black text-[#0f172a] dark:text-slate-100 tracking-tight">{t('suppliers', 'title')}</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">{t('suppliers', 'allSuppliers')}</p>
        </div>
        <div className="flex space-x-4 items-center">
          <Link href="/suppliers/add" className="flex items-center px-5 py-2.5 bg-[#0f172a] dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition">
            <Plus size={16} className="mr-2" /> {t('suppliers', 'addSupplier')}
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6 mb-8">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm border-l-4 border-l-slate-900 dark:border-l-slate-400">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('common', 'total')} {t('suppliers', 'title').toUpperCase()}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{suppliers.length} ta</div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm border-l-4 border-l-teal-500">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('common', 'active')}</div>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400">{suppliers.filter(s => s.status === 'ACTIVE').length} ta</div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm border-l-4 border-l-indigo-500">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('common', 'description')}</div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{suppliers.filter(s => s.category === 'MANUFACTURER').length} ta</div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm border-l-4 border-l-orange-500">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('common', 'description')}</div>
            <div className="text-2xl font-black text-orange-600 dark:text-orange-400">{suppliers.filter(s => s.category === 'WHOLESALER').length} ta</div>
         </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-6 mb-12 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex-1 w-full relative">
          <label className="text-[10px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-3">{t('common', 'search')}</label>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('common', 'name') + ', ' + t('common', 'description') + ' ' + t('common', 'description') + ' tel...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-3 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-600 focus:border-indigo-200 dark:focus:border-indigo-800 transition-all font-medium"
            />
          </div>
        </div>
        <div className="w-full md:w-56">
          <label className="text-[10px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-3">{t('common', 'status')}</label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-4 py-3 rounded-xl text-sm text-slate-700 dark:text-slate-200 font-medium cursor-pointer outline-none appearance-none"
            >
              <option value="" className="dark:bg-slate-700">{t('common', 'all')}</option>
              <option value="ACTIVE" className="dark:bg-slate-700">{t('common', 'active')}</option>
              <option value="INACTIVE" className="dark:bg-slate-700">{t('common', 'inactive')}</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>
        <div className="w-full md:w-56">
          <label className="text-[10px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-3">{t('suppliers', 'category')}</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-4 py-3 rounded-xl text-sm text-slate-700 dark:text-slate-200 font-medium cursor-pointer outline-none appearance-none"
            >
              <option value="" className="dark:bg-slate-700">{t('common', 'all')}</option>
              <option value="MANUFACTURER" className="dark:bg-slate-700">{t('common', 'description')}</option>
              <option value="WHOLESALER" className="dark:bg-slate-700">{t('common', 'description')}</option>
              <option value="LOCAL" className="dark:bg-slate-700">{t('common', 'description')}</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>
        <div className="pb-1">
          <button
            onClick={() => {setSearch(''); setStatus(''); setCategory('');}}
            className="p-3 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex h-full items-center justify-center p-20">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">{t('common', 'loading')}</p>
            </div>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 text-slate-200 dark:text-slate-600">
               <UserPlus size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-3 tracking-tight">{t('common', 'noData')}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm text-center max-w-sm leading-relaxed mb-8">
              {t('suppliers', 'title')} bazasi bo&apos;sh. {t('suppliers', 'addSupplier')} {t('common', 'description')}
            </p>
            <Link href="/suppliers/add" className="flex items-center px-6 py-3 bg-[#0f172a] dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-lg shadow-xl shadow-slate-900/10 transition">
              + {t('suppliers', 'addSupplier')}
            </Link>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('common', 'name')}</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('suppliers', 'contactPerson')}</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('customers', 'phone')}</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('suppliers', 'category')}</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('common', 'status')}</th>
                <th className="px-6 py-4 text-right pr-10 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('common', 'actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700 font-sans text-sm">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs mr-4 shrink-0">
                        {s.name.substring(0,2).toUpperCase()}
                      </div>
                      <span className="font-black text-slate-900 dark:text-slate-100 text-base">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">{s.contactPerson || '-'}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">{s.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                      {s.category || t('common', 'description')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${s.status === 'ACTIVE' ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                      <span className={`text-[11px] font-black uppercase tracking-wider ${s.status === 'ACTIVE' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {s.status === 'ACTIVE' ? t('common', 'active') : t('common', 'inactive')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right pr-6">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm"><Eye size={18} /></button>
                      <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm"><Edit2 size={18} /></button>
                      <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
