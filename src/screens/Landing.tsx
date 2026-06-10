import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Activity, 
  Apple, 
  Brain, 
  Zap, 
  ArrowRight, 
  Users, 
  Smartphone, 
  Eye, 
  Glasses, 
  Shield, 
  Utensils, 
  FileText, 
  Send, 
  Volume2, 
  Music, 
  Globe 
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '@/src/contexts/LanguageContext';

export default function Landing() {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();

  const stats = [
    { value: '99.2%', label: t('AI Accuracy', 'এআই নির্ভুলতা') },
    { value: '< 50ms', label: t('Response Time', 'প্রতিক্রিয়ার সময়') },
    { value: '12+', label: t('Integrated Models', 'ইন্টিগ্রেটেড মডেল') },
    { value: '24/7', label: t('Secure Guard', 'নিরাপদ প্রহরী') },
  ];

  const features = [
    {
      icon: Activity,
      title: t('Paralysis Rehab Tracking', 'প্যারালাইসিস পুনর্বাসন ট্র্যাকিং'),
      desc: t('No gym required. Real-time TF.js pose detection tracks joint range of motion, counting recovery reps automatically at home.', 'কোন জিমের প্রয়োজন নেই। রিয়েল-টাইম TF.js পোজ ডিটেকশন জয়েন্ট মুভমেন্ট ট্র্যাক করে ঘরে বসেই রিহ্যাব রেপস কাউন্ট করে।'),
      color: 'from-teal-600 to-teal-400',
    },
    {
      icon: Send,
      title: t('Auto Family Message Alert', 'স্বয়ংক্রিয় জরুরি বার্তা প্রেরণ'),
      desc: t('Automatic safety messaging. Easily save emergency numbers (son, daughter, family) to dispatch vital signs and crucial health reports via WhatsApp.', 'স্বয়ংক্রিয় নিরাপত্তা বার্তা। ভাইটাল সাইন এবং ক্রুশিয়াল হেলথ রিপোর্ট স্বয়ংক্রিয়ভাবে সন্তান বা পরিবারের হোয়াটসঅ্যাপে পাঠানোর ব্যবস্থা।'),
      color: 'from-blue-600 to-blue-400',
    },
    {
      icon: Glasses,
      title: t('Bilingual Disease Detection Hub', 'রোগ সনাক্তকরণ হাব'),
      desc: t('Full diagnostic tests: Visual acuity (Snellen), astigmatism checks, color blindness (Ishihara), hearing range, memory span, and hand tremors.', 'চোখের দৃষ্টিশক্তি পরীক্ষা (Snellen), অ্যাসটিগম্যাটিজম, বর্ণান্ধতা (Ishihara), শ্রবণ ক্ষমতা, স্মৃতিশক্তি এবং হাত কাঁপার ট্র্যাকিং।'),
      color: 'from-purple-600 to-purple-400',
    },
    {
      icon: Heart,
      title: t('VitalLens Camera Scanner', 'ভাইটাললেন্স ক্যামেরা স্ক্যানার'),
      desc: t('State-of-the-art rPPG vital estimation. Measures heart rate, respiratory rate, and HRV directly from a 10-second facial video scan.', 'রিয়েল-টাইম ভাইটাল সাইন ট্র্যাকিং। ১০ সেকেন্ডের ফেসিয়াল স্ক্যানিংয়ের মাধ্যমে হার্ট রেট, শ্বাস-প্রশ্বাসের হার এবং HRV পরিমাপ।'),
      color: 'from-rose-600 to-rose-400',
    },
    {
      icon: FileText,
      title: t('Prescription OCR Analysis', 'প্রেসক্রিপশন এআই বিশ্লেষণ'),
      desc: t('Upload a prescription image. Our vision model extracts doctor guidelines, medicine routines, eating lists, and food restrictions.', 'প্রেসক্রিপশনের ছবি আপলোড করুন। আমাদের এআই প্রেসক্রিপশন পড়ে ওষুধের রুটিন, পথ্য এবং ক্ষতিকর খাবারের তালিকা বের করে দেবে।'),
      color: 'from-amber-600 to-amber-400',
    },
    {
      icon: Brain,
      title: t('AI Face Emotion & Mood Therapy', 'আবেগ ও মুড থেরাপি'),
      desc: t('Scans facial expressions (happy, sad, neutral) and generates cognitive mental health guides coupled with YouTube therapeutic soundbeds.', 'মুখের অভিব্যক্তি স্ক্যান করে এআই মানসিক স্বাস্থ্য গাইড তৈরি করে এবং থেরাপিউটিক মিউজিক ও ইউটিউব ভিডিও সাজেস্ট করে।'),
      color: 'from-pink-600 to-pink-400',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full filter blur-[100px] opacity-15 -top-20 -left-20 bg-teal-500" />
        <div className="absolute w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-15 top-1/3 -right-20 bg-purple-500" />
        <div className="absolute w-[600px] h-[600px] rounded-full filter blur-[100px] opacity-10 bottom-0 left-1/3 bg-blue-500" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 relative bg-black/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Heart size={24} className="text-teal-950 font-bold" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">LifeSync AI</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Global translation toggle button */}
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/20 text-xs font-bold text-teal-400 flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <Globe size={14} />
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>

            <button
              onClick={() => navigate('/auth/signin')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-white/10 text-white/90 transition-all"
            >
              {t('Sign In', 'লগইন')}
            </button>
            <button
              onClick={() => navigate('/auth/signup')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-teal-950 hover:scale-[1.03] active:scale-95 transition-all shadow-lg shadow-teal-500/10 cursor-pointer"
            >
              {t('Get Started', 'নিবন্ধন করুন')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-4 pt-16 pb-12 flex flex-col items-center justify-center gap-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold tracking-widest text-teal-400 mb-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          {t('AI-POWERED PREVENTIVE DIGITAL HEALTH v3.0', 'এআই চালিত ডিজিটাল হেলথ প্ল্যাটফর্ম সংস্করণ ৩.০')}
        </div>

        <div className="max-w-4xl">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black leading-tight text-white mb-6">
            {t('AI Smart Healthcare', 'এআই স্মার্ট স্বাস্থ্যসেবা')}
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400">
              {t('Companion & Diagnostics', 'সহযোগী এবং রোগ সনাক্তকরণ')}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
            {t(
              'Real-time physical rehab tracking, automated family messaging alert triggers, vision iris pupillary distance scan, and multimodal medical prescription analysis — all locally and securely inside your browser.',
              'রিয়েল-টাইম রিহ্যাব ট্র্যাকিং, পরিবারকে স্বয়ংক্রিয় মেসেজিং অ্যালার্ট পাঠানো, চোখের দৃষ্টিশক্তি পরীক্ষা ও আইরিস ডিস্টেন্স স্ক্যান এবং এআই চালিত প্রেসক্রিপশন বিশ্লেষণ — সবকিছুই আপনার ব্রাউজারে সম্পূর্ণ নিরাপদ ও গোপনীয়।'
            )}
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/auth/signup')}
              className="px-8 py-4 rounded-2xl font-bold bg-teal-500 hover:bg-teal-400 text-teal-950 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/20 cursor-pointer text-sm"
            >
              {t('Start Free Scan', 'ফ্রি স্ক্যান শুরু করুন')} <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/auth/signin')}
              className="px-8 py-4 rounded-2xl font-bold text-white border-2 border-white/10 hover:border-teal-500/40 hover:bg-white/5 active:scale-95 transition-all flex items-center gap-2 cursor-pointer text-sm"
            >
              {t('Access Dashboard', 'ড্যাশবোর্ড প্রবেশ করুন')}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-12">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card text-center p-5 border border-white/5 hover:border-white/10 transition-colors">
              <p className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-300 mb-1">{stat.value}</p>
              <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 w-full relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-4xl font-black mb-3 text-white">
            {t('Fully Implemented Features', 'সম্পূর্ণভাবে চালুকৃত ফিচারসমূহ')}
          </h3>
          <p className="text-sm text-white/50 max-w-xl mx-auto leading-relaxed">
            {t('Empower your wellness with zero gym equipment and automated health notifications to loved ones.', 'কোন জিমের সরঞ্জাম ছাড়াই আপনার স্বাস্থ্য রক্ষা করুন এবং প্রিয়জনকে স্বয়ংক্রিয়ভাবে হেলথ আপডেট পাঠান।')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card hover:scale-[1.02] hover:border-white/10 transition-all border border-white/5 text-left flex flex-col justify-between"
              >
                <div>
                  <div className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br shadow-inner',
                    feat.color
                  )}>
                    <Icon size={22} className="text-teal-950 font-bold" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{feat.title}</h4>
                  <p className="text-white/60 text-xs leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Interactive Mockup Dashboard Section (design inspired by numerical.tsx) */}
      <section className="max-w-5xl mx-auto px-4 py-16 w-full relative z-10">
        <div className="glass-card !p-8 border border-teal-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-teal-500/5 blur-[50px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-44 h-44 rounded-full bg-indigo-500/5 blur-[50px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-8">
            <div>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">{t('Rehabilitation & Recovery Analytics', 'পুনর্বাসন ও পুনরুদ্ধার বিশ্লেষণ')}</span>
              <h3 className="text-2xl font-black text-white mt-1">{t('Patient Recovery Dashboard', 'রোগীর পুনরুদ্ধার ড্যাশবোর্ড')}</h3>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/25">
                ● {t('Live Monitoring Active', 'লাইভ মনিটরিং সক্রিয়')}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 border border-white/15 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-teal-400">85%</p>
              <p className="text-[10px] font-bold text-white/50 uppercase mt-1">{t('Therapy Progress', 'থেরাপি অগ্রগতি')}</p>
            </div>
            <div className="bg-white/5 border border-white/15 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-purple-400">142</p>
              <p className="text-[10px] font-bold text-white/50 uppercase mt-1">{t('Rehab Reps Logged', 'রিহ্যাব রেপস সম্পন্ন')}</p>
            </div>
            <div className="bg-white/5 border border-white/15 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-rose-400">72 bpm</p>
              <p className="text-[10px] font-bold text-white/50 uppercase mt-1">{t('Resting Heart Rate', 'হার্ট রেট')}</p>
            </div>
          </div>

          <div className="space-y-3.5 bg-black/30 border border-white/10 rounded-2xl p-5">
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">{t('Mockup Simulation: Emergency Broadcast Log', 'জরুরি বার্তা সম্প্রচার লগ')}</h4>
            <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
              <span className="text-white/80">{t('Recipient: Family (Son)', 'প্রাপক: পরিবার (ছেলে)')}</span>
              <span className="text-teal-400 font-mono">WhatsApp 10:48 AM</span>
              <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded font-bold uppercase text-[9px]">{t('Delivered', 'প্রেরিত')}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
              <span className="text-white/80">{t('Recipient: Family (Emergency Contact 2)', 'প্রাপক: জরুরী যোগাযোগ ২')}</span>
              <span className="text-teal-400 font-mono">WhatsApp 10:48 AM</span>
              <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded font-bold uppercase text-[9px]">{t('Delivered', 'প্রেরিত')}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">{t('SMS Gateway Broker Queue', 'এসএমএস গেটওয়ে ব্রোকার কিউ')}</span>
              <span className="text-yellow-400 font-mono">SMS queued</span>
              <span className="text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded font-bold uppercase text-[9px]">{t('Queue Shim', 'অপেক্ষারত')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Large CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full relative z-10">
        <div className="glass-card p-12 text-center rounded-[2.5rem] border border-teal-500/20 bg-gradient-to-br from-teal-500/5 via-transparent to-indigo-500/5">
          <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {t('Take Control of Your Health Today', 'আজই আপনার স্বাস্থ্যের নিয়ন্ত্রণ নিন')}
          </h3>
          <p className="text-sm text-white/60 mb-8 max-w-lg mx-auto leading-relaxed">
            {t('Secure local storage processing and responsive upscaled typography for absolute legibility on any screen.', 'সম্পূর্ণ নিরাপদ লোকাল ডেটা প্রসেসিং এবং যেকোনো স্ক্রিনে সহজে পড়ার মতো বড় ফন্টের সুবিধা।')}
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            className="px-10 py-4 rounded-2xl font-bold bg-teal-500 hover:bg-teal-400 text-teal-950 text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/20 cursor-pointer"
          >
            {t('Get Started Free', 'বিনামূল্যে শুরু করুন')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-20 relative z-10 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/40 text-xs font-mono">
          <p>{t('© 2026 LifeSync AI. All rights reserved. | AI-Powered Health Companion', '© ২০২৬ লাইফসিঙ্ক এআই। সর্বস্বত্ব সংরক্ষিত। | এআই চালিত ডিজিটাল হেলথ পার্টনার')}</p>
        </div>
      </footer>
    </div>
  );
}
