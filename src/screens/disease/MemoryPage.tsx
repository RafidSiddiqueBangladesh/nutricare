import { useEffect, useState } from "react";
import TrackingShell from "@/components/tracking/TrackingShell";
import { Brain, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveTrackingResult } from "@/lib/saveTrackingResult";
import { useToast } from "@/hooks/use-toast";

import { usePreviewMode } from "@/hooks/usePreviewMode";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";

type Phase = "idle" | "show" | "input" | "done";

const MemoryPage = () => {
  const { isPreviewMode, handleSaveAttempt } = usePreviewMode();
  const [phase, setPhase] = useState<Phase>("idle");
  const [length, setLength] = useState(3);
  const [seq, setSeq] = useState<number[]>([]);
  const [input, setInput] = useState("");
  const [best, setBest] = useState(0);
  const { toast } = useToast();

  const start = (n: number) => {
    const s = Array.from({ length: n }).map(() => Math.floor(Math.random() * 10));
    setSeq(s);
    setLength(n);
    setInput("");
    setPhase("show");
  };

  useEffect(() => {
    if (phase !== "show") return;
    const t = setTimeout(() => setPhase("input"), 1000 + length * 700);
    return () => clearTimeout(t);
  }, [phase, length]);

  const submit = () => {
    const ok = input.trim() === seq.join("");
    if (ok) {
      setBest(b => Math.max(b, length));
      if (length >= 9) setPhase("done");
      else start(length + 1);
    } else {
      setPhase("done");
    }
  };

  const result = phase !== "done" ? null
    : best >= 8 ? { label: "Excellent", note: "Above-average working memory." }
    : best >= 6 ? { label: "Normal", note: "Typical adult digit span (6-7)." }
    : best >= 4 ? { label: "Reduced", note: "Slightly below typical range." }
    : { label: "Low", note: "Possible attention or memory difficulty — try when rested." };

  const save = async () => {
    if (!handleSaveAttempt()) return;
    if (!result) return;
    const { error } = await saveTrackingResult({
      kind: "disease_memory",
      label: result.label,
      score: best,
      details: { best_span: best, note: result.note },
    });
    toast({ title: error ? "Save failed" : "Saved", description: error?.message ?? "Memory saved." });
  };

  return (
    <TrackingShell title="Memory Span Test" icon={<Brain className="w-6 h-6 text-primary" />}>
      {isPreviewMode && <PreviewModeBanner />}
      <div className="glass-card p-6 space-y-5 text-center">
        <p className="text-sm text-muted-foreground">Memorize the digit sequence and type it back. Each round adds one digit.</p>
        {phase === "idle" && <Button onClick={() => start(3)} className="w-full">Start Test</Button>}
        {phase === "show" && (
          <div className="py-12">
            <div className="text-5xl font-mono font-bold tracking-[0.4em] text-primary">{seq.join(" ")}</div>
            <p className="text-xs text-muted-foreground mt-4">Memorize this…</p>
          </div>
        )}
        {phase === "input" && (
          <div className="space-y-3">
            <p className="text-sm">Type the sequence ({length} digits):</p>
            <Input autoFocus value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="e.g. 4729" inputMode="numeric" />
            <Button onClick={submit} className="w-full">Submit</Button>
          </div>
        )}
        {phase === "done" && result && (
          <div className="space-y-3">
            <h2 className="text-xl font-display font-bold">{result.label} — Span: {best}</h2>
            <p className="text-sm text-muted-foreground">{result.note}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={save}><Save className="w-4 h-4 mr-1" /> Save</Button>
              <Button variant="outline" onClick={() => start(3)}><RefreshCw className="w-4 h-4 mr-1" /> Retake</Button>
            </div>
          </div>
        )}
      </div>
    </TrackingShell>
  );
};
export default MemoryPage;
