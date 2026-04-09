'use client';
import Link from 'next/link';
import { Plus, Search, Calendar, ChevronDown, PackageOpen, Check, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WarehousePage() {
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
    <div className="p-8 font-sans w-full h-full flex flex-col bg-[#fdfdfd] relative">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="text-[10px] font-bold text-slate-500 tracking-wide mb-2 uppercase">Bosh panel &gt; Ombor &gt; <span className="text-slate-800">Omborga ko&apos;chirish</span></div>
        <div className="flex justify-between items-center">
          <h1 className="text-[32px] font-black text-[#0f172a] tracking-tight">Omborga ko&apos;chirish</h1>
          <Link href="/warehouse/add" className="flex items-center px-5 py-3 bg-[#111827] hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition">
            <Plus size={18} className="mr-2" /> Yangi ko&apos;chirish
          </Link>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative">
           <label className="text-[9px] font-black tracking-widest text-[#64748b] uppercase block mb-3">Qidirish</label>
           <div className="relative flex items-center">
             <Search size={16} className="absolute left-0 text-slate-400" />
             <input 
               type="text" 
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Hujjat raqami..." 
               className="w-full pl-6 border-none outline-none text-sm font-medium placeholder:font-normal placeholder:text-slate-400 text-slate-700 bg-transparent" 
             />
           </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
           <label className="text-[9px] font-black tracking-widest text-[#64748b] uppercase block mb-3">Ko'chirish Sanasi</label>
           <div className="relative flex items-center justify-between">
             <div className="flex items-center">
               <Calendar size={16} className="text-slate-400 mr-2" />
               <input type="text" placeholder="Barcha vaqt" disabled className="w-full border-none outline-none text-sm font-medium placeholder:font-normal placeholder:text-slate-400 text-slate-700 bg-transparent opacity-50" />
             </div>
           </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
           <label className="text-[9px] font-black tracking-widest text-[#64748b] uppercase block mb-3">Jo'natuvchi Ombor</label>
           <div className="relative flex items-center">
             <select 
               value={fromWarehouseId}
               onChange={e => setFromWarehouseId(e.target.value)}
               className="w-full text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer appearance-none"
             >
               <option value="">Barcha omborlar</option>
               {warehouses.map(w => (
                 <option key={w.id} value={w.id}>{w.name}</option>
               ))}
             </select>
             <ChevronDown size={14} className="text-slate-400 absolute right-0 pointer-events-none" />
           </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
           <label className="text-[9px] font-black tracking-widest text-[#64748b] uppercase block mb-3">Qabul Qiluvchi Ombor</label>
           <div className="relative flex items-center">
             <select 
               value={toWarehouseId}
               onChange={e => setToWarehouseId(e.target.value)}
               className="w-full text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer appearance-none"
             >
               <option value="">Barcha omborlar</option>
               {warehouses.map(w => (
                 <option key={w.id} value={w.id}>{w.name}</option>
               ))}
             </select>
             <ChevronDown size={14} className="text-slate-400 absolute right-0 pointer-events-none" />
           </div>
         </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white flex-1 overflow-auto flex flex-col rounded-t-xl mb-4 shadow-sm border border-slate-100 min-h-[300px]">
        {loading ? (
           <div className="flex-1 flex items-center justify-center">
              <span className="text-slate-400 font-bold">Yuklanmoqda...</span>
           </div>
        ) : transfers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
             <div className="w-24 h-24 bg-slate-100 rounded-3xl flex justify-center items-center text-slate-300 mb-6">
               <PackageOpen size={48} strokeWidth={1.5} />
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-3">Hech narsa topilmadi</h2>
             <p className="text-slate-500 font-medium text-sm text-center max-w-sm leading-relaxed mb-8">
               Qidiruv natijasida yoki tanlangan filtrlar bo'yicha hech qanday ko'chirish hujjati mavjud emas.
             </p>
             <div className="flex space-x-3">
               <button onClick={() => {setSearch(''); setFromWarehouseId(''); setToWarehouseId('');}} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition">
                 Filtrni tozalash
               </button>
               <Link href="/warehouse/add" className="px-6 py-2.5 bg-[#006A60] text-white text-sm font-bold rounded-lg hover:bg-teal-800 shadow-md shadow-[#006A60]/20 transition">
                 Yangi qo&apos;shish
               </Link>
             </div>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8fafc] border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider">Hujjat Raqami</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider">Sanasi</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider">Jo'natuvchi Ombor</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider">Qabul Qiluvchi Ombor</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider">Holati</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.map(tr => (
                 <tr key={tr.id} className="hover:bg-slate-50/50 transition-colors">
                   <td className="px-6 py-4 font-bold text-slate-800">{tr.docNumber}</td>
                   <td className="px-6 py-4 text-slate-600 font-medium">{new Date(tr.date).toLocaleDateString()}</td>
                   <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-bold">{tr.fromWarehouse?.name || '-'}</span></td>
                   <td className="px-6 py-4"><span className="bg-slate-100 text-emerald-600 px-3 py-1 rounded-md text-xs font-bold">{tr.toWarehouse?.name || '-'}</span></td>
                   <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${tr.status === 'COMPLETED' ? 'bg-teal-50 text-teal-600' : 'bg-orange-50 text-orange-600'}`}>
                       {tr.status}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-right">
                     <button className="text-slate-400 hover:text-slate-800 transition"><Eye size={18} /></button>
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
            <div className="text-[8px] font-black text-slate-400 tracking-widest uppercase">System Status</div>
            <div className="text-[10px] text-teal-400 font-bold">Operational</div>
         </div>
         <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
           <Check size={14} />
         </div>
      </div>

      {/* 3 Bottom Cards */}
      <div className="grid grid-cols-3 gap-6 mt-auto">
         <div className="bg-[#f8fafc] p-6 rounded-xl border border-slate-200 border-l-[4px] border-l-[#0f1522]">
           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">JAMI KO'CHIRISHLAR</div>
           <div className="text-2xl font-black text-slate-900 flex justify-between items-baseline">
             {transfers.length} <span className="text-xs font-bold text-slate-500 lowercase tracking-normal">ta hujjat</span>
           </div>
         </div>
         <div className="bg-[#f8fafc] p-6 rounded-xl border border-slate-200 border-l-[4px] border-l-[#14b8a6]">
           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">BARCHA OMBORLAR</div>
           <div className="text-2xl font-black text-slate-900 flex justify-between items-baseline">
             {warehouses.length} <span className="text-xs font-bold text-slate-500 lowercase tracking-normal">ta ombor</span>
           </div>
         </div>
         <div className="bg-[#f8fafc] p-6 rounded-xl border border-slate-200 border-l-[4px] border-l-[#d97706]">
           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">KUTILAYOTGAN QABULLAR</div>
           <div className="text-2xl font-black text-slate-900 flex justify-between items-baseline">
             {transfers.filter(t => t.status === 'PENDING').length} <span className="text-xs font-bold text-slate-500 lowercase tracking-normal">so'rovlar</span>
           </div>
         </div>
      </div>
    </div>
  );
}
