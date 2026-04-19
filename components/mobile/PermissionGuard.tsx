'use client';

import { useSession } from 'next-auth/react';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export function usePermission() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const userPermissions: string[] = (session?.user as any)?.permissions || [];
  const hasPermission = (perm: string) => isAdmin || userPermissions.includes(perm);
  return { isAdmin, hasPermission, userPermissions, session };
}

export default function PermissionGuard({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return (
      <div className="w-full min-h-screen pb-28 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} className="text-rose-500" />
          </div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white mb-2">Ruxsat yo'q</h2>
          <p className="text-sm text-slate-500 mb-4">Bu bo'limga kirish uchun sizga ruxsat berilmagan</p>
          <Link href="/mobile" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
            Bosh sahifaga
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin } = usePermission();

  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen pb-28 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} className="text-rose-500" />
          </div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white mb-2">Faqat adminlar uchun</h2>
          <p className="text-sm text-slate-500 mb-4">Bu sahifaga faqat administrator kirishi mumkin</p>
          <Link href="/mobile" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
            Bosh sahifaga
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
