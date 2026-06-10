import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Brain, Activity, Heart, Eye, Smile, Move,
  Baby, Palette, MessageCircle, Shield, Zap, BarChart3,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import ParticleField from "@/components/ParticleField";
import heroBrain from "@/assets/hero-brain.png";
import aiAvatar from "@/assets/ai-avatar.png";

const features = [
  { icon: Brain, title: "Emotion Detection", desc: "Real-time facial emotion analysis using AI", color: "text-glow-cyan", link: "/ai-detection" },
  { icon: Eye, title: "Eye Tracking", desc: "Monitor eye fatigue and attention patterns", color: "text-glow-purple" },
  { icon: Heart, title: "Meditation Guide", desc: "AI-guided breathing and relaxation therapy", color: "text-glow-pink", link: "/meditation" },
  { icon: Smile, title: "Laughter Therapy", desc: "Track laughter intensity for heart health", color: "text-glow-amber" },
  { icon: Move, title: "Exercise Therapy", desc: "Body movement detection and scoring", color: "text-glow-green" },
  { icon: Activity, title: "Stress Detection", desc: "Detect facial stress patterns in real-time", color: "text-glow-cyan" },
  { icon: Baby, title: "Children Health", desc: "Monitor emotional changes in children", color: "text-glow-purple" },
  { icon: Palette, title: "Color Blindness Test", desc: "Interactive color vision assessment", color: "text-glow-pink" },
  { icon: MessageCircle, title: "AI Chatbot", desc: "Medical assistant powered by AI", color: "text-glow-amber" },
  { icon: Shield, title: "Privacy First", desc: "Encrypted data with patient consent", color: "text-glow-green" },
  { icon: BarChart3, title: "Analytics", desc: "Comprehensive health dashboards", color: "text-glow-cyan", link: "/dashboard" },
  { icon: Zap, title: "Real-Time", desc: "WebRTC powered live monitoring", color: "text-glow-purple" },
];

const stats = [
  { value: "99.2%", label: "Detection Accuracy" },
  { value: "< 50ms", label: "Response Time" },
  { value: "12+", label: "AI Models" },
  { value: "24/7", label: "Monitoring" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <ParticleField />
        
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
        
        <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-mono text-primary mb-6">
                <span className="w-2 h-2 rounded-full bg-glow-green animate-pulse" />
                AI-POWERED HEALTH PLATFORM v2.0
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
                <span className="text-foreground">AI SMART</span>
                <br />
                <span className="text-gradient-primary">HEALTH CARE</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl mb-8 font-body leading-relaxed">
                Real-time emotion detection, mental health monitoring, and AI-guided therapy — 
                all from your browser camera. The future of digital healthcare is here.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/ai-detection">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm font-semibold tracking-wider glow-cyan"
                  >
                    START SCAN
                  </motion.button>
                </Link>
                <Link to="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-lg glass text-foreground font-display text-sm font-semibold tracking-wider border border-border hover:border-primary/50 transition-colors"
                  >
                    VIEW DASHBOARD
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative flex justify-center"
            >
              <div className="relative w-80 h-80 lg:w-[420px] lg:h-[420px]">
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-[60px] animate-pulse-glow" />
                <img
                  src={heroBrain}
                  alt="AI Health Brain Visualization"
                  className="relative z-10 w-full h-full object-contain rounded-2xl"
                />
                {/* Orbiting ring */}
                <div className="absolute inset-[-20px] rounded-full border border-primary/20 animate-spin-slow" />
                <div className="absolute inset-[-40px] rounded-full border border-secondary/10 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "30s" }} />
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
          >
            {stats.map((stat, i) => (
              <GlassCard key={i} className="text-center py-6" hover={false}>
                <div className="text-2xl md:text-3xl font-display font-bold text-gradient-primary">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                  {stat.label}
                </div>
              </GlassCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Avatar Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative">
                <img src={aiAvatar} alt="AI Doctor Avatar" className="w-64 h-64 object-contain animate-float" />
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-[80px]" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Your <span className="text-gradient-primary">AI Therapist</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Our AI avatar doctor guides you through personalized therapy sessions including 
                meditation, breathing exercises, laughter therapy, and physical exercises — all while 
                monitoring your emotional state in real-time.
              </p>
              <div className="space-y-3">
                {["Real-time emotion tracking", "Personalized therapy plans", "Guided meditation & breathing", "Progress reports for doctors"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              PLATFORM <span className="text-gradient-primary">FEATURES</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive AI-powered health monitoring and therapy tools
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                {feature.link ? (
                  <Link to={feature.link}>
                    <FeatureCard feature={feature} />
                  </Link>
                ) : (
                  <FeatureCard feature={feature} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            © 2026 AI SMART HEALTH CARE — Powered by Advanced AI
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ feature }: { feature: typeof features[0] }) => (
  <GlassCard className="h-full">
    <feature.icon className={`w-8 h-8 ${feature.color} mb-3`} />
    <h3 className="font-display text-sm font-semibold text-foreground mb-1">
      {feature.title}
    </h3>
    <p className="text-xs text-muted-foreground">{feature.desc}</p>
  </GlassCard>
);

export default Index;
