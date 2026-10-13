import React from 'react';
import { Plus, Bell } from 'lucide-react';

interface TopNavProps {
  activeTab: 'inventory' | 'dashboard' | 'history' | 'flutter';
  onSelectTab: (tab: 'inventory' | 'dashboard' | 'history' | 'flutter') => void;
  onOpenAddModal: () => void;
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
  notificationCount?: number;
  onOpenNotifications?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  isPhoneFrame,
  onToggleFrame,
  notificationCount = 0,
  onOpenNotifications,
}) => {
  return (
    <header className="w-full bg-[#090d16]/75 backdrop-blur-2xl border-b border-white/[0.07] px-4 md:px-8 py-3.5 sticky top-0 z-40 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand wordmark (single text element) */}
        <button
          onClick={() => onSelectTab('inventory')}
          className="text-lg md:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2.5 group text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 p-[1px] shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <div className="w-full h-full bg-[#0d121c] rounded-[7px] flex items-center justify-center">
              <span className="text-amber-400 font-mono text-xs font-black">A</span>
            </div>
          </div>
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent group-hover:from-white group-hover:to-amber-300 transition-all">AuraStock</span>
          <span className="text-orange-400 text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 font-bold tracking-wide">ANDROID PRO</span>
        </button>

        {/* Zone 2: Navigation Links (single-line text) */}
        <nav className="flex items-center gap-4 md:gap-8 text-xs md:text-sm font-medium text-slate-300 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectTab('inventory')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 cursor-pointer ${
              activeTab === 'inventory'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.3)]'
                : 'hover:text-white text-slate-400'
            }`}
          >
            Inventory
          </button>

          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.3)]'
                : 'hover:text-white text-slate-400'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 cursor-pointer ${
              activeTab === 'history'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.3)]'
                : 'hover:text-white text-slate-400'
            }`}
          >
            Audit Log
          </button>

          <button
            onClick={() => onSelectTab('flutter')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 cursor-pointer ${
              activeTab === 'flutter'
                ? 'text-orange-400 font-semibold border-b-2 border-orange-400 shadow-[0_2px_10px_rgba(234,88,12,0.3)]'
                : 'hover:text-white text-slate-400'
            }`}
          >
            Flutter Code
          </button>
        </nav>

        {/* Zone 3: Notification Bell & Primary Action */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Android Low Stock Notification Shade"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border border-black shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 md:px-4 py-2 text-xs md:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 rounded-xl hover:from-amber-300 hover:to-orange-400 transition-all shadow-[0_4px_20px_rgba(245,158,11,0.35)] active:scale-95 whitespace-nowrap shrink-0 cursor-pointer border border-amber-300/40"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
        </div>

      </div>
    </header>
  );
};
