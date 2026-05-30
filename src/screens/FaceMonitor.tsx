import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Smile, Download } from 'lucide-react';
import FaceDetector, { FaceDetectionResult } from '@/src/components/FaceDetector';
import { motion } from 'motion/react';
import { API_BASE_URL } from '@/src/services/api';

export default function FaceMonitor() {
  const navigate = useNavigate();
  const [faceData, setFaceData] = useState<FaceDetectionResult | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const getEmotionIcon = (emotion?: string): string => {
    switch (emotion) {
      case 'happy':
        return '😊';
      case 'sad':
        return '😢';
      case 'astonished':
        return '😲';
      case 'neutral':
        return '😐';
      default:
        return '🤔';
    }
  };

  const saveFaceAnalysis = async () => {
    if (!faceData) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/health/face-analysis`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb_access_token') || ''}`,
        },
        body: JSON.stringify({
          emotion: faceData.emotion,
          confidence: faceData.confidence,
          timestamp: new Date().toISOString(),
          landmarkCount: faceData.landmarks?.length || 0,
        }),
      });
      if (response.ok) {
        setSaveMessage('✅ Face analysis saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage('❌ Failed to save face analysis');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage('❌ Error saving face analysis');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <Smile size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Face Detection & Mood</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      <section className="glass-card !p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Live Face Detection</h3>
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
          <FaceDetector
            isRunning={isRunning}
            onDetection={setFaceData}
            showCanvas={true}
          />
        </div>

        {faceData && faceData.detected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-teal-500/20 border border-teal-500/30 rounded-lg p-4"
          >
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-white/60 mb-1">Emotion</p>
                <p className="font-bold text-teal-300 text-2xl">{getEmotionIcon(faceData.emotion)}</p>
                <p className="text-sm text-teal-300 capitalize">{faceData.emotion || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-white/60 mb-1">Confidence</p>
                <p className="font-bold text-teal-300 text-lg">{Math.round((faceData.emotionScore || faceData.confidence) * 100)}%</p>
              </div>
              <div>
                <p className="text-xs text-white/60 mb-1">Landmarks</p>
                <p className="font-bold text-teal-300 text-lg">{faceData.landmarks?.length || 0}</p>
              </div>
            </div>

            <button
              onClick={saveFaceAnalysis}
              disabled={isSaving}
              className="w-full bg-teal-500/30 hover:bg-teal-500/50 disabled:bg-gray-500/30 border border-teal-500/50 rounded-lg py-2 px-4 text-teal-300 hover:text-teal-200 transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Download size={16} />
              {isSaving ? 'Saving...' : 'Save Analysis'}
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
          </motion.div>
        )}

        {faceData && !faceData.detected && isRunning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2"
          >
            <span className="text-xs text-yellow-300">⚠️ No face detected - adjust camera position</span>
          </motion.div>
        )}
      </section>

      <section className="glass-card !p-4">
        <h3 className="text-lg font-bold mb-3">Mood Detection Guide</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Face should be well-lit and clearly visible</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Position your face within the detection frame</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Maintain steady head position for best results</p>
          </div>
        </div>
      </section>
    </div>
  );
}
