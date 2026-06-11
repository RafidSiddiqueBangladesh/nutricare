import React, { useState, useRef, useEffect } from 'react';
import { Plus, Mic, Camera, Flame, Sparkles, Utensils, Trash2, Activity, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { FoodLog } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { apiService } from '@/src/services/api';
import { useLanguage } from '@/src/contexts/LanguageContext';

interface ParsedFoodItem {
  name: string;
  quantity: number;
  unit: string;
  grams: number;
  calories: number;
}

export default function Nutrition() {
  const { t } = useLanguage();
  const [logs, setLogs] = useLocalStorage<FoodLog[]>('nutrition-logs', []);
  const [foodName, setFoodName] = useState('');
  const [amountOption, setAmountOption] = useState('Default');
  
  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'voice' | 'image'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');
  
  // Parsed items state
  const [parsedItems, setParsedItems] = useState<ParsedFoodItem[]>([]);
  const [showParsedItems, setShowParsedItems] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);

  // Voice Recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setProcessingStatus('voice');
      setStatusMessage(t('Recording... speak your food items', 'রেকর্ডিং... আপনার খাবারের নাম বলুন'));
    } catch (error) {
      console.error('Microphone error:', error);
      setStatusType('error');
      setStatusMessage(t('Unable to access microphone', 'মাইক্রোফোন অ্যাক্সেস করা যায়নি'));
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process voice audio using Web Speech API
  const processVoiceAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      setProcessingStatus('voice');
      setStatusMessage(t('Processing voice...', 'ভয়েস প্রক্রিয়াকরণ হচ্ছে...'));

      // Use Web Speech API for transcription
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'en-US';
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // For demo, we'll use a simple mock transcription
      // In production, use actual speech-to-text service
      const mockTranscription = 'rice one cup egg two pieces banana one';
      
      // Send to backend for parsing
      const response = await apiService.parseVoiceTranscription(mockTranscription);
      
      if (response.success && response.data?.items) {
        setParsedItems(response.data.items);
        setShowParsedItems(true);
        setStatusType('success');
        setStatusMessage(t(`Found ${response.data.count} food item(s) from voice`, `ভয়েস থেকে ${response.data.count}টি খাবার পাওয়া গেছে`));
      } else {
        setStatusType('error');
        setStatusMessage(t('Could not parse voice input', 'ভয়েস ইনপুট বিশ্লেষণ করা যায়নি'));
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      setStatusType('error');
      setStatusMessage(t('Failed to process voice input', 'ভয়েস ইনপুট প্রক্রিয়াকরণ ব্যর্থ'));
    } finally {
      setIsProcessing(false);
      setProcessingStatus('idle');
    }
  };

  // Handle Image Capture & OCR
  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setProcessingStatus('image');
      setStatusMessage(t('Processing image with OCR...', 'ইমেজ OCR দিয়ে প্রক্রিয়া করা হচ্ছে...'));

      const response = await apiService.processNutritionImage(file);

      if (response.success && response.data?.items) {
        setParsedItems(response.data.items);
        setShowParsedItems(true);
        setStatusType('success');
        setStatusMessage(t(`Found ${response.data.count} food item(s) from image`, `ইমেজ থেকে ${response.data.count}টি খাবার পাওয়া গেছে`));
      } else {
        setStatusType('error');
        setStatusMessage(t('Could not process image', 'ইমেজ প্রক্রিয়াকরণ করা যায়নি'));
      }
    } catch (error) {
      console.error('OCR error:', error);
      const apiError = error as Error & { status?: number };
      setStatusType('error');
      setStatusMessage(
        apiError.status === 401
          ? t('Please sign in to use OCR scanning.', 'OCR স্ক্যানিং ব্যবহার করতে লগইন করুন।')
          : t('Failed to process image', 'ইমেজ প্রক্রিয়াকরণ ব্যর্থ')
      );
    } finally {
      setIsProcessing(false);
      setProcessingStatus('idle');
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  // Add parsed food items to logs
  const addParsedItems = () => {
    const newLogs = parsedItems.map((item) => ({
      id: crypto.randomUUID(),
      name: item.name,
      calories: item.calories,
      amount: `${item.quantity} ${item.unit}`,
      timestamp: Date.now(),
    }));

    setLogs([...newLogs, ...logs]);
    setParsedItems([]);
    setShowParsedItems(false);
    setStatusMessage(t('Food items added successfully!', 'খাবার সফলভাবে যোগ হয়েছে!'));
    setStatusType('success');
  };

  const addFood = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!foodName.trim()) return;

    // Simplified calorie mock
    const calories = Math.floor(Math.random() * 500) + 50;
    const newLog: FoodLog = {
      id: crypto.randomUUID(),
      name: foodName,
      calories,
      amount: amountOption,
      timestamp: Date.now(),
    };

    setLogs([newLog, ...logs]);
    setFoodName('');
    setStatusMessage(t('Food item added!', 'খাবার যোগ হয়েছে!'));
    setStatusType('success');
  };

  const removeLog = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  // Auto-clear status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  return (
    <div className="flex flex-col gap-6">
      {/* Status Message */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'p-3 rounded-2xl flex items-center gap-2 text-sm font-bold',
            statusType === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          )}
        >
          {statusType === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {statusMessage}
        </motion.div>
      )}

      {/* Parsed Items Preview */}
      {showParsedItems && parsedItems.length > 0 && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card border border-green-500/30 bg-green-500/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
              <CheckCircle size={20} />
              {t('Parsed Food Items', 'বিশ্লেষিত খাদ্য তালিকা')}
            </h3>
            <button
              onClick={() => setShowParsedItems(false)}
              className="text-white/60 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {parsedItems.map((item, i) => (
              <div
                key={i}
                className="p-3 bg-white/5 rounded-xl flex justify-between items-center"
              >
                <div>
                  <p className="font-bold capitalize">{item.name}</p>
                  <p className="text-xs text-white/60">
                    {item.quantity} {item.unit} ({item.grams}g)
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{item.calories.toFixed(0)} cal</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={addParsedItems}
              disabled={isProcessing}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              ✓ {t('Add All Items', 'সবগুলো যোগ করুন')}
            </button>
            <button
              onClick={() => setShowParsedItems(false)}
              className="flex-1 px-4 py-2 bg-white/5 rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              {t('Cancel', 'বাতিল')}
            </button>
          </div>
        </motion.section>
      )}

      {/* Add Food Card */}
      <section className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <Utensils size={18} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">{t('Add Food Item', 'খাবার যোগ করুন')}</h2>
        </div>
        <form onSubmit={addFood} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('Enter food name (English/Bangla)', 'খাবারের নাম লিখুন (ইংরেজি/বাংলা)')}
                className="glass-input w-full pr-12"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {/* Voice Recording Button */}
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  disabled={isProcessing && processingStatus === 'image'}
                  className={cn(
                    'p-1.5 transition-all rounded-lg',
                    isRecording
                      ? 'animate-pulse bg-teal-500/30 text-teal-400'
                      : 'hover:bg-white/10 text-white/50 hover:text-teal-400'
                  )}
                  title={isRecording ? t('Click to stop recording', 'রেকর্ডিং বন্ধ করুন') : t('Click to record voice', 'ভয়েস রেকর্ড করুন')}
                >
                  <Mic size={18} />
                </button>

                {/* Camera Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isProcessing || isRecording}
                  className="p-1.5 hover:bg-white/10 text-white/50 hover:text-teal-400 transition-colors disabled:opacity-50 rounded-lg"
                  title={t('Click to capture image', 'ইমেজ ক্যাপচার করুন')}
                >
                  <Camera size={18} />
                </button>

                {/* Hidden File Input */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCapture}
                  className="hidden"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!foodName.trim() || isProcessing}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl text-sm hover:from-teal-400 hover:to-cyan-400 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-teal-500/15"
            >
              {isProcessing ? <Loader size={18} className="animate-spin" /> : t('Add', 'যোগ')}
            </button>
          </div>

          {/* Amount Option — FIXED CSS */}
          <div className="relative">
            <label className="floating-label">
              {t('Amount Option', 'পরিমাণ')}
            </label>
            <select
              value={amountOption}
              onChange={(e) => setAmountOption(e.target.value)}
              className="glass-input w-full"
            >
              <option value="Default">{t('Default', 'ডিফল্ট')}</option>
              <option value="100g">{t('100g', '১০০ গ্রাম')}</option>
              <option value="1 cup">{t('1 cup', '১ কাপ')}</option>
              <option value="1 plate">{t('1 plate', '১ প্লেট')}</option>
            </select>
          </div>

          <p className="text-[10px] text-teal-400/60 text-center italic">
            {t(
              '🎤 Voice: Click mic to record food items | 📸 Picture: Click camera for OCR | Type: Enter food name directly',
              '🎤 ভয়েস: মাইকে ক্লিক করুন | 📸 ছবি: ক্যামেরায় ক্লিক করুন | টাইপ: খাবারের নাম সরাসরি লিখুন'
            )}
          </p>
        </form>
      </section>

      {/* Summary Card */}
      <section className="glass-card flex items-center gap-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/5 border-teal-500/20">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Flame size={26} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">{t('Total Calories Today', 'আজকের মোট ক্যালোরি')}</p>
          <h3 className="text-3xl font-black">{totalCalories.toFixed(1)} kcal</h3>
          <p className="text-xs text-white/60">{logs.length} {t('food item(s) logged', 'টি খাবার রেকর্ড করা হয়েছে')}</p>
        </div>
      </section>

      {/* Daily Routine Card */}
      <section className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <h2 className="text-2xl font-black leading-tight">{t('AI-Powered Daily Routine', 'এআই চালিত দৈনিক রুটিন')}</h2>
        </div>

        <div className="space-y-3">
          {[
            { tag: t('Breakfast', 'সকালের নাস্তা'), title: t('Egg with banana and milk', 'ডিম, কলা ও দুধ'), desc: t('Provides protein, potassium, and calcium.', 'প্রোটিন, পটাসিয়াম ও ক্যালসিয়াম সরবরাহ করে।') },
            { tag: t('Lunch', 'দুপুরের খাবার'), title: t('Rice with tomato', 'ভাত ও টমেটো'), desc: t('Provides carbohydrates and essential vitamins.', 'কার্বোহাইড্রেট ও প্রয়োজনীয় ভিটামিন সরবরাহ করে।') },
            { tag: t('Snack', 'বিকেলের নাস্তা'), title: t('Banana', 'কলা'), desc: t('Quick energy boost and source of potassium.', 'দ্রুত শক্তি বৃদ্ধি ও পটাসিয়ামের উৎস।') },
            { tag: t('Dinner', 'রাতের খাবার'), title: t('Rice with egg', 'ভাত ও ডিম'), desc: t('Provides protein and carbohydrates for the evening.', 'সন্ধ্যার জন্য প্রোটিন ও কার্বোহাইড্রেট সরবরাহ করে।') },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-center"
            >
              <span className="bg-teal-500/15 text-teal-400 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wide shrink-0">
                {item.tag}
              </span>
              <div>
                <h4 className="font-bold text-lg leading-snug">{item.title}</h4>
                <p className="text-base text-white/75 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Smart Alternatives */}
      <section className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <h2 className="text-2xl font-black leading-tight">{t('Smart Alternatives', 'স্মার্ট বিকল্প')}</h2>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { instead: t('Eating only bananas', 'শুধু কলা খাওয়া'), try_: t('Add eggs and milk to your breakfast.', 'সকালের নাস্তায় ডিম ও দুধ যোগ করুন।'), benefit: t('Provides a more balanced nutritional profile.', 'আরও সুষম পুষ্টি প্রোফাইল সরবরাহ করে।') },
            { instead: t('White rice for every meal', 'প্রতি বেলায় সাদা ভাত'), try_: t('Incorporate potatoes.', 'আলু অন্তর্ভুক্ত করুন।'), benefit: t('Adds variety and different nutrients.', 'বৈচিত্র্য ও বিভিন্ন পুষ্টি যোগ করে।') },
            { instead: t('Limited variety in meals', 'খাবারে সীমিত বৈচিত্র্য'), try_: t('Include tomatoes.', 'টমেটো অন্তর্ভুক্ত করুন।'), benefit: t('Adds vitamins and antioxidants.', 'ভিটামিন ও অ্যান্টিঅক্সিডেন্ট যোগ করে।') },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-base mb-2 leading-relaxed">
                <span className="font-black opacity-100">{t('Instead Of:', 'এর পরিবর্তে:')}</span> <span className="opacity-70">{item.instead}</span>
              </p>
              <p className="text-base mb-2 leading-relaxed">
                <span className="font-black opacity-100">{t('Try:', 'চেষ্টা করুন:')}</span> <span className="opacity-70">{item.try_}</span>
              </p>
              <p className="text-base font-semibold text-teal-400/90 italic leading-relaxed">{item.benefit}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Saved Inventory / History */}
      <section className="glass-card">
        <h2 className="text-xl font-bold mb-4">{t('History', 'ইতিহাস')}</h2>
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <div key={log.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                  <Utensils size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-sm capitalize">{log.name}</h4>
                  <p className="text-xs text-white/60">{log.calories} cal • {log.amount}</p>
                </div>
              </div>
              <button
                onClick={() => removeLog(log.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center text-white/40 py-8 text-sm italic">{t('No entries yet. Start logging!', 'এখনো কোনো এন্ট্রি নেই। লগিং শুরু করুন!')}</p>
          )}
        </div>
      </section>
    </div>
  );
}
