'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Save, Code, Layout, Eye, Palette, Type, Globe, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/lib/NotificationContext';

const DOC_TYPE_LABELS: Record<string, string> = {
  INVOICE: 'Hisob-faktura',
  RECEIPT: 'Chek',
  WAYBILL: 'Yo\'l xati',
  ACT: 'Dalolatnoma',
  CUSTOM: 'Maxsus',
};

const PAPER_SIZES = [
  { value: 'A4', label: 'A4 (210×297mm)' },
  { value: 'A5', label: 'A5 (148×210mm)' },
  { value: '80mm', label: 'Termal 80mm' },
  { value: '58mm', label: 'Termal 58mm' },
];

export default function AddTemplatePage() {
  const router = useRouter();
  const { success, error } = useNotification();

  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'visual' | 'advanced'>('visual');

  const [formData, setFormData] = useState({
    name: '',
    type: 'INVOICE',
    content: '',
    paperSize: 'A4',
    orientation: 'portrait',
    isDefault: false,
    isActive: true,
  });

  const [visualData, setVisualData] = useState({
    companyName: 'Mening Kompaniyam',
    address: 'Toshkent sh., Chilonzor tumani',
    phone: '+998 90 123 45 67',
    email: 'info@company.uz',
    website: 'www.company.uz',
    inn: '123456789',
    primaryColor: '#4f46e5',
    notes: 'Xaridingiz uchun rahmat!',
    showLogo: true,
    fontSize: '12px',
  });

  const generateHTML = useCallback((isPreview = false) => {
    const { companyName, address, phone, email, website, inn, primaryColor, notes, fontSize } = visualData;
    const docTypeLabel = DOC_TYPE_LABELS[formData.type] || 'HUJJAT';
    const isThermal = formData.paperSize === '80mm' || formData.paperSize === '58mm';

    const docNum = isPreview ? '2026-0001' : '{{docNumber}}';
    const docDate = isPreview ? new Date().toLocaleDateString('uz-UZ') : '{{date}}';
    const custName = isPreview ? 'Falonchiyev Pismadonchi' : '{{customerName}}';
    const custPhone = isPreview ? '+998 99 999 99 99' : '{{customerPhone}}';

    if (isThermal) {
      const width = formData.paperSize === '80mm' ? '72mm' : '50mm';
      return `<!DOCTYPE html>
<html>
<head>
  <style>
    @media print {
      @page { size: ${formData.paperSize} auto; margin: 0; }
      body { width: ${width}; margin: 0 auto; }
    }
    body { font-family: 'Courier New', monospace; font-size: 10pt; color: #000; margin: 0; padding: 0; background: white; }
    .container { width: ${width}; padding: 4mm; box-sizing: border-box; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .header { border-bottom: 1px dashed #000; padding-bottom: 4mm; margin-bottom: 4mm; }
    .header h1 { font-size: 12pt; margin: 0 0 2mm 0; }
    .header p { font-size: 8pt; margin: 1mm 0; }
    .info { margin-bottom: 4mm; }
    .info-row { display: flex; justify-content: space-between; font-size: 9pt; margin: 1mm 0; }
    .items { border-top: 1px solid #000; border-bottom: 1px solid #000; margin: 4mm 0; padding: 2mm 0; }
    .item-row { display: flex; justify-content: space-between; font-size: 9pt; margin: 1mm 0; }
    .item-name { flex: 1; }
    .item-qty { width: 15mm; text-align: center; }
    .item-price { width: 20mm; text-align: right; }
    .totals { margin-top: 4mm; }
    .total-row { display: flex; justify-content: space-between; font-size: 9pt; margin: 1mm 0; }
    .grand-total { font-size: 11pt; font-weight: bold; border-top: 1px solid #000; padding-top: 2mm; margin-top: 2mm; }
    .footer { margin-top: 6mm; text-align: center; font-size: 8pt; border-top: 1px dashed #000; padding-top: 4mm; }
    .cut-line { text-align: center; font-size: 8pt; margin-top: 4mm; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header center">
      <h1 class="bold">${companyName}</h1>
      <p>${address}</p>
      <p>Tel: ${phone}</p>
      ${inn ? `<p>INN: ${inn}</p>` : ''}
    </div>
    <div class="info">
      <div class="center bold" style="font-size: 11pt; margin-bottom: 3mm;">${docTypeLabel}</div>
      <div class="info-row"><span>№:</span><span>${docNum}</span></div>
      <div class="info-row"><span>Sana:</span><span>${docDate}</span></div>
      <div class="info-row"><span>Mijoz:</span><span>${custName}</span></div>
    </div>
    <div class="items">
      <div class="item-row bold" style="border-bottom: 1px solid #000; padding-bottom: 1mm; margin-bottom: 2mm;">
        <span class="item-name">Mahsulot</span>
        <span class="item-qty">Soni</span>
        <span class="item-price">Jami</span>
      </div>
      ${isPreview ? `
      <div class="item-row"><span class="item-name">Mahsulot 1</span><span class="item-qty">2</span><span class="item-price">100,000</span></div>
      <div class="item-row"><span class="item-name">Mahsulot 2</span><span class="item-qty">1</span><span class="item-price">25,000</span></div>
      ` : '{{#items}}<div class="item-row"><span class="item-name">{{name}}</span><span class="item-qty">{{quantity}}</span><span class="item-price">{{total}}</span></div>{{/items}}'}
    </div>
    <div class="totals">
      <div class="total-row"><span>Jami:</span><span>${isPreview ? '125,000' : '{{totalAmount}}'}</span></div>
      <div class="total-row"><span>Chegirma:</span><span>${isPreview ? '5,000' : '{{discount}}'}</span></div>
      <div class="total-row grand-total"><span>TO'LOV:</span><span>${isPreview ? '120,000' : '{{finalAmount}}'}</span></div>
    </div>
    <div class="footer">
      <p>${notes}</p>
      <p>${website}</p>
      <p style="margin-top: 3mm;">Rahmat!</p>
    </div>
    <div class="cut-line">- - - - - - - - - -</div>
  </div>
</body>
</html>`;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <style>
    @media print {
      @page { size: ${formData.paperSize} ${formData.orientation}; margin: 10mm; }
    }
    body { font-family: 'Inter', -apple-system, sans-serif; font-size: ${fontSize}; color: #1e293b; margin: 0; padding: 0; }
    .container { padding: 40px; background: white; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; }
    .company-info h1 { margin: 0; color: ${primaryColor}; font-size: 24px; font-weight: 800; text-transform: uppercase; }
    .company-info p { margin: 4px 0; color: #64748b; font-size: 11px; }
    .doc-title { text-align: right; }
    .doc-title h2 { margin: 0; font-size: 28px; font-weight: 900; color: #0f172a; }
    .doc-title p { margin: 4px 0; color: #64748b; font-weight: 700; }
    .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .details-box h4 { margin: 0 0 8px 0; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
    .details-box p { margin: 2px 0; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
    th { text-align: left; padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; }
    td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-weight: 500; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-table { width: 250px; }
    .totals-table tr td { padding: 8px 0; border: none !important; }
    .totals-table tr td:last-child { text-align: right; font-weight: 800; color: #0f172a; }
    .totals-table tr.grand-total td { font-size: 18px; color: ${primaryColor}; border-top: 2px solid #f1f5f9 !important; padding-top: 12px; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-info">
        <h1>${companyName}</h1>
        <p>${address}</p>
        <p>${phone}</p>
        <p>${email}</p>
        ${inn ? `<p>INN: ${inn}</p>` : ''}
      </div>
      <div class="doc-title">
        <h2>${docTypeLabel}</h2>
        <p>#${docNum}</p>
        <p>${docDate}</p>
      </div>
    </div>

    <div class="details">
      <div class="details-box">
        <h4>Kimga</h4>
        <p>${custName}</p>
        <p>${custPhone}</p>
      </div>
      <div class="details-box" style="text-align: right">
        <h4>To'lov holati</h4>
        <p style="color: ${primaryColor}">Kutilmoqda</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Mahsulot</th>
          <th style="text-align: center">Soni</th>
          <th style="text-align: right">Narxi</th>
          <th style="text-align: right">Jami</th>
        </tr>
      </thead>
      <tbody>
        ${isPreview ? `
        <tr><td>Mahsulot 1</td><td style="text-align: center">2 dona</td><td style="text-align: right">50,000</td><td style="text-align: right">100,000</td></tr>
        <tr><td>Mahsulot 2</td><td style="text-align: center">1 dona</td><td style="text-align: right">25,000</td><td style="text-align: right">25,000</td></tr>
        ` : `
        {{#items}}
        <tr>
          <td>{{name}}</td>
          <td style="text-align: center">{{quantity}} {{unit}}</td>
          <td style="text-align: right">{{price}}</td>
          <td style="text-align: right">{{total}}</td>
        </tr>
        {{/items}}
        `}
      </tbody>
    </table>

    <div class="totals" style="display: flex; justify-content: flex-end;">
      <table class="totals-table">
        <tr>
          <td>Subtotal</td>
          <td>${isPreview ? '125,000' : '{{totalAmount}}'}</td>
        </tr>
        <tr>
          <td>Chegirma</td>
          <td>${isPreview ? '5,000' : '{{discount}}'}</td>
        </tr>
        <tr class="grand-total">
          <td>JAMI</td>
          <td>${isPreview ? '120,000' : '{{finalAmount}}'}</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>${notes}</p>
      <p>${website}</p>
    </div>
  </div>
</body>
</html>`;
  }, [visualData, formData.type, formData.paperSize, formData.orientation]);

  useEffect(() => {
    if (mode === 'visual') {
      setFormData(prev => ({ ...prev, content: generateHTML(false) }));
    }
  }, [visualData, mode, formData.type, formData.paperSize, generateHTML]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      error('Xatolik', 'Shablon nomini kiritishingiz shart');
      return false;
    }
    if (!formData.content.trim()) {
      error('Xatolik', 'Shablon kontentini kiritishingiz shart');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/print-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Shablon yaratildi');
        router.push('/print-templates');
      } else {
        const data = await res.json();
        error('Xatolik', data.error || 'Yaratishda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    } finally {
      setSaving(false);
    }
  };

  const isThermal = formData.paperSize === '80mm' || formData.paperSize === '58mm';
  const previewWidth = isThermal ? 'auto' : formData.paperSize === 'A4' ? '210mm' : '148mm';
  const previewMinHeight = isThermal ? 'auto' : '297mm';

  return (
    <div className="w-full min-h-screen pb-12 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/print-templates" className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Yangi shablon</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hujjat ko'rinishini sozlash</p>
            </div>
          </div>

          <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setMode('visual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                mode === 'visual' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Layout size={16} /> Vizual rejim
            </button>
            <button
              onClick={() => setMode('advanced')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                mode === 'advanced' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Code size={16} /> Advanced (HTML)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Editor Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Palette size={18} />
                  <span className="text-sm font-black uppercase tracking-widest">Asosiy sozlamalar</span>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Shablon nomi *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masalan: Asosiy Hisob-faktura"
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-slate-800 dark:text-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Hujjat turi</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none text-slate-800 dark:text-white"
                    >
                      {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Qog'oz o'lchami</label>
                    <select
                      value={formData.paperSize}
                      onChange={e => setFormData({ ...formData, paperSize: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none text-slate-800 dark:text-white"
                    >
                      {PAPER_SIZES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {mode === 'visual' ? (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2 flex items-center gap-1.5">
                          <Type size={12} /> Kompaniya nomi
                        </label>
                        <input
                          type="text"
                          value={visualData.companyName}
                          onChange={e => setVisualData({ ...visualData, companyName: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2 flex items-center gap-1.5">
                          <MapPin size={12} /> Manzil
                        </label>
                        <input
                          type="text"
                          value={visualData.address}
                          onChange={e => setVisualData({ ...visualData, address: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2 flex items-center gap-1.5">
                          <Phone size={12} /> Telefon
                        </label>
                        <input
                          type="text"
                          value={visualData.phone}
                          onChange={e => setVisualData({ ...visualData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2 flex items-center gap-1.5">
                          <Mail size={12} /> Email
                        </label>
                        <input
                          type="text"
                          value={visualData.email}
                          onChange={e => setVisualData({ ...visualData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2 flex items-center gap-1.5">
                          <Globe size={12} /> Veb-sayt
                        </label>
                        <input
                          type="text"
                          value={visualData.website}
                          onChange={e => setVisualData({ ...visualData, website: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2 flex items-center gap-1.5">
                          <Palette size={12} /> Asosiy rang
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={visualData.primaryColor}
                            onChange={e => setVisualData({ ...visualData, primaryColor: e.target.value })}
                            className="h-11 w-11 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                          />
                          <input
                            type="text"
                            value={visualData.primaryColor}
                            onChange={e => setVisualData({ ...visualData, primaryColor: e.target.value })}
                            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Qisqa eslatma (Footer)</label>
                      <textarea
                        value={visualData.notes}
                        onChange={e => setVisualData({ ...visualData, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm resize-none h-20"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">HTML Kontent</label>
                    <textarea
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                      className="w-full h-[400px] font-mono text-[11px] bg-slate-900 text-slate-300 p-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none leading-relaxed"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/print-templates" className="flex-1 px-8 py-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[11px] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 transition-all text-center">
                Bekor qilish
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Saqlanmoqda...' : 'Shablonni saqlash'}
              </button>
            </div>
          </div>

          {/* Preview Column */}
          <div className="relative">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden min-h-[800px] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Eye size={18} />
                    <span className="text-sm font-black uppercase tracking-widest">Jonli ko'rinish</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="flex-1 p-8 bg-slate-200/50 dark:bg-slate-950/50 overflow-auto flex justify-center">
                  {isThermal ? (
                    <div className="bg-white shadow-2xl" style={{ width: 'auto', maxWidth: '100%' }}>
                      <div
                        style={{
                          width: formData.paperSize === '80mm' ? '80mm' : '58mm',
                          minHeight: 'auto',
                          fontSize: '10pt',
                          fontFamily: "'Courier New', monospace",
                        }}
                        dangerouslySetInnerHTML={{ __html: mode === 'visual' ? generateHTML(true) : formData.content }}
                      />
                    </div>
                  ) : (
                    <div 
                      className="bg-white shadow-2xl origin-top transition-all"
                      style={{ 
                        width: previewWidth,
                        minHeight: previewMinHeight,
                        transform: 'scale(0.65)',
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: mode === 'visual' ? generateHTML(true) : formData.content }} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-bold leading-relaxed text-center">
                  <span className="opacity-60 uppercase mr-1">Eslatma:</span>
                  {isThermal 
                    ? 'Termal printer uchun monospace shrift va qisqartirilgan joy ishlatiladi.' 
                    : 'Hujjat chop etilganda ushbu ko\'rinishda chiqadi. Ma\'lumotlar dinamik ravishda o\'zgaradi.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
