import React, { useState } from 'react';
import { Wallet, Filter, RefreshCcw, Calendar, Plus, Trash2, PieChart } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { CostEntry } from '@/src/types';
import { cn, formatCurrency } from '@/src/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORIES = ['Food', 'Health', 'Transport', 'Utilities', 'Vitamins', 'Other'];

export default function Costs() {
  const [entries, setEntries] = useLocalStorage<CostEntry[]>('cost-entries', []);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const monthTotal = entries.reduce((sum, e) => sum + e.amount, 0);

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const newEntry: CostEntry = {
      id: crypto.randomUUID(),
      title,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
    };

    setEntries([newEntry, ...entries]);
    setTitle('');
    setAmount('');
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="glass-card">
        <h2 className="text-2xl font-black mb-6">Analyze Costs</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">Month</label>
            <select className="glass-input w-full">
              <option>May</option>
            </select>
          </div>
          <div className="relative">
            <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">Year</label>
            <select className="glass-input w-full">
              <option>2026</option>
            </select>
          </div>
        </div>
        
        <p className="text-xs text-white/60 mb-4 px-2">Selected: May 2026</p>
        
        <div className="flex gap-2 mb-6">
          <button className="flex-1 py-2 bg-rose-400/20 text-rose-400 rounded-xl text-xs font-bold border border-rose-400/40 flex items-center justify-center gap-2">
            <Calendar size={14} /> Use Current
          </button>
          <button className="flex-1 py-2 bg-teal-500/20 text-teal-400 rounded-xl text-xs font-bold border border-teal-500/40 flex items-center justify-center gap-2">
            <RefreshCcw size={14} /> Refresh Data
          </button>
        </div>

        <div className="relative mb-6">
          <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">Category Filter</label>
          <select className="glass-input w-full">
            <option>All</option>
          </select>
        </div>

        <div className="space-y-4 px-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Include Cooking Inventory Data</span>
            <div className="w-12 h-6 bg-rose-400 rounded-full relative p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full ml-auto" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Include Manual Cost Entries</span>
            <div className="w-12 h-6 bg-rose-400 rounded-full relative p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full ml-auto" />
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card bg-teal-500/10">
        <h3 className="text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">Calculated Totals</h3>
        <h2 className="text-3xl font-black mb-4">Month Total: {monthTotal.toFixed(2)}</h2>
        <div className="grid grid-cols-2 gap-y-2 text-xs opacity-70">
          <span>Year Total: 1962.00</span>
          <span>This Week: 0.00</span>
          <span>Today: 0.00</span>
        </div>
      </section>

      <section className="glass-card">
        <h2 className="text-xl font-bold mb-4">Add New Cost</h2>
        <form onSubmit={addEntry} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Title (example: Vitamins)" 
            className="glass-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Amount" 
            className="glass-input"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <div className="relative">
            <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">Category</label>
            <select 
              className="glass-input w-full"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="glass-input flex items-center justify-between text-white/40 text-sm">
            <span>Date: 14/5/2026</span>
            <Calendar size={16} />
          </button>
          <button type="submit" className="btn-primary w-full bg-rose-400 hover:bg-rose-300">Add Cost Entry</button>
        </form>
      </section>

      <section className="pb-12 px-2">
        <h2 className="text-xl font-bold mb-4">Daily Breakdown (May 2026)</h2>
        <div className="glass-card !bg-white/5 text-center py-8 text-sm opacity-50 italic">
          No daily entries for selected month.
        </div>
      </section>
    </div>
  );
}
