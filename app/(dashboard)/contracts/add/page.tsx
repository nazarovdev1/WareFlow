'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Save, FileText, Calendar, DollarSign, User, Building2, X, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';

interface Customer {
  id: string;
  fullName: string;
  phone?: string;
  address?: string;
}

interface Supplier {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export default function AddContractPage() {
  const router = useRouter();
  const { success, error } = useNotification();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'customer',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    value: '',
    currency: 'USD',
    description: '',
    terms: '',
    customerId: '',
    supplierId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/suppliers'),
      ]);
      if (cRes.ok) {
        const data = await cRes.json();
        setCustomers(Array.isArray(data) ? data : data.data || []);
      }
      if (sRes.ok) {
        const data = await sRes.json();
        setSuppliers(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      error('Xatolik', 'Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) {
      newErrors.title = 'Sarlavha kiritilishi shart';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Boshlanish sanasi kiritilishi shart';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Tugash sanasi kiritilishi shart';
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'Tugash sanasi boshlanish sanasidan keyin bo\'lishi kerak';
    }
    if (formData.type === 'customer' && !formData.customerId) {
      newErrors.customerId = 'Mijoz tanlanishi shart';
    }
    if (formData.type === 'supplier' && !formData.supplierId) {
      newErrors.supplierId = 'Ta\'minotchi tanlanishi shart';
    }
    if (formData.value && parseFloat(formData.value) < 0) {
      newErrors.value = 'Summa manfiy bo\'lishi mumkin emas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateContractNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CTR-${year}${month}-${random}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachments([...attachments, ...Array.from(files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      error('Xatolik', 'Barcha majburiy maydonlarni to\'ldiring');
      return;
    }

    setSubmitting(true);
    try {
      const contractNumber = generateContractNumber();
      
      const payload: any = {
        contractNumber,
        title: formData.title,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description || null,
        terms: formData.terms || null,
      };

      if (formData.type === 'customer' && formData.customerId) {
        payload.customerId = formData.customerId;
      }
      if (formData.type === 'supplier' && formData.supplierId) {
        payload.supplierId = formData.supplierId;
      }
      if (formData.value) {
        payload.value = parseFloat(formData.value);
        payload.currency = formData.currency;
      }

      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const contractData = await res.json();
        success('Muvaffaqiyatli', `Shartnoma ${contractNumber} muvaffaqiyatli yaratildi`);
        
        if (attachments.length > 0) {
          for (const file of attachments) {
            const formData = new FormData();
            formData.append('file', file);
            await fetch(`/api/contracts/${contractData.id}/attachments`, {
              method: 'POST',
              body: formData,
            });
          }
        }
        
        router.push('/contracts');
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Shartnoma yaratishda xatolik');
      }
    } catch (err) {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/contracts" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Yangi shartnoma</h1>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Asosiy ma'lumotlar
              </h2>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <FileText size={12} />
                  Sarlavha *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Shartnoma sarlavhasi"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white ${
                    errors.title ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X size={12} />
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  Tur
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                >
                  <option value="customer">Mijoz bilan</option>
                  <option value="supplier">Ta'minotchi bilan</option>
                  <option value="partnership">Hamkorlik</option>
                  <option value="service">Xizmat</option>
                </select>
              </div>

              {formData.type === 'customer' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <User size={12} />
                    Mijoz *
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white ${
                      errors.customerId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <option value="">Mijozni tanlang...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </select>
                  {errors.customerId && (
                    <p className="text-xs text-red-600 dark:text-red-400">{errors.customerId}</p>
                  )}
                </div>
              )}

              {formData.type === 'supplier' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Building2 size={12} />
                    Ta'minotchi *
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white ${
                      errors.supplierId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <option value="">Ta'minotchini tanlang...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {errors.supplierId && (
                    <p className="text-xs text-red-600 dark:text-red-400">{errors.supplierId}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Calendar size={12} />
                    Boshlanish sanasi *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white ${
                      errors.startDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-xs text-red-600 dark:text-red-400">{errors.startDate}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Calendar size={12} />
                    Tugash sanasi *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white ${
                      errors.endDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <X size={12} />
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <DollarSign size={12} />
                    Summa
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white ${
                      errors.value ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.value && (
                    <p className="text-xs text-red-600 dark:text-red-400">{errors.value}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Valyuta
                  </label>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="UZS">UZS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Tavsif
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Shartnoma haqida qisqa tavsif..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Shartlar
              </h2>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Shartlar va qoidalarni kiriting
                </label>
                <textarea
                  value={formData.terms}
                  onChange={e => setFormData({ ...formData, terms: e.target.value })}
                  rows={4}
                  placeholder="Shartnoma shartlari..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Fayllar (ixtiyoriy)
              </h2>

              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {attachments.length > 0 
                        ? `${attachments.length} fayl tanland` 
                        : 'Fayllarni yuklash'}
                    </p>
                    <p className="text-xs text-slate-500">Rasm, PDF yoki Word</p>
                  </div>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-800 dark:text-white truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/contracts"
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
              >
                Bekor qilish
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Yuborilmoqda...' : (
                  <>
                    <Save size={18} />
                    Saqlash
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
