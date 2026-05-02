'use client';

import { useState, useCallback, useEffect } from 'react';
import { Camera, X, Search, Package, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useBarcodeScanner } from '@/components/BarcodeScanner';

interface ScannedProduct {
  id: string;
  name: string;
  sku?: string;
  sellPrice: number;
  barcode?: string;
}

export default function MobileBarcodePage() {
  const router = useRouter();
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [searching, setSearching] = useState(false);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [notFound, setNotFound] = useState(false);

  const handleScanResult = useCallback(async (barcode: string) => {
    setNotFound(false);
    setScannedProduct(null);
    setScanHistory(prev => [barcode, ...prev.filter(b => b !== barcode)].slice(0, 10));
    await searchByBarcode(barcode);
  }, []);

  const {
    isSupported,
    isScanning,
    error: scanError,
    videoRef,
    startScanning,
    stopScanning,
  } = useBarcodeScanner({ onScan: handleScanResult });

  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    return () => {
      if (cameraActive) {
        stopScanning();
      }
    };
  }, [cameraActive, stopScanning]);

  const toggleCamera = async () => {
    if (cameraActive) {
      stopScanning();
      setCameraActive(false);
    } else {
      await startScanning();
      setCameraActive(true);
    }
  };

  const searchByBarcode = async (barcode: string) => {
    if (!barcode.trim()) return;
    setSearching(true);
    setNotFound(false);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(barcode)}`);
      if (res.ok) {
        const data = await res.json();
        const products = Array.isArray(data) ? data : data.data || [];
        const found = products.find(
          (p: Record<string, unknown>) =>
            String(p.barcode || '') === barcode ||
            String(p.sku || '') === barcode
        ) as ScannedProduct | undefined;
        if (found) {
          setScannedProduct(found);
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleScanResult(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="Barcode skaner"
        backHref="/mobile"
      />

      <div className="px-4 space-y-4">
        {/* Camera View */}
        {cameraActive && (
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3]">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-32 border-2 border-teal-500 rounded-lg">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-teal-500 animate-pulse" />
              </div>
            </div>
            <button
              onClick={toggleCamera}
              className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white"
            >
              <X size={20} />
            </button>
            <div className="absolute bottom-3 left-0 right-0 text-center text-white/70 text-xs">
              {isScanning ? `Kameraga barcode yo\u2019naltiring...` : 'Kamera ishga tushirilmoqda...'}
            </div>
          </div>
        )}

        {/* Camera Error */}
        {scanError && cameraActive && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 text-center">
            <p className="text-rose-600 dark:text-rose-400 text-sm mb-2">{scanError}</p>
            <button
              onClick={toggleCamera}
              className="px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-xl active:scale-95 transition-transform"
            >
              Qayta urinish
            </button>
          </div>
        )}

        {/* Camera Toggle Button */}
        {!cameraActive && (
          <button
            onClick={toggleCamera}
            disabled={!isSupported}
            className="w-full py-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Camera size={32} />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-white">Kamerani yoqish</span>
            {!isSupported && (
              <span className="text-xs text-rose-500">{`Kamera qo\u2019llab-quvvatlanmaydi`}</span>
            )}
          </button>
        )}

        {/* Manual Input */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">{`Qo\u2019l bilan kiritish`}</h3>
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Barcode yoki SKU kiriting..."
                value={manualBarcode}
                onChange={e => setManualBarcode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-teal-600 text-white font-bold rounded-xl text-sm active:scale-95 transition-transform"
            >
              Qidirish
            </button>
          </form>
        </div>

        {/* Searching indicator */}
        {searching && (
          <div className="py-8 text-center text-slate-400">
            <div className="animate-pulse text-sm">Qidirilmoqda...</div>
          </div>
        )}

        {/* Product Found */}
        {scannedProduct && !searching && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-teal-200 dark:border-teal-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Package size={16} />
              </div>
              <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Topildi</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{scannedProduct.name}</h3>
            {scannedProduct.sku && (
              <div className="text-xs text-slate-500 mb-2">SKU: {scannedProduct.sku}</div>
            )}
            <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3">
              {scannedProduct.sellPrice.toLocaleString()} {`so\u2019m`}
            </div>
            <button
              onClick={() => router.push(`/mobile/inventory/${scannedProduct.id}/edit`)}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {`Mahsulotni ko\u2019rish`} <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Not Found */}
        {notFound && !searching && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-rose-200 dark:border-rose-800 text-center">
            <Package size={32} className="mx-auto mb-2 text-rose-300" />
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">Topilmadi</p>
            <p className="text-xs text-slate-500">Bu barcode bilan mahsulot mavjud emas</p>
          </div>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">{`So\u2019nggi skanlar`}</h3>
            <div className="space-y-2">
              {scanHistory.map((barcode, i) => (
                <button
                  key={`${barcode}-${i}`}
                  onClick={() => handleScanResult(barcode)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl active:scale-[0.98] transition-transform"
                >
                  <span className="text-sm font-mono text-slate-800 dark:text-white">{barcode}</span>
                  <Search size={14} className="text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
