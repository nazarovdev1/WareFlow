'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Building2, Phone, MapPin, Tag, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AddCustomerPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
        alert(t('messages', 'error') + ': ' + err.error);
      }
    } catch (error) {
      alert(t('messages', 'error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans w-full max-w-4xl mx-auto flex flex-col bg-[#fcfcfd] dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/customers" className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-bold mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> {t('customers', 'title')} {"ro'yxatiga qaytish"}
          </Link>
          <h1 className="text-3xl font-black text-[#0f172a] dark:text-slate-100 tracking-tight">{t('customers', 'addCustomer')}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="p-8 grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center">
                <User size={12} className="mr-2" /> {t('customers', 'fullName')} <span className="text-rose-500 ml-1">*</span>
              </label>
              <input
                required
                type="text"
                placeholder={'Masalan: Alijon Valiyev'}
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-600 focus:border-teal-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center">
                <Building2 size={12} className="mr-2" /> {t('customers', 'companyName')}
              </label>
              <input
                type="text"
                placeholder={'Masalan: IBOX Systems'}
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-600 focus:border-teal-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center">
                <Phone size={12} className="mr-2" /> {t('customers', 'phone')} {'raqami'}
              </label>
              <input
                type="text"
                placeholder="+998 90 123 45 67"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-600 focus:border-teal-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center">
                <MapPin size={12} className="mr-2" /> {t('customers', 'region')}/{'Viloyat'}
              </label>
              <select
                value={formData.region}
                onChange={e => setFormData({...formData, region: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-600 focus:border-teal-500 outline-none transition-all font-medium appearance-none text-slate-800 dark:text-slate-200"
              >
                <option value="Toshkent" className="dark:bg-slate-700">Toshkent</option>
                <option value="Samarqand" className="dark:bg-slate-700">Samarqand</option>
                <option value="Farg'ona" className="dark:bg-slate-700">Farg&apos;ona</option>
                <option value="Namangan" className="dark:bg-slate-700">Namangan</option>
                <option value="Andijon" className="dark:bg-slate-700">Andijon</option>
                <option value="Boshqa" className="dark:bg-slate-700">{'Boshqa'}</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center">
                <Tag size={12} className="mr-2" /> {t('customers', 'group')}
              </label>
              <select
                value={formData.groupId}
                onChange={e => setFormData({...formData, groupId: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-600 focus:border-teal-500 outline-none transition-all font-medium appearance-none text-slate-800 dark:text-slate-200"
              >
                <option value="">{t('customers', 'group')}ni {t('common', 'select')}</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id} className="dark:bg-slate-700">{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5">{"Boshlang'ich"} {t('customers', 'balance')} (USD)</label>
              <input
                type="number"
                value={formData.balanceUSD}
                onChange={e => setFormData({...formData, balanceUSD: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-600 focus:border-teal-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5">{"Boshlang'ich"} {t('customers', 'balance')} (UZS)</label>
              <input
                type="number"
                value={formData.balanceUZS}
                onChange={e => setFormData({...formData, balanceUZS: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-600 focus:border-teal-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-3">{t('common', 'status')}</label>
              <div className="flex bg-slate-50 dark:bg-slate-700 p-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, status: 'ACTIVE'})}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-black transition-all ${formData.status === 'ACTIVE' ? 'bg-white dark:bg-slate-600 shadow-md text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`}
                >
                  <CheckCircle2 size={14} className="mr-2" /> {t('common', 'active')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, status: 'INACTIVE'})}
                  className={`flex-1 flex justify-center items-center py-2 rounded-lg text-xs font-black transition-all ${formData.status === 'INACTIVE' ? 'bg-white dark:bg-slate-600 shadow-md text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}
                >
                  {t('common', 'inactive')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700 flex justify-end items-center space-x-4">
          <Link href="/customers" className="px-6 py-3 text-slate-500 dark:text-slate-400 font-bold text-sm hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            {t('common', 'cancel')}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-10 py-3 bg-[#0f172a] dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} className="mr-2" /> {loading ? "Saqlanmoqda..." : t('customers', 'title') + 'ni ' + t('common', 'save')}
          </button>
        </div>
      </form>
    </div>
  );
}
