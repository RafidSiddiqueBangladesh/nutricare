import React, { useState, useEffect } from 'react';
import { Dumbbell, Play, CheckCircle, Video, Activity, Zap, Timer } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { ExerciseLog } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/src/contexts/LanguageContext';

const EXERCISES = [
  {
    id: 'push-ups',
    title: 'Push-ups',
    duration: '5 min',
    videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4',
    thumbnail: 'https://img.youtube.com/vi/IODxDxX7oi4/0.jpg'
  },
  {
    id: 'squats',
    title: 'Squats',
    duration: '5 min',
    videoUrl: 'https://www.youtube.com/embed/aclHkVaku9U',
    thumbnail: 'https://img.youtube.com/vi/aclHkVaku9U/0.jpg'
  },
  {
    id: 'jumping-jacks',
    title: 'Jumping Jacks',
    duration: '5 min',
    videoUrl: 'https://www.youtube.com/embed/2W4ZNSwoW_4',
    thumbnail: 'https://img.youtube.com/vi/2W4ZNSwoW_4/0.jpg'
  }
];

export default function Exercise() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [logs, setLogs] = useLocalStorage<any[]>('exercise-logs', []);
  const [healthResults, setHealthResults] = useLocalStorage<any[]>('health-results', []);

  // Timer states
  const [activeTimerExId, setActiveTimerExId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes (600s)
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 600;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const handleMarkDone = (exId: string) => {
    setTimerRunning(false);
    setActiveTimerExId(null);
    setTimeLeft(600);

    const ex = EXERCISES.find(e => e.id === exId);
    if (!ex) return;

    // 1. Save to exercise logs
    const newLog = {
      id: crypto.randomUUID(),
      exerciseId: ex.id,
      name: ex.title,
      duration: '10 min',
      timestamp: Date.now(),
      completed: true
    };
    setLogs([newLog, ...logs]);

    // 2. Save to health snapshot results
    const newResult = {
      id: crypto.randomUUID(),
      type: 'pose',
      timestamp: new Date().toISOString(),
      data: {
        exerciseType: ex.title,
        duration: 600,
        repCount: 10,
        formScore: 95
      }
    };
    setHealthResults([newResult, ...healthResults]);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Module Header */}
      <div className="flex justify-center">
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
          <Activity size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">{t('Exercise Module', 'ব্যায়াম মডিউল')}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        </div>
      </div>

      {timerRunning && activeTimerExId && (
        <div className="glass-card border border-teal-500/30 bg-teal-500/10 !p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
              <Activity size={20} className="animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-teal-200">{t('Active Session:', 'সক্রিয় সেশন:')} {EXERCISES.find(e => e.id === activeTimerExId)?.title}</p>
              <p className="text-xs text-white/50">{t('Completed workout will log as 10 minutes', 'সম্পন্ন ওয়ার্কআউট ১০ মিনিট হিসেবে লগ হবে')}</p>
            </div>
          </div>
          <div className="text-2xl font-black text-teal-400 font-mono">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
      )}

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
                <p className="text-[10px] text-white/40">{t('Duration:', 'সময়:')} {ex.duration}</p>
              </div>
            </div>

            <div className="mb-4 rounded-2xl overflow-hidden ring-1 ring-white/10 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{t('Tutorial', 'টিউটোরিয়াল')}</p>
                  <p className="text-sm font-semibold text-white/80">{t('Open coach for live timer and guide', 'লাইভ টাইমার ও গাইডের জন্য কোচ খুলুন')}</p>
                </div>
                <button
                  onClick={() => window.open(ex.videoUrl, '_blank', 'noopener,noreferrer')}
                  className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all shrink-0"
                  aria-label={`Open ${ex.title} video`}
                >
                  <Play size={28} fill="currentColor" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setActiveTimerExId(ex.id);
                  setTimeLeft(600);
                  setTimerRunning(true);
                  navigate(`/exercises/coach/${ex.id}`);
                }}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Video size={14} />
                {t('Start Coach', 'কোচ শুরু')}
              </button>
              <button 
                onClick={() => handleMarkDone(ex.id)}
                className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 text-teal-950 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <CheckCircle size={14} />
                {t('Mark Done', 'সম্পন্ন')}
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
                <h3 className="font-bold text-teal-400">{t('Live Exercise Editor', 'লাইভ এক্সারসাইজ এডিটর')}</h3>
                <p className="text-[10px] text-white/60">{t('Track any exercise with real-time rep counter', 'রিয়েল-টাইম রেপ কাউন্টার দিয়ে যেকোনো ব্যায়াম ট্র্যাক করুন')}</p>
              </div>
            </div>
            <Zap className="text-teal-400" size={24} />
          </div>
        </motion.button>
      </div>
    </div>
  );
}
