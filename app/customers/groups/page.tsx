'use client';
import { Plus, Users, Shield, Tag } from 'lucide-react';

const mockGroups = [
  { id: 1, name: 'VIP Mijozlar', desc: 'Eng ko\'p xarid qiladigan mijozlar', count: 12, discount: '15%' },
  { id: 2, name: 'Ulgurji xaridorlar', desc: 'Katta miqdorda mahsulot oladiganlar', count: 45, discount: '10%' },
  { id: 3, name: 'Oddiy mijozlar', desc: 'Standart xaridorlar', count: 128, discount: '0%' },
  { id: 4, name: 'Qora ro\'yxat', desc: 'Qarzini to\'lamaganlar', count: 4, discount: '0%' }
];

export default function GroupsPage() {
  return (
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fcfcfd]">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="text-[12px] font-bold text-slate-500 tracking-wide mb-2 uppercase">Mijozlar &gt; <span className="text-teal-600">Mijoz guruhlari</span></div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Mijoz guruhlari</h1>
          <p className="text-slate-500 font-medium text-sm mt-2">Mijozlarni toifalarga ajratish va ularga maxsus chegirmalar belgilash</p>
        </div>
        <button className="flex items-center px-4 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition">
          <Plus size={18} className="mr-2" /> Yangi guruh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockGroups.map((g, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group cursor-pointer hover:border-teal-500 hover:shadow-md transition-all">
             <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex justify-center items-center ${i === 0 ? 'bg-orange-50 text-orange-500' : i === 1 ? 'bg-blue-50 text-blue-500' : i === 2 ? 'bg-slate-50 text-slate-500' : 'bg-red-50 text-red-500'}`}>
                   {i === 0 ? <Shield size={24} /> : i === 3 ? <Tag size={24} /> : <Users size={24} />}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900">{g.count}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mijoz</div>
                </div>
             </div>
             <div>
               <h3 className="text-lg font-black text-slate-800 mb-1">{g.name}</h3>
               <p className="text-sm font-medium text-slate-500">{g.desc}</p>
             </div>
             
             <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standart chegirma</span>
               <span className={`text-sm font-black px-2 py-1 rounded-md ${g.discount !== '0%' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                 {g.discount}
               </span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
