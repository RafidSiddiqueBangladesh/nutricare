import React, { useState, useCallback } from 'react';
import {
  ChefHat, Package, Tag, Calendar, List, Utensils, Trash2, Mic, Camera,
  Lightbulb, Youtube, Loader2, Search, ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { InventoryItem } from '@/src/types';
import { cn, formatCurrency, formatDate } from '@/src/lib/utils';
import { apiService } from '@/src/services/api';
import { useLanguage } from '@/src/contexts/LanguageContext';

interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
}

async function searchYouTubeRecipes(ingredients: string[]): Promise<YouTubeVideo[]> {
  if (!ingredients.length) return [];
  const query = `${ingredients.slice(0, 4).join(' ')} recipe cooking`;

  try {
    const res = await apiService.searchYouTubeVideos(query, 4);
    if (res.success && Array.isArray(res.data)) {
      return res.data.map((item: any) => ({
        id: item.videoId,
        title: item.title,
        channel: item.channelTitle || 'YouTube',
        thumbnail: item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`,
      }));
    }
  } catch (err) {
    console.error('YouTube API error:', err);
  }

  // Fallback: curated recipe video IDs when no API key
  const fallbackRecipes: Record<string, YouTubeVideo[]> = {
    default: [
      { id: 'HMjBMjGMtkg', title: '5 Easy Dinner Recipes for Busy Weeknights', channel: 'Joshua Weissman', thumbnail: 'https://img.youtube.com/vi/HMjBMjGMtkg/mqdefault.jpg' },
      { id: 'FS_MrYFrYgU', title: 'Simple Healthy Meals', channel: 'Pick Up Limes', thumbnail: 'https://img.youtube.com/vi/FS_MrYFrYgU/mqdefault.jpg' },
      { id: 'bHhMVJO8EiI', title: 'Pasta Recipe - Easy Quick Dinner', channel: 'Tasty', thumbnail: 'https://img.youtube.com/vi/bHhMVJO8EiI/mqdefault.jpg' },
      { id: 'Wmn4_Ga5wGk', title: 'One Pan Chicken & Rice', channel: 'Pro Home Cooks', thumbnail: 'https://img.youtube.com/vi/Wmn4_Ga5wGk/mqdefault.jpg' },
    ],
  };

  const lowerIngredients = ingredients.map(i => i.toLowerCase());
  if (lowerIngredients.some(i => i.includes('chicken')))
    return [fallbackRecipes.default[3], ...fallbackRecipes.default.slice(0, 3)];
  if (lowerIngredients.some(i => i.includes('pasta') || i.includes('noodle')))
    return [fallbackRecipes.default[2], ...fallbackRecipes.default.slice(0, 2)];

  return fallbackRecipes.default;
}

export default function Cooking() {
  const { t } = useLanguage();
  const [items, setItems] = useLocalStorage<InventoryItem[]>('inventory-items', []);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      name,
      price: parseFloat(price) || 0,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amountOption: unit,
      addedAt: Date.now(),
    };

    setItems([newItem, ...items]);
    setName('');
    setPrice('');
  };

  const fetchRecipes = useCallback(async () => {
    if (!items.length) return;
    setVideosLoading(true);
    setVideosError(null);
    setHasSearched(true);
    try {
      const results = await searchYouTubeRecipes(items.map(i => i.name));
      if (results.length === 0) {
        setVideosError(t('No videos found. Try adding more ingredients.', 'কোনো ভিডিও পাওয়া যায়নি। আরও উপকরণ যোগ করুন।'));
      }
      setVideos(results);
    } catch (err) {
      setVideosError(t('Failed to fetch recipe ideas. Please try again.', 'রেসিপি আইডিয়া আনতে ব্যর্থ। আবার চেষ্টা করুন।'));
    } finally {
      setVideosLoading(false);
    }
  }, [items, t]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Badge */}
      <div className="flex justify-center">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 flex items-center gap-2 text-orange-400">
          <ChefHat size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">{t('Cooking Assistant', 'রান্না সহকারী')}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
        </div>
      </div>

      <h1 className="text-2xl font-black px-2">{t("What's in your kitchen?", 'আপনার রান্নাঘরে কী আছে?')}</h1>

      {/* Inventory Entry Card */}
      <section className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <ChefHat size={18} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">{t('Inventory Entry', 'ইনভেন্টরি এন্ট্রি')}</h2>
        </div>
        <form onSubmit={addItem} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder={t('Enter ingredient…', 'উপকরণের নাম লিখুন…')}
                className="glass-input w-full"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Mic size={16} className="text-white/30" />
                <Camera size={16} className="text-white/30" />
              </div>
            </div>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-sm hover:from-orange-400 hover:to-amber-400 active:scale-95 transition-all shadow-lg shadow-orange-500/15">
              {t('Add', 'যোগ')}
            </button>
          </div>
          
          {/* Price Input */}
          <div className="relative">
            <label className="floating-label">{t('Price (৳)', 'মূল্য (৳)')}</label>
            <input 
              type="number" 
              placeholder={t('Price', 'মূল্য')}
              className="glass-input w-full"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>
          
          {/* Unit Select — FIXED: Default is Kg, proper styling */}
          <div className="relative">
            <label className="floating-label">{t('Unit', 'একক')}</label>
            <select 
              className="glass-input w-full" 
              value={unit} 
              onChange={e => setUnit(e.target.value)}
            >
              <option value="Kg">{t('Kg (Kilogram)', 'কেজি (কিলোগ্রাম)')}</option>
              <option value="Piece">{t('Piece', 'পিস')}</option>
              <option value="Litre">{t('Litre', 'লিটার')}</option>
              <option value="Pack">{t('Pack', 'প্যাক')}</option>
              <option value="Dozen">{t('Dozen', 'ডজন')}</option>
              <option value="500g">{t('500g', '৫০০ গ্রাম')}</option>
            </select>
          </div>

          <div className="glass-input flex items-center justify-between text-white/40 text-sm">
            <span>{t('Auto-expiry: Meat/Fish 3mo, Veg 1mo', 'স্বয়ংক্রিয় মেয়াদ: মাংস/মাছ ৩ মাস, সবজি ১ মাস')}</span>
            <Calendar size={16} />
          </div>

          <button
            type="button"
            onClick={fetchRecipes}
            disabled={!items.length || videosLoading}
            className="w-full py-3.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 disabled:opacity-40 text-red-400 rounded-2xl font-bold text-sm border border-red-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {videosLoading ? (
              <><Loader2 size={16} className="animate-spin" /> {t('Finding Recipe Ideas…', 'রেসিপি আইডিয়া খোঁজা হচ্ছে…')}</>
            ) : (
              <><Youtube size={16} /> {t('Get Cooking Ideas from YouTube', 'ইউটিউব থেকে রান্নার আইডিয়া পান')}</>
            )}
          </button>
        </form>
      </section>

      {/* Summary Card */}
      <section className="glass-card flex items-center gap-4 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-orange-500/20">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <ChefHat size={26} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">{t('Inventory Summary', 'ইনভেন্টরি সারসংক্ষেপ')}</p>
          <h3 className="text-2xl font-black">{items.length} {t(items.length !== 1 ? 'items in kitchen' : 'item in kitchen', items.length !== 1 ? 'টি উপকরণ রান্নাঘরে' : 'টি উপকরণ রান্নাঘরে')}</h3>
        </div>
      </section>

      {/* Smart tip */}
      <section>
        <h2 className="text-xl font-bold mb-4 px-2">{t('Smart Suggestions', 'স্মার্ট পরামর্শ')}</h2>
        <div className="glass-card flex items-start gap-4">
          <div className="bg-yellow-500/15 p-2.5 rounded-xl text-yellow-400 shrink-0">
            <Lightbulb size={22} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold mb-1">{t('Tip:', 'টিপস:')}</p>
            <p className="text-sm text-white/70">
              {items.length > 0
                ? t(
                    `With ${items.map(i => i.name).slice(0, 3).join(', ')}${items.length > 3 ? ` and ${items.length - 3} more` : ''}, click "Get Cooking Ideas" to find YouTube recipe videos!`,
                    `${items.map(i => i.name).slice(0, 3).join(', ')}${items.length > 3 ? ` এবং আরো ${items.length - 3}টি` : ''} দিয়ে রেসিপি ভিডিও পেতে "ইউটিউব থেকে রান্নার আইডিয়া পান" বাটনে ক্লিক করুন!`
                  )
                : t(
                    'Add inventory items above to get smart cooking suggestions and YouTube recipe videos.',
                    'স্মার্ট রান্নার পরামর্শ ও ইউটিউব রেসিপি ভিডিও পেতে উপরে উপকরণ যোগ করুন।'
                  )}
            </p>
          </div>
        </div>
      </section>

      {/* YouTube Recipe Videos */}
      <AnimatePresence>
        {(hasSearched || videos.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-4"
          >
            <h2 className="text-xl font-bold mb-4 px-2 flex items-center gap-2">
              <Youtube size={20} className="text-red-400" />
              {t('Recipe Ideas', 'রেসিপি আইডিয়া')}
            </h2>

            {videosError && (
              <div className="glass-card text-center py-4 text-amber-400 text-sm">
                ⚠️ {videosError}
              </div>
            )}

            <div className="flex flex-col gap-5">
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between px-2">
                    <div>
                      <h4 className="font-bold text-sm leading-tight line-clamp-2">{video.title}</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">{video.channel}</p>
                    </div>
                    <a
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-1.5 text-white/40 hover:text-white transition-all"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <div className="glass-card !p-0 aspect-video overflow-hidden rounded-2xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      style={{ border: 'none' }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Saved Inventory */}
      <section className="pb-12">
        <h2 className="text-xl font-bold mb-4 px-2">{t('Saved Inventory', 'সংরক্ষিত ইনভেন্টরি')}</h2>
        {items.length === 0 ? (
          <div className="glass-card text-center py-8 text-sm text-white/40 italic">
            {t('No items yet. Add your first ingredient above!', 'এখনো কোনো উপকরণ নেই। উপরে আপনার প্রথম উপকরণ যোগ করুন!')}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map(item => (
              <div key={item.id} className="glass-card !p-4 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="bg-white/5 p-2 rounded-xl text-white/40">
                    <Utensils size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base leading-tight">{item.name}</h4>
                    <p className="text-xs text-white/60">1 {item.amountOption || t('unit', 'একক')} · {item.price > 0 ? formatCurrency(item.price) : t('No price', 'মূল্য নেই')}</p>
                    <p className="text-[10px] text-teal-400 mt-1">{t('Expires:', 'মেয়াদ:')} {formatDate(new Date(item.expiryDate))}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setItems(items.filter(i => i.id !== item.id))}
                  className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
