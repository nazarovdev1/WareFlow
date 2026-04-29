'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotification as useToast } from '@/lib/NotificationContext';

// ========== Types ==========

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

interface SseNotification {
  type: 'stock_alert' | 'order' | 'info' | 'warning' | 'connected';
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

// ========== Helper functions ==========

export function getNotificationIcon(type: string) {
  switch (type) {
    case 'stock_alert':
    case 'stock_low':
    case 'warning':
      return '⚠️';
    case 'order':
    case 'success':
      return '✅';
    case 'info':
      return 'ℹ️';
    case 'error':
      return '❌';
    case 'request':
      return '📩';
    case 'message':
      return '💬';
    default:
      return '🔔';
  }
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Hozirgina';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} kun oldin`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} oy oldin`;
  const years = Math.floor(months / 12);
  return `${years} yil oldin`;
}

// ========== Legacy useNotifications hook (Header.tsx compatibility) ==========

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const userRole = (session?.user as any)?.role;
  const isAdminUser = userRole === 'ADMIN';

  useEffect(() => {
    setIsAdmin(isAdminUser);
  }, [isAdminUser]);

  const endpointBase = isAdminUser ? '/api/notifications' : '/api/user-notifications';

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(endpointBase);
      if (!res.ok) throw new Error('Fetch failed');
      const json = await res.json();
      setNotifications(json.data || []);
      setUnreadCount(json.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [endpointBase]);

  // Auto-fetch on mount
  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session, fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${endpointBase}/${id}`, { method: 'PATCH' });
        if (!res.ok) throw new Error('PATCH failed');

        let wasUnread = false;
        setNotifications(prev => {
          const target = prev.find(n => n.id === id);
          wasUnread = target ? !target.isRead : false;
          return prev.map(n => (n.id === id ? { ...n, isRead: true } : n));
        });
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    },
    [endpointBase]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch(`${endpointBase}/mark-all-read`, { method: 'PATCH' });
      if (!res.ok) throw new Error('PATCH failed');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [endpointBase]);

  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${endpointBase}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('DELETE failed');

        let wasUnread = false;
        setNotifications(prev => {
          const target = prev.find(n => n.id === id);
          wasUnread = target ? !target.isRead : false;
          return prev.filter(n => n.id !== id);
        });
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
    },
    [endpointBase]
  );

  const clearAll = useCallback(async () => {
    try {
      const res = await fetch(endpointBase, { method: 'DELETE' });
      if (!res.ok) throw new Error('DELETE failed');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  }, [endpointBase]);

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

// ========== Real-time SSE notifications hook ==========

export function useRealtimeNotifications() {
  const { success, error, warning, info } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) return;

    const es = new EventSource('/api/notifications/sse');
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const data: SseNotification = JSON.parse(event.data);

        if (data.type === 'connected') return;

        // Show toast based on notification type
        switch (data.type) {
          case 'stock_alert':
            warning(data.title, data.message);
            break;
          case 'order':
            success(data.title, data.message);
            break;
          case 'warning':
            warning(data.title, data.message);
            break;
          case 'info':
            info(data.title, data.message);
            break;
          default:
            info(data.title, data.message);
        }

        // Browser notification (if permitted)
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(data.title, {
            body: data.message,
            icon: '/favicon.ico',
          });
        }
      } catch {
        // Ignore parse errors (e.g., ping messages)
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      // Reconnect after 5 seconds
      setTimeout(() => {
        connect();
      }, 5000);
    };
  }, [success, error, warning, info]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    // Request browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { isConnected };
}
