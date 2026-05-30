import React, { useEffect, useMemo, useState } from 'react';
import { Wallet, RefreshCcw, Calendar, Trash2, Plus, PieChart, Filter, Clock3, CalendarDays, CalendarRange } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { CostEntry } from '@/src/types';
import { cn, formatCurrency } from '@/src/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORIES = ['Food', 'Health', 'Transport', 'Utilities', 'Vitamins', 'Other'] as const;
const RANGE_OPTIONS = ['all', 'day', 'week', 'month', 'year', 'custom'] as const;

type RangeOption = typeof RANGE_OPTIONS[number];

const toDateKey = (value: string | number | Date) => {
  const date = new Date(value);
  return date.toISOString().split('T')[0];
};

const getWeekStart = (date: Date) => {
  const clone = new Date(date);
  const day = clone.getDay();
  const diff = clone.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(clone.setDate(diff));
};

export default function Costs() {
  const [entries, setEntries] = useLocalStorage<CostEntry[]>('cost-entries', []);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Food');
  const [categoryFilter, setCategoryFilter] = useState<'All' | (typeof CATEGORIES)[number]>('All');
  const [rangeMode, setRangeMode] = useState<RangeOption>('month');
  const [anchorDate, setAnchorDate] = useState(toDateKey(new Date()));
  const [customStart, setCustomStart] = useState(toDateKey(new Date()));
  const [customEnd, setCustomEnd] = useState(toDateKey(new Date()));
  const [includeCooking, setIncludeCooking] = useState(true);
  const [includeManual, setIncludeManual] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const normalizedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const newEntry: CostEntry = {
      id: crypto.randomUUID(),
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
      source: 'manual',
    };

    setEntries([newEntry, ...entries]);
    setTitle('');
    setAmount('');
    setStatusMessage('Manual cost entry added');
  };

  const baseFilteredEntries = useMemo(() => {
    const anchor = new Date(anchorDate);
    const startOfDay = new Date(anchor);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(anchor);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = getWeekStart(anchor);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const endOfMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);

    const startOfYear = new Date(anchor.getFullYear(), 0, 1);
    const endOfYear = new Date(anchor.getFullYear(), 11, 31, 23, 59, 59, 999);

    const customStartDate = new Date(customStart);
    customStartDate.setHours(0, 0, 0, 0);
    const customEndDate = new Date(customEnd);
    customEndDate.setHours(23, 59, 59, 999);

    return normalizedEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const sourceAllowed = (includeCooking && entry.source === 'cooking') || (includeManual && (entry.source === 'manual' || !entry.source));
      if (!sourceAllowed) return false;
      if (categoryFilter !== 'All' && entry.category !== categoryFilter) return false;

      switch (rangeMode) {
        case 'day':
          return entryDate >= startOfDay && entryDate <= endOfDay;
        case 'week':
          return entryDate >= startOfWeek && entryDate <= endOfWeek;
        case 'month':
          return entryDate >= startOfMonth && entryDate <= endOfMonth;
        case 'year':
          return entryDate >= startOfYear && entryDate <= endOfYear;
        case 'custom':
          return entryDate >= customStartDate && entryDate <= customEndDate;
        case 'all':
        default:
          return true;
      }
    });
  }, [anchorDate, customEnd, customStart, includeCooking, includeManual, normalizedEntries, rangeMode]);

  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();
    baseFilteredEntries.forEach((entry) => {
      const key = toDateKey(entry.date);
      grouped.set(key, (grouped.get(key) || 0) + entry.amount);
    });

    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total }));
  }, [baseFilteredEntries]);

  const selectedTotal = useMemo(() => baseFilteredEntries.reduce((sum, entry) => sum + entry.amount, 0), [baseFilteredEntries]);
  const todayTotal = useMemo(() => {
    const today = toDateKey(new Date());
    return normalizedEntries.filter((entry) => toDateKey(entry.date) === today).reduce((sum, entry) => sum + entry.amount, 0);
  }, [normalizedEntries]);
  const weekTotal = useMemo(() => {
    const anchor = new Date(anchorDate);
    const start = getWeekStart(anchor);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return normalizedEntries.filter((entry) => {
      const d = new Date(entry.date);
      return d >= start && d <= end;
    }).reduce((sum, entry) => sum + entry.amount, 0);
  }, [anchorDate, normalizedEntries]);
  const monthTotal = useMemo(() => {
    const anchor = new Date(anchorDate);
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);
    return normalizedEntries.filter((entry) => {
      const d = new Date(entry.date);
      return d >= start && d <= end;
    }).reduce((sum, entry) => sum + entry.amount, 0);
  }, [anchorDate, normalizedEntries]);
  const yearTotal = useMemo(() => {
    const anchor = new Date(anchorDate);
    const start = new Date(anchor.getFullYear(), 0, 1);
    const end = new Date(anchor.getFullYear(), 11, 31, 23, 59, 59, 999);
    return normalizedEntries.filter((entry) => {
      const d = new Date(entry.date);
      return d >= start && d <= end;
    }).reduce((sum, entry) => sum + entry.amount, 0);
  }, [anchorDate, normalizedEntries]);

  const selectedLabel = useMemo(() => {
    const anchor = new Date(anchorDate);
    switch (rangeMode) {
      case 'day':
        return anchor.toLocaleDateString();
      case 'week':
        return `Week of ${getWeekStart(anchor).toLocaleDateString()}`;
      case 'month':
        return anchor.toLocaleString(undefined, { month: 'long', year: 'numeric' });
      case 'year':
        return anchor.getFullYear().toString();
      case 'custom':
        return `${customStart} → ${customEnd}`;
      default:
        return 'All time';
    }
  }, [anchorDate, customEnd, customStart, rangeMode]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(''), 2500);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const resetToCurrent = () => {
    const today = toDateKey(new Date());
    setAnchorDate(today);
    setCustomStart(today);
    setCustomEnd(today);
    setRangeMode('month');
    setStatusMessage('Selected current month');
  };

  const refreshData = () => {
    setStatusMessage('Costs refreshed');
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {statusMessage && (
        <div className="p-3 rounded-2xl flex items-center gap-2 text-sm font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
          <PieChart size={16} />
          {statusMessage}
        </div>
      )}

      <section className="glass-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-teal-400/20 flex items-center justify-center text-teal-400">
            <Wallet size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black">Costs Dashboard</h2>
            <p className="text-sm text-white/55">Cooking entries sync here automatically. Add manual costs too.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {RANGE_OPTIONS.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setRangeMode(range)}
              className={cn(
                'py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all',
                rangeMode === range ? 'bg-teal-500 text-teal-950' : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              {range}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">Anchor Date</label>
            <input type="date" className="glass-input w-full" value={anchorDate} onChange={(e) => setAnchorDate(e.target.value)} />
          </div>
          <div className="relative">
            <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">Category Filter</label>
              <select className="glass-input w-full" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as 'All' | (typeof CATEGORIES)[number])}>
                <option>All</option>
              {CATEGORIES.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {rangeMode === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">From</label>
              <input type="date" className="glass-input w-full" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            </div>
            <div className="relative">
              <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">To</label>
              <input type="date" className="glass-input w-full" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button type="button" onClick={resetToCurrent} className="flex-1 py-2 bg-rose-400/20 text-rose-400 rounded-xl text-xs font-bold border border-rose-400/40 flex items-center justify-center gap-2">
            <Calendar size={14} /> Use Current
          </button>
          <button type="button" onClick={refreshData} className="flex-1 py-2 bg-teal-500/20 text-teal-400 rounded-xl text-xs font-bold border border-teal-500/40 flex items-center justify-center gap-2">
            <RefreshCcw size={14} /> Refresh Data
          </button>
        </div>

        <div className="space-y-4 px-2">
          <button type="button" onClick={() => setIncludeCooking((value) => !value)} className="flex items-center justify-between w-full">
            <span className="text-sm font-medium">Include Cooking Inventory Data</span>
            <div className={cn('w-12 h-6 rounded-full relative p-1 transition-all', includeCooking ? 'bg-teal-500' : 'bg-white/20')}>
              <div className={cn('w-4 h-4 bg-white rounded-full transition-all', includeCooking ? 'ml-auto' : 'ml-0')} />
            </div>
          </button>
          <button type="button" onClick={() => setIncludeManual((value) => !value)} className="flex items-center justify-between w-full">
            <span className="text-sm font-medium">Include Manual Cost Entries</span>
            <div className={cn('w-12 h-6 rounded-full relative p-1 transition-all', includeManual ? 'bg-teal-500' : 'bg-white/20')}>
              <div className={cn('w-4 h-4 bg-white rounded-full transition-all', includeManual ? 'ml-auto' : 'ml-0')} />
            </div>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-transparent border border-cyan-400/10">
          <p className="text-xs text-white/60 uppercase font-bold">Selected Range</p>
          <p className="text-xl font-black text-teal-300 mt-1">{formatCurrency(selectedTotal)}</p>
          <p className="text-[11px] text-white/40 mt-1">{selectedLabel}</p>
        </div>
        <div className="glass-card p-4 bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-transparent border border-teal-400/10">
          <p className="text-xs text-white/60 uppercase font-bold">Today</p>
          <p className="text-xl font-black text-teal-300 mt-1">{formatCurrency(todayTotal)}</p>
          <p className="text-[11px] text-white/40 mt-1">Auto + manual</p>
        </div>
        <div className="glass-card p-4 bg-gradient-to-br from-emerald-500/10 via-lime-500/10 to-transparent border border-emerald-400/10">
          <p className="text-xs text-white/60 uppercase font-bold">This Week</p>
          <p className="text-xl font-black text-teal-300 mt-1">{formatCurrency(weekTotal)}</p>
        </div>
        <div className="glass-card p-4 bg-gradient-to-br from-rose-500/10 via-orange-500/10 to-transparent border border-rose-400/10">
          <p className="text-xs text-white/60 uppercase font-bold">This Month</p>
          <p className="text-xl font-black text-teal-300 mt-1">{formatCurrency(monthTotal)}</p>
          <p className="text-[11px] text-white/40 mt-1">Year: {formatCurrency(yearTotal)}</p>
        </div>
      </section>

      <section className="glass-card bg-gradient-to-br from-teal-500/12 via-cyan-500/10 to-emerald-500/12 border border-teal-400/15">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-teal-400 text-xs font-bold uppercase tracking-wider">Daily Breakdown</h3>
          <span className="text-[11px] text-white/45">{baseFilteredEntries.length} entries</span>
        </div>
        <div className="h-56">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#052525', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff' }} />
                <Area type="monotone" dataKey="total" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.18} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-white/45 italic">No daily entries for the selected range.</div>
          )}
        </div>
      </section>

      <section className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Plus size={18} className="text-teal-400" />
          <h2 className="text-xl font-bold">Add New Cost</h2>
        </div>
        <form onSubmit={addEntry} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Title (example: Vitamins)"
            className="glass-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            className="glass-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="relative">
            <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold text-teal-400 bg-[#001a1a] rounded">Category</label>
            <select
              className="glass-input w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
            >
              {CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
            </select>
          </div>
          <button type="button" className="glass-input flex items-center justify-between text-white/40 text-sm">
            <span>Date: Today</span>
            <Calendar size={16} />
          </button>
          <button type="submit" className="btn-primary w-full bg-rose-400 hover:bg-rose-300">Add Cost Entry</button>
        </form>
      </section>

      <section className="pb-12 px-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Entries ({baseFilteredEntries.length})</h2>
          <span className="text-xs text-white/45">Cooking entries sync automatically</span>
        </div>

        {baseFilteredEntries.length === 0 ? (
          <div className="glass-card bg-white/5 text-center py-8 text-sm opacity-50 italic">No entries for selected range.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {baseFilteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 flex items-start justify-between gap-3 bg-white/6 border border-white/8 hover:border-teal-400/20 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold truncate">{entry.title}</h3>
                    {entry.source === 'cooking' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 uppercase">Cooking</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 uppercase">Manual</span>
                    )}
                  </div>
                  <p className="text-xs text-white/55">{entry.category} • {new Date(entry.date).toLocaleString()}</p>
                  {entry.note && <p className="text-[11px] text-white/40 mt-1">{entry.note}</p>}
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  <p className="font-black text-teal-300">{formatCurrency(entry.amount)}</p>
                  <button onClick={() => deleteEntry(entry.id)} className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
