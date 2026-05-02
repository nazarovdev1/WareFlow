'use client';

import { useState, useEffect } from 'react';
import { Search, Award, Star, Gift, Users } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';

interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  pointsPerPurchase: number;
  minimumPurchase: number;
  isActive: boolean;
  createdAt: string;
}

interface LoyaltyAccount {
  id: string;
  customerId: string;
  customer?: { fullName: string; phone?: string };
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  tier?: string;
  createdAt: string;
}

export default function MobileLoyaltyPage() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'programs' | 'accounts'>('programs');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        fetch('/api/loyalty/programs'),
        fetch('/api/loyalty/accounts'),
      ]);
      if (pRes.ok) {
        const data = await pRes.json();
        setPrograms(Array.isArray(data) ? data : data.data || []);
      }
      if (aRes.ok) {
        const data = await aRes.json();
        setAccounts(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(a => {
    const matchesSearch = !search ||
      a.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.customer?.phone?.includes(search);
    return matchesSearch;
  });

  const totalPoints = accounts.reduce((sum, a) => sum + a.points, 0);
  const activePrograms = programs.filter(p => p.isActive).length;

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Sodiqlik dasturi"
        backHref="/mobile"
      />

      <div className="px-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center text-pink-600 dark:text-pink-400 mb-2">
              <Award size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dasturlar</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{activePrograms}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
              <Star size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jami ballar</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{totalPoints.toLocaleString()}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-1">
          <button
            onClick={() => setActiveTab('programs')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'programs' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Dasturlar
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'accounts' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Hisoblar
          </button>
        </div>

        {activeTab === 'programs' && (
          <>
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <div className="animate-pulse text-sm">Yuklanmoqda...</div>
              </div>
            ) : programs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Award size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">Dasturlar topilmadi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {programs.map(program => (
                  <div
                    key={program.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{program.name}</h3>
                          {program.isActive ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">Faol</span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">Nofaol</span>
                          )}
                        </div>
                        {program.description && (
                          <p className="text-xs text-slate-500 line-clamp-2">{program.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-amber-500" />
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white">{program.pointsPerPurchase} ball</div>
                          <div className="text-[9px] text-slate-400">Har xarid uchun</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gift size={14} className="text-pink-500" />
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white">{program.minimumPurchase.toLocaleString()}</div>
                          <div className="text-[9px] text-slate-400">{`Minimal xarid so\u2019m`}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'accounts' && (
          <>
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Mijoz qidirish..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
              />
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <div className="animate-pulse text-sm">Yuklanmoqda...</div>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Users size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">Hisoblar topilmadi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAccounts.map(account => (
                  <div
                    key={account.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {account.customer?.fullName || `Noma\u2019lum`}
                        </h3>
                        {account.customer?.phone && (
                          <div className="text-xs text-slate-500">{account.customer.phone}</div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-500" />
                          <span className="text-sm font-black text-amber-600 dark:text-amber-400">{account.points}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">ball</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-center">
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{account.totalEarned}</div>
                        <div className="text-[9px] text-slate-400">{`Jami to\u2019plangan`}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-rose-600 dark:text-rose-400">{account.totalRedeemed}</div>
                        <div className="text-[9px] text-slate-400">Sarflangan</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
