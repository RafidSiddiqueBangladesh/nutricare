import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Activity,
  Brain,
  Zap,
  ArrowRight,
  Eye,
  Glasses,
  Shield,
  Utensils,
  FileText,
  Send,
  Volume2,
  Music,
  Globe,
  Smartphone,
  Move,
  Hand,
  Watch,
  Stethoscope,
  MapPin,
  Calculator,
  History,
  ChefHat,
  Wallet,
  Sparkles,
  Phone,
  MessageCircle,
  CheckCircle,
  Contrast,
  Palette,
  Users,
  TrendingUp,
  BarChart3,
  ChevronRight,
  Dumbbell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/src/contexts/LanguageContext';

// ─── Floating Particle Component ─────────────────────────────────────────────
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-teal-400/20"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animation: `particle-float ${8 + Math.random() * 12}s infinite alternate ease-in-out`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  return (
    <span className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

// ─── Main Landing Component ──────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+880');
  const [demoSent, setDemoSent] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  // ─── Stats Data ──────────────────────────────────────────────────────────
  const stats = [
    { value: '99.2%', label: t('AI Accuracy', 'এআই নির্ভুলতা'), icon: Zap },
    { value: '<50ms', label: t('Response Time', 'প্রতিক্রিয়ার সময়'), icon: Activity },
    { value: '15+', label: t('AI Models', 'এআই মডেল'), icon: Brain },
    { value: '24/7', label: t('Monitoring', 'মনিটরিং'), icon: Shield },
  ];

  // ─── Core Feature Highlights ─────────────────────────────────────────────
  const coreFeatures = [
    {
      icon: Activity,
      title: t('Paralysis Rehab Tracking', 'প্যারালাইসিস রিহ্যাব ট্র্যাকিং'),
      desc: t(
        'No gym required. Real-time TF.js pose detection tracks joint range of motion and counts recovery reps automatically at home.',
        'কোন জিমের প্রয়োজন নেই। রিয়েল-টাইম TF.js পোজ ডিটেকশন জয়েন্ট মুভমেন্ট ট্র্যাক করে ঘরে বসেই রিহ্যাব রেপস কাউন্ট করে।'
      ),
      gradient: 'from-teal-600 to-cyan-400',
      tag: t('NO GYM NEEDED', 'জিম লাগবে না'),
    },
    {
      icon: Send,
      title: t('Auto Family Safety Alerts', 'স্বয়ংক্রিয় পরিবার নিরাপত্তা বার্তা'),
      desc: t(
        'Save up to 3 emergency contacts (son, daughter, family). Dispatches vital signs and critical health reports automatically via WhatsApp.',
        '৩টি জরুরি নম্বর সংরক্ষণ করুন (ছেলে, মেয়ে, পরিবার)। ভাইটাল সাইন ও ক্রিটিক্যাল হেলথ রিপোর্ট স্বয়ংক্রিয়ভাবে হোয়াটসঅ্যাপে পাঠানো হবে।'
      ),
      gradient: 'from-green-600 to-emerald-400',
      tag: t('AUTO WHATSAPP', 'অটো হোয়াটসঅ্যাপ'),
    },
    {
      icon: Eye,
      title: t('Disease Screening Hub', 'রোগ সনাক্তকরণ হাব'),
      desc: t(
        '11 screening tests: Visual acuity, astigmatism, color blindness (Ishihara), contrast sensitivity, hearing, memory span, reaction time, tremor and more.',
        '১১টি স্ক্রিনিং পরীক্ষা: দৃষ্টিশক্তি, অ্যাসটিগম্যাটিজম, বর্ণান্ধতা (ইশিহারা), কন্ট্রাস্ট, শ্রবণশক্তি, স্মৃতিশক্তি, প্রতিক্রিয়ার সময়, কম্পন এবং আরো।'
      ),
      gradient: 'from-purple-600 to-violet-400',
      tag: t('11 TESTS', '১১টি পরীক্ষা'),
    },
    {
      icon: Heart,
      title: t('Vital Signs Camera Scanner', 'ক্যামেরায় ভাইটাল সাইন স্ক্যান'),
      desc: t(
        'Local rPPG algorithm measures heart rate, respiratory rate, and HRV from a 10-second facial video — zero internet needed, fully private.',
        'লোকাল rPPG অ্যালগরিদম ১০ সেকেন্ডের ফেসিয়াল ভিডিও থেকে হার্ট রেট, শ্বাস-প্রশ্বাসের হার ও HRV পরিমাপ করে — কোন ইন্টারনেট লাগে না।'
      ),
      gradient: 'from-rose-600 to-pink-400',
      tag: t('PRIVACY FIRST', 'গোপনীয়তা রক্ষা'),
    },
    {
      icon: FileText,
      title: t('Prescription OCR Analysis', 'প্রেসক্রিপশন এআই বিশ্লেষণ'),
      desc: t(
        'Upload a prescription image. AI extracts doctor guidelines, medicine routines, food to eat, and food to avoid — all saved in history.',
        'প্রেসক্রিপশনের ছবি আপলোড করুন। এআই ওষুধের রুটিন, পথ্য ও নিষিদ্ধ খাবারের তালিকা বের করে দেবে — সব ইতিহাসে সেভ থাকবে।'
      ),
      gradient: 'from-amber-600 to-orange-400',
      tag: t('AI OCR', 'এআই ওসিআর'),
    },
    {
      icon: Brain,
      title: t('AI Face Emotion & Mood Therapy', 'মুখের আবেগ ও মুড থেরাপি'),
      desc: t(
        'Scans facial expressions (happy, sad, neutral) then generates personalized mental health guides with therapeutic music and YouTube soundbeds.',
        'মুখের অভিব্যক্তি স্ক্যান করে এআই ব্যক্তিগতকৃত মানসিক স্বাস্থ্য গাইড ও থেরাপিউটিক মিউজিক সাজেস্ট করে।'
      ),
      gradient: 'from-pink-600 to-fuchsia-400',
      tag: t('MOOD AI', 'মুড এআই'),
    },
  ];

  // ─── Tracking Modules ────────────────────────────────────────────────────
  const trackingModules = [
    { icon: '😊', label: t('Face Detection & Mood', 'ফেস ডিটেকশন ও মুড'), path: '/health/monitor/face' },
    { icon: '💪', label: t('Shoulder Movement', 'কাঁধের নড়াচড়া'), path: '/health/monitor/pose' },
    { icon: '✋', label: t('Hand Movement', 'হাতের নড়াচড়া'), path: '/health/monitor/hand' },
    { icon: '❤️', label: t('Vital Signs (HR/RR)', 'ভাইটাল সাইন (হার্ট/শ্বাস)'), path: '/health/monitor/vitals' },
    { icon: '⌚', label: t('Connect Physical Device', 'ফিজিক্যাল ডিভাইস কানেক্ট'), path: '/health/monitor/device' },
    { icon: '🩺', label: t('Disease Screening Hub', 'রোগ সনাক্তকরণ হাব'), path: '/health/disease' },
  ];

  // ─── Disease Hub Tests ───────────────────────────────────────────────────
  const diseaseTests = [
    { icon: Eye, label: t('AI Vision Screening', 'এআই ভিশন স্ক্রিনিং'), desc: t('Interactive acuity & PD test', 'ইন্টারেক্টিভ দৃষ্টিশক্তি পরীক্ষা'), color: 'from-teal-500 to-cyan-500', path: '/health/disease/screening' },
    { icon: Palette, label: t('Color Blindness', 'বর্ণান্ধতা পরীক্ষা'), desc: t('Ishihara plate test', 'ইশিহারা প্লেট পরীক্ষা'), color: 'from-rose-500 to-orange-500', path: '/health/disease/color-blindness' },
    { icon: Glasses, label: t('Visual Acuity', 'দৃষ্টিশক্তি পরিমাপ'), desc: t('Snellen-style chart', 'স্নেলেন চার্ট'), color: 'from-indigo-500 to-blue-500', path: '/health/disease/visual-acuity' },
    { icon: Contrast, label: t('Astigmatism', 'অ্যাসটিগম্যাটিজম'), desc: t('Radial line check', 'রেডিয়াল লাইন চেক'), color: 'from-violet-500 to-purple-500', path: '/health/disease/astigmatism' },
    { icon: Contrast, label: t('Contrast Sensitivity', 'কন্ট্রাস্ট সেনসিটিভিটি'), desc: t('Low-contrast letters', 'লো-কন্ট্রাস্ট লেটার'), color: 'from-blue-500 to-teal-500', path: '/health/disease/contrast' },
    { icon: Palette, label: t('Color Discrimination', 'কালার ডিসক্রিমিনেশন'), desc: t('Sort hue tiles', 'হিউ টাইল সাজান'), color: 'from-fuchsia-500 to-rose-500', path: '/health/disease/color-sort' },
    { icon: Zap, label: t('Reaction Time', 'প্রতিক্রিয়ার সময়'), desc: t('Neuro reflex test', 'নিউরো রিফ্লেক্স পরীক্ষা'), color: 'from-amber-500 to-yellow-500', path: '/health/disease/reaction' },
    { icon: Activity, label: t('Tremor / Stability', 'ট্রেমর / স্থিতিশীলতা'), desc: t('Hand steadiness test', 'হাতের স্থিতিশীলতা পরীক্ষা'), color: 'from-emerald-500 to-teal-500', path: '/health/disease/tremor' },
    { icon: Volume2, label: t('Hearing Tone Test', 'শ্রবণ পরীক্ষা'), desc: t('Frequency range check', 'ফ্রিকোয়েন্সি রেঞ্জ চেক'), color: 'from-cyan-500 to-blue-500', path: '/health/disease/hearing' },
    { icon: Brain, label: t('Memory Span', 'মেমরি স্প্যান'), desc: t('Cognitive recall test', 'কগনিটিভ রিকল পরীক্ষা'), color: 'from-purple-500 to-indigo-500', path: '/health/disease/memory' },
    { icon: Heart, label: t('Vital Sign Check', 'ভাইটাল সাইন চেক'), desc: t('Heart rate & resp. screening', 'হার্ট রেট ও শ্বাস পরীক্ষা'), color: 'from-rose-500 to-pink-500', path: '/health/disease/vitals' },
  ];

  // ─── Health Tools ────────────────────────────────────────────────────────
  const healthTools = [
    { icon: MapPin, label: t('Find Nearest Hospital', 'নিকটস্থ হাসপাতাল'), path: '/health/hospitals', gradient: 'from-teal-500 to-cyan-500' },
    { icon: Phone, label: t('Doctor Booking & Video Call', 'ডাক্তারের সাথে ভিডিও কল'), path: '/health/doctors', gradient: 'from-blue-500 to-indigo-500' },
    { icon: Activity, label: t('AI Tracking & Live Monitor', 'এআই ট্র্যাকিং ও লাইভ মনিটর'), path: '/health/tracking', gradient: 'from-purple-500 to-violet-500' },
    { icon: Calculator, label: t('BMI Calculator', 'বিএমআই ক্যালকুলেটর'), path: '/health/bmi', gradient: 'from-emerald-500 to-green-500' },
    { icon: History, label: t('Health Results History', 'স্বাস্থ্য ফলাফলের ইতিহাস'), path: '/health/history', gradient: 'from-amber-500 to-orange-500' },
    { icon: Sparkles, label: t('Mood & Sound Therapy', 'মুড ও সাউন্ড থেরাপি'), path: '/health/mood', gradient: 'from-pink-500 to-rose-500' },
    { icon: FileText, label: t('Prescription AI Reader', 'প্রেসক্রিপশন এআই রিডার'), path: '/health/prescription', gradient: 'from-cyan-500 to-teal-500' },
    { icon: Music, label: t('Piano Healing Therapy', 'পিয়ানো হিলিং থেরাপি'), path: '/health/piano', gradient: 'from-violet-500 to-fuchsia-500' },
  ];

  // ─── Platform Sections ───────────────────────────────────────────────────
  const platformSections = [
    { icon: Utensils, label: t('AI Nutrition Planner', 'এআই পুষ্টি পরিকল্পনা'), desc: t('Personalized meal plans with calorie tracking', 'ক্যালোরি ট্র্যাকিং সহ পার্সোনালাইজড মিল প্ল্যান'), path: '/nutrition', color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: Dumbbell, label: t('Exercise Coach', 'এক্সারসাইজ কোচ'), desc: t('AI-guided workouts with real-time form correction', 'রিয়েল-টাইম ফর্ম কারেকশন সহ এআই ওয়ার্কআউট'), path: '/exercises', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: ChefHat, label: t('Smart Cooking', 'স্মার্ট কুকিং'), desc: t('AI recipes tailored to your dietary needs', 'আপনার ডায়েটের চাহিদা অনুযায়ী এআই রেসিপি'), path: '/cooking', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { icon: Wallet, label: t('Cost Tracker', 'খরচ ট্র্যাকার'), desc: t('Monitor health expenses and insurance claims', 'স্বাস্থ্য খরচ ও ইন্স্যুরেন্স ক্লেইম মনিটর করুন'), path: '/costs', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  // ─── Dashboard Mock Data ─────────────────────────────────────────────────
  const mockDashboard = [
    { label: t('Therapy Progress', 'থেরাপি অগ্রগতি'), value: '85%', color: 'text-teal-400' },
    { label: t('Rehab Reps Logged', 'রিহ্যাব রেপস সম্পন্ন'), value: '142', color: 'text-purple-400' },
    { label: t('Resting Heart Rate', 'বিশ্রামের হার্ট রেট'), value: '72 bpm', color: 'text-rose-400' },
  ];

  // ─── WhatsApp Demo Handler ───────────────────────────────────────────────
  const handleWhatsAppDemo = () => {
    if (!whatsappNumber || whatsappNumber.length < 6) return;
    const cleanNum = (countryCode + whatsappNumber).replace(/[^0-9+]/g, '').replace('+', '');
    const msg = encodeURIComponent(
      `🏥 LIFESYNC AI — ${t('Emergency Health Report', 'জরুরি স্বাস্থ্য রিপোর্ট')}\n\n` +
        `❤️ ${t('Heart Rate', 'হার্ট রেট')}: 72 bpm\n` +
        `🌬️ ${t('Resp. Rate', 'শ্বাসের হার')}: 16/min\n` +
        `📊 ${t('HRV', 'এইচআরভি')}: 65 ms\n` +
        `🩺 ${t('Status', 'অবস্থা')}: ${t('Normal — No immediate action needed', 'স্বাভাবিক — তাৎক্ষণিক ব্যবস্থার প্রয়োজন নেই')}\n\n` +
        `${t('Sent automatically via LifeSync AI', 'লাইফসিঙ্ক এআই থেকে স্বয়ংক্রিয়ভাবে প্রেরিত')}`
    );
    window.open(`https://wa.me/${cleanNum}?text=${msg}`, '_blank');
    setDemoSent(true);
    setTimeout(() => setDemoSent(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      {/* ─── Animated Background ─────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full filter blur-[120px] opacity-15 -top-32 -left-32 bg-gradient-to-br from-teal-500 to-cyan-500 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full filter blur-[120px] opacity-12 top-1/4 -right-20 bg-gradient-to-br from-purple-500 to-violet-500" style={{ animation: 'orb-float 20s infinite alternate ease-in-out' }} />
        <div className="absolute w-[700px] h-[700px] rounded-full filter blur-[120px] opacity-10 bottom-0 left-1/4 bg-gradient-to-br from-blue-500 to-indigo-500" style={{ animation: 'orb-float 25s infinite alternate-reverse ease-in-out' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full filter blur-[80px] opacity-8 top-1/2 right-1/3 bg-gradient-to-br from-rose-500 to-pink-500" style={{ animation: 'orb-float 18s infinite alternate ease-in-out' }} />
      </div>

      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Heart size={22} className="text-teal-950" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">LifeSync AI</h1>
              <p className="text-[9px] text-teal-400/80 font-bold uppercase tracking-[0.15em]">{t('Digital Health Companion', 'ডিজিটাল হেলথ কম্প্যানিয়ন')}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-full bg-white/8 hover:bg-white/15 transition-all border border-white/15 text-xs font-bold text-teal-400 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Globe size={14} />
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>
            <button
              onClick={() => navigate('/auth/signin')}
              className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 text-white/80 transition-all hidden sm:block"
            >
              {t('Sign In', 'লগইন')}
            </button>
            <button
              onClick={() => navigate('/auth/signup')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-teal-950 active:scale-95 transition-all shadow-lg shadow-teal-500/15 cursor-pointer"
            >
              {t('Get Started', 'শুরু করুন')}
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 pt-16 pb-8 w-full z-10">
        <FloatingParticles />
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Text */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold tracking-widest text-teal-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              {t('AI-POWERED PREVENTIVE HEALTHCARE v3.0', 'এআই চালিত প্রতিরোধমূলক স্বাস্থ্যসেবা v৩.০')}
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] text-white mb-6">
              <span>{t('AI SMART', 'এআই স্মার্ট')}</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400">
                {t('HEALTH CARE', 'স্বাস্থ্যসেবা')}
              </span>
            </h2>

            <p className="text-base sm:text-lg text-white/55 max-w-xl leading-relaxed mb-8">
              {t(
                'Physical rehab at home without a gym, automatic emergency alerts to your family via WhatsApp, preliminary disease screening, and AI-powered prescription reading — all securely inside your browser.',
                'জিম ছাড়াই ঘরে বসে রিহ্যাব, হোয়াটসঅ্যাপে পরিবারকে স্বয়ংক্রিয় জরুরি বার্তা, প্রাথমিক রোগ স্ক্রিনিং, এবং এআই প্রেসক্রিপশন রিডিং — সবকিছু আপনার ব্রাউজারে নিরাপদ।'
              )}
            </p>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => navigate('/auth/signup')}
                className="px-7 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-400 text-teal-950 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/20 cursor-pointer text-sm"
              >
                {t('Start Free Scan', 'ফ্রি স্ক্যান শুরু করুন')} <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/auth/signin')}
                className="px-7 py-3.5 rounded-2xl font-bold text-white border border-white/15 hover:border-teal-500/40 hover:bg-white/5 active:scale-95 transition-all flex items-center gap-2 cursor-pointer text-sm"
              >
                {t('Access Dashboard', 'ড্যাশবোর্ড প্রবেশ করুন')}
              </button>
            </div>
          </motion.div>

          {/* Right Visual — Orbiting Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex justify-center items-center"
          >
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[360px] lg:h-[360px]">
              {/* Central glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/10 blur-[60px] animate-pulse" style={{ animationDuration: '4s' }} />

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/10 backdrop-blur-xl border border-teal-400/20 flex items-center justify-center">
                  <Heart size={48} className="text-teal-400" />
                </div>
              </div>

              {/* Orbiting rings */}
              <div className="absolute inset-[-16px] rounded-full border border-teal-500/15" style={{ animation: 'spin 25s linear infinite' }} />
              <div className="absolute inset-[-40px] rounded-full border border-purple-500/10" style={{ animation: 'spin 35s linear infinite reverse' }} />
              <div className="absolute inset-[-64px] rounded-full border border-cyan-500/8" style={{ animation: 'spin 45s linear infinite' }} />

              {/* Floating feature badges */}
              {[
                { icon: '🧠', x: '10%', y: '10%' },
                { icon: '👁️', x: '85%', y: '15%' },
                { icon: '💊', x: '5%', y: '75%' },
                { icon: '📱', x: '90%', y: '80%' },
                { icon: '🫀', x: '50%', y: '-5%' },
                { icon: '🏥', x: '50%', y: '105%' },
              ].map((b, i) => (
                <div
                  key={i}
                  className="absolute w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-lg"
                  style={{
                    left: b.x,
                    top: b.y,
                    transform: 'translate(-50%, -50%)',
                    animation: `particle-float ${5 + i * 1.5}s infinite alternate ease-in-out`,
                  }}
                >
                  {b.icon}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/8 rounded-2xl p-5 text-center hover:bg-white/8 transition-all group">
                <Icon size={16} className="mx-auto text-teal-400/60 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-300 mb-1">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-[10px] text-white/45 uppercase font-bold tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* ─── CORE FEATURES SECTION ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20 w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h3 className="text-3xl sm:text-4xl font-black mb-3 text-white">
            {t('PLATFORM', 'প্ল্যাটফর্ম')} <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">{t('FEATURES', 'ফিচারসমূহ')}</span>
          </h3>
          <p className="text-sm text-white/45 max-w-xl mx-auto">{t('Zero gym equipment, zero internet dependency — everything runs locally in your browser.', 'জিমের সরঞ্জাম লাগবে না, ইন্টারনেটের উপর নির্ভরতা নেই — সবকিছু আপনার ব্রাউজারে চলে।')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/5 backdrop-blur-md border border-white/8 rounded-3xl p-6 hover:bg-white/8 hover:border-white/15 hover:scale-[1.02] transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-[8px] font-black text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 tracking-widest uppercase">{feat.tag}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">{feat.title}</h4>
                <p className="text-white/50 text-xs leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── DISEASE SCREENING HUB ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16 w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold tracking-widest text-purple-400 uppercase mb-4">
            <Stethoscope size={12} />
            {t('11 SCREENING TESTS', '১১টি স্ক্রিনিং পরীক্ষা')}
          </div>
          <h3 className="text-3xl font-black text-white mb-2">{t('Disease Detection Hub', 'রোগ সনাক্তকরণ হাব')}</h3>
          <p className="text-sm text-white/45 max-w-lg mx-auto">{t('Quick in-browser screening tests. Results are saved to your history. These are screenings only — not medical diagnoses.', 'ব্রাউজারে দ্রুত স্ক্রিনিং পরীক্ষা। ফলাফল ইতিহাসে সেভ থাকে। এগুলো শুধুমাত্র স্ক্রিনিং — মেডিকেল ডায়াগনোসিস নয়।')}</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {diseaseTests.map((test, i) => {
            const Icon = test.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate('/auth/signup')}
                className="bg-white/5 backdrop-blur-md border border-white/8 rounded-2xl p-4 hover:bg-white/10 hover:scale-[1.03] transition-all cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${test.color} flex items-center justify-center mb-3`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors">{test.label}</p>
                <p className="text-[10px] text-white/40 mt-1">{test.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── TRACKING MODULES + HEALTH TOOLS ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tracking Modules */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-white/5 backdrop-blur-md border border-white/8 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Activity size={18} className="text-teal-400" />
                <h3 className="text-lg font-black text-white">{t('AI Tracking Modules', 'এআই ট্র্যাকিং মডিউল')}</h3>
              </div>
              <div className="space-y-2.5">
                {trackingModules.map((mod, i) => (
                  <div
                    key={i}
                    onClick={() => navigate('/auth/signup')}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-teal-500/20 transition-all cursor-pointer group"
                  >
                    <span className="text-2xl w-10 text-center">{mod.icon}</span>
                    <span className="flex-1 text-sm font-bold text-white/80 group-hover:text-white transition-colors">{mod.label}</span>
                    <ChevronRight size={16} className="text-white/20 group-hover:text-teal-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Health Tools */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-white/5 backdrop-blur-md border border-white/8 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Heart size={18} className="text-rose-400" />
                <h3 className="text-lg font-black text-white">{t('Health Control Center', 'স্বাস্থ্য নিয়ন্ত্রণ কেন্দ্র')}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {healthTools.map((tool, i) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={i}
                      onClick={() => navigate('/auth/signup')}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-2`}>
                        <Icon size={16} className="text-white" />
                      </div>
                      <p className="text-xs font-bold text-white/80 group-hover:text-white transition-colors leading-tight">{tool.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FULL PLATFORM MODULES ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h3 className="text-2xl font-black text-white mb-2">{t('Complete Platform', 'সম্পূর্ণ প্ল্যাটফর্ম')}</h3>
          <p className="text-xs text-white/40">{t('Nutrition, Exercise, Cooking, and Cost Tracking — all in one place.', 'পুষ্টি, ব্যায়াম, রান্না, এবং খরচ ট্র্যাকিং — সবকিছু একটি জায়গায়।')}</p>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {platformSections.map((sec, i) => {
            const Icon = sec.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate('/auth/signup')}
                className="bg-white/5 backdrop-blur-md border border-white/8 rounded-2xl p-5 hover:bg-white/10 hover:scale-[1.02] transition-all cursor-pointer group text-center"
              >
                <div className={`w-12 h-12 rounded-2xl ${sec.bg} flex items-center justify-center mx-auto mb-3`}>
                  <Icon size={22} className={sec.color} />
                </div>
                <h4 className="font-bold text-sm text-white mb-1">{sec.label}</h4>
                <p className="text-[10px] text-white/40 leading-relaxed">{sec.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── RECOVERY DASHBOARD MOCKUP ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16 w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="bg-white/5 backdrop-blur-md border border-teal-500/15 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-teal-500/5 blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-indigo-500/5 blur-[60px] pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/8 pb-5 mb-6">
              <div>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">{t('Rehabilitation & Recovery Analytics', 'পুনর্বাসন ও পুনরুদ্ধার বিশ্লেষণ')}</span>
                <h3 className="text-2xl font-black text-white mt-1">{t('Patient Recovery Dashboard', 'রোগীর পুনরুদ্ধার ড্যাশবোর্ড')}</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                ● {t('Live Monitoring Active', 'লাইভ মনিটরিং সক্রিয়')}
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {mockDashboard.map((d, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <p className={`text-2xl font-black ${d.color}`}>{d.value}</p>
                  <p className="text-[10px] font-bold text-white/45 uppercase mt-1">{d.label}</p>
                </div>
              ))}
            </div>

            {/* Emergency Broadcast Log */}
            <div className="bg-black/30 border border-white/8 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">{t('Emergency Broadcast Log', 'জরুরি বার্তা সম্প্রচার লগ')}</h4>
              {[
                { to: t('Family (Son)', 'পরিবার (ছেলে)'), channel: 'WhatsApp', time: '10:48 AM', status: t('Delivered', 'প্রেরিত'), color: 'text-green-400 bg-green-500/10' },
                { to: t('Emergency Contact 2', 'জরুরী যোগাযোগ ২'), channel: 'WhatsApp', time: '10:48 AM', status: t('Delivered', 'প্রেরিত'), color: 'text-green-400 bg-green-500/10' },
                { to: t('SMS Gateway Broker', 'এসএমএস গেটওয়ে'), channel: 'SMS', time: 'queued', status: t('Coming Soon', 'শীঘ্রই আসছে'), color: 'text-yellow-400 bg-yellow-500/10' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <span className="text-white/70">{t('Recipient:', 'প্রাপক:')} {log.to}</span>
                  <span className="text-teal-400 font-mono">{log.channel} {log.time}</span>
                  <span className={`${log.color} px-2 py-0.5 rounded font-bold uppercase text-[9px]`}>{log.status}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── WHATSAPP DEMO SECTION ───────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-16 w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="bg-white/5 backdrop-blur-md border border-green-500/15 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-green-500/5 blur-[40px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                <MessageCircle size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{t('Try WhatsApp Alert Demo', 'হোয়াটসঅ্যাপ অ্যালার্ট ডেমো')}</h3>
                <p className="text-xs text-white/45">{t('Send a sample health report to any WhatsApp number now', 'এখনই যেকোনো হোয়াটসঅ্যাপ নম্বরে একটি স্বাস্থ্য রিপোর্ট পাঠান')}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Country code */}
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full sm:w-28 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-green-400 transition-all"
              >
                <option value="+880">🇧🇩 +880</option>
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+60">🇲🇾 +60</option>
                <option value="+65">🇸🇬 +65</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+81">🇯🇵 +81</option>
              </select>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                placeholder={t('Enter phone number', 'ফোন নম্বর লিখুন')}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-green-400 transition-all"
              />
            </div>

            <button
              onClick={handleWhatsAppDemo}
              disabled={!whatsappNumber || whatsappNumber.length < 6}
              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-green-500/20 cursor-pointer text-sm"
            >
              <Send size={16} />
              {t('Send Demo Health Report via WhatsApp', 'হোয়াটসঅ্যাপে ডেমো হেলথ রিপোর্ট পাঠান')}
            </button>

            <AnimatePresence>
              {demoSent && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 text-green-400 text-sm font-bold">
                  <CheckCircle size={16} />
                  {t('WhatsApp opened! Message pre-filled and ready to send.', 'হোয়াটসঅ্যাপ খোলা হয়েছে! বার্তা প্রস্তুত।')}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-[10px] text-white/30 mt-4 leading-relaxed">
              {t(
                '💡 This opens WhatsApp Web/App with a pre-filled message. In the full platform, reports auto-dispatch to saved emergency contacts without manual steps.',
                '💡 এটি একটি প্রি-ফিল্ড মেসেজ সহ হোয়াটসঅ্যাপ ওয়েব/অ্যাপ খোলে। পূর্ণ প্ল্যাটফর্মে, সেভ করা জরুরি নম্বরে রিপোর্ট স্বয়ংক্রিয়ভাবে পাঠানো হয়।'
              )}
            </p>
          </div>
        </motion.div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16 w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="bg-gradient-to-br from-teal-500/10 via-transparent to-indigo-500/5 backdrop-blur-md border border-teal-500/15 rounded-[2.5rem] p-12 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-purple-500/5 pointer-events-none" />
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-4 relative z-10">
              {t('Take Control of Your Health Today', 'আজই আপনার স্বাস্থ্যের নিয়ন্ত্রণ নিন')}
            </h3>
            <p className="text-sm text-white/50 mb-8 max-w-lg mx-auto leading-relaxed relative z-10">
              {t(
                'Privacy-first local processing. Bangla and English bilingual support. Zero gym equipment needed. Automatic family safety alerts.',
                'গোপনীয়তা-প্রথম লোকাল প্রসেসিং। বাংলা ও ইংরেজি দ্বিভাষিক সাপোর্ট। জিমের সরঞ্জাম লাগবে না। স্বয়ংক্রিয় পারিবারিক নিরাপত্তা বার্তা।'
              )}
            </p>
            <div className="flex gap-4 justify-center flex-wrap relative z-10">
              <button
                onClick={() => navigate('/auth/signup')}
                className="px-10 py-4 rounded-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-400 text-teal-950 text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/20 cursor-pointer flex items-center gap-2"
              >
                {t('Get Started Free', 'বিনামূল্যে শুরু করুন')} <ArrowRight size={18} />
              </button>
              <button
                onClick={toggleLanguage}
                className="px-8 py-4 rounded-2xl font-bold text-white border border-white/15 hover:border-teal-500/40 hover:bg-white/5 active:scale-95 transition-all cursor-pointer text-sm flex items-center gap-2"
              >
                <Globe size={16} />
                {language === 'en' ? 'বাংলায় দেখুন' : 'View in English'}
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 mt-8 relative z-10 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/35 text-xs font-mono">
          <p>
            {t(
              '© 2026 LifeSync AI. All rights reserved. | AI-Powered Digital Health Companion | Privacy First',
              '© ২০২৬ লাইফসিঙ্ক এআই। সর্বস্বত্ব সংরক্ষিত। | এআই চালিত ডিজিটাল হেলথ পার্টনার | গোপনীয়তা প্রথম'
            )}
          </p>
        </div>
      </footer>

      {/* ─── CSS Keyframes ───────────────────────────────────────────────── */}
      <style>{`
        @keyframes particle-float {
          0% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          100% { transform: translate(${Math.random() > 0.5 ? '' : '-'}20px, -30px) scale(1.3); opacity: 0.7; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
