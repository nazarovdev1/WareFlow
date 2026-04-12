'use client';
import { Search, Calendar, User, Activity, Plus, TrendingDown, DollarSign, Wallet, X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CreditorsPage() {
  const [isOverdue, setIsOverdue] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Real stats
  const [totalUSD, setTotalUSD] = useState(0);
  const [totalUZS, setTotalUZS] = useState(0);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  const [newTransaction, setNewTransaction] = useState({
    supplierId: '',
    type: 'DEBT',
    amount: '',
    currency: 'USD',
    dueDate: '',
    description: ''
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (isOverdue) query.append('overdue', 'true');
      const res = await fetch(`/api/supplier-transactions?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers?limit=100');
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  // We recalculate actual supplier debt to display total debt based on supplier balances.
  // Actually, since the page shows total DEBT, we can fetch from suppliers directly or sum up negative balances.
  // We'll fetch suppliers to aggregate true overdue debt.
  const fetchStatsAndSuppliers = async () => {
    await fetchSuppliers();
    try {
      const res = await fetch(`/api/suppliers?limit=1000`);
      if (res.ok) {
        const data = await res.json();
        const allSuppliers = data.data || [];
        // Debt means balance < 0. So we sum the absolute value of negative balances.
        const usdDebt = allSuppliers.reduce((acc: number, s: any) => acc + (s.balanceUSD < 0 ? Math.abs(s.balanceUSD) : 0), 0);
        const uzsDebt = allSuppliers.reduce((acc: number, s: any) => acc + (s.balanceUZS < 0 ? Math.abs(s.balanceUZS) : 0), 0);
        setTotalUSD(usdDebt);
        setTotalUZS(uzsDebt);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchTransactions();
    fetchStatsAndSuppliers();
  }, [isOverdue]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.supplierId || !newTransaction.amount) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      };
      const res = await fetch('/api/supplier-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewTransaction({ supplierId: '', type: 'DEBT', amount: '', currency: 'USD', dueDate: '', description: '' });
        fetchTransactions();
        fetchStatsAndSuppliers();
      } else {
        const err = await res.json();
        alert(err.error || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Failed to add transaction', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fefefe] relative">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#111827] tracking-tight mb-2">Kreditorlar</h1>
          <p className="text-slate-500 font-medium text-sm">Ta'minotchilar oldidagi barcha qarzdorliklar</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-5 py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition"
        >
          <Plus size={16} className="mr-2" /> Yangi to'lov/Qarz
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mr-4">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">JAMI QARZDORLIK (USD)</p>
            <h3 className="text-2xl font-black text-slate-900">$ {totalUSD.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mr-4">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">JAMI QARZDORLIK (UZS)</p>
            <h3 className="text-2xl font-black text-slate-900">{totalUZS.toLocaleString('ru-RU')} UZS</h3>
          </div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 flex items-center text-white">
          <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">MUDDATI O'TGAN Tranzaksiyalar</p>
            <h3 className="text-2xl font-black">{transactions.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.type === 'DEBT').length} ta</h3>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-3 mb-8">
         <div className="relative flex-1 w-full max-w-sm">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             placeholder="Ta'minotchi yoki tavsif..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-transparent hover:border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none transition-colors focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" 
           />
         </div>

         <div className="flex items-center space-x-4 bg-[#f8fafc] px-6 py-3 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
           <span className="text-[10px] font-black tracking-widest text-[#0f172a] uppercase leading-tight cursor-pointer" onClick={() => setIsOverdue(!isOverdue)}>MUDDATI<br/>O'TGAN</span>
           <button 
             onClick={() => setIsOverdue(!isOverdue)}
             className={`w-10 h-5 rounded-full relative transition-colors shadow-inner ${isOverdue ? 'bg-indigo-600' : 'bg-slate-300'}`}
           >
             <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${isOverdue ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`}></div>
           </button>
         </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex h-full items-center justify-center p-20 flex-1">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 flex-1">
             <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
               <Activity size={32} />
             </div>
             <h2 className="text-xl font-black text-slate-700 mb-2 tracking-tight">Ma'lumotlar mavjud emas</h2>
             <p className="text-slate-500 font-medium text-sm text-center max-w-sm leading-relaxed">
               Tanlangan filtrlar bo'yicha hech qanday operatsiya topilmadi.
             </p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 px-2">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">SANA / HUJJAT</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">TA'MINOTCHI</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">TAVSIF</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">TURI</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">MUDDAT</th>
                  <th className="px-6 py-4 text-right pr-6 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">SUMMA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-sans text-sm">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{new Date(t.date).toLocaleDateString('ru-RU')}</span>
                        <span className="text-[10px] font-black text-slate-400 mt-0.5 tracking-wider">#TX-{t.id.substring(t.id.length-6).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px] mr-3 uppercase">
                          {t.supplier?.name.substring(0,2) || '-'}
                        </div>
                        <span className="font-bold text-slate-700">{t.supplier?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium max-w-[200px] truncate">{t.description || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${t.type === 'DEBT' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-teal-50 text-teal-600 border border-teal-100'}`}>
                        {t.type === 'DEBT' ? 'QARZ' : 'TO\'LOV'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {t.dueDate ? (
                        <span className={`font-bold ${new Date(t.dueDate) < new Date() && t.type === 'DEBT' ? 'text-rose-500' : 'text-slate-600'}`}>
                          {new Date(t.dueDate).toLocaleDateString('ru-RU')}
                        </span>
                      ) : '-'}
                    </td>
                    <td className={`px-6 py-4 text-right pr-6 font-black text-base whitespace-nowrap ${t.type === 'DEBT' ? 'text-rose-600' : 'text-teal-600'}`}>
                      {t.type === 'DEBT' ? '-' : '+'}
                      {t.currency === 'USD' ? '$ ' : ''}
                      {t.amount.toLocaleString('ru-RU', { minimumFractionDigits: t.currency === 'USD' ? 2 : 0 })}
                      {t.currency === 'UZS' ? ' UZS' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50 sticky top-0">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Yangi operatsiya kiritish</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Ta'minotchi bilan hisob-kitobni ro'yxatga olish</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-lg shadow-sm border border-slate-100 transition">
                <X size={18} />
              </button>
            </div>
            
            <form id="transaction-form" onSubmit={handleAddTransaction} className="p-6 overflow-y-auto space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 border-l-2 border-indigo-500 pl-2">Ta'minotchini tanlang <span className="text-rose-500">*</span></label>
                  <select
                    required
                    value={newTransaction.supplierId}
                    onChange={(e) => setNewTransaction({...newTransaction, supplierId: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium appearance-none"
                  >
                    <option value="">-- Tanlash --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Balans: {s.balanceUSD < 0 ? `Qarz ${Math.abs(s.balanceUSD)} USD` : `${s.balanceUSD} USD`})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 border-l-2 border-indigo-500 pl-2">Operatsiya turi <span className="text-rose-500">*</span></label>
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setNewTransaction({...newTransaction, type: 'DEBT'})}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${newTransaction.type === 'DEBT' ? 'bg-white text-rose-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        QARZ OLISH
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTransaction({...newTransaction, type: 'PAYMENT'})}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${newTransaction.type === 'PAYMENT' ? 'bg-white text-teal-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        TO'LOV QILISH
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 border-l-2 border-indigo-500 pl-2">Valyuta <span className="text-rose-500">*</span></label>
                    <select
                      required
                      value={newTransaction.currency}
                      onChange={(e) => setNewTransaction({...newTransaction, currency: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium appearance-none"
                    >
                      <option value="USD">AQSH dollari (USD)</option>
                      <option value="UZS">So'm (UZS)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 border-l-2 border-indigo-500 pl-2">Summa <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all text-sm font-black text-slate-900"
                      placeholder="Masalan: 12500"
                    />
                  </div>
                  {newTransaction.type === 'DEBT' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 border-l-2 border-indigo-500 pl-2">Qaytarish muddati</label>
                      <input
                        type="date"
                        value={newTransaction.dueDate}
                        onChange={(e) => setNewTransaction({...newTransaction, dueDate: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 border-l-2 border-slate-300 pl-2 text-slate-500">Tavsif (ixtiyoriy)</label>
                  <textarea
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium min-h-[90px] resize-none"
                    placeholder="Bitim tafsilotlari yoki izohlar..."
                  />
                </div>
              </div>

            </form>
            
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                form="transaction-form"
                disabled={isSubmitting}
                className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 text-white text-sm font-bold rounded-xl transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : <Save size={16} className="mr-2" />}
                Tizimga saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
