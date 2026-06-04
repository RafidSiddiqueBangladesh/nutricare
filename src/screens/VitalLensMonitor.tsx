import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { appendHealthResult } from '../lib/healthResults';

const CDN_SRC = 'https://cdn.jsdelivr.net/npm/vitallens/dist/vitallens.browser.js';
const VITALLENS_PROXY_URL = new URL('vitallens', `${API_BASE_URL.replace(/\/$/, '')}/`).toString();

export default function VitalLensMonitor() {
  const [loading, setLoading] = useState(true);
  const [lastResult, setLastResult] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const loadScript = async () => {
      if ((window as any).VitalLens) {
        setLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = CDN_SRC;
      script.type = 'module';
      script.async = true;
      script.onload = () => {
        if (!mounted) return;
        setLoading(false);
      };
      script.onerror = () => {
        if (!mounted) return;
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    loadScript();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const createIfMissing = () => {
      const container = containerRef.current;
      if (!container) return null;
      let el = container.querySelector('vitallens-scan') as HTMLElement | null;
      if (!el) {
        el = document.createElement('vitallens-scan');
        // Use backend proxy URL so API key remains on the server
        el.setAttribute('proxy-url', VITALLENS_PROXY_URL);
        container.appendChild(el);
      }
      return el;
    };

    const el = createIfMissing();
    if (!el) return;

    const handler = (ev: any) => {
      const detail = ev?.detail ?? ev?.detail?.result ?? null;
      if (!detail) return;
      setLastResult(detail);

      // Map to our health-result format
      const payload = {
        type: 'vitals',
        timestamp: new Date().toISOString(),
        source: 'vitallens',
        vitals: detail.vitals ?? detail, 
        raw: detail,
      };

      appendHealthResult(payload);

      // POST to backend to persist (backend route added)
      fetch(new URL('health/vitals-analysis', `${API_BASE_URL.replace(/\/$/, '')}/`).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => console.warn('vitals save failed', err));
    };

    // listen for a few possible event names used by the widget
    el.addEventListener('result', handler as EventListener);
    el.addEventListener('vitals', handler as EventListener);
    el.addEventListener('vl-result', handler as EventListener);

    return () => {
      el.removeEventListener('result', handler as EventListener);
      el.removeEventListener('vitals', handler as EventListener);
      el.removeEventListener('vl-result', handler as EventListener);
    };
  }, [containerRef.current, loading]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)}>Back</button>
        <h2>VitalLens — Vital Signs Monitor</h2>
      </div>

      <div ref={containerRef} style={{ marginTop: 12 }}>
        {loading ? (
          <div>Loading VitalLens widget…</div>
        ) : (
          <div>
            <p>Using backend proxy at <strong>/api/vitallens</strong>. The widget will not expose your API key.</p>
            <div id="vitallens-root" />
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Last result</h3>
        <pre style={{ maxHeight: 360, overflow: 'auto' }}>{JSON.stringify(lastResult, null, 2)}</pre>
      </div>
    </div>
  );
}
