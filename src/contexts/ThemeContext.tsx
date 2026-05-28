import React, { createContext, useContext, useState, useEffect } from 'react';

type Mood = 'Happy' | 'Sad' | 'Neutral' | 'Astonished';
type Preset = 'Aurora' | 'Sunset' | 'Ocean' | 'Daylight';

interface ThemeConfig {
  mood: Mood;
  preset: Preset;
  primaryHue: number;
  accentHue: number;
  orbs: [number, number, number, number, number];
  isDark: boolean;
}

interface ThemeContextType {
  config: ThemeConfig;
  setMood: (mood: Mood) => void;
  setPreset: (preset: Preset) => void;
  setPrimaryHue: (hue: number) => void;
  setAccentHue: (hue: number) => void;
  setOrbHue: (index: number, hue: number) => void;
  toggleDarkMode: () => void;
  randomizeBackground: () => void;
}

// Preset color schemes
const PRESET_SCHEMES: Record<Preset, { primaryHue: number; accentHue: number; orbs: [number, number, number, number, number] }> = {
  Aurora: { primaryHue: 200, accentHue: 280, orbs: [200, 220, 280, 300, 160] },
  Sunset: { primaryHue: 20, accentHue: 40, orbs: [20, 40, 60, 280, 340] },
  Ocean: { primaryHue: 190, accentHue: 210, orbs: [190, 210, 230, 250, 170] },
  Daylight: { primaryHue: 50, accentHue: 100, orbs: [50, 100, 150, 200, 30] },
};

// Mood-based hue offsets
const MOOD_HUES: Record<Mood, { primaryOffset: number; accentOffset: number }> = {
  Happy: { primaryOffset: 0, accentOffset: 0 },
  Sad: { primaryOffset: 240, accentOffset: 250 },
  Neutral: { primaryOffset: 200, accentOffset: 220 },
  Astonished: { primaryOffset: 280, accentOffset: 300 },
};

const DEFAULT_THEME: ThemeConfig = {
  mood: 'Neutral',
  preset: 'Aurora',
  primaryHue: 200,
  accentHue: 280,
  orbs: [200, 220, 280, 300, 160],
  isDark: true,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Apply theme CSS variables
function applyTheme(config: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty('--primary-hue', config.primaryHue.toString());
  root.style.setProperty('--accent-hue', config.accentHue.toString());
  root.style.setProperty('--orb-1', config.orbs[0].toString());
  root.style.setProperty('--orb-2', config.orbs[1].toString());
  root.style.setProperty('--orb-3', config.orbs[2].toString());
  root.style.setProperty('--orb-4', config.orbs[3].toString());
  root.style.setProperty('--orb-5', config.orbs[4].toString());
  root.style.setProperty('--is-dark', config.isDark ? '1' : '0');
  
  // Update CSS classes for background
  if (config.isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('themeConfig');
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  // Apply theme whenever config changes
  useEffect(() => {
    applyTheme(config);
    localStorage.setItem('themeConfig', JSON.stringify(config));
  }, [config]);

  const setMood = (mood: Mood) => {
    setConfig(prev => {
      const moodHue = MOOD_HUES[mood];
      return {
        ...prev,
        mood,
        primaryHue: (moodHue.primaryOffset + (prev.preset === 'Aurora' ? 0 : 30)) % 360,
        accentHue: (moodHue.accentOffset + (prev.preset === 'Aurora' ? 0 : 30)) % 360,
      };
    });
  };

  const setPreset = (preset: Preset) => {
    const scheme = PRESET_SCHEMES[preset];
    setConfig(prev => ({ 
      ...prev, 
      preset,
      primaryHue: scheme.primaryHue,
      accentHue: scheme.accentHue,
      orbs: scheme.orbs,
    }));
  };

  const setPrimaryHue = (hue: number) => setConfig(prev => ({ ...prev, primaryHue: hue }));
  const setAccentHue = (hue: number) => setConfig(prev => ({ ...prev, accentHue: hue }));
  
  const setOrbHue = (index: number, hue: number) => {
    setConfig(prev => {
      const newOrbs = [...prev.orbs] as [number, number, number, number, number];
      newOrbs[index] = hue;
      return { ...prev, orbs: newOrbs };
    });
  };
  
  const toggleDarkMode = () => setConfig(prev => ({ ...prev, isDark: !prev.isDark }));
  
  const randomizeBackground = () => {
    setConfig(prev => ({
      ...prev,
      orbs: Array.from({ length: 5 }, () => Math.floor(Math.random() * 360)) as [number, number, number, number, number],
    }));
  };

  return (
    <ThemeContext.Provider value={{
      config,
      setMood,
      setPreset,
      setPrimaryHue,
      setAccentHue,
      setOrbHue,
      toggleDarkMode,
      randomizeBackground,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
