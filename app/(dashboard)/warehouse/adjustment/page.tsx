'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ChevronLeft, Package, Warehouse, FileText } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type AdjustmentItem = {
  productId: string;
  warehouseId: string;
  expectedQty: number;
  actualQty: number;
  reason: string;
  productName?: string;
  warehouseName?: string;
};

export default function InventoryAdjustmentPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [items, setItems] = useState<AdjustmentItem[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?limit=500').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
    ]).then(([productsData, warehousesData]) => {
      setProducts(productsData.data || []);
      setWarehouses(warehousesData.data || warehousesData || []);
    }).catch(console.error);
  }, []);

  const addItem = () => {
    setItems([...items, {
      productId: '',
      warehouseId: '',
      expectedQty: 0,
      actualQty: 0,
      reason: 'Korrektirovka',
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof AdjustmentItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate difference
    if (field === 'actualQty' || field === 'expectedQty') {
      // Trigger re-render
    }

    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      alert(t('messages', 'fillRequired'));
      return;
    }

    if (!items.every(item => item.productId && item.warehouseId)) {
      alert('Mahsulot va omborni tanlang');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/inventory-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: note || 'Korrektirovka',
          items: items.map(item => ({
            productId: item.productId,
            warehouseId: item.warehouseId,
            expectedQty: item.expectedQty,
            actualQty: item.actualQty,
            reason: item.reason || 'Korrektirovka',
          })),
        }),
      });

      if (res.ok) {
        alert('Korrektirovka muvaffaqiyatli saqlandi!');
        setItems([]);
        setNote('');
      } else {
        const error = await res.json();
        alert(error.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      alert('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifference = (item: AdjustmentItem) => item.actualQty - item.expectedQty;

  return (
    <div className="p-6 font-sans w-full min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="mb-6">
        <Link href="/warehouse" className="inline-flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition mb-4">
          <ChevronLeft size={16} className="mr-1" /> {t('common', 'back')}
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Inventar Korrektirovkasi
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          Ombordagi mahsulot qoldiqlarini tuzatish
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          {items.map((item, index) => {
            const difference = getDifference(item);
            const product = products.find(p => p.id === item.productId);
            const warehouse = warehouses.find(w => w.id === item.warehouseId);

            return (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                      <Package size={12} className="inline mr-1" /> Mahsulot
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white"
                    >
                      <option value="">Tanlang</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} className="dark:bg-slate-700">
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Warehouse */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                      <Warehouse size={12} className="inline mr-1" /> Ombor
                    </label>
                    <select
                      value={item.warehouseId}
                      onChange={(e) => updateItem(index, 'warehouseId', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white"
                    >
                      <option value="">Tanlang</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id} className="dark:bg-slate-700">
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Expected Qty */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                      Kutilayotgan
                    </label>
                    <input
                      type="number"
                      value={item.expectedQty}
                      onChange={(e) => updateItem(index, 'expectedQty', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Actual Qty */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                      Haqiqiy
                    </label>
                    <input
                      type="number"
                      value={item.actualQty}
                      onChange={(e) => updateItem(index, 'actualQty', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Reason */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                      Sabab
                    </label>
                    <input
                      type="text"
                      value={item.reason}
                      onChange={(e) => updateItem(index, 'reason', e.target.value)}
                      placeholder="Masalan: Yetkazib beruvchi xato yubordi"
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Difference */}
                {item.productId && item.warehouseId && (
                  <div className={`mt-3 p-2 rounded-lg text-xs font-bold ${
                    difference > 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                    difference < 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                    'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {difference > 0 ? `+${difference}` : difference} dona farq
                    {difference > 0 ? ' (ortiqcha)' : difference < 0 ? ' (kam)' : ' (to\'g\'ri)'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Item Button */}
          <button
            onClick={addItem}
            className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-bold text-sm flex items-center justify-center"
          >
            <Plus size={18} className="mr-2" /> Mahsulot qo'shish
          </button>
        </div>

        {/* Right: Summary & Actions */}
        <div className="space-y-4">
          {/* Note */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
              <FileText size={12} className="inline mr-1" /> Izoh
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Korrektirovka haqida izoh..."
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white resize-none"
            />
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Xulosa</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Mahsulotlar:</span>
                <span className="font-bold">{items.length} ta</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Ortiqcha:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {items.filter(i => getDifference(i) > 0).reduce((sum, i) => sum + getDifference(i), 0)} dona
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Kam:</span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {Math.abs(items.filter(i => getDifference(i) < 0).reduce((sum, i) => sum + getDifference(i), 0))} dona
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || items.length === 0}
            className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" /> Korrektirovkani saqlash
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
