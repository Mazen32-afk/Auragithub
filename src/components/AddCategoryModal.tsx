import React, { useState } from 'react';
import { X, FolderPlus, Tag, Check, Sparkles } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  existingCategories: string[];
  onClose: () => void;
  onAddCategory: (categoryName: string) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  existingCategories,
  onClose,
  onAddCategory,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setError('Category name cannot be empty.');
      return;
    }

    if (existingCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError(`Category "${trimmed}" already exists.`);
      return;
    }

    onAddCategory(trimmed);
    setNewCategoryName('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#0e1320]/85 backdrop-blur-2xl border border-amber-500/35 rounded-[32px] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Add New Category</h3>
              <p className="text-xs text-slate-400">Expand inventory taxonomy</p>
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Category Title *</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Smart Wearables, Robotics, Drone Gear..."
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
            />
            {error && (
              <p className="text-[11px] text-rose-400 font-semibold pt-0.5">{error}</p>
            )}
          </div>

          {/* Existing Categories preview chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400">
              Current Categories ({existingCategories.length}):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto no-scrollbar">
              {existingCategories.map((cat) => (
                <span
                  key={cat}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-slate-300"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black transition-all shadow-[0_4px_25px_rgba(245,158,11,0.35)] active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
