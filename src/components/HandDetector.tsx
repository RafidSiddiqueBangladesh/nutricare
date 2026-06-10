import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCamera } from '@/src/hooks/useMedia';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
  name?: string;
}

export interface HandDetectionResult {
  detected: boolean;
  confidence: number;
  hands: Array<{
    keypoints: HandLandmark[];
    label?: string;
  }>;
  gesture?: string;
  leftDetected: boolean;
  rightDetected: boolean;
  missingParts: string[];
}

interface HandDetectorProps {
  onDetection?: (result: HandDetectionResult) => void;
  isRunning?: boolean;
  showCanvas?: boolean;
  maxHands?: number;
}

const HAND_NAMES = [
  'wrist', 'thumb_cmc', 'thumb_mcp', 'thumb_ip', 'thumb_tip',
  'index_mcp', 'index_pip', 'index_dip', 'index_tip',
  'middle_mcp', 'middle_pip', 'middle_dip', 'middle_tip',
  'ring_mcp', 'ring_pip', 'ring_dip', 'ring_tip',
  'pinky_mcp', 'pinky_pip', 'pinky_dip', 'pinky_tip',
];

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
];

// Finger tip indices for presence check
const FINGER_TIPS: Record<string, number> = {
  thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20,
};

export const HandDetector: React.FC<HandDetectorProps> = ({
  onDetection,
  isRunning = true,
  showCanvas = true,
  maxHands = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { videoRef, startCamera, error: cameraError } = useCamera();
  const handLandmarkerRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const lastDetectionRef = useRef<number>(0);
  const [detectionInfo, setDetectionInfo] = useState<HandDetectionResult | null>(null);

  // Initialize real MediaPipe Hand Landmarker
  useEffect(() => {
    const initializeHandLandmarker = async () => {
      try {
        const vision = await import('@mediapipe/tasks-vision');
        const { HandLandmarker, FilesetResolver } = vision;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          '/tasks-vision/wasm/'
        );

        const landmarker = await HandLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: '/hand_landmarker.task',
          },
          runningMode: 'VIDEO',
          numHands: maxHands,
        });

        handLandmarkerRef.current = landmarker;
        setIsInitialized(true);
        console.log('✅ Real Hand Detection Initialized');
      } catch (err) {
        console.error('❌ Hand detection init error:', err);
        setError('Hand detection unavailable');
      }
    };

    initializeHandLandmarker();
  }, [maxHands]);

  // Start camera
  useEffect(() => {
    if (!cameraError) {
      startCamera().catch(err => {
        console.error('Camera error:', err);
        setError(`Camera: ${err.message}`);
      });
    }
  }, [isInitialized, startCamera, cameraError]);

  // Detect gesture from real hand landmarks
  const detectGesture = useCallback((keypoints: HandLandmark[]): string => {
    if (keypoints.length < 21) return 'neutral';

    const wrist  = keypoints[0];
    const thumb  = keypoints[4];
    const index  = keypoints[8];
    const middle = keypoints[12];
    const ring   = keypoints[16];
    const pinky  = keypoints[20];

    if (!wrist || !thumb || !index || !middle) return 'neutral';

    if (thumb.y < wrist.y - 0.1 && Math.abs(thumb.x - wrist.x) < 0.05) {
      return 'thumbs-up';
    }

    if (index.y < wrist.y && middle.y < wrist.y && ring.y > wrist.y && pinky.y > wrist.y) {
      return 'peace';
    }

    if (
      thumb.x < wrist.x &&
      index.x > wrist.x &&
      Math.abs(thumb.y - wrist.y) < 0.1 &&
      index.y > middle.y &&
      middle.y > ring.y
    ) {
      return 'open-palm';
    }

    return 'neutral';
  }, []);

  // Compute missing fingers per hand (based on tip visibility via z)
  const computeMissingFingers = useCallback((keypoints: HandLandmark[], handLabel: string): string[] => {
    const missing: string[] = [];
    Object.entries(FINGER_TIPS).forEach(([finger, tipIdx]) => {
      const kp = keypoints[tipIdx];
      // z < -0.1 generally means the finger is behind the hand / not visible
      if (!kp || kp.z < -0.1) {
        missing.push(`${handLabel} ${finger}`);
      }
    });
    return missing;
  }, []);

  // Real detection loop with throttling for performance (10 FPS)
  useEffect(() => {
    if (!isRunning || !videoRef.current || !isInitialized || !handLandmarkerRef.current) return;

    const detectHands = async () => {
      const now = Date.now();
      if (now - lastDetectionRef.current < 100) {
        animationRef.current = requestAnimationFrame(detectHands);
        return;
      }
      lastDetectionRef.current = now;

      const video    = videoRef.current;
      const landmarker = handLandmarkerRef.current;

      if (video && video.readyState === 4) {
        try {
          const results = await landmarker.detectForVideo(video, performance.now());

          if (results.landmarks && results.landmarks.length > 0) {
            const hands = results.landmarks.map((landmarks: any, idx: number) => ({
              keypoints: landmarks.map((lm: any, lmIdx: number) => ({
                x: lm.x,
                y: lm.y,
                z: lm.z || 0,
                name: HAND_NAMES[lmIdx] || `pt${lmIdx}`,
              })),
              label: results.handedness?.[idx]?.[0]?.categoryName?.toLowerCase() ||
                     (idx === 0 ? 'left' : 'right'),
            }));

            const leftDetected  = hands.some((h: any) => h.label === 'left');
            const rightDetected = hands.some((h: any) => h.label === 'right');
            const allMissing: string[] = [];
            if (!leftDetected)  allMissing.push('left hand');
            if (!rightDetected) allMissing.push('right hand');
            hands.forEach((hand: any) => {
              const fingerMissing = computeMissingFingers(hand.keypoints, hand.label);
              allMissing.push(...fingerMissing);
            });

            // Draw on canvas
            if (showCanvas && canvasRef.current) {
              const canvas = canvasRef.current;
              const ctx    = canvas.getContext('2d');
              if (ctx) {
                canvas.width  = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                hands.forEach((hand: any, handIdx: number) => {
                  const isLeft  = hand.label === 'left';
                  const color   = isLeft ? 'rgba(0,230,255,0.95)' : 'rgba(255,80,255,0.95)';
                  const colorFaded = isLeft ? 'rgba(0,230,255,0.5)' : 'rgba(255,80,255,0.5)';

                  // Draw connections
                  ctx.strokeStyle = colorFaded;
                  ctx.lineWidth = 2.5;
                  HAND_CONNECTIONS.forEach(([i, j]) => {
                    const kp1 = hand.keypoints[i];
                    const kp2 = hand.keypoints[j];
                    if (kp1 && kp2) {
                      ctx.beginPath();
                      ctx.moveTo(kp1.x * canvas.width, kp1.y * canvas.height);
                      ctx.lineTo(kp2.x * canvas.width, kp2.y * canvas.height);
                      ctx.stroke();
                    }
                  });

                  // Draw keypoints with names on tips
                  hand.keypoints.forEach((kp: HandLandmark, kpIdx: number) => {
                    const isTip = [4, 8, 12, 16, 20].includes(kpIdx);
                    const r = isTip ? 7 : 4;
                    ctx.fillStyle = isTip ? 'rgba(255,255,0,0.95)' : color;
                    ctx.beginPath();
                    ctx.arc(kp.x * canvas.width, kp.y * canvas.height, r, 0, 2 * Math.PI);
                    ctx.fill();

                    // Label tip fingers
                    if (isTip && kp.name) {
                      ctx.fillStyle = 'white';
                      ctx.font = 'bold 10px Arial';
                      ctx.fillText(kp.name.replace('_tip', ''), kp.x * canvas.width + 8, kp.y * canvas.height - 4);
                    }
                  });

                  // Hand label banner
                  const wrist = hand.keypoints[0];
                  if (wrist) {
                    ctx.fillStyle = color;
                    ctx.font = 'bold 18px Arial';
                    ctx.fillText(
                      `${isLeft ? '🤚 LEFT' : '✋ RIGHT'}`,
                      wrist.x * canvas.width - 30,
                      wrist.y * canvas.height + 28
                    );
                  }
                });

                // Summary overlay top-left
                ctx.fillStyle = 'rgba(0,0,0,0.55)';
                ctx.fillRect(8, 8, 260, 60);
                ctx.fillStyle = 'rgba(255,255,255,0.95)';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(`Left: ${leftDetected ? '✅ Detected' : '❌ Not detected'}`, 16, 30);
                ctx.fillText(`Right: ${rightDetected ? '✅ Detected' : '❌ Not detected'}`, 16, 52);
              }
            }

            const info: HandDetectionResult = {
              detected: true,
              confidence: Math.max(...hands.map((h: any) =>
                h.keypoints.reduce((s: number, k: any) => s + Math.abs(k.z), 0) / h.keypoints.length
              )),
              hands,
              gesture: hands.length > 0 ? detectGesture(hands[0].keypoints) : 'none',
              leftDetected,
              rightDetected,
              missingParts: allMissing,
            };

            setDetectionInfo(info);
            onDetection?.(info);
          } else {
            const info: HandDetectionResult = {
              detected: false,
              confidence: 0,
              hands: [],
              gesture: 'none',
              leftDetected: false,
              rightDetected: false,
              missingParts: ['left hand', 'right hand'],
            };
            setDetectionInfo(info);
            onDetection?.(info);
          }
        } catch (err) {
          console.error('Hand detection error:', err);
        }
      }

      animationRef.current = requestAnimationFrame(detectHands);
    };

    animationRef.current = requestAnimationFrame(detectHands);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, isInitialized, showCanvas, onDetection, detectGesture, computeMissingFingers]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-lg absolute"
        style={{ transform: 'scaleX(-1)' }}
      />

      {showCanvas && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />
      )}

      {/* Model status badge */}
      {!isInitialized && !error && (
        <div className="absolute top-3 left-3 bg-cyan-500/90 px-3 py-1.5 rounded-md z-20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-900 animate-pulse" />
          <p className="text-cyan-950 font-semibold text-xs">Loading hand model…</p>
        </div>
      )}

      {isInitialized && !error && (
        <div className="absolute top-3 right-3 bg-cyan-600/80 px-2 py-1 rounded-md z-20">
          <p className="text-white font-bold text-[10px]">✅ MODEL READY</p>
        </div>
      )}

      {error && (
        <div className="absolute top-3 left-3 bg-red-500/90 px-3 py-1.5 rounded-md z-20">
          <p className="text-red-950 text-xs font-semibold">{error}</p>
        </div>
      )}

      {cameraError && (
        <div className="absolute top-3 left-3 bg-red-500/90 px-3 py-1.5 rounded-md z-20">
          <p className="text-red-950 text-xs font-semibold">{cameraError}</p>
        </div>
      )}
    </div>
  );
};

export default HandDetector;
