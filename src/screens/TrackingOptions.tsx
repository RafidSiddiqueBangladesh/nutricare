import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Activity, Smile, User, Hand, Video, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function TrackingOptions() {
  const navigate = useNavigate();

  const MODULES = [
    { icon: Smile, label: 'Face Detection & Mood', desc: 'Detect face and classify happy, neutral, sad states.', path: '/health/monitor/face' },
    { icon: User, label: 'Shoulder Movement', desc: 'Track shoulder engagement and posture movement.', path: '/health/monitor/pose' },
    { icon: Hand, label: 'Hand Movement', desc: 'Detect arm/hand motion for exercise repetition quality.', path: '/health/monitor/hand' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
           <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <Activity size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Tracking Options</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      <section className="glass-card">
        <h3 className="text-lg font-bold mb-2">AI Tracking Modules</h3>
        <p className="text-sm text-white/60">
          Choose tracking modules. The Live tab combines face mood + shoulder + hand movement while you exercise.
        </p>
      </section>

      <div className="flex flex-col gap-3">
        {MODULES.map((mod, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(mod.path)}
            className="glass-card !p-5 flex items-center gap-6 group hover:bg-white/20 transition-all text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-400/10 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-110 transition-transform">
              <mod.icon size={28} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base">{mod.label}</h4>
                <ChevronRight size={18} className="text-white/20" />
              </div>
              <p className="text-xs text-white/40 leading-tight mt-1">{mod.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <button 
        onClick={() => navigate('/exercises')}
        className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3 shadow-xl"
      >
        <Video size={20} fill="currentColor" />
        Open Live Monitor
      </button>
    </div>
  );
}
