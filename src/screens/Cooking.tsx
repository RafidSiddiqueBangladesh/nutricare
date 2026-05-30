import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChefHat, Calendar, Utensils, Trash2, Mic, Camera, Lightbulb, Sparkles, Loader, Search, Youtube, CheckCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { CostEntry, InventoryItem } from '@/src/types';
import { cn, formatCurrency, formatDate } from '@/src/lib/utils';
import { apiService, YouTubeVideoResult } from '@/src/services/api';

type ParsedFoodItem = {
  name: string;
  quantity: number;
  unit: string;
  grams: number;
  calories: number;
};

const UNIT_OPTIONS = ['kg', 'piece', 'cup', 'gram', 'slice', 'tbsp', 'tsp'];

export default function Cooking() {
  const [items, setItems] = useLocalStorage<InventoryItem[]>('inventory-items', []);
  const [costEntries, setCostEntries] = useLocalStorage<CostEntry[]>('cost-entries', []);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedFoodItem[]>([]);
  const [showParsedItems, setShowParsedItems] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideoResult[]>([]);
  const [recipeIdeas, setRecipeIdeas] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const ingredientNames = useMemo(() => items.map((item) => item.name).filter(Boolean), [items]);
  const totalSpent = useMemo(() => costEntries.reduce((sum, entry) => sum + entry.amount, 0), [costEntries]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const addCostSyncEntry = (title: string, amount: number, note?: string) => {
    if (!amount || amount <= 0) return;

    setCostEntries([
      {
        id: crypto.randomUUID(),
        title,
        amount,
        category: 'Food',
        date: new Date().toISOString(),
        source: 'cooking',
        note,
      },
      ...costEntries,
    ]);
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedQuantity = Number(quantity) || 1;
    const selectedUnit = unit || 'kg';
    const amountLabel = `${parsedQuantity} ${selectedUnit}`;
    const parsedPrice = Number(price) || 0;

    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      price: parsedPrice,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amountOption: amountLabel,
      quantity: parsedQuantity,
      unit: selectedUnit,
      addedAt: Date.now(),
    };

    setItems([newItem, ...items]);
    addCostSyncEntry(newItem.name, parsedPrice, amountLabel);

    setName('');
    setQuantity('1');
    setUnit('kg');
    setPrice('');
    setStatusType('success');
    setStatusMessage('Ingredient saved and synced to Costs');
  };

  const parseFoodText = async (text: string) => {
    const response = await apiService.parseNutritionText(text);
    if (!response?.success || !response?.data?.items?.length) {
      throw new Error('No ingredients found');
    }

    const parsed = response.data.items as ParsedFoodItem[];
    setParsedItems(parsed);
    setShowParsedItems(true);
    setStatusType('success');
    setStatusMessage(`Parsed ${parsed.length} ingredient(s)`);

    const first = parsed[0];
    if (first) {
      setName(first.name || '');
      setQuantity(String(first.quantity || 1));
      setUnit(String(first.unit || 'kg'));
    }
  };

  const startVoiceCapture = async () => {
    const SpeechRecognition = (window as Window & { webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusType('error');
      setStatusMessage('Voice capture is not supported in this browser');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      setIsRecording(true);
      setStatusType('success');
      setStatusMessage('Listening... say ingredient and amount');

      recognition.onresult = async (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          await parseFoodText(transcript);
        }
      };

      recognition.onerror = () => {
        setStatusType('error');
        setStatusMessage('Voice capture failed');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
      setStatusType('error');
      setStatusMessage('Unable to start voice capture');
    }
  };

  const stopVoiceCapture = () => {
    recognitionRef.current?.stop?.();
    setIsRecording(false);
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setStatusType('success');
      setStatusMessage('Reading image with OCR...');

      const response = await apiService.processNutritionImage(file);
      if (!response?.success || !response?.data?.items?.length) {
        throw new Error('No ingredients found');
      }

      const parsed = response.data.items as ParsedFoodItem[];
      setParsedItems(parsed);
      setShowParsedItems(true);
      setStatusType('success');
      setStatusMessage(`OCR found ${parsed.length} ingredient(s)`);

      const first = parsed[0];
      if (first) {
        setName(first.name || '');
        setQuantity(String(first.quantity || 1));
        setUnit(String(first.unit || 'kg'));
      }
    } catch {
      setStatusType('error');
      setStatusMessage('OCR failed, please try again');
    } finally {
      setIsProcessing(false);
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const addParsedItems = () => {
    if (parsedItems.length === 0) return;

    const newItems: InventoryItem[] = parsedItems.map((item) => ({
      id: crypto.randomUUID(),
      name: item.name,
      price: 0,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amountOption: `${item.quantity} ${item.unit}`,
      quantity: item.quantity,
      unit: item.unit,
      addedAt: Date.now(),
    }));

    setItems([...newItems, ...items]);
    addCostSyncEntry(
      parsedItems.map((item) => item.name).join(', '),
      Number(price) || 0,
      'OCR/voice batch'
    );

    setParsedItems([]);
    setShowParsedItems(false);
    setStatusType('success');
    setStatusMessage('Parsed ingredients added to kitchen');
  };

  const generateRecipeIdeas = (ingredients: string[]) => {
    const joined = ingredients.join(' ').toLowerCase();
    const ideas: string[] = [];

    if (joined.includes('egg') && joined.includes('rice')) ideas.push('Egg fried rice');
    if (joined.includes('banana') && joined.includes('milk')) ideas.push('Banana milk smoothie');
    if (joined.includes('chicken') && joined.includes('rice')) ideas.push('Chicken rice bowl');
    if (joined.includes('potato') && joined.includes('egg')) ideas.push('Potato egg hash');
    if (joined.includes('lentil') || joined.includes('dal')) ideas.push('Dal and rice comfort bowl');
    if (joined.includes('fish') && joined.includes('rice')) ideas.push('Fish rice plate');

    return ideas.length > 0 ? [...new Set(ideas)] : ['Veggie omelette', 'Simple rice bowl', 'Fruit smoothie'];
  };

  const loadSmartSuggestions = async () => {
    try {
      setIsLoadingSuggestions(true);
      setRecipeIdeas(generateRecipeIdeas(ingredientNames));

      const query = `${ingredientNames.slice(0, 4).join(' ')} recipe`.trim() || 'easy healthy recipe';
      const response = await apiService.searchYouTubeVideos(query, 5);
      setYoutubeVideos(response?.data || []);

      setStatusType('success');
      setStatusMessage('Smart suggestions updated from your ingredients');
    } catch {
      setStatusType('error');
      setStatusMessage('Could not load smart suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'p-3 rounded-2xl flex items-center gap-2 text-sm font-bold',
            statusType === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          )}
        >
          {statusType === 'success' ? <Sparkles size={18} /> : <Lightbulb size={18} />}
          {statusMessage}
        </motion.div>
      )}

      <div className="flex justify-center">
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
          <ChefHat size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Cooking Assistant</span>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        </div>
      </div>

      <h1 className="text-2xl font-black px-2">What&apos;s in your kitchen?</h1>

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
                placeholder="Enter ingredient..."
                className="glass-input w-full pr-14"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceCapture : startVoiceCapture}
                  className={cn('p-1 rounded', isRecording ? 'text-teal-400 animate-pulse' : 'text-white/40 hover:text-teal-400')}
                  title="Voice ingredient entry"
                >
                  <Mic size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-1 rounded text-white/40 hover:text-teal-400"
                  title="Image OCR ingredient entry"
                >
                  <Camera size={16} />
                </button>
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-rose-400 text-rose-950 font-bold rounded-xl text-sm flex items-center gap-2">
              <Plus size={14} />
              Add
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="1"
              placeholder="Amount"
              className="glass-input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <select className="glass-input" value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNIT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <input
            type="number"
            placeholder="Price"
            className="glass-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageCapture}
            className="hidden"
          />

          <div className="glass-input flex items-center justify-between text-white/40 text-sm">
            <span>Tap to set (kg / piece / cup / gram...)</span>
            <Calendar size={16} />
          </div>

          <button
            type="button"
            onClick={loadSmartSuggestions}
            disabled={isLoadingSuggestions}
            className="w-full py-3 bg-rose-400/20 text-rose-400 rounded-full font-bold text-sm border border-rose-400/30 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoadingSuggestions ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
            Smart Suggestions
          </button>
        </form>
      </section>

      <section className="glass-card flex items-center gap-4 bg-teal-500/10">
        <div className="w-12 h-12 rounded-2xl bg-teal-400/20 flex items-center justify-center text-teal-400">
          <ChefHat size={28} />
        </div>
        <div>
          <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">Inventory Summary</p>
          <h3 className="text-2xl font-black">{items.length} item(s) in kitchen</h3>
          <p className="text-xs text-white/60">Auto cost synced: {formatCurrency(totalSpent)}</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 px-2">Smart Suggestions</h2>
        <div className="glass-card flex items-start gap-4">
          <div className="bg-yellow-400/20 p-2 rounded-xl text-yellow-400">
            <Lightbulb size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold mb-1">Tip:</p>
            <p className="text-sm text-white/70">
              {items.length > 0 ? 'You can cook with what you already have. Tap Smart Suggestions for recipes and videos.' : 'Add ingredients to get smart cooking suggestions.'}
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-4 glass-card !p-4">
            <h3 className="text-sm font-bold uppercase text-white/60 mb-3">Your Ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <span key={item.id} className="px-3 py-1 rounded-full bg-white/10 text-sm text-white/80">
                  {item.name} • {item.amountOption}
                </span>
              ))}
            </div>
          </div>
        )}

        {recipeIdeas.length > 0 && (
          <div className="mt-4 glass-card !p-4">
            <h3 className="text-sm font-bold uppercase text-white/60 mb-3">What you can cook</h3>
            <div className="space-y-2">
              {recipeIdeas.map((idea) => (
                <div key={idea} className="bg-white/5 rounded-xl p-3 text-sm font-semibold text-white/80">
                  {idea}
                </div>
              ))}
            </div>
          </div>
        )}

        {youtubeVideos.length > 0 && (
          <div className="mt-4 glass-card !p-4">
            <h3 className="text-sm font-bold uppercase text-white/60 mb-3 flex items-center gap-2">
              <Youtube size={14} />
              YouTube Videos
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {youtubeVideos.map((video) => (
                <a
                  key={video.videoId}
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-3 bg-white/5 rounded-xl p-2 hover:bg-white/10 transition-all"
                >
                  <img src={video.thumbnail} alt={video.title} className="w-28 h-16 object-cover rounded-lg shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold line-clamp-2">{video.title}</p>
                    <p className="text-[11px] text-white/50 line-clamp-2 mt-1">{video.channelTitle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {showParsedItems && parsedItems.length > 0 && (
        <section className="glass-card !p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
              <CheckCircle size={20} />
              Parsed Ingredients
            </h3>
            <button onClick={() => setShowParsedItems(false)} className="text-white/60 hover:text-white text-2xl">×</button>
          </div>

          <div className="space-y-2 mb-4">
            {parsedItems.map((item, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold capitalize">{item.name}</p>
                  <p className="text-xs text-white/60">{item.quantity} {item.unit} ({item.grams}g)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{item.calories.toFixed(0)} cal</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={addParsedItems} disabled={isProcessing} className="flex-1 btn-primary disabled:opacity-50">✓ Add All Items</button>
            <button onClick={() => setShowParsedItems(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-xl font-bold hover:bg-white/10 transition-colors">Cancel</button>
          </div>
        </section>
      )}

      <section className="pb-12">
        <h2 className="text-xl font-bold mb-4 px-2">Saved Inventory</h2>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="glass-card !p-4 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="bg-white/5 p-2 rounded-xl text-white/40">
                  <Utensils size={20} />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="font-bold text-base leading-tight text-left"
                  >
                    {item.name}
                  </button>
                  <p className="text-xs text-white/60">{item.amountOption} • Price: {formatCurrency(item.price)}</p>
                  <p className="text-[10px] text-teal-400 mt-1">Expires: {formatDate(new Date(item.expiryDate))} (default)</p>
                  <AnimatePresence>
                    {expandedId === item.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mt-2 text-xs text-white/50"
                      >
                        Unit: {item.unit || 'kg'} | Amount: {item.quantity || 1}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
