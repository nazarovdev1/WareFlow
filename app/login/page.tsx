'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Home, User, Lock, LogIn, CheckSquare, Square, UserPlus, ArrowLeft, Phone } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import { useNotification } from '@/lib/NotificationContext';

export default function LoginPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme, isLoaded: themeLoaded } = useTheme();
  const { success } = useNotification();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        phone: `+998${phone}`,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Login yoki parol noto'g'ri");
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    setRegSuccess('');

    if (regPassword.length < 6) {
      setRegError('Parol kamida 6 belgi bo\'lishi kerak');
      setRegLoading(false);
      return;
    }

    if (regPhone.length < 9) {
      setRegError('Telefon raqam noto\'g\'ri');
      setRegLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          phone: `+998${regPhone}`,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || 'Xatolik yuz berdi');
        return;
      }

      success('So\'rov Yuborildi!', 'Admin tasdiqlagandan so\'ng login qilishingiz mumkin.');
      setRegName('');
      setRegPhone('');
      setRegPassword('');
      setIsRegister(false);
    } catch (err) {
      setRegError('Internet xatolik. Qayta urinib ko\'ring.');
    } finally {
      setRegLoading(false);
    }
  };

  if (!themeLoaded) {
    return null;
  }

  return (
    <div className={`relative min-h-screen w-full flex items-center justify-center font-sans ${theme === 'dark' ? 'dark' : ''}`}>
      <div className={`absolute inset-0 z-0 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900'}`} />

      <div className="absolute top-6 right-8 flex gap-2 z-10">
        {[{ code: 'uz', label: "O'Z" }, { code: 'ru', label: 'РУ' }, { code: 'en', label: 'EN' }].map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`px-3 py-1 rounded text-xs font-bold transition ${
              language === lang.code ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div className="absolute top-6 left-8 flex gap-2 z-10">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="px-3 py-1 rounded text-xs font-bold text-white/60 hover:text-white transition"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {!isRegister ? (
        <div className={`relative z-10 w-full max-w-[420px] backdrop-blur-sm p-10 rounded-[2.5rem] shadow-2xl border border-white/20 ${
          theme === 'dark' ? 'bg-slate-800/90 border-slate-700/50' : 'bg-[#e5e7eb]/90 border-white/20'
        }`}>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-[#0f172a]'
              }`}>
                <Home className={theme === 'dark' ? 'text-teal-400' : 'text-[#2dd4bf]'} size={24} />
              </div>
              <h1 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#0f172a]'}`}>IBOX</h1>
            </div>
            <p className={`text-xs font-bold tracking-widest uppercase mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-[#0f172a]/60'}`}>Kirish</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold text-center border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-400' : 'text-[#0f172a]/70'}`}>Telefon</label>
              <div className="relative flex items-center">
                <div className={`absolute left-4 ${theme === 'dark' ? 'text-slate-500' : 'text-[#0f172a]/40'}`}>
                  <Phone size={18} />
                </div>
                <span className={`absolute left-11 font-medium ${theme === 'dark' ? 'text-white' : 'text-[#0f172a]'}`}>
                  +998
                </span>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(-9))}
                  className={`w-full pl-[5.5rem] pr-4 py-4 border-none rounded-xl focus:ring-2 outline-none font-medium ${
                    theme === 'dark' ? 'bg-slate-700 text-white focus:ring-teal-500/30 placeholder:text-slate-500' : 'bg-white text-[#0f172a] focus:ring-[#0f172a]/20 placeholder:text-slate-300'
                  }`} placeholder="90 123 45 67" />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-400' : 'text-[#0f172a]/70'}`}>Parol</label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-500' : 'text-[#0f172a]/40'}`}>
                  <Lock size={18} />
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 border-none rounded-xl focus:ring-2 outline-none font-medium ${
                    theme === 'dark' ? 'bg-slate-700 text-white focus:ring-teal-500/30 placeholder:text-slate-500' : 'bg-white text-[#0f172a] focus:ring-[#0f172a]/20 placeholder:text-slate-300'
                  }`} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className={`w-full py-4 rounded-xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
                theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/30' : 'bg-[#1e293b] hover:bg-[#0f172a] text-white shadow-[#1e293b]/20'
              } active:scale-[0.98]`}>
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (<>Kirish <LogIn size={18} className="text-teal-400" /></>)}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsRegister(true)}
              className="text-teal-600 dark:text-teal-400 text-sm font-bold hover:underline">
              <UserPlus size={16} className="inline mr-1" />
              Ro'yxatdan o'tish
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[11px] font-bold text-slate-500">IBOX WAREHOUSE SOLUTIONS</p>
          </div>
        </div>
      ) : (
        <div className={`relative z-10 w-full max-w-[420px] backdrop-blur-sm p-10 rounded-[2.5rem] shadow-2xl border border-white/20 ${
          theme === 'dark' ? 'bg-slate-800/90 border-slate-700/50' : 'bg-[#e5e7eb]/90 border-white/20'
        }`}>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-[#0f172a]'
              }`}>
                <UserPlus className={theme === 'dark' ? 'text-teal-400' : 'text-[#2dd4bf]'} size={24} />
              </div>
              <h1 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#0f172a]'}`}>Ro'yxatdan o'tish</h1>
            </div>
            <p className={`text-xs font-bold tracking-widest uppercase mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-[#0f172a]/60'}`}>Yangi akkaunt yaratish</p>
          </div>

          {regSuccess ? (
            <div className="mb-6 p-4 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold text-center border border-emerald-500/30">
              <CheckSquare size={24} className="inline mr-2 mb-1" />
              <p>{regSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {regError && (
                <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold text-center border border-red-500/30">
                  {regError}
                </div>
              )}

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-400' : 'text-[#0f172a]/70'}`}>Ism *</label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-500' : 'text-[#0f172a]/40'}`}>
                    <User size={18} />
                  </div>
                  <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 border-none rounded-xl focus:ring-2 outline-none font-medium ${
                      theme === 'dark' ? 'bg-slate-700 text-white focus:ring-teal-500/30 placeholder:text-slate-500' : 'bg-white text-[#0f172a] focus:ring-[#0f172a]/20 placeholder:text-slate-300'
                    }`} placeholder="To'liq ism" />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-400' : 'text-[#0f172a]/70'}`}>Telefon *</label>
                <div className="relative flex items-center">
                  <div className={`absolute left-4 ${theme === 'dark' ? 'text-slate-500' : 'text-[#0f172a]/40'}`}>
                    <Phone size={18} />
                  </div>
                  <span className={`absolute left-11 font-medium ${theme === 'dark' ? 'text-white' : 'text-[#0f172a]'}`}>
                    +998
                  </span>
                  <input type="tel" required value={regPhone} onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(-9))}
                    className={`w-full pl-[5.5rem] pr-4 py-4 border-none rounded-xl focus:ring-2 outline-none font-medium ${
                      theme === 'dark' ? 'bg-slate-700 text-white focus:ring-teal-500/30 placeholder:text-slate-500' : 'bg-white text-[#0f172a] focus:ring-[#0f172a]/20 placeholder:text-slate-300'
                    }`} placeholder="90 123 45 67" />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-400' : 'text-[#0f172a]/70'}`}>Parol *</label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-500' : 'text-[#0f172a]/40'}`}>
                    <Lock size={18} />
                  </div>
                  <input type="password" required minLength={6} value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 border-none rounded-xl focus:ring-2 outline-none font-medium ${
                      theme === 'dark' ? 'bg-slate-700 text-white focus:ring-teal-500/30 placeholder:text-slate-500' : 'bg-white text-[#0f172a] focus:ring-[#0f172a]/20 placeholder:text-slate-300'
                    }`} placeholder="Kamida 6 belgi" />
                </div>
              </div>

              <button type="submit" disabled={regLoading}
                className={`w-full py-4 rounded-xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
                  theme === 'dark' ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}>
                {regLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (<>Ro'yxatdan o'tish <UserPlus size={18} /></>)}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => { setIsRegister(false); setRegError(''); setRegSuccess(''); }}
              className="text-teal-600 dark:text-teal-400 text-sm font-bold hover:underline">
              <ArrowLeft size={16} className="inline mr-1" />
              Ortga
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[11px] font-bold text-slate-500">IBOX WAREHOUSE SOLUTIONS</p>
          </div>
        </div>
      )}

      <p className="absolute bottom-6 text-[9px] text-white/30 font-bold tracking-[0.2em] uppercase">
        © 2024 IBOX WAREHOUSE SOLUTIONS. ALL RIGHTS RESERVED.
      </p>
    </div>
  );
}
