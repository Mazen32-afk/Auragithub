import React, { useState } from 'react';
import { Product } from '../types';
import { PRODUCT_CATEGORIES } from '../data/initialData';
import { X, Sparkles, PackagePlus, Edit3, Barcode } from 'lucide-react';

interface ProductFormModalProps {
  initialProduct?: Product | null;
  currencySymbol: string;
  categoriesList?: string[];
  onOpenAddCategory?: () => void;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'updatedAt'> & { id?: string }) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialProduct,
  currencySymbol,
  categoriesList = PRODUCT_CATEGORIES,
  onOpenAddCategory,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(initialProduct);

  const [name, setName] = useState(initialProduct?.name || '');
  const [barcode, setBarcode] = useState(initialProduct?.barcode || '');
  const [category, setCategory] = useState(initialProduct?.category || categoriesList[0] || 'General');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [price, setPrice] = useState(initialProduct?.price?.toString() || '99.00');
  const [quantity, setQuantity] = useState(initialProduct?.quantity?.toString() || '10');
  const [unit, setUnit] = useState(initialProduct?.unit || 'units');
  const [description, setDescription] = useState(initialProduct?.description || '');

  const generateRandomBarcode = () => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    setBarcode(`890123${randomSuffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    const parsedQty = parseInt(quantity, 10);

    if (isNaN(parsedPrice) || parsedPrice < 0) return;
    if (isNaN(parsedQty) || parsedQty < 0) return;

    const finalCategory = isCustomCategory ? customCategoryName.trim() || 'General' : category.trim();

    onSave({
      id: initialProduct?.id,
      name: name.trim(),
      barcode: barcode.trim(),
      category: finalCategory,
      price: parsedPrice,
      quantity: parsedQty,
      unit: unit.trim() || 'units',
      minThreshold: 5,
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#0e1320]/80 backdrop-blur-2xl border border-amber-500/30 rounded-[32px] p-6 md:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.85)] text-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <PackagePlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isEditing ? 'Edit Product Details' : 'Add New Inventory Product'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Update price, barcode, or metadata' : 'Register a new SKU with price and quantity'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Masterwork Chronograph"
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          {/* Barcode & Generate Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Barcode / SKU Code *
              </label>
              <button
                type="button"
                onClick={generateRandomBarcode}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-generate</span>
              </button>
            </div>
            <div className="relative">
              <Barcode className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 890123456789"
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  {isCustomCategory ? 'Select List' : '+ Custom'}
                </button>
              </div>

              {isCustomCategory ? (
                <input
                  type="text"
                  required
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="New Category Name"
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#0f1422]">
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Measurement Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="units, pcs, boxes..."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Price & Quantity Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Unit Price ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400"
              />
              {parseInt(quantity, 10) < 5 && (
                <p className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                  <span>⚠️ Under 5 units will be styled RED automatically!</span>
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Product Description / Specifications (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specifications, supplier details, warehouse shelf..."
              className="w-full glass-input rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.06] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black transition-all shadow-[0_4px_25px_rgba(245,158,11,0.35)] active:scale-95 cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Register Product'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
