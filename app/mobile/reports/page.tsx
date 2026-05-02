'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { BarChart3, TrendingUp, PieChart, DollarSign, Users, ShoppingBag, Building, Wrench, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const reportTypes = [
  { title: 'Savdo Hisobotlari', desc: 'Savdo tahlillari, top mahsulotlar', icon: TrendingUp, href: '/mobile/reports/sales', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
  { title: 'Ombor Hisobotlari', desc: 'Qoldiq mahsulotlar, o\'zgarishlar', icon: PieChart, href: '/mobile/reports/inventory', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
  { title: 'Moliyaviy Hisobotlar', desc: 'Tushumlar, xarajatlar, kassa', icon: DollarSign, href: '/mobile/reports/financial', color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20' },
  { title: 'Qarzlar Hisobotlari', desc: 'Mijoz qarzlari, qarzdorlar', icon: Users, href: '/mobile/reports/debts', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
  { title: 'Xarid Hisobotlari', desc: 'Xarid tahlillari, ta\'minotchilar', icon: ShoppingBag, href: '/mobile/reports/purchases', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' },
  { title: 'Foyda va Zarar', desc: 'Daromad va xarajatlar farqi', icon: TrendingUp, href: '/mobile/reports/profit-loss', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' },
  { title: 'Filial Hisoboti', desc: 'Filiallar bo\'yicha tahlil', icon: Building, href: '/mobile/reports/branch', color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20' },
  { title: 'Hisobot Yaratish', desc: 'Maxsus hisobot yaratish', icon: Wrench, href: '/mobile/reports/builder', color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20' },
];

export default function MobileReportsHub() {
  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Hisobotlar" backHref="/mobile" />

      <div className="px-6 mt-2 space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Hisobotlar markazi</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Statistika va tahlillar</p>
          </div>
        </div>

        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Link key={report.href} href={report.href}
              className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${report.color}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-900 dark:text-white">{report.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{report.desc}</p>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
