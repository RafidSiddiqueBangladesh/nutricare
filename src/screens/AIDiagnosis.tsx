import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Sparkles,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader,
  Send,
  RefreshCw,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { apiService } from '@/src/services/api';
import FaceDetector, { FaceDetectionResult } from '@/src/components/FaceDetector';
import { useCanvasCapture } from '@/src/hooks/useMedia';

export default function AIDiagnosis() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<'camera' | 'analysis'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [faceData, setFaceData] = useState<FaceDetectionResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedEmotion, setCapturedEmotion] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { canvasRef, captureFrame } = useCanvasCapture(videoRef as any);

  const handleCapture = async () => {
    setError('');
    const frameData = captureFrame();
    if (!frameData) {
      setError('Could not capture screenshot. Ensure camera is active.');
      return;
    }

    const emotion = faceData?.emotion || 'neutral';
    setCapturedImage(frameData);
    setCapturedEmotion(emotion);
    setActiveStep('analysis');
    setIsLoading(true);
    setIsCameraActive(false);

    try {
      const promptText = `You are a professional medical AI assistant.
A patient has captured a screenshot of their face for analysis.
The facial emotion detected is: ${emotion.toUpperCase()} (${emotion === 'happy' ? 'Happy/Cheerful' : emotion === 'sad' ? 'Sad/Depressed' : emotion === 'astonished' ? 'Astonished/Surprised' : 'Neutral'}).

Based ONLY on this facial analysis and emotional state:
1. Provide a professional assessment of their emotional state and potential mental health implications (e.g. stress, fatigue, mood disorders).
2. Suggest lifestyle, dietary, and physical activity adjustments.
3. List potential symptoms or early warning signs they should watch out for.
4. Give a clear disclaimer that this is for educational purposes only and not a clinical diagnosis.`;

      const response = await apiService.chat(promptText);

      if (response.success && response.data?.text) {
        setDiagnosis(response.data.text);
      } else {
        setError(response.message || 'Failed to generate AI diagnosis');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Diagnosis generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDiagnosis('');
    setCapturedImage(null);
    setCapturedEmotion('');
    setError('');
    setIsCameraActive(true);
    setActiveStep('camera');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/health/disease')}
          className="p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <Sparkles size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">AI Face Diagnosis</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-2"
        >
          <AlertCircle size={16} className="text-red-400" />
          <span className="text-xs text-red-300">{error}</span>
        </motion.div>
      )}

      {/* Step 1: Camera Feed */}
      {activeStep === 'camera' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 px-4"
        >
          <div className="glass-card !p-4 flex flex-col gap-4">
            <h3 className="text-lg font-bold">Capture Face Screenshot</h3>
            <p className="text-xs text-white/50">
              Align your face in the camera frame. The AI will analyze your facial expression (such as happy or sad) to diagnose potential indicators.
            </p>

            <div className="aspect-video rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 relative shadow-inner">
              <FaceDetector
                isRunning={isCameraActive}
                onDetection={setFaceData}
                showCanvas={true}
                videoRef={videoRef}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {faceData && faceData.detected && (
              <div className="bg-teal-500/20 border border-teal-500/30 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-teal-400" />
                  <span className="text-xs font-bold text-teal-300">Face Detected</span>
                </div>
                {faceData.emotion && (
                  <span className="bg-teal-500 text-teal-950 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                    {faceData.emotion === 'happy' ? '😊 Happy' : faceData.emotion === 'sad' ? '😢 Sad' : faceData.emotion === 'astonished' ? '😲 Astonished' : '😐 Neutral'}
                  </span>
                )}
              </div>
            )}

            <button
              onClick={handleCapture}
              disabled={!faceData?.detected}
              className="py-3.5 btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 transition-all font-bold"
            >
              <Camera size={18} />
              Capture & Analyze Face
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Analysis Results */}
      {activeStep === 'analysis' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 px-4 pb-8"
        >
          <div className="grid md:grid-cols-[260px_1fr] gap-4">
            {/* Captured Screenshot Preview */}
            <div className="glass-card !p-4 flex flex-col gap-4 items-center">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white/50 w-full text-left">Captured Photo</h4>
              {capturedImage ? (
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-black ring-1 ring-white/10">
                  <img src={capturedImage} alt="Captured face screenshot" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full aspect-square bg-white/5 rounded-xl flex items-center justify-center text-white/30 text-xs">
                  No image captured
                </div>
              )}
              {capturedEmotion && (
                <div className="w-full bg-teal-500/15 border border-teal-500/25 rounded-xl py-2 px-3 text-center">
                  <p className="text-[10px] text-teal-300 font-bold uppercase">Detected Emotion</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {capturedEmotion === 'happy' ? '😊 Happy / Cheerful' : capturedEmotion === 'sad' ? '😢 Sad / Depressed' : capturedEmotion === 'astonished' ? '😲 Astonished' : '😐 Neutral'}
                  </p>
                </div>
              )}
            </div>

            {/* AI Diagnosis Insights */}
            <div className="glass-card !p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={20} className="text-teal-400" />
                <h3 className="text-xl font-black">AI Diagnosis Analysis</h3>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <Loader size={36} className="text-teal-400 animate-spin" />
                  <p className="text-white/60 text-sm">Connecting to OpenRouter...</p>
                  <p className="text-[10px] text-white/40 max-w-[200px]">Generating medical assessment based on your facial indicators.</p>
                </div>
              ) : (
                <>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 font-sans leading-relaxed text-sm text-white/95 whitespace-pre-wrap">
                    {diagnosis}
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5">
                    <Heart size={16} className="text-red-400 mt-0.5 flex-shrink-0 animate-pulse" />
                    <p className="text-[11px] text-red-200 leading-normal">
                      <strong>Medical Disclaimer:</strong> This assessment is automatically generated based on computer-vision facial state analysis and does not constitute official clinical advice. Please visit a certified practitioner or hospital for actual diagnostic consultation.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} />
                      Scan Again
                    </button>
                    <button
                      onClick={() => navigate('/health/disease')}
                      className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-teal-950 rounded-xl font-bold text-sm transition-all"
                    >
                      Return to Health
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
