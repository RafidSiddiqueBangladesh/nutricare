import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, History, Activity, Smile, Dumbbell, Calculator, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { cn } from '@/src/lib/utils';

export default function AnalysisHistory() {
  const navigate = useNavigate();
  const [bmiLogs] = useLocalStorage<any[]>('health-metrics', []);
  const [exerciseLogs] = useLocalStorage<any[]>('exercise-logs', []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
           <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <History size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Health Results</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      <section className="glass-card">
         <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white/40">
              <Smile size={24} />
            </div>
            <div>
              <h3 className="font-bold">Current Mood: Normal</h3>
              <p className="text-xs text-white/40">Adaptive color theme based on your latest face result</p>
            </div>
         </div>
         <div className="grid grid-cols-3 gap-2">
            <StatBox label="Tracking Logs" value={exerciseLogs.length} />
            <StatBox label="BMI Logs" value={bmiLogs.length} />
            <StatBox label="Mood Presets" value="4" />
         </div>
      </section>

      <section className="glass-card">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white/40">
              <Dumbbell size={24} />
            </div>
            <div>
              <h3 className="font-bold">Live Workout Insights</h3>
              <p className="text-xs text-white/40">Dynamic rep and exercise overview from saved sessions</p>
            </div>
         </div>
         <div className="flex gap-3 mb-4">
            <StatPill label="Sessions" value={exerciseLogs.length} color="bg-yellow-400/20 text-yellow-400" />
            <StatPill label="Best Reps" value="23" color="bg-purple-400/20 text-purple-400" />
            <StatPill label="Latest" value="Push-ups" color="bg-blue-400/20 text-blue-400" />
         </div>
         <p className="text-xs font-bold opacity-60">Latest Saved: 2026-05-13 21:43</p>
      </section>

      <section className="glass-card pb-8">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white/40">
              <Calculator size={24} />
            </div>
            <div>
              <h3 className="font-bold">BMI History (Last 3)</h3>
              <p className="text-xs text-white/40">Your latest body-mass trend snapshots</p>
            </div>
         </div>
         
         <div className="space-y-2">
            {bmiLogs.slice(0, 3).map((log, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold">BMI: {log.value.bmi}</h4>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full opacity-60">{log.value.category}</span>
                </div>
                <p className="text-xs text-white/60">Body Data: Height {log.value.height} cm, Weight {log.value.weight} kg</p>
                <p className="text-[10px] text-white/40 mt-1">Saved: 2026-05-13 04:33</p>
              </div>
            ))}
            {bmiLogs.length === 0 && (
              <p className="text-center text-white/40 py-4 text-xs italic">No BMI logs yet.</p>
            )}
         </div>
      </section>

      <button className="fixed bottom-24 right-6 btn-primary !bg-rose-400 !text-white !p-4 !rounded-2xl shadow-2xl flex items-center gap-2">
        <Palette size={20} />
        Mood Palette
      </button>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: any }) {
  return (
    <div className="glass-card !bg-white/5 !p-3 border-none rounded-2xl flex flex-col gap-1">
      <span className="text-lg font-black">{value}</span>
      <span className="text-[8px] uppercase tracking-wider font-bold opacity-40 leading-tight">{label}</span>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string, value: any, color: string }) {
  return (
    <div className={cn("px-4 py-2 rounded-xl flex-1 text-center border border-white/5", color)}>
      <p className="text-lg font-black leading-tight">{value}</p>
      <p className="text-[8px] uppercase font-bold opacity-60">{label}</p>
    </div>
  );
}
