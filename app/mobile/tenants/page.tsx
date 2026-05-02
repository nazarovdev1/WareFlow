'use client';

import { useState, useEffect } from 'react';
import { Search, Building, Users, Key } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';

interface Tenant {
  id: string;
  name: string;
  domain?: string;
  isActive: boolean;
  plan?: string;
  maxUsers?: number;
  currentUsers?: number;
  expiresAt?: string;
  createdAt: string;
}

export default function MobileTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenants');
      if (res.ok) {
        const data = await res.json();
        setTenants(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.domain && t.domain.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Ijarachilar"
        backHref="/mobile"
      />

      <div className="px-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ijarachi qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center text-violet-600 dark:text-violet-400 mb-2">
              <Building size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jami</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{tenants.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <Users size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faol</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{tenants.filter(t => t.isActive).length}</div>
          </div>
        </div>

        {/* Tenant Cards */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="animate-pulse text-sm">Yuklanmoqda...</div>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Building size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Ijarachilar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTenants.map(tenant => (
              <div
                key={tenant.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{tenant.name}</h3>
                      {tenant.isActive ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">Faol</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">Nofaol</span>
                      )}
                    </div>
                    {tenant.domain && (
                      <div className="text-xs text-indigo-500 truncate">{tenant.domain}</div>
                    )}
                  </div>
                  {tenant.plan && (
                    <span className="px-2 py-1 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg">
                      {tenant.plan}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {tenant.maxUsers && (
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {tenant.currentUsers || 0}/{tenant.maxUsers}
                      </span>
                    </div>
                  )}
                  {tenant.expiresAt && (
                    <div className="flex items-center gap-1.5">
                      <Key size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(tenant.expiresAt).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
