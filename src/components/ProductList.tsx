import React, { useState } from 'react';
import { Product, FilterStatus, SortField, SortOrder } from '../types';
import { 
  Search, 
  X, 
  Plus, 
  Minus, 
  SlidersHorizontal, 
  Barcode, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  FileSpreadsheet, 
  FileText,
  Boxes,
  Sparkles,
  Layers,
  ArrowDownAZ,
  ArrowUpAZ,
  FolderPlus
} from 'lucide-react';

interface ProductListProps {
  products: Product[];
  currencySymbol: string;
  categoriesList?: string[];
  onOpenAddCategory?: () => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onOpenBulkAdjust: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onOpenScanner: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  activeFilterStatus: FilterStatus;
  onChangeFilterStatus: (status: FilterStatus) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  currencySymbol,
  categoriesList,
  onOpenAddCategory,
  onIncrement,
  onDecrement,
  onOpenBulkAdjust,
  onEditProduct,
  onDeleteProduct,
  onOpenScanner,
  onExportCSV,
  onExportPDF,
  activeFilterStatus,
  onChangeFilterStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  // Priority: Alphabetical A-Z sorting by default as requested!
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');

  // Available unique categories
  const categories = categoriesList || ['all', ...Array.from(new Set(products.map((p) => p.category)))];
  if (!categories.includes('all')) {
    categories.unshift('all');
  }

  // Available unique initial letters for fast alphabetical navigation
  const availableLetters = Array.from(
    new Set(products.map((p) => p.name.trim().charAt(0).toUpperCase()))
  ).sort();

  // 5. Search feature: find products by name or barcode
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    // Alphabetical Letter filter (optional quick filter)
    const matchesLetter =
      selectedLetter === 'all' ||
      product.name.trim().toUpperCase().startsWith(selectedLetter);

