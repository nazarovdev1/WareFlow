'use client';
import { Search, Calendar, User, Activity, Plus, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CreditorsPage() {
  const [isOverdue, setIsOverdue] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (isOverdue) query.append('overdue', 'true');
        // search filter could be added to API if needed, for now we filter locally or just fetch all
        const res = await fetch(`/api/supplier-transactions?${query.toString()}`);
        const data = await res.json();
        setTransactions(data.data || []);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [isOverdue]);

  const filteredTransactions = transactions.filter(t => 
    t.supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUSD = transactions.reduce((acc, t) => acc + (t.currency === 'USD' ? t.amount : 0), 0);
  const totalUZS = transactions.reduce((acc, t) => acc + (t.currency === 'UZS' ? t.amount : 0), 0);

  return (
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fefefe] relative">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#111827] tracking-tight mb-2">Kreditorlar</h1>
          <p className="text-slate-500 font-medium text-sm">Ta&apos;minotchilar oldidagi barcha qarzdorliklar</p>
        </div>
        <button className="flex items-center px-5 py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition">
          <Plus size={16} className="mr-2" /> Yangi to&apos;lov
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mr-4">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">JAMI QARZDORLIK (USD)</p>
            <h3 className="text-2xl font-black text-slate-900">$ {totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mr-4">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">JAMI QARZDORLIK (UZS)</p>
            <h3 className="text-2xl font-black text-slate-900">{totalUZS.toLocaleString()} UZS</h3>
          </div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 flex items-center text-white">
          <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">MUDDATI O&apos;TGAN</p>
            <h3 className="text-2xl font-black">{transactions.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length} ta</h3>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-3 mb-8">
         <div className="relative flex-1 w-full max-w-sm">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             placeholder="Ta'minotchi yoki tavsif..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-transparent hover:border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none transition-colors" 
           />
         </div>
         
         <div className="flex bg-[#f8fafc] rounded-xl overflow-hidden shadow-sm">
           <button className="flex items-center px-6 py-3 border-r border-[#e2e8f0] text-sm font-medium text-slate-600 hover:bg-slate-100 transition whitespace-nowrap">
             <Calendar size={16} className="mr-2 text-slate-400" /> Sana bo&apos;yicha
           </button>
           <button className="flex items-center px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 transition whitespace-nowrap">
             <User size={16} className="mr-2 text-slate-400" /> Ta&apos;minotchi
           </button>
         </div>

         <div className="flex items-center space-x-4 bg-[#f8fafc] px-6 py-3 rounded-xl">
           <span className="text-[10px] font-black tracking-widest text-[#0f172a] uppercase leading-tight">MUDDATI<br/>O&apos;TGAN</span>
           <button 
             onClick={() => setIsOverdue(!isOverdue)}
             className={`w-10 h-5 rounded-full relative transition-colors ${isOverdue ? 'bg-indigo-600' : 'bg-slate-200'}`}
           >
             <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${isOverdue ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`}></div>
           </button>
         </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 min-h-[400px]">
        {loading ? (
          <div className="flex h-full items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20">
             <h2 className="text-2xl font-black text-[#111827] mb-4 tracking-tight">Ma&apos;lumotlar mavjud emas</h2>
             <p className="text-slate-500 font-medium text-sm text-center max-w-sm leading-relaxed">
               Tanlangan filtrlar bo&apos;yicha hech qanday operatsiya topilmadi.
             </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">SANA / HUJJAT</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">TA&apos;MINOTCHI</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">TAVSIF</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">TURI</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">MUDDAT</th>
                <th className="px-6 py-4 text-right pr-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">SUMMA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-sans text-sm">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{new Date(t.date).toLocaleDateString()}</span>
                      <span className="text-[10px] font-black text-slate-400">#TX-{t.id.substring(0,6).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px] mr-3">
                        {t.supplier?.name.substring(0,2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-700">{t.supplier?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium max-w-[250px] truncate">{t.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${t.type === 'DEBT' ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600'}`}>
                      {t.type === 'DEBT' ? 'QARZ' : 'TO&apos;LOV'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {t.dueDate ? (
                      <span className={`font-bold ${new Date(t.dueDate) < new Date() ? 'text-rose-500' : 'text-slate-600'}`}>
                        {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    ) : '-'}
                  </td>
                  <td className={`px-6 py-4 text-right pr-6 font-black text-base ${t.type === 'DEBT' ? 'text-rose-600' : 'text-teal-600'}`}>
                    {t.currency === 'USD' ? '$ ' : ''}
                    {t.amount.toLocaleString(undefined, { minimumFractionDigits: t.currency === 'USD' ? 2 : 0 })}
                    {t.currency === 'UZS' ? ' UZS' : ''}
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
