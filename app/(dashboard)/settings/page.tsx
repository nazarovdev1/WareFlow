'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import { useNotification } from '@/lib/NotificationContext';
import { useSession } from 'next-auth/react';
import {
  Globe, Bell, User, Shield, Database, Moon, Sun,
  Check, Download, Upload, RefreshCw, Trash, Eye,
  EyeOff, LayoutTemplate, Phone, Mail, UserCircle,
  Save, AlertCircle, Info, AlertTriangle, Activity,
  Plus, Edit3, LogIn, LogOut
} from 'lucide-react';
import type { Language } from '@/lib/i18n/translations';

type SettingsTab = 'language' | 'notifications' | 'profile' | 'security' | 'appearance' | 'database' | 'stock' | 'activity';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { success, info, error, warning } = useNotification();
  const { data: session, update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('language');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const languages: { code: Language; name: string; flag: string; desc: string }[] = [
    { code: 'uz', name: "O'zbekcha", flag: '🇺🇿', desc: "O'zbek tili" },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', desc: 'Русский язык' },
    { code: 'en', name: 'English', flag: '🇬🇧', desc: 'English language' },
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
    phone: '',
    role: '',
  });

  const [profileOriginal, setProfileOriginal] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  });

  const [stockThresholds, setStockThresholds] = useState<any[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [newThreshold, setNewThreshold] = useState({ productId: '', warehouseId: '', minStock: 0 });

  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityFilters, setActivityFilters] = useState({ entity: '', type: '' });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    if (pwd.length < 6) return { level: 1, label: "Juda qisqa", color: 'bg-red-500' };
    if (pwd.length < 8) return { level: 2, label: "Zaif", color: 'bg-orange-500' };
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*]/.test(pwd);
    const strength = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (strength === 0) return { level: 2, label: "O'rtacha", color: 'bg-yellow-500' };
    if (strength === 1) return { level: 3, label: "Yaxshi", color: 'bg-blue-500' };
    return { level: 4, label: "Kuchli", color: 'bg-green-500' };
  };

  const pwdStrength = getPasswordStrength(passwords.new);

  // Load user profile and notification settings
  useEffect(() => {
    loadProfile();
    loadNotificationSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'stock') {
      loadStockThresholds();
    }
    if (activeTab === 'activity') {
      loadActivityLogs();
    }
  }, [activeTab, activityFilters]);

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await fetch('/api/settings/profile');
      if (res.ok) {
        const data = await res.json();
        const p = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || '',
        };
        setProfile(p);
        setProfileOriginal(p);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadStockThresholds = async () => {
    setStockLoading(true);
    try {
      const res = await fetch('/api/stock-thresholds');
      if (res.ok) {
        const data = await res.json();
        setStockThresholds(data);
      }
    } catch (err) {
      console.error('Failed to load stock thresholds:', err);
    } finally {
      setStockLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams();
      if (activityFilters.entity) params.append('entity', activityFilters.entity);
      if (activityFilters.type) params.append('type', activityFilters.type);
      
      const res = await fetch(`/api/activity-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data.data);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setActivityLoading(false);
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
    success(t('common', 'saved'), `${languages.find(l => l.code === lang)?.name} tili o'rnatildi`);
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
        success(t('common', 'saved'), "Bildirishnoma sozlamalari saqlandi");
      } else {
        setNotificationSettings(notificationSettings);
        error(t('messages', 'error'), t('messages', 'error'));
      }
    } catch (err) {
      setNotificationSettings(notificationSettings);
      error(t('messages', 'error'), t('messages', 'error'));
    }
  };

  const handleAddThreshold = async () => {
    if (!newThreshold.productId || !newThreshold.warehouseId) {
      error('Xatolik', 'Mahsulot va ombor tanlang');
      return;
    }

    try {
      const res = await fetch('/api/stock-thresholds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newThreshold),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Ornatilgan miqdor qo\'shildi');
        setNewThreshold({ productId: '', warehouseId: '', minStock: 0 });
        loadStockThresholds();
      } else {
        error(t('messages', 'error'), t('messages', 'error'));
      }
    } catch (err) {
      error(t('messages', 'error'), t('messages', 'error'));
    }
  };

  const handleDeleteThreshold = async (id: string) => {
    try {
      const res = await fetch(`/api/stock-thresholds/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Ornatilgan miqdor o\'chirildi');
        loadStockThresholds();
      } else {
        error(t('messages', 'error'), t('messages', 'error'));
      }
    } catch (err) {
      error(t('messages', 'error'), t('messages', 'error'));
    }
  };

  const isProfileChanged = () => {
    return (
      profile.name !== profileOriginal.name ||
      profile.email !== profileOriginal.email ||
      profile.phone !== profileOriginal.phone
    );
  };

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) {
      error(t('messages', 'error'), 'Ism kiritilishi shart');
      return;
    }

    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      error(t('messages', 'error'), "To'g'ri email manzil kiriting");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name.trim(),
          email: profile.email.trim() || undefined,
          phone: profile.phone.trim() || undefined,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        const newProfile = {
          name: updated.name || '',
          email: updated.email || '',
          phone: updated.phone || '',
          role: updated.role || profile.role,
        };
        setProfile(newProfile);
        setProfileOriginal(newProfile);
        await updateSession();
        success(t('common', 'saved'), "Profil ma'lumotlari yangilandi");
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
      error(t('messages', 'error'), "Barcha maydonlarni to'ldiring");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      error(t('messages', 'error'), "Yangi parollar mos kelmadi");
      return;
    }
    if (passwords.new.length < 6) {
      error(t('messages', 'error'), 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
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
        success(t('common', 'saved'), "Parol muvaffaqiyatli o'zgartirildi");
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
        a.download = `wareflow-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        success(t('common', 'saved'), `${data.summary.totalProducts} ta mahsulot eksport qilindi`);
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
      error(t('messages', 'error'), 'Faqat JSON fayl tanlang');
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
        success(
          "Import muvaffaqiyatli",
          `${result.results.products} mahsulot, ${result.results.customers} mijoz import qilindi`
        );
        if (result.results.errors.length > 0) {
          warning("Ba'zi xatoliklar", `${result.results.errors.length} ta yozuv import qilinmadi`);
        }
      } else {
        const data = await res.json();
        error(t('messages', 'error'), data.error || t('messages', 'error'));
      }
    } catch (err) {
      error(t('messages', 'error'), 'Yaroqsiz JSON fayl');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/backup', { method: 'POST' });

      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wareflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        success("Zaxira yaratildi", "To'liq ma'lumotlar bazasi zaxirasi yuklab olindi");
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
    if (confirm("Keshni tozalashni tasdiqlaysizmi? Sahifa yangilanadi.")) {
      localStorage.clear();
      sessionStorage.clear();
      success("Kesh tozalandi", "Sahifa yangilanmoqda...");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleResetSettings = () => {
    if (confirm("Barcha sozlamalarni qayta o'rnatishni tasdiqlaysizmi?")) {
      localStorage.clear();
      setTheme('light');
      setLanguage('uz');
      success("Sozlamalar qayta o'rnatildi", "Dastlabki holat tiklandi");
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'language', label: t('settings', 'language'), icon: Globe },
    { id: 'notifications', label: t('settings', 'notifications'), icon: Bell },
    { id: 'stock', label: 'Ombor bildirishnomalari', icon: AlertTriangle },
    { id: 'activity', label: 'Faoliyat loglari', icon: Activity },
    { id: 'profile', label: t('settings', 'profile'), icon: User },
    { id: 'security', label: t('settings', 'security'), icon: Shield },
    { id: 'appearance', label: t('settings', 'appearance'), icon: LayoutTemplate },
    { id: 'database', label: t('settings', 'database'), icon: Database },
  ];

  const roleLabel = (role: string) => {
    const roles: Record<string, string> = { ADMIN: 'Administrator', MANAGER: 'Menejer', STAFF: 'Xodim' };
    return roles[role] || role;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans w-full h-full min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0b1120]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 pl-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('settings', 'title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2 text-sm font-medium">
            <UserCircle size={16} />
            <span>{session?.user?.name || session?.user?.email || 'Yuklanmoqda...'}</span>
            {profile.role && (
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold">
                {roleLabel(profile.role)}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0">
            <nav className="space-y-1.5 bg-white dark:bg-slate-900/50 p-2 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative group
                      ${isActive
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-500/10 shadow-sm shadow-indigo-100/50 dark:shadow-none'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-indigo-600 dark:bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                    )}
                    <Icon size={18} className={`transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 sm:p-8 transition-all min-h-[500px]">

              {/* ── LANGUAGE TAB ── */}
              {activeTab === 'language' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <SectionHeader
                    icon={<Globe size={20} />}
                    title={t('settings', 'languageSettings')}
                    desc="Interfeys tilini tanlang. O'zgartirish darhol qo'llaniladi."
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {languages.map(lang => {
                      const isActive = language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden group outline-none
                            ${isActive
                              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 ring-4 ring-indigo-500/10'
                              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-none focus-visible:border-indigo-400'
                            }`}
                        >
                          {isActive && (
                            <div className="absolute top-4 right-4 bg-indigo-500 text-white p-1 rounded-full animate-in zoom-in duration-200 shadow-sm shadow-indigo-500/50">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                          <span className="text-4xl mb-3 drop-shadow-sm transition-transform group-hover:scale-110">{lang.flag}</span>
                          <div className="text-left w-full">
                            <div className="font-bold text-slate-900 dark:text-white mb-0.5">{lang.name}</div>
                            <div className="text-xs font-semibold text-slate-500">{lang.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {activeTab === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <SectionHeader
                    icon={<Bell size={20} />}
                    title={t('settings', 'notificationSettings')}
                    desc="Qaysi holatlarda sizga xabar kelishini sozlang. O'zgarishlar avtomatik saqlanadi."
                  />
                  <div className="space-y-3">
                    {[
                      {
                        key: 'email' as const,
                        label: t('settings', 'emailNotifications'),
                        desc: 'Har bir savdo/xarid haqida email orqali xabar oling',
                        icon: <Mail size={18} />,
                        color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
                      },
                      {
                        key: 'push' as const,
                        label: t('settings', 'pushNotifications'),
                        desc: 'Brauzer push bildirishnomalari',
                        icon: <Bell size={18} />,
                        color: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
                      },
                      {
                        key: 'lowStock' as const,
                        label: t('settings', 'lowStockAlert'),
                        desc: 'Mahsulot qoldigi kritik darajaga tushganda ogohlantiring',
                        icon: <AlertCircle size={18} />,
                        color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
                      },
                      {
                        key: 'orders' as const,
                        label: t('settings', 'orderNotifications'),
                        desc: 'Yangi buyurtmalar va holat o\'zgarishlari haqida xabar',
                        icon: <Info size={18} />,
                        color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                      },
                    ].map(item => {
                      const isEnabled = notificationSettings[item.key];
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <div className="flex items-center gap-3 pr-4">
                            <div className={`p-2 rounded-xl ${item.color}`}>
                              {item.icon}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-slate-900 dark:text-white">{item.label}</div>
                              <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleNotification(item.key)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                              isEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── PROFILE TAB ── */}
              {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <SectionHeader
                    icon={<User size={20} />}
                    title={t('settings', 'profileSettings')}
                    desc="Shaxsiy ma'lumotlaringizni tahrirlang."
                  />
                  {profileLoading ? (
                    <div className="space-y-4 max-w-xl">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-5 max-w-xl">
                      {/* Role badge */}
                      {profile.role && (
                        <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
                          <Shield size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div>
                            <div className="text-xs text-indigo-600/70 dark:text-indigo-400/70 font-medium">Lavozim</div>
                            <div className="font-bold text-sm text-indigo-700 dark:text-indigo-300">{roleLabel(profile.role)}</div>
                  </div>
                </div>
              )}

              {/* ── ACTIVITY TAB ── */}
              {activeTab === 'activity' as any && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <SectionHeader
                    icon={<Activity size={20} />}
                    title="Faoliyat loglari"
                    desc="Barcha foydalanuvchi harakatlarini kuzating"
                  />
                  <div className="space-y-5 max-w-4xl">
                    {/* Filters */}
                    <div className="flex gap-3">
                      <select
                        value={activityFilters.entity}
                        onChange={(e) => setActivityFilters({ ...activityFilters, entity: e.target.value })}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                      >
                        <option value="">Barcha ob'ektlar</option>
                        <option value="Order">Buyurtmalar</option>
                        <option value="Product">Mahsulotlar</option>
                        <option value="Customer">Mijozlar</option>
                        <option value="Supplier">Ta'minotchilar</option>
                        <option value="Warehouse">Omborlar</option>
                        <option value="User">Foydalanuvchilar</option>
                      </select>
                      <select
                        value={activityFilters.type}
                        onChange={(e) => setActivityFilters({ ...activityFilters, type: e.target.value })}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                      >
                        <option value="">Barcha amallar</option>
                        <option value="CREATE">Yaratish</option>
                        <option value="UPDATE">Yangilash</option>
                        <option value="DELETE">O'chirish</option>
                        <option value="LOGIN">Kirish</option>
                        <option value="LOGOUT">Chiqish</option>
                      </select>
                      <button
                        onClick={loadActivityLogs}
                        className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>

                    {/* Activity Log List */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {activityLoading ? (
                        <div className="p-8 flex items-center justify-center">
                          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
                        </div>
                      ) : activityLogs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                          Hozircha faoliyat loglari yo'q
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                          {activityLogs.map((log) => (
                            <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                log.type === 'CREATE' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                log.type === 'UPDATE' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                                log.type === 'DELETE' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' :
                                log.type === 'LOGIN' ? 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400' :
                                'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                              }`}>
                                {log.type === 'CREATE' && <Plus size={16} />}
                                {log.type === 'UPDATE' && <Edit3 size={16} />}
                                {log.type === 'DELETE' && <Trash size={16} />}
                                {log.type === 'LOGIN' && <LogIn size={16} />}
                                {log.type === 'LOGOUT' && <LogOut size={16} />}
                                {log.type === 'EXPORT' && <Download size={16} />}
                                {log.type === 'IMPORT' && <Upload size={16} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800 dark:text-white">{log.userName || "Noma'lum"}</span>
                                  <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400">{log.userRole || '-'}</span>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{log.action}</div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                  {log.entity} • {new Date(log.createdAt).toLocaleString('uz-UZ')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          {t('common', 'name')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <UserCircle size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={profile.name}
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                            placeholder="Ism Familiya"
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          {t('auth', 'email')}
                        </label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            value={profile.email}
                            onChange={e => setProfile({ ...profile, email: e.target.value })}
                            placeholder="email@example.com"
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          {t('common', 'phone') || 'Telefon raqam'}
                        </label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="+998 90 000 0000"
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={handleSaveProfile}
                          disabled={loading || !isProfileChanged()}
                          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-indigo-500/20"
                        >
                          {loading ? (
                            <RefreshCw className="animate-spin" size={18} />
                          ) : (
                            <Save size={18} />
                          )}
                          {loading ? t('common', 'loading') : t('common', 'save')}
                        </button>
                        {isProfileChanged() && (
                          <button
                            onClick={() => setProfile(profileOriginal)}
                            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                          >
                            Bekor qilish
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── SECURITY TAB ── */}
              {activeTab === 'security' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <SectionHeader
                    icon={<Shield size={20} />}
                    title={t('settings', 'security')}
                    desc="Parolingizni o'zgartiring. Xavfsizlik uchun kuchli parol ishlating."
                  />
                  <div className="space-y-5 max-w-xl">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('settings', 'currentPassword')}
                      </label>
                      <PasswordInput
                        value={passwords.current}
                        onChange={v => setPasswords({ ...passwords, current: v })}
                        show={showCurrentPassword}
                        onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('settings', 'newPassword')}
                      </label>
                      <PasswordInput
                        value={passwords.new}
                        onChange={v => setPasswords({ ...passwords, new: v })}
                        show={showNewPassword}
                        onToggle={() => setShowNewPassword(!showNewPassword)}
                        placeholder="••••••••"
                      />
                      {/* Password strength bar */}
                      {passwords.new && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                              <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                  i <= pwdStrength.level ? pwdStrength.color : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">{pwdStrength.label}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('settings', 'confirmPassword')}
                      </label>
                      <PasswordInput
                        value={passwords.confirm}
                        onChange={v => setPasswords({ ...passwords, confirm: v })}
                        show={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                        placeholder="••••••••"
                        hasError={!!(passwords.confirm && passwords.new !== passwords.confirm)}
                      />
                      {passwords.confirm && passwords.new !== passwords.confirm && (
                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                          <AlertCircle size={12} /> Parollar mos kelmadi
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleChangePassword}
                        disabled={loading || !passwords.current || !passwords.new || !passwords.confirm}
                        className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                      >
                        {loading ? <RefreshCw className="animate-spin" size={18} /> : <Shield size={18} />}
                        {loading ? t('common', 'loading') : t('settings', 'changePassword')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── APPEARANCE TAB ── */}
              {activeTab === 'appearance' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <SectionHeader
                    icon={<LayoutTemplate size={20} />}
                    title={t('settings', 'appearance')}
                    desc="Interfeys ko'rinishi va mavzularni sozlang."
                  />
                  <div className="max-w-xl space-y-4">
                    {/* Dark/Light toggle card */}
                    <div className="flex items-center justify-between p-5 bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-100 text-amber-600'}`}>
                          {theme === 'dark'
                            ? <Moon size={22} className="animate-in spin-in-180 duration-500" />
                            : <Sun size={22} className="animate-in spin-in-180 duration-500" />
                          }
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-900 dark:text-white">
                            {theme === 'dark' ? 'Tungi mavzu' : 'Kunduzgi mavzu'}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {theme === 'dark' ? 'Qoʻyush ranglar, ko\'z uchun qulay' : 'Yorqin va aniq interfeys'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          toggleTheme();
                          success(t('common', 'saved'), theme === 'light' ? 'Tungi mavzu yoqildi' : 'Kunduzgi mavzu yoqildi');
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                          theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Theme preview */}
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl">
                      <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Ko'rinish namunasi</div>
                      <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 shadow-sm border border-slate-100'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">W</div>
                          <div>
                            <div className="text-sm font-semibold">WareFlow Dashboard</div>
                            <div className="text-xs text-slate-500">Ombor boshqaruvi</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {['Mahsulotlar', 'Mijozlar', 'Buyurtmalar'].map(item => (
                            <div key={item} className={`text-center p-2 rounded-lg text-xs font-medium ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── DATABASE TAB ── */}
              {activeTab === 'database' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <SectionHeader
                    icon={<Database size={20} />}
                    title={t('settings', 'database')}
                    desc="Ma'lumotlarni eksport/import qiling va zaxira nusxa yarating."
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportData}
                    accept=".json"
                    className="hidden"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <DbActionCard
                      icon={<Download size={20} />}
                      iconBg="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      borderHover="hover:border-indigo-300 dark:hover:border-indigo-500/50"
                      title={t('settings', 'exportData')}
                      desc="Barcha ma'lumotlarni JSON formatda yuklab olish"
                      onClick={handleExportData}
                      disabled={loading}
                      tag="JSON"
                    />

                    <DbActionCard
                      icon={<Upload size={20} />}
                      iconBg="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      borderHover="hover:border-emerald-300 dark:hover:border-emerald-500/50"
                      title={t('settings', 'importData')}
                      desc="Avvaldan eksport qilingan JSON faylni yuklash"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      tag="JSON"
                    />

                    <DbActionCard
                      icon={<RefreshCw size={20} />}
                      iconBg="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      borderHover="hover:border-blue-300 dark:hover:border-blue-500/50"
                      title={t('settings', 'backup')}
                      desc="Barcha jadvallarni o'z ichiga olgan to'liq zaxira yaratish"
                      onClick={handleBackup}
                      disabled={loading}
                      tag="Backup"
                    />

                    <DbActionCard
                      icon={<Trash size={20} />}
                      iconBg="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      borderHover="hover:border-amber-300 dark:hover:border-amber-500/50"
                      title={t('settings', 'clearCache')}
                      desc="Brauzer keshini va vaqtinchalik ma'lumotlarni tozalash"
                      onClick={handleClearCache}
                      disabled={loading}
                      tag="Cache"
                    />
                  </div>

                  {/* Danger zone */}
                  <div>
                    <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-4" />
                    <div className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">Xavfli zona</div>
                    <button
                      onClick={handleResetSettings}
                      disabled={loading}
                      className="flex items-center gap-3 w-full p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-all disabled:opacity-50 group hover:shadow-sm"
                    >
                      <div className="p-2 bg-white dark:bg-red-500/20 rounded-lg text-red-500 group-hover:scale-110 transition-transform">
                        <RefreshCw size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm text-red-600 dark:text-red-400">{t('settings', 'resetSettings')}</div>
                        <div className="text-xs text-red-500/80 mt-0.5">Til, mavzu va boshqa sozlamalarni dastlabki holatga qaytarish</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STOCK TAB ── */}
              {activeTab === 'stock' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <SectionHeader
                    icon={<AlertTriangle size={20} />}
                    title="Ombor bildirishnomalari"
                    desc="Mahsulotlar kam bo'lganda bildirishnomalar olish uchun minimal miqdorlarni sozlang"
                  />
                  <div className="space-y-5 max-w-2xl">
                    {/* Add new threshold */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Yangi ornatilgan miqdor qo'shish</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Mahsulot</label>
                          <select
                            value={newThreshold.productId}
                            onChange={(e) => setNewThreshold({ ...newThreshold, productId: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          >
                            <option value="">Mahsulot tanlang...</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Ombor</label>
                          <select
                            value={newThreshold.warehouseId}
                            onChange={(e) => setNewThreshold({ ...newThreshold, warehouseId: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          >
                            <option value="">Ombor tanlang...</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Minimal miqdor</label>
                          <input
                            type="number"
                            min="0"
                            value={newThreshold.minStock}
                            onChange={(e) => setNewThreshold({ ...newThreshold, minStock: Number(e.target.value) })}
                            placeholder="0"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleAddThreshold}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg py-2.5 transition-colors"
                      >
                        Qo'shish
                      </button>
                    </div>

                    {/* List of thresholds */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Mavjud ornatilgan miqdorlar</h3>
                      </div>
                      {stockLoading ? (
                        <div className="p-8 flex items-center justify-center">
                          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
                        </div>
                      ) : stockThresholds.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                          Hozircha ornatilgan miqdorlar yo'q
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                          {stockThresholds.map((threshold) => (
                            <div key={threshold.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                              <div className="flex-1">
                                <div className="font-semibold text-slate-800 dark:text-white">{threshold.product?.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {threshold.warehouse?.name} • SKU: {threshold.product?.sku}
                                </div>
                              </div>
                              <div className="text-right mr-4">
                                <div className="font-black text-amber-600 dark:text-amber-400 text-lg">{threshold.minStock}</div>
                                <div className="text-xs text-slate-500">donadan kam</div>
                              </div>
                              <button
                                onClick={() => handleDeleteThreshold(threshold.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                                title="O'chirish"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl">
                      <Info size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700 dark:text-amber-300">
                        <strong>Qoida:</strong> Mahsulot ombordagi miqdori bu chegaradan tushganda, tizim bildirishnomalar yuboradi.
                        Bu sizga omborni vaqtda to'ldirishga yordam beradi.
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400 mr-1">
          {icon}
        </div>
        {title}
      </h2>
      <p className="text-slate-500 text-sm pl-[3.25rem]">{desc}</p>
    </div>
  );
}

function PasswordInput({
  value, onChange, show, onToggle, placeholder, hasError = false,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  hasError?: boolean;
}) {
  return (
    <div className="relative group">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:ring-2 text-slate-900 dark:text-white placeholder-slate-400
          ${hasError
            ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
            : 'border-slate-200 dark:border-slate-700/50 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500'
          }`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function DbActionCard({
  icon, iconBg, borderHover, title, desc, onClick, disabled, tag,
}: {
  icon: React.ReactNode;
  iconBg: string;
  borderHover: string;
  title: string;
  desc: string;
  onClick: () => void;
  disabled: boolean;
  tag: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-start p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl ${borderHover} hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none text-left`}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{tag}</span>
      </div>
      <div className="font-semibold text-sm text-slate-900 dark:text-white">{title}</div>
      <div className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</div>
    </button>
  );
}