    let matchesStatus = true;
    if (activeFilterStatus === 'low_stock') {
      matchesStatus = product.quantity < 5;
    } else if (activeFilterStatus === 'in_stock') {
      matchesStatus = product.quantity >= 5;
    } else if (activeFilterStatus === 'out_of_stock') {
      matchesStatus = product.quantity === 0;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesLetter;
  });

  // Sorting with Alphabetical Priority as primary or secondary tie-breaker
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    } else if (sortField === 'quantity') {
      comparison = a.quantity - b.quantity;
      // Secondary priority: alphabetical tie-breaker
      if (comparison === 0) comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'price') {
      comparison = a.price - b.price;
      if (comparison === 0) comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'value') {
      comparison = a.quantity * a.price - b.quantity * b.price;
      if (comparison === 0) comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'updatedAt') {
      comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (comparison === 0) comparison = a.name.localeCompare(b.name);
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // For name: default to A-Z (asc), for value/quantity: default to desc
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  const totalFilteredValue = sortedProducts.reduce((sum, p) => sum + p.quantity * p.price, 0);

  return (
    <div className="w-full space-y-4">
      
      {/* Search and Action Toolbar (Translucent Glass Panel) */}
      <div className="glass-panel rounded-3xl p-4 md:p-5 space-y-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        
        {/* Top Search Input Row */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name or barcode (e.g. 890123...)"
              className="w-full glass-input text-slate-100 placeholder-slate-400 text-sm rounded-2xl pl-11 pr-10 py-3 focus:border-amber-400/80 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Barcode Scanner Trigger Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-amber-500/30 text-amber-300 rounded-2xl text-xs font-bold shrink-0 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] active:scale-95 cursor-pointer backdrop-blur-md"
            title="Scan barcode with camera or simulation"
          >
            <Barcode className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Scan Barcode</span>
          </button>

          {/* Export CSV & PDF shortcuts */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <button
              onClick={onExportCSV}
              className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
              title="Export CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={onExportPDF}
              className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
              title="Export PDF"
            >
              <FileText className="w-4 h-4 text-orange-400" />
            </button>
          </div>
        </div>

        {/* Filter Chips & Category Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
          
          {/* Stock Status Filter Buttons (Glass Tabs) */}
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-2xl text-xs font-semibold border border-white/[0.05]">
            <button
              onClick={() => onChangeFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilterStatus === 'all'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-[0_2px_12px_rgba(245,158,11,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({products.length})
            </button>

            {/* Low stock filter highlight */}
            <button
              onClick={() => onChangeFilterStatus('low_stock')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeFilterStatus === 'low_stock'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-[0_2px_15px_rgba(239,68,68,0.5)]'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock &lt; 5 ({products.filter((p) => p.quantity < 5).length})</span>
            </button>

            <button
              onClick={() => onChangeFilterStatus('in_stock')}
              className={`hidden sm:inline-block px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilterStatus === 'in_stock'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-[0_2px_12px_rgba(245,158,11,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Healthy &ge; 5
            </button>

            <button
              onClick={() => onChangeFilterStatus('out_of_stock')}
              className={`hidden md:inline-block px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilterStatus === 'out_of_stock'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-[0_2px_12px_rgba(245,158,11,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Depleted (0)
            </button>
          </div>

          {/* Category Dropdown and Add Category Trigger */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-black/40 text-slate-200 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0f1422] text-slate-200">
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              {onOpenAddCategory && (
                <button
                  onClick={onOpenAddCategory}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
                  title="Create New Category"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">+ Add Category</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-black/40 border border-white/[0.08] rounded-2xl px-3 py-1.5 shadow-inner">
              <span className="hidden sm:inline font-medium text-slate-400">Sort:</span>
              
              {/* Priority Alphabetical A-Z Sort Button */}
              <button
                onClick={() => toggleSort('name')}
                className={`flex items-center gap-1 font-semibold text-xs px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  sortField === 'name'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'text-amber-300 hover:text-white hover:bg-white/[0.05]'
                }`}
                title="Sort Alphabetically (Priority)"
              >
                {sortOrder === 'asc' ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpAZ className="w-3.5 h-3.5" />}
                <span>A-Z {sortField === 'name' ? (sortOrder === 'asc' ? 'A→Z' : 'Z→A') : ''}</span>
              </button>

              <span className="text-white/20">·</span>

              <button
                onClick={() => toggleSort('value')}
                className={`font-mono text-xs px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  sortField === 'value' ? 'text-amber-400 font-bold bg-white/[0.06]' : 'hover:text-slate-200'
                }`}
              >
                Value {sortField === 'value' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
              </button>

              <span className="text-white/20">·</span>

              <button
                onClick={() => toggleSort('quantity')}
                className={`font-mono text-xs px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  sortField === 'quantity' ? 'text-amber-400 font-bold bg-white/[0.06]' : 'hover:text-slate-200'
                }`}
              >
                Qty {sortField === 'quantity' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
              </button>
            </div>
          </div>

        </div>

        {/* Alphabetical Fast Jump Index Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-white/[0.04] no-scrollbar">
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <ArrowDownAZ className="w-3 h-3 text-amber-400" />
            <span>A-Z Jump:</span>
          </span>
          <button
            onClick={() => setSelectedLetter('all')}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
              selectedLetter === 'all'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          {availableLetters.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`w-6 h-6 rounded-lg text-[11px] font-mono font-bold transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                selectedLetter === letter
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-white/[0.06]'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

      </div>

      {/* Filter summary status strip */}
      <div className="flex items-center justify-between text-xs px-2 text-slate-400">
        <div className="flex items-center gap-2">
          <span>Catalog: <strong className="text-white font-mono">{sortedProducts.length}</strong> of {products.length} active SKUs</span>
          {activeFilterStatus === 'low_stock' && (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              Low Stock Alert Filter Active
            </span>
          )}
        </div>
        <div className="font-mono text-amber-400 tabular-nums font-bold">
          Batch Valuation: {currencySymbol}{totalFilteredValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Product List: High-End Translucent Glass Cards */}
      {sortedProducts.length === 0 ? (
        <div className="p-14 text-center glass-panel rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-500">
            <Boxes className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-200">No matching products found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or clearing status and category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              onChangeFilterStatus('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sortedProducts.map((product) => {
            // Requirement 4: Automatic color change to red for product rows where quantity drops below 5
            const isLowStock = product.quantity < 5;
            const lineValue = product.quantity * product.price;

            return (
              <div
                key={product.id}
                className={`group relative rounded-3xl p-4 md:p-5 transition-all duration-300 ${
                  isLowStock
                    ? 'glass-panel-red hover:shadow-[0_12px_45px_rgba(239,68,68,0.3)]'
                    : 'glass-panel hover:border-amber-400/40 hover:shadow-[0_16px_45px_rgba(245,158,11,0.15)] hover:bg-[#111728]/70'
                }`}
              >
                {/* Subtle sheen highlight across card */}
                <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                {/* Mobile / Desktop Unified Glass Card Layout */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left Column: Product Info & Barcode */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className={`text-sm md:text-base font-bold truncate tracking-tight ${
                        isLowStock ? 'text-rose-100 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'text-white'
                      }`}>
                        {product.name}
                      </h3>

                      {/* Requirement 4 Automatic Red Indicator Badge */}
                      {isLowStock ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600/30 border border-rose-500/70 text-rose-300 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>LOW STOCK (&lt; 5)</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-400/90 font-medium px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                          {product.category}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="font-mono text-slate-300 flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded-lg border border-white/[0.05]">
                        <Barcode className="w-3.5 h-3.5 text-amber-400" />
                        <span>{product.barcode}</span>
                      </span>
                      <span className="text-white/20">·</span>
                      <span>
                        Price: <strong className="text-amber-300 font-mono font-bold">{currencySymbol}{product.price.toFixed(2)}</strong>
                      </span>
                      <span className="text-white/20">·</span>
                      <span>
                        Line Value: <strong className="text-white font-mono font-bold">{currencySymbol}{lineValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </span>
                    </div>

                    {product.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 italic pt-0.5">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Quantity Steppers & Bulk Adjustment Trigger */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                    
                    {/* Stepper Controls in Frosted Pill */}
                    <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                      
                      {/* Decrement Button */}
                      <button
                        onClick={() => onDecrement(product.id)}
                        disabled={product.quantity <= 0}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          product.quantity <= 0
                            ? 'bg-transparent text-slate-600 cursor-not-allowed'
                            : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white active:scale-90 border border-white/[0.06]'
                        }`}
                        title="Decrement Quantity (-1)"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      {/* Prominent Quantity Display */}
                      <div className="min-w-[50px] text-center px-1">
                        <div className={`text-lg font-black font-mono tabular-nums leading-none ${
                          isLowStock ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'text-amber-400'
                        }`}>
                          {product.quantity}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-sans font-medium mt-0.5">
                          {product.unit || 'units'}
                        </div>
                      </div>

                      {/* Increment Button */}
                      <button
                        onClick={() => onIncrement(product.id)}
                        className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-amber-400 hover:text-amber-300 flex items-center justify-center transition-all active:scale-90 cursor-pointer border border-white/[0.06]"
                        title="Increment Quantity (+1)"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                    </div>

                    {/* Bulk Adjustment Field / Action Trigger (Glass Button) */}
                    <button
                      onClick={() => onOpenBulkAdjust(product)}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-orange-600/25 to-amber-600/25 hover:from-orange-600/40 hover:to-amber-600/40 text-orange-300 border border-orange-500/40 backdrop-blur-md transition-all shadow-[0_4px_15px_rgba(234,88,12,0.15)] active:scale-95 cursor-pointer"
                      title="Adjust bulk quantity, restock or audit"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
                      <span>Bulk Adjust</span>
                    </button>

                    {/* Secondary Edit & Delete icons */}
                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-2 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Edit product info"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-2 rounded-xl hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

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
