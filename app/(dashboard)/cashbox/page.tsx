'use client';

import { useState, useEffect, useCallback } from 'react';
import { Banknote, ArrowUpRight, ArrowDownRight, Plus, X, Check, Search, Wallet, CreditCard, Building, ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useNotification } from '@/lib/NotificationContext';

type CashboxType = 'CASH' | 'CARD' | 'BANK';

const TYPE_CONFIG: Record<CashboxType, { label: string; icon: any; color: string; bg: string }> = {
  CASH: { label: 'Naqd pul', icon: Wallet, color: 'text-emerald-600', bg: 'from-emerald-500 to-emerald-700' },
  CARD: { label: 'Plastik karta', icon: CreditCard, color: 'text-blue-600', bg: 'from-blue-500 to-blue-700' },
  BANK: { label: 'Bank hisob', icon: Building, color: 'text-violet-600', bg: 'from-violet-500 to-violet-700' },
};

export default function CashboxPage() {
  const { t } = useLanguage();
  const { success, error } = useNotification();

  const [cashboxes, setCashboxes] = useState<any[]>([]);
  const [selectedCashbox, setSelectedCashbox] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [form, setForm] = useState({ amount: '', description: '', referenceId: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCashboxes = () => {
    fetch('/api/cashbox')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length === 0) {
          // Create default cashboxes
          return Promise.all([
            fetch('/api/cashbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Asosiy Kassa', type: 'CASH', currency: 'UZS' }) }),
            fetch('/api/cashbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Humo', type: 'CARD', currency: 'UZS' }) }),
            fetch('/api/cashbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Uzcard', type: 'CARD', currency: 'UZS' }) }),
            fetch('/api/cashbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Tranzit', type: 'BANK', currency: 'USD' }) }),
          ]);
        }
        return data;
      })
      .then(data => {
        if (Array.isArray(data)) setCashboxes(data);
        else setCashboxes(Array.isArray(data?.data) ? data.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCashboxes(); }, []);

  const loadTransactions = useCallback((cashboxId: string) => {
    fetch(`/api/cashbox/transactions?cashboxId=${cashboxId}&limit=50`)
      .then(r => r.json())
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleSelectCashbox = (cashbox: any) => {
    setSelectedCashbox(cashbox);
    loadTransactions(cashbox.id);
  };

  const handleAddTransaction = async () => {
    if (!selectedCashbox || !form.amount || Number(form.amount) <= 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/cashbox/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashboxId: selectedCashbox.id,
          type: addType,
          amount: Number(form.amount),
          description: form.description,
        }),
      });
      if (!res.ok) throw new Error();
      success(t('messages', 'saved'), addType === 'INCOME' ? 'Kiritildi' : 'Chiqarildi');
      setShowAddModal(false);
      setForm({ amount: '', description: '', referenceId: '' });
      loadCashboxes();
      if (selectedCashbox) loadTransactions(selectedCashbox.id);
    } catch {
      error(t('messages', 'error'), 'Tranzaksiya qo\'shishda xatolik');
    } finally { setSaving(false); }
  };

  const totalBalanceUSD = cashboxes.filter((c: any) => c.currency === 'USD').reduce((s: number, c: any) => s + c.balance, 0);
  const totalBalanceUZS = cashboxes.filter((c: any) => c.currency === 'UZS').reduce((s: number, c: any) => s + c.balance, 0);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-500">{t('common', 'loading')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans w-full h-full text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <Banknote className="text-amber-600" size={32} /> Kassa
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Pul mablag&apos;larini boshqarish</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 rounded-2xl text-white">
          <div className="text-xs font-bold text-emerald-100 uppercase tracking-wider mb-1">Jami USD</div>
          <div className="text-3xl font-black">${totalBalanceUSD.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-5 rounded-2xl text-white">
          <div className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1">Jami UZS</div>
          <div className="text-3xl font-black">{totalBalanceUZS.toLocaleString()} so&apos;m</div>
        </div>
      </div>

      {/* Cashbox Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {cashboxes.map((cb: any) => {
          const config = TYPE_CONFIG[cb.type as CashboxType] || TYPE_CONFIG.CASH;
          const Icon = config.icon;
          const isSelected = selectedCashbox?.id === cb.id;
          return (
            <button key={cb.id} onClick={() => handleSelectCashbox(cb)}
              className={`bg-white dark:bg-slate-800 rounded-2xl border-2 p-5 text-left transition-all ${isSelected ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center ${config.color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cb.currency}</span>
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">{cb.name}</div>
              <div className="font-black text-2xl text-slate-900 dark:text-white">
                {cb.currency === 'USD' ? '$' : ''}{cb.balance.toLocaleString()}{cb.currency === 'UZS' ? ' so\'m' : ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Transactions */}
      {selectedCashbox ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white">{selectedCashbox.name} — Tranzaksiyalar</h2>
              <p className="text-xs text-slate-500 mt-0.5">{(selectedCashbox as any).currency} hisobvarag&apos;i</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setAddType('INCOME'); setShowAddModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors">
                <ArrowDownRight size={16} /> Kiritish
              </button>
              <button onClick={() => { setAddType('EXPENSE'); setShowAddModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors">
                <ArrowUpRight size={16} /> Chiqarish
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                <ArrowRightLeft size={32} className="mb-3 opacity-30" />
                <p className="text-sm">Tranzaksiyalar yo&apos;q</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-black text-[10px] text-slate-500 uppercase">Tur</th>
                    <th className="px-6 py-3 font-black text-[10px] text-slate-500 uppercase">Summa</th>
                    <th className="px-6 py-3 font-black text-[10px] text-slate-500 uppercase">Izoh</th>
                    <th className="px-6 py-3 font-black text-[10px] text-slate-500 uppercase">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                          {tx.type === 'INCOME' ? 'Kirim' : 'Chiqim'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-black ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs">{tx.description || '-'}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(tx.date).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="text-center text-slate-400">
            <Banknote size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Kassa tanlang</p>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowAddModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {addType === 'INCOME' ? <ArrowDownRight size={18} className="text-emerald-500" /> : <ArrowUpRight size={18} className="text-red-500" />}
                {addType === 'INCOME' ? 'Kiritish' : 'Chiqqarish'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-sm">
                <span className="font-bold text-slate-500">Kassa:</span> <span className="font-bold text-slate-800 dark:text-white">{selectedCashbox?.name}</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Summa *</label>
                <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-white"
                  placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Izoh</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none resize-none text-slate-800 dark:text-white"
                  placeholder="Ixtiyoriy izoh..." rows={3} />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Bekor</button>
              <button onClick={handleAddTransaction} disabled={saving || !form.amount}
                className={`px-5 py-2.5 text-sm font-bold rounded-lg text-white flex items-center gap-2 disabled:opacity-50 ${addType === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                <Check size={14} /> {saving ? 'Saqlanmoqda...' : addType === 'INCOME' ? 'Kiritish' : 'Chiqqarish'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}