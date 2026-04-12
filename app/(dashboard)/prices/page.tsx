'use client';
import { Plus, FileText, Edit2, Trash2, ChevronLeft, ChevronRight, Clock, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PricesPage() {
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
    <div className="p-8 font-sans w-full h-full flex flex-col bg-white">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="text-xs font-bold text-slate-500 mb-2">Mahsulotlar / <span className="text-slate-800">Prays listlar</span></div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Barcha prays listlar</h1>
          <Link href="/prices/add" className="flex items-center px-6 py-3 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-lg shadow-xl shadow-slate-900/10 transition">
            <Plus size={18} className="mr-2" /> Yangi prays list
          </Link>
        </div>
      </div>

      {/* 4 Top Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 pb-8 rounded-xl shadow-sm border border-slate-100 border-l-[6px] border-l-[#0f172a]">
           <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">JAMI LISTLAR</div>
           <div className="text-3xl font-black text-slate-900">{lists.length} ta</div>
         </div>
         <div className="bg-white p-6 pb-8 rounded-xl shadow-sm border border-slate-100 border-l-[6px] border-l-[#3bf6d7]">
           <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">FAOL LISTLAR</div>
           <div className="text-3xl font-black text-slate-900">{lists.filter(l => l.isActive).length} ta</div>
         </div>
         <div className="bg-white p-6 pb-8 rounded-xl shadow-sm border border-slate-100 border-l-[6px] border-l-yellow-600">
           <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">SOTUV LISTLARI</div>
           <div className="text-3xl font-black text-slate-900">{lists.filter(l => l.type === 'SALE').length} ta</div>
         </div>
         <div className="bg-white p-6 pb-8 rounded-xl shadow-sm border border-slate-100 border-l-[6px] border-l-slate-300">
           <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">XARID LISTLARI</div>
           <div className="text-3xl font-black text-slate-900">{lists.filter(l => l.type === 'PURCHASE').length} ta</div>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white flex-1 overflow-hidden flex flex-col">
        <table className="w-full text-left text-sm border-t border-slate-100">
          <thead>
            <tr>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 uppercase tracking-wider">PRAYS LIST NOMI</th>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 uppercase tracking-wider">TURI</th>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 uppercase tracking-wider">MAHSULOTLAR SONI</th>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 uppercase tracking-wider">YARATILGAN SANA</th>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 uppercase tracking-wider">HOLATI</th>
              <th className="px-6 py-6 font-black text-[10px] text-slate-500 uppercase tracking-wider text-right">AMALLAR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 font-bold text-slate-500">Yuklanmoqda...</td></tr>
            ) : lists.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 font-bold text-slate-500">Prays listlar mavjud emas</td></tr>
            ) : lists.map((item: any, i: number) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-6 text-slate-500 font-medium">{i + 1}</td>
                <td className="px-6 py-6 font-bold text-slate-900 flex items-center">
                  <div className="w-8 h-8 rounded bg-blue-50 text-blue-500 flex justify-center items-center mr-3">
                    <FileText size={16} />
                  </div>
                  {item.name}
                </td>
                <td className="px-6 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.type === 'SALE' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                    {item.type === 'SALE' ? 'SOTUV' : 'XARID'}
                  </span>
                </td>
                <td className="px-6 py-6 font-medium text-slate-600">{item._count?.items || 0} dona</td>
                <td className="px-6 py-6 font-medium text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-6">
                  <div className="flex items-center text-xs font-bold text-slate-600 tracking-wider uppercase">
                    <span className={`w-2 h-2 rounded-full mr-2 ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {item.isActive ? 'FAOL' : 'NOACTIVE'}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex justify-end space-x-3 text-slate-400">
                    <button className="hover:text-slate-900 transition"><Edit2 size={18} /></button>
                    <button className="hover:text-red-500 transition"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-6 mt-auto border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
           <div className="flex items-center space-x-4">
             <span>Ko'rsatilmoqda: 1 - 4 dan 24</span>
             <div className="flex items-center space-x-2 border border-slate-200 px-3 py-1.5 rounded-lg bg-white">
               <span>10 ta</span>
               <ChevronDown size={14} className="text-slate-400" />
             </div>
           </div>
           
           <div className="flex items-center space-x-1 font-black">
             <button className="p-1.5 text-slate-400 hover:text-slate-800"><ChevronLeft size={16} /></button>
             <button className="w-8 h-8 flex justify-center items-center bg-[#0f172a] text-white rounded">1</button>
             <button className="w-8 h-8 flex justify-center items-center hover:bg-slate-100 rounded">2</button>
             <button className="w-8 h-8 flex justify-center items-center hover:bg-slate-100 rounded">3</button>
             <span className="px-2 text-slate-400">...</span>
             <button className="w-8 h-8 flex justify-center items-center hover:bg-slate-100 rounded">6</button>
             <button className="p-1.5 text-slate-400 hover:text-slate-800"><ChevronRight size={16} /></button>
           </div>
        </div>

        {/* Footer Info */}
        <div className="px-6 pb-6 pt-2 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          <div className="flex items-center">
            <Clock size={12} className="mr-2" /> Ma'lumotlar oxirgi marta bugun 14:45 da yangilandi
          </div>
          <div>WALLPAPER WM V2.4.0</div>
        </div>
      </div>
    </div>
  );
}
