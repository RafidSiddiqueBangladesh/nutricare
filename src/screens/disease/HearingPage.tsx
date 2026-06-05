import { useRef, useState } from "react";
import TrackingShell from "@/components/tracking/TrackingShell";
import { Volume2, Save, RefreshCw, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveTrackingResult } from "@/lib/saveTrackingResult";
import { useToast } from "@/hooks/use-toast";

import { usePreviewMode } from "@/hooks/usePreviewMode";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";

const freqs = [125, 500, 1000, 2000, 4000, 8000, 12000, 16000];

const HearingPage = () => {
  const { isPreviewMode, handleSaveAttempt } = usePreviewMode();
  const [idx, setIdx] = useState(0);
  const [heard, setHeard] = useState<boolean[]>([]);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const { toast } = useToast();

  const play = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freqs[idx];
    gain.gain.value = 0.05;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    oscRef.current = osc;
    gainRef.current = gain;
    setPlaying(true);
  };

  const stop = () => {
    oscRef.current?.stop();
    oscRef.current?.disconnect();
    gainRef.current?.disconnect();
    setPlaying(false);
  };

  const respond = (yes: boolean) => {
    stop();
    const next = [...heard, yes];
    setHeard(next);
    if (idx + 1 >= freqs.length) setDone(true);
    else setIdx(idx + 1);
  };

  const reset = () => { stop(); setIdx(0); setHeard([]); setDone(false); };

  const heardCount = heard.filter(Boolean).length;
  const highestHz = (() => {
    for (let i = heard.length - 1; i >= 0; i--) if (heard[i]) return freqs[i];
    return 0;
  })();
  const result = !done ? null
    : highestHz >= 14000 ? { label: "Excellent", note: "Hearing range typical of younger adults." }
    : highestHz >= 10000 ? { label: "Good", note: "Normal adult hearing range." }
    : highestHz >= 6000 ? { label: "Mild loss", note: "Reduced high-frequency hearing — common with age." }
    : highestHz >= 2000 ? { label: "Moderate loss", note: "Consider an audiology check-up." }
    : { label: "Significant loss", note: "Recommend professional hearing evaluation." };

  const save = async () => {
    if (!handleSaveAttempt()) return;
    if (!result) return;
    const { error } = await saveTrackingResult({
      kind: "disease_hearing",
      label: result.label,
      score: heardCount,
      details: { heard, freqs, highest_hz: highestHz, note: result.note },
    });
    toast({ title: error ? "Save failed" : "Saved", description: error?.message ?? "Hearing saved." });
  };

  return (
    <TrackingShell title="Hearing Tone Test" icon={<Volume2 className="w-6 h-6 text-primary" />}>
      {isPreviewMode && <PreviewModeBanner />}
      <div className="glass-card p-6 space-y-5">
        <p className="text-sm text-muted-foreground">
          Use headphones at low volume. Play each tone — tap "Heard" or "Didn't hear".
        </p>
        {!done ? (
          <div className="space-y-4 text-center">
            <div className="text-xs text-muted-foreground">Tone {idx + 1} of {freqs.length}</div>
            <div className="text-4xl font-display font-bold">{freqs[idx]} Hz</div>
            <div className="grid grid-cols-2 gap-2">
              {!playing
                ? <Button onClick={play} className="col-span-2"><Play className="w-4 h-4 mr-1" /> Play</Button>
                : <Button variant="outline" onClick={stop} className="col-span-2"><Square className="w-4 h-4 mr-1" /> Stop</Button>}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" onClick={() => respond(false)}>Didn't hear</Button>
              <Button onClick={() => respond(true)}>Heard it</Button>
            </div>
          </div>
        ) : result && (
          <div className="space-y-3 text-center">
            <h2 className="text-xl font-display font-bold">{result.label}</h2>
            <p className="text-sm">Highest frequency heard: <span className="font-semibold text-primary">{highestHz} Hz</span></p>
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
export default HearingPage;
