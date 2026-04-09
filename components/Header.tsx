import { Bell, Search, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-6 font-sans shrink-0 sticky top-0 z-10 w-full">
      <div className="relative w-96 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Qidiruv..." 
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500/50 transition-all placeholder:text-slate-400"
        />
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <button className="text-slate-400 hover:text-slate-600 transition-colors relative p-1.5 focus:outline-none">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
          <button className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 focus:outline-none">
            <Settings size={18} />
          </button>
        </div>
        <div className="text-sm font-medium text-slate-700 pl-4 border-l border-slate-200">
          Wallpaper Ombori
        </div>
      </div>
    </header>
  );
}
