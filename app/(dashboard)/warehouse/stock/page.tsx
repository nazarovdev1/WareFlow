'use client';
import { Search, Filter, Download, ArrowDownUp, Package, ChevronDown, X, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, TrendingUp, TrendingDown, Plus, MapPin, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useNotification } from '@/lib/NotificationContext';

export default function StockPage() {
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  const [stock, setStock] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalQuantity: 0, totalValue: 0 });
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMovements, setShowMovements] = useState(false);
  const [movements, setMovements] = useState<any[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementFilter, setMovementFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({ name: '', address: '', district: '' });
  const [saving, setSaving] = useState(false);

  const loadWarehouses = () => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(data => setWarehouses(Array.isArray(data) ? data : data.data || []))
      .catch(console.error);
  };

  useEffect(() => { loadWarehouses(); }, []);

  // Fetch stock data
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (selectedWarehouse) query.append('warehouseId', selectedWarehouse);

    fetch(`/api/stock?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setStock(data.data);
          setSummary(data.summary || { totalQuantity: 0, totalValue: 0 });
        } else if (Array.isArray(data)) {
          setStock(data);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [search, selectedWarehouse]);

  // Excel export function
  const handleExportExcel = () => {
    if (stock.length === 0) {
      alert(t('common', 'noData'));
      return;
    }

    const excelData: any[] = stock.map((item, index) => ({
      [t('common', 'description')]: index + 1,
      [t('products', 'title')]: item.product?.name || t('common', 'description'),
      [t('products', 'sku')]: item.product?.sku || '-',
      [t('warehouse', 'title')]: item.warehouse?.name || '-',
      [t('common', 'total')]: item.quantity,
      [t('common', 'description')]: item.reserved,
      [t('common', 'description')]: item.quantity - item.reserved,
      [t('products', 'unit')]: item.product?.unit?.shortName || 'dona',
      [t('common', 'price') + ' (cost)']: item.costPrice,
      [t('common', 'total')]: (item.quantity - item.reserved) * item.costPrice,
    }));

    excelData.push({});
    excelData.push({
      [t('common', 'description')]: t('common', 'total'),
      [t('common', 'total')]: summary.totalQuantity,
      [t('common', 'total')]: summary.totalValue,
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    ws['!cols'] = [
      { wch: 5 }, { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, t('warehouse', 'title') + ' ' + t('common', 'description'));

    const date = new Date().toISOString().split('T')[0];
    const filename = `${t('warehouse', 'title')}_${t('common', 'description')}_${date}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  const handleAddWarehouse = async () => {
    if (!newWarehouse.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWarehouse),
      });
      if (!res.ok) throw new Error();
      loadWarehouses();
      setShowAddModal(false);
      setNewWarehouse({ name: '', address: '', district: '' });
      addNotification('success', 'Ombor qo\'shildi', `${newWarehouse.name} muvaffaqiyatli yaratildi`);
    } catch {
      addNotification('error', 'Xatolik', 'Omborni qo\'shishda xatolik yuz berdi');
    }
    setSaving(false);
  };

  return (
    <div className="p-8 font-sans w-full h-full flex flex-col bg-[#fdfdfd] dark:bg-slate-900 relative text-slate-800 dark:text-slate-200">
      <div className="mb-8">
        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wide mb-2 uppercase">{t('dashboard', 'title')} &gt; {t('warehouse', 'title')} &gt; <span className="text-slate-800 dark:text-slate-200">{t('warehouse', 'stockRemaining')}</span></div>
        <div className="flex justify-between items-center">
          <h1 className="text-[32px] font-black text-[#0f172a] dark:text-slate-100 tracking-tight">{t('warehouse', 'stockRemaining')}</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2.5 bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-sm font-bold rounded-lg shadow-sm transition"
            >
              <Plus size={16} className="mr-2" /> Ombor qo'shish
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition"
            >
              <Download size={16} className="mr-2" /> Excel
            </button>
            <button className="flex items-center px-5 py-2.5 bg-[#111827] dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition">
              <ArrowDownUp size={16} className="mr-2" /> {t('common', 'description')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center md:col-span-1">
           <Search size={16} className="text-slate-400 dark:text-slate-500 mr-2 shrink-0" />
           <input
             type="text"
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder={t('common', 'search')}
             className="w-full border-none outline-none text-sm font-medium placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 bg-transparent"
           />
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between md:col-span-1 cursor-pointer">
           <select
             value={selectedWarehouse}
             onChange={e => setSelectedWarehouse(e.target.value)}
             className="w-full text-sm font-medium text-slate-700 dark:text-slate-200 bg-transparent outline-none cursor-pointer appearance-none"
           >
             <option value="">{t('warehouse', 'title')}ni {t('common', 'select')} ({t('common', 'all')})</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id} className="dark:bg-slate-700">{w.name}{w.district ? ` — ${w.district}` : ''}</option>
              ))}
           </select>
           <ChevronDown size={16} className="text-slate-400 dark:text-slate-500 pointer-events-none" />
         </div>
      </div>

      <div className="bg-white dark:bg-slate-800 flex-1 overflow-auto rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 sticky top-0">
            <tr>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('products', 'title')}</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('warehouse', 'title')}</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('common', 'total')}</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('common', 'description')}</th>
              <th className="px-6 py-4 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('common', 'description')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 font-bold text-slate-500 dark:text-slate-400">{t('common', 'loading')}</td></tr>
            ) : stock.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 font-bold text-slate-500 dark:text-slate-400">{t('warehouse', 'title')}da {t('products', 'title')} {t('common', 'noData')}</td></tr>
            ) : stock.map((item, i) => {
              const avail = item.quantity - item.reserved;
              const unit = item.product?.unit?.shortName || 'dona';
              return (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 border-l-4 border-l-transparent hover:border-l-teal-500">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{item.product?.name || t('common', 'description')}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">{item.product?.sku || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-md text-xs font-bold">{item.warehouse?.name || '-'}</span>
                </td>
                <td className="px-6 py-4 text-right font-black text-slate-800 dark:text-slate-200 text-base">
                  {item.quantity.toLocaleString()} <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{unit}</span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-orange-500 dark:text-orange-400">
                  {item.reserved.toLocaleString()} <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{unit}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`font-black text-lg ${avail > 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>
                    {avail.toLocaleString()} <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block -mt-1 leading-none">{unit}</span>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center text-center shadow-sm">
           <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
             <Package size={24} />
           </div>
           <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{summary.totalQuantity.toLocaleString()}</div>
           <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('common', 'total')} {t('common', 'quantity')} ({t('common', 'all')})</div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center text-center shadow-sm">
           <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mb-3">
             <span className="font-extrabold text-xl line-through decoration-double">S</span>
           </div>
           <div className="text-3xl font-black text-teal-600 dark:text-teal-400">{summary.totalValue.toLocaleString()} UZS</div>
           <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">{t('warehouse', 'title')} {t('common', 'total')} {t('products', 'costPrice')} (Cost)</div>
         </div>
      </div>

      {/* Add Warehouse Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowAddModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package size={18} className="text-teal-500" /> Yangi ombor qo'shish
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Ombor nomi *</label>
                <input type="text" value={newWarehouse.name} onChange={e => setNewWarehouse(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  placeholder="Masalan: Asosiy ombor" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Manzil</label>
                <input type="text" value={newWarehouse.address} onChange={e => setNewWarehouse(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  placeholder="Masalan: Toshkent, Chilonzor" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1"><MapPin size={12} /> Tuman / Filial</label>
                <input type="text" value={newWarehouse.district} onChange={e => setNewWarehouse(p => ({ ...p, district: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  placeholder="Masalan: Chilonzor tuman" />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Bekor qilish
              </button>
              <button onClick={handleAddWarehouse} disabled={saving || !newWarehouse.name.trim()}
                className="px-5 py-2.5 bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-sm font-bold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-2">
                <Check size={14} /> {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
