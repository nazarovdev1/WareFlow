'use client';
import { useState, useEffect } from 'react';
import { AlertCircle, Plus, Printer, X, CheckSquare, Square, Trash2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BarcodePage() {
  const { t } = useLanguage();
  const [showNotification, setShowNotification] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<any[]>([
    { id: 1, productId: '', barcode: '', quantity: 1, name: '' }
  ]);

  useEffect(() => {
    fetch('/api/products?limit=1000')
      .then(res => res.json())
      .then(data => {
        setProducts(data.data || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    const newItems = [...selectedItems];
    newItems[index] = {
      ...newItems[index],
      productId,
      name: product?.name || '',
      barcode: product?.barcode || ''
    };
    setSelectedItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...selectedItems];
    newItems[index].quantity = quantity;
    setSelectedItems(newItems);
  };

  const addRow = () => {
    setSelectedItems([...selectedItems, { id: Date.now(), productId: '', barcode: '', quantity: 1, name: '' }]);
  };

  const removeRow = (index: number) => {
    if (selectedItems.length === 1) return;
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('products', 'barcodePrint')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('products', 'title')}lar uchun maxsus yorliqlarni loyihalash va chiqarish</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('products', 'title')}larni tanlash</h2>
              <button
                onClick={addRow}
                className="text-teal-600 dark:text-teal-400 font-bold text-sm bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 rounded-lg flex items-center hover:bg-teal-100 dark:hover:bg-teal-900/40 transition"
              >
                <Plus size={16} className="mr-1" /> {t('common', 'add')}
              </button>
            </div>

            <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
              <div className="col-span-1">#</div>
              <div className="col-span-6">{t('products', 'title')} Nomi</div>
              <div className="col-span-3">{t('products', 'barcode')}</div>
              <div className="col-span-2 text-center">{t('common', 'quantity')}</div>
            </div>

            <div className="space-y-3">
              {selectedItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-700/50 p-2 text-sm rounded-lg border border-slate-100 dark:border-slate-700 group">
                  <div className="col-span-1 font-bold text-center dark:text-slate-300">{index + 1}</div>
                  <div className="col-span-6">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-600 border-none p-2.5 rounded-md focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <option value="">{t('products', 'title')}ni tanlang...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} className="dark:bg-slate-600">{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={item.barcode}
                      readOnly
                      placeholder={t('products', 'barcode')}
                      className="w-full bg-slate-100 dark:bg-slate-600 border-none p-2.5 rounded-md outline-none text-slate-400 dark:text-slate-500 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div className="col-span-2 flex items-center space-x-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-100 dark:bg-slate-600 border-none p-2.5 rounded-md focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-700 dark:text-slate-200 font-medium text-center"
                    />
                    <button
                      onClick={() => removeRow(index)}
                      className="text-slate-300 dark:text-slate-500 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stiker sozlamalari */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Stiker sozlamalari</h2>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Kengligi (MM)</div>
                <div className="flex items-center space-x-4">
                   <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full relative">
                      <div className="absolute left-0 top-0 h-full bg-teal-600 rounded-full w-1/2"></div>
                      <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-teal-600 border-2 border-white dark:border-slate-800 rounded-full shadow-md cursor-pointer"></div>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-700 px-4 py-2 font-bold text-slate-700 dark:text-slate-200 rounded-lg w-16 text-center border border-slate-100 dark:border-slate-600">50</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Balandligi (MM)</div>
                <div className="flex items-center space-x-4">
                   <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full relative">
                      <div className="absolute left-0 top-0 h-full bg-teal-600 rounded-full w-1/3"></div>
                      <div className="absolute left-1/3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-teal-600 border-2 border-white dark:border-slate-800 rounded-full shadow-md cursor-pointer"></div>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-700 px-4 py-2 font-bold text-slate-700 dark:text-slate-200 rounded-lg w-16 text-center border border-slate-100 dark:border-slate-600">30</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="text-teal-600 dark:text-teal-400"><CheckSquare size={20} className="fill-teal-50 dark:fill-teal-900/20" /></div>
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{t('common', 'name')}ni qo&apos;shish</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="text-teal-600 dark:text-teal-400"><CheckSquare size={20} className="fill-teal-50 dark:fill-teal-900/20" /></div>
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{t('products', 'barcode')}ni qo&apos;shish</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="text-teal-600 dark:text-teal-400"><CheckSquare size={20} className="fill-teal-50 dark:fill-teal-900/20" /></div>
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{t('common', 'price')}ni qo&apos;shish</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Preview Box */}
        <div className="sticky top-8">
          <div className="border-[2.5px] border-dashed border-slate-200 dark:border-slate-700 rounded-2xl h-[420px] flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-10">Stiker Ko&apos;rinishi</h3>

            <div className="w-full bg-white dark:bg-slate-700 shadow-xl rounded-sm p-4 relative overflow-hidden">
               <div className="text-center mb-2 h-8 flex flex-col justify-center">
                 <h4 className="font-bold text-[10px] tracking-wide text-slate-800 dark:text-slate-200 uppercase truncate">
                   {selectedItems[0]?.name || t('products', 'title') + ' Nomi'}
                 </h4>
               </div>

               <div className="bg-slate-900 dark:bg-slate-900 w-full h-12 flex justify-between px-1.5 py-1 mb-1 relative">
                 <div className="w-1 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="w-2 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="w-1.5 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="w-0.5 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="w-3 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="w-1 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="w-1.5 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="w-2 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="w-0.5 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="w-4 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="w-1 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="w-2 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="w-1.5 bg-white dark:bg-slate-200 h-full"></div>
                 <div className="absolute inset-0 border-4 border-slate-900 dark:border-slate-600"></div>
                 <div className="absolute bottom-0 w-full bg-white dark:bg-slate-700 h-2 translate-y-3"></div>
               </div>
               <div className="text-center font-mono text-[10px] tracking-[0.3em] font-medium text-slate-700 dark:text-slate-300 mb-4 mt-2">
                 {selectedItems[0]?.barcode || '000000000000'}
               </div>

               <div className="flex justify-between items-end">
                 <div>
                   <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 block mb-0.5 uppercase">{t('common', 'price')}</span>
                   <div className="font-black text-teal-600 dark:text-teal-400 text-lg leading-none">
                     {products.find(p => p.id === selectedItems[0]?.productId)?.sellPrice?.toLocaleString() || '0'} UZS
                   </div>
                 </div>
                 <div className="bg-slate-800 dark:bg-slate-900 p-1 w-6 h-6 flex items-center justify-center rounded-sm">
                   <span className="text-[6px] font-bold text-white dark:text-slate-300 leading-none">QR</span>
                 </div>
               </div>
            </div>

            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-10 max-w-[200px] leading-relaxed">
              {"Ushbu ko'rinish tanlangan o'lchamlarga muvofiq avtomatik moslashadi."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8 space-x-4">
        <button className="px-8 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition">
          {t('common', 'cancel')}
        </button>
        <button className="px-8 py-3 bg-[#111827] dark:bg-slate-700 hover:bg-[#1f2937] dark:hover:bg-slate-600 text-white font-bold rounded-xl flex items-center shadow-lg shadow-black/20 transition">
          <Printer size={18} className="mr-2" /> {t('products', 'barcodePrint')}
        </button>
      </div>

      {showNotification && (
        <div className="fixed bottom-6 right-6 bg-[#0f172a] dark:bg-slate-800 text-white p-4 rounded-xl shadow-2xl flex items-start space-x-4 w-[360px] animate-in slide-in-from-bottom-5">
           <div className="mt-0.5 w-6 h-6 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center flex-shrink-0 border border-teal-500/30">
            <span className="text-xs font-bold">i</span>
           </div>
           <div className="flex-1">
             <h4 className="font-bold text-sm text-white mb-0.5">Tizim tayyor</h4>
             <p className="text-xs text-slate-400 dark:text-slate-500">Barcode printeri ulanishi muvaffaqiyatli yakunlandi.</p>
           </div>
           <button onClick={() => setShowNotification(false)} className="text-slate-500 dark:text-slate-400 hover:text-white transition">
             <X size={16} />
           </button>
        </div>
      )}
    </div>
  );
}
