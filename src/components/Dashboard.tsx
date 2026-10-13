import React from 'react';
import { Product } from '../types';
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Boxes, 
  FileSpreadsheet, 
  FileText,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  products: Product[];
  currencySymbol: string;
  onNavigateToLowStock: () => void;
  onNavigateToInventory: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  products,
  currencySymbol,
  onNavigateToLowStock,
  onNavigateToInventory,
  onExportCSV,
  onExportPDF,
}) => {
  // 1. Total Financial Value of entire inventory
  const totalFinancialValue = products.reduce((acc, p) => acc + p.quantity * p.price, 0);
  const totalUnits = products.reduce((acc, p) => acc + p.quantity, 0);
  const lowStockProducts = products.filter((p) => p.quantity < 5);
  const outOfStockProducts = products.filter((p) => p.quantity === 0);

  // Group by category for valuation breakdown
  const categoryMap = products.reduce((acc, p) => {
    const val = p.quantity * p.price;
    acc[p.category] = (acc[p.category] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const categoryEntries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  // Top valued items
  const sortedByValue = [...products].sort((a, b) => b.quantity * b.price - a.quantity * a.price);
  const topFiveValued = sortedByValue.slice(0, 5);

  return (
    <div className="w-full space-y-6">
      
      {/* Primary KPI Card: Ultra-Luxury Translucent Gold Glass */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-gold p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Ambient backlight */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-400/20 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <DollarSign className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold tracking-widest text-amber-400/90 uppercase font-mono">
                Total Financial Valuation
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-semibold">
                Live Audit
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl md:text-6xl font-black font-mono tabular-nums tracking-tight bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent drop-shadow-sm">
                {currencySymbol}
                {totalFinancialValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <p className="text-xs text-slate-300/80 max-w-lg leading-relaxed">
              Consolidated real-time asset balance calculated across {products.length} registered product SKUs in stock.
            </p>
          </div>

          {/* Quick Action Export Buttons (Glassmorphism) */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onExportCSV}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-amber-300 border border-amber-500/30 text-xs font-bold backdrop-blur-xl transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onExportPDF}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-[0_4px_25px_rgba(234,88,12,0.4)] border border-amber-400/30 active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF Statement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Key Secondary Metrics (Frosted Glass Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        
        {/* Metric 1: Total Units */}
        <div className="rounded-2xl glass-panel p-4 md:p-5 space-y-1.5 hover:border-amber-400/30 transition-all group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-300">In-Stock Units</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalUnits.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Physical units counted</p>
        </div>

        {/* Metric 2: Active SKUs */}
        <div className="rounded-2xl glass-panel p-4 md:p-5 space-y-1.5 hover:border-orange-400/30 transition-all group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-300">Active SKUs</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tabular-nums">
            {products.length}
          </div>
          <p className="text-[11px] text-slate-400">Unique catalog lines</p>
        </div>

        {/* Metric 3: Low Stock (< 5) Alert Card (Translucent Ruby Glass) */}
        <div 
          onClick={onNavigateToLowStock}
          className={`rounded-2xl p-4 md:p-5 space-y-1.5 cursor-pointer transition-all ${
            lowStockProducts.length > 0
              ? 'glass-panel-red hover:shadow-[0_12px_40px_rgba(239,68,68,0.3)]'
              : 'glass-panel text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300">Low Stock (&lt; 5)</span>
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertTriangle className={`w-4 h-4 ${lowStockProducts.length > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div className={`text-2xl md:text-3xl font-black font-mono tabular-nums ${lowStockProducts.length > 0 ? 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]' : 'text-white'}`}>
            {lowStockProducts.length}
          </div>
          <p className="text-[11px] text-rose-300/80 flex items-center gap-1 font-medium">
            <span>Critical replenishment</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Metric 4: Out of stock */}
        <div className="rounded-2xl glass-panel p-4 md:p-5 space-y-1.5 hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-300">Depleted Stock</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">0 QTY</span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tabular-nums">
            {outOfStockProducts.length}
          </div>
          <p className="text-[11px] text-slate-400">Completely exhausted</p>
        </div>

      </div>

      {/* Two Column Section: Category Distribution & Top Value Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Valuation Breakdown (Translucent Glass) */}
        <div className="rounded-3xl glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Valuation by Category</span>
            </h3>
            <span className="text-xs text-amber-400/80 font-mono font-medium">
              {categoryEntries.length} Verticals
            </span>
          </div>

          <div className="space-y-3.5">
            {categoryEntries.map(([category, val]) => {
              const percentage = totalFinancialValue > 0 ? Math.round((val / totalFinancialValue) * 100) : 0;
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-semibold">{category}</span>
                    <span className="font-mono text-amber-300 font-bold tabular-nums">
                      {currencySymbol}{val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-slate-400 ml-1.5 font-sans font-normal">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900/80 border border-white/[0.04] overflow-hidden p-[1px]">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Valued Inventory Items (Translucent Glass) */}
        <div className="rounded-3xl glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-400" />
              <span>Highest Financial Value SKUs</span>
            </h3>
            <button 
              onClick={onNavigateToInventory}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold cursor-pointer transition-colors"
            >
              <span>View catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topFiveValued.map((product) => {
              const lineVal = product.quantity * product.price;
              const isLow = product.quantity < 5;
              return (
                <div
                  key={product.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    isLow 
                      ? 'bg-rose-950/30 border-rose-600/40 hover:border-rose-500/60 shadow-[0_4px_20px_rgba(244,63,94,0.1)]' 
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] hover:border-amber-500/30'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="font-bold text-slate-100 truncate flex items-center gap-2">
                      <span className="truncate">{product.name}</span>
                      {isLow && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/25 border border-rose-500/40 text-rose-300 font-extrabold uppercase shrink-0">
                          Low Stock (&lt;5)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Stock: <strong className="text-slate-200">{product.quantity}</strong> × {currencySymbol}{product.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-amber-300 tabular-nums text-sm">
                      {currencySymbol}{lineVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{product.barcode}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
