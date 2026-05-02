'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, Database } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useNotification } from '@/lib/NotificationContext';

interface SyncLog {
  id: string;
  type: string;
  status: string;
  recordsProcessed?: number;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export default function Mobile1CSyncPage() {
  const { success, error } = useNotification();
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [, setLoading] = useState(true);
  const [config, setConfig] = useState({
    apiUrl: '',
    apiKey: '',
    autoSync: false,
    syncInterval: '30',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, lRes] = await Promise.all([
        fetch('/api/1c-config'),
        fetch('/api/1c-sync'),
      ]);
      if (cRes.ok) {
        const data = await cRes.json();
        if (data) {
          setConfig({
            apiUrl: data.apiUrl || '',
            apiKey: data.apiKey || '',
            autoSync: data.autoSync || false,
            syncInterval: String(data.syncInterval || 30),
          });
        }
      }
      if (lRes.ok) {
        const data = await lRes.json();
        setLogs(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (type: string) => {
    setSyncing(true);
    try {
      const res = await fetch('/api/1c-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', `1C sinxronizatsiya boshlandi: ${type}`);
        loadData();
      } else {
        error('Xatolik', 'Sinxronizatsiyani boshlashda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/1c-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', '1C sozlamalari saqlandi');
      } else {
        error('Xatolik', 'Sozlamalarni saqlashda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const syncTypes = [
    { type: 'products', label: 'Mahsulotlar', icon: '📦' },
    { type: 'customers', label: 'Mijozlar', icon: '👥' },
    { type: 'orders', label: 'Buyurtmalar', icon: '🛒' },
    { type: 'inventory', label: 'Ombor', icon: '🏭' },
    { type: 'full', label: `To\u2019liq sinxronizatsiya`, icon: '🔄' },
  ];

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="1C sinxronizatsiya"
        backHref="/mobile"
      />

      <div className="px-4 space-y-4">
        {/* Config */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">1C ulanish</h3>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">API URL</label>
            <input
              type="url"
              placeholder="http://1c-server/api"
              value={config.apiUrl}
              onChange={e => setConfig({ ...config, apiUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">API Kalit</label>
            <input
              type="password"
              placeholder="API kalit kiriting"
              value={config.apiKey}
              onChange={e => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 dark:text-white">Avtomatik sinxronizatsiya</span>
            <button
              onClick={() => setConfig({ ...config, autoSync: !config.autoSync })}
              className={`w-12 h-7 rounded-full transition-colors ${config.autoSync ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${config.autoSync ? 'translate-x-6.5' : 'translate-x-1'}`} />
            </button>
          </div>
          <button
            onClick={handleSaveConfig}
            className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm active:scale-[0.98] transition-transform"
          >
            Sozlamalarni saqlash
          </button>
        </div>

        {/* Sync Buttons */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Sinxronizatsiya</h3>
          <div className="space-y-2">
            {syncTypes.map(st => (
              <button
                key={st.type}
                onClick={() => handleSync(st.type)}
                disabled={syncing}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                <span className="text-lg">{st.icon}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white flex-1 text-left">{st.label}</span>
                <RefreshCw size={16} className={`text-indigo-600 dark:text-indigo-400 ${syncing ? 'animate-spin' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Sync Logs */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Sinxronizatsiya jurnali</h3>
          {logs.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Database size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">{`Hali sinxronizatsiya yo\u2019q`}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 10).map(log => (
                <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  {log.status === 'completed' ? (
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                  ) : log.status === 'failed' ? (
                    <XCircle size={16} className="text-rose-500 shrink-0" />
                  ) : (
                    <Clock size={16} className="text-amber-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-white">{log.type}</div>
                    {log.recordsProcessed !== undefined && (
                      <div className="text-[10px] text-slate-500">{log.recordsProcessed} yozuv</div>
                    )}
                    {log.error && (
                      <div className="text-[10px] text-rose-500 truncate">{log.error}</div>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.startedAt).toLocaleString('uz-UZ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
