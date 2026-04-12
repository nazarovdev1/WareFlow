'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Save, User, Users, Building, Phone, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function GroupDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [group, setGroup] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({
    fullName: '',
    companyName: '',
    phone: '',
    region: '',
    status: 'ACTIVE',
    balanceUSD: 0,
    balanceUZS: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupRes, customersRes] = await Promise.all([
        fetch(`/api/customer-groups/${id}`),
        fetch(`/api/customers?groupId=${id}&limit=100`)
      ]);
      
      if (groupRes.ok) {
        setGroup(await groupRes.json());
      }
      
      if (customersRes.ok) {
        const data = await customersRes.json();
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.fullName) return;
    setIsSubmitting(true);
    
    try {
      const payload = { ...newCustomer, groupId: id };
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setNewCustomer({
          fullName: '', companyName: '', phone: '', region: '', status: 'ACTIVE', balanceUSD: 0, balanceUZS: 0
        });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Server error');
      }
    } catch (error) {
      console.error('Failed to add customer', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!group && !loading) {
    return (
      <div className="p-8">
        <div className="text-center py-20 text-slate-500 font-medium text-lg">Guruh topilmadi</div>
      </div>
    );
  }

  return (
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fcfcfd]">
      <button 
        onClick={() => router.push('/customers/groups')}
        className="flex items-center text-slate-500 hover:text-slate-800 text-sm font-bold mb-6 transition w-fit"
      >
        <ArrowLeft size={16} className="mr-1" /> Orqaga
      </button>

      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="text-[12px] font-bold text-slate-500 tracking-wide mb-2 uppercase">Mijoz guruhlari &gt; <span className="text-teal-600">{group.name}</span></div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">{group.name}</h1>
          <p className="text-slate-500 font-medium text-sm mt-2">{group.description || "Ta'rif yo'q"}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition"
        >
          <Plus size={18} className="mr-2" /> Yangi mijoz qo'shish
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 justify-center items-center flex rounded-xl mr-4">
            <Users size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500">Jami mijozlar</div>
            <div className="text-2xl font-black text-slate-900">{customers.length}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 justify-center items-center flex rounded-xl mr-4">
            <User size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500">Standart chegirma</div>
            <div className="text-2xl font-black text-slate-900">{group.defaultDiscount}%</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-black text-slate-800">Guruh mijozlari</h2>
        </div>
        
        {customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">Bu guruhda hali mijozlar yo'q</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Mijoz FISh</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Kompaniya</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Telefon</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Viloyat</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Balans (USD)</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-sm text-slate-800">{c.fullName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium hidden md:table-cell">{c.companyName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{c.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium hidden md:table-cell">{c.region || '-'}</td>
                    <td className="px-6 py-4 font-black flex items-center gap-1 text-sm bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                      ${c.balanceUSD.toLocaleString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0">
              <h3 className="text-lg font-bold text-slate-800">Yangi mijoz qo'shish <span className="text-teal-600 font-black">({group.name})</span></h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-lg shadow-sm border border-slate-100 transition">
                <X size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="customer-form" onSubmit={handleAddCustomer} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">F.I.Sh <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={newCustomer.fullName}
                        onChange={(e) => setNewCustomer({...newCustomer, fullName: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 focus:bg-white transition-all text-sm font-medium"
                        placeholder="Mijoz ismi"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Kompaniya nomi</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Building size={16} />
                      </div>
                      <input
                        type="text"
                        value={newCustomer.companyName}
                        onChange={(e) => setNewCustomer({...newCustomer, companyName: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 focus:bg-white transition-all text-sm font-medium"
                        placeholder="Kompaniya nomi"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Telefon raqam</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input
                        type="text"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 focus:bg-white transition-all text-sm font-medium"
                        placeholder="+998 90 123 45 67"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Viloyat/Shahar</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <MapPin size={16} />
                      </div>
                      <input
                        type="text"
                        value={newCustomer.region}
                        onChange={(e) => setNewCustomer({...newCustomer, region: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 focus:bg-white transition-all text-sm font-medium"
                        placeholder="Toshkent"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  <h4 className="text-sm font-bold text-orange-800 mb-3 block">Boshlang'ich balans qoldiqlari</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-1">Balans (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newCustomer.balanceUSD}
                        onChange={(e) => setNewCustomer({...newCustomer, balanceUSD: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2 bg-white border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-1">Balans (UZS)</label>
                      <input
                        type="number"
                        value={newCustomer.balanceUZS}
                        onChange={(e) => setNewCustomer({...newCustomer, balanceUZS: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2 bg-white border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-black"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
              
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                form="customer-form"
                disabled={isSubmitting}
                className="flex items-center px-6 py-2.5 bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 text-white text-sm font-bold rounded-xl transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : <Save size={16} className="mr-2" />}
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
