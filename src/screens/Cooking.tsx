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
  const [items, setItems] = useLocalStorage<InventoryItem[]>('inventory-items', []);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('Default');
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
        setVideosError('No videos found. Try adding more ingredients.');
      }
      setVideos(results);
    } catch (err) {
      setVideosError('Failed to fetch recipe ideas. Please try again.');
    } finally {
      setVideosLoading(false);
    }
  }, [items]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
          <ChefHat size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Cooking Assistant</span>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        </div>
      </div>

      <h1 className="text-2xl font-black px-2">What's in your kitchen?</h1>

      <section className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="text-teal-400" size={20} />
          <h2 className="text-xl font-bold">Inventory Entry</h2>
        </div>
        <form onSubmit={addItem} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Enter ingredient…"
                className="glass-input w-full"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Mic size={16} className="text-white/40" />
                <Camera size={16} className="text-white/40" />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-rose-400 text-rose-950 font-bold rounded-xl text-sm">Add</button>
          </div>
          
          <input 
            type="number" 
            placeholder="Price"
            className="glass-input"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
          
          <select className="glass-input" value={unit} onChange={e => setUnit(e.target.value)}>
            <option>Default</option>
            <option>Kg</option>
            <option>Piece</option>
            <option>Litre</option>
            <option>Pack</option>
          </select>

          <div className="glass-input flex items-center justify-between text-white/40 text-sm">
            <span>Auto-expiry: Meat/Fish 3mo, Veg 1mo</span>
            <Calendar size={16} />
          </div>

          <button
            type="button"
            onClick={fetchRecipes}
            disabled={!items.length || videosLoading}
            className="w-full py-3 bg-rose-400/20 hover:bg-rose-400/30 disabled:opacity-40 text-rose-400 rounded-full font-bold text-sm border border-rose-400/30 flex items-center justify-center gap-2 transition-all"
          >
            {videosLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Finding Recipe Ideas…</>
            ) : (
              <><Youtube size={16} /> Get Cooking Ideas from YouTube</>
            )}
          </button>
        </form>
      </section>

      <section className="glass-card flex items-center gap-4 bg-teal-500/10">
        <div className="w-12 h-12 rounded-2xl bg-teal-400/20 flex items-center justify-center text-teal-400">
          <ChefHat size={28} />
        </div>
        <div>
          <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">Inventory Summary</p>
          <h3 className="text-2xl font-black">{items.length} item{items.length !== 1 ? 's' : ''} in kitchen</h3>
        </div>
      </section>

      {/* Smart tip */}
      <section>
        <h2 className="text-xl font-bold mb-4 px-2">Smart Suggestions</h2>
        <div className="glass-card flex items-start gap-4">
          <div className="bg-yellow-400/20 p-2 rounded-xl text-yellow-400">
            <Lightbulb size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold mb-1">Tip:</p>
            <p className="text-sm text-white/70">
              {items.length > 0
                ? `With ${items.map(i => i.name).slice(0, 3).join(', ')}${items.length > 3 ? ` and ${items.length - 3} more` : ''}, click "Get Cooking Ideas" to find YouTube recipe videos!`
                : 'Add inventory items above to get smart cooking suggestions and YouTube recipe videos.'}
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
              Recipe Ideas
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
        <h2 className="text-xl font-bold mb-4 px-2">Saved Inventory</h2>
        {items.length === 0 ? (
          <div className="glass-card text-center py-8 text-sm text-white/40 italic">
            No items yet. Add your first ingredient above!
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
                    <p className="text-xs text-white/60">1 {item.amountOption || 'unit'} · {item.price > 0 ? formatCurrency(item.price) : 'No price'}</p>
                    <p className="text-[10px] text-teal-400 mt-1">Expires: {formatDate(new Date(item.expiryDate))}</p>
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
