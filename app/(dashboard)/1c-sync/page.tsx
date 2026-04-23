'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Settings, CheckCircle, XCircle, Clock, History, Server, AlertTriangle } from 'lucide-react';
import { useNotification } from '@/lib/NotificationContext';

interface SyncLog {
  id: string;
  entityType: string;
  action: string;
  status: 'PENDING' | 'SYNCING' | 'COMPLETED' | 'FAILED';
  payload?: string;
  response?: string;
  error?: string;
  syncedAt?: string;
  createdAt: string;
}

interface OneCConfig {
  id: string;
  apiUrl: string;
  apiKey: string;
  isActive: boolean;
  syncInterval?: number;
  lastSyncAt?: string;
}

const entityLabels: Record<string, string> = {
  orders: 'Buyurtmalar',
  purchases: 'Xaridlar',
  customers: 'Mijozlar',
  products: 'Mahsulotlar',
  stock: 'Ombor',
  cashbox: 'Kassa',
};

export default function OneCSyncPage() {
  const { success, error, warning } = useNotification();

  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [config, setConfig] = useState<OneCConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState<string[]>(['orders', 'customers', 'products']);
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState({
    apiUrl: '',
    apiKey: '',
    syncInterval: 60,
  });

  useEffect(() => {
    loadConfig();
    loadLogs();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/1c-config');
      if (res.ok) {
        const data = await res.json();
        if (data?.config) {
          setConfig(data.config);
          setConfigForm({
            apiUrl: data.config.apiUrl || '',
            apiKey: data.config.apiKey || '',
            syncInterval: data.config.syncInterval || 60,
          });
        }
      }
    } catch (_err) {
      console.error('Failed to load config:', _err);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/1c-sync?page=1&limit=20');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
      }
    } catch (_err) {
      console.error('Failed to load logs:', _err);
    }
 finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!config?.isActive) {
      warning('Diqqat', '1C integratsiyasi faol emas');
      return;
    }

    setSyncing(true);
    try {
      const res = await fetch('/api/1c-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityTypes: selectedEntities }),
      });

      const data = await res.json();

      if (res.ok) {
        interface SyncResult {
          status: string;
          entityType: string;
          logId: string;
          error?: string;
        }
        const completed = data.results?.filter((r: SyncResult) => r.status === 'COMPLETED').length || 0;
        const failed = data.results?.filter((r: SyncResult) => r.status === 'FAILED').length || 0;

        if (failed === 0) {
          success('Muvaffaqiyatli', `${completed} ta obyekt sinxronizatsiya qilindi`);
        } else {
          warning('Qisman muvaffaqiyatli', `${completed} ta muvaffaqiyatli, ${failed} ta xatolik`);
        }

        loadLogs();
        loadConfig();
      } else {
        error('Xatolik', data.error || 'Sinxronizatsiya xatosi');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!configForm.apiUrl || !configForm.apiKey) {
      error('Xatolik', 'API URL va Key kiritilishi shart');
      return;
    }

    try {
      const res = await fetch('/api/1c-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Konfiguratsiya saqlandi');
        setShowConfig(false);
        loadConfig();
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Saqlashda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const toggleEntity = (entity: string) => {
    setSelectedEntities(prev =>
      prev.includes(entity)
        ? prev.filter(e => e !== entity)
        : [...prev, entity]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full"><CheckCircle size={12} /> Muvaffaqiyatli</span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full"><XCircle size={12} /> Xatolik</span>;
      case 'SYNCING':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full"><RefreshCw size={12} className="animate-spin" /> Jarayonda</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-full"><Clock size={12} /> Kutilmoqda</span>;
    }
  };

  const stats = {
    total: logs.length,
    completed: logs.filter(l => l.status === 'COMPLETED').length,
    failed: logs.filter(l => l.status === 'FAILED').length,
    successRate: logs.length > 0 ? Math.round((logs.filter(l => l.status === 'COMPLETED').length / logs.length) * 100) : 0,
  };

  return (
    <div className="w-full min-h-screen pb-12 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Server className="text-white" size={24} />
              </div>
              1C Buxgalteriya Integratsiyasi
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-1">
              WareFlow ma&apos;lumotlarini 1C bilan ikki tomonlama sinxronizatsiya qilish
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfig(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all active:scale-95"
            >
              <Settings size={18} />
              Sozlamalar
            </button>
            <button
              onClick={handleSync}
              disabled={syncing || !config?.isActive}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sinxronizatsiyalanmoqda...' : 'Sinxronizatsiya qilish'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-500/5 rounded-full transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <History size={24} />
              </div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami sinxronizatsiyalar</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.total}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-500/5 rounded-full transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckCircle size={24} />
              </div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Muvaffaqiyatli</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.completed}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 dark:bg-rose-500/5 rounded-full transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                <XCircle size={24} />
              </div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Xatoliklar</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.failed}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 dark:bg-amber-500/5 rounded-full transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                <Server size={24} />
              </div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Muvaffaqiyat foizi</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.successRate}%</div>
            </div>
          </div>
        </div>

        {!config?.isActive && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 shadow-inner">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-1">1C integratsiyasi faol emas</h4>
                <p className="text-sm text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                  Tizimni 1C bilan bog&apos;lash uchun sozlamalar bo&apos;limiga o&apos;ting va API URL hamda Maxfiy kalitni (Key) kiriting. Shundan so&apos;ng integratsiyani faollashtirishingiz mumkin.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Sinxronizatsiya tarixi</h2>
            <div className="text-[11px] font-bold text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              Oxirgi 20 ta amal
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center">
              <RefreshCw className="mx-auto mb-4 text-indigo-500 animate-spin" size={32} />
              <div className="text-slate-400 font-medium">Ma&apos;lumotlar yuklanmoqda...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <History size={40} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">Hali sinxronizatsiyalar mavjud emas</p>
              <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">1C bilan ma&apos;lumot almashishni boshlash uchun yuqoridagi tugmani bosing.</p>
              <button
                onClick={handleSync}
                disabled={!config?.isActive}
                className="px-6 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all disabled:opacity-50"
              >
                Birinchi sinxronizatsiyani boshlash
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {logs.map((log) => (
                <div key={log.id} className="px-8 py-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                        log.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                        log.status === 'FAILED' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' :
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      }`}>
                        <Server size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {entityLabels[log.entityType] || log.entityType}
                          </span>
                          {getStatusBadge(log.status)}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(log.createdAt).toLocaleString('uz-UZ')}
                          </div>
                          {log.syncedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle size={12} className="text-emerald-500" />
                              Sinxronlandi: {new Date(log.syncedAt).toLocaleString('uz-UZ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {log.error && (
                      <div className="hidden md:block max-w-xs truncate p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-900/30">
                        <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">{log.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings size={20} className="text-indigo-600" />
                1C Konfiguratsiyasi
              </h3>
              <button
                onClick={() => setShowConfig(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">API URL *</label>
                <input
                  type="url"
                  value={configForm.apiUrl}
                  onChange={e => setConfigForm({ ...configForm, apiUrl: e.target.value })}
                  placeholder="https://your-1c-server.com/api"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">API Key *</label>
                <input
                  type="password"
                  value={configForm.apiKey}
                  onChange={e => setConfigForm({ ...configForm, apiKey: e.target.value })}
                  placeholder="your-api-key-here"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Sinxronizatsiya intervali (daqiqa)</label>
                <input
                  type="number"
                  value={configForm.syncInterval}
                  onChange={e => setConfigForm({ ...configForm, syncInterval: parseInt(e.target.value) || 60 })}
                  min="5"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Sinxronizatsiya qilinadigan obyektlar</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(entityLabels).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleEntity(key)}
                      className={`px-3 py-2 text-xs font-bold rounded-lg text-left transition-colors ${
                        selectedEntities.includes(key)
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-300 dark:border-indigo-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-transparent'
                      }`}
                    >
                      {selectedEntities.includes(key) && <CheckCircle size={12} className="inline mr-1" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor
              </button>
              <button
                onClick={handleSaveConfig}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
