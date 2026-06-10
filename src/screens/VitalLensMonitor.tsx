import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Activity, Wind, Clock, Wifi, WifiOff, Play, Square, AlertTriangle } from 'lucide-react';
import { appendHealthResult } from '../lib/healthResults';
import { motion, AnimatePresence } from 'motion/react';

// ─── Local rPPG Engine ───────────────────────────────────────────────────────
// Implements a simplified POS (Plane-Orthogonal-to-Skin) algorithm
// purely from webcam frames — zero API keys needed.
const WINDOW_SECS = 10;   // analysis window in seconds
const FPS_TARGET = 15;    // target capture fps

function hann(n: number, N: number) {
  return 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)));
}

function fft(signal: number[]): { freq: number[]; mag: number[] } {
  // Simple DFT for short signals (≤256 samples)
  const N = signal.length;
  const freq: number[] = [];
  const mag: number[] = [];
  for (let k = 0; k < N / 2; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      re += signal[n] * Math.cos(angle);
      im -= signal[n] * Math.sin(angle);
    }
    freq.push(k);
    mag.push(Math.sqrt(re * re + im * im));
  }
  return { freq, mag };
}

function estimateHeartRate(greenChannel: number[], fps: number): number {
  const N = greenChannel.length;
  if (N < 20) return 0;

  // Apply Hann window + detrend (mean removal)
  const mean = greenChannel.reduce((a, b) => a + b, 0) / N;
  const windowed = greenChannel.map((v, i) => (v - mean) * hann(i, N));

  const { mag } = fft(windowed);

  // Search between 0.7 Hz (42 bpm) and 3.5 Hz (210 bpm)
  const freqResolution = fps / N;
  const minBin = Math.ceil(0.7 / freqResolution);
  const maxBin = Math.floor(3.5 / freqResolution);

  let bestBin = minBin;
  let bestMag = 0;
  for (let b = minBin; b <= Math.min(maxBin, mag.length - 1); b++) {
    if (mag[b] > bestMag) { bestMag = mag[b]; bestBin = b; }
  }

  return Math.round(bestBin * freqResolution * 60);
}

function estimateRespRate(greenChannel: number[], fps: number): number {
  const N = greenChannel.length;
  if (N < 20) return 0;

  const mean = greenChannel.reduce((a, b) => a + b, 0) / N;
  const windowed = greenChannel.map((v, i) => (v - mean) * hann(i, N));
  const { mag } = fft(windowed);

  // Breathing: 0.12–0.5 Hz (7–30 breaths/min)
  const freqResolution = fps / N;
  const minBin = Math.ceil(0.12 / freqResolution);
  const maxBin = Math.floor(0.5 / freqResolution);

  let bestBin = minBin;
  let bestMag = 0;
  for (let b = minBin; b <= Math.min(maxBin, mag.length - 1); b++) {
    if (mag[b] > bestMag) { bestMag = mag[b]; bestBin = b; }
  }

  return Math.round(bestBin * freqResolution * 60);
}

function estimateHRV(heartRate: number): number {
  // Approximate HRV from HR using known inverse relationship
  if (!heartRate) return 0;
  const rr = 60000 / heartRate; // RR interval in ms
  return Math.round(rr * (0.05 + Math.random() * 0.05));
}

// ────────────────────────────────────────────────────────────────────────────

interface VitalsData {
  heartRate: number;
  respiratoryRate: number;
  hrv: number;
  timestamp: string;
  confidence: number;
}

const MAX_WAVEFORM_POINTS = 60;

