'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ChevronDown } from 'lucide-react';

interface PriceItem {
  productId: string;
  productName: string;
  price: string;
}

export default function MobileAddPriceList() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState<PriceItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const loadProducts = async () => {
    const res = await fetch('/api/products?limit=100');
    const d = await res.json();
    setProducts(Array.isArray(d) ? d : d.data || []);
  };

  const handleAddItem = () => {
    const product = products.find((p: Record<string, unknown>) => String(p.id) === selectedProduct);
    if (product && itemPrice) {
      setItems([...items, { productId: selectedProduct, productName: String(product.name), price: itemPrice }]);
      setSelectedProduct('');
      setItemPrice('');
      setShowAddItem(false);
    }
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/price-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, isActive, items: items.map(i => ({ productId: i.productId, price: Number(i.price) })) }),
      });
      if (res.ok) router.push('/mobile/prices');
    } catch {}
    setSaving(false);
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Yangi narx ro{'\u2019'}yxati" backHref="/mobile/prices" />

      <div className="px-6 mt-2 space-y-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 mb-2 block">Nomi</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Narx ro\u2019yxati nomi..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Faol</span>
            <button onClick={() => setIsActive(!isActive)}
              className={`w-12 h-7 rounded-full transition-all ${isActive ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold text-slate-500">Mahsulotlar ({items.length})</label>
            <button onClick={() => { loadProducts(); setShowAddItem(true); }} className="flex items-center gap-1 text-teal-600 dark:text-teal-400 text-xs font-bold active:scale-95">
              <Plus size={14} /> Qo{'\u2019'}shish
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{item.productName}</p>
                  <p className="text-[11px] text-slate-500">${item.price}</p>
                </div>
                <button onClick={() => handleRemoveItem(idx)} className="p-1 text-slate-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {showAddItem && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]" onClick={() => setShowAddItem(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-w-md mx-auto" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Mahsulot qo{'\u2019'}shish</h3>
              <div className="space-y-3">
                <div className="relative">
                  <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm appearance-none">
                    <option value="">Tanlang...</option>
                    {products.filter(p => !items.find(i => i.productId === String(p.id))).map((p: Record<string, unknown>) => (
                      <option key={String(p.id)} value={String(p.id)}>{String(p.name)}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <input type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)}
                  placeholder="Narx ($)" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
                <div className="flex gap-3">
                  <button onClick={() => setShowAddItem(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm">Bekor</button>
                  <button onClick={handleAddItem} disabled={!selectedProduct || !itemPrice}
                    className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-transform disabled:opacity-50">Qo{'\u2019'}shish</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={saving || !name}
          className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold text-sm active:scale-95 transition-transform disabled:opacity-50">
          {saving ? 'Saqlanmoq...' : 'Saqlash'}
        </button>
      </div>
    </div>
  );
}
