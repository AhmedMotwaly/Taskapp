import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VariantOption {
  value: string;
  available: boolean;
  type?: string;
}

interface VariantGroup {
  name: string;
  options: VariantOption[];
}

interface VariantSelectorProps {
  variants: VariantGroup[];
  productTitle: string;
  productImage: string;
  onConfirm: (selected: Record<string, string>) => void;
  onCancel: () => void;
}

export function VariantSelector({ 
  variants, 
  productTitle, 
  productImage, 
  onConfirm, 
  onCancel 
}: VariantSelectorProps) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const handleSelect = (groupName: string, value: string) => {
    setSelected(prev => ({
      ...prev,
      [groupName]: value
    }));
    setError('');
  };

  const handleConfirm = () => {
    // Check if all groups have a selection
    const missing = variants.some(v => !selected[v.name]);
    if (missing) {
      setError('Please select an option for all categories');
      return;
    }
    onConfirm(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-cyan-900/20">
        
        {/* Header Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-600" />

        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {/* Product Header */}
          <div className="flex gap-4 mb-6">
            <div className="w-20 h-20 shrink-0 bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden border border-white/10">
              <img 
                src={productImage} 
                alt="Product" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight">
                {productTitle}
              </h3>
              <p className="text-sm text-cyan-400 mt-1 font-medium">Select your preferences</p>
            </div>
          </div>

          {/* Variants Grid */}
          <div className="space-y-6">
            {variants.map((group) => (
              <div key={group.name}>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  {group.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* FIX START: Added index 'i' to the map function */}
                  {group.options.map((opt, i) => {
                    const isSelected = selected[group.name] === opt.value;
                    const isAvailable = opt.available;

                    return (
                      <button
                        // FIX END: Used index to create a guaranteed unique key
                        key={`${opt.value}-${i}`}
                        onClick={() => handleSelect(group.name, opt.value)}
                        disabled={!isAvailable}
                        className={`
                          relative px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200
                          ${isSelected 
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                            : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/10'
                          }
                          ${!isAvailable && 'opacity-40 cursor-not-allowed decoration-slice line-through'}
                        `}
                      >
                        {opt.value}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full border-2 border-black" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 mt-6 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20 h-12"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold border-none shadow-[0_0_20px_rgba(6,182,212,0.3)] h-12"
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}