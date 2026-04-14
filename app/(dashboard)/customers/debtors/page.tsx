'use client';
import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Filter, RotateCcw, History, CreditCard, FileText, Wallet, Users, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DebtorsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [debtors, setDebtors] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCustomers: 0, totalBalanceUSD: 0, totalBalanceUZS: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState('');

  const [page, setPage] = useState(1);
  const limit = 25;

  const fetchDebtors = async () => {
    setLoading(true);
    try {
      let url = `/api/customers?isDebtor=true&page=${page}&limit=${limit}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (region) url += `&region=${encodeURIComponent(region)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDebtors(data.data || []);
        setStats(data.stats || { totalCustomers: 0, totalBalanceUSD: 0, totalBalanceUZS: 0 });
      }
    } catch (error) {
      console.error(t('messages', 'error'), error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtors();
  }, [page, region]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDebtors();
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fdfdfd] dark:bg-slate-900 relative text-slate-800 dark:text-slate-200">
      <div className="mb-8">
        <div className="text-[12px] font-bold text-slate-500 dark:text-slate-400 tracking-wide mb-6">{t('customers', 'title')} &gt; <span className="text-teal-600 dark:text-teal-400">{t('customers', 'debtors')}</span></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div className="flex items-center mb-4">
               <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center mr-3"><Wallet size={20} /></div>
               <div className="text-[10px] font-black tracking-widest text-red-500 dark:text-red-400 uppercase">{t('common', 'total')} {t('customers', 'debtors')} (USD)</div>
            </div>
            <div>
               <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                 {stats.totalBalanceUSD < 0 ? stats.totalBalanceUSD.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
               </div>
               <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 hover:text-slate-600 dark:hover:text-slate-300">{t('dashboard', 'today')}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div className="flex items-center mb-4">
               <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 flex items-center justify-center mr-3"><BanknoteIcon /></div>
               <div className="text-[10px] font-black tracking-widest text-orange-500 dark:text-orange-400 uppercase">{t('common', 'total')} {t('customers', 'debtors')} (UZS)</div>
            </div>
            <div>
               <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                 {stats.totalBalanceUZS < 0 ? stats.totalBalanceUZS.toLocaleString('ru-RU') : '0'}
               </div>
               <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 hover:text-slate-600 dark:hover:text-slate-300">{t('dashboard', 'today')}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div className="flex items-center mb-4">
               <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mr-3"><Users size={20} /></div>
               <div className="text-[10px] font-black tracking-widest text-teal-600 dark:text-teal-400 uppercase">{t('customers', 'title')} {t('common', 'total')}</div>
            </div>
            <div>
               <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{stats.totalCustomers}</div>
               <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 hover:text-slate-600 dark:hover:text-slate-300">{t('common', 'active')} {t('customers', 'debtors')}</div>
            </div>
          </div>

          <div className="bg-[#0b1625] dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center mb-4 relative z-10">
               <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mr-3"><LayoutDashboard size={20} /></div>
               <div className="text-[10px] font-black tracking-widest text-teal-400 uppercase">{t('dashboard', 'quickActions')}</div>
            </div>
            <button className="w-full bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-[#0b1625] dark:text-slate-200 text-sm font-black py-3 rounded-lg transition relative z-10 uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0">
               {t('dashboard', 'quickActions')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-end gap-4 mb-6">
         <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-sm">
           <label className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase block mb-3">{t('common', 'search')}</label>
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
             <input
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder={t('common', 'search')}
               className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20"
             />
           </div>
         </form>
         <div className="w-full md:max-w-[240px]">
           <label className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase block mb-3">{t('customers', 'region')}</label>
           <div className="relative">
             <select
               className="w-full appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-4 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20"
               value={region}
               onChange={(e) => setRegion(e.target.value)}
             >
               <option value="" className="dark:bg-slate-700">{t('common', 'all')} {t('customers', 'region')}lar</option>
               <option value="Toshkent" className="dark:bg-slate-700">Toshkent</option>
               <option value="Samarqand" className="dark:bg-slate-700">Samarqand</option>
               <option value="Andijon" className="dark:bg-slate-700">Andijon</option>
               <option value="Xorazm" className="dark:bg-slate-700">Xorazm</option>
             </select>
             <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
           </div>
         </div>
         <div className="flex space-x-2 pb-0 mt-4 md:mt-0 w-full md:w-auto">
           <button
             onClick={handleSearch}
             className="flex-1 md:flex-none flex items-center justify-center px-6 py-2 bg-[#00927c] dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-sm font-bold rounded-lg shadow-md transition"
           >
             <Filter size={16} className="mr-2" /> {t('common', 'filter')}
           </button>
           <button
             onClick={() => { setSearchQuery(''); setRegion(''); setPage(1); }}
             className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition shrink-0"
           >
             <RotateCcw size={18} />
           </button>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 dark:border-teal-400"></div>
          </div>
        ) : debtors.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">{t('customers', 'debtors')} {t('common', 'noData')}</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fcf8f6] dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 dark:border-slate-600 w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      onChange={(e) => {
                        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"][data-row]');
                        checkboxes.forEach(cb => (cb as HTMLInputElement).checked = e.target.checked);
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('customers', 'title')}</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('customers', 'balance')} (USD / UZS)</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('customers', 'phone')}</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('common', 'status')}</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">{t('common', 'actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {debtors.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        data-row="true"
                        className="rounded border-slate-300 dark:border-slate-600 w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex justify-center items-center font-bold text-sm mr-3 ${i % 2 === 0 ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'}`}>
                          {getInitials(item.fullName)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{item.fullName}</div>
                          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-0.5 tracking-wider uppercase">ID: {item.id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-red-500 dark:text-red-400 text-[13px]">{item.balanceUSD < 0 ? `${item.balanceUSD.toLocaleString('ru-RU')} USD` : '--'}</div>
                      <div className="font-black text-orange-500 dark:text-orange-400 text-[11px] mt-0.5">{item.balanceUZS < 0 ? `${item.balanceUZS.toLocaleString('ru-RU')} UZS` : '--'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300 text-sm whitespace-nowrap">
                      {item.phone || '--'}
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'ACTIVE' ? (
                        <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-md">{t('common', 'active')}</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-xs font-bold px-3 py-1">{t('common', 'inactive')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end space-x-2">
                        <button className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md transition" title={"To'lovlar tarixi"}><History size={16} /></button>
                        <button className="p-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-md transition" title={t('dashboard', 'quickActions')}><CreditCard size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 dark:border-slate-700">
           <div className="flex items-center space-x-6 text-xs font-bold text-slate-500 dark:text-slate-400">
             <span>{t('common', 'total')} - <span className="text-slate-900 dark:text-slate-100">{stats.totalCustomers}</span> ta {'yozuv'}</span>
           </div>

           <div className="flex items-center space-x-1 font-black">
             <button
               onClick={() => setPage(Math.max(1, page - 1))}
               disabled={page === 1}
               className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30"
             ><ChevronLeft size={16} /></button>
             <button className="w-8 h-8 flex justify-center items-center bg-[#00927c] dark:bg-teal-700 text-white rounded">{page}</button>
             <button
               onClick={() => setPage(page + 1)}
               disabled={debtors.length < limit}
               className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30"
             ><ChevronRight size={16} /></button>
           </div>
        </div>
      </div>
    </div>
  );
}

function BanknoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}
