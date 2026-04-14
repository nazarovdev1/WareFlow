'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Save, User, Users, Building, Phone, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function GroupDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();

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
      console.error(t('messages', 'error'), error);
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
        alert(err.error || t('messages', 'error'));
      }
    } catch (error) {
      console.error(t('messages', 'error'), error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 dark:border-teal-400"></div>
      </div>
    );
  }

  if (!group && !loading) {
    return (
      <div className="p-8 bg-slate-50 dark:bg-slate-900">
        <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-medium text-lg">{t('customers', 'group')} {t('common', 'noData')}</div>
      </div>
    );
  }

  return (
    <div className="p-8 font-sans w-full min-h-full flex flex-col bg-[#fcfcfd] dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <button
        onClick={() => router.push('/customers/groups')}
        className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-bold mb-6 transition w-fit"
      >
        <ArrowLeft size={16} className="mr-1" /> {t('common', 'back')}
      </button>

      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="text-[12px] font-bold text-slate-500 dark:text-slate-400 tracking-wide mb-2 uppercase">{t('customers', 'groups')} &gt; <span className="text-teal-600 dark:text-teal-400">{group.name}</span></div>
          <h1 className="text-3xl font-black text-[#0f172a] dark:text-slate-100 tracking-tight">{group.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2">{group.description || t('common', 'noData')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-[#0f172a] dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition"
        >
          <Plus size={18} className="mr-2" /> {t('customers', 'addCustomer')}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 justify-center items-center flex rounded-xl mr-4">
            <Users size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400">{t('common', 'total')} {t('customers', 'title')}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{customers.length}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 justify-center items-center flex rounded-xl mr-4">
            <User size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400">{t('common', 'description')} {t('sales', 'discount')}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{group.defaultDiscount}%</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-200">{t('customers', 'group')} {t('customers', 'title').toLowerCase()}</h2>
        </div>

        {customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">{t('common', 'description')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('customers', 'fullName')}</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden md:table-cell">{t('customers', 'companyName')}</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('customers', 'phone')}</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden md:table-cell">{t('customers', 'region')}</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('customers', 'balance')} (USD)</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4 font-bold text-sm text-slate-800 dark:text-slate-200">{c.fullName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium hidden md:table-cell">{c.companyName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{c.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium hidden md:table-cell">{c.region || '-'}</td>
                    <td className="px-6 py-4 font-black flex items-center gap-1 text-sm bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 sticky top-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t('customers', 'addCustomer')} <span className="text-teal-600 dark:text-teal-400 font-black">({group.name})</span></h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600 transition">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <form id="customer-form" onSubmit={handleAddCustomer} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('customers', 'fullName')} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={newCustomer.fullName}
                        onChange={(e) => setNewCustomer({...newCustomer, fullName: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-600 transition-all text-sm font-medium text-slate-800 dark:text-slate-200"
                        placeholder={`${t('customers', 'title')} ${t('common', 'name')}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('customers', 'companyName')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Building size={16} />
                      </div>
                      <input
                        type="text"
                        value={newCustomer.companyName}
                        onChange={(e) => setNewCustomer({...newCustomer, companyName: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-600 transition-all text-sm font-medium text-slate-800 dark:text-slate-200"
                        placeholder={t('customers', 'companyName')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('customers', 'phone')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Phone size={16} />
                      </div>
                      <input
                        type="text"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-600 transition-all text-sm font-medium text-slate-800 dark:text-slate-200"
                        placeholder="+998 90 123 45 67"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('customers', 'region')}/{t('common', 'description')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <MapPin size={16} />
                      </div>
                      <input
                        type="text"
                        value={newCustomer.region}
                        onChange={(e) => setNewCustomer({...newCustomer, region: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-600 transition-all text-sm font-medium text-slate-800 dark:text-slate-200"
                        placeholder="Toshkent"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl">
                  <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-3 block">{t('common', 'description')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-1">{t('customers', 'balance')} (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newCustomer.balanceUSD}
                        onChange={(e) => setNewCustomer({...newCustomer, balanceUSD: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-orange-200 dark:border-orange-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-black text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-1">{t('customers', 'balance')} (UZS)</label>
                      <input
                        type="number"
                        value={newCustomer.balanceUZS}
                        onChange={(e) => setNewCustomer({...newCustomer, balanceUZS: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-orange-200 dark:border-orange-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-black text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 mt-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl shadow-sm transition"
              >
                {t('common', 'cancel')}
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
                {t('common', 'save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
