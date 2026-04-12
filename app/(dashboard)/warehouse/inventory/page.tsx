'use client';
import { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertTriangle, ScanLine, Printer } from 'lucide-react';

export default function InventoryCheckPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inventory-audit')
      .then(res => res.json())
      .then(data => {
        setAudits(Array.isArray(data) ? data : data.data || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-8 font-sans w-full h-full flex flex-col bg-[#fdfdfd] relative">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="text-[10px] font-bold text-slate-500 tracking-wide mb-2 uppercase">Bosh panel &gt; Ombor &gt; <span className="text-slate-800">Invertarizatsiya</span></div>
          <h1 className="text-[32px] font-black text-[#0f172a] tracking-tight">Invertarizatsiya</h1>
          <p className="text-slate-500 font-medium text-sm mt-2">Ombordagi haqiqiy qoldiqni dastur qoldig'i bilan solishtirish</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition">
            <Printer size={16} className="mr-2" /> Chop etish
          </button>
          <button className="flex items-center px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-teal-600/20 transition cursor-pointer">
            <ScanLine size={16} className="mr-2" /> Yangi invertarizatsiya
          </button>
        </div>
      </div>

      <div className="bg-white flex-1 overflow-hidden flex flex-col rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-20 text-slate-400 font-bold">Yuklanmoqda...</div>
        ) : audits.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                <ScanLine size={32} />
             </div>
             <p className="text-slate-400 font-bold">Hech qanday invertarizatsiya hujjati topilmadi</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8fafc] border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider">Hujjat Raqami</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider">Sana</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider">Ombor</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider text-center">Natija</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider">Holati</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-wider">Javobgar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audits.map((item, i) => {
                const diffItems = item.items?.filter((it: any) => it.difference !== 0).length || 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900 border-b border-transparent cursor-pointer hover:border-slate-800 inline-block">{item.docNumber}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-bold">{item.warehouse?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {diffItems > 0 ? (
                        <span className="text-rose-500 font-black px-2 py-1 bg-rose-50 rounded text-[10px] uppercase tracking-wider">{diffItems} ta farq bor</span>
                      ) : (
                        <span className="text-teal-500 font-bold px-2 py-1 bg-teal-50 rounded text-[10px] uppercase tracking-wider">Hamma mahsulot joyida</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {item.status === 'COMPLETED' ? (
                        <span className="flex items-center text-teal-600 text-[10px] font-black uppercase tracking-wider">
                          <CheckCircle size={14} className="mr-1" /> Bajarildi
                        </span>
                      ) : (
                        <span className="flex items-center text-orange-500 text-[10px] font-black uppercase tracking-wider">
                          <AlertTriangle size={14} className="mr-1" /> Jarayonda
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-600">
                      {item.responsiblePerson || '-'}
                    </td>
                  </tr>
                )})}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
