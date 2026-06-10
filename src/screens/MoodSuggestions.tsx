import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Brain, Play, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/src/contexts/ThemeContext';

import { apiService } from '@/src/services/api';

type MoodType = 'Happy' | 'Sad' | 'Neutral' | 'Astonished';

interface MoodConfig {
  emoji: string;
  color: string;
  youtubeQuery: string;
  videoIds: string[];
}

const MOOD_CONFIG: Record<MoodType, MoodConfig> = {
  Happy: {
    emoji: '😊',
    color: 'from-yellow-500/20 to-amber-500/20 border-yellow-400/30',
    youtubeQuery: 'upbeat motivation happiness',
    videoIds: ['ZbZSe6N_BXs', 'kXYiU_JCYtU', 'u1GEYyLTFHk'],
  },
  Sad: {
    emoji: '😢',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-400/30',
    youtubeQuery: 'healing sadness comfort music',
    videoIds: ['iodm_iO6dM8', 'QKKZ9AGYTi4', '6ZfuNTqbHE8'],
  },
  Neutral: {
    emoji: '😐',
    color: 'from-teal-500/20 to-cyan-500/20 border-teal-400/30',
    youtubeQuery: 'mindfulness calm productivity',
    videoIds: ['inpok4MKVLM', 'O-6f5wQXSu8', '1ZYbU82GVz4'],
  },
  Astonished: {
    emoji: '😲',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-400/30',
    youtubeQuery: 'amazing facts wonder curiosity',
    videoIds: ['d-diB65scQU', 'vOGhZkO2mKg', 'Ks-_Mh1QhMc'],
  },
};

async function getAISuggestion(mood: MoodType): Promise<string> {
  const prompt = `You are a wellness AI assistant. The user's detected mood is "${mood}". 
Give them a short, warm, actionable 3-step wellness plan in plain text. 
Format: numbered list 1. 2. 3. each max 1 sentence. Be empathetic and practical.`;

  try {
    const res = await apiService.chat(prompt);
    if (res.success && res.data?.text) {
      return res.data.text.trim();
    }
    throw new Error(res.message || 'Failed to get AI response');
  } catch (err) {
    console.error('AI suggestion error:', err);
    return '';
  }
}

const FALLBACK_SUGGESTIONS: Record<MoodType, string[]> = {
  Happy: [
    'Channel your positive energy into a creative project or hobby you love.',
    'Share your good mood — reach out to a friend or family member.',
    'Capture the moment: journal what made you feel great today.',
  ],
  Sad: [
    'Take a short, gentle walk outside — even 10 minutes shifts your mood.',
    'Brew a warm drink and listen to music that comforts you.',
    'Reach out to someone you trust; connection is healing.',
  ],
  Neutral: [
    'Set a small, achievable goal for today to build momentum.',
    'Practice 5 minutes of mindful breathing to stay centred.',
    'Try something new — novelty sparks energy and curiosity.',
  ],
  Astonished: [
    'Write down what surprised you — it helps process the experience.',
    'Channel your curiosity into learning something related.',
    'Take a few deep breaths to ground yourself before acting.',
  ],
};

export default function MoodSuggestions() {
  const navigate = useNavigate();
  const { config } = useTheme();
  const mood = (config.mood || 'Neutral') as MoodType;
  const moodCfg = MOOD_CONFIG[mood] ?? MOOD_CONFIG.Neutral;

  const [aiText, setAiText] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const loadAI = async () => {
    setAiLoading(true);
    setAiError(null);
    setUsedFallback(false);
    const text = await getAISuggestion(mood);
    setAiLoading(false);
    if (text) {
      setAiText(text);
    } else {
      // fallback
      setUsedFallback(true);
      setAiText(FALLBACK_SUGGESTIONS[mood].map((s, i) => `${i + 1}. ${s}`).join('\n'));
      setAiError('AI unavailable — showing built-in suggestions.');
    }
  };

  useEffect(() => {
    loadAI();
  }, [mood]);

  const formatAiText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      return (
        <li key={i} className="flex gap-3 items-start">
          <span className="font-black text-teal-400 mt-0.5 shrink-0">{i + 1}.</span>
          <span className="text-white/80 leading-relaxed">{trimmed.replace(/^\d+\.\s*/, '')}</span>
        </li>
      );
    }).filter(Boolean);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <Sparkles size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Mood Suggestions</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Current mood banner */}
      <section className={`glass-card border bg-gradient-to-br ${moodCfg.color}`}>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{moodCfg.emoji}</span>
          <div>
            <p className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1">Detected Mood</p>
            <h2 className="text-2xl font-black">{mood}</h2>
            <p className="text-sm text-white/60 mt-1">
              Personalized AI wellness plan powered by OpenRouter · Face detection feeds mood automatically
            </p>
          </div>
        </div>
      </section>

      {/* AI Guidance */}
      <section className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-teal-400">
            <Brain size={20} />
            <h3 className="font-bold">AI Wellness Plan</h3>
            {!usedFallback && !aiLoading && (
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold uppercase">OpenRouter AI</span>
            )}
          </div>
          <button
            onClick={loadAI}
            disabled={aiLoading}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all disabled:opacity-40"
            title="Regenerate"
          >
            <RefreshCw size={14} className={aiLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {aiLoading ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2 size={20} className="animate-spin text-teal-400" />
            <p className="text-sm text-white/60">Generating AI wellness plan for your {mood} mood…</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={aiText}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {aiError && (
                <p className="text-xs text-amber-400 mb-3 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-400/20">
                  ⚠️ {aiError}
                </p>
              )}
              <ul className="space-y-3 text-sm">
                {formatAiText(aiText)}
              </ul>
              {aiText && (
                <p className="mt-5 italic text-xs text-white/40">Remember: this feeling is temporary, and you are capable of great things.</p>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* YouTube therapy videos */}
      <section>
        <h3 className="text-lg font-bold mb-4 px-2">🎬 YouTube Therapy Videos</h3>
        <div className="flex flex-col gap-5">
          {moodCfg.videoIds.map((videoId, i) => (
            <div key={videoId} className="flex flex-col gap-2">
              <div className="glass-card !p-0 aspect-video overflow-hidden rounded-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                  title={`Mood video ${i + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  style={{ border: 'none' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
