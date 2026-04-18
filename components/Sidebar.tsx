'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Package, Warehouse, Users, Truck, ShoppingCart, Banknote, Building2, FileBarChart, Settings, ChevronDown, UserRound, UsersRound, CreditCard, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSession } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [mahsulotlarOpen, setMahsulotlarOpen] = useState(pathname.includes('/inventory') || pathname.includes('/barcode') || pathname.includes('/prices'));
  const [omborOpen, setOmborOpen] = useState(pathname.includes('/warehouse'));
  const [mijozlarOpen, setMijozlarOpen] = useState(pathname.includes('/customers') && !pathname.includes('/creditors'));
  const [suppliersOpen, setSuppliersOpen] = useState(pathname.includes('/suppliers'));
  const [usersOpen, setUsersOpen] = useState(pathname.includes('/users') || pathname.includes('/requests') || pathname.includes('/subscriptions'));
  const [pendingRequests, setPendingRequests] = useState(0);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const userPermissions: string[] = (session?.user as any)?.permissions || [];

  // Admin har doim hamma narsani ko'radi, oddiy user faqat ruxsat berilganlarni
  const hasPermission = (perm: string) => isAdmin || userPermissions.includes(perm);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/register/requests?status=PENDING')
        .then(res => res.json())
        .then(data => {
          setPendingRequests(data.pagination?.total || 0);
        })
        .catch(() => {});
    }
  }, [isAdmin, pathname]);

  return (
    <aside className="w-[260px] bg-[#0c1421] dark:bg-slate-900 text-slate-300 dark:text-slate-400 h-screen flex flex-col font-sans shrink-0">
      <div className="flex items-center px-6 h-[72px]">
        <div className="w-8 h-8 rounded bg-teal-500/20 text-teal-400 dark:text-teal-500 flex items-center justify-center font-bold text-sm mr-3">
          W
        </div>
        <div>
          <h1 className="text-white dark:text-slate-200 font-bold tracking-wide text-[15px]">IBOX ERP</h1>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">INVENTORY MANAGEMENT</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar">
        <Link href="/" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1 ${pathname === '/' ? 'bg-[#152033] dark:bg-slate-800 text-white border-l-[3px] border-teal-500' : 'text-slate-400 hover:bg-[#152033] dark:hover:bg-slate-800 hover:text-white border-l-[3px] border-transparent'}`}>
          <LayoutGrid className="mr-3" size={18} /> {t('sidebar', 'dashboard')}
        </Link>

        {isAdmin && (
          <div className="mb-1">
            <button
              onClick={() => setUsersOpen(!usersOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors border-l-[3px] ${(pathname.includes('/users') || pathname.includes('/requests') || pathname.includes('/subscriptions')) ? 'bg-[#152033] dark:bg-slate-800 text-white border-teal-500' : 'text-slate-400 hover:bg-[#152033] dark:hover:bg-slate-800 hover:text-white border-transparent'}`}
            >
              <div className="flex items-center">
                <UsersRound className="mr-3" size={18} /> Foydalanuvchilar
              </div>
              <ChevronDown size={14} className={`transition-transform duration-200 ${usersOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${usersOpen ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
              <Link href="/users" className={`block py-2.5 pl-11 pr-3 text-sm rounded-lg transition-colors ${pathname === '/users' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>Userlar</Link>
              <Link href="/requests" className={`block py-2.5 pl-11 pr-3 text-sm rounded-lg transition-colors ${pathname === '/requests' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>
                <UserPlus size={14} className="inline mr-2" /> So&apos;rovlar
                {pendingRequests > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingRequests}</span>
                )}
              </Link>
              <Link href="/subscriptions" className={`block py-2.5 pl-11 pr-3 text-sm rounded-lg transition-colors ${pathname === '/subscriptions' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}><CreditCard size={14} className="inline mr-2" /> To&apos;lovlar</Link>
            </div>
          </div>
        )}

        {hasPermission('manage_products') && (
          <div className="mb-1">
            <button
              onClick={() => setMahsulotlarOpen(!mahsulotlarOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors border-l-[3px] ${(pathname.includes('/inventory') || pathname.includes('/barcode') || pathname.includes('/prices')) ? 'bg-[#152033] dark:bg-slate-800 text-white border-teal-500' : 'text-slate-400 hover:bg-[#152033] dark:hover:bg-slate-800 hover:text-white border-transparent'}`}
            >
              <div className="flex items-center">
                <Package className="mr-3" size={18} /> {t('sidebar', 'products')}
              </div>
              <ChevronDown size={14} className={`transition-transform duration-200 ${mahsulotlarOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${mahsulotlarOpen ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
              <Link href="/inventory" className={`block py-2.5 pl-11 pr-3 text-sm rounded-lg transition-colors ${pathname === '/inventory' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>{t('products', 'allProducts')}</Link>
              <Link href="/prices" className={`block py-2.5 pl-11 pr-3 text-sm rounded-lg transition-colors ${pathname === '/prices' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>{t('products', 'priceLists')}</Link>
              <Link href="/barcode" className={`block py-2.5 pl-11 pr-3 text-sm rounded-lg transition-colors ${pathname === '/barcode' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>{t('products', 'barcodePrint')}</Link>
            </div>
          </div>
        )}

        {hasPermission('manage_warehouse') && (
          <div className="mb-1">
            <button
              onClick={() => setOmborOpen(!omborOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors border-l-[3px] ${(pathname.includes('/warehouse') && !pathname.includes('/customers')) ? 'bg-[#152033] dark:bg-slate-800 text-white border-teal-500' : 'text-slate-400 hover:bg-[#152033] dark:hover:bg-slate-800 hover:text-white border-transparent'}`}
            >
              <div className="flex items-center">
                 <Warehouse className="mr-3" size={18} /> {t('sidebar', 'warehouse')}
              </div>
              <ChevronDown size={14} className={`transition-transform duration-200 ${omborOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${omborOpen ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
              <Link href="/warehouse" className={`block py-2.5 pl-11 pr-3 text-sm rounded-lg transition-colors ${pathname === '/warehouse' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>{t('warehouse', 'transfers')}</Link>
              <Link href="/warehouse/stock" className={`block py-2.5 pl-11 pr-3 text-sm rounded-lg transition-colors ${pathname === '/warehouse/stock' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>{t('warehouse', 'stockRemaining')}</Link>
              <Link href="/warehouse/inventory" className={`block py-2.5 pl-11 pr-3 text-sm rounded-lg transition-colors ${pathname === '/warehouse/inventory' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>{t('warehouse', 'inventory')}</Link>
              <Link href="/warehouse/adjustment" className={`block py-2.5 pl-11 pr-3 text-sm rounded-lg transition-colors ${pathname === '/warehouse/adjustment' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>Korrektirovka</Link>
            </div>
          </div>
        )}

        {hasPermission('manage_customers') && (
          <div className="mb-1">
            <button
              onClick={() => setMijozlarOpen(!mijozlarOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors border-l-[3px] ${(pathname.includes('/customers')) ? 'bg-[#152033] dark:bg-slate-800 text-teal-400 border-teal-500' : 'text-slate-400 hover:bg-[#152033] dark:hover:bg-slate-800 hover:text-white border-transparent'}`}
            >
              <div className="flex items-center">
                <Users className="mr-3" size={18} /> {t('sidebar', 'customers')}
              </div>
              <ChevronDown size={14} className={`transition-transform duration-200 ${mijozlarOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${mijozlarOpen ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
              <Link href="/customers" className={`block py-2.5 pl-11 pr-3 text-[13px] rounded-lg transition-colors ${pathname === '/customers' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>{t('customers', 'allCustomers')}</Link>
              <Link href="/customers/debtors" className={`block py-2.5 pl-11 pr-3 text-[13px] rounded-lg transition-colors ${pathname === '/customers/debtors' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>{t('customers', 'debtors')}</Link>
              <Link href="/customers/groups" className={`block py-2.5 pl-11 pr-3 text-[13px] rounded-lg transition-colors ${pathname === '/customers/groups' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>{t('customers', 'groups')}</Link>
            </div>
          </div>
        )}

        {hasPermission('manage_suppliers') && (
          <div className="mb-1">
            <button
              onClick={() => setSuppliersOpen(!suppliersOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors border-l-[3px] ${(pathname.includes('/suppliers')) ? 'bg-[#152033] dark:bg-slate-800 text-teal-400 border-teal-500' : 'text-slate-400 hover:bg-[#152033] dark:hover:bg-slate-800 hover:text-white border-transparent'}`}
            >
              <div className="flex items-center">
                <Truck className="mr-3" size={18} /> {t('sidebar', 'suppliers')}
              </div>
              <ChevronDown size={14} className={`transition-transform duration-200 ${suppliersOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${suppliersOpen ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
              <Link href="/suppliers" className={`block py-2.5 pl-11 pr-3 text-[13px] rounded-lg transition-colors ${pathname === '/suppliers' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>{t('suppliers', 'allSuppliers')}</Link>
              <Link href="/suppliers/creditors" className={`block py-2.5 pl-11 pr-3 text-[13px] rounded-lg transition-colors ${pathname === '/suppliers/creditors' ? 'text-teal-400' : 'text-slate-400 hover:text-white hover:bg-[#152033]/50 dark:hover:bg-slate-800/50'}`}>{t('suppliers', 'creditors')}</Link>
            </div>
          </div>
        )}

        {hasPermission('manage_sales') && (
          <Link href="/sales" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1 ${pathname === '/sales' ? 'bg-[#152033] dark:bg-slate-800 text-white border-l-[3px] border-teal-500' : 'text-slate-400 hover:bg-[#152033] dark:hover:bg-slate-800 hover:text-white border-l-[3px] border-transparent'}`}><ShoppingCart className="mr-3" size={18} /> {t('sidebar', 'sales')}</Link>
        )}

        {hasPermission('manage_purchases') && (
          <Link href="/purchases" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1 ${pathname === '/purchases' ? 'bg-[#152033] dark:bg-slate-800 text-white border-l-[3px] border-teal-500' : 'text-slate-400 hover:bg-[#152033] dark:hover:bg-slate-800 hover:text-white border-l-[3px] border-transparent'}`}><ShoppingCart className="mr-3" size={18} /> {t('sidebar', 'purchases')}</Link>
        )}

        <Link href="/cashbox" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1 ${pathname === '/cashbox' ? 'bg-[#152033] dark:bg-slate-800 text-white border-l-[3px] border-teal-500' : 'text-slate-400 hover:bg-[#152033] dark:hover:bg-slate-800 hover:text-white border-l-[3px] border-transparent'}`}><Banknote className="mr-3" size={18} /> {t('sidebar', 'money')}</Link>
        <Link href="/enterprises" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1 ${pathname === '/enterprises' ? 'bg-[#152033] dark:bg-slate-800 text-white border-l-[3px] border-teal-500' : 'text-slate-400 hover:bg-[#152033] dark:hover:bg-slate-800 hover:text-white border-l-[3px] border-transparent'}`}><Building2 className="mr-3" size={18} /> {t('sidebar', 'enterprises')}</Link>

        {hasPermission('view_reports') && (
          <Link href="/reports" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1 ${pathname === '/reports' ? 'bg-[#152033] dark:bg-slate-800 text-white border-l-[3px] border-teal-500' : 'text-slate-400 hover:bg-[#152033] dark:hover:bg-slate-800 hover:text-white border-l-[3px] border-transparent'}`}><FileBarChart className="mr-3" size={18} /> {t('sidebar', 'reports')}</Link>
        )}

        <Link href="/settings" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1 ${pathname === '/settings' ? 'bg-[#152033] dark:bg-slate-800 text-white border-l-[3px] border-teal-500' : 'text-slate-400 hover:bg-[#152033] dark:hover:bg-slate-800 hover:text-white border-l-[3px] border-transparent'}`}><Settings className="mr-3" size={18} /> {t('sidebar', 'settings')}</Link>
      </nav>

      <div className="p-5 border-t border-[#1f2937]/50 dark:border-slate-800 mt-auto">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded bg-[#1e293b] dark:bg-slate-800 flex items-center justify-center mr-3">
             <UserRound size={20} className="text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <div className="text-white dark:text-slate-200 text-sm font-bold tracking-wide">{session?.user?.name || 'User'}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-600 tracking-wider uppercase">{(session?.user as any)?.role || 'STAFF'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
