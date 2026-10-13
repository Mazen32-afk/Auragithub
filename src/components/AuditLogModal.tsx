import React from 'react';
import { InventoryLog } from '../types';
import { History, ArrowUpRight, ArrowDownRight, RefreshCw, X, Trash2 } from 'lucide-react';

interface AuditLogModalProps {
  logs: InventoryLog[];
  onClearLogs: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between glass-panel p-5 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Stock Adjustment Audit Log</h3>
            <p className="text-xs text-slate-400">Chronological transaction history of all inventory changes</p>
          </div>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-800 text-xs font-semibold transition-all cursor-pointer backdrop-blur-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="p-14 text-center glass-panel rounded-3xl space-y-2">
          <History className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">No adjustment history yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use the increment, decrement, or bulk adjustment tools on any product to see logged entries.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => {
            const isAddition = log.delta > 0;
            const isZero = log.delta === 0;

            return (
              <div
                key={log.id}
                className="p-4 rounded-2xl glass-panel hover:border-white/20 transition-all flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isAddition
                        ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : isZero
                        ? 'bg-white/[0.05] text-slate-300 border-white/[0.08]'
                        : 'bg-rose-950/50 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                    }`}
                  >
                    {isAddition ? (
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    ) : isZero ? (
                      <RefreshCw className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-white truncate text-sm">{log.productName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      <span className="text-amber-400 font-semibold">{log.reason}</span>
                      <span className="mx-2 text-white/20">·</span>
                      <span className="font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-mono font-black tabular-nums text-sm ${
                      isAddition ? 'text-emerald-400' : isZero ? 'text-slate-300' : 'text-rose-400'
                    }`}
                  >
                    {isAddition ? `+${log.delta}` : log.delta} units
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {log.previousQty} → <strong className="text-white font-bold">{log.newQty}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
