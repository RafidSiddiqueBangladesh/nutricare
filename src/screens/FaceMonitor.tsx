import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Smile, Download } from 'lucide-react';
import FaceDetector, { FaceDetectionResult } from '@/src/components/FaceDetector';
import { motion } from 'motion/react';
import { API_BASE_URL } from '@/src/services/api';
import { appendHealthResult } from '@/src/lib/healthResults';
import { useTheme } from '@/src/contexts/ThemeContext';

type ThemeMood = 'Happy' | 'Sad' | 'Neutral' | 'Astonished';

function toThemeMood(emotion?: string): ThemeMood {
  switch (emotion) {
    case 'happy':      return 'Happy';
    case 'sad':        return 'Sad';
    case 'astonished': return 'Astonished';
    default:           return 'Neutral';
  }
}

const EMOTION_STYLES: Record<string, { bg: string; border: string; text: string; emoji: string }> = {
  happy:      { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-300', emoji: '😊' },
  sad:        { bg: 'bg-blue-500/20',   border: 'border-blue-500/30',   text: 'text-blue-300',   emoji: '😢' },
  astonished: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-300', emoji: '😲' },
  neutral:    { bg: 'bg-teal-500/20',   border: 'border-teal-500/30',   text: 'text-teal-300',   emoji: '😐' },
};

export default function FaceMonitor() {
  const navigate = useNavigate();
  const { setMood } = useTheme();
  const [faceData, setFaceData] = useState<FaceDetectionResult | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleDetection = useCallback((result: FaceDetectionResult) => {
    setFaceData(result);
    // Sync detected mood to theme context so MoodSuggestions uses it
    if (result.detected && result.emotion) {
      setMood(toThemeMood(result.emotion));
    }
  }, [setMood]);

  const saveFaceAnalysis = async () => {
    if (!faceData) return;
    setIsSaving(true);
    setSaveMessage(null);
    const timestamp = new Date().toISOString();
    try {
      appendHealthResult({
        id: crypto.randomUUID(),
        type: 'face',
        timestamp,
        data: {
          confidence: faceData.confidence,
          emotion: faceData.emotion,
        },
      });

      const response = await fetch(`${API_BASE_URL}/health/face-analysis`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb_access_token') || ''}`,
        },
        body: JSON.stringify({
          emotion: faceData.emotion,
          confidence: faceData.confidence,
          timestamp,
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

  const emotion     = faceData?.emotion || 'neutral';
  const style       = EMOTION_STYLES[emotion] ?? EMOTION_STYLES.neutral;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <Smile size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Face Detection &amp; Mood</span>
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
            onDetection={handleDetection}
            showCanvas={true}
          />
        </div>

        {/* Always-visible emotion status */}
        <motion.div
          key={emotion}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${style.bg} border ${style.border} rounded-xl p-4 flex flex-col gap-3`}
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-white/60 mb-1">Emotion</p>
              <p className={`font-black text-3xl`}>{style.emoji}</p>
              <p className={`text-sm font-bold capitalize ${style.text}`}>{emotion}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Confidence</p>
              <p className={`font-bold text-lg ${style.text}`}>
                {faceData ? `${Math.round((faceData.emotionScore || faceData.confidence) * 100)}%` : '--'}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Landmarks</p>
              <p className={`font-bold text-lg ${style.text}`}>
                {faceData?.landmarks?.length ?? '--'}
              </p>
            </div>
          </div>

          {/* Mood interpretation note */}
          <div className="bg-black/20 rounded-lg px-3 py-2 text-xs text-white/70">
            {emotion === 'happy'
              ? '😊 You look happy! Mouth open / smiling detected. Mood Suggestions will show positive content.'
              : emotion === 'sad'
              ? '😢 Feeling down? Tight expression detected. Mood Suggestions will offer comfort.'
              : emotion === 'astonished'
              ? '😲 Wide eyes and open mouth detected — looking surprised!'
              : '😐 Neutral expression — relaxed and composed. Mood Suggestions will show balanced content.'}
          </div>

          {faceData?.detected && (
            <>
              <button
                onClick={saveFaceAnalysis}
                disabled={isSaving}
                className="w-full bg-white/10 hover:bg-white/20 disabled:bg-gray-500/10 border border-white/20 rounded-lg py-2 px-4 text-white hover:text-white transition-all flex items-center justify-center gap-2 font-semibold text-sm"
              >
                <Download size={15} />
                {isSaving ? 'Saving…' : 'Save Analysis'}
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

        {faceData && !faceData.detected && isRunning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2"
          >
            <span className="text-xs text-yellow-300">⚠️ No face detected — adjust camera position</span>
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
            <p className="text-white/70">Open your mouth / smile → detected as <strong>Happy</strong></p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Keep mouth closed, relaxed → <strong>Neutral</strong></p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400 mt-0.5">✓</span>
            <p className="text-white/70">Detected mood automatically updates Mood Suggestions page</p>
          </div>
        </div>
      </section>
    </div>
  );
}
