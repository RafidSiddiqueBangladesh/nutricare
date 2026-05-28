import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  Sparkles,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader,
  Send,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { apiService } from '@/src/services/api';
import FaceDetector, { FaceDetectionResult } from '@/src/components/FaceDetector';
import { useCamera, useCanvasCapture } from '@/src/hooks/useMedia';

interface DiagnosisData {
  symptoms: string[];
  vitals: {
    heartRate?: number;
    bloodPressure?: string;
    temperature?: number;
  };
  imageData?: string;
  detectedConditions?: string[];
}

export default function AIDiagnosis() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<'input' | 'camera' | 'analysis'>('input');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [vitals, setVitals] = useState({
    heartRate: '',
    bloodPressure: '',
    temperature: '',
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceData, setFaceData] = useState<FaceDetectionResult | null>(null);
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { videoRef, startCamera, stopCamera } = useCamera();
  const { canvasRef, captureFrame } = useCanvasCapture(videoRef);

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleCapture = () => {
    const frameData = captureFrame();
    if (frameData) {
      // Store image data for diagnosis
      setActiveStep('analysis');
    }
  };

  const handleAnalyze = async () => {
    if (symptoms.length === 0) {
      setError('Please enter at least one symptom');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const diagnosisData: DiagnosisData = {
        symptoms,
        vitals: {
          heartRate: vitals.heartRate ? parseInt(vitals.heartRate) : undefined,
          bloodPressure: vitals.bloodPressure || undefined,
          temperature: vitals.temperature ? parseFloat(vitals.temperature) : undefined,
        },
        detectedConditions: faceData ? ['face_detected'] : undefined,
      };

      const response = await apiService.analyzeDiagnosis(diagnosisData);

      if (response.success && response.data?.text) {
        setDiagnosis(response.data.text);
        setActiveStep('analysis');
      } else {
        setError(response.message || 'Failed to analyze diagnosis');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/health')}
          className="p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <Sparkles size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">AI Diagnosis</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2 px-4">
        {(['input', 'camera', 'analysis'] as const).map((step, i) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => activeStep === 'analysis' && setActiveStep(step)}
              className={cn(
                'w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all',
                activeStep === step || step === 'analysis'
                  ? 'bg-teal-500 text-teal-950'
                  : 'bg-white/10 text-white/60'
              )}
            >
              {i + 1}
            </button>
            {i < 2 && (
              <div
                className={cn(
                  'h-0.5 w-8 mx-1 transition-all',
                  activeStep === step || step === 'analysis'
                    ? 'bg-teal-500'
                    : 'bg-white/10'
                )}
              />
            )}
          </div>
        ))}
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

      {/* Step 1: Input Symptoms & Vitals */}
      {activeStep === 'input' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 px-4"
        >
          <div className="glass-card !p-4 flex flex-col gap-4">
            <h3 className="text-lg font-bold">Your Symptoms</h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                placeholder="e.g., headache, fever, cough..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
              />
              <button
                onClick={addSymptom}
                className="bg-teal-500 hover:bg-teal-400 text-teal-950 px-4 py-2 rounded-lg font-bold text-sm transition-all"
              >
                Add
              </button>
            </div>

            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => removeSymptom(i)}
                    className="bg-teal-500/30 hover:bg-teal-500/50 text-teal-300 px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-2"
                  >
                    {symptom}
                    <span>×</span>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card !p-4 flex flex-col gap-4">
            <h3 className="text-lg font-bold">Vital Signs (Optional)</h3>

            <div className="flex flex-col gap-3">
              <input
                type="number"
                value={vitals.heartRate}
                onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                placeholder="Heart Rate (bpm)"
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
              />
              <input
                type="text"
                value={vitals.bloodPressure}
                onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                placeholder="Blood Pressure (e.g., 120/80)"
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
              />
              <input
                type="number"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                step="0.1"
                placeholder="Temperature (°C)"
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="flex gap-2 pb-4">
            <button
              onClick={() => setActiveStep('camera')}
              className="flex-1 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
            >
              <Camera size={18} />
              Add Face Photo
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || symptoms.length === 0}
              className="flex-1 py-3 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
              Analyze
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Camera */}
      {activeStep === 'camera' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 px-4"
        >
          <div className="glass-card !p-4 flex flex-col gap-4">
            <h3 className="text-lg font-bold">Capture Face Photo</h3>

            {!isCameraActive ? (
              <button
                onClick={() => {
                  setIsCameraActive(true);
                  startCamera();
                }}
                className="py-8 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Start Camera
              </button>
            ) : (
              <>
                <div className="aspect-video rounded-lg overflow-hidden bg-black ring-1 ring-white/10">
                  <FaceDetector
                    isRunning={isCameraActive}
                    onDetection={setFaceData}
                    showCanvas={true}
                  />
                </div>

                {faceData && faceData.detected && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-xs font-bold text-green-300">Face detected</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      stopCamera();
                      setIsCameraActive(false);
                      setActiveStep('input');
                    }}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCapture}
                    disabled={!faceData?.detected}
                    className="flex-1 py-3 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Camera size={18} />
                    Capture
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Step 3: Analysis Results */}
      {activeStep === 'analysis' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 px-4 pb-8"
        >
          {diagnosis ? (
            <div className="glass-card !p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-teal-400" />
                <h3 className="text-lg font-bold">AI Diagnosis Analysis</h3>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                  {diagnosis}
                </p>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                  ⚠️ This is an AI-generated analysis for educational purposes only. Please consult
                  with a healthcare professional for proper diagnosis and treatment.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setActiveStep('input');
                    setDiagnosis('');
                    setSymptoms([]);
                    setVitals({ heartRate: '', bloodPressure: '', temperature: '' });
                  }}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all"
                >
                  New Analysis
                </button>
                <button
                  onClick={() => navigate('/health')}
                  className="flex-1 py-3 btn-primary"
                >
                  Back to Health
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card !p-8 flex flex-col items-center gap-4 text-center">
              <Loader size={32} className="text-teal-400 animate-spin" />
              <p className="text-white/60 text-sm">Analyzing your health information...</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
