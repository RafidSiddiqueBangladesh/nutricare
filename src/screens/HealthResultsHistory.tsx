import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, BarChart3, TrendingUp, Calendar, Filter, Download, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';

interface HealthResult {
  id: string;
  type: 'face' | 'pose' | 'hand';
  timestamp: string;
  data: {
    emotion?: string;
    repCount?: number;
    formScore?: number;
    gesture?: string;
    confidence: number;
    exerciseType?: string;
    duration?: number;
  };
}

export default function HealthResultsHistory() {
  const navigate = useNavigate();
  const [results, setResults] = useLocalStorage<HealthResult[]>('health-results', []);
  const [filteredResults, setFilteredResults] = useState<HealthResult[]>(results);
  const [filterType, setFilterType] = useState<'all' | 'face' | 'pose' | 'hand'>('all');
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    let filtered = [...results];

    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }

    if (searchDate) {
      filtered = filtered.filter(r => r.timestamp.startsWith(searchDate));
    }

    setFilteredResults(filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  }, [results, filterType, searchDate]);

  const deleteResult = (id: string) => {
    if (confirm('Delete this result?')) {
      setResults(results.filter(r => r.id !== id));
    }
  };

  const deleteAll = () => {
    if (confirm('Delete all results? This cannot be undone.')) {
      setResults([]);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'face': return '😊';
      case 'pose': return '💪';
      case 'hand': return '✋';
      default: return '📊';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'face': return 'Face Detection';
      case 'pose': return 'Exercise Tracking';
      case 'hand': return 'Hand Gesture';
      default: return 'Unknown';
    }
  };

  const stats = {
    total: results.length,
    face: results.filter(r => r.type === 'face').length,
    pose: results.filter(r => r.type === 'pose').length,
    hand: results.filter(r => r.type === 'hand').length,
  };

  const totalReps = results
    .filter(r => r.type === 'pose')
    .reduce((sum, r) => sum + (r.data.repCount || 0), 0);

  const avgFormScore = results.filter(r => r.type === 'pose').length > 0
    ? Math.round(
        results.filter(r => r.type === 'pose')
          .reduce((sum, r) => sum + (r.data.formScore || 0), 0) /
        results.filter(r => r.type === 'pose').length
      )
    : 0;

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <BarChart3 size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Health Results History</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card !p-4 text-center"
        >
          <p className="text-3xl font-bold text-teal-400 mb-1">{stats.total}</p>
          <p className="text-xs text-white/60 uppercase font-bold">Total Results</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card !p-4 text-center"
        >
          <p className="text-3xl font-bold text-purple-400 mb-1">{totalReps}</p>
          <p className="text-xs text-white/60 uppercase font-bold">Total Reps</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card !p-4 text-center"
        >
          <p className="text-3xl font-bold text-blue-400 mb-1">{avgFormScore}%</p>
          <p className="text-xs text-white/60 uppercase font-bold">Avg Form</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card !p-4 text-center"
        >
          <p className="text-3xl font-bold text-green-400 mb-1">{stats.pose}</p>
          <p className="text-xs text-white/60 uppercase font-bold">Workouts</p>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <section className="glass-card !p-4">
        <h3 className="text-sm font-bold text-white/60 uppercase mb-3 flex items-center gap-2">
          <TrendingUp size={14} />
          By Category
        </h3>
        <div className="space-y-2">
          {[
            { type: 'pose', label: 'Exercise Tracking', count: stats.pose, color: 'from-teal-600 to-teal-400' },
            { type: 'face', label: 'Face Detection', count: stats.face, color: 'from-blue-600 to-blue-400' },
            { type: 'hand', label: 'Hand Gesture', count: stats.hand, color: 'from-purple-600 to-purple-400' },
          ].map(cat => (
            <div key={cat.type} className="flex items-center gap-3">
              <div className={cn(
                'flex-1 h-2 bg-gradient-to-r rounded-full',
                cat.color
              )} style={{ width: `${stats.total > 0 ? (cat.count / stats.total) * 100 : 0}%` }} />
              <span className="text-xs text-white/60 min-w-[100px]">{cat.label}: {cat.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="glass-card !p-4">
        <h3 className="text-sm font-bold text-white/60 uppercase mb-3 flex items-center gap-2">
          <Filter size={14} />
          Filters
        </h3>
        <div className="space-y-3">
          {/* Type Filter */}
          <div>
            <p className="text-xs text-white/60 mb-2">Type</p>
            <div className="flex gap-2">
              {(['all', 'pose', 'face', 'hand'] as const).map(type => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold transition-all',
                    filterType === type
                      ? 'bg-teal-500 text-teal-950'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  )}
                >
                  {type === 'all' ? 'All' : getTypeLabel(type).split(' ')[0]}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <p className="text-xs text-white/60 mb-2">Date</p>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </section>

      {/* Results List */}
      <section className="glass-card !p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Results ({filteredResults.length})</h3>
          {filteredResults.length > 0 && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={exportData}
                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-all"
                title="Export"
              >
                <Download size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={deleteAll}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-all"
                title="Delete All"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          )}
        </div>

        {filteredResults.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 size={48} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/40">No results found</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredResults.map((result, i) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getTypeIcon(result.type)}</span>
                      <p className="font-bold text-sm">{getTypeLabel(result.type)}</p>
                      {result.data.exerciseType && (
                        <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded">
                          {result.data.exerciseType}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    {result.type === 'pose' && (
                      <>
                        <p className="text-sm font-bold text-teal-400">{result.data.repCount} reps</p>
                        <p className="text-xs text-white/60">Form: {result.data.formScore}%</p>
                      </>
                    )}
                    {result.type === 'face' && (
                      <p className="text-sm font-bold text-blue-400 capitalize">{result.data.emotion}</p>
                    )}
                    {result.type === 'hand' && (
                      <p className="text-sm font-bold text-purple-400 capitalize">{result.data.gesture}</p>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteResult(result.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-all"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Stats Summary */}
      {filteredResults.length > 0 && (
        <section className="glass-card !p-4">
          <h3 className="text-sm font-bold text-white/60 uppercase mb-3">Summary</h3>
          <div className="space-y-2 text-sm">
            {filteredResults.some(r => r.type === 'pose') && (
              <div className="flex justify-between">
                <span className="text-white/60">Total Exercise Time:</span>
                <span className="font-bold text-teal-400">
                  {Math.round(
                    filteredResults
                      .filter(r => r.type === 'pose')
                      .reduce((sum, r) => sum + (r.data.duration || 0), 0) / 60
                  )} min
                </span>
              </div>
            )}
            {filteredResults.some(r => r.type === 'face') && (
              <div className="flex justify-between">
                <span className="text-white/60">Face Detections:</span>
                <span className="font-bold text-blue-400">{filteredResults.filter(r => r.type === 'face').length}</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
