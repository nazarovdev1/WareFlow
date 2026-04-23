'use client';

import Link from 'next/link';
import { FileBarChart, TrendingUp, PieChart, BarChart3, DollarSign, Users, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const reportTypes = [
  {
    title: 'Savdo Hisobotlari',
    description: 'Savdo tahlillari, kunlik/haftalik/oylik savdolar, top mahsulotlar',
    icon: TrendingUp,
    href: '/reports/sales',
    color: 'emerald',
  },
  {
    title: 'Ombor Hisobotlari',
    description: 'Ombor holati, qoldiq mahsulotlar, o\'zgarishlar tarixi',
    icon: PieChart,
    href: '/reports/inventory',
    color: 'blue',
  },
  {
    title: 'Moliyaviy Hisobotlar',
    description: 'Pul aylanmasi, tushumlar, xarajatlar, kassa balansi',
    icon: DollarSign,
    href: '/reports/financial',
    color: 'violet',
  },
  {
    title: 'Qarzlar Hisobotlari',
    description: 'Mijoz qarzlari, ta\'minotchilar balansi, qarzdorlar ro\'yxati',
    icon: Users,
    href: '/reports/debts',
    color: 'amber',
  },
  {
    title: 'Xarid Hisobotlari',
    description: 'Xarid tahlillari, ta\'minotchilar bo\'yicha xaridlar',
    icon: ShoppingBag,
    href: '/reports/purchases',
    color: 'rose',
  },
];

const colorClasses = {
  emerald: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
  blue: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
  violet: 'bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/30',
  amber: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  rose: 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
};

const hoverColorClasses = {
  emerald: 'hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10',
  blue: 'hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10',
  violet: 'hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-500/10',
  amber: 'hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-500/10',
  rose: 'hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-500/10',
};

export default function ReportsPage() {
  const { t } = useLanguage();

  return (
    <div className="p-6 font-sans w-full h-full text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <FileBarChart className="text-teal-600 dark:text-teal-400" size={28} />
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Hisobotlar</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Statistika va tahlillar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportTypes.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className={`group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${hoverColorClasses[report.color as keyof typeof hoverColorClasses]}`}
          >
            <div className={`w-14 h-14 ${colorClasses[report.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center mb-4`}>
              <report.icon size={26} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{report.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{report.description}</p>
            <div className={`flex items-center gap-2 text-sm font-medium text-${report.color}-600 dark:text-${report.color}-400 opacity-0 group-hover:opacity-100 transition-opacity`}>
              <span>Ko&apos;rish</span>
              <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Real-time yangilanishlar</h3>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Server-Sent Events (SSE) orqali real-time yangilanishlar yoqilgan</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Export imkoniyati</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Har bir hisobot sahifasidan Excel yoki PDF formatida ma&apos;lumotlarni yuklab olishingiz mumkin</p>
        </div>
      </div>
    </div>
  );
}