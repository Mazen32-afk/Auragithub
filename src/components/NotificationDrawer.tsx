import React from 'react';
import { AndroidNotification } from '../types';
import { Bell, AlertTriangle, Trash2, X, SlidersHorizontal, ArrowRight } from 'lucide-react';

interface NotificationDrawerProps {
  notifications: AndroidNotification[];
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
  onOpenBulkAdjust: (productId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  isOpen,
  onClose,
  onClearAll,
  onOpenBulkAdjust,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0e1320]/90 backdrop-blur-2xl border border-amber-500/35 rounded-[32px] p-5 md:p-6 shadow-[0_25px_80px_rgba(0,0,0,0.85)] text-slate-100 max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Android Notification Shade
              </h3>
              <p className="text-xs text-slate-400">
                Low-stock threshold (&lt; 5 units) security alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Clear all alerts"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No active stock alerts</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Whenever a product stock count drops below 5 units, an Android alert notification will appear here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-2xl glass-panel-red border-rose-500/50 space-y-2 transition-all hover:border-rose-400"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                    <span className="text-xs font-bold text-white truncate">
                      {n.productName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-rose-200">
                  <span>Stock level: <strong className="font-mono text-rose-400 font-extrabold">{n.quantity} units</strong> (was {n.previousQuantity})</span>
                  <button
                    onClick={() => {
                      onOpenBulkAdjust(n.productId);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-black/40 px-2.5 py-1 rounded-lg border border-amber-500/30 cursor-pointer"
                  >
                    <span>Restock</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
