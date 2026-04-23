'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, User, TrendingUp, DollarSign, Award, Filter, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';

interface SalesAgent {
  id: string;
  userId?: string;
  user?: { name?: string; email?: string; phone?: string };
  name: string;
  phone?: string;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AgentStats {
  totalEarned: number;
  totalPaid: number;
  pendingCommission: number;
  salesCount: number;
}

export default function AgentsPage() {
  const { success, error } = useNotification();
  
  const [agents, setAgents] = useState<(SalesAgent & AgentStats)[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

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
    } catch (err) {
      error('Xatolik', 'Agentlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/sales-agents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', `Agent holati o'zgartirildi`);
        loadAgents();
      } else {
        error('Xatolik', 'Holatni o\'zgartirishda xatolik');
      }
    } catch (err) {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = !search || 
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      agent.phone?.toLowerCase().includes(search.toLowerCase());
    const matchesActive = activeFilter === 'all' || 
      (activeFilter === 'active' && agent.isActive) ||
      (activeFilter === 'inactive' && !agent.isActive);
    
    return matchesSearch && matchesActive;
  });

  const totalEarned = agents.reduce((sum, a) => sum + a.totalEarned, 0);
  const totalPaid = agents.reduce((sum, a) => sum + a.totalPaid, 0);
  const totalPending = agents.reduce((sum, a) => sum + a.pendingCommission, 0);

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Sotuv agentlari</h1>
          <Link
            href="/agents/add"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
          >
            <Plus size={18} />
            Yangi agent
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Umumiy komissiya</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">${totalEarned.toLocaleString()}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">To'langan</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">${totalPaid.toLocaleString()}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kutilmoqda</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">${totalPending.toLocaleString()}</div>
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
                  placeholder="Agentlarni qidirish..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                />
              </div>
              <select
                value={activeFilter}
                onChange={e => setActiveFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
              >
                <option value="all">Barchasi</option>
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : filteredAgents.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <User size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Agentlar topilmadi</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAgents.sort((a, b) => b.totalEarned - a.totalEarned).map((agent, index) => (
                <div key={agent.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                        {agent.name[0]?.toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{agent.name}</h3>
                          {index < 3 && (
                            <Award className="text-amber-500" size={16} />
                          )}
                          {!agent.isActive && (
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded">Nofaol</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                          {agent.phone && <span>{agent.phone}</span>}
                          {agent.user && agent.user.email && <span>{agent.user.email}</span>}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                          <TrendingUp size={12} />
                          Komissiya: {agent.commissionRate}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        ${agent.totalEarned.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 mb-2">
                        {agent.pendingCommission > 0 ? `${agent.pendingCommission.toLocaleString()} kutilmoqda` : 'To\'langan'}
                      </div>
                      <div className="flex gap-1">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => toggleActive(agent.id, agent.isActive)}
                          className={`p-1.5 rounded-lg ${agent.isActive ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'}`}
                        >
                          <User size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
