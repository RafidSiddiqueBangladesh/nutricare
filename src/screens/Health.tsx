import React, { useState } from 'react';
import { Heart, Hospital, Ambulance, Store, Phone, Activity, Calculator, History, Sparkles, MapPin, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/src/contexts/LanguageContext';

export default function Health() {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const tools = [
    { icon: MapPin, label: t('Find Nearest Hospital', 'নিকটস্থ হাসপাতাল খুঁজুন'), path: '/health/hospitals' },
    { icon: Ambulance, label: t('Find Nearest Ambulance', 'নিকটস্থ অ্যাম্বুলেন্স খুঁজুন'), path: '/health/hospitals' },
    { icon: Store, label: t('Find Nearest Medicine Shop', 'নিকটস্থ ওষুধের দোকান খুঁজুন'), path: '/health/hospitals' },
    { icon: Phone, label: t('Doctor Calling', 'ডাক্তার ডাকা এবং ভিডিও কল'), path: '/health/doctors' },
    { icon: Activity, label: t('Tracking & AI Monitor', 'ভাইটাল এবং ক্যামেরা মনিটর'), path: '/health/tracking' },
    { icon: Calculator, label: t('BMI Calculator', 'বিএমআই ক্যালকুলেটর'), path: '/health/bmi' },
    { icon: History, label: t('Health Results History', 'স্বাস্থ্য পরীক্ষার ইতিহাস ও লগ'), path: '/health/history' },
    { icon: Sparkles, label: t('AI Vision & Disease Detection', 'এআই ভিশন এবং রোগ সনাক্তকরণ হাব'), path: '/health/disease' },
    { icon: Sparkles, label: t('Mood Suggestions & Sound Therapy', 'মানসিক স্বাস্থ্য এবং শব্দ থেরাপি'), path: '/health/mood' },
    { icon: FileText, label: t('Prescription Upload & Analysis', 'প্রেসক্রিপশন আপলোড এবং এআই রিডার'), path: '/health/prescription' },
  ];

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
          <span className="text-xs font-bold uppercase tracking-wider">{t('Health Control Center', 'স্বাস্থ্য নিয়ন্ত্রণ কেন্দ্র')}</span>
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
          <h2 className="text-2xl font-black mb-2 text-white">{t('Medical Support & Diagnostics', 'চিকিৎসা সহায়তা ও ডায়াগনস্টিকস')}</h2>
          <p className="text-sm text-white/60 leading-relaxed max-w-[280px] mx-auto">
            {t('Monitor your vitals, test visual/hearing organs, and consult doctors.', 'আপনার ভাইটাল মনিটর করুন, শ্রবণ/দৃষ্টিশক্তি পরীক্ষা করুন এবং চিকিৎসকের পরামর্শ নিন।')}
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 pb-8">
        {tools.map((tool, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(tool.path)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="group glass-card !p-4 flex items-center justify-between hover:bg-white/20 transition-all active:scale-95 text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl text-white"
                style={{ backgroundColor: 'hsl(var(--primary-hue), 70%, 45%)' }}
              >
                <tool.icon size={18} />
              </div>
              <span className="font-bold text-sm text-white">{tool.label}</span>
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
