'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Home, User, Lock, LogIn, CheckSquare, Square } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';

export default function LoginPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme, isLoaded: themeLoaded } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(t('auth', 'loginFailed') || "Login yoki parol noto'g'ri");
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError(t('messages', 'error'));
    } finally {
      setLoading(false);
    }
  };

  if (!themeLoaded) {
    return null;
  }

  return (
    <div className={`relative min-h-screen w-full flex items-center justify-center font-sans ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Background */}
      <div className={`absolute inset-0 z-0 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900'}`} />

      {/* Language Switcher */}
      <div className="absolute top-6 right-8 flex gap-2 z-10">
        {[
          { code: 'uz', label: "O'Z" },
          { code: 'ru', label: 'РУ' },
          { code: 'en', label: 'EN' }
        ].map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`px-3 py-1 rounded text-xs font-bold transition ${
              language === lang.code
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 left-8 flex gap-2 z-10">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="px-3 py-1 rounded text-xs font-bold text-white/60 hover:text-white transition"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* Login Card */}
      <div className={`relative z-10 w-full max-w-[420px] backdrop-blur-sm p-10 rounded-[2.5rem] shadow-2xl border border-white/20 ${
        theme === 'dark' 
          ? 'bg-slate-800/90 border-slate-700/50' 
          : 'bg-[#e5e7eb]/90 border-white/20'
      }`}>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-[#0f172a]'
            }`}>
              <Home className={theme === 'dark' ? 'text-teal-400' : 'text-[#2dd4bf]'} size={24} />
            </div>
            <h1 className={`text-3xl font-black tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-[#0f172a]'
            }`}>IBOX</h1>
          </div>
          <p className={`text-xs font-bold tracking-widest uppercase mb-6 ${
            theme === 'dark' ? 'text-slate-400' : 'text-[#0f172a]/60'
          }`}>{t('warehouse', 'title')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-bold text-center border border-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${
              theme === 'dark' ? 'text-slate-400' : 'text-[#0f172a]/70'
            }`}>{t('auth', 'email')}</label>
            <div className="relative">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                theme === 'dark' ? 'text-slate-500' : 'text-[#0f172a]/40'
              }`}>
                <User size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 border-none rounded-xl focus:ring-2 outline-none font-medium ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-white focus:ring-teal-500/30 placeholder:text-slate-500'
                    : 'bg-white text-[#0f172a] focus:ring-[#0f172a]/20 placeholder:text-slate-300'
                }`}
                placeholder={t('auth', 'email')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${
              theme === 'dark' ? 'text-slate-400' : 'text-[#0f172a]/70'
            }`}>{t('auth', 'password')}</label>
            <div className="relative">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                theme === 'dark' ? 'text-slate-500' : 'text-[#0f172a]/40'
              }`}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 border-none rounded-xl focus:ring-2 outline-none font-medium ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-white focus:ring-teal-500/30 placeholder:text-slate-500'
                    : 'bg-white text-[#0f172a] focus:ring-[#0f172a]/20 placeholder:text-slate-300'
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`flex items-center gap-2 transition ${
                theme === 'dark' 
                  ? 'text-slate-400 hover:text-slate-300' 
                  : 'text-[#0f172a]/60 hover:text-[#0f172a]'
              }`}
            >
              {rememberMe ? (
                <CheckSquare size={16} className={theme === 'dark' ? 'text-teal-400' : 'text-[#0f172a]'} />
              ) : (
                <Square size={16} />
              )}
              {t('auth', 'rememberMe')}
            </button>
            <a href="#" className="text-teal-600 dark:text-teal-400 hover:underline underline-offset-4">
              {t('auth', 'forgotPassword')}
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/30'
                : 'bg-[#1e293b] hover:bg-[#0f172a] text-white shadow-[#1e293b]/20'
            } active:scale-[0.98]`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {t('auth', 'login')}
                <LogIn size={18} className="text-teal-400" />
              </>
            )}
          </button>
        </form>

        <div className={`mt-8 text-center space-y-2 ${
          theme === 'dark' ? 'text-slate-500' : 'text-[#0f172a]/40'
        }`}>
          <p className="text-[11px] font-bold">
            {t('common', 'loading')}
          </p>
        </div>
      </div>

      {/* Subtle Bottom Copyright */}
      <p className="absolute bottom-6 text-[9px] text-white/30 font-bold tracking-[0.2em] uppercase">
        © 2024 IBOX WAREHOUSE SOLUTIONS. ALL RIGHTS RESERVED.
      </p>
    </div>
  );
}
