import React, { useEffect } from 'react';
import { AndroidNotification, Product } from '../types';
import { AlertTriangle, X, SlidersHorizontal, BellRing } from 'lucide-react';

interface AndroidNotificationBannerProps {
  notification: AndroidNotification | null;
  onDismiss: () => void;
  onOpenBulkAdjust: (productId: string) => void;
}

export const AndroidNotificationBanner: React.FC<AndroidNotificationBannerProps> = ({
  notification,
  onDismiss,
  onOpenBulkAdjust,
}) => {
  useEffect(() => {
    if (!notification) return;
    // Auto dismiss after 7 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-3 inset-x-0 z-50 px-4 flex justify-center pointer-events-none animate-in slide-in-from-top-4 duration-300">
      <div 
        className="w-full max-w-md pointer-events-auto bg-[#180b0f]/95 backdrop-blur-2xl border border-rose-500/60 rounded-3xl p-4 shadow-[0_20px_60px_rgba(225,29,72,0.35),0_0_0_1px_rgba(255,255,255,0.08)] text-slate-100 ring-1 ring-rose-500/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top App Header Strip (Android notification spec) */}
        <div className="flex items-center justify-between pb-2 border-b border-rose-500/20 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 p-[1px] flex items-center justify-center shadow-sm">
              <div className="w-full h-full bg-[#0d121c] rounded-[5px] flex items-center justify-center">
                <span className="text-[10px] font-black text-amber-400 font-mono">A</span>
              </div>
            </div>
            <span className="font-bold text-white tracking-tight">AuraStock</span>
            <span className="text-rose-400 font-semibold">• Stock Sentinel</span>
            <span className="text-slate-400 text-[11px] font-mono">Just now</span>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Body */}
        <div className="pt-2.5 flex items-start gap-3">
          <div className="p-2 rounded-2xl bg-rose-600/25 border border-rose-500/50 text-rose-400 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.35)] animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-white truncate">
                Critical Low Stock Alert
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-300 font-bold border border-rose-500/40 shrink-0">
                &lt; 5 Units
              </span>
            </div>

            <p className="text-xs text-rose-200/90 mt-0.5 line-clamp-1 font-semibold">
              {notification.productName}
            </p>

            <p className="text-[11px] text-slate-300 mt-1">
              Quantity dropped to <strong className="text-rose-400 font-mono font-bold text-xs">{notification.quantity} units</strong> (from {notification.previousQuantity}). Immediate restock advised.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 pt-2.5 border-t border-rose-500/20 flex items-center justify-end gap-2">
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            Dismiss
          </button>

          <button
            onClick={() => {
              onOpenBulkAdjust(notification.productId);
              onDismiss();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-950/40 active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Restock / Adjust Now</span>
          </button>
        </div>

        {/* Auto-dismiss timer progress bar */}
        <div className="h-0.5 bg-rose-500/20 -mx-4 -mb-4 mt-3 overflow-hidden">
          <div className="h-full bg-rose-500 animate-[pulse_2s_infinite] w-full" />
        </div>
      </div>
    </div>
  );
};
