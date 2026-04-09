'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, Download, ArrowUpDown, MoreHorizontal, Image as ImageIcon, PackageCheck, Truck, AlertTriangle, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import { fetchProducts, deleteProduct } from '@/lib/features/inventory/inventorySlice';

export default function InventoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, status, pagination } = useSelector((state: RootState) => state.inventory);

  React.useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);
  return (
    <div className="p-6 font-sans w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mahsulotlar Ombori</h1>
            <span className="bg-teal-100 text-teal-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">High Density View</span>
          </div>
          <p className="text-slate-500 font-medium">Monitoring and bulk updates for current active inventory across all Tashkent clusters.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition">
            <Filter size={16} className="mr-2" /> Filtrlar
          </button>
          <Link href="/inventory/add" className="flex items-center px-4 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-lg shadow-lg shadow-slate-900/20 transition">
            <Plus size={16} className="mr-2" /> Yangi qo&apos;shish
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-slate-300 w-4 h-4 text-teal-600 focus:ring-teal-500" /></th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 uppercase tracking-wider">SKU & Nomi</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 uppercase tracking-wider">Kategoriya</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 uppercase tracking-wider text-right">Zaxira</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-4 font-black text-xs text-slate-500 uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {status === 'loading' && <tr><td colSpan={8} className="text-center py-10 text-slate-500">Yuklanmoqda...</td></tr>}
            {status === 'succeeded' && items.map((item, index) => {
              const totalStock = item.stockEntries?.reduce((sum, entry) => sum + entry.quantity, 0) || 0;
              const productStatus = totalStock === 0 ? 'Out of Stock' : totalStock < 50 ? 'Critical Low' : totalStock > 1000 ? 'High Stock' : 'In Stock';
              const statusColor = productStatus === 'Out of Stock' || productStatus === 'Critical Low' ? 'text-red-600 bg-red-50 border-red-200' : productStatus === 'High Stock' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-teal-600 bg-teal-50 border-teal-200';
              const dotColor = productStatus === 'In Stock' || productStatus === 'High Stock' ? 'bg-teal-500' : 'bg-red-500';
              
              // Generate a stable color based on ID for visual consistency
              const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const hue = (hash * 137.5) % 360;
              const color = `hsl(${hue}, 30%, 60%)`;

              return (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <input type="checkbox" className="rounded border-slate-300 w-4 h-4 text-teal-600 focus:ring-teal-500" />
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-4">
                    {item.imageUrl ? (
                      <div className="w-10 h-10 rounded shadow-inner bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }}></div>
                    ) : (
                      <div className="w-10 h-10 rounded shadow-inner" style={{ backgroundColor: color }}></div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">{item.sku || item.barcode || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-md">{item.category?.name || 'Kategoriyasiz'}</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="font-black text-slate-900 text-base">{totalStock.toLocaleString()} <span className="text-xs font-medium text-slate-400">{item.unit?.shortName || ''}</span></div>
                  <div className="w-full bg-slate-100 h-1 mt-2 rounded-full overflow-hidden">
                     <div className={`h-full ${productStatus === 'Critical Low' ? 'bg-red-500 w-[10%]' : productStatus === 'Out of Stock' ? 'w-0' : totalStock > 1000 ? 'bg-teal-500 w-[80%]' : 'bg-teal-500 w-[50%]'}`}></div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></span>
                    {productStatus}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="font-bold text-slate-700 text-xs">Asosiy Ta'minotchi</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Ulgurji: {item.wholesalePrice?.toLocaleString() || 0}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-xs font-bold text-slate-600 whitespace-pre-line leading-tight">{new Date(item.updatedAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-5 text-center">
                  <button onClick={() => {
                    if(confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) {
                      dispatch(deleteProduct(item.id))
                        .unwrap()
                        .then(() => alert("Muhsulot muvaffaqiyatli o'chirildi!"))
                        .catch(err => alert("O'chirishda xatolik: " + err));
                    }
                  }} className="text-red-400 hover:text-red-600 transition bg-white border border-transparent hover:border-red-200 hover:bg-red-50 p-1.5 rounded-md shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 bg-slate-50/50">
          <div className="flex space-x-6 uppercase tracking-wider">
            <span>Ko&apos;rsatilmoqda: 1-{items.length} dan {pagination?.total || 0} ta</span>
            <span>Qatorlar: <strong className="text-slate-900 ml-1">25</strong></span>
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-1 rounded text-slate-400 hover:bg-slate-200"><ChevronLeft size={16} /></button>
            <button className="w-7 h-7 rounded bg-[#0f172a] text-white flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded hover:bg-slate-200 text-slate-700 flex items-center justify-center">2</button>
            <button className="w-7 h-7 rounded hover:bg-slate-200 text-slate-700 flex items-center justify-center">3</button>
            <span className="px-1 text-slate-300">...</span>
            <button className="w-7 h-7 rounded hover:bg-slate-200 text-slate-700 flex items-center justify-center">20</button>
            <button className="p-1 rounded text-slate-400 hover:bg-slate-200"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mt-auto">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-[6px] border-l-teal-400 flex items-center">
           <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mr-5">
             <PackageCheck size={24} />
           </div>
           <div>
             <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Total SKU</div>
             <div className="text-2xl font-black text-slate-900">{pagination?.total || 0}</div>
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-[6px] border-l-blue-500 flex items-center">
           <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mr-5">
             <Truck size={24} />
           </div>
           <div>
             <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Active Orders</div>
             <div className="text-2xl font-black text-slate-900">148</div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-[6px] border-l-red-500 flex items-center">
           <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mr-5">
             <AlertTriangle size={24} />
           </div>
           <div>
             <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Out of Stock</div>
             <div className="text-2xl font-black text-slate-900">12</div>
           </div>
        </div>

        <div className="bg-[#1e2330] p-6 rounded-2xl shadow-lg shadow-slate-900/10 border border-slate-700 flex justify-between items-center text-white">
           <div>
             <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Warehouse Cap.</div>
             <div className="text-3xl font-black tracking-tight">94.2%</div>
           </div>
           <div className="w-14 h-14 rounded-full border-4 border-teal-500 border-t-slate-700 flex items-center justify-center rotate-45">
              <span className="text-[10px] font-black -rotate-45 text-teal-400">HIGH</span>
           </div>
        </div>
      </div>
    </div>
  );
}
