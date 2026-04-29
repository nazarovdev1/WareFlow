'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Building2 } from 'lucide-react';
import { useBranch } from '@/lib/BranchContext';
import { useSession } from 'next-auth/react';

export default function BranchSelector() {
  const { selectedBranch, branches, setSelectedBranch } = useBranch();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userRole = (session?.user as { role?: string })?.role;
  // Only SUPER_ADMIN and ADMIN can switch branches
  const canSwitch = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!canSwitch) {
    // Non-admin users see their branch name as static text
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400">
        <MapPin size={14} />
        <span className="max-w-[120px] truncate">{selectedBranch?.name || 'Filial'}</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors min-w-[140px]"
      >
        <MapPin size={14} className="text-teal-500 shrink-0" />
        <span className="truncate text-slate-700 dark:text-slate-200 font-medium">
          {selectedBranch?.name || 'Filial tanlang'}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
            <div className="p-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Filialni tanlang
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {/* "All branches" option for admins */}
              <button
                onClick={() => {
                  setSelectedBranch(null);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  !selectedBranch
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Building2 size={16} className="shrink-0" />
                <span>Barcha filiallar</span>
                {!selectedBranch && <Check size={14} className="ml-auto text-teal-600" />}
              </button>

              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranch(branch);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    selectedBranch?.id === branch.id
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <MapPin size={16} className="shrink-0 text-slate-400" />
                  <div className="text-left">
                    <div className="truncate">{branch.name}</div>
                    {branch.type && (
                      <div className="text-[10px] text-slate-400 uppercase">{branch.type}</div>
                    )}
                  </div>
                  {selectedBranch?.id === branch.id && (
                    <Check size={14} className="ml-auto text-teal-600 dark:text-teal-400" />
                  )}
                </button>
              ))}
            </div>

            {branches.length === 0 && (
              <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                Filiallar mavjud emas
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
