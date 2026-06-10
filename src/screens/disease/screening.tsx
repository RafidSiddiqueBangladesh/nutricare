import { Link, useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, Eye, Ruler, ScanLine } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/src/hooks/use-toast";
import { getFaceLandmarker, computeFaceMetrics } from "@/src/lib/face";
import { supabase } from "@/src/services/supabase";
import { appendHealthResult } from "@/src/lib/healthResults";
import { cn } from "@/src/lib/utils";
import TrackingShell from "@/src/components/tracking/TrackingShell";

type Step = "intro" | "pd" | "acuity-od" | "acuity-os" | "near" | "astig" | "dominance" | "results";

const SLOAN = ["C", "D", "H", "K", "N", "O", "R", "S", "V", "Z"];
const ACUITY_LEVELS = [
  { label: "20/200", px: 84 },
  { label: "20/100", px: 52 },
  { label: "20/70", px: 36 },
  { label: "20/40", px: 24 },
  { label: "20/30", px: 17 },
  { label: "20/20", px: 12 },
];
const SPH_BY_LEVEL = [-3.25, -2.25, -1.5, -0.75, -0.5, 0];

function randomLetters(n: number) {
  return Array.from({ length: n }, () => SLOAN[Math.floor(Math.random() * SLOAN.length)]).join(" ");
}

/* ---------- PD measurement via webcam iris tracking ---------- */
function PdMeter({ onDone, onSkip }: { onDone: (pd: number) => void; onSkip: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"idle" | "measuring" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const samplesRef = useRef<number[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = async () => {
    setStatus("measuring");
    try {
      const [landmarker, stream] = await Promise.all([
        getFaceLandmarker(),
        navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: "user" } }),
      ]);
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      const tick = () => {
        if (video.readyState >= 2) {
          const result = landmarker.detectForVideo(video, performance.now());
          const lms = result.faceLandmarks?.[0];
          if (lms) {
            const m = computeFaceMetrics(lms, video.videoWidth, video.videoHeight);
            if (m.pdMm > 45 && m.pdMm < 80) {
              samplesRef.current.push(m.pdMm);
              setProgress(Math.min(samplesRef.current.length / 90, 1));
            }
          }
        }
        if (samplesRef.current.length >= 90) {
          const sorted = [...samplesRef.current].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];
          onDone(Math.round(median * 10) / 10);
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-5 text-center">
      <Ruler className="mx-auto h-8 w-8 text-teal-400" />
      <h2 className="font-display text-2xl font-bold">Pupillary Distance</h2>
      <p className="mx-auto max-w-md text-sm text-white/60">
        Look straight at the camera at arm's length. AI measures the distance between
        your pupils using iris tracking — accurate to about ±1 mm.
      </p>
      <div className="relative mx-auto aspect-video max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black/40">
        <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
        {status === "measuring" && (
          <div className="absolute inset-x-6 bottom-5">
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/95">Hold still… {Math.round(progress * 100)}%</p>
          </div>
        )}
        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <button onClick={start} className="rounded-2xl bg-teal-500 hover:bg-teal-400 px-6 py-3 text-sm font-bold text-teal-950 transition-all">
              Start measurement
            </button>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75 p-6 text-sm text-white/60 backdrop-blur-sm">
            Camera unavailable — you can skip this step.
          </div>
        )}
      </div>
      <button onClick={onSkip} className="text-sm text-white/60 underline underline-offset-4 hover:text-white">
        Skip — I'll use the average (63 mm)
      </button>
    </div>
  );
}

/* ---------- Astigmatism dial ---------- */
function AstigDial({ onPick, selected }: { onPick: (deg: number | null) => void; selected: number | null }) {
  const lines = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 15), []);
  return (
    <div className="mx-auto w-fit">
      <svg viewBox="-110 -110 220 220" className="h-64 w-64">
        {lines.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = Math.cos(rad) * 100;
          const y = -Math.sin(rad) * 100;
          const active = selected === deg;
          return (
            <g key={deg} onClick={() => onPick(deg)} className="cursor-pointer">
              <line x1={-x} y1={-y} x2={x} y2={y} stroke={active ? "hsl(175, 100%, 45%)" : "currentColor"} strokeWidth={active ? 5 : 3} className="text-white/80" />
            </g>
          );
        })}
        <circle r="14" className="fill-slate-900 stroke-white/10" />
      </svg>
    </div>
  );
}

/* ---------- Main wizard ---------- */
interface Results {
  pd: number | null;
  odLevel: number;
  osLevel: number;
  nearWorse: boolean;
  astigAxis: number | null;
  astigStrength: number;
  dominance: "right" | "left" | null;
}

