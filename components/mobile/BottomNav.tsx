'use client';

import { Home, Package, ShoppingCart, Wallet, Truck, ArrowRightLeft, Users, ChevronRight, X, Building, Shield, CreditCard, UserPlus, Edit3, Lock, Moon, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { data: session } = useSession();

  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const userPermissions: string[] = (session?.user as any)?.permissions || [];
  const hasPermission = (perm: string) => isAdmin || userPermissions.includes(perm);

  const navItems = [
    { name: 'Asosiy', href: '/mobile', icon: Home, perm: null },
    { name: 'Ombor', href: '/mobile/inventory', icon: Package, perm: 'manage_products' },
    { name: 'Savdo', href: '/mobile/sales', icon: ShoppingCart, perm: 'manage_sales' },
  ];

  const moreItems = [
    { name: 'Kassa', href: '/mobile/cashbox', icon: Wallet, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10', perm: null },
    { name: 'Xaridlar', href: '/mobile/purchases', icon: ShoppingCart, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10', perm: 'manage_purchases' },
    { name: "Ta'minotchilar", href: '/mobile/suppliers', icon: Truck, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10', perm: 'manage_suppliers' },
    { name: 'Mijozlar', href: '/mobile/customers', icon: Users, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10', perm: 'manage_customers' },
    { name: "Ko'chirish", href: '/mobile/warehouse', icon: ArrowRightLeft, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10', perm: 'manage_warehouse' },
    { name: 'Filiallar', href: '/mobile/warehouses', icon: Building, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10', perm: 'manage_warehouse' },
  ];

  const adminItems = [
    { name: 'Foydalanuvchilar', href: '/mobile/users', icon: Shield, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' },
    { name: "So'rovlar", href: '/mobile/requests', icon: UserPlus, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10' },
    { name: "To'lovlar", href: '/mobile/subscriptions', icon: CreditCard, color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10' },
  ];

  const filteredNav = navItems.filter(item => !item.perm || hasPermission(item.perm));
  const filteredMore = moreItems.filter(item => !item.perm || hasPermission(item.perm));

  const isActive = (href: string) => {
    if (href === '/mobile') return pathname === '/mobile';
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-8 max-w-md mx-auto max-h-[75vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Barcha bo'limlar</h3>
              <button onClick={() => setShowMore(false)} className="p-1.5 text-slate-400"><X size={18} /></button>
            </div>
            <div className="space-y-2">
              {filteredMore.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href} onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.98] ${active ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}><Icon size={20} /></div>
                    <span className={`text-[13px] font-bold flex-1 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>{item.name}</span>
                    {active && <ChevronRight size={16} className="text-indigo-500" />}
                  </Link>
                );
              })}
              {isAdmin && (
                <>
                  <div className="pt-3 pb-1"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 px-1">Admin bo'limi</span></div>
                  {adminItems.map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setShowMore(false)}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.98] ${active ? 'bg-amber-50 dark:bg-amber-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}><Icon size={20} /></div>
                        <span className={`text-[13px] font-bold flex-1 ${active ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>{item.name}</span>
                        {active && <ChevronRight size={16} className="text-amber-500" />}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Panel */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={() => setShowProfile(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl max-w-md mx-auto max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/30">
                  {session?.user?.name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-black text-slate-900 dark:text-white truncate">{session?.user?.name || 'Foydalanuvchi'}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-md">
                      {(session?.user as any)?.role || 'Xodim'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowProfile(false)} className="p-1.5 text-slate-400"><X size={18} /></button>
              </div>
            </div>

            <div className="p-4 space-y-1">
              <Link href="/mobile/menu" onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400"><Edit3 size={18} /></div>
                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">Profil sozlamalari</span>
                <ChevronRight size={16} className="text-slate-300" />
              </Link>
              <Link href="/mobile/menu" onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400"><Lock size={18} /></div>
                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">Xavfsizlik</span>
                <ChevronRight size={16} className="text-slate-300" />
              </Link>
              <button onClick={() => { const html = document.documentElement; html.classList.toggle('dark'); localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light'); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"><Moon size={18} /></div>
                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">Tungi rejim</span>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
            </div>

            {isAdmin && (
              <div className="px-4 pb-2">
                <div className="pt-3 pb-2"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 px-1">Admin</span></div>
                <div className="space-y-1">
                  {adminItems.map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setShowProfile(false)}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.98] ${active ? 'bg-amber-50 dark:bg-amber-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}><Icon size={18} /></div>
                        <span className={`text-[13px] font-bold flex-1 ${active ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>{item.name}</span>
                        {active && <ChevronRight size={16} className="text-amber-500" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-4 pt-2">
              <button onClick={() => { setShowProfile(false); signOut({ callbackUrl: '/' }); }}
                className="w-full flex items-center justify-center gap-2 p-3.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl font-bold text-[12px] active:scale-95 transition-transform">
                <LogOut size={16} /> Tizimdan chiqish
              </button>
            </div>
            <div className="h-2"></div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 dark:to-transparent">
        <div className="max-w-md mx-auto flex justify-between items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl px-4 py-2.5 rounded-full shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-700">
          {filteredNav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}
                className="relative flex flex-col items-center justify-center w-12 h-12 active:scale-90 transition-transform duration-200">
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 -translate-y-4' : 'text-slate-400 dark:text-slate-500'}`}>
                  <Icon size={22} />
                </div>
                <span className={`text-[10px] font-bold transition-all duration-300 absolute bottom-0 ${active ? 'text-indigo-600 dark:text-indigo-400 opacity-100 translate-y-1' : 'opacity-0 translate-y-4'}`}>{item.name}</span>
              </Link>
            );
          })}

          {/* Quick Menu Button */}
          <button onClick={() => setShowMore(true)}
            className="relative flex flex-col items-center justify-center w-12 h-12 active:scale-90 transition-transform duration-200">
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isActive('/mobile/cashbox') || isActive('/mobile/purchases') || isActive('/mobile/suppliers') || isActive('/mobile/customers') || isActive('/mobile/warehouse') || isActive('/mobile/warehouses') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 -translate-y-4' : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700'}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="5" cy="5" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="19" cy="5" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
            </div>
          </button>

          {/* Profile Button */}
          <button onClick={() => setShowProfile(true)}
            className="relative flex flex-col items-center justify-center w-12 h-12 active:scale-90 transition-transform duration-200">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm border-2 border-white dark:border-slate-700 shadow-sm">
              {session?.user?.name?.[0] || 'U'}
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
