import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Brain, Video, Play, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '@/src/contexts/ThemeContext';

const VIDEOS = [
  { 
    title: 'How To Change Your Brain with Positive Thinking',
    channel: 'The Mindset Mentor Podcast',
    thumbnail: 'https://img.youtube.com/vi/iodm_iO6dM8/0.jpg' // Generic placeholders
  },
  {
    title: 'THE POWER OF POSITIVITY - Best Motivational Video',
    channel: 'Motivation2Study',
    thumbnail: 'https://img.youtube.com/vi/QKKZ9AGYTi4/0.jpg'
  }
];

export default function MoodSuggestions() {
  const navigate = useNavigate();
  const { config } = useTheme();

  return (
    <div className="flex flex-col gap-6">
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

      <section className="glass-card">
        <h3 className="text-lg font-bold mb-2">Mood: {config.mood}</h3>
        <p className="text-sm text-white/60">
          Personalized AI support and YouTube therapy suggestions based on your latest mood and palette.
        </p>
      </section>

      <section className="glass-card">
        <div className="flex items-center gap-2 mb-4 text-teal-400">
           <Brain size={20} />
           <h3 className="font-bold">AI Guidance</h3>
        </div>
        <div className="text-sm text-white/80 leading-relaxed">
           <p className="mb-4">I'm sorry you're feeling {config.mood.toLowerCase()}. Let's try to gently shift that:</p>
           <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="font-black text-teal-400">1.</span>
                <span>**Gentle Movement:** Go for a short, slow walk outside.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-teal-400">2.</span>
                <span>**Comforting Drink:** Sip a warm cup of herbal tea.</span>
              </li>
           </ul>
           <p className="mt-6 italic opacity-60">Remember, this feeling will pass, and you are strong.</p>
        </div>
      </section>

      <section className="pb-12">
        <h3 className="text-lg font-bold mb-4 px-2">YouTube Therapy Videos</h3>
        <div className="flex flex-col gap-6">
          {VIDEOS.map((vid, i) => (
            <div key={i} className="flex flex-col gap-2">
              <h4 className="font-bold text-sm px-2">{vid.title}</h4>
              <p className="text-[10px] text-white/40 px-2 mt-[-4px] mb-1">{vid.channel}</p>
              <div className="glass-card !p-0 aspect-video overflow-hidden group">
                <div className="relative h-full">
                  <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play size={40} className="text-white" fill="white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