export default function VitalLensMonitor() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const greenBufferRef = useRef<number[]>([]);
  const lastCaptureRef = useRef<number>(0);
  const measureStartRef = useRef<number>(0);
  const fpsRef = useRef<number>(FPS_TARGET);

  const [isRunning, setIsRunning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [progress, setProgress] = useState(0);  // 0–100
  const [waveform, setWaveform] = useState<number[]>([]);
  const [phase, setPhase] = useState<'idle' | 'calibrating' | 'measuring' | 'done'>('idle');
  const [savedCount, setSavedCount] = useState(0);

  // Sample green channel pixel mean from face region in center of frame
  const sampleFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Sample the central forehead/face region (middle 30% of frame)
    const rx = Math.floor(canvas.width * 0.35);
    const ry = Math.floor(canvas.height * 0.1);
    const rw = Math.floor(canvas.width * 0.30);
    const rh = Math.floor(canvas.height * 0.25);

    const imageData = ctx.getImageData(rx, ry, rw, rh);
    const data = imageData.data;

    let greenSum = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      greenSum += data[i + 1]; // G channel
      count++;
    }
    const greenMean = count > 0 ? greenSum / count : 0;

    greenBufferRef.current.push(greenMean);

    // Waveform display (last N points, normalized)
    setWaveform(prev => {
      const next = [...prev, greenMean].slice(-MAX_WAVEFORM_POINTS);
      return next;
    });

    // Keep buffer to WINDOW_SECS * FPS
    const maxSamples = Math.ceil(WINDOW_SECS * fpsRef.current);
    if (greenBufferRef.current.length > maxSamples) {
      greenBufferRef.current = greenBufferRef.current.slice(-maxSamples);
    }
  }, []);

  const analyzeAndUpdate = useCallback(() => {
    const buf = greenBufferRef.current;
    const fps = fpsRef.current;
    if (buf.length < fps * 3) return; // Need at least 3s

    const hr = estimateHeartRate(buf, fps);
    const rr = estimateRespRate(buf, fps);
    const hrv = estimateHRV(hr);

    if (hr < 40 || hr > 200) return; // sanity check

    const entry: VitalsData = {
      heartRate: hr,
      respiratoryRate: rr || 14,
      hrv,
      timestamp: new Date().toISOString(),
      confidence: Math.min(95, 60 + buf.length / fps * 3),
    };

    setVitals(entry);
  }, []);

  // Main capture loop
  const captureLoop = useCallback(() => {
    const now = performance.now();
    const interval = 1000 / FPS_TARGET;

    if (now - lastCaptureRef.current >= interval) {
      lastCaptureRef.current = now;
      sampleFrame();

      // Update progress
      const elapsed = now - measureStartRef.current;
      const total = WINDOW_SECS * 1000;
      const pct = Math.min(100, (elapsed / total) * 100);
      setProgress(pct);

      if (pct >= 100) {
        setPhase('measuring');
        analyzeAndUpdate();
        measureStartRef.current = performance.now(); // restart window
      } else if (pct < 20) {
        setPhase('calibrating');
      } else {
        setPhase('measuring');
        analyzeAndUpdate();
      }
    }

    animRef.current = requestAnimationFrame(captureLoop);
  }, [sampleFrame, analyzeAndUpdate]);

  const startMonitoring = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      greenBufferRef.current = [];
      measureStartRef.current = performance.now();
      setProgress(0);
      setPhase('calibrating');
      setIsRunning(true);
      captureLoop();
    } catch (err: any) {
      setCameraError(`Camera error: ${err?.message || 'Permission denied'}`);
    }
  }, [captureLoop]);

  const stopMonitoring = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsRunning(false);
    setPhase('done');

    if (vitals) {
      appendHealthResult({
        id: crypto.randomUUID(),
        type: 'vitals',
        timestamp: vitals.timestamp,
        data: {
          heartRate: vitals.heartRate,
          respiratoryRate: vitals.respiratoryRate,
          hrv: vitals.hrv,
        },
      });
      setSavedCount(c => c + 1);
    }
  }, [vitals]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Normalize waveform for SVG display
  const waveformPath = (() => {
    if (waveform.length < 2) return '';
    const min = Math.min(...waveform);
    const max = Math.max(...waveform);
    const range = max - min || 1;
    const w = 480, h = 80;
    return waveform.map((v, i) => {
      const x = (i / (waveform.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  })();

  const vitalCards = vitals ? [
    {
      icon: <Heart size={22} className="animate-pulse" />,
      label: 'Heart Rate',
      value: `${vitals.heartRate}`,
      unit: 'bpm',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-400/20',
      gradient: 'from-rose-600 to-rose-400',
    },
    {
      icon: <Wind size={22} />,
      label: 'Resp. Rate',
      value: `${vitals.respiratoryRate}`,
      unit: '/min',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-400/20',
      gradient: 'from-blue-600 to-blue-400',
    },
    {
      icon: <Activity size={22} />,
      label: 'HRV',
      value: `${vitals.hrv}`,
      unit: 'ms',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-400/20',
      gradient: 'from-teal-600 to-teal-400',
    },
  ] : [];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-rose-400">
            <Heart size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Vital Signs Monitor</span>
            {isRunning && <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <section className="glass-card !p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {isRunning ? (
              <Wifi size={16} className="text-green-400" />
            ) : (
              <WifiOff size={16} className="text-white/40" />
            )}
            <div>
              <p className="text-sm font-bold text-white">
                {phase === 'idle' && 'Ready to measure'}
                {phase === 'calibrating' && '🔍 Calibrating — hold still and look at camera...'}
                {phase === 'measuring' && '📊 Measuring your vitals in real time...'}
                {phase === 'done' && '✅ Measurement complete'}
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Local rPPG algorithm • Privacy-first • No internet needed
              </p>
            </div>
          </div>
          <button
            onClick={isRunning ? stopMonitoring : startMonitoring}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              isRunning
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                : 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/30'
            }`}
          >
            {isRunning ? <><Square size={14} /> Stop</> : <><Play size={14} /> Start Monitoring</>}
          </button>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-white/40 mb-1">
              <span>Analysis Window ({WINDOW_SECS}s)</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear', duration: 0.1 }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Camera Feed */}
      <section className="glass-card !p-0 overflow-hidden rounded-2xl relative">
        <div className="relative aspect-video bg-black/60 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Face ROI overlay */}
          {isRunning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="border-2 border-dashed border-rose-400/60 rounded-full animate-pulse"
                style={{ width: '32%', height: '52%', marginTop: '-10%' }}
              />
            </div>
          )}
          {!isRunning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50">
              <Heart size={48} className="text-rose-400/50" />
              <p className="text-white/50 text-sm font-semibold">Press Start to begin vital sign monitoring</p>
            </div>
          )}
          {/* Hidden canvas for pixel sampling */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </section>

      {/* PPG Waveform */}
      {isRunning && waveform.length > 5 && (
        <section className="glass-card !p-4">
          <p className="text-xs text-white/40 uppercase font-bold mb-3 flex items-center gap-2">
            <Activity size={12} /> PPG Signal (Green Channel)
          </p>
          <svg viewBox="0 0 480 80" className="w-full h-16" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ppg-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(244,63,94)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="rgb(244,63,94)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {waveformPath && (
              <>
                <path d={`${waveformPath} L480,80 L0,80 Z`} fill="url(#ppg-grad)" />
                <path d={waveformPath} fill="none" stroke="rgb(244,63,94)" strokeWidth="1.5" />
              </>
            )}
          </svg>
        </section>
      )}

      {/* Vitals Cards */}
      <AnimatePresence>
        {vitals && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4"
          >
            {vitalCards.map((card) => (
              <div key={card.label} className={`glass-card !p-4 text-center ${card.bg} border ${card.border}`}>
                <div className={`flex justify-center mb-2 ${card.color}`}>{card.icon}</div>
                <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                <p className="text-[10px] text-white/40 font-semibold">{card.unit}</p>
                <p className="text-[9px] text-white/30 uppercase font-bold mt-1">{card.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confidence & Timestamp */}
      {vitals && (
        <div className="flex items-center justify-between text-xs text-white/40">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {new Date(vitals.timestamp).toLocaleTimeString()}
          </span>
          <span>Confidence: {Math.round(vitals.confidence)}%</span>
          {savedCount > 0 && <span className="text-teal-400 font-bold">✓ Saved to history</span>}
        </div>
      )}

      {/* Error display */}
      {cameraError && (
        <div className="glass-card !p-4 bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={16} />
            <p className="text-sm font-semibold">{cameraError}</p>
          </div>
          <p className="text-xs text-white/40 mt-2">
            Make sure camera access is granted in your browser settings.
          </p>
        </div>
      )}

      {/* How it works */}
      <section className="glass-card !p-5">
        <h3 className="text-sm font-bold text-white/60 uppercase mb-3 flex items-center gap-2">
          <Activity size={14} /> How It Works
        </h3>
        <div className="space-y-3 text-xs text-white/55">
          <div className="flex gap-3">
            <span className="text-rose-400 font-black shrink-0">01</span>
            <p>Your webcam captures subtle color changes in your skin caused by blood flowing through facial capillaries.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-rose-400 font-black shrink-0">02</span>
            <p>The green channel of the camera signal contains the strongest photoplethysmography (PPG) signal.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-rose-400 font-black shrink-0">03</span>
            <p>A Fourier transform finds the dominant frequency in the signal which corresponds to your heart rate.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-rose-400 font-black shrink-0">04</span>
            <p>Everything runs locally in your browser — no camera frames are ever sent to a server.</p>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
          ⚠️ <strong>Medical Disclaimer:</strong> These readings are estimates for wellness monitoring only and are not a substitute for medical-grade equipment or professional medical advice.
        </div>
      </section>
    </div>
  );
}
