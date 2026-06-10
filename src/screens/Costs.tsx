import React, { useState, useMemo } from 'react';
import { Wallet, RefreshCcw, Calendar, Plus, Trash2, ChefHat, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { CostEntry } from '@/src/types';
import { InventoryItem } from '@/src/types';
import { cn, formatCurrency } from '@/src/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORIES = ['Food', 'Health', 'Transport', 'Utilities', 'Vitamins', 'Other'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Costs() {
  const [entries, setEntries] = useLocalStorage<CostEntry[]>('cost-entries', []);
  const [inventoryItems] = useLocalStorage<InventoryItem[]>('inventory-items', []);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [entryDate, setEntryDate] = useState(now.toISOString().split('T')[0]);
  const [includeInventory, setIncludeInventory] = useState(true);

  // Year options: current year ± 2
  const yearOptions = [selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1];

  // Manual entries filtered to selected month/year
  const filteredEntries = useMemo(() =>
    entries.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }),
    [entries, selectedMonth, selectedYear]
  );

  // Inventory items added this month
  const inventoryThisMonth = useMemo(() =>
    includeInventory
      ? inventoryItems.filter(item => {
          const d = new Date(item.addedAt);
          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        })
      : [],
    [inventoryItems, selectedMonth, selectedYear, includeInventory]
  );

  const inventoryTotal = inventoryThisMonth.reduce((sum, i) => sum + (i.price || 0), 0);
  const manualTotal    = filteredEntries.reduce((sum, e) => sum + e.amount, 0);
  const monthTotal     = manualTotal + inventoryTotal;

  // Year total (all entries in this year)
  const yearTotal = useMemo(() =>
    entries
      .filter(e => new Date(e.date).getFullYear() === selectedYear)
      .reduce((sum, e) => sum + e.amount, 0) +
    (includeInventory
      ? inventoryItems
          .filter(i => new Date(i.addedAt).getFullYear() === selectedYear)
          .reduce((sum, i) => sum + (i.price || 0), 0)
      : 0),
    [entries, inventoryItems, selectedYear, includeInventory]
  );

  // This week's total
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekTotal = entries
    .filter(e => new Date(e.date) >= weekStart)
    .reduce((sum, e) => sum + e.amount, 0);

  // Today's total
  const todayStr = now.toISOString().split('T')[0];
  const todayTotal = entries
    .filter(e => e.date.startsWith(todayStr))
    .reduce((sum, e) => sum + e.amount, 0);

  // Chart data: daily breakdown for selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const chartData = Array.from({ length: daysInMonth }, (_, dayIdx) => {
    const day = dayIdx + 1;
    const dayEntries = filteredEntries.filter(e => new Date(e.date).getDate() === day);
    const dayInventory = includeInventory
      ? inventoryThisMonth.filter(i => new Date(i.addedAt).getDate() === day)
      : [];
    return {
      day: `${day}`,
      manual: dayEntries.reduce((s, e) => s + e.amount, 0),
      inventory: dayInventory.reduce((s, i) => s + (i.price || 0), 0),
    };
  });

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const newEntry: CostEntry = {
      id: crypto.randomUUID(),
      title,
      amount: parseFloat(amount),
      category,
      date: entryDate || now.toISOString(),
    };

    setEntries([newEntry, ...entries]);
    setTitle('');
    setAmount('');
  };

  const useCurrentMonth = () => {
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex justify-center">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-rose-400">
          <Wallet size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Cost Tracker</span>
          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
        </div>
      </div>

      {/* Month / Year Selector */}
      <section className="glass-card">
        <h2 className="text-2xl font-black mb-5">Analyze Costs</h2>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="relative">
            <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">Month</label>
            <select
              className="glass-input w-full"
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">Year</label>
            <select
              className="glass-input w-full"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-white/60 mb-4 px-1">
          Showing: <span className="text-teal-300 font-bold">{MONTHS[selectedMonth]} {selectedYear}</span>
        </p>

        <div className="flex gap-2 mb-5">
          <button
            onClick={useCurrentMonth}
            className="flex-1 py-2 bg-rose-400/20 text-rose-400 rounded-xl text-xs font-bold border border-rose-400/40 flex items-center justify-center gap-2"
          >
            <Calendar size={14} /> Use Current Month
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-2 bg-teal-500/20 text-teal-400 rounded-xl text-xs font-bold border border-teal-500/40 flex items-center justify-center gap-2"
          >
            <RefreshCcw size={14} /> Refresh Data
          </button>
        </div>

        {/* Category Filter */}
        <div className="relative mb-5">
          <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">Category Filter</label>
          <select className="glass-input w-full">
            <option>All</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Include Cooking Inventory Data</span>
            <button
              onClick={() => setIncludeInventory(v => !v)}
              className={`w-12 h-6 rounded-full relative transition-all ${includeInventory ? 'bg-rose-400' : 'bg-white/20'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${includeInventory ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Totals */}
      <section className="glass-card bg-teal-500/10">
        <h3 className="text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">Calculated Totals</h3>
        <h2 className="text-3xl font-black mb-1">Month Total: {formatCurrency(monthTotal)}</h2>
        <p className="text-xs text-white/50 mb-4">
          Manual: {formatCurrency(manualTotal)} + Inventory: {formatCurrency(inventoryTotal)}
        </p>
        <div className="grid grid-cols-3 gap-y-2 text-xs opacity-70">
          <span>Year Total: {formatCurrency(yearTotal)}</span>
          <span>This Week: {formatCurrency(weekTotal)}</span>
          <span>Today: {formatCurrency(todayTotal)}</span>
        </div>
      </section>

      {/* Chart */}
      {(filteredEntries.length > 0 || inventoryThisMonth.length > 0) && (
        <section className="glass-card">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <BarChart3 size={16} className="text-teal-400" />
            Daily Breakdown — {MONTHS[selectedMonth]} {selectedYear}
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="manualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="inventoryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                formatter={(val: any, name: string) => [formatCurrency(val), name === 'manual' ? 'Manual' : 'Inventory']}
              />
              <Area type="monotone" dataKey="manual" stroke="#f43f5e" fill="url(#manualGrad)" strokeWidth={2} dot={false} name="manual" />
              {includeInventory && (
                <Area type="monotone" dataKey="inventory" stroke="#14b8a6" fill="url(#inventoryGrad)" strokeWidth={2} dot={false} name="inventory" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Add New Cost Entry */}
      <section className="glass-card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus size={18} className="text-rose-400" />
          Add New Cost
        </h2>
        <form onSubmit={addEntry} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Title (e.g. Vitamins)"
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
          <div className="relative">
            <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">Date</label>
            <input
              type="date"
              className="glass-input w-full"
              value={entryDate}
              onChange={e => setEntryDate(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full bg-rose-400 hover:bg-rose-300">Add Cost Entry</button>
        </form>
      </section>

      {/* Cooking Inventory List in Costs */}
      {inventoryThisMonth.length > 0 && includeInventory && (
        <section className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ChefHat size={18} className="text-teal-400" />
            Cooking Inventory — {MONTHS[selectedMonth]}
          </h2>
          <div className="flex flex-col gap-2">
            {inventoryThisMonth.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <div>
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-xs text-white/50">{item.amountOption || 'unit'} · Added {new Date(item.addedAt).toLocaleDateString()}</p>
                </div>
                <span className="text-teal-300 font-bold text-sm">{item.price > 0 ? formatCurrency(item.price) : '—'}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-2 text-sm font-bold text-teal-300">
              <span>Inventory Subtotal</span>
              <span>{formatCurrency(inventoryTotal)}</span>
            </div>
          </div>
        </section>
      )}

      {/* Manual Entries */}
      <section className="pb-12">
        <h2 className="text-xl font-bold mb-4 px-2">Manual Entries — {MONTHS[selectedMonth]}</h2>
        {filteredEntries.length === 0 ? (
          <div className="glass-card text-center py-8 text-sm text-white/40 italic">
            No manual entries for {MONTHS[selectedMonth]} {selectedYear}.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="glass-card !p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{entry.title}</p>
                  <p className="text-xs text-white/50">{entry.category} · {new Date(entry.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-rose-300">{formatCurrency(entry.amount)}</span>
                  <button
                    onClick={() => setEntries(entries.filter(e => e.id !== entry.id))}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
