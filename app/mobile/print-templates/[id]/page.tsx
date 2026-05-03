'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, Trash2, FileText, Type, AlignLeft, Maximize2, RotateCcw } from 'lucide-react';
import { useNotification } from '@/lib/NotificationContext';

const TEMPLATE_TYPES = [
  { value: 'invoice', label: 'Hisob-faktura' },
  { value: 'receipt', label: 'Chek' },
  { value: 'waybill', label: "Yo'l varaqasi" },
  { value: 'label', label: 'Yorliq' },
  { value: 'contract', label: 'Shartnoma' },
  { value: 'act', label: 'Akt' },
];

const PAPER_SIZES = [
  { value: 'A4', label: 'A4' },
  { value: 'A5', label: 'A5' },
  { value: '58mm', label: '58mm (Termo)' },
  { value: '80mm', label: '80mm (Termo)' },
];

export default function MobilePrintTemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'invoice',
    content: '',
    paperSize: 'A4',
    orientation: 'portrait',
    isActive: true,
    isDefault: false,
  });

  useEffect(() => {
    if (params.id) {
      fetch(`/api/print-templates/${params.id}`)
        .then(r => r.json())
        .then(data => {
          setForm({
            name: data.name || '',
            type: data.type || 'invoice',
            content: data.content || '',
            paperSize: data.paperSize || 'A4',
            orientation: data.orientation || 'portrait',
            isActive: data.isActive ?? true,
            isDefault: data.isDefault ?? false,
          });
          setLoading(false);
        })
        .catch(() => {
          error('Xatolik', 'Shablon yuklanmadi');
          setLoading(false);
        });
    }
  }, [params.id]);

  const handleSave = async () => {
    if (!form.name.trim()) { error('Xatolik', 'Nomi kiritilishi shart'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/print-templates/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Shablon yangilandi');
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Yangilashda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Bu shablonni o'chirishni xohlaysizmi?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/print-templates/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        success('Muvaffaqiyatli', "Shablon o'chirildi");
        router.push('/mobile/print-templates');
      } else {
        error('Xatolik', "O'chirishda xatolik");
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen pb-28">
        <MobileHeader title="Shablon" backHref="/mobile/print-templates" />
        <div className="px-6 mt-4 space-y-4">
          <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />
          <div className="h-48 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title={form.name || 'Shablon'}
        backHref="/mobile/print-templates"
        rightAction={
          <button onClick={handleSave} disabled={saving}
            className="px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-black rounded-xl active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1">
            <Save size={12} /> Saqlash
          </button>
        }
      />

      <div className="px-6 space-y-4 mt-2">
        {/* Basic Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asosiy ma'lumotlar</div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
              <Type size={10} /> Nomi *
            </label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
              <FileText size={10} /> Turi
            </label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white">
              {TEMPLATE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Template Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shablon matni</div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
              <AlignLeft size={10} /> HTML/Markdown
            </label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white font-mono" />
          </div>
        </div>

        {/* Print Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chop etish sozlamalari</div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
              <Maximize2 size={10} /> Qog'oz o'lchami
            </label>
            <select value={form.paperSize} onChange={e => setForm({ ...form, paperSize: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white">
              {PAPER_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
              <RotateCcw size={10} /> Orientatsiya
            </label>
            <select value={form.orientation} onChange={e => setForm({ ...form, orientation: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white">
              <option value="portrait">Vertikal</option>
              <option value="landscape">Gorizontal</option>
            </select>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Faol</span>
            <button onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`w-12 h-7 rounded-full transition-colors ${form.isActive ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isActive ? 'translate-x-[26px]' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Default Toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Standart shablon</span>
            <button onClick={() => setForm(prev => ({ ...prev, isDefault: !prev.isDefault }))}
              className={`w-12 h-7 rounded-full transition-colors ${form.isDefault ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isDefault ? 'translate-x-[26px]' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50">
          <Save size={18} />
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>

        <button onClick={handleDelete} disabled={deleting}
          className="w-full py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50">
          <Trash2 size={18} />
          {deleting ? "O'chirilmoqda..." : "O'chirish"}
        </button>
      </div>
    </div>
  );
}