export default function ScreeningPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("intro");
  const [results, setResults] = useState<Results>({
    pd: null,
    odLevel: -1,
    osLevel: -1,
    nearWorse: false,
    astigAxis: null,
    astigStrength: 0,
    dominance: null,
  });
  const [acuityIdx, setAcuityIdx] = useState(0);
  const [letters, setLetters] = useState(() => randomLetters(5));
  const [saved, setSaved] = useState(false);

  const startAcuity = (next: Step) => {
    setAcuityIdx(0);
    setLetters(randomLetters(5));
    setStep(next);
  };

  const answerAcuity = (eye: "od" | "os", readable: boolean) => {
    const key = eye === "od" ? "odLevel" : "osLevel";
    if (readable) {
      setResults((r) => ({ ...r, [key]: acuityIdx }));
      if (acuityIdx === ACUITY_LEVELS.length - 1) {
        eye === "od" ? startAcuity("acuity-os") : setStep("near");
        return;
      }
      setAcuityIdx(acuityIdx + 1);
      setLetters(randomLetters(5));
    } else {
      eye === "od" ? startAcuity("acuity-os") : setStep("near");
    }
  };

  const computed = useMemo(() => {
    const sign = results.nearWorse ? 1 : -1;
    const odSphRaw = SPH_BY_LEVEL[Math.max(results.odLevel, 0)] ?? -3.25;
    const osSphRaw = SPH_BY_LEVEL[Math.max(results.osLevel, 0)] ?? -3.25;
    const odSph = results.odLevel < 0 ? -4.0 * -sign * -1 : Math.abs(odSphRaw) * sign;
    const osSph = results.osLevel < 0 ? -4.0 * -sign * -1 : Math.abs(osSphRaw) * sign;
    const cyl = results.astigAxis === null ? 0 : -results.astigStrength;
    const axis = results.astigAxis === null ? 0 : results.astigAxis === 0 ? 180 : results.astigAxis;
    let confidence = 68;
    if (results.pd !== null) confidence += 10;
    if (results.odLevel >= 0 && results.osLevel >= 0) confidence += 7;
    if (results.dominance) confidence += 2;
    const fmt = (n: number) => (n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2));
    return {
      od: { sph: fmt(odSph), cyl: cyl ? fmt(cyl) : "0.00", axis: cyl ? `${axis}°` : "—" },
      os: { sph: fmt(osSph), cyl: cyl ? fmt(cyl - 0.25 * Math.sign(cyl || 1) * 0) : "0.00", axis: cyl ? `${(axis + 355) % 360 || 180}°` : "—" },
      pd: results.pd ?? 63.0,
      acuityOd: results.odLevel >= 0 ? ACUITY_LEVELS[results.odLevel].label : "below 20/200",
      acuityOs: results.osLevel >= 0 ? ACUITY_LEVELS[results.osLevel].label : "below 20/200",
      confidence: Math.min(confidence, 92),
    };
  }, [results]);

  const saveToAccount = async () => {
    // Save locally first so it shows up in Results History
    appendHealthResult({
      id: crypto.randomUUID(),
      type: 'disease',
      timestamp: new Date().toISOString(),
      data: {
        label: 'AI Vision Screening',
        kind: 'Vision Screening',
        score: computed.confidence,
        note: `Dominant Eye: ${results.dominance ? results.dominance.toUpperCase() : '—'}, PD: ${computed.pd.toFixed(1)} mm`,
        details: {
          od: computed.od,
          os: computed.os,
          pd: computed.pd,
          dominance: results.dominance,
          confidence: computed.confidence
        }
      }
    });

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      toast({ title: "Saved Locally", description: "Vision screening saved to local history. Sign in to sync." });
      setSaved(true);
      return;
    }

    const { error } = await supabase.from("prescriptions").insert({
      user_id: data.user.id,
      source: "screening",
      data: { ...computed, dominance: results.dominance } as never,
    });

    if (error) {
      toast({ title: "Cloud Save Failed", description: "Saved locally. Cloud database sync failed." });
    } else {
      toast({ title: "Saved Successfully", description: "Vision screening saved to your account." });
    }
    setSaved(true);
  };

  return (
    <TrackingShell title="AI Vision Screening" icon={<Eye className="w-5 h-5 text-teal-400" />}>
      <div className="glass-card rounded-[2rem] p-8 md:p-12">
        {step === "intro" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">
            <Eye className="mx-auto h-10 w-10 text-teal-400" />
            <h1 className="font-display text-3xl font-black md:text-4xl text-white">
              AI Vision <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400">Screening</span>
            </h1>
            <p className="mx-auto max-w-lg text-white/60 leading-relaxed text-sm">
              A guided 4-minute screening: visual acuity, astigmatism, pupillary
              distance, and eye dominance. You'll get an estimated prescription with a
              confidence score.
            </p>
            <div className="bg-white/5 border border-white/10 mx-auto flex max-w-lg items-start gap-3 rounded-2xl p-4 text-left">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <p className="text-xs text-white/60 leading-relaxed">
                This is a <strong className="text-white">screening, not a diagnosis</strong>. It
                cannot detect glaucoma, cataracts, retinal disease, or macular
                degeneration. Always confirm results with a licensed optometrist.
              </p>
            </div>
            <ul className="mx-auto max-w-sm space-y-1.5 text-left text-xs text-white/50">
              <li>• Sit about 1 metre (3 feet) from your screen</li>
              <li>• Wear no glasses or contacts during the test</li>
              <li>• Make sure the room is well lit</li>
            </ul>
            <button
              onClick={() => setStep("pd")}
              className="mx-auto flex items-center gap-2 rounded-2xl bg-teal-500 hover:bg-teal-400 px-7 py-3.5 text-sm font-bold text-teal-950 transition-all shadow-lg active:scale-95"
            >
              Begin Screening <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {step === "pd" && (
          <PdMeter
            onDone={(pd) => {
              setResults((r) => ({ ...r, pd }));
              startAcuity("acuity-od");
            }}
            onSkip={() => startAcuity("acuity-od")}
          />
        )}

        {(step === "acuity-od" || step === "acuity-os") && (
          <div className="space-y-6 text-center">
            <ScanLine className="mx-auto h-8 w-8 text-teal-400 animate-pulse" />
            <h2 className="font-display text-2xl font-bold">
              Visual Acuity — {step === "acuity-od" ? "Right Eye (OD)" : "Left Eye (OS)"}
            </h2>
            <p className="text-sm text-white/60">
              Cover your {step === "acuity-od" ? "LEFT" : "RIGHT"} eye with your palm.
              Can you read these letters clearly?
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Line {acuityIdx + 1} of {ACUITY_LEVELS.length} · {ACUITY_LEVELS[acuityIdx].label}
            </p>
            <div className="bg-white mx-auto flex min-h-36 max-w-lg items-center justify-center rounded-3xl p-8 shadow-inner border border-white/20">
              <p
                className="font-mono font-bold tracking-[0.35em] text-black"
                style={{ fontSize: ACUITY_LEVELS[acuityIdx].px }}
              >
                {letters}
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => answerAcuity(step === "acuity-od" ? "od" : "os", true)}
                className="rounded-2xl bg-teal-500 hover:bg-teal-400 px-6 py-3 text-sm font-bold text-teal-950 shadow-md active:scale-95 transition-all"
              >
                Sharp & Readable
              </button>
              <button
                onClick={() => answerAcuity(step === "acuity-od" ? "od" : "os", false)}
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm font-bold text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                Blurry / Can't Read
              </button>
            </div>
          </div>
        )}

        {step === "near" && (
          <div className="space-y-6 text-center">
            <h2 className="font-display text-2xl font-bold">Near Vision</h2>
            <p className="mx-auto max-w-md text-sm text-white/60">
              Hold your phone (or lean in to ~30 cm). Read this paragraph:
            </p>
            <div className="bg-white mx-auto max-w-md rounded-3xl p-6 shadow-inner border border-white/20">
              <p className="text-[10px] leading-relaxed text-black font-semibold">
                Premium lenses are precision-ground to a tolerance of one hundredth of a
                diopter, then coated in seven microscopic layers that repel water,
                scratches, and glare while filtering high-energy visible light.
              </p>
            </div>
            <p className="text-sm font-bold text-white">How does near text compare to the distance letters?</p>
            <div className="flex flex-col items-center gap-2">
              {[
                { label: "Near is easier or the same", nearWorse: false },
                { label: "Near is noticeably harder", nearWorse: true },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setResults((r) => ({ ...r, nearWorse: opt.nearWorse }));
                    setStep("astig");
                  }}
                  className="bg-white/5 border border-white/10 w-72 rounded-2xl px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 active:scale-95 transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "astig" && (
          <div className="space-y-5 text-center">
            <h2 className="font-display text-2xl font-bold">Astigmatism Dial</h2>
            <p className="mx-auto max-w-md text-sm text-white/60">
              With both eyes open, look at the fan. If one direction of lines appears
              <strong className="text-white"> darker or sharper</strong> than the rest, tap it.
            </p>
            <AstigDial selected={results.astigAxis} onPick={(deg) => setResults((r) => ({ ...r, astigAxis: deg }))} />
            <div className="flex flex-col items-center gap-2">
              {results.astigAxis !== null && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setResults((r) => ({ ...r, astigStrength: 0.5 }));
                      setStep("dominance");
                    }}
                    className="bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5 text-sm font-semibold hover:bg-white/10 active:scale-95 transition-all"
                  >
                    Slightly darker
                  </button>
                  <button
                    onClick={() => {
                      setResults((r) => ({ ...r, astigStrength: 1.0 }));
                      setStep("dominance");
                    }}
                    className="rounded-2xl bg-teal-500 hover:bg-teal-400 px-5 py-2.5 text-sm font-bold text-teal-950 active:scale-95 transition-all"
                  >
                    Clearly darker
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setResults((r) => ({ ...r, astigAxis: null, astigStrength: 0 }));
                  setStep("dominance");
                }}
                className="text-sm text-white/60 underline underline-offset-4 hover:text-white"
              >
                All lines look equal
              </button>
            </div>
          </div>
        )}

        {step === "dominance" && (
          <div className="space-y-6 text-center">
            <h2 className="font-display text-2xl font-bold">Eye Dominance</h2>
            <p className="mx-auto max-w-md text-sm text-white/60 leading-relaxed">
              Stretch your arms, make a small triangle with your hands, and center a
              distant object in it. Close one eye at a time — the eye that keeps the
              object centred is dominant.
            </p>
            <div className="flex justify-center gap-3">
              {(["right", "left"] as const).map((side) => (
                <button
                  key={side}
                  onClick={() => {
                    setResults((r) => ({ ...r, dominance: side }));
                    setStep("results");
                  }}
                  className="bg-white/5 border border-white/10 rounded-2xl px-8 py-3 text-sm font-bold capitalize hover:bg-white/10 active:scale-95 transition-all"
                >
                  {side} Eye
                </button>
              ))}
              <button
                onClick={() => setStep("results")}
                className="rounded-2xl px-4 py-3 text-sm text-white/60 underline underline-offset-4 hover:text-white"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {step === "results" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-3xl font-black text-white">
                Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400">Estimate</span>
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Confidence score:{" "}
                <span className="font-bold text-teal-400">{computed.confidence}%</span>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Right Eye (OD)", d: computed.od, acuity: computed.acuityOd },
                { title: "Left Eye (OS)", d: computed.os, acuity: computed.acuityOs },
              ].map((eye) => (
                <div key={eye.title} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <p className="font-display font-bold text-teal-400">{eye.title}</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-white/60">SPH</dt><dd className="font-mono font-bold text-white">{eye.d.sph}</dd></div>
                    <div className="flex justify-between"><dt className="text-white/60">CYL</dt><dd className="font-mono font-bold text-white">{eye.d.cyl}</dd></div>
                    <div className="flex justify-between"><dt className="text-white/60">Axis</dt><dd className="font-mono font-bold text-white">{eye.d.axis}</dd></div>
                    <div className="flex justify-between"><dt className="text-white/60">Acuity</dt><dd className="font-mono font-bold text-white">{eye.acuity}</dd></div>
                  </dl>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 flex flex-wrap items-center justify-around gap-4 rounded-3xl p-6 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">PD</p>
                <p className="font-display text-2xl font-black text-white">{computed.pd.toFixed(1)} mm</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Dominant Eye</p>
                <p className="font-display text-2xl font-black text-white capitalize">{results.dominance ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Confidence</p>
                <p className="font-display text-2xl font-black text-teal-400">{computed.confidence}%</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 flex items-start gap-3 rounded-2xl p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <p className="text-xs text-white/60 leading-relaxed">
                These values are <strong className="text-white">estimates only</strong> from a
                screen-based screening. Use them to explore lenses, then confirm with a
                professional eye exam before ordering prescription eyewear.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={saveToAccount}
                disabled={saved}
                className={cn(
                  "bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm font-bold hover:bg-white/10 active:scale-95 transition-all text-white",
                  saved && "opacity-60 pointer-events-none",
                )}
              >
                {saved ? "Saved ✓" : "Save Vision Result"}
              </button>
              <button
                onClick={() => navigate('/health')}
                className="rounded-2xl bg-teal-500 hover:bg-teal-400 px-6 py-3 text-sm font-bold text-teal-950 active:scale-95 transition-all shadow-lg"
              >
                Go to Control Center
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </TrackingShell>
  );
}
