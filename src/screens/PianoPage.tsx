import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Camera, CameraOff, Hand, Music, Info, ChevronLeft } from "lucide-react";
import { useWebcam } from "@/src/hooks/useWebcam";
import PianoKeyboard from "@/src/components/PianoKeyboard";
import { playNote, WHITE_KEYS } from "@/src/lib/audioEngine";

export default function PianoPage() {
  const navigate = useNavigate();
  const { videoRef, isActive, error, start, stop } = useWebcam();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [handLandmarker, setHandLandmarker] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const animFrameRef = useRef<number>(0);

  // Load MediaPipe hand detector
  const loadHandDetector = useCallback(async () => {
    setIsLoading(true);
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      const detector = await vision.HandLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        numHands: 2,
        runningMode: "VIDEO",
      });
      setHandLandmarker(detector);
    } catch (err) {
      console.error("Failed to load hand detector:", err);
    }
    setIsLoading(false);
  }, []);

  // Detection loop
  useEffect(() => {
    if (!isActive || !handLandmarker || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    let lastNoteTime = 0;

    const detect = () => {
      if (!video.videoWidth) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const result = handLandmarker.detectForVideo(video, performance.now());

      if (result.landmarks && result.landmarks.length > 0) {
        setHandDetected(true);

        result.landmarks.forEach((landmarks: any[]) => {
          // Draw hand landmarks
          ctx.fillStyle = "hsl(185, 100%, 45%)";
          ctx.shadowBlur = 10;
          ctx.shadowColor = "hsl(185, 100%, 45%)";
          landmarks.forEach((lm: any) => {
            ctx.beginPath();
            ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw connections
          ctx.strokeStyle = "hsla(185, 100%, 45%, 0.5)";
          ctx.lineWidth = 2;
          const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [5, 9], [9, 10], [10, 11], [11, 12],
            [9, 13], [13, 14], [14, 15], [15, 16],
            [13, 17], [17, 18], [18, 19], [19, 20],
            [0, 17],
          ];
          connections.forEach(([a, b]) => {
            ctx.beginPath();
            ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height);
            ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height);
            ctx.stroke();
          });

          // Map index fingertip (landmark 8) x position to piano note
          const indexTip = landmarks[8];
          const noteIndex = Math.floor((1 - indexTip.x) * WHITE_KEYS.length); // invert since camera is mirrored
          const clampedIndex = Math.max(0, Math.min(WHITE_KEYS.length - 1, noteIndex));
          const note = WHITE_KEYS[clampedIndex].note;

          // Detect tap: index fingertip y > index finger MCP y (finger curled)
          const indexMcp = landmarks[5];
          const isTapping = indexTip.y > indexMcp.y + 0.05;

          if (isTapping && performance.now() - lastNoteTime > 250) {
            lastNoteTime = performance.now();
            playNote(note);
            setActiveNote(note);
            setTimeout(() => setActiveNote(null), 200);
          }
        });
      } else {
        setHandDetected(false);
      }

      ctx.shadowBlur = 0;
      animFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, handLandmarker, videoRef]);

  const handleToggleCamera = async () => {
    if (isActive) {
      stop();
    } else {
      if (!handLandmarker) await loadHandDetector();
      await start();
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <Music size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Virtual Piano</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Camera/Webcam Feed */}
        <div className="glass-card !p-4">
          <div className="relative aspect-[4/3] bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />
            {!isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/65">
                <Hand className="h-16 w-16 text-teal-400/60 animate-bounce" />
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider">
                  Enable Camera for Hand Tracking
                </p>
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/85">
                <div className="text-center">
                  <div className="h-8 w-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-teal-300 font-bold uppercase">Loading Hand Model...</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handleToggleCamera}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold text-xs transition-all ${
                isActive
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                  : "bg-teal-500 hover:bg-teal-400 text-teal-950 shadow-lg"
              }`}
            >
              {isActive ? <CameraOff size={14} /> : <Camera size={14} />}
              {isActive ? "Stop Gestures" : "Start Gestures"}
            </button>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${handDetected ? "bg-teal-400 animate-pulse" : "bg-white/20"}`} />
              <span className="text-xs text-white/60 font-semibold">
                {handDetected ? "Hand Detected" : "No Hand"}
              </span>
            </div>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {/* Instructions */}
        <div className="glass-card">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-teal-400" /> Virtual Healing Piano
          </h3>
          <div className="space-y-4 text-xs text-white/70">
            <div className="flex items-start gap-3">
              <span className="text-teal-400 font-black">01</span>
              <p>Turn on webcam hand gestures. Wait for the lightweight Google MediaPipe model to load.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-teal-400 font-black">02</span>
              <p>Move your hand horizontally in front of the lens to hover over the keyboard keys.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-teal-400 font-black">03</span>
              <p>Curl your index finger downward to "tap" and play the corresponding note instantly.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-teal-400 font-black">04</span>
              <p>You can also click or tap the keys directly on the keyboard layout below at any time.</p>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-teal-500/5 border border-teal-500/10">
            <p className="text-xs text-teal-300/80 font-medium">
              💡 Privacy-First: All hand pose calculations are processed locally inside your web browser. No media stream ever leaves your device.
            </p>
          </div>
        </div>
      </div>

      {/* Keyboard Layout */}
      <PianoKeyboard activeNote={activeNote} />
    </div>
  );
}
