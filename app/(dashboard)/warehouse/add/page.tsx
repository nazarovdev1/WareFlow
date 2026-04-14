'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { History, FileText, ArrowRight, PlusCircle, Search, Calendar, ClipboardList, HelpCircle, Trash2, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AddTransferPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
      return alert(t('messages', 'fillRequired'));
    }
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      return alert("Jo'natuvchi va qabul qiluvchi ombor bir xil bo'lishi mumkin emas!");
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
        throw new Error(err.error || t('messages', 'error'));
      }

      router.push('/warehouse');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans w-full min-h-screen flex flex-col bg-[#fdfdfd] dark:bg-slate-900 relative pb-24 text-slate-800 dark:text-slate-200">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wide mb-2 uppercase">{t('warehouse', 'title').toUpperCase()} / <span className="text-teal-600 dark:text-teal-400">{t('warehouse', 'transfers').toUpperCase()} {'YARATISH'}</span></div>
          <h1 className="text-[32px] font-black tracking-tight mb-2">
            <span className="text-[#0f172a] dark:text-slate-100">{t('warehouse', 'title')}dan {t('warehouse', 'title')}ga {"ko'chirish"}</span> <span className="text-slate-400 dark:text-slate-500 font-medium">({'Yaratish'})</span>
          </h1>
        </div>
        <Link href="/warehouse" className="flex items-center px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition shadow-sm">
          <ChevronLeft size={16} className="mr-2" /> {t('common', 'back')}
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-6 mb-6">
        <div className="col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 mr-3">
              <FileText size={16} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">{"Asosiy ma'lumotlar"}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-[10px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-2">{t('common', 'date')}</label>
              <input type="date" value={formData.date} onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-700 border border-transparent dark:border-slate-600 outline-none rounded-lg p-3 text-sm font-bold text-slate-800 dark:text-slate-200 transition focus:border-slate-300 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-600" />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-2">{'HUJJAT RAQAMI'}</label>
              <input type="text" value={formData.docNumber} readOnly className="w-full bg-slate-50 dark:bg-slate-700 border border-transparent dark:border-slate-600 outline-none rounded-lg p-3 text-sm font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-2">{t('warehouse', 'responsiblePerson')}</label>
            <input type="text" value={formData.responsiblePerson} onChange={e => setFormData(prev => ({ ...prev, responsiblePerson: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-700 border border-transparent dark:border-slate-600 outline-none rounded-lg p-3 text-sm font-bold text-slate-800 dark:text-slate-200 focus:border-slate-300 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-600" />
          </div>
        </div>

        <div className="col-span-3 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mr-3">
              <ArrowRight size={16} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">{"Yo'nalishni tanlash"}</h3>
          </div>

          <div className="flex-1 flex items-center justify-between pb-6 gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-2">{t('warehouse', 'fromWarehouse')}</label>
              <select value={formData.fromWarehouseId} onChange={e => setFormData(prev => ({ ...prev, fromWarehouseId: e.target.value, items: [] }))} className="w-full bg-slate-50 dark:bg-slate-700 border border-transparent dark:border-slate-600 outline-none rounded-lg p-3 text-sm font-bold text-slate-800 dark:text-slate-200 appearance-none transition focus:border-slate-300 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-600 cursor-pointer">
                <option value="" className="dark:bg-slate-700">{t('common', 'select')}...</option>
                {warehouses.map(w => <option key={w.id} value={w.id} className="dark:bg-slate-700">{w.name}</option>)}
              </select>
            </div>

            <div className="px-2 flex items-end justify-center mb-1">
              <div className="w-10 h-10 bg-teal-600 text-white rounded-xl shadow-md flex items-center justify-center">
                <ArrowRight size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div className="flex-1">
              <label className="text-[10px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-2">{t('warehouse', 'toWarehouse')}</label>
              <select value={formData.toWarehouseId} onChange={e => setFormData(prev => ({ ...prev, toWarehouseId: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-700 border border-transparent dark:border-slate-600 outline-none rounded-lg p-3 text-sm font-bold text-slate-800 dark:text-slate-200 appearance-none transition focus:border-slate-300 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-600 cursor-pointer">
                <option value="" className="dark:bg-slate-700">{t('common', 'select')}...</option>
                {warehouses.map(w => <option key={w.id} value={w.id} className="dark:bg-slate-700">{w.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 flex flex-col min-h-[400px]">
         <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <button onClick={addItem} disabled={!formData.fromWarehouseId} className="flex items-center px-4 py-2.5 bg-[#0f172a] dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold rounded-lg shadow-md transition text-sm disabled:opacity-50">
              <PlusCircle size={16} className="mr-2" /> {t('products', 'title')} {t('common', 'add')}
            </button>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">{"Bitta hujjatda bir nechta mahsulot bo'lishi mumkin"}</div>
         </div>

         <div className="grid grid-cols-12 px-6 py-4 border-b border-slate-50 dark:border-slate-700 text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            <div className="col-span-1">#</div>
            <div className="col-span-6">{t('products', 'title')}</div>
            <div className="col-span-2 text-center">{t('warehouse', 'title')}DA</div>
            <div className="col-span-2 text-center">{t('common', 'quantity')}</div>
            <div className="col-span-1 text-right"></div>
         </div>

         <div className="flex-1">
            {formData.items.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                  <ClipboardList size={48} className="mb-4" />
                  <p className="font-bold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-widest">{"Ro'yxat bo'sh"}</p>
               </div>
            ) : (
               <div className="divide-y divide-slate-50 dark:divide-slate-700">
                  {formData.items.map((item, index) => (
                     <div key={index} className="grid grid-cols-12 px-6 py-4 items-center">
                        <div className="col-span-1 font-bold text-slate-400 dark:text-slate-500">{index + 1}</div>
                        <div className="col-span-6 pr-4">
                           <select value={item.productId} onChange={e => updateItem(index, 'productId', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-lg p-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                              <option value="" className="dark:bg-slate-700">-- {t('products', 'title')}ni tanlang --</option>
                              {products.map(p => <option key={p.id} value={p.id} className="dark:bg-slate-700">{p.name}</option>)}
                           </select>
                        </div>
                        <div className="col-span-2 text-center font-bold text-slate-600 dark:text-slate-300">{item.currentStock}</div>
                        <div className="col-span-2 px-4">
                           <input type="number" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-lg p-2 text-sm font-bold text-center text-slate-800 dark:text-slate-200" />
                        </div>
                        <div className="col-span-1 text-right">
                           <button onClick={() => removeItem(index)} className="p-2 text-rose-400 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition">
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 px-8 flex justify-end items-center z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] gap-6">
         <div className="flex space-x-8 mr-auto">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('common', 'total')} {'TURLAR'}</span>
               <span className="text-xl font-black text-slate-900 dark:text-slate-100 leading-none">{formData.items.length}</span>
            </div>
         </div>
         <Link href="/warehouse" className="px-8 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition">
           {t('common', 'cancel')}
         </Link>
         <button onClick={handleSave} disabled={loading} className="px-8 py-3 bg-[#009e86] dark:bg-teal-700 hover:bg-[#008975] dark:hover:bg-teal-600 text-white text-sm font-bold rounded-lg shadow-md transition disabled:opacity-50">
           {loading ? "Saqlanmoqda..." : "Ko'chirishni saqlash"}
         </button>
      </div>
    </div>
  );
}
