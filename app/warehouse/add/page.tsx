'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { History, FileText, ArrowRight, PlusCircle, Search, Calendar, ClipboardList, HelpCircle, Trash2, ChevronLeft } from 'lucide-react';

export default function AddTransferPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    docNumber: `TR-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    responsiblePerson: 'Alisher Karimov',
    fromWarehouseId: '',
    toWarehouseId: '',
    items: [] as any[]
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/warehouses').then(r => r.json()),
      fetch('/api/products?limit=1000').then(r => r.json())
    ]).then(([whsData, prdData]) => {
      setWarehouses(Array.isArray(whsData) ? whsData : whsData.data || []);
      setProducts(Array.isArray(prdData) ? prdData : prdData.data || []);
    }).catch(console.error);
  }, []);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, currentStock: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      const stock = product?.stockEntries?.find((s: any) => s.warehouseId === formData.fromWarehouseId)?.quantity || 0;
      newItems[index] = { ...newItems[index], [field]: value, currentStock: stock };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSave = async () => {
    if (!formData.fromWarehouseId || !formData.toWarehouseId || formData.items.length === 0) {
      return alert('Barcha maydonlarni to\'ldiring!');
    }
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      return alert('Jo\'natuvchi va qabul qiluvchi ombor bir xil bo\'lishi mumkin emas!');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docNumber: formData.docNumber,
          date: formData.date,
          fromWarehouseId: formData.fromWarehouseId,
          toWarehouseId: formData.toWarehouseId,
          responsiblePerson: formData.responsiblePerson,
          items: formData.items.map(i => ({ productId: i.productId, quantity: Number(i.quantity) }))
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Xatolik yuz berdi');
      }

      router.push('/warehouse');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans w-full min-h-screen flex flex-col bg-[#fdfdfd] relative pb-24 text-slate-800">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="text-[10px] font-bold text-slate-500 tracking-wide mb-2 uppercase">OMBOR / <span className="text-teal-600">KO&apos;CHIRISH YARATISH</span></div>
          <h1 className="text-[32px] font-black tracking-tight mb-2">
            <span className="text-[#0f172a]">Ombordan omborga ko&apos;chirish</span> <span className="text-slate-400 font-medium">(Yaratish)</span>
          </h1>
        </div>
        <Link href="/warehouse" className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition shadow-sm">
          <ChevronLeft size={16} className="mr-2" /> Orqaga
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-6 mb-6">
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700 mr-3">
              <FileText size={16} />
            </div>
            <h3 className="font-bold text-slate-800">Asosiy ma&apos;lumotlar</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-2">SANA</label>
              <input type="date" value={formData.date} onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} className="w-full bg-[#f8fafc] border border-transparent outline-none rounded-lg p-3 text-sm font-bold text-slate-800 transition focus:border-slate-300 focus:bg-white" />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-2">HUJJAT RAQAMI</label>
              <input type="text" value={formData.docNumber} readOnly className="w-full bg-[#f8fafc] border border-transparent outline-none rounded-lg p-3 text-sm font-bold text-slate-400 cursor-not-allowed" />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-2">MAS&apos;UL SHAXS</label>
            <input type="text" value={formData.responsiblePerson} onChange={e => setFormData(prev => ({ ...prev, responsiblePerson: e.target.value }))} className="w-full bg-[#f8fafc] border border-transparent outline-none rounded-lg p-3 text-sm font-bold text-slate-800 focus:border-slate-300 focus:bg-white" />
          </div>
        </div>

        <div className="col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded bg-teal-50 flex items-center justify-center text-teal-600 mr-3">
              <ArrowRight size={16} />
            </div>
            <h3 className="font-bold text-slate-800">Yo&apos;nalishni tanlash</h3>
          </div>
          
          <div className="flex-1 flex items-center justify-between pb-6 gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-2">JO&apos;NATUVCHI OMBOR</label>
              <select value={formData.fromWarehouseId} onChange={e => setFormData(prev => ({ ...prev, fromWarehouseId: e.target.value, items: [] }))} className="w-full bg-[#f8fafc] border border-transparent outline-none rounded-lg p-3 text-sm font-bold text-slate-800 appearance-none transition focus:border-slate-300 focus:bg-white cursor-pointer">
                <option value="">Tanlang...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            
            <div className="px-2 flex items-end justify-center mb-1">
              <div className="w-10 h-10 bg-teal-600 text-white rounded-xl shadow-md flex items-center justify-center">
                <ArrowRight size={18} strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-2">QABUL QILUVCHI OMBOR</label>
              <select value={formData.toWarehouseId} onChange={e => setFormData(prev => ({ ...prev, toWarehouseId: e.target.value }))} className="w-full bg-[#f8fafc] border border-transparent outline-none rounded-lg p-3 text-sm font-bold text-slate-800 appearance-none transition focus:border-slate-300 focus:bg-white cursor-pointer">
                <option value="">Tanlang...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col min-h-[400px]">
         <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <button onClick={addItem} disabled={!formData.fromWarehouseId} className="flex items-center px-4 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-lg shadow-md transition text-sm disabled:opacity-50">
              <PlusCircle size={16} className="mr-2" /> Mahsulot qo&apos;shish
            </button>
            <div className="text-xs text-slate-400 font-medium">Bitta hujjatda bir nechta mahsulot bo&apos;lishi mumkin</div>
         </div>
         
         <div className="grid grid-cols-12 px-6 py-4 border-b border-slate-50 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            <div className="col-span-1">#</div>
            <div className="col-span-6">MAHSULOT</div>
            <div className="col-span-2 text-center">OMBORDA</div>
            <div className="col-span-2 text-center">MIQDOR</div>
            <div className="col-span-1 text-right"></div>
         </div>

         <div className="flex-1">
            {formData.items.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                  <ClipboardList size={48} className="mb-4" />
                  <p className="font-bold text-sm text-slate-600 uppercase tracking-widest">Ro&apos;yxat bo&apos;sh</p>
               </div>
            ) : (
               <div className="divide-y divide-slate-50">
                  {formData.items.map((item, index) => (
                     <div key={index} className="grid grid-cols-12 px-6 py-4 items-center">
                        <div className="col-span-1 font-bold text-slate-400">{index + 1}</div>
                        <div className="col-span-6 pr-4">
                           <select value={item.productId} onChange={e => updateItem(index, 'productId', e.target.value)} className="w-full bg-slate-50 border-none rounded-lg p-2 text-sm font-bold">
                              <option value="">-- Mahsulotni tanlang --</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                           </select>
                        </div>
                        <div className="col-span-2 text-center font-bold text-slate-600">{item.currentStock}</div>
                        <div className="col-span-2 px-4">
                           <input type="number" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} className="w-full bg-slate-50 border-none rounded-lg p-2 text-sm font-bold text-center" />
                        </div>
                        <div className="col-span-1 text-right">
                           <button onClick={() => removeItem(index)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition">
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 p-4 px-8 flex justify-end items-center z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] gap-6">
         <div className="flex space-x-8 mr-auto">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">JAMI TURLAR</span>
               <span className="text-xl font-black text-slate-900 leading-none">{formData.items.length}</span>
            </div>
         </div>
         <Link href="/warehouse" className="px-8 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition">
           Bekor qilish
         </Link>
         <button onClick={handleSave} disabled={loading} className="px-8 py-3 bg-[#009e86] hover:bg-[#008975] text-white text-sm font-bold rounded-lg shadow-md transition disabled:opacity-50">
           {loading ? 'Saqlanmoqda...' : 'Ko\'chirishni saqlash'}
         </button>
      </div>
    </div>
  );
}
