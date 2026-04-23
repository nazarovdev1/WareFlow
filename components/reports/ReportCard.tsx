'use client';

interface ReportCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose';
}

const colors = {
  emerald: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400',
  violet: 'bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400',
  amber: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400',
};

export function ReportCard({ title, value, change, icon, color = 'emerald' }: ReportCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-md">
      <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          {title}
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white">
          {value}
        </div>
        {change !== undefined && (
          <div className={`text-sm mt-0.5 ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {change >= 0 ? '+' : ''}{change}% oldingi davrga nisbatan
          </div>
        )}
      </div>
    </div>
  );
}