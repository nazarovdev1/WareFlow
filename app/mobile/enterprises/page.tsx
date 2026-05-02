'use client';

import { useState, useEffect } from 'react';
import { Search, Landmark, Building, Phone, Mail } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';

interface Enterprise {
  id: string;
  name: string;
  legalName?: string;
  inn?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export default function MobileEnterprisesPage() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadEnterprises();
  }, []);

  const loadEnterprises = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/enterprises');
      if (res.ok) {
        const data = await res.json();
        setEnterprises(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const filteredEnterprises = enterprises.filter(e => {
    const matchesSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.legalName && e.legalName.toLowerCase().includes(search.toLowerCase())) ||
      (e.inn && e.inn.includes(search));
    return matchesSearch;
  });

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Korxonalar"
        backHref="/mobile"
      />

      <div className="px-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Korxona qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 mb-2">
              <Landmark size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jami</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{enterprises.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <Building size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faol</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{enterprises.filter(e => e.isActive).length}</div>
          </div>
        </div>

        {/* Enterprise Cards */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="animate-pulse text-sm">Yuklanmoqda...</div>
          </div>
        ) : filteredEnterprises.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Landmark size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Korxonalar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEnterprises.map(enterprise => (
              <div
                key={enterprise.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{enterprise.name}</h3>
                      {!enterprise.isActive && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">Nofaol</span>
                      )}
                    </div>
                    {enterprise.legalName && enterprise.legalName !== enterprise.name && (
                      <div className="text-xs text-slate-500 truncate">{enterprise.legalName}</div>
                    )}
                  </div>
                  {enterprise.inn && (
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-400">{enterprise.inn}</div>
                      <div className="text-[9px] text-slate-400">INN</div>
                    </div>
                  )}
                </div>

                <div className="space-y-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {enterprise.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone size={12} /> {enterprise.phone}
                    </div>
                  )}
                  {enterprise.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail size={12} /> {enterprise.email}
                    </div>
                  )}
                  {enterprise.address && (
                    <div className="text-xs text-slate-500 truncate">{enterprise.address}</div>
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
