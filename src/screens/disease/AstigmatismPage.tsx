import { useState } from "react";
import TrackingShell from "@/components/tracking/TrackingShell";
import { Contrast, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveTrackingResult } from "@/lib/saveTrackingResult";
import { useToast } from "@/hooks/use-toast";

import { usePreviewMode } from "@/hooks/usePreviewMode";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";

const AstigmatismPage = () => {
  const { isPreviewMode, handleSaveAttempt } = usePreviewMode();
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const { toast } = useToast();

  const lines = Array.from({ length: 18 }).map((_, i) => (i * 180) / 18);

  const result = answer === "yes"
    ? { label: "Possible astigmatism", note: "Some lines appeared darker/sharper. Consider an eye exam." }
    : { label: "Normal", note: "All lines appeared equal. No astigmatism indicators." };

  const save = async () => {
    if (!handleSaveAttempt()) return;
    if (!answer) return;
    const { error } = await saveTrackingResult({
      kind: "disease_astigmatism",
      label: result.label,
      details: { uneven_lines: answer === "yes", note: result.note },
    });
    toast({ title: error ? "Save failed" : "Saved", description: error?.message ?? "Astigmatism result saved." });
  };

  return (
    <TrackingShell title="Astigmatism Check" icon={<Contrast className="w-6 h-6 text-primary" />}>
      {isPreviewMode && <PreviewModeBanner />}
      <div className="glass-card p-6 space-y-5 text-center">
        <p className="text-sm text-muted-foreground">
          Cover one eye. Look at the center. Do all lines look equally dark and sharp?
        </p>
        <svg viewBox="-120 -120 240 240" className="w-full max-w-[320px] aspect-square mx-auto">
          {lines.map((deg, i) => (
            <line
              key={i}
              x1={Math.cos((deg * Math.PI) / 180) * 110}
              y1={Math.sin((deg * Math.PI) / 180) * 110}
              x2={-Math.cos((deg * Math.PI) / 180) * 110}
              y2={-Math.sin((deg * Math.PI) / 180) * 110}
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
            />
          ))}
          <circle cx="0" cy="0" r="4" fill="hsl(var(--primary))" />
        </svg>
        {!answer ? (
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2">
            <Button variant="outline" onClick={() => setAnswer("yes")}>Some lines look darker</Button>
            <Button onClick={() => setAnswer("no")}>All look equal</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xl font-display font-bold">{result.label}</h2>
            <p className="text-sm text-muted-foreground">{result.note}</p>
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              <Button onClick={save}><Save className="w-4 h-4 mr-1" /> Save</Button>
              <Button variant="outline" onClick={() => setAnswer(null)}><RefreshCw className="w-4 h-4 mr-1" /> Retake</Button>
            </div>
          </div>
        )}
      </div>
    </TrackingShell>
  );
};
export default AstigmatismPage;
