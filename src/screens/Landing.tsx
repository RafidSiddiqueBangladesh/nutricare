import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Apple, Brain, Zap, ArrowRight, Users, Award, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: 'Health Monitoring',
      description: 'Track vital signs and get real-time health insights with AI analysis.',
    },
    {
      icon: Apple,
      title: 'Nutrition Tracking',
      description: 'Log meals with voice, photos, or OCR. Get personalized nutritional guidance.',
    },
    {
      icon: Activity,
      title: 'Exercise Coaching',
      description: 'Real-time form detection and AI coaching for over 50+ exercises.',
    },
    {
      icon: Brain,
      title: 'Mood Analysis',
      description: 'Monitor emotional health with face detection and mood tracking.',
    },
    {
      icon: Users,
      title: 'Doctor Consultation',
      description: 'Connect with doctors for video calls and professional medical advice.',
    },
    {
      icon: Zap,
      title: 'AI Diagnosis',
      description: 'Get preliminary health insights based on symptoms and vitals.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '500K+', label: 'Health Records' },
    { value: '50+', label: 'Exercises' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-2xl primary-color flex items-center justify-center">
              <Heart size={24} className="text-black" />
            </div>
            <h1 className="text-2xl font-black primary-text">Nutricare</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <button
              onClick={() => navigate('/auth/signin')}
              className="px-6 py-2.5 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth/signup')}
              className="px-6 py-2.5 rounded-xl font-bold primary-color text-black hover:opacity-90 transition-all shadow-lg"
              style={{ background: `hsl(var(--primary-hue), 70%, 50%)` }}
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center max-w-3xl"
        >
          <h2 className="text-6xl font-black mb-6 leading-tight">
            Your <span className="primary-text">Health & Fitness</span> Companion
          </h2>
          <p className="text-xl text-white/70 mb-8">
            AI-powered health monitoring, nutrition tracking, exercise coaching, and doctor consultation all in one app. Start your wellness journey today.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <button
              onClick={() => navigate('/auth/signup')}
              className="px-8 py-4 rounded-2xl font-bold text-black flex items-center gap-2 hover:scale-105 transition-all shadow-2xl"
              style={{ background: `hsl(var(--primary-hue), 70%, 50%)` }}
            >
              Get Started Free <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/auth/signin')}
              className="px-8 py-4 rounded-2xl font-bold border-2 hover:bg-white/10 transition-all flex items-center gap-2"
              style={{ borderColor: `hsl(var(--primary-hue), 70%, 50%)` }}
            >
              Sign In
            </button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-4 gap-4 w-full max-w-2xl mt-8"
        >
          {stats.map((stat, i) => (
            <div key={i} className="glass-card text-center p-4">
              <p className="text-2xl font-black primary-text">{stat.value}</p>
              <p className="text-xs text-white/60 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 w-full">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-4xl font-black mb-4">Powerful Features</h3>
          <p className="text-white/60 max-w-2xl mx-auto">
            Everything you need to maintain and improve your health in one comprehensive app.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card hover:scale-105 transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `hsl(var(--primary-hue), 30%, 20%)` }}
                >
                  <Icon size={24} className="primary-text" />
                </div>
                <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12 text-center rounded-3xl border-2"
          style={{ borderColor: `hsl(var(--primary-hue), 70%, 50% / 0.3)` }}
        >
          <h3 className="text-3xl font-black mb-4">Ready to Transform Your Health?</h3>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are taking control of their health and wellness journey.
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            className="px-10 py-4 rounded-2xl font-bold text-black text-lg hover:scale-105 transition-all shadow-2xl"
            style={{ background: `hsl(var(--primary-hue), 70%, 50%)` }}
          >
            Start Free Today
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/40 text-sm">
          <p>© 2026 Nutricare. All rights reserved. | AI-Powered Health Companion</p>
        </div>
      </footer>
    </div>
  );
}
