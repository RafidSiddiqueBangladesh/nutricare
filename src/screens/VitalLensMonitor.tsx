import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { appendHealthResult } from '../lib/healthResults';

const CDN_SRC = 'https://cdn.jsdelivr.net/npm/vitallens/dist/vitallens.browser.js';

function resolveAbsoluteUrl(pathname: string) {
  const base = API_BASE_URL?.trim() || '/api';
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;

  try {
    return new URL(path, base.endsWith('/') ? base : `${base}/`).toString();
  } catch {
    const origin = window.location.origin;
    const absoluteBase = base.startsWith('http://') || base.startsWith('https://')
      ? base
      : `${origin}${base.startsWith('/') ? base : `/${base}`}`;

    return new URL(path, absoluteBase.endsWith('/') ? absoluteBase : `${absoluteBase}/`).toString();
  }
}

type VitalLensClient = {
  startVideoStream: () => Promise<void> | void;
  close: () => Promise<void> | void;
  addEventListener: (eventName: string, callback: (result: any) => void) => void;
};

export default function VitalLensMonitor() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Loading VitalLens...');
  const [lastResult, setLastResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const clientRef = useRef<VitalLensClient | null>(null);
  const navigate = useNavigate();

  const proxyUrl = useMemo(() => resolveAbsoluteUrl('/api/vitallens'), []);
  const saveUrl = useMemo(() => resolveAbsoluteUrl('/api/health/vitals-analysis'), []);

  useEffect(() => {
    let mounted = true;

    const loadScript = async () => {
      if ((window as any).VitalLens) {
        if (mounted) {
          setLoading(false);
          setStatus('Ready');
        }
        return;
      }

      const script = document.createElement('script');
      script.src = CDN_SRC;
      script.type = 'module';
      script.async = true;
      script.onload = () => {
        if (!mounted) return;
        setLoading(false);
        setStatus('Ready');
      };
      script.onerror = () => {
        if (!mounted) return;
        setLoading(false);
        setStatus('Failed to load VitalLens script');
      };
      document.head.appendChild(script);
    };

    loadScript();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const VitalLensCtor = (window as any).VitalLens;
    if (!VitalLensCtor) {
      setStatus('VitalLens library unavailable');
      return;
    }

    const client = new VitalLensCtor({
      method: 'vitallens',
      proxyUrl,
    }) as VitalLensClient;

    clientRef.current = client;

    const onVitals = async (result: any) => {
      setLastResult(result);
      setStatus('Processing vitals...');

      const vitals = result?.vitals ?? result;
      const entry = {
        id: undefined,
        type: 'vitals',
        timestamp: new Date().toISOString(),
        data: {
          vitals,
          heartRate: vitals?.heart_rate?.value ?? vitals?.heart_rate ?? null,
          respiratoryRate: vitals?.respiratory_rate?.value ?? vitals?.respiratory_rate ?? null,
          hrv: vitals?.hrv?.value ?? vitals?.hrv ?? null,
        },
      } as any;

      appendHealthResult(entry);

      try {
        await fetch(saveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vitals, raw: result, timestamp: entry.timestamp }),
        });
      } catch (error) {
        console.warn('vitals save failed', error);
      }
    };

    client.addEventListener('vitals', onVitals);

    const start = async () => {
      setStatus('Starting camera...');
      await client.startVideoStream();
      setStatus('Streaming vitals');
    };

    start().catch((error) => {
      console.error('VitalLens start failed:', error);
      setStatus(error?.message || 'Failed to start VitalLens');
    });

    return () => {
      clientRef.current = null;
      Promise.resolve(client.close?.()).catch(() => undefined);
    };
  }, [loading, proxyUrl, saveUrl]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)}>Back</button>
        <h2>VitalLens — Vital Signs Monitor</h2>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
        <div className="glass-card">
          <p className="text-sm text-white/70">Proxy URL: {proxyUrl}</p>
          <p className="text-sm text-white/70">Status: {status}</p>
          {loading && <p className="text-sm text-white/50">Loading VitalLens library...</p>}
        </div>

        <div className="glass-card">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '100%', borderRadius: 16, background: '#000', minHeight: 280 }}
          />
        </div>

        <div className="glass-card">
          <h3 className="font-bold mb-2">Last result</h3>
          <pre style={{ maxHeight: 360, overflow: 'auto' }}>{JSON.stringify(lastResult, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
