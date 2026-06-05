import { useEffect, useRef, useState } from "react";
import TrackingShell from "@/components/tracking/TrackingShell";
import { Activity, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveTrackingResult } from "@/lib/saveTrackingResult";
import { useToast } from "@/hooks/use-toast";

import { usePreviewMode } from "@/hooks/usePreviewMode";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";

const TremorPage = () => {
  const { isPreviewMode, handleSaveAttempt } = usePreviewMode();
  const [running, setRunning] = useState(false);
  const [stability, setStability] = useState<number | null>(null);
  const [movements, setMovements] = useState<number[]>([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const samplesRef = useRef<number[]>([]);
  const lastRef = useRef<{ a: number; b: number; g: number } | null>(null);
  const { toast } = useToast();

  const start = async () => {
    samplesRef.current = [];
    setMovements([]);
    setStability(null);

    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
    if (DOE?.requestPermission) {
      try { await DOE.requestPermission(); } catch { /* ignore */ }
    }
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      const arr = samplesRef.current;
      const score = arr.length ? Math.min(100, Math.round(100 - (arr.reduce((a, b) => a + b, 0) / arr.length) * 4)) : 0;
      setStability(Math.max(0, score));
      setMovements(arr);
    }, 8000);
  };

  useEffect(() => {
    if (!running) return;
    const handler = (e: DeviceOrientationEvent) => {
      const a = e.alpha ?? 0, b = e.beta ?? 0, g = e.gamma ?? 0;
      setTilt({ x: g, y: b });
      if (lastRef.current) {
        const d = Math.abs(a - lastRef.current.a) + Math.abs(b - lastRef.current.b) + Math.abs(g - lastRef.current.g);
        samplesRef.current.push(d);
      }
      lastRef.current = { a, b, g };
    };
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [running]);

  // Mouse fallback for desktops without gyroscope
  useEffect(() => {
    if (!running) return;
    let last = { x: 0, y: 0 };
    const handler = (e: MouseEvent) => {
      const d = Math.abs(e.movementX) + Math.abs(e.movementY);
      samplesRef.current.push(d * 0.05);
      last = { x: e.clientX, y: e.clientY };
      setTilt({ x: (last.x % 80) - 40, y: (last.y % 80) - 40 });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [running]);

  const result = stability == null ? null
    : stability >= 85 ? { label: "Steady", note: "Excellent stability — no tremor detected." }
    : stability >= 65 ? { label: "Mild movement", note: "Minor movement is normal." }
    : stability >= 40 ? { label: "Moderate tremor", note: "Noticeable shaking — retest when relaxed." }
    : { label: "Significant tremor", note: "Persistent tremor may need medical evaluation." };

  const save = async () => {
    if (!handleSaveAttempt()) return;
    if (!result || stability == null) return;
    const { error } = await saveTrackingResult({
      kind: "disease_tremor",
      label: result.label,
      score: stability,
      details: { stability, samples: movements.length, note: result.note },
    });
    toast({ title: error ? "Save failed" : "Saved", description: error?.message ?? "Stability saved." });
  };

  return (
    <TrackingShell title="Tremor / Stability" icon={<Activity className="w-6 h-6 text-primary" />}>
      {isPreviewMode && <PreviewModeBanner />}
      <div className="glass-card p-6 space-y-5 text-center">
        <p className="text-sm text-muted-foreground">
          On mobile: hold the device still for 8 seconds. On desktop: hold the mouse still over the box for 8 seconds.
        </p>
        <div className="relative h-64 rounded-2xl bg-muted/40 overflow-hidden flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent transition-transform duration-75"
            style={{ transform: `translate(${tilt.x}px, ${tilt.y}px)` }}
          />
          <div className="absolute inset-4 border-2 border-dashed border-border rounded-xl pointer-events-none" />
        </div>
        {!running && stability == null && <Button onClick={start} className="w-full">Start 8s Test</Button>}
        {running && <p className="text-sm text-primary animate-pulse">Recording…</p>}
        {result && stability != null && (
          <div className="space-y-3">
            <h2 className="text-xl font-display font-bold">{result.label} — {stability}/100</h2>
            <p className="text-sm text-muted-foreground">{result.note}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={save}><Save className="w-4 h-4 mr-1" /> Save</Button>
              <Button variant="outline" onClick={start}><RefreshCw className="w-4 h-4 mr-1" /> Retake</Button>
            </div>
          </div>
        )}
      </div>
    </TrackingShell>
  );
};
export default TremorPage;
