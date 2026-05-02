'use client';

import { Home, Package, ShoppingCart, Wallet, Truck, ArrowRightLeft, Users, ChevronRight, X, Building, Shield, CreditCard, UserPlus, Edit3, Lock, Moon, LogOut, Grid, BarChart3, TrendingUp, PieChart, FileText, ClipboardCheck, Sliders, MapPin, Layers, Scan, Receipt, Award, Percent, Bot, RefreshCw, Printer, Brain, Settings, Landmark, UsersRound, DollarSign, ShoppingBag, BoxesIcon, Wrench } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface MoreItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>;
  color: string;
  perm?: string | null;
  adminOnly?: boolean;
}

interface MoreCategory {
  title: string;
  items: MoreItem[];
}

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { data: session } = useSession();

  const isAdmin = (session?.user as Record<string, unknown>)?.role === 'ADMIN';
  const userPermissions: string[] = ((session?.user as Record<string, unknown>)?.permissions as string[]) || [];
  const hasPermission = (perm: string) => isAdmin || userPermissions.includes(perm);

  const navItems = [
    { name: 'Asosiy', href: '/mobile', icon: Home, perm: null },
    { name: 'Ombor', href: '/mobile/inventory', icon: Package, perm: 'manage_products' },
    { name: 'Savdo', href: '/mobile/sales', icon: ShoppingCart, perm: 'manage_sales' },
  ];

  const moreCategories: MoreCategory[] = [
    {
      title: 'Asosiy',
      items: [
        { name: 'Xaridlar', href: '/mobile/purchases', icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20', perm: 'manage_purchases' },
        { name: "Ta'minotchilar", href: '/mobile/suppliers', icon: Truck, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20', perm: 'manage_suppliers' },
        { name: 'Mijozlar', href: '/mobile/customers', icon: Users, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20', perm: 'manage_customers' },
        { name: 'Kassa', href: '/mobile/cashbox', icon: Wallet, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20', perm: null },
      ],
    },
    {
      title: 'Ombor',
      items: [
        { name: 'Qoldiq', href: '/mobile/warehouse/stock', icon: BoxesIcon, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20', perm: 'manage_warehouse' },
        { name: "Ko'chirish", href: '/mobile/warehouse', icon: ArrowRightLeft, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20', perm: 'manage_warehouse' },
        { name: 'Inventarizatsiya', href: '/mobile/warehouse/inventory', icon: ClipboardCheck, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', perm: 'manage_warehouse' },
        { name: 'Korrektirovka', href: '/mobile/warehouse/adjustment', icon: Sliders, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20', perm: 'manage_warehouse' },
        { name: 'Filiallar', href: '/mobile/warehouses', icon: Building, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20', perm: 'manage_warehouse' },
      ],
    },
    {
      title: 'Moliya',
      items: [
        { name: 'Xarajatlar', href: '/mobile/expenses', icon: Receipt, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20', perm: null },
        { name: 'Shartnomalar', href: '/mobile/contracts', icon: FileText, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20', perm: null },
        { name: "Narx ro'yxati", href: '/mobile/prices', icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20', perm: null },
      ],
    },
    {
      title: 'Hisobotlar',
      items: [
        { name: 'Hisobotlar', href: '/mobile/reports', icon: BarChart3, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20', perm: null },
        { name: 'Savdo hisoboti', href: '/mobile/reports/sales', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20', perm: null },
        { name: 'Ombor hisoboti', href: '/mobile/reports/inventory', icon: PieChart, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20', perm: null },
        { name: 'Moliyaviy', href: '/mobile/reports/financial', icon: DollarSign, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20', perm: null },
        { name: 'Qarzlar', href: '/mobile/reports/debts', icon: Users, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', perm: null },
        { name: 'Xarid hisoboti', href: '/mobile/reports/purchases', icon: ShoppingBag, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20', perm: null },
        { name: 'Foyda/Zarar', href: '/mobile/reports/profit-loss', icon: TrendingUp, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20', perm: null },
        { name: 'Filial hisoboti', href: '/mobile/reports/branch', icon: Building, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20', perm: null },
        { name: 'Hisobot yaratish', href: '/mobile/reports/builder', icon: Wrench, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20', perm: null },
      ],
    },
    {
      title: 'Logistika',
      items: [
        { name: 'Yetkazib berish', href: '/mobile/deliveries', icon: MapPin, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20', perm: null },
        { name: 'Partiyalar', href: '/mobile/batches', icon: Layers, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20', perm: null },
        { name: 'Shtrix-kod', href: '/mobile/barcode', icon: Scan, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20', perm: null },
      ],
    },
    {
      title: 'Boshqaruv',
      items: [
        { name: 'Sotuv agentlari', href: '/mobile/agents', icon: UsersRound, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20', perm: null },
        { name: 'Komissiyalar', href: '/mobile/commissions', icon: Percent, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', perm: null },
        { name: 'Sodiqlik', href: '/mobile/loyalty', icon: Award, color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20', perm: null },
        { name: 'Foydalanuvchilar', href: '/mobile/users', icon: Shield, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', adminOnly: true },
        { name: "So'rovlar", href: '/mobile/requests', icon: UserPlus, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20', adminOnly: true },
        { name: "To'lovlar", href: '/mobile/subscriptions', icon: CreditCard, color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20', adminOnly: true },
      ],
    },
    {
      title: 'Admin',
      items: [
        { name: 'Korxonalar', href: '/mobile/enterprises', icon: Landmark, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20', adminOnly: true },
        { name: 'Ijarachilar', href: '/mobile/tenants', icon: Building, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20', adminOnly: true },
        { name: 'Telegram bot', href: '/mobile/telegram', icon: Bot, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20', adminOnly: true },
        { name: '1C sinxron', href: '/mobile/1c-sync', icon: RefreshCw, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20', adminOnly: true },
        { name: 'Shablonlar', href: '/mobile/print-templates', icon: Printer, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20', adminOnly: true },
        { name: 'AI bashorat', href: '/mobile/ai-forecast', icon: Brain, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20', adminOnly: true },
        { name: 'Sozlamalar', href: '/mobile/settings', icon: Settings, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20', adminOnly: true },
      ],
    },
  ];

  const filteredNav = navItems.filter(item => !item.perm || hasPermission(item.perm));

  const filteredCategories: MoreCategory[] = moreCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.perm && !hasPermission(item.perm)) return false;
      return true;
    }),
  })).filter(cat => cat.items.length > 0);

  const isActive = (href: string) => {
    if (href === '/mobile') return pathname === '/mobile';
    return pathname?.startsWith(href);
  };

  const allMoreHrefs = moreCategories.flatMap(cat => cat.items.map(item => item.href));
  const isMoreActive = () => allMoreHrefs.some(href => isActive(href));

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-24 max-w-md mx-auto max-h-[85vh] h-auto overflow-y-auto shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{`Barcha bo'limlar`}</h3>
              <button onClick={() => setShowMore(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 -mr-1">
              {filteredCategories.map((category, catIdx) => (
                <div key={catIdx}>
                  <div className="pb-2 mb-1"><span className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2">{category.title}</span></div>
                  <div className="space-y-1">
                    {category.items.map(item => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setShowMore(false)}
                          className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all active:scale-[0.98] ${active ? 'bg-slate-50 dark:bg-slate-800 border border-teal-100 dark:border-teal-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}><Icon size={20} /></div>
                          <span className={`text-[14px] font-bold flex-1 ${active ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{item.name}</span>
                          {active && <ChevronRight size={18} className="text-teal-600 dark:text-teal-400" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Panel */}
      {showProfile && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" onClick={() => setShowProfile(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl max-w-md mx-auto max-h-[85vh] h-auto overflow-y-auto shadow-2xl flex flex-col pb-20" onClick={e => e.stopPropagation()}>
            <div className="p-6 pb-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white text-2xl font-black shadow-sm">
                  {session?.user?.name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-black text-slate-900 dark:text-white truncate">{session?.user?.name || 'Foydalanuvchi'}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                      {(session?.user as Record<string, unknown>)?.role as string || 'Xodim'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowProfile(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"><X size={18} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-2">
              <Link href="/mobile/menu" onClick={() => setShowProfile(false)}
                className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent active:scale-[0.98] transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"><Edit3 size={18} /></div>
                <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200 flex-1">Profil sozlamalari</span>
                <ChevronRight size={18} className="text-slate-300" />
              </Link>
              <Link href="/mobile/settings" onClick={() => setShowProfile(false)}
                className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent active:scale-[0.98] transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"><Settings size={18} /></div>
                <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200 flex-1">Sozlamalar</span>
                <ChevronRight size={18} className="text-slate-300" />
              </Link>
              <Link href="/mobile/menu" onClick={() => setShowProfile(false)}
                className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent active:scale-[0.98] transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"><Lock size={18} /></div>
                <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200 flex-1">Xavfsizlik</span>
                <ChevronRight size={18} className="text-slate-300" />
              </Link>
              <button onClick={() => { const html = document.documentElement; html.classList.toggle('dark'); localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light'); }}
                className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent active:scale-[0.98] transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"><Moon size={18} /></div>
                <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200 flex-1 text-left">Tungi rejim</span>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            </div>
            </div>

            <div className="p-5 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 shrink-0">
              <button onClick={() => { setShowProfile(false); signOut({ callbackUrl: '/' }); }}
                className="w-full flex items-center justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold text-[14px] hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all">
                <LogOut size={18} /> Tizimdan chiqish
              </button>
            </div>
            <div className="h-4"></div>
          </div>
        </div>
      )}

      {/* Flat Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="max-w-md mx-auto flex justify-between items-center px-4 h-16">
          {filteredNav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}
                className="flex-1 flex flex-col items-center justify-center h-full active:scale-95 transition-transform duration-200">
                <div className={`flex flex-col items-center justify-center w-full h-full gap-1 ${active ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <div className={`flex items-center justify-center w-12 h-8 rounded-xl transition-all ${active ? 'bg-teal-50 dark:bg-teal-900/30' : ''}`}>
                    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-bold ${active ? 'text-teal-700 dark:text-teal-300' : ''}`}>{item.name}</span>
                </div>
              </Link>
            );
          })}

          {/* Quick Menu Button */}
          <button onClick={() => setShowMore(true)}
            className="flex-1 flex flex-col items-center justify-center h-full active:scale-95 transition-transform duration-200">
            <div className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isMoreActive() ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
              <div className={`flex items-center justify-center w-12 h-8 rounded-xl transition-all ${isMoreActive() ? 'bg-teal-50 dark:bg-teal-900/30' : ''}`}>
                <Grid size={20} strokeWidth={isMoreActive() ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${isMoreActive() ? 'text-teal-700 dark:text-teal-300' : ''}`}>Menyu</span>
            </div>
          </button>

          {/* Profile Button */}
          <button onClick={() => setShowProfile(true)}
            className="flex-1 flex flex-col items-center justify-center h-full active:scale-95 transition-transform duration-200">
            <div className="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
               <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white font-black text-[12px] border border-slate-200 dark:border-slate-700">
                {session?.user?.name?.[0] || 'U'}
              </div>
              <span className="text-[10px] font-bold">Profil</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
