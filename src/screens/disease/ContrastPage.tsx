import { useMemo, useState } from "react";
import TrackingShell from "@/components/tracking/TrackingShell";
import { Contrast, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveTrackingResult } from "@/lib/saveTrackingResult";
import { useToast } from "@/hooks/use-toast";

import { usePreviewMode } from "@/hooks/usePreviewMode";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";

const levels = [0.95, 0.7, 0.5, 0.35, 0.22, 0.14, 0.08];
const letters = ["HOPE", "STAR", "LIGHT", "MIND", "FOCUS", "CLEAR", "VIVID"];

const ContrastPage = () => {
  const { isPreviewMode, handleSaveAttempt } = usePreviewMode();
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const opacity = levels[idx];
  const word = letters[idx];

  const submit = () => {
    const ok = input.trim().toUpperCase() === word;
    if (ok) setCorrect(c => c + 1);
    setInput("");
    if (idx + 1 >= levels.length) setDone(true);
    else setIdx(idx + 1);
  };

  const result = useMemo(() => {
    if (correct >= 6) return { label: "Excellent", note: "Strong contrast sensitivity." };
    if (correct >= 4) return { label: "Normal", note: "Within normal range." };
    if (correct >= 2) return { label: "Reduced", note: "Possible reduced contrast sensitivity." };
    return { label: "Low", note: "Low contrast sensitivity — consider eye care follow-up." };
  }, [correct]);

  const reset = () => { setIdx(0); setInput(""); setCorrect(0); setDone(false); };

  const save = async () => {
    if (!handleSaveAttempt()) return;
    const { error } = await saveTrackingResult({
      kind: "disease_contrast",
      label: result.label,
      score: correct,
      details: { correct, total: levels.length, note: result.note },
    });
    toast({ title: error ? "Save failed" : "Saved", description: error?.message ?? "Contrast result saved." });
  };

  return (
    <TrackingShell title="Contrast Sensitivity" icon={<Contrast className="w-6 h-6 text-primary" />}>
      {isPreviewMode && <PreviewModeBanner />}
      {!done ? (
        <div className="glass-card p-8 space-y-6 text-center">
          <p className="text-sm text-muted-foreground">Read the word — it gets fainter each round.</p>
          <p className="text-xs text-muted-foreground">Level {idx + 1} of {levels.length}</p>
          <div
            className="font-display font-bold py-10 text-5xl tracking-widest text-foreground"
            style={{ opacity }}
          >
            {word}
          </div>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input autoFocus placeholder="Type what you see" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
            <Button onClick={submit}>Next</Button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-2xl font-display font-bold">Result: {result.label}</h2>
          <div className="text-sm">Correct: <span className="font-semibold text-primary">{correct}</span> / {levels.length}</div>
          <p className="text-sm text-muted-foreground">{result.note}</p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button onClick={save}><Save className="w-4 h-4 mr-1" /> Save</Button>
            <Button variant="outline" onClick={reset}><RefreshCw className="w-4 h-4 mr-1" /> Retake</Button>
          </div>
        </div>
      )}
    </TrackingShell>
  );
};
export default ContrastPage;
