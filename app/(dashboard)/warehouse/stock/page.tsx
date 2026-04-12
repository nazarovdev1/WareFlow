'use client';
import { Search, Filter, Download, ArrowDownUp, Package, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function StockPage() {
  const [stock, setStock] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalQuantity: 0, totalValue: 0 });
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch warehouses for filter
  useEffect(() => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(data => setWarehouses(Array.isArray(data) ? data : data.data || []))
      .catch(console.error);
  }, []);

  // Fetch stock data
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (selectedWarehouse) query.append('warehouseId', selectedWarehouse);

    fetch(`/api/stock?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setStock(data.data);
          setSummary(data.summary || { totalQuantity: 0, totalValue: 0 });
        } else if (Array.isArray(data)) {
          setStock(data);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [search, selectedWarehouse]);

  return (
    <div className="p-8 font-sans w-full h-full flex flex-col bg-[#fdfdfd] relative">
      <div className="mb-8">
        <div className="text-[10px] font-bold text-slate-500 tracking-wide mb-2 uppercase">Bosh panel &gt; Ombor &gt; <span className="text-slate-800">Ombor qoldiqlari</span></div>
        <div className="flex justify-between items-center">
          <h1 className="text-[32px] font-black text-[#0f172a] tracking-tight">Ombor qoldiqlari</h1>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition">
              <Download size={16} className="mr-2" /> Excel
            </button>
            <button className="flex items-center px-5 py-2.5 bg-[#111827] hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition">
              <ArrowDownUp size={16} className="mr-2" /> Harakatlar tarixi
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center md:col-span-1">
           <Search size={16} className="text-slate-400 mr-2 shrink-0" />
           <input 
             type="text" 
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Mahsulot nomi yoki SKU..." 
             className="w-full border-none outline-none text-sm font-medium placeholder:font-normal placeholder:text-slate-400 text-slate-700 bg-transparent" 
           />
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between md:col-span-1 cursor-pointer">
           <select 
             value={selectedWarehouse}
             onChange={e => setSelectedWarehouse(e.target.value)}
             className="w-full text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer appearance-none"
           >
             <option value="">Omborni tanlang (Barchasi)</option>
             {warehouses.map(w => (
               <option key={w.id} value={w.id}>{w.name}</option>
             ))}
           </select>
           <ChevronDown size={16} className="text-slate-400 pointer-events-none" />
         </div>
      </div>

      <div className="bg-white flex-1 overflow-auto rounded-xl shadow-sm border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f8fafc] border-b border-slate-200 sticky top-0">
            <tr>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider">Mahsulot</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider">Ombor</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider text-right">Jami Miqdor</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider text-right">Band qilingan</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider text-right">Erkin qoldiq</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 font-bold text-slate-500">Yuklanmoqda...</td></tr>
            ) : stock.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 font-bold text-slate-500">Omborda mahsulot qoidalari topilmadi</td></tr>
            ) : stock.map((item, i) => {
              const avail = item.quantity - item.reserved;
              const unit = item.product?.unit?.shortName || 'dona';
              return (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 border-l-4 border-l-transparent hover:border-l-teal-500">
                  <div className="font-bold text-slate-800">{item.product?.name || 'Noma\'lum'}</div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{item.product?.sku || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-bold">{item.warehouse?.name || '-'}</span>
                </td>
                <td className="px-6 py-4 text-right font-black text-slate-800 text-base">
                  {item.quantity.toLocaleString()} <span className="text-xs font-medium text-slate-400">{unit}</span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-orange-500">
                  {item.reserved.toLocaleString()} <span className="text-[10px] font-medium text-slate-400">{unit}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`font-black text-lg ${avail > 0 ? 'text-teal-600' : 'text-red-500'}`}>
                    {avail.toLocaleString()} <span className="text-[10px] font-medium text-slate-400 block -mt-1 leading-none">{unit}</span>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mt-6">
         <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-center items-center text-center shadow-sm">
           <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
             <Package size={24} />
           </div>
           <div className="text-2xl font-black text-slate-900">{summary.totalQuantity.toLocaleString()}</div>
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Jami Miqdor (Barchasi)</div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-center items-center text-center shadow-sm">
           <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-3">
             <span className="font-extrabold text-xl line-through decoration-double">S</span>
           </div>
           <div className="text-3xl font-black text-teal-600">{summary.totalValue.toLocaleString()} UZS</div>
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Ombor umumiy tan narxi (Cost)</div>
         </div>
      </div>
    </div>
  );
}
