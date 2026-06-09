import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Utensils, 
  Dumbbell, 
  ShieldAlert, 
  Activity,
  ChefHat, 
  Wallet,
  ChevronDown,
  Palette,
  LogOut,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { ThemeEditor } from './ThemeEditor';

const NAV_ITEMS = [
  { path: '/nutrition', icon: Utensils, label: 'Nutrition', matchPrefixes: ['/nutrition'] },
  { path: '/exercises', icon: Dumbbell, label: 'Exercise', matchPrefixes: ['/exercises'] },
  { path: '/health', icon: ShieldAlert, label: 'Health', matchPrefixes: ['/health'], excludePrefixes: ['/health/tracking', '/health/monitor'] },
  { path: '/profile', icon: User, label: 'Profile', matchPrefixes: ['/profile'] },
  { path: '/health/tracking', icon: Activity, label: 'Live', matchPrefixes: ['/health/tracking', '/health/monitor'] },
  { path: '/cooking', icon: ChefHat, label: 'Cooking', matchPrefixes: ['/cooking'] },
  { path: '/costs', icon: Wallet, label: 'Cost', matchPrefixes: ['/costs'] },
];

const isActiveNavItem = (
  pathname: string,
  item: {
    path: string;
    matchPrefixes?: string[];
    excludePrefixes?: string[];
  }
) => {
  const include = item.matchPrefixes && item.matchPrefixes.length > 0
    ? item.matchPrefixes
    : [item.path];
  const exclude = item.excludePrefixes || [];

  const matched = include.some((prefix) => pathname.startsWith(prefix));
  const excluded = exclude.some((prefix) => pathname.startsWith(prefix));
  return matched && !excluded;
};

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { config } = useTheme();
  const { user, signOut } = useAuth();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isImmersiveExerciseRoute =
    location.pathname.startsWith('/exercises/coach/') || location.pathname === '/exercises/live-editor';
  const activeNavItem = NAV_ITEMS.find((item) => isActiveNavItem(location.pathname, item));

  return (
    <div className={cn('relative min-h-screen overflow-hidden', isImmersiveExerciseRoute ? 'pb-4' : 'pb-24')}>
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

      <div className="relative z-10 mx-auto w-full max-w-[1800px] px-4 pt-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-transparent pb-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
            {activeNavItem?.icon && (
              <div className="primary-color p-1 rounded-full text-slate-950">
                {React.createElement(activeNavItem.icon, { size: 16 })}
              </div>
            )}
            <span className="font-medium text-sm primary-text">
              {activeNavItem?.label || 'LifeSync AI'}
            </span>
            <div className="w-1.5 h-1.5 rounded-full primary-color" />
          </div>

          {user && (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
              >
                <div className="w-6 h-6 rounded-full primary-color flex items-center justify-center text-xs font-bold text-black">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-bold text-white/80 max-w-[100px] truncate">{user.name}</span>
                <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-48 glass-card rounded-2xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-white/10">
                      <p className="text-xs text-white/60 uppercase tracking-wider font-bold">Account</p>
                      <p className="text-sm font-bold mt-1">{user.name}</p>
                      <p className="text-xs text-white/60">{user.email}</p>
                    </div>
                    <button
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await signOut();
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </header>

        <div className="xl:grid xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-8">
          {!isImmersiveExerciseRoute && (
            <aside className="hidden xl:flex xl:flex-col xl:gap-4">
              <div className="glass-card !p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="primary-color p-2 rounded-2xl text-slate-950">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/40 font-bold">LifeSync AI</p>
                    <h2 className="text-xl font-black">Control Center</h2>
                  </div>
                </div>

                <nav className="space-y-2">
                  {NAV_ITEMS.map((item) => {
                    const isActive = isActiveNavItem(location.pathname, item);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          'flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 border',
                          isActive
                            ? 'bg-white/15 border-white/20 text-white shadow-lg'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', isActive ? 'primary-color text-slate-950' : 'bg-white/10')}>
                          <Icon size={18} />
                        </span>
                        <span className="text-sm font-bold">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={() => setIsThemeOpen(true)}
                className="glass-card !p-4 primary-text primary-shadow hover:scale-[1.01] active:scale-[0.99] transition-all text-left"
                style={{
                  background: `hsl(var(--primary-hue), 30%, 15%)`,
                  borderColor: `hsl(var(--primary-hue), 70%, 50%)`
                }}
              >
                <div className="flex items-center gap-3">
                  <Palette size={20} />
                  <div>
                    <p className="text-sm font-bold">Theme Editor</p>
                    <p className="text-xs text-white/50">Adjust the desktop mood</p>
                  </div>
                </div>
              </button>
            </aside>
          )}

          <main className={cn('relative z-10 w-full pt-4 xl:pt-0', isImmersiveExerciseRoute ? 'xl:col-span-2' : '')}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Theme FAB */}
      {!isImmersiveExerciseRoute && (
        <>
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
          <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md xl:hidden">
            <div className="glass-card !p-1.5 grid grid-cols-7 gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = isActiveNavItem(location.pathname, item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-xl transition-all duration-300",
                      isActive ? "scale-[1.03]" : "text-white/60 hover:text-white/90"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="bottom-nav-active-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: `linear-gradient(180deg, hsla(var(--primary-hue), 75%, 62%, 0.28), hsla(var(--primary-hue), 75%, 42%, 0.20))`,
                          border: `1px solid hsla(var(--primary-hue), 85%, 68%, 0.45)`,
                          boxShadow: `0 6px 20px hsla(var(--primary-hue), 80%, 45%, 0.25), inset 0 1px 0 hsla(var(--primary-hue), 90%, 90%, 0.22)`,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 34, mass: 0.55 }}
                      />
                    )}

                    <span className="relative z-10">
                      <Icon
                        size={isActive ? 18 : 17}
                        strokeWidth={isActive ? 2.6 : 2.2}
                        color={isActive ? `hsl(var(--primary-hue), 92%, 72%)` : undefined}
                      />
                    </span>
                    <span className="relative z-10 text-[9px] leading-none uppercase tracking-wide font-bold">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
