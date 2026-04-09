'use client';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Filter, RotateCcw, History, CreditCard, FileText, Wallet, Users, LayoutDashboard } from 'lucide-react';

const mockDebtors = [
  { initials: 'S2', name: 'savdo 2025', id: '#48291', usd: '-101,807.68 USD', uzs: '-7,850,000 UZS', tel: '+998977852707', delay: '12 kun kechikdi', delayType: 'danger', lastDate: '14.05.2024' },
  { initials: 'DO', name: "Do'kon", id: '#48292', usd: '-43,542.7 USD', uzs: '-268,249,400 UZS', tel: '+998901234567', delay: '3 kun qoldi', delayType: 'warning', lastDate: '12.05.2024' },
  { initials: 'S6', name: 'savdo 2026', id: '#48293', usd: '-13,895.5 USD', uzs: '0 UZS', tel: '+998994567890', delay: '45 kun kechikdi', delayType: 'danger', lastDate: '01.05.2024' },
  { initials: 'BR', name: 'braklar 2025-2026', id: '#48294', usd: '-470.0 USD', uzs: '0 UZS', tel: '--', delay: 'Muddatsiz', delayType: 'neutral', lastDate: '--' }
];

export default function DebtorsPage() {
  return (
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fdfdfd] relative">
      <div className="mb-8">
        <div className="text-[12px] font-bold text-slate-500 tracking-wide mb-6">Mijozlar &gt; <span className="text-teal-600">Qarzdorlar</span></div>
        
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center mb-4">
               <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center mr-3"><Wallet size={20} /></div>
               <div className="text-[10px] font-black tracking-widest text-red-500 uppercase">JAMI QARZ (USD)</div>
            </div>
            <div>
               <div className="text-2xl font-black text-slate-900 tracking-tight">-159,715.88</div>
               <div className="text-[11px] font-medium text-slate-400 mt-1 hover:text-slate-600">Bugungi holatga</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center mb-4">
               <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center mr-3"><BanknoteIcon /></div>
               <div className="text-[10px] font-black tracking-widest text-orange-500 uppercase">JAMI QARZ (UZS)</div>
            </div>
            <div>
               <div className="text-2xl font-black text-slate-900 tracking-tight">-276,099,400</div>
               <div className="text-[11px] font-medium text-slate-400 mt-1 hover:text-slate-600">Bugungi holatga</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center mb-4">
               <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mr-3"><Users size={20} /></div>
               <div className="text-[10px] font-black tracking-widest text-teal-600 uppercase">MIJOZLAR SONI</div>
            </div>
            <div>
               <div className="text-2xl font-black text-slate-900 tracking-tight">4</div>
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

      <div className="flex items-end space-x-4 mb-6">
         <div className="flex-1 max-w-sm">
           <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-3">QIDIRUV</label>
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="Mijoz nomi yoki tel..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20" />
           </div>
         </div>
         <div className="flex-1 max-w-[240px]">
           <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-3">HUDUD</label>
           <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-lg text-sm text-slate-700 font-medium cursor-pointer">
             <span>Barcha hududlar</span>
             <ChevronDown size={14} className="text-slate-400" />
           </div>
         </div>
         <div className="flex-1 max-w-[240px]">
           <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-3">TO'LASH MUDDATI</label>
           <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-lg text-sm text-slate-700 font-medium cursor-pointer">
             <span>Barchasi</span>
             <ChevronDown size={14} className="text-slate-400" />
           </div>
         </div>
         <div className="flex space-x-2 pb-0">
           <button className="flex items-center px-6 py-2.5 bg-[#00927c] hover:bg-teal-700 text-white text-sm font-bold rounded-lg shadow-md transition">
             <Filter size={16} className="mr-2" /> Filterlash
           </button>
           <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition">
             <RotateCcw size={18} />
           </button>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#fcf8f6] border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-slate-300 w-4 h-4 text-teal-600 focus:ring-teal-500" /></th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest">MIJOZ</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest">BALANS (USD / UZS)</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest">ASOSIY TELEFON RAQAMI</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest">MUDDATI</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest">OXIRGI TO'LOV</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest text-right">AMALLAR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {mockDebtors.map((item, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <input type="checkbox" className="rounded border-slate-300 w-4 h-4 text-teal-600 focus:ring-teal-500" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex justify-center items-center font-bold text-sm mr-3 ${i % 2 === 0 ? 'bg-slate-100 text-slate-500' : 'bg-teal-50 text-teal-600'}`}>
                      {item.initials}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] font-black text-slate-400 mt-0.5 tracking-wider uppercase">ID: {item.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-black text-red-500 text-[13px]">{item.usd}</div>
                  <div className="font-black text-slate-400 text-[11px] mt-0.5">{item.uzs}</div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-600 text-sm">
                  {item.tel}
                </td>
                <td className="px-6 py-4">
                  {item.delayType === 'danger' && <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-md">{item.delay}</span>}
                  {item.delayType === 'warning' && <span className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-md">{item.delay}</span>}
                  {item.delayType === 'neutral' && <span className="text-slate-400 text-xs font-bold px-3 py-1">{item.delay}</span>}
                </td>
                <td className="px-6 py-4 font-medium text-slate-600 text-sm">
                  {item.lastDate}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end space-x-2">
                    <button className="p-1.5 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-md transition"><History size={16} /></button>
                    <button className="p-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-md transition"><CreditCard size={16} /></button>
                    <button className="p-1.5 bg-orange-50 text-orange-500 hover:bg-orange-100 rounded-md transition"><FileText size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="flex justify-between items-center px-6 py-4 mt-auto border-t border-slate-100">
           <div className="flex items-center space-x-6 text-xs font-bold text-slate-500">
             <span>Jami - <span className="text-slate-900">4</span> ta yozuv</span>
             <div className="flex items-center cursor-pointer">
               Ko'rsatish: <span className="text-slate-900 ml-1">100/sahifa</span> <ChevronDown size={14} className="ml-1" />
             </div>
           </div>
           
           <div className="flex items-center space-x-1 font-black">
             <button className="p-1.5 text-slate-400 hover:text-slate-800"><ChevronLeft size={16} /></button>
             <button className="w-8 h-8 flex justify-center items-center bg-[#00927c] text-white rounded">1</button>
             <button className="p-1.5 text-slate-400 hover:text-slate-800"><ChevronRight size={16} /></button>
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
