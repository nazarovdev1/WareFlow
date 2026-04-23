'use client';

import { useReactToPrint } from 'react-to-print';
import { useRef, forwardRef } from 'react';
import { Printer } from 'lucide-react';
import { Order, CompanySettings } from '@/lib/types';

interface InvoiceTemplateProps {
  order: Order;
  settings?: CompanySettings;
  paperSize?: 'A4' | 'A5' | '80mm' | '58mm';
  ref?: React.Ref<HTMLDivElement>;
}

function formatNumber(num: number) {
  return num.toLocaleString('uz-UZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ order, settings, paperSize = 'A4' }, ref) => {
    const formatDate = (date: Date) =>
      new Date(date).toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

    const companySettings = settings || {
      companyName: 'IBOX',
      address: 'Toshkent sh., O\'zbekiston',
      phone: '+998 71 200 00 00',
      email: 'info@ibox.uz',
      inn: '123456789',
    };

    const isThermal = paperSize === '80mm' || paperSize === '58mm';

    if (isThermal) {
      const width = paperSize === '80mm' ? '72mm' : '50mm';
      return (
        <div ref={ref} style={{ fontFamily: "'Courier New', monospace", fontSize: '10pt', color: '#000', width, padding: '4mm', boxSizing: 'border-box', background: 'white' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '4mm', marginBottom: '4mm' }}>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2mm' }}>{companySettings.companyName}</div>
            <div style={{ fontSize: '8pt', margin: '1mm 0' }}>{companySettings.address}</div>
            <div style={{ fontSize: '8pt', margin: '1mm 0' }}>Tel: {companySettings.phone}</div>
            {companySettings.inn && <div style={{ fontSize: '8pt', margin: '1mm 0' }}>INN: {companySettings.inn}</div>}
          </div>

          <div style={{ textAlign: 'center', fontSize: '11pt', fontWeight: 'bold', marginBottom: '3mm' }}>SAVDO CHEKI</div>

          <div style={{ marginBottom: '4mm' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', margin: '1mm 0' }}>
              <span>№:</span><span>{order.docNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', margin: '1mm 0' }}>
              <span>Sana:</span><span>{formatDate(order.date)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', margin: '1mm 0' }}>
              <span>Mijoz:</span>
              <span>{order.customer?.fullName || 'Chakana'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', margin: '1mm 0' }}>
              <span>Ombor:</span>
              <span>{order.warehouse?.name || '-'}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', margin: '4mm 0', padding: '2mm 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '1mm', marginBottom: '2mm' }}>
              <span style={{ flex: 1 }}>Mahsulot</span>
              <span style={{ width: '15mm', textAlign: 'center' }}>Soni</span>
              <span style={{ width: '20mm', textAlign: 'right' }}>Jami</span>
            </div>
            {order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', margin: '1mm 0' }}>
                <span style={{ flex: 1 }}>{item.product?.name || '-'}</span>
                <span style={{ width: '15mm', textAlign: 'center' }}>{item.quantity}</span>
                <span style={{ width: '20mm', textAlign: 'right' }}>${formatNumber(item.total)}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '4mm' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', margin: '1mm 0' }}>
              <span>Jami:</span><span>${formatNumber(order.totalAmount)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', margin: '1mm 0' }}>
                <span>Chegirma:</span><span>-${formatNumber(order.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11pt', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '2mm', marginTop: '2mm' }}>
              <span>TO'LOV:</span><span>${formatNumber(order.finalAmount)}</span>
            </div>
          </div>

          <div style={{ marginTop: '6mm', textAlign: 'center', fontSize: '8pt', borderTop: '1px dashed #000', paddingTop: '4mm' }}>
            <p>To'lov turi: {order.paymentMethod === 'CASH' ? 'Naqd' : order.paymentMethod === 'CARD' ? 'Karta' : order.paymentMethod === 'TRANSFER' ? 'O\'tkazma' : '-'}</p>
            <p style={{ marginTop: '3mm' }}>Rahmat!</p>
            <p>{companySettings.phone}</p>
          </div>
          <div style={{ textAlign: 'center', fontSize: '8pt', marginTop: '4mm', letterSpacing: '2px' }}>- - - - - - - - - -</div>
        </div>
      );
    }

    return (
      <div ref={ref} className="bg-white text-black p-8 max-w-2xl mx-auto">
        <div className="border-b-2 border-slate-800 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{companySettings.companyName}</h1>
              <p className="text-sm text-slate-600 mt-1">{companySettings.address}</p>
              <p className="text-sm text-slate-600">Tel: {companySettings.phone}</p>
              <p className="text-sm text-slate-600">Email: {companySettings.email}</p>
              <p className="text-sm text-slate-600">INN: {companySettings.inn}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-slate-900">SAVDO CHECK</h2>
              <p className="text-sm text-slate-600 mt-2">
                Hujjat №: <span className="font-semibold">{order.docNumber}</span>
              </p>
              <p className="text-sm text-slate-600">
                Sana: <span className="font-semibold">{formatDate(order.date)}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Mijoz ma'lumotlari</h3>
              <p className="text-sm text-slate-600">
                {order.customer ? (
                  <>
                    <span className="font-semibold">{order.customer.fullName}</span>
                    <br />
                    <span className="text-xs">{order.customer.phone || '-'}</span>
                  </>
                ) : (
                  'Savdo naqd'
                )}
              </p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-slate-900 mb-1">Ombor</h3>
              <p className="text-sm text-slate-600">
                <span className="font-semibold">{order.warehouse?.name || '-'}</span>
                <br />
                <span className="text-xs">{order.warehouse?.address || ''}</span>
              </p>
            </div>
          </div>
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-slate-800">
              <th className="text-left py-2 text-sm font-semibold text-slate-900">№</th>
              <th className="text-left py-2 text-sm font-semibold text-slate-900">Mahsulot</th>
              <th className="text-right py-2 text-sm font-semibold text-slate-900">Soni</th>
              <th className="text-right py-2 text-sm font-semibold text-slate-900">Narxi</th>
              <th className="text-right py-2 text-sm font-semibold text-slate-900">Jami</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index: number) => (
              <tr key={item.id} className="border-b border-slate-200">
                <td className="py-2 text-sm text-slate-700">{index + 1}</td>
                <td className="py-2 text-sm text-slate-700">
                  <div className="font-medium">{item.product?.name || '-'}</div>
                  {item.product?.sku && <div className="text-xs text-slate-500">SKU: {item.product.sku}</div>}
                </td>
                <td className="py-2 text-sm text-slate-700 text-right">{item.quantity}</td>
                <td className="py-2 text-sm text-slate-700 text-right">${formatNumber(item.price)}</td>
                <td className="py-2 text-sm text-slate-700 text-right font-medium">${formatNumber(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-800">
              <td colSpan={4} className="py-3 text-sm font-semibold text-slate-900 text-right">Jami:</td>
              <td className="py-3 text-sm font-bold text-slate-900 text-right">${formatNumber(order.totalAmount)}</td>
            </tr>
            {order.discount && order.discount > 0 && (
              <tr>
                <td colSpan={4} className="py-2 text-sm text-slate-700 text-right">Chegirma:</td>
                <td className="py-2 text-sm text-slate-700 text-right">-${formatNumber(order.discount)}</td>
              </tr>
            )}
            <tr className="border-t-2 border-slate-800 bg-slate-50">
              <td colSpan={4} className="py-3 text-base font-bold text-slate-900 text-right">To'lov summasi:</td>
              <td className="py-3 text-base font-bold text-teal-600 text-right">${formatNumber(order.finalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="flex justify-between items-start mb-6">
          <div className="w-1/2">
            <h3 className="font-semibold text-slate-900 mb-2">To'lov turi:</h3>
            <p className="text-sm text-slate-700">
              {order.paymentMethod === 'CASH' && 'Naqd'}
              {order.paymentMethod === 'CARD' && 'Karta'}
              {order.paymentMethod === 'TRANSFER' && 'O\'tkazma'}
              {!order.paymentMethod && '-'}
            </p>
          </div>
          <div className="w-1/2">
            <h3 className="font-semibold text-slate-900 mb-2">Holat:</h3>
            <p className="text-sm text-slate-700">
              {order.status === 'COMPLETED' && '✅ Bajarildi'}
              {order.status === 'CANCELLED' && '❌ Bekor qilindi'}
              {order.status === 'RETURNED' && '🔄 Qaytarildi'}
              {order.status === 'DRAFT' && '📝 Qoralama'}
            </p>
          </div>
        </div>

        {order.notes && (
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">Izoh:</h3>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{order.notes}</p>
          </div>
        )}

        <div className="border-t-2 border-slate-800 pt-6 mt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-8">Sotuvchi: _________________</p>
              <p className="text-xs text-slate-600">Imzo: _________________</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-600 mb-8">Qabul qildi: _________________</p>
              <p className="text-xs text-slate-600">Imzo: _________________</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">Rahmat! Bizni tanlaganingiz uchun</p>
          <p className="text-xs text-slate-500 mt-1">{companySettings.phone} | {companySettings.email}</p>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';

export function InvoicePrintButton({
  order,
  settings,
  paperSize = 'A4',
}: {
  order: Order;
  settings?: CompanySettings;
  paperSize?: 'A4' | 'A5' | '80mm' | '58mm';
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${order.docNumber}`,
    pageStyle:
      paperSize === '80mm' || paperSize === '58mm'
        ? `@page { size: ${paperSize} auto; margin: 0; }`
        : `@page { size: ${paperSize}; margin: 10mm; }`,
    onAfterPrint: () => console.log('Print completed'),
  });

  return (
    <>
      <div style={{ display: 'none' }}>
        <InvoiceTemplate ref={printRef} order={order} settings={settings} paperSize={paperSize} />
      </div>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
      >
        <Printer size={16} />
        Chop etish
      </button>
    </>
  );
}

export default InvoiceTemplate;
