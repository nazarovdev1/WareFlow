'use client';
import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Filter, RotateCcw, History, CreditCard, FileText, Wallet, Users, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DebtorsPage() {
  const router = useRouter();
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
      console.error('Failed to fetch debtors', error);
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
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fdfdfd] relative">
      <div className="mb-8">
        <div className="text-[12px] font-bold text-slate-500 tracking-wide mb-6">Mijozlar &gt; <span className="text-teal-600">Qarzdorlar</span></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center mb-4">
               <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center mr-3"><Wallet size={20} /></div>
               <div className="text-[10px] font-black tracking-widest text-red-500 uppercase">JAMI QARZ (USD)</div>
            </div>
            <div>
               <div className="text-2xl font-black text-slate-900 tracking-tight">
                 {stats.totalBalanceUSD < 0 ? stats.totalBalanceUSD.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
               </div>
               <div className="text-[11px] font-medium text-slate-400 mt-1 hover:text-slate-600">Bugungi holatga</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center mb-4">
               <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center mr-3"><BanknoteIcon /></div>
               <div className="text-[10px] font-black tracking-widest text-orange-500 uppercase">JAMI QARZ (UZS)</div>
            </div>
            <div>
               <div className="text-2xl font-black text-slate-900 tracking-tight">
                 {stats.totalBalanceUZS < 0 ? stats.totalBalanceUZS.toLocaleString('ru-RU') : '0'}
               </div>
               <div className="text-[11px] font-medium text-slate-400 mt-1 hover:text-slate-600">Bugungi holatga</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center mb-4">
               <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mr-3"><Users size={20} /></div>
               <div className="text-[10px] font-black tracking-widest text-teal-600 uppercase">MIJOZLAR SONI</div>
            </div>
            <div>
               <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalCustomers}</div>
               <div className="text-[11px] font-medium text-slate-400 mt-1 hover:text-slate-600">Faol qarzdorlar</div>
            </div>
          </div>

          <div className="bg-[#0b1625] p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center mb-4 relative z-10">
               <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mr-3"><LayoutDashboard size={20} /></div>
               <div className="text-[10px] font-black tracking-widest text-teal-400 uppercase">TEZKOR AMALLAR</div>
            </div>
            <button className="w-full bg-white hover:bg-slate-100 text-[#0b1625] text-sm font-black py-3 rounded-lg transition relative z-10 uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0">
               To'lov qabul qilish
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-end gap-4 mb-6">
         <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-sm">
           <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-3">QIDIRUV</label>
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Mijoz nomi yoki tel..." 
               className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20" 
             />
           </div>
         </form>
         <div className="w-full md:max-w-[240px]">
           <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-3">HUDUD</label>
           <div className="relative">
             <select 
               className="w-full appearance-none bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg text-sm text-slate-700 font-medium cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20"
               value={region}
               onChange={(e) => setRegion(e.target.value)}
             >
               <option value="">Barcha hududlar</option>
               <option value="Toshkent">Toshkent</option>
               <option value="Samarqand">Samarqand</option>
               <option value="Andijon">Andijon</option>
               <option value="Xorazm">Xorazm</option>
             </select>
             <ChevronDown size={14} className="text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
           </div>
         </div>
         <div className="flex space-x-2 pb-0 mt-4 md:mt-0 w-full md:w-auto">
           <button 
             onClick={handleSearch}
             className="flex-1 md:flex-none flex items-center justify-center px-6 py-2 bg-[#00927c] hover:bg-teal-700 text-white text-sm font-bold rounded-lg shadow-md transition"
           >
             <Filter size={16} className="mr-2" /> Filterlash
           </button>
           <button 
             onClick={() => { setSearchQuery(''); setRegion(''); setPage(1); }}
             className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition shrink-0"
           >
             <RotateCcw size={18} />
           </button>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : debtors.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">Qarzdorlar topilmadi</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fcf8f6] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-slate-300 w-4 h-4 text-teal-600 focus:ring-teal-500" /></th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">MIJOZ</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">BALANS (USD / UZS)</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">ASOSIY TELEFON RAQAMI</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">STATUS</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">AMALLAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {debtors.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-slate-300 w-4 h-4 text-teal-600 focus:ring-teal-500" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex justify-center items-center font-bold text-sm mr-3 ${i % 2 === 0 ? 'bg-slate-100 text-slate-500' : 'bg-teal-50 text-teal-600'}`}>
                          {getInitials(item.fullName)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.fullName}</div>
                          <div className="text-[10px] font-black text-slate-400 mt-0.5 tracking-wider uppercase">ID: {item.id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-red-500 text-[13px]">{item.balanceUSD < 0 ? `${item.balanceUSD.toLocaleString('ru-RU')} USD` : '--'}</div>
                      <div className="font-black text-orange-500 text-[11px] mt-0.5">{item.balanceUZS < 0 ? `${item.balanceUZS.toLocaleString('ru-RU')} UZS` : '--'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 text-sm whitespace-nowrap">
                      {item.phone || '--'}
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'ACTIVE' ? (
                        <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-md">Faol</span>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold px-3 py-1">Nofaol</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end space-x-2">
                        <button className="p-1.5 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-md transition" title="To'lovlar tarixi"><History size={16} /></button>
                        <button className="p-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-md transition" title="To'lov qabul qilish"><CreditCard size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination mock or actual controls */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100">
           <div className="flex items-center space-x-6 text-xs font-bold text-slate-500">
             <span>Jami - <span className="text-slate-900">{stats.totalCustomers}</span> ta yozuv</span>
           </div>
           
           <div className="flex items-center space-x-1 font-black">
             <button 
               onClick={() => setPage(Math.max(1, page - 1))}
               disabled={page === 1}
               className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-30"
             ><ChevronLeft size={16} /></button>
             <button className="w-8 h-8 flex justify-center items-center bg-[#00927c] text-white rounded">{page}</button>
             <button 
               onClick={() => setPage(page + 1)}
               disabled={debtors.length < limit}
               className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-30"
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
