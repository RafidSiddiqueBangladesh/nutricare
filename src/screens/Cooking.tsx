import React, { useState } from 'react';
import { ChefHat, Package, Tag, Calendar, List, Utensils, Trash2, Mic, Camera, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { InventoryItem } from '@/src/types';
import { cn, formatCurrency, formatDate } from '@/src/lib/utils';

export default function Cooking() {
  const [items, setItems] = useLocalStorage<InventoryItem[]>('inventory-items', []);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      name,
      price: parseFloat(price) || 0,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amountOption: 'Default',
      addedAt: Date.now(),
    };

    setItems([newItem, ...items]);
    setName('');
    setPrice('');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
          <ChefHat size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Cooking Assistant</span>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        </div>
      </div>

      <h1 className="text-2xl font-black px-2">What's in your kitchen?</h1>

      <section className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="text-teal-400" size={20} />
          <h2 className="text-xl font-bold">Inventory Entry</h2>
        </div>
        <form onSubmit={addItem} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Enter ingredient..."
                className="glass-input w-full"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Mic size={16} className="text-white/40" />
                <Camera size={16} className="text-white/40" />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-rose-400 text-rose-950 font-bold rounded-xl text-sm">Add</button>
          </div>
          
          <input 
            type="number" 
            placeholder="Price"
            className="glass-input"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
          
          <select className="glass-input">
            <option>Default</option>
            <option>Kg</option>
            <option>Piece</option>
          </select>

          <div className="glass-input flex items-center justify-between text-white/40 text-sm">
            <span>Tap to set (auto: default by type)</span>
            <Calendar size={16} />
          </div>

          <p className="text-[10px] text-teal-400/60 italic text-center leading-tight">
            Tip: Set expiry date or use auto-defaults (Meat/Fish: 3mo, Veg: 1mo).
          </p>

          <button type="button" className="w-full py-3 bg-rose-400/20 text-rose-400 rounded-full font-bold text-sm border border-rose-400/30">
            Get Cooking Ideas
          </button>
        </form>
      </section>

      <section className="glass-card flex items-center gap-4 bg-teal-500/10">
        <div className="w-12 h-12 rounded-2xl bg-teal-400/20 flex items-center justify-center text-teal-400">
          <ChefHat size={28} />
        </div>
        <div>
          <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">Inventory Summary</p>
          <h3 className="text-2xl font-black">{items.length} item(s) in kitchen</h3>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 px-2">Smart Suggestions</h2>
        <div className="glass-card flex items-start gap-4">
          <div className="bg-yellow-400/20 p-2 rounded-xl text-yellow-400">
            <Lightbulb size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold mb-1">Tip:</p>
            <p className="text-sm text-white/70">
              {items.length > 0 ? "Cook rice with vegetables. Utilize leftovers for farming compost." : "Add inventory items to get smart cooking suggestions."}
            </p>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <h2 className="text-xl font-bold mb-4 px-2">Saved Inventory</h2>
        <div className="flex flex-col gap-2">
          {items.map(item => (
            <div key={item.id} className="glass-card !p-4 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="bg-white/5 p-2 rounded-xl text-white/40">
                  <Utensils size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-base leading-tight">{item.name}</h4>
                  <p className="text-xs text-white/60">1 unit • Price: {item.price}</p>
                  <p className="text-[10px] text-teal-400 mt-1">Expires: {formatDate(new Date(item.expiryDate))} (default)</p>
                </div>
              </div>
              <button 
                onClick={() => setItems(items.filter(i => i.id !== item.id))}
                className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
