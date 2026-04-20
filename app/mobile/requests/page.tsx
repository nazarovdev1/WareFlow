'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, Clock, Shield, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';
import { AdminGuard } from '@/components/mobile/PermissionGuard';

export default function MobileRequestsPage() {
  const { success, error } = useNotification();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [actionForm, setActionForm] = useState({ role: 'STAFF', warehouseId: '', note: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/register/requests?status=${statusFilter}`).then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
    ]).then(([rData, wData]) => {
      setRequests(rData.data || rData || []);
      setWarehouses(wData.data || wData || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [statusFilter]);

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    if (!selectedReq) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/register/requests/${selectedReq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, role: actionForm.role, warehouseId: actionForm.warehouseId || undefined, adminNote: actionForm.note }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', action === 'APPROVED' ? "So'rov tasdiqlandi" : "So'rov rad etildi");
        setSelectedReq(null);
        const rData = await fetch(`/api/register/requests?status=${statusFilter}`).then(r => r.json());
        setRequests(rData.data || rData || []);
      } else {
        error('Xatolik', 'Amaliyot bajarilmadi');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setProcessing(false);
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <AdminGuard>
      <div className="w-full min-h-screen pb-28">
        <MobileHeader 
          title="So'rovlar" 
          backHref="/mobile" 
          rightAction={
            pendingCount > 0 ? (
              <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full">{pendingCount}</span>
            ) : null
          } 
        />

        <div className="px-6 mb-5 mt-2 flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${statusFilter === s ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200/60 dark:border-slate-800'}`}>
              {s === 'PENDING' ? 'Kutilmoqda' : s === 'APPROVED' ? 'Tasdiqlangan' : s === 'REJECTED' ? 'Rad etilgan' : 'Hammasi'}
            </button>
          ))}
        </div>

        <div className="px-6 space-y-3">
          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
          ) : requests.length > 0 ? (
            requests.map(req => (
              <div key={req.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
                    <UserPlus size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-800 dark:text-white">{req.name || req.email}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{req.email}</div>
                    {req.phone && <div className="text-[10px] text-slate-400">{req.phone}</div>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                        req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                      }`}>
                        {req.status === 'PENDING' ? 'Kutilmoqda' : req.status === 'APPROVED' ? 'Tasdiqlangan' : 'Rad etilgan'}
                      </span>
                    </div>
                  </div>
                </div>
                {req.status === 'PENDING' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={() => { setSelectedReq(req); setActionForm({ role: 'STAFF', warehouseId: '', note: '' }); }}
                      className="flex-1 py-2.5 bg-emerald-600 text-white text-[11px] font-black rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1">
                      <Check size={14} /> Tasdiqlash
                    </button>
                    <button onClick={() => { setSelectedReq(req); setActionForm({ role: 'STAFF', warehouseId: '', note: '' }); }}
                      className="py-2.5 px-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-black rounded-xl active:scale-95 transition-transform flex items-center gap-1">
                      <X size={14} /> Rad
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <UserPlus size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">So'rovlar yo'q</p>
            </div>
          )}
        </div>

        {/* Action Modal */}
        {selectedReq && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center px-6">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{selectedReq.name || selectedReq.email}</h3>
              <p className="text-[11px] text-slate-400 mb-5">{selectedReq.email}</p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">Rol</label>
                  <select value={actionForm.role} onChange={e => setActionForm({ ...actionForm, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                    <option value="STAFF">Xodim</option>
                    <option value="MANAGER">Boshqaruvchi</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">Ombor</label>
                  <select value={actionForm.warehouseId} onChange={e => setActionForm({ ...actionForm, warehouseId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                    <option value="">Tanlanmagan</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">Izoh</label>
                  <input type="text" value={actionForm.note} onChange={e => setActionForm({ ...actionForm, note: e.target.value })}
                    placeholder="Izoh yozing..."
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setSelectedReq(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[12px] rounded-2xl active:scale-95 transition-transform">Bekor</button>
                <button onClick={() => handleAction('REJECTED')} disabled={processing}
                  className="py-3 px-4 bg-rose-600 text-white font-black text-[12px] rounded-2xl active:scale-95 transition-transform disabled:opacity-50">Rad etish</button>
                <button onClick={() => handleAction('APPROVED')} disabled={processing}
                  className="flex-1 py-3 bg-emerald-600 text-white font-black text-[12px] rounded-2xl active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-1">
                  <Check size={14} /> Tasdiqlash
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}