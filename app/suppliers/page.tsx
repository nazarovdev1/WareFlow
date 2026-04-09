'use client';
import { Search, ChevronDown, Filter, Plus, UserPlus, Eye, Edit2, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SuppliersPage() {
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
        console.error('Failed to fetch suppliers:', error);
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
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fdfdfd] relative">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Ta&apos;minotchilar</h1>
           <p className="text-slate-500 font-medium text-sm mt-1">Barcha mahsulot yetkazib beruvchilar ro&apos;yxati</p>
        </div>
        <div className="flex space-x-4 items-center">
          <Link href="/suppliers/add" className="flex items-center px-5 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition">
            <Plus size={16} className="mr-2" /> Ta&apos;minotchi qo&apos;shish
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-slate-900">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">JAMI TA'MINOTCHILAR</div>
            <div className="text-2xl font-black text-slate-900">{suppliers.length} ta</div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-teal-500">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FAOL</div>
            <div className="text-2xl font-black text-teal-600">{suppliers.filter(s => s.status === 'ACTIVE').length} ta</div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-indigo-500">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ZAVODLAR</div>
            <div className="text-2xl font-black text-indigo-600">{suppliers.filter(s => s.category === 'MANUFACTURER').length} ta</div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-orange-500">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ULGURJI</div>
            <div className="text-2xl font-black text-orange-600">{suppliers.filter(s => s.category === 'WHOLESALER').length} ta</div>
         </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-6 mb-12 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex-1 w-full relative">
          <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">QIDIRISH</label>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Nomi, kontakt yoki tel..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all font-medium" 
            />
          </div>
        </div>
        <div className="w-full md:w-56">
          <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">STATUS</label>
          <div className="relative">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-sm text-slate-700 font-medium cursor-pointer outline-none appearance-none"
            >
              <option value="">Barchasi</option>
              <option value="ACTIVE">Faol</option>
              <option value="INACTIVE">Noactive</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="w-full md:w-56">
          <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">KATEGORIYA</label>
          <div className="relative">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-sm text-slate-700 font-medium cursor-pointer outline-none appearance-none"
            >
              <option value="">Barchasi</option>
              <option value="MANUFACTURER">Zavod</option>
              <option value="WHOLESALER">Ulgurji savdogar</option>
              <option value="LOCAL">Mahalliy</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="pb-1">
          <button 
            onClick={() => {setSearch(''); setStatus(''); setCategory('');}}
            className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex h-full items-center justify-center p-20">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-bold text-sm">Yuklanmoqda...</p>
            </div>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
               <UserPlus size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Hali ma&apos;lumotlar yo&apos;q</h2>
            <p className="text-slate-500 font-medium text-sm text-center max-w-sm leading-relaxed mb-8">
              Ta&apos;minotchilar bazasi bo&apos;sh. Yangi ta&apos;minotchi qo&apos;shish uchun tepadagi tugmani bosing.
            </p>
            <button className="flex items-center px-6 py-3 bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-xl shadow-slate-900/10 transition">
              + Ta&apos;minotchi qo&apos;shish
            </button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">NOMI</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">KONTAKT SHAXS</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">TELEFON</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">KATEGORIYA</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">STATUS</th>
                <th className="px-6 py-4 text-right pr-10 text-[11px] font-black text-slate-500 uppercase tracking-widest">AMALLAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-sans text-sm">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs mr-4 shrink-0">
                        {s.name.substring(0,2).toUpperCase()}
                      </div>
                      <span className="font-black text-slate-900 text-base">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600">{s.contactPerson || '-'}</td>
                  <td className="px-6 py-4 font-bold text-slate-600">{s.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                      {s.category || 'ASOSIY'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${s.status === 'ACTIVE' ? 'bg-teal-500' : 'bg-slate-300'}`}></div>
                      <span className={`text-[11px] font-black uppercase tracking-wider ${s.status === 'ACTIVE' ? 'text-teal-600' : 'text-slate-400'}`}>
                        {s.status === 'ACTIVE' ? 'FAOL' : 'NOAKTIV'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right pr-6">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm"><Eye size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-lg transition-all shadow-sm"><Edit2 size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm"><Trash2 size={18} /></button>
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
