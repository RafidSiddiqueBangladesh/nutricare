import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Activity, Wind, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../services/api';
import { appendHealthResult } from '../lib/healthResults';
import { motion, AnimatePresence } from 'motion/react';

const CDN_SRC = 'https://cdn.jsdelivr.net/npm/vitallens/dist/vitallens.browser.js';

function resolveAbsoluteUrl(pathname: string) {
  // Always use the backend proxy URL directly (not relative)
  const base = (API_BASE_URL?.trim() || '').replace(/\/$/, '');
  let path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (base.startsWith('http')) {
    if (base.endsWith('/api') && path.startsWith('/api/')) {
      path = path.substring(4);
    }
    return `${base}${path}`;
  }
  const origin = window.location.origin;
  return `${origin}${path}`;
}

type VitalLensClient = {
  startVideoStream: () => Promise<void> | void;
  close: () => Promise<void> | void;
  addEventListener: (eventName: string, callback: (result: any) => void) => void;
  setVideoStream?: (stream: MediaStream, videoElement: HTMLVideoElement) => void;
};

interface VitalsData {
  heartRate: number | null;
  respiratoryRate: number | null;
  hrv: number | null;
  timestamp: string;
}

export default function VitalLensMonitor() {
  const [scriptLoading, setScriptLoading] = useState(true);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [rawResult, setRawResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const clientRef = useRef<VitalLensClient | null>(null);
  const navigate = useNavigate();

  const proxyUrl = useMemo(() => resolveAbsoluteUrl('/api/vitallens'), []);
  const saveUrl  = useMemo(() => resolveAbsoluteUrl('/api/health/vitals-analysis'), []);

  // Load CDN script
  useEffect(() => {
    let mounted = true;

    if ((window as any).VitalLens) {
      setScriptLoading(false);
      setScriptReady(true);
      return;
    }

    import(/* @vite-ignore */ CDN_SRC)
      .then((module) => {
        if (!mounted) return;
        const VitalLens = module.VitalLens || module.default;
        if (VitalLens) {
          (window as any).VitalLens = VitalLens;
          setScriptLoading(false);
          setScriptReady(true);
        } else {
          setScriptLoading(false);
          setScriptError('VitalLens library loaded but global not found. This browser may not support the required features.');
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setScriptLoading(false);
        setScriptError('Failed to load VitalLens CDN script. Check your internet connection or try a supported browser.');
        console.error('VitalLens import error:', err);
      });

    return () => { mounted = false; };
  }, []);

  // Start VitalLens once script is ready
  useEffect(() => {
    if (!scriptReady) return;

    const VitalLensCtor = (window as any).VitalLens;
    if (!VitalLensCtor) {
      setScriptError('VitalLens constructor not available after loading. This feature requires a Chromium-based browser.');
      return;
    }

    let client: VitalLensClient;
    try {
      client = new VitalLensCtor({ method: 'vitallens', proxyUrl }) as VitalLensClient;
      clientRef.current = client;
    } catch (err: any) {
      setScriptError(`VitalLens initialization error: ${err?.message || String(err)}`);
      return;
    }

    const onVitals = async (result: any) => {
      setRawResult(result);
      const v = result?.vitals ?? result;

      const entry: VitalsData = {
        heartRate:       v?.heart_rate?.value ?? v?.heart_rate ?? null,
        respiratoryRate: v?.respiratory_rate?.value ?? v?.respiratory_rate ?? null,
        hrv:             v?.hrv?.value ?? v?.hrv ?? null,
        timestamp:       new Date().toISOString(),
      };

      setVitals(entry);

      appendHealthResult({
        id: crypto.randomUUID(),
        type: 'vitals',
        timestamp: entry.timestamp,
        data: {
          vitals: v,
          heartRate: entry.heartRate ?? undefined,
          respiratoryRate: entry.respiratoryRate ?? undefined,
          hrv: entry.hrv ?? undefined,
        },
      });

      try {
        await fetch(saveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vitals: v, raw: result, timestamp: entry.timestamp }),
        });
      } catch (err) {
        console.warn('vitals save failed', err);
      }
    };

    client.addEventListener('vitals', onVitals);

    let activeStream: MediaStream | null = null;

    const start = async () => {
      setStreamError(null);
      setStreaming(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        activeStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        if (client && typeof client.setVideoStream === 'function') {
          client.setVideoStream(stream, videoRef.current!);
        }

        await client.startVideoStream();
      } catch (err: any) {
        setStreaming(false);
        setStreamError(`Stream error: ${err?.message || 'Unknown error'}`);
        console.error('VitalLens stream error:', err);
      }
    };

    start();

    return () => {
      clientRef.current = null;
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      Promise.resolve(client?.close?.()).catch(() => undefined);
    };
  }, [scriptReady, proxyUrl, saveUrl]);

  const vitalCards = vitals ? [
    { icon: <Heart size={18} />, label: 'Heart Rate', value: vitals.heartRate ? `${vitals.heartRate} bpm` : '--', color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-400/25' },
    { icon: <Wind size={18} />, label: 'Resp. Rate', value: vitals.respiratoryRate ? `${vitals.respiratoryRate} /min` : '--', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-400/25' },
    { icon: <Activity size={18} />, label: 'HRV', value: vitals.hrv ? `${vitals.hrv} ms` : '--', color: 'text-teal-400', bg: 'bg-teal-500/15', border: 'border-teal-400/25' },
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
            <span className="text-xs font-bold uppercase tracking-wider">VitalLens — Vital Signs</span>
            {streaming && <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
          </div>
        </div>
      </div>

      {/* Status card */}
      <section className="glass-card !p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 font-bold uppercase">Proxy URL</span>
            <code className="text-xs text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded overflow-hidden text-ellipsis max-w-[260px]">
              {proxyUrl}
            </code>
          </div>

          <div className="flex items-center gap-2">
            {scriptLoading && (
              <>
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-sm text-yellow-300">Loading VitalLens library…</span>
              </>
            )}
            {!scriptLoading && scriptReady && !streaming && (
              <>
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-sm text-yellow-300">Starting camera stream…</span>
              </>
            )}
            {!scriptLoading && scriptReady && streaming && (
              <>
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm text-green-300 font-semibold">✅ Streaming vitals — look into camera</span>
              </>
            )}
            {(scriptError || streamError) && (
              <>
                <AlertTriangle size={16} className="text-amber-400" />
                <span className="text-sm text-amber-300">{scriptError || streamError}</span>
              </>
            )}
          </div>

          {/* Guidance when library unavailable */}
          {scriptError && (
            <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg p-3 text-xs text-amber-200 leading-relaxed">
              <p className="font-bold mb-1">ℹ️ VitalLens Troubleshooting</p>
              <ul className="space-y-1 text-white/70">
                <li>• VitalLens requires a Chromium-based browser (Chrome / Edge)</li>
                <li>• The backend proxy must be reachable at: <code className="text-teal-300">{proxyUrl}</code></li>
                <li>• If proxy returns 404/error, the backend route <code className="text-teal-300">/api/vitallens</code> may not be configured</li>
                <li>• Ensure camera permission is granted</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Camera feed */}
      <section className="glass-card !p-0 aspect-video overflow-hidden rounded-2xl">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ background: '#000', minHeight: 200 }}
        />
        {!streaming && !scriptError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-white/60 text-sm">Camera initializing…</p>
          </div>
        )}
      </section>

      {/* Vitals Cards */}
      <AnimatePresence>
        {vitals && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {vitalCards.map(card => (
              <div
                key={card.label}
                className={`glass-card !p-4 text-center ${card.bg} border ${card.border}`}
              >
                <div className={`flex justify-center mb-2 ${card.color}`}>{card.icon}</div>
                <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                <p className="text-[10px] text-white/50 font-bold uppercase mt-1">{card.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {vitals && (
        <p className="text-xs text-white/40 text-center">
          <Clock size={11} className="inline mr-1" />
          Last reading: {new Date(vitals.timestamp).toLocaleTimeString()}
        </p>
      )}

      {/* Raw result (collapsible debug) */}
      {rawResult && (
        <section className="glass-card !p-4">
          <h3 className="font-bold text-sm mb-2 text-white/60">Raw VitalLens Result</h3>
          <pre className="text-xs text-white/50 max-h-56 overflow-auto leading-relaxed">
            {JSON.stringify(rawResult, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
