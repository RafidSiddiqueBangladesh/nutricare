import React from 'react';
import { Dumbbell, Play, CheckCircle, Timer, Camera, Video, Activity, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { ExerciseLog } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

const EXERCISES = [
  {
    id: 'push-ups',
    title: 'Push-ups',
    duration: '5 min',
    videoUrl: 'https://www.youtube.com/embed/iodm_iO6dM8',
    thumbnail: 'https://img.youtube.com/vi/iodm_iO6dM8/0.jpg'
  },
  {
    id: 'squats',
    title: 'Squats',
    duration: '5 min',
    videoUrl: 'https://www.youtube.com/embed/QKKZ9AGYTi4',
    thumbnail: 'https://img.youtube.com/vi/QKKZ9AGYTi4/0.jpg'
  },
  {
    id: 'jumping-jacks',
    title: 'Jumping Jacks',
    duration: '5 min',
    videoUrl: 'https://www.youtube.com/embed/1bMSNyunq74',
    thumbnail: 'https://img.youtube.com/vi/1bMSNyunq74/0.jpg'
  }
];

export default function Exercise() {
  const navigate = useNavigate();
  const [logs] = useLocalStorage<ExerciseLog[]>('exercise-logs', []);

  return (
    <div className="flex flex-col gap-6">
      {/* Module Header */}
      <div className="flex justify-center">
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
          <Activity size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Exercise Module</span>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {EXERCISES.map((ex, i) => (
          <motion.div 
            key={ex.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card !p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="text-teal-400" size={18} />
              <div>
                <h3 className="font-bold leading-tight">{ex.title}</h3>
                <p className="text-[10px] text-white/40">Duration: {ex.duration}</p>
              </div>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 group ring-1 ring-white/10">
              <img src={ex.thumbnail} alt={ex.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all">
                  <Play size={32} fill="currentColor" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] text-white font-bold bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                <span>Watch on YouTube</span>
                <Play size={12} fill="currentColor" />
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/exercises/coach/${ex.id}`)}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Video size={14} />
                Start Coach
              </button>
              <button className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 text-teal-950 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20">
                <CheckCircle size={14} />
                Mark Done
              </button>
            </div>
          </motion.div>
        ))}

        {/* Live Exercise Editor Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: EXERCISES.length * 0.1 }}
          onClick={() => navigate('/exercises/live-editor')}
          className="glass-card !p-4 border-2 border-teal-500/50 hover:border-teal-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚡</div>
              <div className="text-left">
                <h3 className="font-bold text-teal-400">Live Exercise Editor</h3>
                <p className="text-[10px] text-white/60">Track any exercise with real-time rep counter</p>
              </div>
            </div>
            <Zap className="text-teal-400" size={24} />
          </div>
        </motion.button>
      </div>
    </div>
  );
}
