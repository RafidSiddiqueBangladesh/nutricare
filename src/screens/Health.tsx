import React from 'react';
import { Heart, Hospital, Ambulance, Store, Phone, Activity, Calculator, History, Sparkles, MapPin, ChevronRight, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

const TOOLS = [
  { icon: MapPin, label: 'Find Nearest Hospital', color: 'bg-teal-400', path: '/health/hospitals' },
  { icon: Ambulance, label: 'Find Nearest Ambulance', color: 'bg-teal-400', path: '/health/hospitals' },
  { icon: Store, label: 'Find Nearest Medicine Shop', color: 'bg-teal-400', path: '/health/hospitals' },
  { icon: Phone, label: 'Doctor Calling', color: 'bg-teal-400', path: '/health/doctors' },
  { icon: Activity, label: 'Tracking & AI Monitor', color: 'bg-teal-400', path: '/health/tracking' },
  { icon: Calculator, label: 'BMI Calculator', color: 'bg-teal-400', path: '/health/bmi' },
  { icon: History, label: 'Health Results History', color: 'bg-teal-400', path: '/health/history' },
  { icon: Sparkles, label: 'AI Diagnosis', color: 'bg-teal-400', path: '/health/diagnosis' },
  { icon: Sparkles, label: 'Mood Suggestions', color: 'bg-teal-400', path: '/health/mood' },
];

export default function Health() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
          <Heart size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Health Monitoring</span>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        </div>
      </div>

      <section className="glass-card text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-teal-400/20 rounded-3xl flex items-center justify-center text-teal-400 shadow-xl ring-1 ring-white/10">
          <Heart size={36} fill="currentColor" />
        </div>
        <div>
          <h2 className="text-2xl font-black mb-2">Health Monitoring Features</h2>
          <p className="text-sm text-white/60 leading-relaxed max-w-[250px] mx-auto">
            Monitor your health, analyze prescriptions, and get emergency help.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 pb-8">
        {TOOLS.map((tool, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(tool.path)}
            className="group glass-card !p-4 flex items-center justify-between hover:bg-white/20 transition-all active:scale-95 text-left"
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl text-teal-950", tool.color)}>
                <tool.icon size={18} />
              </div>
              <span className="font-bold text-sm">{tool.label}</span>
            </div>
            <ChevronRight size={18} className="text-white/20 group-hover:text-teal-400 transition-colors" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
