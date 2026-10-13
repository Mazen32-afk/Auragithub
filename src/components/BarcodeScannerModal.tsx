import React, { useState } from 'react';
import { Product } from '../types';
import { X, Barcode, Scan, CheckCircle2, ArrowRight } from 'lucide-react';

interface BarcodeScannerModalProps {
  products: Product[];
  currencySymbol: string;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  products,
  currencySymbol,
  onClose,
  onSelectProduct,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleScanCode = (code: string) => {
    setManualCode(code);
    const found = products.find((p) => p.barcode === code.trim());
    if (found) {
      setScannedResult(found);
      setNotFound(false);
    } else {
      setScannedResult(null);
      setNotFound(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#0e1320]/85 backdrop-blur-2xl border border-amber-500/35 rounded-[32px] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Barcode Scanner</h3>
              <p className="text-xs text-slate-400">Scan or simulate barcode input</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Simulator with glowing lasers */}
        <div className="my-4 relative h-48 rounded-2xl bg-black/60 border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center overflow-hidden shadow-inner">
          
          {/* Laser scanning beam animation */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_20px_#ef4444] animate-[bounce_2.5s_infinite]" />

          {/* Corner Viewfinder Marks */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400" />

          <Barcode className="w-16 h-16 text-slate-600/70 mb-2 drop-shadow-md" />
          <p className="text-xs font-mono text-amber-300 tracking-wider uppercase font-semibold">
            Point camera or select sample barcode
          </p>
        </div>

        {/* Manual Barcode Entry Form */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter barcode digits..."
              className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => handleScanCode(manualCode)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
            >
              Verify
            </button>
          </div>

          {/* Quick-test Barcode chips from live inventory */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400">
              Quick test sample barcodes:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
              {products.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleScanCode(p.barcode)}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-amber-500/30 text-[11px] font-mono text-amber-300 transition-all cursor-pointer"
                >
                  {p.barcode} ({p.name.slice(0, 10)}...)
                </button>
              ))}
            </div>
          </div>

          {/* Found Result Banner */}
          {scannedResult && (
            <div className={`p-4 rounded-2xl border space-y-2 animate-in zoom-in-95 duration-150 ${
              scannedResult.quantity < 5
                ? 'glass-panel-red text-rose-200'
                : 'glass-panel-gold text-slate-100'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Product Matched!</span>
                </span>
                <span className="font-mono text-amber-300 font-bold">{scannedResult.barcode}</span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-white">{scannedResult.name}</h4>
                <div className="text-xs text-slate-300 mt-1 flex items-center justify-between">
                  <span>Stock: <strong className={`font-mono font-bold ${scannedResult.quantity < 5 ? 'text-rose-400 text-sm' : 'text-amber-400 text-sm'}`}>{scannedResult.quantity} units</strong></span>
                  <span>Price: <strong className="font-mono text-amber-300">{currencySymbol}{scannedResult.price.toFixed(2)}</strong></span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectProduct(scannedResult);
                  onClose();
                }}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(245,158,11,0.35)] cursor-pointer"
              >
                <span>Open in Adjustments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {notFound && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs text-rose-300">
              No matching SKU or product found for barcode: <strong className="font-mono">{manualCode}</strong>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
