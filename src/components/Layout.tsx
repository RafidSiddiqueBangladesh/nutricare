import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Utensils, 
  Dumbbell, 
  ShieldAlert, 
  ChefHat, 
  Wallet,
  ChevronDown,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ThemeEditor } from './ThemeEditor';

const NAV_ITEMS = [
  { path: '/nutrition', icon: Utensils, label: 'Nutrition' },
  { path: '/exercises', icon: Dumbbell, label: 'Exercise' },
  { path: '/health', icon: ShieldAlert, label: 'Health' },
  { path: '/cooking', icon: ChefHat, label: 'Cooking' },
  { path: '/costs', icon: Wallet, label: 'Cost' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { config } = useTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Theme Editor */}
      <ThemeEditor isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />

      {/* Dynamic Background Orbs */}
      <div className="fixed inset-0 z-0">
        <div 
          className="orb w-[500px] h-[500px] -top-20 -left-20" 
          style={{ background: `hsl(${config.orbs[0]}, 60%, 40%)` }} 
        />
        <div 
          className="orb w-[400px] h-[400px] top-1/4 -right-10" 
          style={{ background: `hsl(${config.orbs[1]}, 50%, 35%)` }} 
        />
        <div 
          className="orb w-[600px] h-[600px] -bottom-40 left-1/3" 
          style={{ background: `hsl(${config.orbs[2]}, 55%, 30%)` }} 
        />
        <div 
          className="orb w-[300px] h-[300px] top-1/2 left-0" 
          style={{ background: `hsl(${config.orbs[3]}, 45%, 40%)` }} 
        />
        <div 
          className="orb w-[350px] h-[350px] bottom-0 right-0" 
          style={{ background: `hsl(${config.orbs[4]}, 50%, 25%)` }} 
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-6 flex justify-center sticky top-0 bg-transparent">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
          {NAV_ITEMS.find(item => location.pathname.startsWith(item.path))?.icon && (
            <div className="primary-color p-1 rounded-full text-slate-950">
              {React.createElement(NAV_ITEMS.find(item => location.pathname.startsWith(item.path))!.icon, { size: 16 })}
            </div>
          )}
          <span className="font-medium text-sm primary-text">
            {NAV_ITEMS.find(item => location.pathname.startsWith(item.path))?.label || 'LifeSync AI'}
          </span>
          <div className="w-1.5 h-1.5 rounded-full primary-color" />
        </div>
      </header>

      {/* Page Content */}
      <main className="relative z-10 container max-w-lg mx-auto px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Theme FAB */}
      <button 
        onClick={() => setIsThemeOpen(true)}
        className="fixed bottom-32 right-6 p-4 glass-card !rounded-full !p-3 primary-text primary-shadow hover:scale-110 active:scale-95 transition-all z-40"
        style={{ 
          background: `hsl(var(--primary-hue), 30%, 15%)`,
          borderColor: `hsl(var(--primary-hue), 70%, 50%)`
        }}
      >
        <Palette size={24} />
      </button>

      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="glass-card !p-2 flex items-center justify-around gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 flex-1",
                  isActive ? "scale-105" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
                style={isActive ? {
                  background: `hsl(var(--primary-hue), 30%, 20%)`,
                  color: `hsl(var(--primary-hue), 90%, 65%)`,
                } : undefined}
              >
                <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] uppercase tracking-wider font-bold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
