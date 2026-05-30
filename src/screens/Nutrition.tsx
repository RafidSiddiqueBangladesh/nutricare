import React, { useState, useRef, useEffect } from 'react';
import { Plus, Mic, Camera, Flame, Sparkles, Utensils, Trash2, Activity, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { FoodLog } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { apiService } from '@/src/services/api';

interface ParsedFoodItem {
  name: string;
  quantity: number;
  unit: string;
  grams: number;
  calories: number;
}

export default function Nutrition() {
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
      setStatusMessage('Recording... speak your food items');
    } catch (error) {
      console.error('Microphone error:', error);
      setStatusType('error');
      setStatusMessage('Unable to access microphone');
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
      setStatusMessage('Processing voice...');

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
        setStatusMessage(`Found ${response.data.count} food item(s) from voice`);
      } else {
        setStatusType('error');
        setStatusMessage('Could not parse voice input');
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      setStatusType('error');
      setStatusMessage('Failed to process voice input');
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
      setStatusMessage('Processing image with OCR...');

      const response = await apiService.processNutritionImage(file);

      if (response.success && response.data?.items) {
        setParsedItems(response.data.items);
        setShowParsedItems(true);
        setStatusType('success');
        setStatusMessage(`Found ${response.data.count} food item(s) from image`);
      } else {
        setStatusType('error');
        setStatusMessage('Could not process image');
      }
    } catch (error) {
      console.error('OCR error:', error);
      const apiError = error as Error & { status?: number };
      setStatusType('error');
      setStatusMessage(
        apiError.status === 401
          ? 'Please sign in to use OCR scanning.'
          : 'Failed to process image'
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
    setStatusMessage('Food items added successfully!');
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
    setStatusMessage('Food item added!');
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
              Parsed Food Items
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
              ✓ Add All Items
            </button>
            <button
              onClick={() => setShowParsedItems(false)}
              className="flex-1 px-4 py-2 bg-white/5 rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.section>
      )}

      {/* Add Food Card */}
      <section className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="primary-color" size={20} />
          <h2 className="text-xl font-bold">Add Food Item</h2>
        </div>
        <form onSubmit={addFood} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter food name (English/Bangla)"
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
                    'p-1 transition-all rounded',
                    isRecording
                      ? 'animate-pulse primary-color'
                      : 'hover:primary-color'
                  )}
                  title={isRecording ? 'Click to stop recording' : 'Click to record voice'}
                >
                  <Mic size={18} />
                </button>

                {/* Camera Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isProcessing || isRecording}
                  className="p-1 hover:primary-color transition-colors disabled:opacity-50 rounded"
                  title="Click to capture image"
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
              className="btn-primary disabled:opacity-50"
            >
              {isProcessing ? <Loader size={18} className="animate-spin" /> : 'Add'}
            </button>
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-3 px-1 text-[10px] uppercase font-bold primary-text bg-[#001a1a] rounded">
              Amount Option
            </label>
            <select
              value={amountOption}
              onChange={(e) => setAmountOption(e.target.value)}
              className="glass-input w-full appearance-none pr-10"
            >
              <option>Default</option>
              <option>100g</option>
              <option>1 cup</option>
              <option>1 plate</option>
            </select>
          </div>

          <p className="text-[10px] primary-text/60 text-center italic">
            🎤 Voice: Click mic to record food items | 📸 Picture: Click camera for OCR | Type: Enter food name directly
          </p>
        </form>
      </section>

      {/* Summary Card */}
      <section className="glass-card flex items-center gap-4" style={{ background: `hsl(var(--primary-hue), 20%, 12%)` }}>
        <div className="w-12 h-12 rounded-2xl primary-color flex items-center justify-center">
          <Flame size={28} />
        </div>
        <div>
          <p className="text-xs font-bold primary-text uppercase tracking-wider">Total Calories Today</p>
          <h3 className="text-3xl font-black">{totalCalories.toFixed(1)} kcal</h3>
          <p className="text-xs text-white/60">{logs.length} food item(s) logged</p>
        </div>
      </section>

      {/* Daily Routine Card */}
      <section className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="primary-color" size={20} />
          <h2 className="text-2xl font-black leading-tight">AI-Powered Daily Routine</h2>
        </div>

        <div className="space-y-3">
          {[
            { tag: 'Breakfast', title: 'Egg with banana and milk', desc: 'Provides protein, potassium, and calcium.' },
            { tag: 'Lunch', title: 'Rice with tomato', desc: 'Provides carbohydrates and essential vitamins.' },
            { tag: 'Snack', title: 'Banana', desc: 'Quick energy boost and source of potassium.' },
            { tag: 'Dinner', title: 'Rice with egg', desc: 'Provides protein and carbohydrates for the evening.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-center"
            >
              <span className="primary-color/30 primary-text px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide">
                {item.tag}
              </span>
              <div>
                <h4 className="font-bold text-base leading-snug">{item.title}</h4>
                <p className="text-sm text-white/65 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Smart Alternatives */}
      <section className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="primary-color" size={20} />
          <h2 className="text-2xl font-black leading-tight">Smart Alternatives</h2>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { instead: 'Eating only bananas', try: 'Add eggs and milk to your breakfast.', benefit: 'Provides a more balanced nutritional profile.' },
            { instead: 'White rice for every meal', try: 'Incorporate potatoes.', benefit: 'Adds variety and different nutrients.' },
            { instead: 'Limited variety in meals', try: 'Include tomatoes.', benefit: 'Adds vitamins and antioxidants.' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-sm mb-2 leading-relaxed">
                <span className="font-black opacity-100">Instead Of:</span> <span className="opacity-70">{item.instead}</span>
              </p>
              <p className="text-sm mb-2 leading-relaxed">
                <span className="font-black opacity-100">Try:</span> <span className="opacity-70">{item.try}</span>
              </p>
              <p className="text-sm primary-text/85 italic leading-relaxed">{item.benefit}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Saved Inventory / History */}
      <section className="glass-card">
        <h2 className="text-xl font-bold mb-4">History</h2>
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
            <p className="text-center text-white/40 py-8 text-sm italic">No entries yet. Start logging!</p>
          )}
        </div>
      </section>
    </div>
  );
}
