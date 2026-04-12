'use client';
import { ChevronDown, Filter, ChevronRight, ChevronLeft, Map, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CustomersPage() {
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
    const counts: Record<string, number> = { 'TOSHKENT': 0, 'SAMARQAND': 0, 'FARG\'ONA': 0, 'BOSHQA': 0 };
    customers.forEach(c => {
      const r = (c.region || '').toUpperCase();
      if (counts[r] !== undefined) counts[r]++;
      else counts['BOSHQA']++;
    });
    return Object.entries(counts).sort((a,b) => b[1]-a[1]);
  };

  return (
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fcfcfd]">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight mb-2">Mijozlar</h1>
          <p className="text-slate-500 font-medium text-sm">Barcha kontragentlar va ularning hisob-kitoblari</p>
        </div>
        <Link href="/customers/add" className="flex items-center px-4 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition">
          + Yangi mijoz
        </Link>
      </div>

      <div className="flex space-x-6 mb-8 mt-2">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex-1 max-w-[280px]">
           <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-3">VILOYAT BO'YICHA</label>
           <div className="flex justify-between items-center bg-slate-50 px-3 py-2.5 rounded-lg text-sm text-slate-600 font-medium cursor-pointer">
             <span>Barcha viloyatlar</span>
             <ChevronDown size={14} className="text-slate-400" />
           </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex-1 max-w-[280px]">
           <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-3">TOIFA</label>
           <div className="flex justify-between items-center bg-slate-50 px-3 py-2.5 rounded-lg text-sm text-slate-600 font-medium cursor-pointer">
             <span>Barcha toifalar</span>
             <ChevronDown size={14} className="text-slate-400" />
           </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex-1 max-w-[280px]">
           <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-3">HOLATI</label>
           <div className="flex bg-slate-50 p-1 rounded-lg">
             <button className="flex-1 bg-white shadow-sm text-teal-600 font-bold text-xs py-1.5 rounded-md">Aktiv</button>
             <button className="flex-1 text-slate-500 font-bold text-xs py-1.5 rounded-md">Noaktiv</button>
           </div>
         </div>
         <div className="flex items-end pb-4">
           <button className="flex items-center px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black tracking-wide rounded-lg transition border border-slate-200">
             <Filter size={14} className="mr-2" /> Tozalash
           </button>
         </div>
      </div>

      <div className="bg-white rounded-t-xl border border-b-0 border-slate-100 shadow-sm overflow-hidden text-sm mb-0">
        <div className="grid grid-cols-12 px-6 py-5 bg-[#f8fafc] border-b border-slate-100 text-[10px] font-black tracking-widest text-[#64748b] uppercase">
          <div className="col-span-3">NOMI</div>
          <div className="col-span-3">KONTRAGENT TO'LIQ NOMI</div>
          <div className="col-span-2">TELEFON</div>
          <div className="col-span-1">HOLAT</div>
          <div className="col-span-1 text-right">BALANS (USD)</div>
          <div className="col-span-2 text-right">BALANS (UZS)</div>
        </div>
        
        <div className="divide-y divide-slate-50 min-h-[200px]">
          {loading ? (
             <div className="p-8 text-center text-slate-400 font-bold">Yuklanmoqda...</div>
          ) : customers.length === 0 ? (
             <div className="p-8 text-center text-slate-400 font-bold">Mijozlar topilmadi</div>
          ) : customers.map((c, i) => (
            <div key={c.id} className="grid grid-cols-12 px-6 py-5 hover:bg-slate-50/50 transition-colors items-center">
              <div className="col-span-3 flex items-center pr-4">
                <div className={`w-9 h-9 rounded-full flex justify-center items-center font-bold text-xs mr-3 ${i % 2 === 0 ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {getInitials(c.fullName)}
                </div>
                <div className="font-bold text-slate-900 leading-tight">
                  <span className="block">{c.fullName}</span>
                </div>
              </div>
              <div className="col-span-3 text-sm text-slate-600 font-medium pr-4 leading-snug">
                 {c.companyName || '-'}
              </div>
              <div className="col-span-2 text-[13px] text-slate-600 font-medium">
                 {c.phone ? (
                   <>
                    {c.phone.substring(0,7)}<br/>{c.phone.substring(7)}
                   </>
                 ) : '-'}
              </div>
              <div className="col-span-1">
                 <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest ${c.status === 'ACTIVE' ? 'bg-[#ccfbf1] text-[#0d9488]' : 'bg-slate-100 text-slate-400'}`}>
                   {c.status === 'ACTIVE' ? 'AKTIV' : 'NOAKTIV'}
                 </span>
              </div>
              <div className={`col-span-1 text-right text-sm font-black ${c.balanceUSD < 0 ? 'text-red-500' : 'text-slate-900'}`}>
                 {c.balanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className={`col-span-2 text-right text-sm font-black ${c.balanceUZS < 0 ? 'text-red-500' : 'text-slate-900'}`}>
                 {c.balanceUZS.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center px-6 py-5 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-600">Jami: {stats.totalCustomers} ta mijoz ko'rsatilmoqda</div>
          <div className="flex items-center space-x-1 font-black">
             <button className="p-1.5 text-slate-400 hover:text-slate-800"><ChevronLeft size={16} /></button>
             <button className="w-8 h-8 flex justify-center items-center bg-[#0f172a] text-white rounded">1</button>
             <button className="flex justify-center items-center px-2 text-slate-600 hover:bg-slate-100 rounded text-sm">2</button>
             <button className="p-1.5 text-slate-400 hover:text-slate-800"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6 mt-6 pb-8">
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-sm font-black text-slate-800">Hududlar kesimida</h3>
             <Map size={18} className="text-slate-400" />
           </div>
           <div className="grid grid-cols-4 gap-4">
             {getRegionCounts().slice(0,4).map(([region, count], i) => (
             <div key={region} className="p-4 border border-slate-100 rounded-xl relative overflow-hidden">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{region}</div>
                <div className="text-2xl font-black text-slate-900">{count}</div>
                <div className={`absolute bottom-0 left-0 h-1 bg-[#006A60]`} style={{ width: count > 0 ? `${Math.min(100, (count / customers.length) * 100)}%` : '0%' }}></div>
             </div>
             ))}
           </div>
        </div>
        
        <div className="col-span-1 bg-[#0c1421] rounded-xl shadow-lg border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden text-white">
           <TrendingUp size={16} className="text-teal-500 mb-4" />
           <div>
             <h3 className="text-xl font-bold mb-1">Umumiy Debitorlik</h3>
             <p className="text-[11px] text-slate-400 mb-6">Mijozlarning jami qarzdorligi</p>
           </div>
           <div>
             <div className="text-3xl font-black text-[#0d9488] mb-1 tracking-tight">$ {stats.totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
             <div className="text-sm font-bold text-slate-500">{stats.totalBalanceUZS.toLocaleString()} UZS</div>
           </div>
        </div>
      </div>
    </div>
  );
}
