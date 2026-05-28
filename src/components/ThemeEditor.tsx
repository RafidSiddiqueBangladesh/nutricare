import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Sun, Palette, CheckCircle } from 'lucide-react';
import { useTheme } from '@/src/contexts/ThemeContext';
import { cn } from '@/src/lib/utils';

const MOOD_EMOJIS: Record<string, string> = {
  Happy: '😊',
  Sad: '😢',
  Neutral: '😐',
  Astonished: '😲',
};

const PRESET_COLORS: Record<string, string> = {
  Aurora: 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500',
  Sunset: 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500',
  Ocean: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500',
  Daylight: 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300',
};

export function ThemeEditor({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { config, setMood, setPreset, setPrimaryHue, setAccentHue, setOrbHue, toggleDarkMode, randomizeBackground } = useTheme();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md glass-card !p-8 shadow-[0_0_50px_-12px_rgba(45,212,191,0.3)] overflow-y-auto max-h-[90vh]"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">Theme & Colors</h2>
            <div className="flex items-center gap-2">
              <div className="bg-white/5 border border-white/10 rounded-full p-1 flex">
                <button 
                  onClick={() => !config.isDark && toggleDarkMode()}
                  className={cn("px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1", config.isDark ? "bg-[#002b2b] text-teal-400 shadow-lg" : "text-white/40")}
                >
                  <Moon size={14} /> Dark
                </button>
                <button 
                   onClick={() => config.isDark && toggleDarkMode()}
                  className={cn("px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1", !config.isDark ? "bg-[#002b2b] text-teal-400 shadow-lg" : "text-white/40")}
                >
                  <Sun size={14} /> Light
                </button>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Mood Selector */}
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-3">😊 Mood Theme</p>
              <div className="flex gap-2 flex-wrap">
                {['Happy', 'Sad', 'Neutral', 'Astonished'].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setMood(mood as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2",
                      config.mood === mood 
                        ? "shadow-lg" 
                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                    )}
                    style={config.mood === mood ? {
                      backgroundColor: `hsl(var(--primary-hue), 30%, 20%)`,
                      borderColor: `hsl(var(--primary-hue), 70%, 50%)`,
                      color: `hsl(var(--primary-hue), 90%, 65%)`,
                      boxShadow: `0 0 20px hsl(var(--primary-hue), 70%, 50% / 0.2)`
                    } : undefined}
                  >
                    <span className="text-lg">{MOOD_EMOJIS[mood]}</span>
                    {mood}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-white/40 mt-2 italic px-1">Currently: {config.mood}</p>
            </div>

            {/* Presets */}
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-3">🎨 Color Presets</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PRESET_COLORS).map(([preset, gradientClass]) => (
                  <button
                    key={preset}
                    onClick={() => setPreset(preset as any)}
                    className={cn(
                      "py-3 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center justify-center gap-1.5",
                      config.preset === preset 
                        ? "shadow-lg" 
                        : "border-white/10 hover:border-white/20"
                    )}
                    style={config.preset === preset ? {
                      borderColor: `hsl(var(--primary-hue), 70%, 50%)`,
                      boxShadow: `0 0 20px hsl(var(--primary-hue), 70%, 50% / 0.2)`
                    } : undefined}
                  >
                    <div className={cn("w-8 h-8 rounded-lg", gradientClass)} />
                    <span className="text-white/80">{preset}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hue Sliders */}
            <div className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-[10px] uppercase font-black tracking-widest text-white/40">🎯 Hue Controls</p>
              <HueSlider label="Primary Color" value={config.primaryHue} onChange={setPrimaryHue} />
              <HueSlider label="Accent Color" value={config.accentHue} onChange={setAccentHue} />
              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-3">✨ Orb Glow Colors</p>
                <div className="space-y-3">
                  {config.orbs.map((orb, i) => (
                    <HueSlider key={i} label={`Orb ${i + 1}`} value={orb} onChange={(val) => setOrbHue(i, val)} />
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={randomizeBackground}
              className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all text-slate-950"
              style={{
                background: `linear-gradient(135deg, hsl(var(--primary-hue), 70%, 50%), hsl(var(--accent-hue), 70%, 50%))`,
                boxShadow: `0 0 30px hsl(var(--primary-hue), 70%, 50% / 0.3)`
              }}
            >
              <Palette size={18} />
              🎲 Randomize All Colors
            </button>

            <button 
              onClick={onClose}
              className="w-full py-3 bg-white/5 rounded-2xl font-black text-sm border-2 flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              style={{
                color: `hsl(var(--primary-hue), 90%, 65%)`,
                borderColor: `hsl(var(--primary-hue), 70%, 50%)`
              }}
            >
              <CheckCircle size={18} />
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function HueSlider({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <p className="text-[10px] uppercase font-black tracking-widest text-white/40">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${value}, 100%, 50%)` }} />
          <span className="text-xs font-bold text-white/60">{value}°</span>
        </div>
      </div>
      <input 
        type="range" 
        min="0" 
        max="360" 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-teal-400"
        style={{
          background: `linear-gradient(to right, 
            hsl(0, 100%, 50%), 
            hsl(60, 100%, 50%), 
            hsl(120, 100%, 50%), 
            hsl(180, 100%, 50%), 
            hsl(240, 100%, 50%), 
            hsl(300, 100%, 50%),
            hsl(360, 100%, 50%))`
        }}
      />
    </div>
  );
}
