'use client';
import { useState, useEffect } from 'react';
import { Plus, Users, Shield, Tag, X, Save } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Group {
  id: string;
  name: string;
  description: string | null;
  defaultDiscount: number;
  _count?: { customers: number };
}

export default function GroupsPage() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', defaultDiscount: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customer-groups');
      const data = await res.json();
      setGroups(data);
    } catch (error) {
      console.error(t('messages', 'error'), error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/customer-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewGroup({ name: '', description: '', defaultDiscount: 0 });
        fetchGroups();
      }
    } catch (error) {
      console.error(t('messages', 'error'), error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fcfcfd] dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="text-[12px] font-bold text-slate-500 dark:text-slate-400 tracking-wide mb-2 uppercase">{t('customers', 'title')} &gt; <span className="text-teal-600 dark:text-teal-400">{t('customers', 'groups')}</span></div>
          <h1 className="text-3xl font-black text-[#0f172a] dark:text-slate-100 tracking-tight">{t('customers', 'groups')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2">{t('customers', 'title')}larni toifalarga ajratish va ularga maxsus chegirmalar belgilash</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-[#0f172a] dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition"
        >
          <Plus size={18} className="mr-2" /> Yangi {t('customers', 'group').toLowerCase()}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 dark:border-teal-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {groups.map((g, i) => (
            <Link key={g.id} href={`/customers/groups/${g.id}`}>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col relative overflow-hidden group cursor-pointer hover:border-teal-500 hover:shadow-md transition-all h-full">
                 <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex justify-center items-center ${i % 4 === 0 ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400' : i % 4 === 1 ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400' : i % 4 === 2 ? 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400'}`}>
                       {i % 4 === 0 ? <Shield size={24} /> : i % 4 === 3 ? <Tag size={24} /> : <Users size={24} />}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{g._count?.customers || 0}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{t('customers', 'title')}</div>
                    </div>
                 </div>
                 <div className="flex-grow">
                   <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-1">{g.name}</h3>
                   <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2">{g.description || t('common', 'noData')}</p>
                 </div>

                 <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('common', 'description')} {t('sales', 'discount')}</span>
                   <span className={`text-sm font-black px-2 py-1 rounded-md ${g.defaultDiscount > 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                     {g.defaultDiscount}%
                   </span>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t('customers', 'group')} {t('common', 'add')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddGroup} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('customers', 'group')} {t('common', 'name')}</label>
                  <input
                    type="text"
                    required
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-200 dark:bg-slate-700"
                    placeholder={`${t('common', 'description')} VIP ${t('customers', 'title')}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('common', 'description')} ({t('common', 'optional')})</label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px] text-slate-800 dark:text-slate-200 dark:bg-slate-700"
                    placeholder={t('common', 'description')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('common', 'description')} {t('sales', 'discount')} (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newGroup.defaultDiscount}
                    onChange={(e) => setNewGroup({...newGroup, defaultDiscount: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-200 dark:bg-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  {t('common', 'cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : <Save size={16} className="mr-2" />}
                  {t('common', 'save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
