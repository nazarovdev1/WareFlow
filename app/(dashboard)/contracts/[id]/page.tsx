'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, FileText, Calendar, DollarSign, User, Building2, Download, Trash2, Edit, CheckCircle, Clock, AlertTriangle, Plus, Save } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/lib/NotificationContext';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: string;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  startDate: string;
  endDate?: string;
  value?: number;
  currency: string;
  description?: string;
  terms?: string;
  customerId?: string;
  customer?: { fullName: string; phone?: string; address?: string };
  supplierId?: string;
  supplier?: { name: string; phone?: string; address?: string };
  attachments?: ContractAttachment[];
  payments?: ContractPayment[];
  createdAt: string;
  updatedAt: string;
}

interface ContractAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  description?: string;
  createdAt: string;
}

interface ContractPayment {
  id: string;
  amount: number;
  currency: string;
  dueDate: string;
  paidDate?: string;
  isPaid: boolean;
  notes?: string;
}

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useNotification();
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [addingPayment, setAddingPayment] = useState(false);
  
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    dueDate: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadContract();
  }, [params.id]);

  const loadContract = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setContract(data);
      } else {
        error('Xatolik', 'Shartnoma topilmadi');
        router.push('/contracts');
      }
    } catch (err) {
      error('Xatolik', 'Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!contract) return;
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Holat yangilandi');
        loadContract();
      } else {
        error('Xatolik', 'Holatni yangilashda xatolik');
      }
    } catch (err) {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const addPayment = async () => {
    if (!contract) return;
    
    const newErrors: Record<string, string> = {};
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      newErrors.amount = 'Summa kiritilishi shart';
    }
    if (!paymentForm.dueDate) {
      newErrors.dueDate = 'To\'lov sanasi kiritilishi shart';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      error('Xatolik', 'Barcha maydonlarni to\'ldiring');
      return;
    }

    try {
      const res = await fetch(`/api/contracts/${contract.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount),
          dueDate: paymentForm.dueDate,
          notes: paymentForm.notes || null,
          currency: contract.currency,
        }),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'To\'lov rejasi qo\'shildi');
        setPaymentForm({ amount: '', dueDate: '', notes: '' });
        setAddingPayment(false);
        loadContract();
      } else {
        error('Xatolik', 'To\'lov qo\'shishda xatolik');
      }
    } catch (err) {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const markAsPaid = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/contracts/${params.id}/payments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, isPaid: true, paidDate: new Date().toISOString() }),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'To\'lov belgilandi');
        loadContract();
      } else {
        error('Xatolik', 'To\'lovni belgilashda xatolik');
      }
    } catch (err) {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-full">Qoralama</span>;
      case 'ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Faol</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-700 rounded-full flex items-center gap-1"><Clock size={12} /> Muddati tugagan</span>;
      case 'TERMINATED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-full">Bekor qilingan</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen pb-6">
        <div className="px-6 py-12 text-center text-slate-400">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="w-full min-h-screen pb-6">
        <div className="px-6 py-12 text-center text-slate-400">Shartnoma topilmadi</div>
      </div>
    );
  }

  const totalPayments = contract.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const paidAmount = contract.payments?.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/contracts" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{contract.contractNumber}</h1>
          {getStatusBadge(contract.status)}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FileText size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shartnoma qiymati</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {contract.value ? `${contract.value.toLocaleString()} ${contract.currency}` : '-'}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">To'langan</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {paidAmount.toLocaleString()} {contract.currency}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kutilmoqda</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {(totalPayments - paidAmount).toLocaleString()} {contract.currency}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Asosiy ma'lumotlar
                </h2>
                {contract.status === 'DRAFT' && (
                  <button
                    onClick={() => updateStatus('ACTIVE')}
                    className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                  >
                    Faol qilish
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sarlavha</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">{contract.title}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Raqam</div>
                  <div className="text-sm font-mono text-slate-800 dark:text-white">{contract.contractNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tur</div>
                  <div className="text-sm text-slate-800 dark:text-white capitalize">{contract.type}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Boshlanish</div>
                    <div className="text-sm text-slate-800 dark:text-white flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(contract.startDate).toLocaleDateString('uz-UZ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tugash</div>
                    <div className="text-sm text-slate-800 dark:text-white flex items-center gap-1">
                      <Calendar size={12} />
                      {contract.endDate ? new Date(contract.endDate).toLocaleDateString('uz-UZ') : 'Belgilanmagan'}
                    </div>
                  </div>
                </div>
                {contract.description && (
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tavsif</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{contract.description}</div>
                  </div>
                )}
                {contract.terms && (
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shartlar</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{contract.terms}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Qatnashchi
              </h2>

              {contract.customer ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{contract.customer.fullName}</div>
                      {contract.customer.phone && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">{contract.customer.phone}</div>
                      )}
                      {contract.customer.address && (
                        <div className="text-xs text-slate-500">{contract.customer.address}</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : contract.supplier ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{contract.supplier.name}</div>
                      {contract.supplier.phone && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">{contract.supplier.phone}</div>
                      )}
                      {contract.supplier.address && (
                        <div className="text-xs text-slate-500">{contract.supplier.address}</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">Qatnanmagan shartnoma</div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  To'lov rejasi
                </h2>
                {!addingPayment && contract.status === 'ACTIVE' && (
                  <button
                    onClick={() => setAddingPayment(true)}
                    className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 flex items-center gap-1"
                  >
                    <Plus size={12} />
                    To'lov qo'shish
                  </button>
                )}
              </div>

              {addingPayment && (
                <div className="space-y-3 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        value={paymentForm.amount}
                        onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        placeholder="Summa"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={paymentForm.dueDate}
                        onChange={e => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={paymentForm.notes}
                    onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    placeholder="Izohlar"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none text-slate-800 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addPayment}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
                    >
                      Qo'shish
                    </button>
                    <button
                      onClick={() => { setAddingPayment(false); setPaymentForm({ amount: '', dueDate: '', notes: '' }); }}
                      className="flex-1 px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                      Bekor
                    </button>
                  </div>
                </div>
              )}

              {contract.payments && contract.payments.length > 0 ? (
                <div className="space-y-2">
                  {contract.payments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(payment => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {payment.amount.toLocaleString()} {payment.currency}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(payment.dueDate).toLocaleDateString('uz-UZ')}
                          </span>
                          {payment.isPaid && (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle size={12} />
                              To'langan: {new Date(payment.paidDate!).toLocaleDateString('uz-UZ')}
                            </span>
                          )}
                        </div>
                      </div>
                      {!payment.isPaid && (
                        <button
                          onClick={() => markAsPaid(payment.id)}
                          className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                        >
                          To'lash
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400 text-sm">
                  To'lov rejasi yo'q
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Fayllar
              </h2>

              {contract.attachments && contract.attachments.length > 0 ? (
                <div className="space-y-2">
                  {contract.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText size={16} className="text-slate-400" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800 dark:text-white truncate">{attachment.fileName}</div>
                          {attachment.fileSize && (
                            <div className="text-xs text-slate-500">{(attachment.fileSize / 1024).toFixed(1)} KB</div>
                          )}
                        </div>
                      </div>
                      <a
                        href={attachment.fileUrl}
                        download
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400 text-sm">
                  Fayllar yo'q
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
