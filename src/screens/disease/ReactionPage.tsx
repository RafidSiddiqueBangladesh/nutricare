import { useEffect, useRef, useState } from "react";
import TrackingShell from "@/components/tracking/TrackingShell";
import { Zap, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveTrackingResult } from "@/lib/saveTrackingResult";
import { useToast } from "@/hooks/use-toast";

import { usePreviewMode } from "@/hooks/usePreviewMode";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";

type Phase = "idle" | "waiting" | "go" | "done" | "tooEarly";

const ReactionPage = () => {
  const { isPreviewMode, handleSaveAttempt } = usePreviewMode();
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const startRef = useRef<number>(0);
  const timeoutRef = useRef<number | undefined>();
  const { toast } = useToast();

  const start = () => {
    setPhase("waiting");
    const delay = 1200 + Math.random() * 2500;
    timeoutRef.current = window.setTimeout(() => {
      startRef.current = performance.now();
      setPhase("go");
    }, delay);
  };

  const click = () => {
    if (phase === "waiting") {
      window.clearTimeout(timeoutRef.current);
      setPhase("tooEarly");
    } else if (phase === "go") {
      const dt = Math.round(performance.now() - startRef.current);
      setTimes(t => [...t, dt]);
      setPhase(times.length + 1 >= 5 ? "done" : "idle");
    }
  };

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const result = !times.length ? null
    : avg < 220 ? { label: "Excellent", note: "Faster than average reflexes." }
    : avg < 300 ? { label: "Normal", note: "Average reaction time." }
    : avg < 400 ? { label: "Slow", note: "Slightly slow — try again well-rested." }
    : { label: "Very slow", note: "Consistently slow reactions can indicate fatigue or attention issues." };

  const reset = () => { setTimes([]); setPhase("idle"); };

  const save = async () => {
    if (!handleSaveAttempt()) return;
    if (!result) return;
    const { error } = await saveTrackingResult({
      kind: "disease_reaction",
      label: result.label,
      score: avg,
      details: { times, avg_ms: avg, note: result.note },
    });
    toast({ title: error ? "Save failed" : "Saved", description: error?.message ?? "Reaction time saved." });
  };

  const bg = phase === "go" ? "bg-[hsl(var(--primary))]" : phase === "waiting" ? "bg-[hsl(var(--accent))]" : phase === "tooEarly" ? "bg-destructive" : "bg-muted";
  const label = phase === "idle" ? "Click Start" : phase === "waiting" ? "Wait for green…" : phase === "go" ? "CLICK NOW!" : phase === "tooEarly" ? "Too early!" : "Done";

  return (
    <TrackingShell title="Reaction Time" icon={<Zap className="w-6 h-6 text-primary" />}>
      {isPreviewMode && <PreviewModeBanner />}
      <div className="glass-card p-6 space-y-5 text-center">
        <p className="text-sm text-muted-foreground">5 trials. Click as soon as the box turns green.</p>
        <button
          onClick={() => phase === "idle" ? start() : click()}
          className={`w-full h-64 rounded-2xl ${bg} text-primary-foreground font-display font-bold text-2xl transition-colors`}
          disabled={phase === "done"}
        >
          {label}
        </button>
        <div className="text-sm text-muted-foreground">Trial {Math.min(times.length + (phase === "done" ? 0 : 1), 5)} / 5 · Avg: {avg ? `${avg} ms` : "—"}</div>
        {phase === "tooEarly" && <Button variant="outline" onClick={() => setPhase("idle")}>Continue</Button>}
        {phase === "done" && result && (
          <div className="space-y-3">
            <h2 className="text-xl font-display font-bold">{result.label} — {avg} ms avg</h2>
            <p className="text-sm text-muted-foreground">{result.note}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={save}><Save className="w-4 h-4 mr-1" /> Save</Button>
              <Button variant="outline" onClick={reset}><RefreshCw className="w-4 h-4 mr-1" /> Retake</Button>
            </div>
          </div>
        )}
      </div>
    </TrackingShell>
  );
};
export default ReactionPage;
