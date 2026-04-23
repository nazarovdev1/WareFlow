import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isAdmin = session?.user?.role === 'ADMIN';
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
    } catch (e) {
    }
  }, [session, apiBase]);

  useEffect(() => {
    if (!session) return;
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications, session]);

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      const endpoint = isAdmin ? `/api/notifications/${id}` : `/api/user-notifications/${id}`;
      await fetch(endpoint, { method: 'PATCH' });
    } catch (e) {
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      const endpoint = isAdmin ? '/api/notifications/mark-all-read' : '/api/user-notifications/mark-all-read';
      await fetch(endpoint, { method: 'PATCH' });
    } catch (e) {
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    const n = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (n && !n.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      const endpoint = isAdmin ? `/api/notifications/${id}` : `/api/user-notifications/${id}`;
      await fetch(endpoint, { method: 'DELETE' });
    } catch (e) {
      fetchNotifications();
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      await fetch(apiBase, { method: 'DELETE' });
    } catch (e) {
      fetchNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    isAdmin,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}

export function getNotificationIcon(type: string): string {
  switch (type) {
    case 'new_user_request': return '👤';
    case 'order': return '🛒';
    case 'purchase': return '📦';
    case 'stock_low': return '⚠️';
    case 'product_transfer': return '📦';
    case 'info': return 'ℹ️';
    default: return '🔔';
  }
}

export function timeAgo(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);
  if (seconds < 60) return 'Hozirgina';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} daqiqa oldin`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} soat oldin`;
  return `${Math.floor(seconds / 86400)} kun oldin`;
}
