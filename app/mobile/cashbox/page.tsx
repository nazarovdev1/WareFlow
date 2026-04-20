'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Wallet, Plus, Minus, ArrowUpRight, ArrowDownRight, CreditCard, Building2, X } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileCashboxPage() {
  const { success, error } = useNotification();
  const [cashboxes, setCashboxes] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [formAmount, setFormAmount] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/cashbox')
      .then(r => r.json())
      .then(data => {
        const boxes = data.data || data || [];
        setCashboxes(boxes);
        if (boxes.length === 0) initDefaults();
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedBox) {
      fetch(`/api/cashbox/transactions?cashboxId=${selectedBox}&limit=30`)
        .then(r => r.json())
        .then(data => setTransactions(data.data || data || []))
        .catch(() => {});
    }
  }, [selectedBox]);

  const initDefaults = async () => {
    const defaults = [
      { name: 'Asosiy Kassa', type: 'CASH', currency: 'USD' },
      { name: 'Humo', type: 'CARD', currency: 'UZS' },
      { name: 'Uzcard', type: 'CARD', currency: 'UZS' },
      { name: 'Tranzit', type: 'BANK', currency: 'USD' },
    ];
    for (const d of defaults) {
      await fetch('/api/cashbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
    }
    const r = await fetch('/api/cashbox');
    const data = await r.json();
    setCashboxes(data.data || data || []);
  };

  const totalUSD = cashboxes.filter(b => b.currency === 'USD').reduce((s, b) => s + (b.balance || 0), 0);
  const totalUZS = cashboxes.filter(b => b.currency === 'UZS').reduce((s, b) => s + (b.balance || 0), 0);

  const handleSubmit = async () => {
    if (!selectedBox || !formAmount || Number(formAmount) <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/cashbox/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashboxId: selectedBox,
          type: modalType,
          amount: Number(formAmount),
          description: formDesc || undefined,
        }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', modalType === 'INCOME' ? 'Kirim amalga oshirildi' : 'Chiqim amalga oshirildi');
        setShowModal(false);
        setFormAmount('');
        setFormDesc('');
        const r = await fetch('/api/cashbox');
        const d = await r.json();
        setCashboxes(d.data || d || []);
        const tr = await fetch(`/api/cashbox/transactions?cashboxId=${selectedBox}&limit=30`);
        setTransactions((await tr.json()).data || []);
      } else {
        error('Xatolik', 'Amaliyot bajarilmadi');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSubmitting(false);
  };

  const getBoxIcon = (type: string) => {
    if (type === 'CARD') return CreditCard;
    if (type === 'BANK') return Building2;
    return Wallet;
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Kassa" backHref="/mobile" />

      {/* Total Balance */}
      <div className="px-6 mb-6 mt-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm text-slate-900 dark:text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Umumiy balans</div>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-3xl font-black">${totalUSD.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">USD</div>
              </div>
              <div className="pb-1">
                <div className="text-xl font-black">{totalUZS.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">UZS</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cashbox Cards */}
      <div className="px-6 mb-6">
        <h2 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 px-1">Hisob raqamlar</h2>
        <div className="space-y-3">
          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
          ) : (
            cashboxes.map(box => {
              const Icon = getBoxIcon(box.type);
              const isSelected = selectedBox === box.id;
              return (
                <button key={box.id} onClick={() => setSelectedBox(isSelected ? null : box.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      box.type === 'CASH' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      box.type === 'CARD' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="text-left">
                      <div className="text-[12px] font-bold text-slate-800 dark:text-white">{box.name}</div>
                      <div className="text-[10px] text-slate-400">{box.type} · {box.currency}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-base font-black ${box.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
                      {box.currency === 'USD' ? '$' : ''}{Number(box.balance).toLocaleString()}{box.currency === 'UZS' ? " so'm" : ''}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Transactions */}
      {selectedBox && (
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 px-1">Tranzaksiyalar</h2>
            <div className="flex gap-2">
              <button onClick={() => { setModalType('INCOME'); setShowModal(true); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-xl active:scale-95 transition-transform">
                <ArrowUpRight size={12} /> Kirim
              </button>
              <button onClick={() => { setModalType('EXPENSE'); setShowModal(true); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-[10px] font-black rounded-xl active:scale-95 transition-transform">
                <ArrowDownRight size={12} /> Chiqim
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            {transactions.length > 0 ? transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    tx.type === 'INCOME' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {tx.type === 'INCOME' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-slate-800 dark:text-white">{tx.description || (tx.type === 'INCOME' ? 'Kirim' : 'Chiqim')}</div>
                    <div className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                <span className={`text-[13px] font-black ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                </span>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 text-xs font-medium">Tranzaksiyalar yo'q</div>
            )}
          </div>
        </div>
      )}

      {/* Income/Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center px-6" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-5">
              {modalType === 'INCOME' ? 'Kirim' : 'Chiqim'} qo'shish
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Summa</label>
                <input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-lg font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Izoh</label>
                <input type="text" value={formDesc} onChange={e => setFormDesc(e.target.value)}
                  placeholder="Izoh yozing..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[12px] rounded-2xl active:scale-95 transition-transform">
                Bekor
              </button>
              <button onClick={handleSubmit} disabled={submitting || !formAmount}
                className={`flex-1 py-3.5 font-black text-[12px] rounded-2xl active:scale-95 transition-transform disabled:opacity-50 text-white ${modalType === 'INCOME' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                {submitting ? 'Yuborilmoqda...' : modalType === 'INCOME' ? 'Kirim qilish' : 'Chiqim qilish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}