'use client';

import MobileHeader from '@/components/mobile/MobileHeader';
import { useState } from 'react';
import { Save, FileText, Type, AlignLeft, Maximize2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export default function MobileAddPrintTemplatePage() {
  const router = useRouter();
  const { success, error } = useNotification();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'invoice',
    content: '',
    paperSize: 'A4',
    orientation: 'portrait',
    isActive: true,
    isDefault: false,
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) { error('Xatolik', 'Nomi kiritilishi shart'); return; }
    if (!form.content.trim()) { error('Xatolik', 'Shablon matni kiritilishi shart'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/print-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Shablon yaratildi');
        router.push('/mobile/print-templates');
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Yaratishda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSaving(false);
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Yangi shablon"
        backHref="/mobile/print-templates"
        rightAction={
          <button onClick={handleSubmit} disabled={saving}
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
              placeholder="Masalan: Chek 80mm"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white" />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
              <FileText size={10} /> Turi *
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
              <AlignLeft size={10} /> HTML/Markdown *
            </label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Shablon matnini kiriting..."
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

        {/* Submit */}
        <button onClick={handleSubmit} disabled={saving}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50">
          <Save size={18} />
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </div>
  );
}
