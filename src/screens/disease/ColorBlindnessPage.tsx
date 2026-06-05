import { useMemo, useState } from "react";
import TrackingShell from "@/components/tracking/TrackingShell";
import { Eye, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveTrackingResult } from "@/lib/saveTrackingResult";
import { useToast } from "@/hooks/use-toast";

import { usePreviewMode } from "@/hooks/usePreviewMode";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";

// SVG Ishihara-like plate generator
const Plate = ({ number, fg, bg }: { number: string; fg: [string, string]; bg: [string, string] }) => {
  const dots = useMemo(() => {
    const arr: { cx: number; cy: number; r: number; on: boolean }[] = [];
    // Render number into an offscreen canvas to detect "on" pixels
    const canvas = document.createElement("canvas");
    canvas.width = 200; canvas.height = 200;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 130px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(number, 100, 105);
    const data = ctx.getImageData(0, 0, 200, 200).data;
    for (let i = 0; i < 1100; i++) {
      const cx = Math.random() * 200;
      const cy = Math.random() * 200;
      const dx = cx - 100, dy = cy - 100;
      if (Math.sqrt(dx * dx + dy * dy) > 95) continue;
      const px = Math.floor(cx), py = Math.floor(cy);
      const idx = (py * 200 + px) * 4;
      const on = data[idx] > 128;
      arr.push({ cx, cy, r: 3 + Math.random() * 5, on });
    }
    return arr;
  }, [number]);

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[260px] aspect-square rounded-full bg-background mx-auto">
      <circle cx="100" cy="100" r="98" fill="hsl(var(--muted))" />
      {dots.map((d, i) => {
        const c = d.on ? (Math.random() > 0.5 ? fg[0] : fg[1]) : (Math.random() > 0.5 ? bg[0] : bg[1]);
        return <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={c} />;
      })}
    </svg>
  );
};

type PlateDef = { number: string; fg: [string, string]; bg: [string, string] };
const plateSet: PlateDef[] = [
  { number: "8", fg: ["#e85a4f", "#d94a3f"], bg: ["#7aa17a", "#86b386"] },
  { number: "3", fg: ["#c94a3f", "#b8392e"], bg: ["#9bb56b", "#a8c178"] },
  { number: "5", fg: ["#e08f3a", "#d17a25"], bg: ["#6f9b6f", "#7fa97f"] },
  { number: "29", fg: ["#cf553f", "#bf452f"], bg: ["#7aa17a", "#86b386"] },
  { number: "74", fg: ["#d96b3a", "#c25a29"], bg: ["#7a9b6b", "#88a878"] },
];

const ColorBlindnessPage = () => {
  const { isPreviewMode, handleSaveAttempt } = usePreviewMode();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const submit = () => {
    const next = [...answers, input.trim()];
    setAnswers(next);
    setInput("");
    if (idx + 1 >= plateSet.length) setDone(true);
    else setIdx(idx + 1);
  };

  const score = answers.filter((a, i) => a === plateSet[i]?.number).length;
  const result =
    score >= 4 ? { label: "Normal vision", note: "No red-green deficiency detected." }
    : score >= 2 ? { label: "Mild deficiency", note: "Possible mild red-green color weakness. Consider a clinical test." }
    : { label: "Likely deficiency", note: "Possible color blindness. Please consult an ophthalmologist." };

  const reset = () => { setIdx(0); setAnswers([]); setInput(""); setDone(false); };

  const save = async () => {
    if (!handleSaveAttempt()) return;
    const { error } = await saveTrackingResult({
      kind: "disease_color_blindness",
      label: result.label,
      score,
      details: { answers, plates: plateSet.map(p => p.number), note: result.note },
    });
    toast({ title: error ? "Save failed" : "Saved", description: error?.message ?? "Color blindness result saved." });
  };

  return (
    <TrackingShell title="Color Blindness Test" icon={<Eye className="w-6 h-6 text-primary" />}>
      {isPreviewMode && <PreviewModeBanner />}
      {!done ? (
        <div className="glass-card p-6 space-y-5">
          <div className="text-sm text-muted-foreground">Plate {idx + 1} of {plateSet.length} — type the number you see.</div>
          <Plate number={plateSet[idx].number} fg={plateSet[idx].fg} bg={plateSet[idx].bg} />
          <div className="flex gap-2">
            <Input
              autoFocus
              placeholder="What number do you see?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <Button onClick={submit}>Next</Button>
          </div>
          <p className="text-xs text-muted-foreground">If you can't see any number, leave it blank and press Next.</p>
        </div>
      ) : (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-2xl font-display font-bold">Result: {result.label}</h2>
          <div className="text-sm">Correct: <span className="font-semibold text-primary">{score}</span> / {plateSet.length}</div>
          <p className="text-sm text-muted-foreground">{result.note}</p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button onClick={save}><Save className="w-4 h-4 mr-1" /> Save Result</Button>
            <Button variant="outline" onClick={reset}><RefreshCw className="w-4 h-4 mr-1" /> Retake</Button>
          </div>
        </div>
      )}
    </TrackingShell>
  );
};
export default ColorBlindnessPage;
