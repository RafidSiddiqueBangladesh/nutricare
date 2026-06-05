import { useEffect, useMemo, useState } from "react";
import TrackingShell from "@/components/tracking/TrackingShell";
import { Palette, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveTrackingResult } from "@/lib/saveTrackingResult";
import { useToast } from "@/hooks/use-toast";

import { usePreviewMode } from "@/hooks/usePreviewMode";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";

const COUNT = 10;

function generateHues(): number[] {
  // 10 hue tiles between 0 and 60 (red→yellow). Subtle gradient — harder for color-blind.
  return Array.from({ length: COUNT }).map((_, i) => Math.round((i * 60) / (COUNT - 1)));
}

const ColorSortPage = () => {
  const { isPreviewMode, handleSaveAttempt } = usePreviewMode();
  const [order, setOrder] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const hues = useMemo(generateHues, []);

  const shuffle = () => {
    const idx = Array.from({ length: COUNT }).map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    setOrder(idx);
    setDone(false);
  };
  useEffect(shuffle, []);

  const move = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    setOrder(next);
  };

  const error = useMemo(() => order.reduce((sum, v, i) => sum + Math.abs(v - i), 0), [order]);
  const result = error === 0
    ? { label: "Perfect", note: "Excellent color discrimination." }
    : error <= 4 ? { label: "Good", note: "Minor sorting errors." }
    : error <= 10 ? { label: "Moderate", note: "Possible mild color confusion." }
    : { label: "Poor", note: "Significant errors — consider a color vision test." };

  const save = async () => {
    if (!handleSaveAttempt()) return;
    const { error: e } = await saveTrackingResult({
      kind: "disease_color_sort",
      label: result.label,
      score: COUNT * 2 - error,
      details: { error, order, note: result.note },
    });
    toast({ title: e ? "Save failed" : "Saved", description: e?.message ?? "Color sort saved." });
  };

  return (
    <TrackingShell title="Color Discrimination" icon={<Palette className="w-6 h-6 text-primary" />}>
      {isPreviewMode && <PreviewModeBanner />}
      <div className="glass-card p-6 space-y-5">
        <p className="text-sm text-muted-foreground">
          Reorder the tiles from <span className="font-medium text-foreground">red → yellow</span> using the arrows. Then tap "Check".
        </p>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {order.map((hueIdx, pos) => (
            <div key={pos} className="flex flex-col items-center gap-1">
              <div
                className="w-full aspect-square rounded-lg border border-border/50"
                style={{ background: `hsl(${hues[hueIdx]}, 80%, 55%)` }}
              />
              <div className="flex gap-1">
                <button onClick={() => move(pos, -1)} className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/70" aria-label="Move left">◀</button>
                <button onClick={() => move(pos, 1)} className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/70" aria-label="Move right">▶</button>
              </div>
            </div>
          ))}
        </div>
        {!done ? (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => setDone(true)}>Check</Button>
            <Button variant="outline" onClick={shuffle}><RefreshCw className="w-4 h-4 mr-1" /> Shuffle</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xl font-display font-bold">Result: {result.label}</h2>
            <div className="text-sm text-muted-foreground">Total error: {error}</div>
            <p className="text-sm text-muted-foreground">{result.note}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={save}><Save className="w-4 h-4 mr-1" /> Save</Button>
              <Button variant="outline" onClick={shuffle}><RefreshCw className="w-4 h-4 mr-1" /> Retake</Button>
            </div>
          </div>
        )}
      </div>
    </TrackingShell>
  );
};
export default ColorSortPage;
