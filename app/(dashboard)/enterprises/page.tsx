'use client';

import { Building2, Factory, Store, Construction } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function EnterprisesPage() {
  const { t } = useLanguage();

  return (
    <div className="p-6 font-sans w-full h-full text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Building2 className="text-blue-600 dark:text-blue-400" size={28} />
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Korxonalar</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Korxona va filiallarni boshqarish</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
          <Construction size={40} className="text-blue-500 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">Tez kunda!</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md text-center leading-relaxed">
          Korxonalar moduli ishlab chiqilmoqda. Bu yerda korxona, filial va do&apos;konlaringizni boshqarish imkoniyati bo&apos;ladi.
        </p>
        <div className="flex gap-4 mt-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <Building2 size={18} className="text-blue-500" />
            <span className="text-sm font-medium">Bosh ofis</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <Factory size={18} className="text-indigo-500" />
            <span className="text-sm font-medium">Filiallar</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <Store size={18} className="text-teal-500" />
            <span className="text-sm font-medium">Do&apos;konlar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
