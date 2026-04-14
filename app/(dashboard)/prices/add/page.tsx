'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronDown, Check, Minus, Plus } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AddPriceListPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [priceListName, setPriceListName] = useState("Asosiy narxlar ro'yxati");
  const [sortOrder, setSortOrder] = useState(1);
  const [showInSales, setShowInSales] = useState(true);
  const [showInPurchases, setShowInPurchases] = useState(false);

  // Products and pricing state
  const [products, setProducts] = useState<any[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/products?limit=1000')
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : data.data || []);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handlePriceChange = (productId: string, value: string) => {
    setPrices(prev => ({ ...prev, [productId]: value }));
  };

  const handleSave = async () => {
    if (!priceListName) {
      alert(t('messages', 'fillRequired'));
      return;
    }

    const items = Object.entries(prices)
      .filter(([id, price]) => price && !isNaN(Number(price)))
      .map(([id, price]) => ({
        productId: id,
        price: Number(price)
      }));

    if (items.length === 0) {
      if(!confirm("Hali birorta narx kiritmadingiz. Bo'sh ro'yxatni saqlamoqchimisiz?")) {
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/price-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: priceListName,
          type: showInPurchases ? 'PURCHASE' : 'SALE',
          isActive: showInSales,
          items: items.length > 0 ? items : undefined
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('messages', 'error'));
      }

      router.push('/prices');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 font-sans w-full min-h-screen flex flex-col bg-[#fdfdfd] dark:bg-slate-900 pb-24 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
         <div className="flex items-center">
            <Link href="/prices" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition mr-4">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-[28px] font-black text-[#0f172a] dark:text-slate-100 tracking-tight">{t('products', 'priceLists')} {t('common', 'add')}</h1>
         </div>
      </div>

      <div className="flex xl:flex-row flex-col gap-6 w-full max-w-7xl">
        {/* Left Form Settings */}
        <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                 <label className="text-[10px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-3">{t('products', 'priceLists')} {t('common', 'name')}</label>
                 <input
                   type="text"
                   value={priceListName}
                   onChange={e => setPriceListName(e.target.value)}
                   className="w-full bg-slate-50 dark:bg-slate-700 border border-transparent dark:border-slate-600 focus:border-slate-300 dark:focus:border-slate-500 outline-none rounded-lg p-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 transition"
                 />
              </div>

              <div className="flex flex-col gap-3">
                 <label className="text-[10px] font-black tracking-widest text-[#64748b] dark:text-slate-400 uppercase block mb-1">{'TARTIBLASH SONI'}</label>
                 <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 border border-transparent dark:border-slate-600 rounded-lg p-3 w-48">
                    <button onClick={() => setSortOrder(s => Math.max(1, s-1))} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"><Minus size={18} /></button>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{sortOrder}</span>
                    <button onClick={() => setSortOrder(s => s+1)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"><Plus size={18} /></button>
                 </div>
              </div>

              <div className="flex flex-col gap-4 justify-center mt-2">
                 <label className="flex items-center cursor-pointer group">
                   <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 border transition ${showInSales ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800' : 'bg-slate-100 dark:bg-slate-700 border-transparent'} group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20`}>
                      {showInSales && <Check size={14} className="text-teal-600 dark:text-teal-400" />}
                   </div>
                   <input type="checkbox" className="hidden" checked={showInSales} onChange={e => setShowInSales(e.target.checked)} />
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('sales', 'title')}larda {"ko'rsatish"}</span>
                 </label>

                 <label className="flex items-center cursor-pointer group">
                   <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 border transition ${showInPurchases ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800' : 'bg-slate-100 dark:bg-slate-700 border-transparent'} group-hover:bg-slate-200 dark:group-hover:bg-slate-600`}>
                      {showInPurchases && <Check size={14} className="text-teal-600 dark:text-teal-400" />}
                   </div>
                   <input type="checkbox" className="hidden" checked={showInPurchases} onChange={e => setShowInPurchases(e.target.checked)} />
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('purchases', 'title')}larda {"ko'rsatish"}</span>
                 </label>
              </div>
           </div>
        </div>

        {/* Right Status Card */}
        <div className="w-full xl:w-[350px] bg-[#0f172a] dark:bg-slate-800 rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-between shrink-0">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
           </div>
           <div className="relative z-10">
             <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">{t('common', 'status')}</div>
             <div className="text-3xl font-black text-white">{'Yangi'} {"Ro'yxat"}</div>
           </div>

           <div className="relative z-10 flex flex-col gap-4 mt-8">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">{t('products', 'title')} {t('common', 'total')}</span>
                <span className="text-white dark:text-slate-200 text-base font-bold">{loading ? '...' : filteredProducts.length} ta</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">{t('sales', 'title')} {t('common', 'price')}</span>
                <span className="text-teal-400 text-base font-bold">{t('common', 'active')}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mt-8 flex flex-col">
         {/* Table Toolbar */}
         <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-200">{t('common', 'price')} ({t('common', 'all')})</h2>
            <div className="flex items-center gap-4">
               <div className="relative w-64">
                 <input
                   type="text"
                   placeholder={t('common', 'search') + ' (' + t('common', 'name') + ', ' + t('products', 'sku') + '...'}
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   className="w-full bg-slate-50 dark:bg-slate-700 border border-transparent dark:border-slate-600 focus:border-slate-300 dark:focus:border-slate-500 outline-none rounded-lg p-2.5 pl-10 text-sm font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
                 />
                 <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
               </div>

               <div className="flex items-center bg-slate-50 dark:bg-slate-700 rounded-lg p-1">
                  <select className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 outline-none border-none p-1.5 focus:bg-white dark:focus:bg-slate-600 rounded px-2 cursor-pointer appearance-none pr-6">
                    <option className="dark:bg-slate-700">{t('products', 'category')}</option>
                  </select>
                  <select className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 outline-none border-none p-1.5 focus:bg-white dark:focus:bg-slate-600 rounded px-2 cursor-pointer appearance-none pr-6 border-l border-slate-200 dark:border-slate-600">
                    <option className="dark:bg-slate-700">{t('customers', 'group')}</option>
                  </select>
                  <select className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 outline-none border-none p-1.5 focus:bg-white dark:focus:bg-slate-600 rounded px-2 cursor-pointer appearance-none pr-6 border-l border-slate-200 dark:border-slate-600">
                    <option className="dark:bg-slate-700">{t('suppliers', 'title')}</option>
                  </select>
               </div>
            </div>
         </div>

         {/* Products Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-700/50">
                  <th className="px-6 py-4 w-16">No</th>
                  <th className="px-6 py-4 w-1/4">{t('common', 'name')}</th>
                  <th className="px-6 py-4">{t('products', 'sku')}</th>
                  <th className="px-6 py-4">{t('suppliers', 'title')}</th>
                  <th className="px-6 py-4">{t('customers', 'group')}</th>
                  <th className="px-6 py-4">{t('products', 'category')}</th>
                  <th className="px-6 py-4 w-48 text-right">{t('common', 'price')}</th>
                  <th className="px-6 py-4 text-center">{'VALYUTA'}</th>
                </tr>
              </thead>
              <tbody>
                 {loading ? (
                    <tr><td colSpan={8} className="text-center py-8 text-sm font-bold text-slate-500 dark:text-slate-400">{t('common', 'loading')}</td></tr>
                 ) : filteredProducts.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-sm font-bold text-slate-500 dark:text-slate-400">{t('common', 'noData')}</td></tr>
                 ) : (
                   filteredProducts.map((p, index) => (
                     <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition group">
                        <td className="px-6 py-4 text-sm font-bold text-slate-400 dark:text-slate-500">{index + 1}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center">
                              <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-3 shrink-0 overflow-hidden">
                                {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200 dark:bg-slate-600"></div>}
                              </div>
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">{p.name}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">{p.sku || '-'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">-</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">{p.folder?.name || '-'}</td>
                        <td className="px-6 py-4">
                           {p.category ? (
                             <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                               {p.category.name}
                             </span>
                           ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <input
                             type="text"
                             value={prices[p.id] || ''}
                             onChange={(e) => handlePriceChange(p.id, e.target.value)}
                             placeholder={p.sellPrice?.toLocaleString() || "0"}
                             className="w-full max-w-[140px] bg-slate-50 dark:bg-slate-700 group-hover:bg-white dark:group-hover:bg-slate-600 border border-transparent dark:border-slate-600 focus:border-slate-300 dark:focus:border-slate-500 outline-none rounded-md p-2 text-sm font-black text-slate-800 dark:text-slate-200 text-right transition inline-block text-right"
                           />
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-xs font-black text-teal-600 dark:text-teal-400">UZS</span>
                        </td>
                     </tr>
                   ))
                 )}
              </tbody>
            </table>
         </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 px-8 flex justify-between items-center z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
         <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {"O'zgarishlarni bekor qilsangiz, ular saqlanmaydi."}
         </div>
         <div className="flex gap-4">
           <Link href="/prices" className="px-6 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition">
             {t('common', 'cancel')}
           </Link>
           <button
             onClick={handleSave}
             disabled={saving}
             className="flex items-center px-6 py-2.5 bg-[#0f172a] dark:bg-slate-600 text-white text-sm font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 shadow-md transition disabled:opacity-50"
           >
             {saving ? "Saqlanmoqda..." : t('common', 'save')}
           </button>
         </div>
      </div>
    </div>
  );
}
