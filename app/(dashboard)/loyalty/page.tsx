'use client';

import { useState, useEffect } from 'react';
import { Search, Star, Award, TrendingUp, Users, Trophy, Target } from 'lucide-react';
import { useNotification } from '@/lib/NotificationContext';

interface LoyaltyAccount {
  id: string;
  customerId: string;
  customer?: { fullName: string; phone?: string };
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  pointsPerDollar: number;
  bronzeThreshold: number;
  bronzeDiscount: number;
  silverThreshold: number;
  silverDiscount: number;
  goldThreshold: number;
  goldDiscount: number;
  platinumThreshold: number;
  platinumDiscount: number;
}

export default function LoyaltyPage() {
  const { success, error } = useNotification();
  
  const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, pRes] = await Promise.all([
        fetch('/api/loyalty/accounts'),
        fetch('/api/loyalty/programs'),
      ]);
      if (aRes.ok) {
        const data = await aRes.json();
        setAccounts(Array.isArray(data) ? data : data.data || []);
      }
      if (pRes.ok) {
        const data = await pRes.json();
        setProgram(Array.isArray(data) ? data[0] : data);
      }
    } catch (err) {
      error('Xatolik', 'Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier: string) => {
    const tierConfig = {
      BRONZE: { color: 'from-amber-600 to-amber-700', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Bronze' },
      SILVER: { color: 'from-slate-400 to-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-400', label: 'Kumush' },
      GOLD: { color: 'from-yellow-400 to-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Oltin' },
      PLATINUM: { color: 'from-cyan-400 to-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', label: 'Platiniyum' },
    };
    return tierConfig[tier as keyof typeof tierConfig] || tierConfig.BRONZE;
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = !search || 
      account.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      account.customer?.phone?.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'all' || account.tier === tierFilter;
    
    return matchesSearch && matchesTier && account.isActive;
  });

  const tierCounts = {
    BRONZE: accounts.filter(a => a.tier === 'BRONZE').length,
    SILVER: accounts.filter(a => a.tier === 'SILVER').length,
    GOLD: accounts.filter(a => a.tier === 'GOLD').length,
    PLATINUM: accounts.filter(a => a.tier === 'PLATINUM').length,
  };

  const totalPoints = accounts.reduce((sum, a) => sum + a.points, 0);
  const totalEarned = accounts.reduce((sum, a) => sum + a.totalEarned, 0);

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Sodiqlik dasturi</h1>
        </div>

        {program && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black mb-1">{program.name}</h2>
                {program.description && <p className="text-sm opacity-90">{program.description}</p>}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Target size={14} />
                    <span>{program.pointsPerDollar} ball / $1</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award size={14} />
                    <span>{program.bronzeDiscount}% / {program.silverDiscount}% / {program.goldDiscount}% / {program.platinumDiscount}%</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black opacity-80 uppercase tracking-widest mb-1">Jami ball</div>
                <div className="text-3xl font-black">{totalPoints.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center text-white">
                <Trophy size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1">Bronze</div>
            <div className="text-xl font-black text-amber-900 dark:text-white">{tierCounts.BRONZE}</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center text-white">
                <Star size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Kumush</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{tierCounts.SILVER}</div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-2xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center text-white">
                <Award size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-yellow-700 dark:text-yellow-400 uppercase tracking-widest mb-1">Oltin</div>
            <div className="text-xl font-black text-yellow-900 dark:text-white">{tierCounts.GOLD}</div>
          </div>

          <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-2xl border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl flex items-center justify-center text-white">
                <Trophy size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-widest mb-1">Platiniyum</div>
            <div className="text-xl font-black text-cyan-900 dark:text-white">{tierCounts.PLATINUM}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Users size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami mijozlar</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{accounts.length}</div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Mijozlarni qidirish..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                />
              </div>
              <select
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
              >
                <option value="all">Barcha darajalar</option>
                <option value="BRONZE">Bronze</option>
                <option value="SILVER">Kumush</option>
                <option value="GOLD">Oltin</option>
                <option value="PLATINUM">Platiniyum</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Star size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Mijozlar topilmadi</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAccounts.sort((a, b) => b.points - a.points).map(account => {
                const tierInfo = getTierInfo(account.tier);
                return (
                  <div key={account.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 bg-gradient-to-br ${tierInfo.color} rounded-full flex items-center justify-center text-white font-black text-lg`}>
                          {account.customer?.fullName?.[0]?.toUpperCase() || 'M'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {account.customer?.fullName || 'Noma\'lum mijoz'}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${tierInfo.bg} ${tierInfo.text}`}>
                              {tierInfo.label}
                            </span>
                          </div>
                          {account.customer?.phone && (
                            <div className="text-xs text-slate-600 dark:text-slate-400">{account.customer.phone}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Star size={16} className="text-amber-500" />
                          <div className="text-lg font-black text-slate-900 dark:text-white">{account.points}</div>
                        </div>
                        <div className="text-xs text-slate-500">
                          Jami: {account.totalEarned.toLocaleString()} ball
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
