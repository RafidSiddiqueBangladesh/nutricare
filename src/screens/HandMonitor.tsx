import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Hand } from 'lucide-react';
import HandDetector, { HandDetectionResult } from '@/src/components/HandDetector';
import { motion } from 'motion/react';

export default function HandMonitor() {
  const navigate = useNavigate();
  const [handData, setHandData] = useState<HandDetectionResult | null>(null);
  const [isRunning, setIsRunning] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <Hand size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Hand Movement</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      <section className="glass-card !p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Live Hand Detection</h3>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              isRunning
                ? 'bg-teal-500/20 text-teal-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {isRunning ? 'Active' : 'Paused'}
          </button>
        </div>

        <div className="aspect-video bg-black rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-inner">
          <HandDetector
            isRunning={isRunning}
            onDetection={setHandData}
            showCanvas={true}
            maxHands={2}
          />
        </div>

        {handData && handData.detected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-teal-500/20 border border-teal-500/30 rounded-lg p-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/60 mb-1">Hands Detected</p>
                <p className="font-bold text-teal-300 text-lg">{handData.hands?.length || 0}</p>
              </div>
              <div>
                <p className="text-xs text-white/60 mb-1">Gesture</p>
                <p className="font-bold text-teal-300 text-lg capitalize">
                  {handData.gesture === 'none' ? 'N/A' : (handData.gesture || 'Unknown')}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-teal-500/20">
              <p className="text-xs text-teal-300">
                ✋ {handData.hands?.map(h => h.label).join(', ') || 'Hands'} detected
              </p>
            </div>
          </motion.div>
        )}

        {handData && !handData.detected && isRunning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2"
          >
            <span className="text-xs text-yellow-300">⚠️ No hands detected - raise your hands in frame</span>
          </motion.div>
        )}
      </section>

      <section className="glass-card !p-4">
        <h3 className="text-lg font-bold mb-3">Hand Detection Guide</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Raise both hands into the camera frame</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Keep hands visible and well-lit</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Palm orientation helps gesture recognition</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Detect up to 2 hands simultaneously (left + right)</p>
          </div>
        </div>
      </section>

      <div className="text-xs text-white/50 text-center pb-4">
        Supported gestures: Thumbs Up, Peace, Neutral
      </div>
    </div>
  );
}
