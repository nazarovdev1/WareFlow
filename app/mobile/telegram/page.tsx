'use client';

import { useState, useEffect } from 'react';
import { Bot, Send, Settings, CheckCircle, XCircle } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useNotification } from '@/lib/NotificationContext';

interface TelegramConfig {
  botToken?: string;
  webhookUrl?: string;
  isActive: boolean;
  chatId?: string;
  lastSyncAt?: string;
}

export default function MobileTelegramPage() {
  const { success, error } = useNotification();
  const [config, setConfig] = useState<TelegramConfig>({ isActive: false });
  const [, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webhooks');
      if (res.ok) {
        const data = await res.json();
        setConfig(data.telegram || { isActive: false });
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'telegram', ...config }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Telegram bot sozlamalari saqlandi');
      } else {
        error('Xatolik', 'Sozlamalarni saqlashda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'telegram_test', ...config }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Test xabari yuborildi');
      } else {
        error('Xatolik', 'Test xabarini yuborishda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Telegram bot"
        backHref="/mobile"
      />

      <div className="px-4 space-y-4">
        {/* Status */}
        <div className={`p-4 rounded-2xl shadow-sm border ${config.isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
          <div className="flex items-center gap-3">
            {config.isActive ? (
              <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle size={24} className="text-slate-400" />
            )}
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {config.isActive ? 'Bot faol' : 'Bot nofaol'}
              </div>
              <div className="text-xs text-slate-500">
                {config.lastSyncAt
                  ? `So\u2019nggi sinxronizatsiya: ${new Date(config.lastSyncAt).toLocaleString('uz-UZ')}`
                  : 'Sinxronizatsiya yo\u2019q'}
              </div>
            </div>
          </div>
        </div>

        {/* Bot Token */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Bot Token</label>
          <input
            type="password"
            placeholder="123456:ABC-DEF..."
            value={config.botToken || ''}
            onChange={e => setConfig({ ...config, botToken: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white font-mono"
          />
        </div>

        {/* Webhook URL */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Webhook URL</label>
          <input
            type="url"
            placeholder="https://example.com/api/webhooks"
            value={config.webhookUrl || ''}
            onChange={e => setConfig({ ...config, webhookUrl: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
          />
        </div>

        {/* Chat ID */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Chat ID</label>
          <input
            type="text"
            placeholder="-1001234567890"
            value={config.chatId || ''}
            onChange={e => setConfig({ ...config, chatId: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white font-mono"
          />
        </div>

        {/* Active Toggle */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-800 dark:text-white">Botni yoqish</span>
            </div>
            <button
              onClick={() => setConfig({ ...config, isActive: !config.isActive })}
              className={`w-12 h-7 rounded-full transition-colors ${config.isActive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${config.isActive ? 'translate-x-[26px]' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleTest}
            disabled={testing || !config.botToken}
            className="w-full py-3 bg-sky-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <Send size={18} />
            {testing ? 'Yuborilmoqda...' : 'Test xabari yuborish'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <Bot size={18} />
            {saving ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}
