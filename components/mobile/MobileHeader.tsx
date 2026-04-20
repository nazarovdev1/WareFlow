'use client';

import { Bell, ChevronLeft, Check, X, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface MobileHeaderProps {
  title?: string;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export default function MobileHeader({ title, backHref, rightAction }: MobileHeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const apiBase = isAdmin ? '/api/notifications' : '/api/user-notifications';

  const fetchNotifications = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`${apiBase}?limit=30`);
      if (!res.ok) return;
      const json = await res.json();
      setNotifications(json.data || []);
      setUnreadCount(json.unreadCount ?? 0);
    } catch (e) {}
  }, [session, apiBase]);

  useEffect(() => {
    if (!session) return;
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications, session]);

  const handleBellClick = () => {
    setShowNotifications(prev => !prev);
    if (!showNotifications) fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await fetch(`${apiBase}/${id}`, { method: 'PATCH' });
    } catch (e) {
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetch(`${apiBase}/mark-all-read`, { method: 'PATCH' });
    } catch (e) {
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    const n = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (n && !n.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
    } catch (e) {
      fetchNotifications();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_user_request': return '👤';
      case 'order': return '🛒';
      case 'purchase': return '📦';
      case 'stock_low': return '⚠️';
      case 'product_transfer': return '📦';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Hozirgina';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} daqiqa oldin`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} soat oldin`;
    return `${Math.floor(seconds / 86400)} kun oldin`;
  };

  return (
    <>
      <div className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl z-40">
        {title ? (
          <div className="flex items-center gap-3">
            {backHref ? (
              <Link href={backHref} className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 active:scale-95 transition-transform flex items-center justify-center">
                <ChevronLeft size={20} className="text-slate-700 dark:text-slate-300" />
              </Link>
            ) : (
              <button onClick={() => router.back()} className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 active:scale-95 transition-transform flex items-center justify-center">
                <ChevronLeft size={20} className="text-slate-700 dark:text-slate-300" />
              </button>
            )}
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
          </div>
        ) : (
          <div>
            <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Xush kelibsiz</p>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">{session?.user?.name || 'Foydalanuvchi'}</h1>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {rightAction}
          <button onClick={handleBellClick} className="relative w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 active:scale-95 transition-transform">
            <Bell size={20} className="text-slate-700 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications Modal Overlay */}
      {showNotifications && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" onClick={() => setShowNotifications(false)}>
          <div className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 pt-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Bildirishnomalar
                {unreadCount > 0 && <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
              </h2>
              <button onClick={() => setShowNotifications(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <div className="flex justify-between items-center p-3 px-5 border-b border-slate-100 dark:border-slate-800">
              <button onClick={markAllAsRead} className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest active:scale-95">Barchasini o'qish</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Bell size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">Bildirishnomalar yo'q</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-4 rounded-2xl border ${!n.isRead ? 'bg-slate-50 border-teal-100 dark:bg-slate-800 dark:border-teal-900/30' : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800'}`}>
                    <div className="flex gap-3">
                      <div className="text-xl pt-0.5">{getNotificationIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-[13px] ${!n.isRead ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`}>{n.title}</p>
                          <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap ml-2">{timeAgo(n.createdAt)}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                        {n.link && (
                          <Link href={n.link} onClick={() => { markAsRead(n.id); setShowNotifications(false); }} className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2.5 py-1 rounded-md active:scale-95 transition-transform">
                            Ko'rish
                          </Link>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 ml-1">
                        {!n.isRead && (
                          <button onClick={() => markAsRead(n.id)} className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 active:scale-95 transition-transform">
                            <Check size={12} strokeWidth={3} />
                          </button>
                        )}
                        <button onClick={() => deleteNotification(n.id)} className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-95 transition-transform">
                          <X size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {isAdmin && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <Link href="/mobile/requests" onClick={() => setShowNotifications(false)} className="w-full py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-[12px] font-bold text-slate-700 dark:text-slate-300 active:scale-[0.98] transition-transform">
                  So'rovlarni ko'rish <UserPlus size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
