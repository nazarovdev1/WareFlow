'use client';

import { useState, useEffect } from 'react';
import { Search, Brain, TrendingUp, TrendingDown, AlertTriangle, Target, BarChart3, Calendar, Activity } from 'lucide-react';
import { useNotification } from '@/lib/NotificationContext';

interface Product {
  id: string;
  name: string;
  sku?: string;
}

interface DemandForecast {
  id: string;
  productId: string;
  product?: Product;
  period: string;
  predictedQty: number;
  confidence: number;
  algorithm: string;
  inputData?: string;
  month: number;
  year: number;
}

interface ForecastStats {
  totalProducts: number;
  avgConfidence: number;
  totalPredicted: number;
}

export default function AIForecastPage() {
  const { success, error } = useNotification();
  
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ForecastStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, pRes] = await Promise.all([
        fetch(`/api/ai-forecast?month=${selectedMonth}&year=${selectedYear}`),
        fetch('/api/products'),
      ]);
      if (fRes.ok) {
        const data = await fRes.json();
        setForecasts(Array.isArray(data) ? data : data.data || []);
        
        const totalPredicted = (Array.isArray(data) ? data : data.data || []).reduce((sum: number, f: any) => sum + f.predictedQty, 0);
        const avgConf = (Array.isArray(data) ? data : data.data || []).length > 0 
          ? (Array.isArray(data) ? data : data.data || []).reduce((sum: number, f: any) => sum + f.confidence, 0) / (Array.isArray(data) ? data : data.data || []).length 
          : 0;
        
        setStats({
          totalProducts: (Array.isArray(data) ? data : data.data || []).length,
          avgConfidence: avgConf,
          totalPredicted,
        });
      }
      if (pRes.ok) {
        const data = await pRes.json();
        setProducts(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      error('Xatolik', 'Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/ai-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct || null,
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        success('Muvaffaqiyatli', `Bashorat yaratildi: ${data.predictedQty?.toFixed(0)} dona`);
        loadData();
      } else {
        const errorData = await res.json();
        error('Xatolik', errorData.error || 'Bashorat yaratishda xatolik');
      }
    } finally {
      setGenerating(false);
    }
  };

  const saveForecast = async (forecast: DemandForecast) => {
    try {
      const res = await fetch('/api/ai-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forecast),
      });

      if (res.ok) {
        success('Muvaffaqiyatli', 'Bashorat saqlandi');
      } else {
        error('Xatolik', 'Saqlashda xatolik');
      }
    } catch (err) {
      error('Xatolik', 'Tarmoq xatosi');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
    if (confidence >= 60) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    if (confidence >= 40) return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
    return 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Yuqori';
    if (confidence >= 60) return 'Yaxshi';
    if (confidence >= 40) return 'O\'rtacha';
    return 'Past';
  };

  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ];

  const filteredForecasts = forecasts.filter(f => {
    const matchesSearch = !search || 
      f.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.product?.sku?.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="text-indigo-600" />
            AI Talab Bashorati
          </h1>
          <button
            onClick={generateForecast}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Bashoratlanmoqda...' : (
              <>
                <Target size={18} />
                Bashorat yaratish
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BarChart3 size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bashoratlangan mahsulotlar</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{stats?.totalProducts || 0}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami bashorat</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{stats?.totalPredicted?.toLocaleString() || 0}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Activity size={20} />
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">O\'rtacha ishonch</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{stats?.avgConfidence?.toFixed(0) || 0}%</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Filtrlar
          </h2>
          <div className="grid grid-cols-4 gap-3">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
            >
              <option value="">Barcha mahsulotlar</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Bashorat natijalari ({months[selectedMonth]} {selectedYear})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : filteredForecasts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Brain size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Bashoratlar topilmadi</p>
              <p className="text-xs mt-2">Bashorat yaratish tugmasini bosing</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredForecasts.sort((a, b) => b.predictedQty - a.predictedQty).map(forecast => (
                <div key={forecast.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {forecast.product?.name || 'Noma\'lum mahsulot'}
                        </h3>
                        {forecast.product?.sku && (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded">
                            {forecast.product.sku}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {months[forecast.month]} {forecast.year}
                        </span>
                        <span>•</span>
                        <span>Algoritm: {forecast.algorithm}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className="text-indigo-600" />
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {forecast.predictedQty.toFixed(0)}
                        </div>
                      </div>
                      <div className={`px-2 py-1 text-xs font-bold rounded-full ${getConfidenceColor(forecast.confidence)}`}>
                        {forecast.confidence.toFixed(0)}% {getConfidenceLabel(forecast.confidence)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredForecasts.length > 0 && (
          <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                <Brain size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-1">AI tavsiyalar</h4>
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  Yuqori bashoratlangan mahsulotlar uchun zaxirani oldindan to'ldirish tavsiya etiladi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
