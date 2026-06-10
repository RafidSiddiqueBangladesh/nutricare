import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Hand } from 'lucide-react';
import HandDetector, { HandDetectionResult } from '@/src/components/HandDetector';
import { motion } from 'motion/react';
import { API_BASE_URL } from '@/src/services/api';
import { appendHealthResult } from '@/src/lib/healthResults';

export default function HandMonitor() {
  const navigate = useNavigate();
  const [handData, setHandData] = useState<HandDetectionResult | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const saveHandAnalysis = async () => {
    if (!handData) return;
    setIsSaving(true);
    setSaveMessage(null);
    const timestamp = new Date().toISOString();
    try {
      appendHealthResult({
        id: crypto.randomUUID(),
        type: 'hand',
        timestamp,
        data: {
          confidence: handData.confidence,
          gesture: handData.gesture || 'none',
        },
      });

      const response = await fetch(`${API_BASE_URL}/exercise/hand-analysis`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb_access_token') || ''}`,
        },
        body: JSON.stringify({
          gesture: handData.gesture,
          handsDetected: handData.hands?.length || 0,
          confidence: handData.confidence,
          timestamp,
          handedness: handData.hands?.map((h: any) => h.label),
        }),
      });
      if (response.ok) {
        setSaveMessage('✅ Hand analysis saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage('❌ Failed to save hand analysis');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage('❌ Error saving hand analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const leftDetected  = handData?.leftDetected ?? false;
  const rightDetected = handData?.rightDetected ?? false;
  const missingParts  = handData?.missingParts ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-cyan-400">
            <Hand size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Hand Detection</span>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
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
                ? 'bg-cyan-500/20 text-cyan-400'
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

        {/* Always-visible detection status panel */}
        <motion.div
          key={`${leftDetected}-${rightDetected}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3"
        >
          {/* Per-hand status */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-lg p-3 border ${leftDetected ? 'bg-cyan-500/15 border-cyan-400/30' : 'bg-red-500/10 border-red-400/20'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Left Hand</p>
              <p className={`font-bold text-sm ${leftDetected ? 'text-cyan-300' : 'text-red-400'}`}>
                {leftDetected ? '✅ Detected' : '❌ Not detected'}
              </p>
            </div>
            <div className={`rounded-lg p-3 border ${rightDetected ? 'bg-purple-500/15 border-purple-400/30' : 'bg-red-500/10 border-red-400/20'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Right Hand</p>
              <p className={`font-bold text-sm ${rightDetected ? 'text-purple-300' : 'text-red-400'}`}>
                {rightDetected ? '✅ Detected' : '❌ Not detected'}
              </p>
            </div>
          </div>

          {/* Missing parts */}
          <div className="rounded-lg bg-white/5 px-3 py-2 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Missing / Not Visible</p>
            {missingParts.length === 0 ? (
              <p className="text-xs text-green-400 font-semibold">✅ All parts detected</p>
            ) : (
              <p className="text-xs text-amber-400 leading-relaxed">
                {missingParts.join(', ')}
              </p>
            )}
          </div>

          {/* Gesture */}
          {handData?.detected && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/50 uppercase font-bold">Gesture:</span>
              <span className="text-sm font-bold text-cyan-300 capitalize">
                {handData.gesture === 'none' ? 'Neutral' : (handData.gesture || 'Unknown')}
              </span>
              <span className="text-[10px] text-white/50 uppercase font-bold ml-4">Confidence:</span>
              <span className="text-sm font-bold text-cyan-300">
                {Math.round(handData.confidence * 100)}%
              </span>
            </div>
          )}

          {handData?.detected && (
            <div className="mt-1">
              <button
                onClick={saveHandAnalysis}
                disabled={isSaving}
                className="w-full bg-cyan-500/20 hover:bg-cyan-500/40 disabled:bg-gray-500/20 border border-cyan-500/40 rounded-lg py-2 px-4 text-cyan-300 hover:text-cyan-100 transition-all font-semibold text-sm"
              >
                {isSaving ? 'Saving…' : '💾 Save Analysis'}
              </button>
              {saveMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-center mt-2"
                >
                  {saveMessage}
                </motion.p>
              )}
            </div>
          )}
        </motion.div>

        {!handData && isRunning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2"
          >
            <span className="text-xs text-yellow-300">⚠️ Waiting for hand detection data…</span>
          </motion.div>
        )}
      </section>

      <section className="glass-card !p-4">
        <h3 className="text-lg font-bold mb-3">Hand Detection Guide</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">✓</span>
            <p className="text-white/70">Raise both hands into the camera frame</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">✓</span>
            <p className="text-white/70">Keep hands visible and well-lit — cyan = left, magenta = right</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">✓</span>
            <p className="text-white/70">Yellow dots = finger tips; white skeleton = detected skeleton</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">✓</span>
            <p className="text-white/70">Realtime browser hand/finger detection — no backend needed</p>
          </div>
        </div>
      </section>

      <div className="text-xs text-white/50 text-center pb-4">
        Supported gestures: Thumbs Up · Peace · Open Palm · Neutral
      </div>
    </div>
  );
}
