'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import { useNotification } from '@/lib/NotificationContext';
import { useSession } from 'next-auth/react';
import { Globe, Bell, User, Shield, Database, Moon, Sun, ChevronRight, Check, Download, Upload, RefreshCw, Trash, Eye, EyeOff } from 'lucide-react';
import type { Language } from '@/lib/i18n/translations';

type SettingsTab = 'language' | 'notifications' | 'profile' | 'security' | 'appearance' | 'database';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { success, info, error, warning } = useNotification();
  const { data: session, update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('language');
  const [loading, setLoading] = useState(false);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: false,
    lowStock: true,
    orders: true,
  });

  const [profile, setProfile] = useState({
    name: '',
    email: '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load user profile and notification settings
  useEffect(() => {
    loadProfile();
    loadNotificationSettings();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/settings/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile({ name: data.name || '', email: data.email || '' });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const res = await fetch('/api/settings/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotificationSettings(data);
      }
    } catch (err) {
      console.error('Failed to load notification settings:', err);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    success(t('common', 'saved'), `${lang.toUpperCase()} ${t('settings', 'language').toLowerCase()}`);
  };

  const handleToggleNotification = async (key: keyof typeof notificationSettings) => {
    const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(newSettings);

    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (res.ok) {
        success(t('common', 'saved'), t('settings', 'notificationSettings'));
      } else {
        setNotificationSettings(notificationSettings); // Revert on error
        error(t('messages', 'error'), t('messages', 'error'));
      }
    } catch (err) {
      setNotificationSettings(notificationSettings); // Revert on error
      error(t('messages', 'error'), t('messages', 'error'));
    }
  };

  const handleSaveProfile = async () => {
    if (!profile.name || !profile.email) {
      error(t('messages', 'error'), t('messages', 'fillRequired'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        await updateSession();
        success(t('common', 'saved'), t('settings', 'profileSettings'));
      } else {
        const data = await res.json();
        error(t('messages', 'error'), data.error || t('messages', 'error'));
      }
    } catch (err) {
      error(t('messages', 'error'), t('messages', 'error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      error(t('messages', 'error'), t('messages', 'fillRequired'));
      return;
    }
    if (passwords.new !== passwords.confirm) {
      error(t('messages', 'error'), t('settings', 'confirmPassword') + ' ' + t('common', 'noData'));
      return;
    }
    if (passwords.new.length < 6) {
      error(t('messages', 'error'), t('settings', 'title') + ' 6+');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      if (res.ok) {
        success(t('common', 'saved'), t('settings', 'changePassword'));
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        const data = await res.json();
        error(t('messages', 'error'), data.error || t('messages', 'error'));
      }
    } catch (err) {
      error(t('messages', 'error'), t('messages', 'error'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/export');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ibox-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        success(t('common', 'saved'), `${data.summary.totalProducts} ${t('products', 'title').toLowerCase()}`);
      } else {
        error(t('messages', 'error'), t('messages', 'error'));
      }
    } catch (err) {
      error(t('messages', 'error'), t('messages', 'error'));
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      error(t('messages', 'error'), 'JSON fayl tanlang');
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch('/api/settings/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        const msg = `${result.results.products} ${t('products', 'title').toLowerCase()}, ${result.results.customers} ${t('customers', 'title').toLowerCase()}`;
        success(t('common', 'saved'), msg);
        
        if (result.results.errors.length > 0) {
          warning(t('messages', 'error'), `${result.results.errors.length} xatolik`);
        }
      } else {
        const data = await res.json();
        error(t('messages', 'error'), data.error || t('messages', 'error'));
      }
    } catch (err) {
      error(t('messages', 'error'), 'Invalid JSON file');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/backup', {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ibox-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        success(t('common', 'saved'), t('settings', 'backup'));
      } else {
        error(t('messages', 'error'), t('messages', 'error'));
      }
    } catch (err) {
      error(t('messages', 'error'), t('messages', 'error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    success(t('common', 'saved'), t('settings', 'clearCache'));
  };

  const handleResetSettings = () => {
    if (confirm(t('messages', 'confirmDelete'))) {
      localStorage.clear();
      setTheme('light');
      setLanguage('uz');
      success(t('common', 'saved'), t('settings', 'resetSettings'));
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'language', label: t('settings', 'language'), icon: Globe },
    { id: 'notifications', label: t('settings', 'notifications'), icon: Bell },
    { id: 'profile', label: t('settings', 'profile'), icon: User },
    { id: 'security', label: t('settings', 'security'), icon: Shield },
    { id: 'appearance', label: t('settings', 'appearance'), icon: theme === 'dark' ? Moon : Sun },
    { id: 'database', label: t('settings', 'database'), icon: Database },
  ];

  return (
    <div className="p-6 font-sans w-full h-full bg-slate-50 dark:bg-slate-900">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('settings', 'title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">{t('settings', 'title')} - {session?.user?.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon size={18} className="mr-3" />
                    {tab.label}
                  </div>
                  <ChevronRight size={16} className={activeTab === tab.id ? 'text-white' : 'text-slate-400'} />
                </button>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            {activeTab === 'language' && (
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">{t('settings', 'languageSettings')}</h2>
                <div className="space-y-4">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        language === lang.code
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">{lang.flag}</span>
                        <div className="text-left">
                          <div className="font-bold text-slate-800 dark:text-white">{lang.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{lang.code.toUpperCase()}</div>
                        </div>
                      </div>
                      {language === lang.code && (
                        <div className="bg-indigo-600 text-white rounded-full p-1">
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">{t('settings', 'notificationSettings')}</h2>
                <div className="space-y-4">
                  {[
                    { key: 'email' as const, label: t('settings', 'emailNotifications'), desc: 'Har bir savdo/xarid haqida email oling' },
                    { key: 'push' as const, label: t('settings', 'pushNotifications'), desc: 'Brauzer orqali bildirishnomalar' },
                    { key: 'lowStock' as const, label: t('settings', 'lowStockAlert'), desc: 'Mahsulot qoldigi kamayganda xabar oling' },
                    { key: 'orders' as const, label: t('settings', 'orderNotifications'), desc: 'Yangi buyurtmalar haqida xabar' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-white">{item.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</div>
                      </div>
                      <button
                        onClick={() => handleToggleNotification(item.key)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          notificationSettings[item.key] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          notificationSettings[item.key] ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">{t('settings', 'profileSettings')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">{t('common', 'name')}</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">{t('auth', 'email')}</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? t('common', 'loading') : t('common', 'save')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">{t('settings', 'security')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">{t('settings', 'currentPassword')}</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwords.current}
                        onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">{t('settings', 'newPassword')}</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwords.new}
                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">{t('settings', 'confirmPassword')}</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwords.confirm}
                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? t('common', 'loading') : t('settings', 'changePassword')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">{t('settings', 'appearance')}</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center">
                      {theme === 'dark' ? (
                        <Moon size={20} className="text-indigo-400 mr-3" />
                      ) : (
                        <Sun size={20} className="text-amber-500 mr-3" />
                      )}
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-white">
                          {theme === 'dark' ? t('settings', 'appearance') : t('settings', 'appearance')}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {theme === 'dark' ? "Dark mode" : "Light mode"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        toggleTheme();
                        success(t('common', 'saved'), theme === 'light' ? "Dark" : "Light");
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">{t('settings', 'database')}</h2>
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportData}
                    accept=".json"
                    className="hidden"
                  />

                  <button
                    onClick={handleExportData}
                    disabled={loading}
                    className="w-full text-left p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Download size={20} className="text-indigo-600 mr-3" />
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-white">{t('settings', 'exportData')}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">JSON formatda yuklab olish</div>
                    </div>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full text-left p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Upload size={20} className="text-emerald-600 mr-3" />
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-white">{t('settings', 'importData')}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">JSON fayldan yuklash</div>
                    </div>
                  </button>

                  <button
                    onClick={handleBackup}
                    disabled={loading}
                    className="w-full text-left p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <RefreshCw size={20} className="text-blue-600 mr-3" />
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-white">{t('settings', 'backup')}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">To'liq zaxira nusxa</div>
                    </div>
                  </button>

                  <button
                    onClick={handleClearCache}
                    disabled={loading}
                    className="w-full text-left p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Trash size={20} className="text-amber-600 mr-3" />
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-white">{t('settings', 'clearCache')}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">LocalStorage va SessionStorage</div>
                    </div>
                  </button>

                  <button
                    onClick={handleResetSettings}
                    disabled={loading}
                    className="w-full text-left p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center disabled:opacity-50"
                  >
                    <RefreshCw size={20} className="text-red-600 mr-3" />
                    <div>
                      <div className="font-bold text-sm text-red-600 dark:text-red-400">{t('settings', 'resetSettings')}</div>
                      <div className="text-xs text-red-500 dark:text-red-400/70 mt-1">Barcha sozlamalarni tiklash</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
