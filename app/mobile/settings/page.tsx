'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Bell, Database, Shield, Save } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileSettingsPage() {
  const { success, error } = useNotification();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'system'>('profile');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    language: 'uz',
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    orderCreated: true,
    lowStock: true,
    paymentReceived: true,
    deliveryUpdate: false,
    dailyReport: true,
  });

  const [system, setSystem] = useState({
    currency: 'UZS',
    dateFormat: 'dd.MM.yyyy',
    timezone: 'Asia/Tashkent',
    autoBackup: true,
    backupInterval: '24',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/settings/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          language: data.language || 'uz',
        });
      }
    } catch {
      // silently handle
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', `Profil ma\u2019lumotlari saqlandi`);
      } else {
        error('Xatolik', 'Profilni saqlashda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      error('Xatolik', 'Yangi parollar mos kelmayapti');
      return;
    }
    if (security.newPassword.length < 6) {
      error('Xatolik', 'Parol kamida 6 belgidan iborat bo\u2019lishi kerak');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: security.currentPassword,
          newPassword: security.newPassword,
        }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Parol muvaffaqiyatli o\u2019zgartirildi');
        setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        error('Xatolik', 'Joriy parol noto\u2019g\u2019ri');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', `Bildirishnoma sozlamalari saqlandi`);
      } else {
        error('Xatolik', 'Sozlamalarni saqlashda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'profile' as const, label: 'Profil', icon: User },
    { key: 'security' as const, label: 'Xavfsizlik', icon: Lock },
    { key: 'notifications' as const, label: 'Bildirishnomalar', icon: Bell },
    { key: 'system' as const, label: 'Tizim', icon: Database },
  ];

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Sozlamalar"
        backHref="/mobile"
      />

      <div className="px-4 space-y-4">
        {/* Tabs */}
        <div className="flex bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors flex flex-col items-center gap-1 ${activeTab === tab.key ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Ism</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Telefon</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Til</label>
                <select
                  value={profile.language}
                  onChange={e => setProfile({ ...profile, language: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="uz">{`O\u2019zbek`}</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saqlanmoqda...' : 'Profilni saqlash'}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Joriy parol</label>
                <input
                  type="password"
                  value={security.currentPassword}
                  onChange={e => setSecurity({ ...security, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Yangi parol</label>
                <input
                  type="password"
                  value={security.newPassword}
                  onChange={e => setSecurity({ ...security, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Parolni tasdiqlash</label>
                <input
                  type="password"
                  value={security.confirmPassword}
                  onChange={e => setSecurity({ ...security, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
            </div>
            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              <Shield size={18} />
              {saving ? 'Saqlanmoqda...' : `Parolni o\u2019zgartirish`}
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              {[
                { key: 'orderCreated' as const, label: 'Yangi buyurtma', desc: `Mijoz buyurtma berganda` },
                { key: 'lowStock' as const, label: 'Kam qoldiq', desc: 'Mahsulot qoldiq chegarasiga yetganda' },
                { key: 'paymentReceived' as const, label: `To\u2019lov olindi`, desc: `Mijoz to\u2019lov qilganda` },
                { key: 'deliveryUpdate' as const, label: 'Yetkazib berish', desc: `Yetkazib berish holati o\u2019zgarganda` },
                { key: 'dailyReport' as const, label: 'Kunlik hisobot', desc: 'Har kuni kechqurun hisobot' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                    className={`w-12 h-7 rounded-full transition-colors ${notifications[item.key] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${notifications[item.key] ? 'translate-x-6.5' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveNotifications}
              disabled={saving}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Valyuta</label>
                <select
                  value={system.currency}
                  onChange={e => setSystem({ ...system, currency: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="UZS">{`UZS - So\u2019m`}</option>
                  <option value="USD">USD - Dollar</option>
                  <option value="RUB">RUB - Rubl</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Sana formati</label>
                <select
                  value={system.dateFormat}
                  onChange={e => setSystem({ ...system, dateFormat: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="dd.MM.yyyy">dd.MM.yyyy</option>
                  <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                  <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Vaqt mintaqasi</label>
                <select
                  value={system.timezone}
                  onChange={e => setSystem({ ...system, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
                  <option value="Asia/Samarkand">Asia/Samarkand (UTC+5)</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">Avtomatik zaxira</div>
                  <div className="text-[10px] text-slate-500">{`Ma\u2019lumotlarni avtomatik zaxiralash`}</div>
                </div>
                <button
                  onClick={() => setSystem({ ...system, autoBackup: !system.autoBackup })}
                  className={`w-12 h-7 rounded-full transition-colors ${system.autoBackup ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${system.autoBackup ? 'translate-x-6.5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setSaving(true);
                fetch('/api/settings/export', { method: 'POST' })
                  .then(res => {
                    if (res.ok) success('Muvaffaqiyatli', `Ma\u2019lumotlar eksport qilindi`);
                    else error('Xatolik', 'Eksportda xatolik');
                  })
                  .catch(() => error('Xatolik', 'Tarmoq xatosi'))
                  .finally(() => setSaving(false));
              }}
              disabled={saving}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              <Database size={18} />
              {`Ma\u2019lumotlarni eksport`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
