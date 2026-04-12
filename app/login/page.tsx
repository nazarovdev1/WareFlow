'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Home, User, Lock, LogIn, ChevronRight, CheckSquare, Square } from 'lucide-react';

export default function LoginPage() {
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
        setError("Login yoki parol noto'g'ri");
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Tizimga kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: 'url("/home/fedora/.gemini/antigravity/brain/a545ce93-94ec-42b7-8375-46554ae9af05/warehouse_bg_1775990999807.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4)'
        }}
      />

      {/* Language Switcher */}
      <div className="absolute top-6 right-8 flex gap-2 z-10">
        {['UZ', 'RU', 'EN'].map((lang) => (
          <button 
            key={lang}
            className={`px-3 py-1 rounded text-xs font-bold transition ${lang === 'UZ' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-[#e5e7eb]/90 backdrop-blur-sm p-10 rounded-[2.5rem] shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#0f172a] rounded-lg flex items-center justify-center shadow-lg">
              <Home className="text-[#2dd4bf]" size={24} />
            </div>
            <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Oboi Pro</h1>
          </div>
          <p className="text-[#0f172a]/60 text-xs font-bold tracking-widest uppercase mb-6">Warehouse Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 text-red-600 p-3 rounded-lg text-xs font-bold text-center border border-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#0f172a]/70 uppercase tracking-widest ml-1">Login</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0f172a]/40">
                <User size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-xl focus:ring-2 focus:ring-[#0f172a]/20 outline-none text-[#0f172a] font-medium placeholder:text-slate-300"
                placeholder="Foydalanuvchi nomi"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#0f172a]/70 uppercase tracking-widest ml-1">Parol</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0f172a]/40">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-xl focus:ring-2 focus:ring-[#0f172a]/20 outline-none text-[#0f172a] font-medium placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold">
            <button 
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2 text-[#0f172a]/60 hover:text-[#0f172a] transition"
            >
              {rememberMe ? <CheckSquare size={16} className="text-[#0f172a]" /> : <Square size={16} />}
              Eslab qolish
            </button>
            <a href="#" className="text-[#0d9488] hover:underline underline-offset-4">Parolni unutdingizmi?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#1e293b] hover:bg-[#0f172a] active:scale-[0.98] text-white rounded-xl font-black text-sm transition-all shadow-xl shadow-[#1e293b]/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Tizimga kirish
                <LogIn size={18} className="text-[#2dd4bf]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          <p className="text-[11px] text-[#0f172a]/40 font-bold">
            Yordam kerakmi? <span className="text-[#0f172a]">Administrator bilan bog'laning</span>
          </p>
        </div>
      </div>

      {/* Subtle Bottom Copyright */}
      <p className="absolute bottom-6 text-[9px] text-white/30 font-bold tracking-[0.2em] uppercase">
        © 2024 OBOI PRO LOGISTICS SOLUTIONS. ALL RIGHTS RESERVED.
      </p>
    </div>
  );
}
