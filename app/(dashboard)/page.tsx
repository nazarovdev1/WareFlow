'use client';
import { Calendar, TrendingDown, TrendingUp, Building, Filter, ImageIcon, Plus, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-full text-slate-400">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin mb-4"></div>
        <p className="font-bold">Analitika yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans w-full h-full text-slate-800 bg-[#fdfdfd]">
      {/* Top Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Boshqaruv Paneli</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Real vaqtdagi biznes ko&apos;rsatkichlari va tahlillar</p>
        </div>
        <div className="text-right">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Server Vaqti</div>
           <div className="text-sm font-bold text-slate-800">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Top 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Bugun */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-l-[6px] border-l-indigo-600 flex flex-col justify-between h-40 relative group hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
           <div>
             <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Bugungi Harakatlar</div>
             <div className="text-3xl font-black text-slate-900 tracking-tight">{stats?.todayTransfers || 0} ta</div>
           </div>
           <div className="text-xs font-bold text-slate-500 flex items-center">
             <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span> Ko&apos;chirishlar ro&apos;yxatda
           </div>
           <div className="absolute top-6 right-6 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
             <Calendar size={22} />
           </div>
        </div>
        
        {/* Omborlar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-l-[6px] border-l-amber-500 flex flex-col justify-between h-40 relative group hover:shadow-xl hover:shadow-amber-500/5 transition-all">
           <div>
             <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Faol Omborlar</div>
             <div className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalWarehouses || 0} ta</div>
           </div>
           <div className="text-xs font-bold text-slate-500 flex items-center">
             <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span> {stats?.totalStockQuantity?.toLocaleString() || 0} ta mahsulot
           </div>
           <div className="absolute top-6 right-6 w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
             <Building size={22} />
           </div>
        </div>

        {/* Qarzdorlar */}
        <Link href="/customers" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-l-[6px] border-l-rose-500 flex flex-col justify-between h-40 relative group hover:shadow-xl hover:shadow-rose-500/5 transition-all">
           <div>
             <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Mijozlar Qarzi</div>
             <div className="text-2xl font-black text-rose-600 tracking-tight mb-1">$ {stats?.customerDebtUSD?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
             <div className="text-[11px] font-bold text-slate-400">{stats?.customerDebtUZS?.toLocaleString()} UZS</div>
           </div>
           <div className="text-xs font-bold text-slate-500">
             {stats?.totalCustomers || 0} ta mijozdan
           </div>
           <div className="absolute top-6 right-6 w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
             <TrendingDown size={22} />
           </div>
        </Link>

        {/* Kreditorlar */}
        <Link href="/suppliers/creditors" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-l-[6px] border-l-teal-600 flex flex-col justify-between h-40 relative group hover:shadow-xl hover:shadow-teal-500/5 transition-all">
           <div>
             <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Bizning Qarzlar</div>
             <div className="text-2xl font-black text-teal-600 tracking-tight mb-1">$ {stats?.supplierDebtUSD?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
             <div className="text-[11px] font-bold text-slate-400">{stats?.supplierDebtUZS?.toLocaleString()} UZS</div>
           </div>
           <div className="text-xs font-bold text-slate-500">
             {stats?.totalSuppliers || 0} ta ta&apos;minotchiga
           </div>
           <div className="absolute top-6 right-6 w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
             <TrendingUp size={22} />
           </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions & Inventory Stats */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-8">
                 <div>
                   <h2 className="text-xl font-bold text-slate-900">Mahsulotlar Statistikasi</h2>
                   <p className="text-xs text-slate-400 font-medium mt-1">Ombordagi mavjudlik va tanqislik holati</p>
                 </div>
                 <Link href="/inventory" className="text-xs font-black text-indigo-600 hover:text-indigo-800 tracking-widest uppercase">
                    Barchasini ko&apos;rish
                 </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <Package size={20} className="text-slate-400 mb-4" />
                    <div className="text-2xl font-black text-slate-900">{stats?.totalProducts || 0}</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Jami SKUs</div>
                 </div>
                 <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
                    <TrendingDown size={20} className="text-rose-500 mb-4" />
                    <div className="text-2xl font-black text-rose-600">{stats?.outOfStockCount || 0}</div>
                    <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">Tugagan mahsulotlar</div>
                 </div>
                 <div className="p-6 bg-teal-50 rounded-2xl border border-teal-100">
                    <TrendingUp size={20} className="text-teal-500 mb-4" />
                    <div className="text-2xl font-black text-teal-600">{stats?.activePriceLists || 0}</div>
                    <div className="text-[10px] font-black text-teal-500 uppercase tracking-widest mt-1">Faol narxnomalar</div>
                 </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Tezkor Amallar</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/inventory/add" className="flex flex-col items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-slate-600 hover:text-indigo-700">
                       <Plus size={20} className="mb-2" />
                       <span className="text-[11px] font-bold">Mahsulot Qo&apos;shish</span>
                    </Link>
                    <Link href="/warehouse/add" className="flex flex-col items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-slate-600 hover:text-indigo-700">
                       <TrendingUp size={20} className="mb-2" />
                       <span className="text-[11px] font-bold">Ko&apos;chirish Yaratish</span>
                    </Link>
                    <Link href="/prices/add" className="flex flex-col items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-slate-600 hover:text-indigo-700">
                       <Calendar size={20} className="mb-2" />
                       <span className="text-[11px] font-bold">Yangi Prays-list</span>
                    </Link>
                    <Link href="/customers" className="flex flex-col items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-slate-600 hover:text-indigo-700">
                       <Plus size={20} className="mb-2" />
                       <span className="text-[11px] font-bold">Yangi Mijoz</span>
                    </Link>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Kassa & Warehouse */}
        <div className="space-y-8">
          <div className="bg-[#0f172a] rounded-3xl shadow-xl shadow-slate-900/10 p-8 text-white relative overflow-hidden">
             <div className="relative z-10">
               <div className="flex justify-between items-start mb-10">
                 <div>
                   <h2 className="text-xl font-bold">Moliyaviy Holat</h2>
                   <p className="text-xs text-slate-400 font-medium mt-1">Joriy kassa qoldiqlari</p>
                 </div>
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Building size={22} className="text-slate-300" />
                 </div>
               </div>
               
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center">
                     <div className="w-10 h-10 rounded-full bg-teal-500 text-white font-black text-xs flex justify-center items-center mr-4 shadow-lg shadow-teal-500/20">USD</div>
                     <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dollar Hisobi</div>
                        <div className="text-xl font-black">12,450.00 $</div>
                     </div>
                   </div>
                 </div>

                 <div className="flex items-center justify-between">
                   <div className="flex items-center">
                     <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-black text-xs flex justify-center items-center mr-4 shadow-lg shadow-indigo-500/20">UZS</div>
                     <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">So&apos;m Hisobi</div>
                        <div className="text-xl font-black">45,800,000</div>
                     </div>
                   </div>
                 </div>
               </div>

               <button className="w-full mt-10 bg-white hover:bg-slate-100 text-[#0f172a] font-black text-sm py-4 rounded-2xl transition-all shadow-xl">
                 Kassa Hisobotini Yuklash
               </button>
             </div>
             
             {/* Decorative element */}
             <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
             <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mr-4">
                   <TrendingUp size={20} />
                </div>
                <h3 className="font-bold text-slate-900">Tizim Holati</h3>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Baza aloqasi:</span>
                   <span className="text-teal-600 font-bold flex items-center">
                      <span className="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse"></span> OK
                   </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Ma&apos;lumotlar:</span>
                   <span className="text-slate-800 font-bold">100% Real-time</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-50">
                   <span className="text-slate-500 font-medium">Oxirgi sinxronizatsiya:</span>
                   <span className="text-slate-800 font-bold text-xs">{new Date().toLocaleTimeString()}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
