'use client';

import { useNotification } from '@/lib/NotificationContext';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-emerald-500';
      case 'error': return 'border-l-red-500';
      case 'warning': return 'border-l-amber-500';
      default: return 'border-l-blue-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-[100] space-y-3 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white dark:bg-slate-800 border-l-4 ${getBorderColor(notification.type)} rounded-xl shadow-2xl p-4 animate-slide-in pointer-events-auto`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">{getIcon(notification.type)}</div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white">{notification.title}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{notification.message}</p>
            </div>
            <button onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
