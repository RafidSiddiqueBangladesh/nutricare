import { Link } from "react-router-dom";
import TrackingShell from "@/components/tracking/TrackingShell";
import {
  Stethoscope, Eye, Glasses, Contrast, Palette, Zap, Activity, Volume2, Brain, Heart,
} from "lucide-react";

const tests = [
  { icon: Eye, label: "Color Blindness", description: "Ishihara plate test", path: "/health/disease/color-blindness", color: "from-[hsl(350,85%,55%)] to-[hsl(30,95%,55%)]" },
  { icon: Glasses, label: "Visual Acuity", description: "Snellen-style chart", path: "/health/disease/visual-acuity", color: "from-primary to-accent" },
  { icon: Contrast, label: "Astigmatism", description: "Radial line check", path: "/health/disease/astigmatism", color: "from-accent to-primary" },
  { icon: Contrast, label: "Contrast Sensitivity", description: "Low-contrast letters", path: "/health/disease/contrast", color: "from-[hsl(220,90%,55%)] to-primary" },
  { icon: Palette, label: "Color Discrimination", description: "Sort hue tiles", path: "/health/disease/color-sort", color: "from-[hsl(280,85%,55%)] to-[hsl(350,85%,55%)]" },
  { icon: Zap, label: "Reaction Time", description: "Neuro reflex test", path: "/health/disease/reaction", color: "from-[hsl(30,95%,55%)] to-[hsl(50,95%,55%)]" },
  { icon: Activity, label: "Tremor / Stability", description: "Webcam hand steadiness", path: "/health/disease/tremor", color: "from-accent to-[hsl(280,85%,55%)]" },
  { icon: Volume2, label: "Hearing Tone Test", description: "Frequency range check", path: "/health/disease/hearing", color: "from-primary to-[hsl(220,90%,55%)]" },
  { icon: Brain, label: "Memory Span", description: "Cognitive recall test", path: "/health/disease/memory", color: "from-[hsl(280,85%,55%)] to-primary" },
  { icon: Heart, label: "Preliminary Vital Check", description: "Heart rate and respiratory rate screening", path: "/health/disease/vitals", color: "from-[hsl(25,95%,55%)] to-[hsl(340,85%,55%)]" },
];

const DiseaseHubPage = () => (
  <TrackingShell title="Disease Detection Hub" icon={<Stethoscope className="w-6 h-6 text-primary" />}>
    <div className="glass-card p-5 mb-6">
      <p className="text-sm text-muted-foreground">
        Quick in-browser screening tests. Results are saved to your history.
        These are <span className="font-medium text-foreground">screenings only</span> — not medical diagnoses.
        Consult a doctor for professional evaluation.
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {tests.map((t) => (
        <Link key={t.path} to={t.path} className="glass-card p-5 hover:scale-[1.02] transition-all duration-300 group">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-3`}>
            <t.icon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="font-display font-semibold text-lg">{t.label}</div>
          <div className="text-sm text-muted-foreground">{t.description}</div>
        </Link>
      ))}
    </div>
  </TrackingShell>
);

export default DiseaseHubPage;
