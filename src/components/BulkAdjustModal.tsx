import React, { useState } from 'react';
import { Product } from '../types';
import { X, SlidersHorizontal, ArrowRight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface BulkAdjustModalProps {
  product: Product;
  currencySymbol: string;
  onClose: () => void;
  onApplyAdjustment: (productId: string, newQuantity: number, reason: string) => void;
}

export const BulkAdjustModal: React.FC<BulkAdjustModalProps> = ({
  product,
  currencySymbol,
  onClose,
  onApplyAdjustment,
}) => {
  const [adjustmentMode, setAdjustmentMode] = useState<'set' | 'delta'>('delta');
  const [exactQty, setExactQty] = useState<string>(product.quantity.toString());
  const [deltaQty, setDeltaQty] = useState<string>('10');
  const [deltaSign, setDeltaSign] = useState<'+' | '-'>('+');
  const [reason, setReason] = useState<string>('Delivery Shipment / Restock');

  // Compute projected quantity
  let projectedQty = product.quantity;
  if (adjustmentMode === 'set') {
    const parsed = parseInt(exactQty, 10);
    projectedQty = isNaN(parsed) ? product.quantity : Math.max(0, parsed);
  } else {
    const parsedDelta = parseInt(deltaQty, 10);
    if (!isNaN(parsedDelta)) {
      projectedQty = deltaSign === '+' ? product.quantity + parsedDelta : Math.max(0, product.quantity - parsedDelta);
    }
  }

  const deltaAmount = projectedQty - product.quantity;
  const valuationDelta = deltaAmount * product.price;
  const isProjectedLowStock = projectedQty < 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyAdjustment(product.id, projectedQty, reason);
  };

  const applyQuickPreset = (val: number) => {
    setAdjustmentMode('delta');
    if (val > 0) {
      setDeltaSign('+');
      setDeltaQty(val.toString());
    } else {
      setDeltaSign('-');
      setDeltaQty(Math.abs(val).toString());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#0e1320]/80 backdrop-blur-2xl border border-amber-500/30 rounded-[32px] p-6 md:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow inside modal */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(234,88,12,0.25)]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Bulk Stock Adjustment</h3>
              <p className="text-xs text-slate-400 font-mono">SKU / Barcode: {product.barcode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Product Summary Box (Frosted Glass) */}
        <div className="my-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">
              {product.category}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Unit: <strong className="text-amber-300 font-bold">{currencySymbol}{product.price.toFixed(2)}</strong>
            </span>
          </div>
          <div className="text-sm font-extrabold text-white truncate">{product.name}</div>
          <div className="flex items-center justify-between text-xs text-slate-300 font-mono pt-1">
            <span>Current Stock Count:</span>
            <span className="text-base font-black text-amber-400">{product.quantity} units</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/[0.06] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAdjustmentMode('delta')}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                adjustmentMode === 'delta'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Add / Remove Delta (±)
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentMode('set')}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                adjustmentMode === 'set'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Set Exact Target Quantity
            </button>
          </div>

          {/* Input Controls */}
          {adjustmentMode === 'delta' ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Bulk Adjustment Delta
              </label>
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl overflow-hidden border border-white/[0.08] bg-black/40">
                  <button
                    type="button"
                    onClick={() => setDeltaSign('+')}
                    className={`px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      deltaSign === '+' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    + Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeltaSign('-')}
                    className={`px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      deltaSign === '-' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    - Deduct
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={deltaQty}
                  onChange={(e) => setDeltaQty(e.target.value)}
                  className="flex-1 glass-input text-white rounded-xl px-4 py-2.5 text-base font-mono font-bold focus:outline-none focus:border-amber-400"
                  placeholder="e.g. 50"
                  required
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500">Presets:</span>
                {[5, 10, 25, 50, 100].map((preset) => (
                  <button
                    key={`p-${preset}`}
                    type="button"
                    onClick={() => applyQuickPreset(preset)}
                    className="px-2.5 py-0.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-amber-300 text-[11px] font-mono transition-colors cursor-pointer border border-white/[0.05]"
                  >
                    +{preset}
                  </button>
                ))}
                {[-5, -10].map((preset) => (
                  <button
                    key={`m-${preset}`}
                    type="button"
                    onClick={() => applyQuickPreset(preset)}
                    className="px-2.5 py-0.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-orange-400 text-[11px] font-mono transition-colors cursor-pointer border border-white/[0.05]"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                New Exact Inventory Quantity
              </label>
              <input
                type="number"
                min="0"
                max="100000"
                value={exactQty}
                onChange={(e) => setExactQty(e.target.value)}
                className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-base font-mono font-bold focus:outline-none focus:border-amber-400"
                placeholder="Enter exact count"
                required
              />
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Audit / Adjustment Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full glass-input text-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="Delivery Shipment / Restock" className="bg-[#0f1422]">Delivery Shipment / Restock</option>
              <option value="Physical Count / Periodic Audit" className="bg-[#0f1422]">Physical Count / Periodic Audit</option>
              <option value="Damaged / Scrap / Expired" className="bg-[#0f1422]">Damaged / Scrap / Expired</option>
              <option value="Customer Return" className="bg-[#0f1422]">Customer Return</option>
              <option value="Inventory Rebalancing" className="bg-[#0f1422]">Inventory Rebalancing</option>
              <option value="Point of Sale Direct Deduction" className="bg-[#0f1422]">Point of Sale Direct Deduction</option>
            </select>
          </div>

          {/* Calculation Outcome Preview (Glass Panel) */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isProjectedLowStock
              ? 'glass-panel-red'
              : 'glass-panel'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span>Calculated Outcome:</span>
                {isProjectedLowStock && (
                  <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold shadow-sm animate-pulse">
                    DROPS BELOW 5 (LOW STOCK)
                  </span>
                )}
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {deltaAmount >= 0 ? `+${deltaAmount}` : deltaAmount} units
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{product.quantity}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                <span className={`text-base font-black ${isProjectedLowStock ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'text-white'}`}>
                  {projectedQty} units
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400">Valuation: </span>
                <span className={`font-bold ${valuationDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {valuationDelta >= 0 ? '+' : ''}{currencySymbol}{valuationDelta.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.06] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black transition-all shadow-[0_4px_25px_rgba(245,158,11,0.35)] active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Log Adjustment</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
