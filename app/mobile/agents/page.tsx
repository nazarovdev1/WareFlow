'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Phone, User, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import MobileHeader from '@/components/mobile/MobileHeader';

interface AgentStats {
  totalEarned: number;
  totalPaid: number;
  pending: number;
  orderCount: number;
  commissionCount: number;
}

interface Agent {
  id: string;
  name: string;
  phone?: string;
  commissionRate: number;
  isActive: boolean;
  userId?: string;
  user?: { id: string; name: string; email: string };
  stats: AgentStats;
  createdAt: string;
}

export default function MobileAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sales-agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(a => {
    const matchesSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.phone && a.phone.includes(search));
    return matchesSearch;
  });

  const activeCount = agents.filter(a => a.isActive).length;
  const totalPending = agents.reduce((sum, a) => sum + (a.stats?.pending || 0), 0);

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Sotuv agentlari"
        backHref="/mobile"
        rightAction={
          <Link href="/mobile/agents/add" className="p-2 rounded-xl bg-indigo-600 text-white active:scale-95 transition-transform">
            <Plus size={18} />
          </Link>
        }
      />

      <div className="px-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <User size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faol agentlar</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{activeCount}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
              <TrendingUp size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kutilayotgan</div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">{totalPending.toLocaleString()}</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Agent qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
          />
        </div>

        {/* Agent Cards */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="animate-pulse text-sm">Yuklanmoqda...</div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <User size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Agentlar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAgents.map(agent => (
              <div
                key={agent.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{agent.name}</h3>
                      {!agent.isActive && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">Nofaol</span>
                      )}
                    </div>
                    {agent.phone && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone size={12} />
                        {agent.phone}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{agent.commissionRate}%</div>
                    <div className="text-[10px] text-slate-400">komissiya</div>
                  </div>
                </div>

                {agent.stats && (
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{agent.stats.orderCount}</div>
                      <div className="text-[9px] text-slate-400">Buyurtmalar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{(agent.stats.totalEarned || 0).toLocaleString()}</div>
                      <div className="text-[9px] text-slate-400">Jami</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400">{(agent.stats.pending || 0).toLocaleString()}</div>
                      <div className="text-[9px] text-slate-400">Kutilmoqda</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
