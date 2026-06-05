import { useMemo, useState } from "react";
import TrackingShell from "@/components/tracking/TrackingShell";
import { Glasses, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveTrackingResult } from "@/lib/saveTrackingResult";
import { useToast } from "@/hooks/use-toast";

import { usePreviewMode } from "@/hooks/usePreviewMode";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";

const rows = [
  { size: 96, text: "E" },
  { size: 64, text: "FP" },
  { size: 44, text: "TOZ" },
  { size: 32, text: "LPED" },
  { size: 22, text: "PECFD" },
  { size: 16, text: "EDFCZP" },
  { size: 12, text: "FELOPZD" },
];
const acuityMap = ["20/200", "20/100", "20/70", "20/50", "20/40", "20/30", "20/20"];

const VisualAcuityPage = () => {
  const { isPreviewMode, handleSaveAttempt } = usePreviewMode();
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const submit = () => {
    const next = [...answers, input.trim().toUpperCase()];
    setAnswers(next);
    setInput("");
    if (idx + 1 >= rows.length) setDone(true);
    else setIdx(idx + 1);
  };

  const lastCorrect = useMemo(() => {
    let last = -1;
    answers.forEach((a, i) => { if (a === rows[i].text) last = i; });
    return last;
  }, [answers]);

  const acuity = lastCorrect >= 0 ? acuityMap[lastCorrect] : "Below 20/200";
  const note = lastCorrect >= 5 ? "Excellent vision."
    : lastCorrect >= 3 ? "Normal range."
    : lastCorrect >= 1 ? "Possible mild reduction. Consider an eye exam."
    : "Significant reduction — please see an optometrist.";

  const reset = () => { setIdx(0); setInput(""); setAnswers([]); setDone(false); };

  const save = async () => {
    if (!handleSaveAttempt()) return;
    const { error } = await saveTrackingResult({
      kind: "disease_visual_acuity",
      label: acuity,
      score: lastCorrect + 1,
      details: { answers, expected: rows.map(r => r.text), note },
    });
    toast({ title: error ? "Save failed" : "Saved", description: error?.message ?? "Visual acuity saved." });
  };

  return (
    <TrackingShell title="Visual Acuity Test" icon={<Glasses className="w-6 h-6 text-primary" />}>
      {isPreviewMode && <PreviewModeBanner />}
      {!done ? (
        <div className="glass-card p-8 space-y-6 text-center">
          <p className="text-sm text-muted-foreground">Sit ~60 cm from the screen. Cover one eye and read the letters.</p>
          <p className="text-xs text-muted-foreground">Row {idx + 1} of {rows.length}</p>
          <div className="font-mono font-bold tracking-[0.2em] py-6" style={{ fontSize: rows[idx].size }}>
            {rows[idx].text}
          </div>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              autoFocus
              placeholder="Type the letters you see"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <Button onClick={submit}>Next</Button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-2xl font-display font-bold">Estimated Acuity: {acuity}</h2>
          <p className="text-sm text-muted-foreground">{note}</p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button onClick={save}><Save className="w-4 h-4 mr-1" /> Save Result</Button>
            <Button variant="outline" onClick={reset}><RefreshCw className="w-4 h-4 mr-1" /> Retake</Button>
          </div>
        </div>
      )}
    </TrackingShell>
  );
};
export default VisualAcuityPage;
