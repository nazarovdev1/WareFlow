'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Printer, Trash2, Settings } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useReactToPrint } from 'react-to-print';
import JsBarcode from 'jsbarcode';

export default function BarcodePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<any[]>([
    { id: 1, productId: '', barcode: '', quantity: 1, name: '', price: 0 }
  ]);
  const printRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Label settings
  const [labelWidth, setLabelWidth] = useState(50);
  const [labelHeight, setLabelHeight] = useState(30);
  const [showName, setShowName] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [fontSize, setFontSize] = useState(8);

  useEffect(() => {
    fetch('/api/products?limit=1000')
      .then(res => res.json())
      .then(data => {
        setProducts(data.data || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    const newItems = [...selectedItems];
    newItems[index] = {
      ...newItems[index],
      productId,
      name: product?.name || '',
      barcode: product?.barcode || '',
      price: product?.sellPrice || 0
    };
    setSelectedItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...selectedItems];
    newItems[index].quantity = quantity;
    setSelectedItems(newItems);
  };

  const addRow = () => {
    setSelectedItems([...selectedItems, { id: Date.now(), productId: '', barcode: '', quantity: 1, name: '', price: 0 }]);
  };

  const removeRow = (index: number) => {
    if (selectedItems.length === 1) return;
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  // Generate real barcode canvas
  const generateBarcodeCanvas = useCallback((barcode: string) => {
    if (!canvasRef.current || !barcode) return;
    try {
      JsBarcode(canvasRef.current, barcode, {
        format: "EAN13",
        width: 1.5,
        height: labelHeight * 0.4,
        displayValue: true,
        fontSize: fontSize,
        margin: 0,
        background: "#ffffff",
        lineColor: "#000000",
      });
    } catch (e) {
      console.error('Barcode generation error:', e);
    }
  }, [labelHeight, fontSize]);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Barcode Labels - WAREFLOW',
    onAfterPrint: () => console.log('Print completed'),
  });

  // Generate all labels for printing
  const generatePrintLabels = () => {
    const labels: any[] = [];
    selectedItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      for (let i = 0; i < item.quantity; i++) {
        labels.push({
          name: item.name || product?.name || 'Product Name',
          barcode: item.barcode || product?.barcode || '000000000000',
          price: product?.sellPrice?.toLocaleString() || item.price || '0'
        });
      }
    });
    return labels;
  };

  const printLabels = generatePrintLabels();

  const getPreviewBarcodeUrl = (barcode: string) => {
    if (!barcode || !canvasRef.current) return '';
    generateBarcodeCanvas(barcode);
    return canvasRef.current.toDataURL();
  };

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      {/* Hidden canvas for barcode generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('products', 'barcodePrint')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('products', 'barcodePrintDesc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('products', 'selectProducts')}</h2>
              <button
                onClick={addRow}
                className="text-teal-600 dark:text-teal-400 font-bold text-sm bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 rounded-lg flex items-center hover:bg-teal-100 dark:hover:bg-teal-900/40 transition"
              >
                <Plus size={16} className="mr-1" /> {t('common', 'add')}
              </button>
            </div>

            <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
              <div className="col-span-1">#</div>
              <div className="col-span-5">{t('products', 'title')} Nomi</div>
              <div className="col-span-2">{t('products', 'barcode')}</div>
              <div className="col-span-2">{t('common', 'quantity')}</div>
              <div className="col-span-2"></div>
            </div>

            <div className="space-y-3">
              {selectedItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-700/50 p-2 text-sm rounded-lg border border-slate-100 dark:border-slate-700 group">
                  <div className="col-span-1 font-bold text-center dark:text-slate-300">{index + 1}</div>
                  <div className="col-span-5">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-600 border-none p-2.5 rounded-md focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <option value="">{t('products', 'title')}ni tanlang...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} className="dark:bg-slate-600">{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.barcode}
                      readOnly
                      placeholder={t('products', 'barcode')}
                      className="w-full bg-slate-100 dark:bg-slate-600 border-none p-2.5 rounded-md outline-none text-slate-400 dark:text-slate-500 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div className="col-span-2 flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-100 dark:bg-slate-600 border-none p-2.5 rounded-md focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-700 dark:text-slate-200 font-medium text-center"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end space-x-1">
                    {item.productId && (
                      <button
                        onClick={() => {
                          const p = products.find(x => x.id === item.productId);
                          if (p) window.open(getPreviewBarcodeUrl(p.barcode));
                        }}
                        className="text-slate-300 dark:text-slate-500 hover:text-teal-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Ko'rish"
                      >
                        <Settings size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => removeRow(index)}
                      className="text-slate-300 dark:text-slate-500 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="O'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Label Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">{t('products', 'labelSettings')}</h2>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{t('products', 'labelWidth')} ({labelWidth} mm)</div>
                <div className="flex items-center space-x-4">
                   <input
                     type="range"
                     min="20"
                     max="100"
                     value={labelWidth}
                     onChange={(e) => setLabelWidth(Number(e.target.value))}
                     className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full cursor-pointer accent-teal-600"
                   />
                   <div className="bg-slate-50 dark:bg-slate-700 px-4 py-2 font-bold text-slate-700 dark:text-slate-200 rounded-lg w-16 text-center border border-slate-100 dark:border-slate-600">{labelWidth}</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{t('products', 'labelHeight')} ({labelHeight} mm)</div>
                <div className="flex items-center space-x-4">
                   <input
                     type="range"
                     min="15"
                     max="80"
                     value={labelHeight}
                     onChange={(e) => setLabelHeight(Number(e.target.value))}
                     className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full cursor-pointer accent-teal-600"
                   />
                   <div className="bg-slate-50 dark:bg-slate-700 px-4 py-2 font-bold text-slate-700 dark:text-slate-200 rounded-lg w-16 text-center border border-slate-100 dark:border-slate-600">{labelHeight}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showName}
                  onChange={(e) => setShowName(e.target.checked)}
                  className="w-5 h-5 rounded accent-teal-600"
                />
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{t('common', 'name')}ni qo'shish</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBarcode}
                  onChange={(e) => setShowBarcode(e.target.checked)}
                  className="w-5 h-5 rounded accent-teal-600"
                />
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{t('products', 'barcode')}ni qo'shish</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="w-5 h-5 rounded accent-teal-600"
                />
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{t('common', 'price')}ni qo'shish</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Preview Box */}
        <div className="sticky top-8">
          <div className="border-[2.5px] border-dashed border-slate-200 dark:border-slate-700 rounded-2xl h-[420px] flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-10">{t('common', 'preview')}</h3>

            <div className="w-full bg-white shadow-xl rounded-sm p-4 relative overflow-hidden" style={{
              width: `${labelWidth}mm`,
              height: `${labelHeight}mm`,
              transform: 'scale(2)',
              transformOrigin: 'center center',
              marginBottom: '80px'
            }}>
               {showName && (
                 <div className="text-center mb-1 h-5 flex flex-col justify-center">
                   <h4 className="font-bold text-[8px] tracking-wide text-slate-800 uppercase truncate">
                     {selectedItems[0]?.name || t('products', 'title') + ' Nomi'}
                   </h4>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8 space-x-4">
        <button className="px-8 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition">
          {t('common', 'cancel')}
        </button>
        <button
          onClick={handlePrint}
          className="px-8 py-3 bg-[#111827] dark:bg-slate-700 hover:bg-[#1f2937] dark:hover:bg-slate-600 text-white font-bold rounded-xl flex items-center shadow-lg shadow-black/20 transition"
        >
          <Printer size={18} className="mr-2" /> {t('products', 'barcodePrint')}
        </button>
      </div>

      {/* Hidden print template */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0mm', pageBreakInside: 'avoid' }}>
            {printLabels.map((label, index) => (
              <div key={index} style={{
                width: `${labelWidth}mm`,
                height: `${labelHeight}mm`,
                padding: '2mm',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
                pageBreakInside: 'avoid',
                border: '1px dashed #ddd'
              }}>
                {showName && (
                  <div style={{ fontSize: `${fontSize}px`, textAlign: 'center', fontWeight: 'bold', marginBottom: '1mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label.name}
                  </div>
                )}
                {showBarcode && (
                  <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={getPreviewBarcodeUrl(label.barcode)}
                      alt="barcode"
                      style={{ height: `${labelHeight * 0.4}mm`, maxWidth: '100%', width: 'auto' }}
                    />
                  </div>
                )}
                {showPrice && (
                  <div style={{ fontSize: `${fontSize + 2}px`, textAlign: 'center', fontWeight: 'bold', marginTop: '1mm', color: '#0d9488' }}>
                    {label.price} UZS
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
