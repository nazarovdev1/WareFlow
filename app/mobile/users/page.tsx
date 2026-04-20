'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { Search, Shield, Mail, Building2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { AdminGuard } from '@/components/mobile/PermissionGuard';

export default function MobileUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/users?limit=50')
      .then(r => r.json())
      .then(data => {
        setUsers(data.data || data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleLabel = (r: string) => r === 'ADMIN' ? 'Administrator' : r === 'MANAGER' ? 'Boshqaruvchi' : 'Xodim';
  const roleColor = (r: string) =>
    r === 'ADMIN' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
    r === 'MANAGER' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' :
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

  return (
    <AdminGuard>
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Foydalanuvchilar" backHref="/mobile" />

        <div className="px-6 mb-4 mt-2">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Ism yoki email..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm text-slate-800 dark:text-white" />
          </div>
        </div>

        <div className="px-6 mb-5 flex gap-2">
          {['ALL', 'ADMIN', 'MANAGER', 'STAFF'].map(role => (
            <button key={role} onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${roleFilter === role ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200/60 dark:border-slate-800'}`}>
              {role === 'ALL' ? 'Hammasi' : roleLabel(role)}
            </button>
          ))}
        </div>

        <div className="px-6 space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />)
          ) : filtered.length > 0 ? (
            filtered.map(user => (
              <Link key={user.id} href={`/mobile/users/${user.id}`}
                className="block bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 text-base font-black">
                    {user.name?.[0] || user.email?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{user.name || user.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail size={10} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${roleColor(user.role)}`}>{roleLabel(user.role)}</span>
                      {user.isActive ? (
                        <span className="flex items-center gap-0.5 text-[9px] text-emerald-600"><CheckCircle2 size={9} /> Aktiv</span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[9px] text-rose-500"><XCircle size={9} /> Nofaol</span>
                      )}
                    </div>
                  </div>
                  {user.warehouse && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full">
                      <Building2 size={9} /> {user.warehouse.name}
                    </div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-16">
              <Shield size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Foydalanuvchilar topilmadi</p>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}