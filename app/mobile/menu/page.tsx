'use client';

import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, Lock, Edit3, Check, X, Save, Moon, Globe, CreditCard, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useNotification } from '@/lib/NotificationContext';

export default function MobileMenuPage() {
  const { data: session, update: updateSession } = useSession();
  const { success, error } = useNotification();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: session?.user?.name || '', phone: (session?.user as any)?.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  useState(() => {
    if (typeof window !== 'undefined') {
      setDarkMode(document.documentElement.classList.contains('dark'));
    }
  });

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', 'Profil yangilandi');
        setEditingProfile(false);
        updateSession?.();
      } else {
        error('Xatolik', 'Yangilashda xatolik');
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!passwords.newPass || passwords.newPass.length < 6) { error('Xatolik', "Kamida 6 belgi"); return; }
    if (passwords.newPass !== passwords.confirm) { error('Xatolik', "Parollar mos emas"); return; }
    setSavingPassword(true);
    try {
      const res = await fetch('/api/settings/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      if (res.ok) {
        success('Muvaffaqiyatli', "Parol o'zgartirildi");
        setPasswords({ current: '', newPass: '', confirm: '' });
        setShowPassword(false);
      } else {
        const data = await res.json();
        error('Xatolik', data.error || "Xatolik");
      }
    } catch {
      error('Xatolik', 'Tarmoq xatosi');
    }
    setSavingPassword(false);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <div className="w-full min-h-screen pb-28">
      <div className="px-6 pt-8 pb-4 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-40">
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Sozlamalar</h1>
      </div>

      <div className="px-6 space-y-6 mt-2">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/30">
                {session?.user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                {editingProfile ? (
                  <div className="space-y-2">
                    <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Ism" />
                    <input type="text" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Telefon" />
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} disabled={savingProfile}
                        className="flex-1 py-2 bg-indigo-600 text-white text-[11px] font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-1">
                        <Check size={13} /> Saqlash
                      </button>
                      <button onClick={() => setEditingProfile(false)} className="py-2 px-3 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl active:scale-95">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-lg font-black text-slate-900 dark:text-white">{session?.user?.name || 'Foydalanuvchi'}</div>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-md">
                        {(session?.user as any)?.role || 'Xodim'}
                      </span>
                    </div>
                    <button onClick={() => { setEditingProfile(true); setProfileForm({ name: session?.user?.name || '', phone: (session?.user as any)?.phone || '' }); }}
                      className="p-2.5 text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl active:scale-95">
                      <Edit3 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <button onClick={() => setShowPassword(!showPassword)}
            className="w-full flex items-center gap-3 p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400"><Lock size={18} /></div>
            <div className="flex-1 text-left">
              <div className="text-[13px] font-bold text-slate-800 dark:text-white">Parolni o'zgartirish</div>
              <div className="text-[10px] text-slate-400">Kamida 6 belgi</div>
            </div>
            <ChevronRight size={16} className={`text-slate-300 transition-transform ${showPassword ? 'rotate-90' : ''}`} />
          </button>
          {showPassword && (
            <div className="px-4 pb-4 space-y-2 border-t border-slate-50 dark:border-slate-800 pt-3">
              <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} placeholder="Hozirgi parol"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              <input type="password" value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="Yangi parol"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Tasdiqlash"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              <button onClick={handleChangePassword} disabled={savingPassword}
                className="w-full py-2.5 bg-indigo-600 text-white text-[12px] font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-1">
                <Save size={14} /> {savingPassword ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          )}
        </div>

        {/* App Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <button onClick={toggleDarkMode} className="w-full flex items-center gap-3 p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400"><Moon size={18} /></div>
            <div className="flex-1 text-left">
              <div className="text-[13px] font-bold text-slate-800 dark:text-white">Tungi rejim</div>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'} relative`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </button>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><Globe size={18} /></div>
            <div className="flex-1"><div className="text-[13px] font-bold text-slate-800 dark:text-white">Til</div></div>
            <span className="text-[11px] font-bold text-slate-400">O'zbekcha</span>
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="pt-2"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 px-1">Boshqaruv</span></div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <Link href="/mobile/users" className="flex items-center gap-3 p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400"><Shield size={18} /></div>
                <div className="flex-1"><div className="text-[13px] font-bold text-slate-800 dark:text-white">Foydalanuvchilar</div></div>
                <ChevronRight size={16} className="text-slate-300" />
              </Link>
              <Link href="/mobile/requests" className="flex items-center gap-3 p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400"><User size={18} /></div>
                <div className="flex-1"><div className="text-[13px] font-bold text-slate-800 dark:text-white">So'rovlar</div></div>
                <ChevronRight size={16} className="text-slate-300" />
              </Link>
              <Link href="/mobile/subscriptions" className="flex items-center gap-3 p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400"><CreditCard size={18} /></div>
                <div className="flex-1"><div className="text-[13px] font-bold text-slate-800 dark:text-white">To'lovlar</div></div>
                <ChevronRight size={16} className="text-slate-300" />
              </Link>
            </div>
          </>
        )}

        {/* Logout */}
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-2 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl font-bold text-sm active:scale-95 transition-transform border border-rose-100 dark:border-rose-500/20">
          <LogOut size={18} /> Tizimdan chiqish
        </button>
      </div>
    </div>
  );
}
