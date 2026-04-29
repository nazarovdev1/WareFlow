'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface Branch {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
}

interface BranchContextType {
  selectedBranch: Branch | null;
  branches: Branch[];
  setSelectedBranch: (branch: Branch | null) => void;
  loading: boolean;
  refreshBranches: () => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch('/api/branches');
      if (!res.ok) return;
      const data = await res.json();
      const branchData: Branch[] = data.data || [];

      setBranches(branchData);

      // Auto-select: saved preference > user's branch > first branch
      const savedBranchId = typeof window !== 'undefined'
        ? localStorage.getItem('selectedBranchId')
        : null;

      const userBranchId = (session?.user as { branchId?: string })?.branchId;

      if (savedBranchId) {
        const saved = branchData.find((b: Branch) => b.id === savedBranchId);
        if (saved) {
          setSelectedBranch(saved);
          return;
        }
      }

      if (userBranchId) {
        const userBranch = branchData.find((b: Branch) => b.id === userBranchId);
        if (userBranch) {
          setSelectedBranch(userBranch);
          return;
        }
      }

      if (branchData.length > 0 && !selectedBranch) {
        setSelectedBranch(branchData[0]);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchBranches();
    }
  }, [session, fetchBranches]);

  const handleSetBranch = useCallback((branch: Branch | null) => {
    setSelectedBranch(branch);
    if (branch && typeof window !== 'undefined') {
      localStorage.setItem('selectedBranchId', branch.id);
    }
  }, []);

  return (
    <BranchContext.Provider value={{
      selectedBranch,
      branches,
      setSelectedBranch: handleSetBranch,
      loading,
      refreshBranches: fetchBranches,
    }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) throw new Error('useBranch must be used within BranchProvider');
  return context;
}
