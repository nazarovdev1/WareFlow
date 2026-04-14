'use client';
import { ChevronDown, Filter, ChevronRight, ChevronLeft, Map, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CustomersPage() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCustomers: 0, totalBalanceUSD: 0, totalBalanceUZS: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/customers?limit=100')
      .then(res => res.json())
      .then(data => {
        setCustomers(data.data || []);
        if (data.stats) setStats(data.stats);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return '??';
    const split = name.split(' ');
    if (split.length >= 2) return `${split[0][0]}${split[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getRegionCounts = () => {
    const counts: Record<string, number> = { 'TOSHKENT': 0, 'SAMARQAND': 0, "FARG'ONA": 0, 'BOSHQA': 0 };
    customers.forEach(c => {
      const r = (c.region || '').toUpperCase();
      if (counts[r] !== undefined) counts[r]++;
      else counts['BOSHQA']++;
    });
    return Object.entries(counts).sort((a,b) => b[1]-a[1]);
  };

  return (
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fcfcfd] dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] dark:text-slate-100 tracking-tight mb-2">{t('customers', 'title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('customers', 'allCustomers')}</p>
        </div>
        <Link href="/customers/add" className="flex items-center px-4 py-2.5 bg-[#0f172a] dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition">
          + {t('customers', 'addCustomer')}
        </Link>
      </div>

      <div className="flex space-x-6 mb-8 mt-2">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 max-w-[280px]">
           <label className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase block mb-3">{t('customers', 'region')} {t('common', 'description')}</label>
           <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
             <span>{t('common', 'all')}</span>
             <ChevronDown size={14} className="text-slate-400 dark:text-slate-500" />
           </div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 max-w-[280px]">
           <label className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase block mb-3">{t('common', 'description')}</label>
           <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
             <span>{t('common', 'all')}</span>
             <ChevronDown size={14} className="text-slate-400 dark:text-slate-500" />
           </div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 max-w-[280px]">
           <label className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase block mb-3">{t('common', 'status')}</label>
           <div className="flex bg-slate-50 dark:bg-slate-700 p-1 rounded-lg">
             <button className="flex-1 bg-white dark:bg-slate-600 shadow-sm text-teal-600 dark:text-teal-400 font-bold text-xs py-1.5 rounded-md">{t('common', 'active')}</button>
             <button className="flex-1 text-slate-500 dark:text-slate-400 font-bold text-xs py-1.5 rounded-md">{t('common', 'inactive')}</button>
           </div>
         </div>
         <div className="flex items-end pb-4">
           <button className="flex items-center px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-black tracking-wide rounded-lg transition border border-slate-200 dark:border-slate-600">
             <Filter size={14} className="mr-2" /> {t('common', 'clear')}
           </button>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-t-xl border border-b-0 border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden text-sm mb-0">
        <div className="grid grid-cols-12 px-6 py-5 bg-[#f8fafc] dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 text-[10px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase">
          <div className="col-span-3">{t('common', 'name')}</div>
          <div className="col-span-3">{t('customers', 'companyName')}</div>
          <div className="col-span-2">{t('customers', 'phone')}</div>
          <div className="col-span-1">{t('common', 'status')}</div>
          <div className="col-span-1 text-right">{t('customers', 'balance')} (USD)</div>
          <div className="col-span-2 text-right">{t('customers', 'balance')} (UZS)</div>
        </div>

        <div className="divide-y divide-slate-50 dark:divide-slate-700 min-h-[200px]">
          {loading ? (
             <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-bold">{t('common', 'loading')}</div>
          ) : customers.length === 0 ? (
             <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-bold">{t('customers', 'title')} {t('common', 'noData')}</div>
          ) : customers.map((c, i) => (
            <div key={c.id} className="grid grid-cols-12 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors items-center">
              <div className="col-span-3 flex items-center pr-4">
                <div className={`w-9 h-9 rounded-full flex justify-center items-center font-bold text-xs mr-3 ${i % 2 === 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'}`}>
                  {getInitials(c.fullName)}
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  <span className="block">{c.fullName}</span>
                </div>
              </div>
              <div className="col-span-3 text-sm text-slate-600 dark:text-slate-300 font-medium pr-4 leading-snug">
                 {c.companyName || '-'}
              </div>
              <div className="col-span-2 text-[13px] text-slate-600 dark:text-slate-300 font-medium">
                 {c.phone ? (
                   <>
                    {c.phone.substring(0,7)}<br/>{c.phone.substring(7)}
                   </>
                 ) : '-'}
              </div>
              <div className="col-span-1">
                 <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest ${c.status === 'ACTIVE' ? 'bg-[#ccfbf1] dark:bg-teal-900/30 text-[#0d9488] dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                   {c.status === 'ACTIVE' ? t('common', 'active') : t('common', 'inactive')}
                 </span>
              </div>
              <div className={`col-span-1 text-right text-sm font-black ${c.balanceUSD < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                 {c.balanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className={`col-span-2 text-right text-sm font-black ${c.balanceUZS < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                 {c.balanceUZS.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center px-6 py-5 border-t border-slate-100 dark:border-slate-700">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('common', 'total')}: {stats.totalCustomers} ta {t('customers', 'title').toLowerCase()} {t('common', 'description')}</div>
          <div className="flex items-center space-x-1 font-black">
             <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><ChevronLeft size={16} /></button>
             <button className="w-8 h-8 flex justify-center items-center bg-[#0f172a] dark:bg-slate-600 text-white rounded">1</button>
             <button className="flex justify-center items-center px-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm">2</button>
             <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6 pb-8">
        <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col justify-between">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">{t('common', 'description')} {t('common', 'description')}</h3>
             <Map size={18} className="text-slate-400 dark:text-slate-500" />
           </div>
           <div className="grid grid-cols-4 gap-4">
             {getRegionCounts().slice(0,4).map(([region, count], i) => (
             <div key={region} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl relative overflow-hidden">
                <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{region}</div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{count}</div>
                <div className={`absolute bottom-0 left-0 h-1 bg-[#006A60] dark:bg-teal-700`} style={{ width: count > 0 ? `${Math.min(100, (count / customers.length) * 100)}%` : '0%' }}></div>
             </div>
             ))}
           </div>
        </div>

        <div className="col-span-1 bg-[#0c1421] dark:bg-slate-800 rounded-xl shadow-lg border border-slate-800 dark:border-slate-700 p-6 flex flex-col justify-between relative overflow-hidden text-white">
           <TrendingUp size={16} className="text-teal-500 mb-4" />
           <div>
             <h3 className="text-xl font-bold mb-1">{t('common', 'total')} {t('customers', 'debtors')}</h3>
             <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-6">{t('customers', 'title')}larning {t('common', 'total')} {t('customers', 'balance')}</p>
           </div>
           <div>
             <div className="text-3xl font-black text-[#0d9488] dark:text-teal-400 mb-1 tracking-tight">$ {stats.totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
             <div className="text-sm font-bold text-slate-500 dark:text-slate-400">{stats.totalBalanceUZS.toLocaleString()} UZS</div>
           </div>
        </div>
      </div>
    </div>
  );
}
