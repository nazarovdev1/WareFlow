'use client';
import { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertTriangle, ScanLine, Printer, X, Search, Package, Warehouse as WarehouseIcon, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function InventoryCheckPage() {
  const { t } = useLanguage();
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [items, setItems] = useState<{ productId: string; actualQty: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/inventory-audit')
      .then(res => res.json())
      .then(data => {
        setAudits(Array.isArray(data) ? data : data.data || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const openModal = async () => {
    setShowModal(true);
    setError('');
    setItems([]);
    setSelectedWarehouse('');
    setResponsiblePerson('');

    // Load warehouses and products
    const [wRes, pRes] = await Promise.all([
      fetch('/api/warehouses').then(r => r.json()),
      fetch('/api/products?limit=500').then(r => r.json()),
    ]);
    setWarehouses(Array.isArray(wRes) ? wRes : wRes.data || []);
    setProducts(Array.isArray(pRes) ? pRes : pRes.data || []);
  };

  const addItem = () => {
    setItems([...items, { productId: '', actualQty: 0 }]);
  };

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[i] = { ...newItems[i], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!selectedWarehouse) { setError('Omborni tanlang'); return; }
    if (items.length === 0) { setError('Kamida 1 mahsulot qo\'shing'); return; }
    if (items.some(i => !i.productId)) { setError('Barcha mahsulotlarni tanlang'); return; }

    setSaving(true);
    setError('');
    try {
      const stockRes = await fetch(`/api/stock?warehouseId=${selectedWarehouse}`);
      const stockData = await stockRes.json();
      const stockEntries = Array.isArray(stockData) ? stockData : stockData.data || [];

      const auditItems = items.map(item => {
        const stockEntry = stockEntries.find((s: any) => s.productId === item.productId);
        return {
          productId: item.productId,
          expectedQty: stockEntry?.quantity || 0,
          actualQty: item.actualQty,
          difference: item.actualQty - (stockEntry?.quantity || 0),
        };
      });

      const res = await fetch('/api/inventory-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId: selectedWarehouse,
          responsiblePerson: responsiblePerson || 'Admin',
          items: auditItems,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Xatolik yuz berdi');
      }

      setShowModal(false);
      // Refresh list
      setLoading(true);
      fetch('/api/inventory-audit')
        .then(r => r.json())
        .then(data => { setAudits(Array.isArray(data) ? data : data.data || []); setLoading(false); });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 font-sans w-full h-full flex flex-col bg-[#fdfdfd] dark:bg-slate-900 relative text-slate-800 dark:text-slate-200">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wide mb-2 uppercase">{t('dashboard', 'title')} &gt; {t('warehouse', 'title')} &gt; <span className="text-slate-800 dark:text-slate-200">{t('warehouse', 'inventory')}</span></div>
          <h1 className="text-[32px] font-black text-[#0f172a] dark:text-slate-100 tracking-tight">{t('warehouse', 'inventory')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2">{t('warehouse', 'title')}dagi haqiqiy qoldiqni dastur qoldig&apos;i bilan solishtirish</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition"
          >
            <Printer size={16} className="mr-2" /> {t('common', 'print')}
          </button>
          <button
            onClick={openModal}
            className="flex items-center px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-teal-600/20 transition"
          >
            <ScanLine size={16} className="mr-2" /> Yangi {t('warehouse', 'inventory').toLowerCase()}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 flex-1 overflow-hidden flex flex-col rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-20 text-slate-400 dark:text-slate-500 font-bold">{t('common', 'loading')}</div>
        ) : audits.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-200 dark:text-slate-600 mb-4">
              <ScanLine size={32} />
            </div>
            <p className="text-slate-400 dark:text-slate-500 font-bold mb-4">{t('common', 'noData')}</p>
            <button onClick={openModal} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg transition">
              + Yangi inventarizatsiya
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hujjat Raqami</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'date')}</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('warehouse', 'title')}</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Natija</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'status')}</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('warehouse', 'responsiblePerson')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {audits.map((item) => {
                const diffItems = item.items?.filter((it: any) => it.difference !== 0).length || 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.docNumber}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-md text-xs font-bold">{item.warehouse?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {diffItems > 0 ? (
                        <span className="text-rose-500 dark:text-rose-400 font-black px-2 py-1 bg-rose-50 dark:bg-rose-900/30 rounded text-[10px] uppercase tracking-wider">{diffItems} ta farq bor</span>
                      ) : (
                        <span className="text-teal-500 dark:text-teal-400 font-bold px-2 py-1 bg-teal-50 dark:bg-teal-900/30 rounded text-[10px] uppercase tracking-wider">Hamma mahsulot joyida</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {item.status === 'COMPLETED' ? (
                        <span className="flex items-center text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider">
                          <CheckCircle size={14} className="mr-1" /> {t('common', 'completed')}
                        </span>
                      ) : (
                        <span className="flex items-center text-orange-500 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider">
                          <AlertTriangle size={14} className="mr-1" /> Jarayonda
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-600 dark:text-slate-300">
                      {item.responsiblePerson || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* New Inventory Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
                <ScanLine size={20} className="mr-2 text-teal-500" /> Yangi Inventarizatsiya
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Omborxona *</label>
                  <select value={selectedWarehouse} onChange={e => setSelectedWarehouse(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm">
                    <option value="">Tanlang...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Mas&apos;ul shaxs</label>
                  <input type="text" value={responsiblePerson} onChange={e => setResponsiblePerson(e.target.value)}
                    placeholder="Ism familiya..."
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">Mahsulotlar</label>
                  <button onClick={addItem} className="text-xs text-teal-600 font-bold hover:underline flex items-center">
                    <Plus size={14} className="mr-1" /> Qo&apos;shish
                  </button>
                </div>
                {items.length === 0 ? (
                  <button onClick={addItem} className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-400 hover:border-teal-400 hover:text-teal-500 transition text-sm font-bold flex items-center justify-center">
                    <Plus size={18} className="mr-2" /> Mahsulot qo&apos;shish
                  </button>
                ) : (
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm">
                          <option value="">Mahsulot tanlang</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500 whitespace-nowrap">Haqiqiy:</label>
                          <input type="number" min={0} value={item.actualQty} onChange={e => updateItem(i, 'actualQty', parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-center text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
                        </div>
                        <button onClick={() => removeItem(i)} className="p-1.5 text-slate-400 hover:text-red-500 transition">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition text-sm">Bekor</button>
                <button onClick={handleSubmit} disabled={saving}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-lg transition text-sm flex items-center">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
