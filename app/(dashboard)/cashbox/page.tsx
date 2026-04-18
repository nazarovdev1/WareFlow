'use client';

import { Banknote, ArrowRightLeft, CreditCard, Wallet, Construction } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CashboxPage() {
  const { t } = useLanguage();

  return (
    <div className="p-6 font-sans w-full h-full text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Banknote className="text-amber-600 dark:text-amber-400" size={28} />
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Kassa</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Pul mablag&apos;larini boshqarish</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
          <Construction size={40} className="text-amber-500 dark:text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">Tez kunda!</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md text-center leading-relaxed">
          Kassa moduli ishlab chiqilmoqda. Bu yerda naqd pul, plastik karta va bank hisoblarini boshqarish imkoniyati bo&apos;ladi.
        </p>
        <div className="flex gap-4 mt-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <Wallet size={18} className="text-emerald-500" />
            <span className="text-sm font-medium">Naqd pul</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <CreditCard size={18} className="text-blue-500" />
            <span className="text-sm font-medium">Plastik karta</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <ArrowRightLeft size={18} className="text-purple-500" />
            <span className="text-sm font-medium">O&apos;tkazmalar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
