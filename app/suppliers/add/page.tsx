'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Truck, User, Phone, Tag, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AddSupplierPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    category: 'WHOLESALER',
    status: 'ACTIVE'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push('/suppliers');
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
    <div className="p-8 font-sans w-full max-w-4xl mx-auto flex flex-col bg-[#fdfdfd]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/suppliers" className="flex items-center text-slate-500 hover:text-slate-800 text-sm font-bold mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Ta'minotchilar ro'yxatiga qaytish
          </Link>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Yangi ta'minotchi qo'shish</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center">
                <Truck size={12} className="mr-2" /> Ta'minotchi nomi <span className="text-rose-500 ml-1">*</span>
              </label>
              <input 
                required
                type="text" 
                placeholder="Masalan: Galaxy Wallpaper Ltd"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center">
                <User size={12} className="mr-2" /> Mas'ul shaxs
              </label>
              <input 
                type="text" 
                placeholder="F.I.O"
                value={formData.contactPerson}
                onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
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
                <Tag size={12} className="mr-2" /> Kategoriya
              </label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all font-medium appearance-none"
              >
                <option value="WHOLESALER">Ulgurji savdogar</option>
                <option value="MANUFACTURER">Zavod/Ishlab chiqaruvchi</option>
                <option value="LOCAL">Mahalliy yetkazib beruvchi</option>
              </select>
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
          <Link href="/suppliers" className="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors">
            Bekor qilish
          </Link>
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center px-10 py-3 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} className="mr-2" /> {loading ? 'Saqlanmoqda...' : 'Ta\'minotchini saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}
