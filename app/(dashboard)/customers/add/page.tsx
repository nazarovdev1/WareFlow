'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Building2, Phone, MapPin, Tag, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AddCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    phone: '',
    region: 'Toshkent',
    groupId: '',
    status: 'ACTIVE',
    balanceUSD: 0,
    balanceUZS: 0
  });

  useEffect(() => {
    fetch('/api/customer-groups')
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push('/customers');
      } else {
        const err = await res.json();
        alert('Xatolik: ' + err.error);
      }
    } catch (error) {
      alert('Tizimda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans w-full max-w-4xl mx-auto flex flex-col bg-[#fcfcfd]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/customers" className="flex items-center text-slate-500 hover:text-slate-800 text-sm font-bold mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Mijozlar ro'yxatiga qaytish
          </Link>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Yangi mijoz qo'shish</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center">
                <User size={12} className="mr-2" /> Mijoz F.I.O <span className="text-rose-500 ml-1">*</span>
              </label>
              <input 
                required
                type="text" 
                placeholder="Masalan: Alijon Valiyev"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center">
                <Building2 size={12} className="mr-2" /> Kompaniya nomi
              </label>
              <input 
                type="text" 
                placeholder="Masalan: IBOX Systems"
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center">
                <Phone size={12} className="mr-2" /> Telefon raqami
              </label>
              <input 
                type="text" 
                placeholder="+998 90 123 45 67"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center">
                <MapPin size={12} className="mr-2" /> Hudud/Viloyat
              </label>
              <select 
                value={formData.region}
                onChange={e => setFormData({...formData, region: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all font-medium appearance-none"
              >
                <option value="Toshkent">Toshkent</option>
                <option value="Samarqand">Samarqand</option>
                <option value="Farg'ona">Farg'ona</option>
                <option value="Namangan">Namangan</option>
                <option value="Andijon">Andijon</option>
                <option value="Boshqa">Boshqa</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center">
                <Tag size={12} className="mr-2" /> Mijoz guruhi
              </label>
              <select 
                value={formData.groupId}
                onChange={e => setFormData({...formData, groupId: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all font-medium appearance-none"
              >
                <option value="">Guruhni tanlang</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Boshlang'ich Balans (USD)</label>
              <input 
                type="number" 
                value={formData.balanceUSD}
                onChange={e => setFormData({...formData, balanceUSD: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Boshlang'ich Balans (UZS)</label>
              <input 
                type="number" 
                value={formData.balanceUZS}
                onChange={e => setFormData({...formData, balanceUZS: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Holati</label>
              <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, status: 'ACTIVE'})}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-black transition-all ${formData.status === 'ACTIVE' ? 'bg-white shadow-md text-teal-600' : 'text-slate-400'}`}
                >
                  <CheckCircle2 size={14} className="mr-2" /> AKTIV
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, status: 'INACTIVE'})}
                  className={`flex-1 flex justify-center items-center py-2 rounded-lg text-xs font-black transition-all ${formData.status === 'INACTIVE' ? 'bg-white shadow-md text-slate-600' : 'text-slate-400'}`}
                >
                  NOAKTIV
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end items-center space-x-4">
          <Link href="/customers" className="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors">
            Bekor qilish
          </Link>
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center px-10 py-3 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} className="mr-2" /> {loading ? 'Saqlanmoqda...' : 'Mijozni saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}
