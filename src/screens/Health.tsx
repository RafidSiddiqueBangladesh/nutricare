import React, { useState } from 'react';
import { Heart, Hospital, Ambulance, Store, Phone, Activity, Calculator, History, Sparkles, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const TOOLS = [
  { icon: MapPin, label: 'Find Nearest Hospital', path: '/health/hospitals' },
  { icon: Ambulance, label: 'Find Nearest Ambulance', path: '/health/hospitals' },
  { icon: Store, label: 'Find Nearest Medicine Shop', path: '/health/hospitals' },
  { icon: Phone, label: 'Doctor Calling', path: '/health/doctors' },
  { icon: Activity, label: 'Tracking & AI Monitor', path: '/health/tracking' },
  { icon: Calculator, label: 'BMI Calculator', path: '/health/bmi' },
  { icon: History, label: 'Health Results History', path: '/health/history' },
  { icon: Sparkles, label: 'AI Diagnosis', path: '/health/diagnosis' },
  { icon: Sparkles, label: 'Mood Suggestions', path: '/health/mood' },
];

export default function Health() {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <div 
          className="rounded-full px-4 py-1 flex items-center gap-2"
          style={{
            backgroundColor: 'hsla(var(--primary-hue), 70%, 50%, 0.1)',
            border: '1px solid hsla(var(--primary-hue), 70%, 50%, 0.2)',
            color: 'hsl(var(--primary-hue), 90%, 65%)'
          }}
        >
          <Heart size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Health Monitoring</span>
          <div 
            className="w-1.5 h-1.5 rounded-full animate-pulse" 
            style={{ backgroundColor: 'hsl(var(--primary-hue), 70%, 50%)' }}
          />
        </div>
      </div>

      <section className="glass-card text-center flex flex-col items-center gap-4">
        <div 
          className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl ring-1 ring-white/10"
          style={{
            backgroundColor: 'hsla(var(--primary-hue), 70%, 50%, 0.2)',
            color: 'hsl(var(--primary-hue), 90%, 65%)'
          }}
        >
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
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="group glass-card !p-4 flex items-center justify-between hover:bg-white/20 transition-all active:scale-95 text-left"
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl text-white"
                style={{ backgroundColor: 'hsl(var(--primary-hue), 70%, 45%)' }}
              >
                <tool.icon size={18} />
              </div>
              <span className="font-bold text-sm">{tool.label}</span>
            </div>
            <ChevronRight 
              size={18} 
              className="transition-colors" 
              style={{
                color: hoveredIndex === i ? 'hsl(var(--primary-hue), 90%, 65%)' : 'rgba(255, 255, 255, 0.2)'
              }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
