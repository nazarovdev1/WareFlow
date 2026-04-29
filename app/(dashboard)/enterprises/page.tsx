'use client';

import { useState, useEffect } from 'react';
import { Building2, Factory, Store, Warehouse as WarehouseIcon, Plus, Edit3, Trash2, MapPin, Phone, Users, ChevronDown, X, Check, Package, Eye } from 'lucide-react';
import { useNotification } from '@/lib/NotificationContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type BranchType = 'HEADQUARTERS' | 'BRANCH' | 'STORE' | 'WAREHOUSE';

const BRANCH_TYPE_CONFIG: Record<BranchType, { label: string; icon: any; color: string; bg: string }> = {
  HEADQUARTERS: { label: 'Bosh ofis', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  BRANCH: { label: 'Filial', icon: Factory, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  STORE: { label: "Do'kon", icon: Store, color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  WAREHOUSE: { label: 'Ombor', icon: WarehouseIcon, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
};

export default function EnterprisesPage() {
  const { success, error } = useNotification();
  const { t } = useLanguage();

  const [companies, setCompanies] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [editingCompany, setEditingCompany] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [branchDetail, setBranchDetail] = useState<any | null>(null);

  // Form states
  const [branchForm, setBranchForm] = useState({
    name: '', type: 'BRANCH' as BranchType, address: '', phone: '', companyId: '', managerId: '', isActive: true,
  });
  const [companyForm, setCompanyForm] = useState({
    name: '', address: '', phone: '', email: '', inn: '', logo: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/tenants').then(r => r.json()).catch(() => []),
      fetch('/api/branches').then(r => r.json()).then(d => d.data || []).catch(() => []),
    ]).then(([cData, bData]) => {
      setCompanies(Array.isArray(cData) ? cData : []);
      setBranches(bData);
      setLoading(false);
    });
  }, []);

  const fetchBranches = () => {
    fetch('/api/branches')
      .then(r => r.json())
      .then(d => setBranches(d.data || []))
      .catch(console.error);
  };

  const openBranchModal = (branch?: any) => {
    if (branch) {
      setEditingBranch(branch);
      setBranchForm({
        name: branch.name,
        type: branch.type,
        address: branch.address || '',
        phone: branch.phone || '',
        companyId: branch.companyId,
        managerId: branch.managerId || '',
        isActive: branch.isActive,
      });
    } else {
      setEditingBranch(null);
      setBranchForm({ name: '', type: 'BRANCH', address: '', phone: '', companyId: selectedCompany?.id || '', managerId: '', isActive: true });
    }
    setShowBranchModal(true);
  };

  const openCompanyModal = (company?: any) => {
    if (company) {
      setEditingCompany(company);
      setCompanyForm({
        name: company.name,
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        inn: company.inn || '',
        logo: company.logo || '',
      });
    } else {
      setEditingCompany(null);
      setCompanyForm({ name: '', address: '', phone: '', email: '', inn: '', logo: '' });
    }
    setShowCompanyModal(true);
  };

  const handleSaveBranch = async () => {
    if (!branchForm.name || !branchForm.companyId) {
      error('Xatolik', 'Filial nomi va kompaniya majburiy');
      return;
    }
    setSaving(true);
    try {
      const url = editingBranch ? `/api/branches/${editingBranch.id}` : '/api/branches';
      const method = editingBranch ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchForm),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || 'Xatolik');
      }
      success('Saqlandi', editingBranch ? 'Filial yangilandi' : 'Yangi filial yaratildi');
      setShowBranchModal(false);
      fetchBranches();
    } catch (e: any) {
      error('Xatolik', e.message || 'Filialni saqlashda xatolik');
    } finally { setSaving(false); }
  };

  const handleSaveCompany = async () => {
    if (!companyForm.name) {
      error('Xatolik', 'Kompaniya nomi majburiy');
      return;
    }
    setSaving(true);
    try {
      const url = editingCompany ? `/api/tenants/${editingCompany.id}` : '/api/tenants';
      const method = editingCompany ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });
      if (!res.ok) throw new Error();
      success('Saqlandi', editingCompany ? 'Kompaniya yangilandi' : 'Yangi kompaniya yaratildi');
      setShowCompanyModal(false);
      // Refresh companies
      const cData = await fetch('/api/tenants').then(r => r.json());
      setCompanies(Array.isArray(cData) ? cData : []);
    } catch {
      error('Xatolik', 'Kompaniyani saqlashda xatolik');
    } finally { setSaving(false); }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm("Filialni o'chirishni tasdiqlaysizmi?")) return;
    try {
      const res = await fetch(`/api/branches/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        error('Xatolik', data.error || "O'chirishda xatolik");
        return;
      }
      success("O'chirildi", 'Filial muvaffaqiyatli o‘chirildi');
      fetchBranches();
    } catch {
      error('Xatolik', "O'chirishda xatolik");
    }
  };

  const viewBranchDetail = async (branch: any) => {
    try {
      const res = await fetch(`/api/branches/${branch.id}`);
      if (res.ok) {
        const data = await res.json();
        setBranchDetail(data);
      }
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-500">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans w-full h-full text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Building2 className="text-blue-600 dark:text-blue-400" size={28} />
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Korxonalar</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Korxona, filial va do'konlarni boshqarish</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => openCompanyModal()}
            className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors">
            <Plus size={16} className="mr-2" /> Kompaniya
          </button>
          <button onClick={() => openBranchModal()}
            className="flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors">
            <Plus size={16} className="mr-2" /> Filial
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Jami Kompaniyalar</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{companies.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Jami Filiallar</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{branches.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Bosh ofislar</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{branches.filter(b => b.type === 'HEADQUARTERS').length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Do'konlar</div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">{branches.filter(b => b.type === 'STORE').length}</div>
        </div>
      </div>

      {/* Companies & Branches */}
      <div className="space-y-6">
        {companies.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <Building2 size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Kompaniyalar yo'q</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Birinchi kompaniyangizni qo'shing va filiallarni boshqaring</p>
            <button onClick={() => openCompanyModal()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">
              Kompaniya qo'shish
            </button>
          </div>
        ) : companies.map(company => {
          const companyBranches = branches.filter(b => b.companyId === company.id);
          return (
            <div key={company.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Company Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Building2 size={22} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">{company.name}</h2>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      {company.address && <span className="flex items-center gap-1"><MapPin size={12} /> {company.address}</span>}
                      {company.phone && <span className="flex items-center gap-1"><Phone size={12} /> {company.phone}</span>}
                      {company.inn && <span className="font-medium">INN: {company.inn}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                    {companyBranches.length} filial
                  </span>
                  <button onClick={() => openCompanyModal(company)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => { setSelectedCompany(company); openBranchModal(); }}
                    className="flex items-center px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                    <Plus size={14} className="mr-1" /> Filial
                  </button>
                </div>
              </div>

              {/* Branches Grid */}
              <div className="p-5">
                {companyBranches.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    <Factory size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Filiallar yo'q</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companyBranches.map(branch => {
                      const config = BRANCH_TYPE_CONFIG[branch.type as BranchType] || BRANCH_TYPE_CONFIG.BRANCH;
                      const IconComp = config.icon;
                      return (
                        <div key={branch.id}
                          className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer group"
                          onClick={() => viewBranchDetail(branch)}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
                                <IconComp size={18} className={config.color} />
                              </div>
                              <div>
                                <div className="font-bold text-sm text-slate-800 dark:text-white">{branch.name}</div>
                                <div className={`text-[10px] font-bold ${config.color} uppercase tracking-wider`}>{config.label}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); openBranchModal(branch); }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                <Edit3 size={14} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteBranch(branch.id); }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><WarehouseIcon size={12} /> {branch._count?.warehouses || 0} ombor</span>
                            <span className="flex items-center gap-1"><Users size={12} /> {branch._count?.users || 0} xodim</span>
                          </div>
                          {branch.address && (
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                              <MapPin size={10} /> {branch.address}
                            </div>
                          )}
                          {!branch.isActive && (
                            <div className="mt-2 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full inline-block">Nofaol</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Branch Detail Modal */}
      {branchDetail && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setBranchDetail(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{branchDetail.name}</h3>
              <button onClick={() => setBranchDetail(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Turi</div>
                  <div className="font-bold text-slate-800 dark:text-white">{BRANCH_TYPE_CONFIG[branchDetail.type as BranchType]?.label || branchDetail.type}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Kompaniya</div>
                  <div className="font-bold text-slate-800 dark:text-white">{branchDetail.company?.name}</div>
                </div>
                {branchDetail.address && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Manzil</div>
                    <div className="font-bold text-slate-800 dark:text-white">{branchDetail.address}</div>
                  </div>
                )}
                {branchDetail.phone && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Telefon</div>
                    <div className="font-bold text-slate-800 dark:text-white">{branchDetail.phone}</div>
                  </div>
                )}
                {branchDetail.manager && (
                  <div className="col-span-2">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Rahbar</div>
                    <div className="font-bold text-slate-800 dark:text-white">{branchDetail.manager.name} {branchDetail.manager.phone && `(${branchDetail.manager.phone})`}</div>
                  </div>
                )}
              </div>

              {/* Warehouses */}
              {branchDetail.warehouses && branchDetail.warehouses.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-3">Omborlar</div>
                  <div className="space-y-2">
                    {branchDetail.warehouses.map((w: any) => (
                      <div key={w.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <WarehouseIcon size={14} className="text-amber-500" />
                        <span className="text-sm font-medium text-slate-800 dark:text-white">{w.name}</span>
                        {w.address && <span className="text-xs text-slate-500 ml-auto">{w.address}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {branchDetail.users && branchDetail.users.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-3">Xodimlar</div>
                  <div className="space-y-2">
                    {branchDetail.users.map((u: any) => (
                      <div key={u.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <Users size={14} className="text-blue-500" />
                        <span className="text-sm font-medium text-slate-800 dark:text-white">{u.name || 'Nomaʼlum'}</span>
                        <span className="text-xs text-slate-500 ml-auto">{u.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
              <button onClick={() => setBranchDetail(null)} className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50">Yopish</button>
            </div>
          </div>
        </>
      )}

      {/* Branch Modal */}
      {showBranchModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowBranchModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingBranch ? 'Filialni tahrirlash' : 'Yangi filial'}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Filial nomi *</label>
                <input type="text" value={branchForm.name} onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-slate-200" placeholder="Filial nomini kiriting" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Filial turi</label>
                <select value={branchForm.type} onChange={e => setBranchForm({ ...branchForm, type: e.target.value as BranchType })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none text-slate-800 dark:text-slate-200">
                  <option value="HEADQUARTERS">Bosh ofis</option>
                  <option value="BRANCH">Filial</option>
                  <option value="STORE">Do'kon</option>
                  <option value="WAREHOUSE">Ombor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Kompaniya *</label>
                <select value={branchForm.companyId} onChange={e => setBranchForm({ ...branchForm, companyId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none text-slate-800 dark:text-slate-200">
                  <option value="">Tanlang...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Manzil</label>
                <input type="text" value={branchForm.address} onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-slate-200" placeholder="Manzil" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Telefon</label>
                <input type="text" value={branchForm.phone} onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-slate-200" placeholder="+998 XX XXX XX XX" />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
              <button onClick={() => setShowBranchModal(false)} className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50">Bekor qilish</button>
              <button onClick={handleSaveBranch} disabled={saving}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors">
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Company Modal */}
      {showCompanyModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowCompanyModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingCompany ? 'Kompaniyani tahrirlash' : 'Yangi kompaniya'}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Kompaniya nomi *</label>
                <input type="text" value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200" placeholder="Kompaniya nomi" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Manzil</label>
                <input type="text" value={companyForm.address} onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200" placeholder="Manzil" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Telefon</label>
                  <input type="text" value={companyForm.phone} onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200" placeholder="+998" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">INN</label>
                  <input type="text" value={companyForm.inn} onChange={e => setCompanyForm({ ...companyForm, inn: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200" placeholder="INN" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Email</label>
                <input type="email" value={companyForm.email} onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200" placeholder="email@company.com" />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
              <button onClick={() => setShowCompanyModal(false)} className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50">Bekor qilish</button>
              <button onClick={handleSaveCompany} disabled={saving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors">
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
