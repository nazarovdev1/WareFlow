'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { ClipboardCheck, Plus, ChevronDown, Check, Clock } from 'lucide-react';

export default function MobileInventoryAudit() {
  const [audits, setAudits] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [warehouses, setWarehouses] = useState<Record<string, unknown>[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/inventory-audit')
      .then(r => r.json())
      .then(d => { setAudits(Array.isArray(d) ? d : d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
    fetch('/api/warehouses')
      .then(r => r.json())
      .then(d => setWarehouses(Array.isArray(d) ? d : d.data || []))
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!selectedWarehouse) return;
    setSaving(true);
    try {
      const res = await fetch('/api/inventory-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warehouseId: selectedWarehouse }),
      });
      if (res.ok) {
        const newAudit = await res.json();
        setAudits([newAudit, ...audits]);
        setShowNew(false);
      }
    } catch {}
    setSaving(false);
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    IN_PROGRESS: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    COMPLETED: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    CANCELLED: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'Kutilmoqda',
    IN_PROGRESS: 'Jarayonda',
    COMPLETED: 'Tugallangan',
    CANCELLED: 'Bekor qilingan',
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader title="Inventarizatsiya" backHref="/mobile"
        rightAction={
          <button onClick={() => setShowNew(true)} className="p-2.5 bg-teal-600 text-white rounded-full shadow-lg shadow-teal-500/30 active:scale-95 transition-transform">
            <Plus size={20} />
          </button>
        }
      />

      {/* New Audit Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]" onClick={() => setShowNew(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Yangi audit sessiya</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Omborni tanlang</label>
                <div className="relative">
                  <select value={selectedWarehouse} onChange={e => setSelectedWarehouse(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm appearance-none">
                    <option value="">Tanlang...</option>
                    {warehouses.map((w: Record<string, unknown>) => (
                      <option key={String(w.id)} value={String(w.id)}>{String(w.name)}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowNew(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm">Bekor</button>
                <button onClick={handleCreate} disabled={saving || !selectedWarehouse}
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-transform disabled:opacity-50">
                  {saving ? 'Yaratilmoq...' : 'Yaratish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 mt-2 space-y-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : audits.length > 0 ? audits.map((audit) => {
          const status = String(audit.status || 'PENDING');
          return (
            <div key={String(audit.id)} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{String(audit.warehouseName || 'Ombor')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {String(audit.createdAt ? new Date(String(audit.createdAt)).toLocaleDateString('uz') : '-')}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusColors[status] || statusColors.PENDING}`}>
                  {statusLabels[status] || status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ClipboardCheck size={12} />
                  <span>{String(audit.totalItems || 0)} mahsulot</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Check size={12} className="text-emerald-500" />
                  <span>{String(audit.countedItems || 0)} sanalgan</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock size={12} />
                  <span>{String(audit.discrepancies || 0)} farq</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-16 text-slate-400">
            <ClipboardCheck size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Audit sessiyalari yo{'\u2019'}q</p>
            <p className="text-xs mt-1">Yangi audit boshlash uchun + tugmasini bosing</p>
          </div>
        )}
      </div>
    </div>
  );
}
