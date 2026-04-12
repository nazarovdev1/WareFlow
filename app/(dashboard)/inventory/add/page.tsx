'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UploadCloud, Image as ImageIcon, Barcode as BarcodeIcon, ChevronDown, Banknote, RefreshCcw, Save, Search, Calendar, ChevronLeft, PackageOpen } from 'lucide-react';

export default function AddProductPage() {
  const router = useRouter();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    unitId: '',
    sellPrice: '',
    wholesalePrice: '',
    minPrice: '',
    barcode: '',
    barcodeType: 'EAN13',
    // initial stock
    warehouseId: '',
    quantity: '',
    costPrice: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json())
    ]).then(([catsData, whsData]) => {
      setCategories(Array.isArray(catsData) ? catsData : catsData.data || []);
      setWarehouses(Array.isArray(whsData) ? whsData : whsData.data || []);
    }).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!formData.name) return alert('Mahsulot nomi kiritilishi shart!');
    
    setLoading(true);
    try {
      const payload: any = {
        name: formData.name,
        sku: formData.sku,
        categoryId: formData.categoryId || null,
        sellPrice: Number(formData.sellPrice) || 0,
        wholesalePrice: Number(formData.wholesalePrice) || 0,
        minPrice: Number(formData.minPrice) || 0,
        barcode: formData.barcode,
        barcodeType: formData.barcodeType,
      };

      if (formData.warehouseId && formData.quantity) {
        payload.initialStock = {
          warehouseId: formData.warehouseId,
          quantity: Number(formData.quantity) || 0,
          costPrice: Number(formData.costPrice) || 0,
        };
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Xatolik yuz berdi');
      }
      
      router.push('/inventory');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans w-full min-h-screen flex flex-col bg-[#fdfdfd] relative pb-24 text-slate-800">
      <div className="mb-8">
        <Link href="/inventory" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition mb-4">
          <ChevronLeft size={16} className="mr-1" /> Orqaga
        </Link>
        <h1 className="text-[32px] font-black text-[#0f172a] tracking-tight mb-2">Mahsulot (Yaratish)</h1>
        <p className="text-slate-500 font-medium text-sm">Yangi mahsulot ma&apos;lumotlarini to&apos;ldiring.</p>
      </div>

      <div className="flex xl:flex-row flex-col gap-6 w-full max-w-6xl">
        <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">MAHSULOT NOMI<span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Masalan: Silk Plaster Premium 01" className="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 outline-none rounded-lg p-3 text-sm font-bold text-slate-800 transition" />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">ARTIKUL (SKU)</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="SP-PREM-01" className="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 outline-none rounded-lg p-3 text-sm font-bold text-slate-800 transition" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">KATEGORIYA</label>
                  <div className="relative">
                    <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 outline-none rounded-lg p-3 text-sm font-bold text-slate-800 appearance-none transition focus:border-slate-400 cursor-pointer">
                      <option value="">-- Tanlang --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-2xl border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-white">
                  <div className="flex items-center">
                    <Banknote size={18} className="text-teal-600 mr-3" />
                    <span className="font-bold text-slate-800">Narxlar</span>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-3 gap-6 bg-white">
                   <div>
                      <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">SOTUV NARXI</label>
                      <div className="relative">
                         <input type="number" name="sellPrice" value={formData.sellPrice} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 outline-none rounded-lg p-3 pr-12 text-sm font-bold text-slate-800 text-right transition" />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">UZS</span>
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">ULGURJI NARX</label>
                      <div className="relative">
                         <input type="number" name="wholesalePrice" value={formData.wholesalePrice} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 outline-none rounded-lg p-3 pr-12 text-sm font-bold text-slate-800 text-right transition" />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">UZS</span>
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">MINIMAL NARX</label>
                      <div className="relative">
                         <input type="number" name="minPrice" value={formData.minPrice} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 outline-none rounded-lg p-3 pr-12 text-sm font-bold text-slate-800 text-right transition" />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">UZS</span>
                      </div>
                   </div>
                </div>
            </div>

            <div className="bg-[#f8fafc] rounded-2xl border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-white">
                  <div className="flex items-center">
                    <PackageOpen size={18} className="text-teal-600 mr-3" />
                    <span className="font-bold text-slate-800">Dastlabki balans (ixtiyoriy)</span>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-3 gap-4 bg-white">
                   <div className="col-span-1">
                      <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">OMBOR</label>
                      <div className="relative">
                        <select name="warehouseId" value={formData.warehouseId} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 outline-none rounded-lg p-3 text-sm font-bold text-slate-800 appearance-none transition focus:border-slate-400 cursor-pointer">
                          <option value="">-- Tanlang --</option>
                          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">MIQDORI</label>
                      <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 outline-none rounded-lg p-3 text-sm font-bold text-slate-800 transition" />
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">TAN NARXI (COST)</label>
                      <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 outline-none rounded-lg p-3 text-sm font-bold text-slate-800 transition" />
                   </div>
                </div>
            </div>
        </div>

        <div className="w-[380px] shrink-0 flex flex-col gap-6">
          <div className="bg-[#f8fafc] p-6 rounded-2xl border border-slate-100">
             <div className="flex items-center mb-6">
                <BarcodeIcon size={18} className="text-teal-600 mr-2" />
                <h3 className="font-bold text-slate-800">Shtrix-kod</h3>
             </div>
             <div className="mb-5">
               <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">SHTRIX-KOD</label>
               <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} placeholder="47800..." className="w-full bg-white border border-slate-200 outline-none rounded-lg p-3 text-sm font-bold text-slate-800 focus:border-slate-400" />
             </div>
             <div className="mb-8">
               <label className="text-[10px] font-black tracking-widest text-[#64748b] uppercase block mb-3">TURI</label>
               <div className="relative">
                  <select name="barcodeType" value={formData.barcodeType} onChange={handleChange} className="w-full bg-white border border-slate-200 outline-none rounded-lg p-3 text-sm font-bold text-slate-800 appearance-none cursor-pointer focus:border-slate-400">
                     <option value="EAN13">EAN13</option>
                     <option value="Code128">Code128</option>
                     <option value="UPC">UPC</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
               </div>
             </div>
             <div className="flex flex-col items-center justify-center border border-slate-200 bg-white rounded-xl p-6">
                <div className="w-32 h-12 bg-[repeating-linear-gradient(90deg,#000,#000_1px,transparent_1px,transparent_3px,#000_3px,#000_5px,transparent_5px,transparent_8px,#000_8px,#000_10px,transparent_10px,transparent_12px)] opacity-80 mb-2"></div>
                <div className="text-[10px] font-black tracking-[0.2em] text-slate-500">{formData.barcode || '4780012345678'}</div>
             </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 p-4 px-8 flex justify-end items-center z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] gap-4">
         <Link href="/inventory" className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition">
           Bekor qilish
         </Link>
         <button onClick={handleSave} disabled={loading} className="flex items-center px-6 py-2.5 bg-[#0f172a] text-white text-sm font-bold rounded-lg hover:bg-slate-800 shadow-md transition disabled:opacity-50">
           <Save size={16} className="mr-2" /> {loading ? "Saqlanmoqda..." : "Saqlash"}
         </button>
      </div>
    </div>
  );
}
