'use client';

import { useState, useEffect } from 'react';
import { Save, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useNotification } from '@/lib/NotificationContext';

interface Product {
  id: string;
  name: string;
  sku?: string;
}

interface WarehouseItem {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  fullName: string;
}

export default function MobileAddBatchPage() {
  const router = useRouter();
  const { success, error } = useNotification();

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    batchNumber: '',
    productId: '',
    warehouseId: '',
    quantity: '',
    initialQty: '',
    costPrice: '',
    manufactureDate: '',
    expiryDate: '',
    supplierId: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pRes, wRes, sRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/warehouses'),
        fetch('/api/suppliers'),
      ]);
      if (pRes.ok) {
        const data = await pRes.json();
        setProducts(Array.isArray(data) ? data : data.data || []);
      }
      if (wRes.ok) {
        const data = await wRes.json();
        setWarehouses(Array.isArray(data) ? data : data.data || []);
      }
      if (sRes.ok) {
        const data = await sRes.json();
        setSuppliers(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      error('Xatolik', `Ma\u2019lumotlarni yuklashda xatolik`);
    }
  };

  const handleSubmit = async () => {
    if (!formData.productId) {
      error('Xatolik', 'Mahsulot tanlanishi shart');
      return;
    }
    if (!formData.warehouseId) {
      error('Xatolik', 'Ombor tanlanishi shart');
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      error('Xatolik', 'Miqdor kiritilishi shart');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/product-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchNumber: formData.batchNumber || undefined,
          productId: formData.productId,
          warehouseId: formData.warehouseId,
          quantity: Number(formData.quantity),
          initialQty: formData.initialQty ? Number(formData.initialQty) : Number(formData.quantity),
          costPrice: formData.costPrice ? Number(formData.costPrice) : 0,
          manufactureDate: formData.manufactureDate || null,
          expiryDate: formData.expiryDate || null,
          supplierId: formData.supplierId || null,
          notes: formData.notes || null,
        }),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Partiya muvaffaqiyatli yaratildi');
        router.push('/mobile/batches');
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Partiya yaratishda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Yangi partiya"
        backHref="/mobile/batches"
      />

      <div className="px-4 space-y-4">
        {/* Product */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Mahsulot *</label>
          <select
            value={formData.productId}
            onChange={e => setFormData({ ...formData, productId: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="">Mahsulot tanlang</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</option>
            ))}
          </select>
        </div>

        {/* Warehouse */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Ombor *</label>
          <select
            value={formData.warehouseId}
            onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="">Ombor tanlang</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {/* Batch Number & Quantities */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Partiya raqami</label>
            <input
              type="text"
              placeholder="Avtomatik generatsiya"
              value={formData.batchNumber}
              onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Miqdor *</label>
              <input
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">{`Boshlang\u2019ich miqdor`}</label>
              <input
                type="number"
                placeholder="0"
                value={formData.initialQty}
                onChange={e => setFormData({ ...formData, initialQty: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">{`Tan narxi (so\u2019m)`}</label>
            <input
              type="number"
              placeholder="0"
              value={formData.costPrice}
              onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <Calendar size={12} /> Sanalar
          </h3>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Ishlab chiqarilgan sana</label>
            <input
              type="date"
              value={formData.manufactureDate}
              onChange={e => setFormData({ ...formData, manufactureDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Yaroqlilik muddati</label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Supplier */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Yetkazib beruvchi</label>
          <select
            value={formData.supplierId}
            onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="">Tanlanmagan</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Izohlar</label>
          <textarea
            placeholder={`Qo\u2019shimcha ma\u2019lumot...`}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <Save size={18} />
          {submitting ? 'Yaratilmoqda...' : 'Partiya yaratish'}
        </button>
      </div>
    </div>
  );
}
