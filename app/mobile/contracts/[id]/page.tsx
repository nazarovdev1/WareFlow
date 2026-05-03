'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FileText, DollarSign, Calendar, Building } from 'lucide-react';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileContractDetail() {
  const { error } = useNotification();
  const params = useParams();
  const [contract, setContract] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/contracts/${params.id}`)
        .then(r => r.json())
        .then(d => { setContract(d); setLoading(false); })
        .catch(() => { error('Xatolik', 'Shartnoma ma\'lumotlarini yuklashda xato'); setLoading(false); });
    }
  }, [params.id]);

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    EXPIRED: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    PENDING: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Faol',
    EXPIRED: 'Muddati o\u2019tgan',
    PENDING: 'Kutilmoqda',
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Shartnoma" backHref="/mobile/contracts" />
        <div className="px-6 mt-4 space-y-4">
          <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />
          <div className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />
          <div className="h-40 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Shartnoma" backHref="/mobile/contracts" />
        <div className="px-6 mt-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileText size={28} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">Shartnoma topilmadi</h2>
          <p className="text-sm text-slate-500 mb-6">Bu shartnoma mavjud emas yoki o'chirilgan</p>
          <a href="/mobile/contracts" className="inline-flex px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl active:scale-95 transition-transform">
            Orqaga qaytish
          </a>
        </div>
      </div>
    );
  }

  const status = String(contract.status || 'PENDING');

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title={String(contract.title || contract.contractNumber || 'Shartnoma')} backHref="/mobile/contracts" />

      <div className="px-6 mt-2 space-y-4">
        {/* Status & Amount */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-lg font-black text-slate-900 dark:text-white">{String(contract.title || contract.contractNumber || '-')}</p>
              <p className="text-[11px] text-slate-500 mt-1">{`Shartnoma №${String(contract.contractNumber || '-')}`}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${statusColors[status] || statusColors.PENDING}`}>
              {statusLabels[status] || status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-500" />
            <span className="text-2xl font-black text-slate-900 dark:text-white">${Number(contract.amount || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-slate-400" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Boshlanish</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{String(contract.startDate ? new Date(String(contract.startDate)).toLocaleDateString('uz') : '-')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-slate-400" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Tugash</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{String(contract.endDate ? new Date(String(contract.endDate)).toLocaleDateString('uz') : '-')}</p>
            </div>
          </div>
          {!!contract.supplier && (
            <div className="flex items-center gap-3">
              <Building size={16} className="text-slate-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Ta\u2019minotchi</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{String((contract.supplier as Record<string, unknown>)?.name || contract.supplierId || '-')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {contract.description ? (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Tavsif</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{String(contract.description)}</p>
          </div>
        ) : null}

        {/* Attachments */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">Ilovalar</p>
          <div className="text-center py-6 text-slate-400">
            <FileText size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Ilovalar yo\u2019q</p>
          </div>
        </div>
      </div>
    </div>
  );
}
