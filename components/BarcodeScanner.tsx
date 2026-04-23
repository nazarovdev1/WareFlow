'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X } from 'lucide-react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

interface UseBarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
}

export function useBarcodeScanner({ onScan, onError }: UseBarcodeScannerProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  useEffect(() => {
    const supported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    setIsSupported(supported);
    
    if (supported) {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
    }
  }, []);

  const startScanning = useCallback(async () => {
    if (!isSupported || !readerRef.current) {
      setError('Kamera qo\'llab-quvvatlanmaydi');
      onError?.('Kamera qo\'llab-quvvatlanmaydi');
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsScanning(true);

      const detectBarcode = async () => {
        if (!videoRef.current || !readerRef.current || !isScanning) return;

        try {
          readerRef.current.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result: Result | null, error: any) => {
              if (result && isScanning) {
                const now = Date.now();
                if (now - lastScanTimeRef.current > 2000) {
                  lastScanTimeRef.current = now;
                  onScan(result.getText());
                }
              }
            }
          );
        } catch (err) {
        }
      };

      scanIntervalRef.current = setInterval(detectBarcode, 200);
    } catch (err: any) {
      const errorMessage = err.name === 'NotAllowedError' 
        ? 'Kameraga ruxsat berilmadi' 
        : 'Kamerani ishga tushirishda xatolik';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isSupported, isScanning, onScan, onError]);

  const stopScanning = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (readerRef.current) {
      readerRef.current.reset();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  }, []);

  const simulateScan = useCallback((barcode: string) => {
    onScan(barcode);
  }, [onScan]);

  return {
    isSupported,
    isScanning,
    error,
    videoRef,
    startScanning,
    stopScanning,
    simulateScan,
  };
}

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScannerModal({ isOpen, onClose, onScan }: BarcodeScannerModalProps) {
  const { isSupported, isScanning, error, videoRef, startScanning, stopScanning, simulateScan } = useBarcodeScanner({ onScan });
  const [manualBarcode, setManualBarcode] = useState('');

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }
    return () => stopScanning();
  }, [isOpen, startScanning, stopScanning]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera size={20} />
            Barcode skaner
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={startScanning}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg"
              >
                Qayta urinish
              </button>
            </div>
          ) : (
            <>
              <div className="relative aspect-square bg-black rounded-xl overflow-hidden mb-4">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-32 border-2 border-teal-500 rounded-lg">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-teal-500 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                {isScanning ? 'Kameraga barcode yo\'naltiring...' : 'Kamera ishga tushirilmoqda...'}
              </div>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Barcode ni qo'lda kiriting..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium"
                >
                  Qo'shish
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}