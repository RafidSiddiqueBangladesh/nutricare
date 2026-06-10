import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User } from 'lucide-react';
import PoseDetector, { PoseDetectionResult } from '@/src/components/PoseDetector';
import { motion } from 'motion/react';
import { API_BASE_URL } from '@/src/services/api';
import { appendHealthResult } from '@/src/lib/healthResults';

export default function PoseMonitor() {
  const navigate = useNavigate();
  const [poseData, setPoseData] = useState<PoseDetectionResult | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const savePoseAnalysis = async () => {
    if (!poseData) return;
    setIsSaving(true);
    setSaveMessage(null);
    const timestamp = new Date().toISOString();
    try {
      appendHealthResult({
        id: crypto.randomUUID(),
        type: 'pose',
        timestamp,
        data: {
          confidence: poseData.confidence,
          repCount: poseData.repCount || 0,
          formScore: poseData.formScore || 0,
          exerciseType: poseData.exerciseType || 'general',
        },
      });

      const response = await fetch(`${API_BASE_URL}/exercise/pose-analysis`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb_access_token') || ''}`,
        },
        body: JSON.stringify({
          repCount: poseData.repCount || 0,
          formScore: poseData.formScore || 0,
          confidence: poseData.confidence,
          timestamp,
          exerciseType: poseData.exerciseType,
          keypointCount: poseData.keypoints?.length || 0,
        }),
      });
      if (response.ok) {
        setSaveMessage('✅ Pose analysis saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage('❌ Failed to save pose analysis');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage('❌ Error saving pose analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const leftShoulder  = poseData?.leftShoulderDetected ?? false;
  const rightShoulder = poseData?.rightShoulderDetected ?? false;
  const movement      = poseData?.movementActive ?? false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <User size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Shoulder / Pose Monitor</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      <section className="glass-card !p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Live Pose Tracking</h3>
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
          <PoseDetector
            isRunning={isRunning}
            onDetection={setPoseData}
            showCanvas={true}
            exerciseType="general"
          />
        </div>

        {/* Always-visible shoulder status panel */}
        <motion.div
          key={`${leftShoulder}-${rightShoulder}-${movement}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className={`rounded-lg p-3 border ${leftShoulder ? 'bg-teal-500/15 border-teal-400/30' : 'bg-red-500/10 border-red-400/20'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Left Shoulder</p>
              <p className={`font-bold text-sm ${leftShoulder ? 'text-teal-300' : 'text-red-400'}`}>
                {leftShoulder ? '✅ Detected' : '❌ Not detected'}
              </p>
            </div>
            <div className={`rounded-lg p-3 border ${rightShoulder ? 'bg-teal-500/15 border-teal-400/30' : 'bg-red-500/10 border-red-400/20'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Right Shoulder</p>
              <p className={`font-bold text-sm ${rightShoulder ? 'text-teal-300' : 'text-red-400'}`}>
                {rightShoulder ? '✅ Detected' : '❌ Not detected'}
              </p>
            </div>
            <div className={`rounded-lg p-3 border ${movement ? 'bg-green-500/15 border-green-400/30' : 'bg-gray-500/10 border-gray-400/20'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Movement</p>
              <p className={`font-bold text-sm ${movement ? 'text-green-300' : 'text-gray-400'}`}>
                {movement ? '🟢 Active' : '⚪ Not active'}
              </p>
            </div>
          </div>

          {poseData && poseData.detected && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-white/60 mb-1">Form Score</p>
                  <p className="font-bold text-teal-300 text-lg">{poseData.formScore}%</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">Reps Done</p>
                  <p className="font-bold text-teal-300 text-lg">{poseData.repCount || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">Confidence</p>
                  <p className="font-bold text-teal-300 text-lg">{Math.round(poseData.confidence * 100)}%</p>
                </div>
              </div>

              <p className="text-xs text-teal-300">
                🔍 Detected {poseData.keypoints?.filter(k => k.score > 0.3).length || 0} / {poseData.keypoints?.length || 0} keypoints
              </p>

              <button
                onClick={savePoseAnalysis}
                disabled={isSaving}
                className="w-full bg-teal-500/20 hover:bg-teal-500/40 disabled:bg-gray-500/20 border border-teal-500/40 rounded-lg py-2 px-4 text-teal-300 hover:text-teal-100 transition-all font-semibold text-sm"
              >
                {isSaving ? 'Saving…' : '💾 Save Analysis'}
              </button>

              {saveMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-center"
                >
                  {saveMessage}
                </motion.p>
              )}
            </>
          )}
        </motion.div>

        {poseData && !poseData.detected && isRunning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2"
          >
            <span className="text-xs text-yellow-300">⚠️ No pose detected — show full upper body in frame</span>
          </motion.div>
        )}
      </section>

      <section className="glass-card !p-4">
        <h3 className="text-lg font-bold mb-3">Pose Tracking Guide</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Stand with upper body visible — yellow dots = shoulders</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Ensure good lighting for accurate shoulder tracking</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Movement indicator turns green when shoulder motion is detected</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Form score indicates posture quality (higher is better)</p>
          </div>
        </div>
      </section>
    </div>
  );
}
