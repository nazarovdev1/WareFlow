'use client';
import { useState, useEffect } from 'react';
import { Plus, Users, Shield, Tag, X, Save } from 'lucide-react';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  description: string | null;
  defaultDiscount: number;
  _count?: { customers: number };
}

export default function GroupsPage() {
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
      console.error('Failed to fetch groups', error);
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
      console.error('Failed to add group', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fcfcfd]">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="text-[12px] font-bold text-slate-500 tracking-wide mb-2 uppercase">Mijozlar &gt; <span className="text-teal-600">Mijoz guruhlari</span></div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Mijoz guruhlari</h1>
          <p className="text-slate-500 font-medium text-sm mt-2">Mijozlarni toifalarga ajratish va ularga maxsus chegirmalar belgilash</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition"
        >
          <Plus size={18} className="mr-2" /> Yangi guruh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {groups.map((g, i) => (
            <Link key={g.id} href={`/customers/groups/${g.id}`}>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group cursor-pointer hover:border-teal-500 hover:shadow-md transition-all h-full">
                 <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex justify-center items-center ${i % 4 === 0 ? 'bg-orange-50 text-orange-500' : i % 4 === 1 ? 'bg-blue-50 text-blue-500' : i % 4 === 2 ? 'bg-slate-50 text-slate-500' : 'bg-red-50 text-red-500'}`}>
                       {i % 4 === 0 ? <Shield size={24} /> : i % 4 === 3 ? <Tag size={24} /> : <Users size={24} />}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900">{g._count?.customers || 0}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mijoz</div>
                    </div>
                 </div>
                 <div className="flex-grow">
                   <h3 className="text-lg font-black text-slate-800 mb-1">{g.name}</h3>
                   <p className="text-sm font-medium text-slate-500 line-clamp-2">{g.description || "Ta'rif yo'q"}</p>
                 </div>
                 
                 <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standart chegirma</span>
                   <span className={`text-sm font-black px-2 py-1 rounded-md ${g.defaultDiscount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
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
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Yangi guruh qo'shish</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddGroup} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Guruh nomi</label>
                  <input
                    type="text"
                    required
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Masalan: VIP Mijozlar"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Ta'rif (ixtiyoriy)</label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px]"
                    placeholder="Guruh haqida qisqacha ma'lumot"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Standart chegirma (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newGroup.defaultDiscount}
                    onChange={(e) => setNewGroup({...newGroup, defaultDiscount: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : <Save size={16} className="mr-2" />}
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
