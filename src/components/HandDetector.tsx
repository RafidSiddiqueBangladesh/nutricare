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

  // Initialize real MediaPipe Hand Landmarker
  useEffect(() => {
    const initializeHandLandmarker = async () => {
      try {
        const vision = await import('@mediapipe/tasks-vision');
        const { HandLandmarker, FilesetResolver } = vision;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
        );

        const landmarker = await HandLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            // Use jsDelivr CDN (CORS enabled) instead of Google Storage
            modelAssetPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/hand_landmarker.task',
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
    if (isInitialized && !cameraError) {
      startCamera().catch(err => {
        console.error('Camera error:', err);
        setError(`Camera: ${err.message}`);
      });
    }
  }, [isInitialized, startCamera, cameraError]);

  // Detect gesture from real hand landmarks
  const detectGesture = useCallback((keypoints: HandLandmark[]): string => {
    if (keypoints.length < 21) return 'neutral';

    const wrist = keypoints[0];
    const thumb = keypoints[4];
    const index = keypoints[8];
    const middle = keypoints[12];
    const ring = keypoints[16];
    const pinky = keypoints[20];

    if (!wrist || !thumb || !index || !middle) return 'neutral';

    // Check thumb up gesture
    if (thumb.y < wrist.y - 0.1 && Math.abs(thumb.x - wrist.x) < 0.05) {
      return 'thumbs-up';
    }

    // Check peace sign
    if (index.y < wrist.y && middle.y < wrist.y && ring.y > wrist.y && pinky.y > wrist.y) {
      return 'peace';
    }

    // Check open palm
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

  // Real detection loop
  useEffect(() => {
    if (!isRunning || !videoRef.current || !isInitialized || !handLandmarkerRef.current) return;

    const detectHands = async () => {
      const video = videoRef.current;
      const landmarker = handLandmarkerRef.current;

      if (video && video.readyState === 4) {
        try {
          const results = await landmarker.detectForVideo(video, performance.now());

          if (results.landmarks && results.landmarks.length > 0) {
            const hands = results.landmarks.map((landmarks: any, idx: number) => ({
              keypoints: landmarks.map((lm: any) => ({
                x: lm.x,
                y: lm.y,
                z: lm.z || 0,
                name: HAND_NAMES[landmarks.indexOf(lm)],
              })),
              label: results.handedness?.[idx]?.displayName?.toLowerCase() || (idx === 0 ? 'left' : 'right'),
            }));

            // Draw real hand detections
            if (showCanvas && canvasRef.current) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                ctx.drawImage(video, 0, 0);

                hands.forEach((hand, handIdx) => {
                  const color = handIdx === 0 ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 0, 255, 0.9)';

                  // Draw keypoints
                  ctx.fillStyle = color;
                  hand.keypoints.forEach((kp: HandLandmark) => {
                    ctx.beginPath();
                    ctx.arc(kp.x * canvas.width, kp.y * canvas.height, 4, 0, 2 * Math.PI);
                    ctx.fill();
                  });

                  // Draw connections
                  ctx.strokeStyle = color;
                  ctx.lineWidth = 2;
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
                });

                // Draw info
                ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
                ctx.font = 'bold 20px Arial';
                ctx.fillText(`${hands.length} Hand${hands.length !== 1 ? 's' : ''} Detected ✋`, 20, 40);
              }
            }

            onDetection?.({
              detected: true,
              confidence: Math.max(...hands.map((h: any) =>
                h.keypoints.reduce((sum: number, k: any) => sum + k.y, 0) / h.keypoints.length
              )),
              hands,
              gesture: hands.length > 0 ? detectGesture(hands[0].keypoints) : 'none',
            });
          } else {
            onDetection?.({
              detected: false,
              confidence: 0,
              hands: [],
              gesture: 'none',
            });
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
  }, [isRunning, isInitialized, showCanvas, onDetection, detectGesture]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-lg"
        style={{ transform: 'scaleX(-1)' }}
      />

      {showCanvas && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          style={{ transform: 'scaleX(-1)' }}
        />
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <p className="text-red-400 text-sm text-center px-4">{error}</p>
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <p className="text-red-400 text-sm text-center px-4">{cameraError}</p>
        </div>
      )}
    </div>
  );
};

export default HandDetector;
