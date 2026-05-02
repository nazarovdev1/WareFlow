'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface ForecastData {
  date: string;
  actual?: number;
  predicted?: number;
  lower?: number;
  upper?: number;
}

interface ProductForecast {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  daysUntilStockout?: number;
  recommendation: string;
  confidence: number;
}

export default function MobileAIForecastPage() {
  const [forecasts, setForecasts] = useState<ProductForecast[]>([]);
  const [chartData, setChartData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-forecast');
      if (res.ok) {
        const data = await res.json();
        setForecasts(data.productForecasts || data.forecasts || []);
        setChartData(data.chartData || data.demandCurve || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/ai-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horizon: 30 }),
      });
      if (res.ok) {
        const data = await res.json();
        setForecasts(data.productForecasts || data.forecasts || []);
        setChartData(data.chartData || data.demandCurve || []);
      }
    } catch {
      // silently handle
    } finally {
      setGenerating(false);
    }
  };

  const criticalItems = forecasts.filter(f => (f.daysUntilStockout || 999) <= 7);
  const needOrderItems = forecasts.filter(f => f.recommendation === 'ORDER');

  return (
    <div className="w-full min-h-screen pb-28">
      <MobileHeader
        title="AI bashorat"
        backHref="/mobile"
      />

      <div className="px-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
              <Brain size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bashoratlar</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{forecasts.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
              <AlertTriangle size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Muhim</div>
            <div className="text-lg font-black text-rose-600 dark:text-rose-400">{criticalItems.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
              <Package size={16} />
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Buyurtma</div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">{needOrderItems.length}</div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3.5 bg-purple-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <Brain size={18} />
          {generating ? 'Bashorat generatsiya...' : 'Yangi bashorat generatsiya'}
        </button>

        {/* Demand Chart */}
        {chartData.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Talab prognozi</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v: string) => new Date(v).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })} />
                  <YAxis tick={{ fontSize: 9 }} width={40} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 12 }}
                    labelFormatter={(v) => String(new Date(String(v)).toLocaleDateString('uz-UZ'))}
                  />
                  <Area type="monotone" dataKey="predicted" stroke="#8b5cf6" fill="url(#predictedGrad)" strokeWidth={2} name="Bashorat" />
                  <Area type="monotone" dataKey="actual" stroke="#6366f1" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Haqiqiy" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Forecast Cards */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="animate-pulse text-sm">Yuklanmoqda...</div>
          </div>
        ) : forecasts.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Brain size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Bashoratlar topilmadi</p>
            <p className="text-xs mt-1">Generatsiya tugmasini bosing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {forecasts.map((forecast, i) => (
              <div
                key={`${forecast.productId}-${i}`}
                className={`bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border ${
                  forecast.recommendation === 'ORDER'
                    ? 'border-amber-200 dark:border-amber-800'
                    : (forecast.daysUntilStockout || 999) <= 7
                    ? 'border-rose-200 dark:border-rose-800'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{forecast.productName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">Joriy: {forecast.currentStock}</span>
                      <span className="text-xs text-slate-400">&bull;</span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400">Bashorat: {forecast.predictedDemand}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{Math.round(forecast.confidence * 100)}%</div>
                    <div className="text-[9px] text-slate-400">ishonch</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {forecast.recommendation === 'ORDER' ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                      <TrendingUp size={10} /> Buyurtma tavsiya
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                      <TrendingDown size={10} /> Yetarli zaxira
                    </span>
                  )}
                  {forecast.daysUntilStockout && forecast.daysUntilStockout <= 7 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full">
                      <AlertTriangle size={10} /> {forecast.daysUntilStockout} kun qoldi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
