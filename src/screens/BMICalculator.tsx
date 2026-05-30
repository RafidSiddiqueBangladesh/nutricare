import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calculator, Activity, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { HealthMetric } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { appendHealthResult } from '@/src/lib/healthResults';

export default function BMICalculator() {
  const navigate = useNavigate();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<{ bmi: number, category: string } | null>(null);
  const [logs, setLogs] = useLocalStorage<HealthMetric[]>('health-metrics', []);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // to meters
    if (!w || !h) return;

    const bmi = w / (h * h);
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    setResult({ bmi, category });
    const timestampIso = new Date().toISOString();
    
    const newLog: HealthMetric = {
      id: crypto.randomUUID(),
      type: 'bmi',
      value: { bmi: bmi.toFixed(2), category, weight: w, height: parseFloat(height) },
      timestamp: Date.now()
    };
    setLogs([newLog, ...logs]);

    appendHealthResult({
      id: crypto.randomUUID(),
      type: 'bmi',
      timestamp: timestampIso,
      data: {
        bmi,
        category,
        weight: w,
        height: parseFloat(height),
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
           <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <Calculator size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">BMI Calculator</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      <section className="glass-card text-center py-10">
        <h2 className="text-3xl font-black mb-6">BMI Calculator</h2>
        <p className="text-sm text-white/60 mb-8 max-w-[200px] mx-auto">
          Enter your weight and height to calculate your BMI
        </p>
        
        <div className="space-y-4 max-w-[280px] mx-auto">
          <input 
            type="number" 
            placeholder="Weight (kg)" 
            className="glass-input w-full text-center"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Height (cm)" 
            className="glass-input w-full text-center"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <button 
            onClick={calculateBMI}
            className="btn-primary w-full py-4 text-base bg-rose-400 hover:bg-rose-300 shadow-xl"
          >
            Calculate BMI
          </button>
        </div>
      </section>

      <AnimatePresence>
        {result && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card bg-teal-400/10 border-teal-400/30 text-center"
          >
            <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-1">Your BMI Result</p>
            <h3 className="text-4xl font-black mb-2">{result.bmi.toFixed(2)}</h3>
            <p className={cn(
              "text-lg font-bold px-4 py-1 rounded-full inline-block",
              result.category === 'Normal' ? "bg-teal-400 text-teal-900" : "bg-rose-400 text-rose-950"
            )}>
              {result.category}
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
