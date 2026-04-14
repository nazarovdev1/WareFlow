'use client';

import { Bell, Search, Settings, Check, X, User, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { signOut, useSession } from 'next-auth/react';

interface AppNotification {
  id: string;
  type: 'order' | 'purchase' | 'stock' | 'info';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function Header() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Yangi buyurtma',
      message: 'Mijoz buyurtma qildi - $1,200',
      date: new Date().toISOString(),
      read: false,
    },
    {
      id: '2',
      type: 'stock',
      title: 'Kam qoldiq ogohlantirishi',
      message: 'Silk Texture obosi qoldigi kamaydi',
      date: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: '3',
      type: 'purchase',
      message: 'Ta\'minotchidan xarid yakunlandi',
      title: 'Xarid yakunlandi',
      date: new Date(Date.now() - 7200000).toISOString(),
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return '🛒';
      case 'purchase': return '📦';
      case 'stock': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return t('common', 'loading');
    if (seconds < 3600) return `${Math.floor(seconds / 60)} daqiqa oldin`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} soat oldin`;
    return `${Math.floor(seconds / 86400)} kun oldin`;
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 h-16 flex items-center justify-between px-6 font-sans shrink-0 sticky top-0 z-10 w-full">
      <div className="relative w-96 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
        <input
          type="text"
          placeholder={t('common', 'search')}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white dark:focus:bg-slate-600 focus:border-teal-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-200"
        />
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors relative p-2 focus:outline-none"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{t('settings', 'notifications')}</h3>
                    {notifications.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                        >
                          {t('common', 'all')}
                        </button>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <button
                          onClick={clearAll}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                        >
                          {t('common', 'clear')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                      <Bell size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">{t('common', 'noData')}</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          !notification.read ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.read ? 'font-bold text-slate-800 dark:text-slate-200' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notification.message}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{timeAgo(notification.date)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                                title={t('common', 'confirm')}
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"
                              title={t('common', 'delete')}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <Link
                    href="/settings"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center justify-center gap-1"
                  >
                    {t('settings', 'title')} <Settings size={12} />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Settings Icon */}
        <Link
          href="/settings"
          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 focus:outline-none"
        >
          <Settings size={20} />
        </Link>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors"
          >
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
              <User size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {session?.user?.name || 'Admin'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {session?.user?.email || 'admin@ibox.uz'}
              </div>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="text-sm font-bold text-slate-800 dark:text-white">
                    {session?.user?.name || 'Admin User'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {session?.user?.email || 'admin@ibox.uz'}
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    href="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Settings size={16} className="text-slate-400" />
                    Sozlamalar
                  </Link>
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    Chiqish
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
