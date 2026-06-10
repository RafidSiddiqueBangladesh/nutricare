import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCamera } from '@/src/hooks/useMedia';

export interface PoseLandmark {
  x: number;
  y: number;
  score: number;
  name?: string;
}

export interface PoseDetectionResult {
  detected: boolean;
  confidence: number;
  keypoints: PoseLandmark[];
  repCount?: number;
  formScore?: number;
  exerciseType?: string;
  leftShoulderDetected: boolean;
  rightShoulderDetected: boolean;
  movementActive: boolean;
}

interface PoseDetectorProps {
  onDetection?: (result: PoseDetectionResult) => void;
  isRunning?: boolean;
  showCanvas?: boolean;
  exerciseType?: string;
}

const KEYPOINT_PAIRS = [
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
  [5, 11], [6, 12], [11, 12], [11, 13],
  [13, 15], [12, 14], [14, 16]
];

// MoveNet keypoint names at indices
const KEYPOINT_NAMES: Record<number, string> = {
  0: 'nose', 1: 'left_eye', 2: 'right_eye', 3: 'left_ear', 4: 'right_ear',
  5: 'left_shoulder', 6: 'right_shoulder', 7: 'left_elbow', 8: 'right_elbow',
  9: 'left_wrist', 10: 'right_wrist', 11: 'left_hip', 12: 'right_hip',
  13: 'left_knee', 14: 'right_knee', 15: 'left_ankle', 16: 'right_ankle',
};

const CONFIDENCE_THRESHOLD = 0.3;
// Movement detection: shoulder y-delta over last N frames
const MOVEMENT_WINDOW = 8;
const MOVEMENT_THRESHOLD = 0.02;

export const PoseDetector: React.FC<PoseDetectorProps> = ({
  onDetection,
  isRunning = true,
  showCanvas = true,
  exerciseType = 'general',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repCount, setRepCount] = useState(0);
  const prevPoseRef = useRef<PoseLandmark[]>([]);
  const movementHistoryRef = useRef<number[]>([]);
  const { videoRef, startCamera, error: cameraError } = useCamera();
  const poseDetectorRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const lastDetectionRef = useRef<number>(0);

  // Initialize real TensorFlow Pose Detection
  useEffect(() => {
    const initializePoseDetection = async () => {
      try {
        const tf = await import('@tensorflow/tfjs');
        const poseDetection = await import('@tensorflow-models/pose-detection');

        await tf.ready();

        const moveNetModelType =
          poseDetection.movenet?.modelType?.SINGLEPOSE_LIGHTNING || 'SinglePose.Lightning';

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: moveNetModelType }
        );

        poseDetectorRef.current = detector;
        setIsInitialized(true);
        console.log('✅ Real Pose Detection Initialized');
      } catch (err) {
        console.error('❌ Pose detection init error:', err);
        setError('Pose detection unavailable');
      }
    };

    initializePoseDetection();
  }, []);

  // Start camera
  useEffect(() => {
    if (!cameraError) {
      startCamera().catch(err => {
        console.error('Camera error:', err);
        setError(`Camera: ${err.message}`);
      });
    }
  }, [isInitialized, startCamera, cameraError]);

  // Count reps from real pose data
  const countReps = useCallback((keypoints: PoseLandmark[]) => {
    if (prevPoseRef.current.length === 0) {
      prevPoseRef.current = keypoints;
      return 0;
    }

    const leftShoulder      = keypoints[5];
    const prevLeftShoulder  = prevPoseRef.current[5];

    if (!leftShoulder || !prevLeftShoulder) return 0;

    const yMovement = Math.abs(leftShoulder.y - prevLeftShoulder.y);
    if (yMovement > 0.1) {
      prevPoseRef.current = keypoints;
      return 1;
    }

    prevPoseRef.current = keypoints;
    return 0;
  }, []);

  // Real detection loop with throttling
  useEffect(() => {
    if (!isRunning || !videoRef.current || !isInitialized || !poseDetectorRef.current) return;

    const detectPose = async () => {
      const now = Date.now();
      if (now - lastDetectionRef.current < 67) {
        animationRef.current = requestAnimationFrame(detectPose);
        return;
      }
      lastDetectionRef.current = now;

      const video    = videoRef.current;
      const detector = poseDetectorRef.current;

      if (video && video.readyState === 4) {
        try {
          const poses = await detector.estimatePoses(video);

          if (poses && poses.length > 0) {
            const pose = poses[0];
            const keypoints: PoseLandmark[] = pose.keypoints.map((kp: any, idx: number) => ({
              x: kp.x / video.videoWidth,
              y: kp.y / video.videoHeight,
              score: kp.score || 0,
              name: kp.name || KEYPOINT_NAMES[idx] || `kp${idx}`,
            }));

            const repInc = countReps(keypoints);
            if (repInc > 0) {
              setRepCount(prev => prev + repInc);
            }

            // Shoulder detection
            const ls = keypoints[5];
            const rs = keypoints[6];
            const leftShoulderDetected  = (ls?.score ?? 0) >= CONFIDENCE_THRESHOLD;
            const rightShoulderDetected = (rs?.score ?? 0) >= CONFIDENCE_THRESHOLD;

            // Movement detection via shoulder y-delta
            const shoulderY = ls ? ls.y : (rs ? rs.y : 0);
            movementHistoryRef.current = [...movementHistoryRef.current.slice(-(MOVEMENT_WINDOW - 1)), shoulderY];
            const yDelta = movementHistoryRef.current.length >= 2
              ? Math.abs(
                  movementHistoryRef.current[movementHistoryRef.current.length - 1] -
                  movementHistoryRef.current[0]
                )
              : 0;
            const movementActive = yDelta > MOVEMENT_THRESHOLD;

            const formScore = Math.round(
              (keypoints.filter(k => k.score > CONFIDENCE_THRESHOLD).length / keypoints.length) * 100
            );

            // Draw real poses on canvas overlay
            if (showCanvas && canvasRef.current) {
              const canvas = canvasRef.current;
              const ctx    = canvas.getContext('2d');
              if (ctx) {
                canvas.width  = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw skeleton connections
                ctx.strokeStyle = 'rgba(0, 255, 160, 0.65)';
                ctx.lineWidth = 3;
                KEYPOINT_PAIRS.forEach(([i, j]) => {
                  const kp1 = keypoints[i];
                  const kp2 = keypoints[j];
                  if (kp1 && kp2 && kp1.score > CONFIDENCE_THRESHOLD && kp2.score > CONFIDENCE_THRESHOLD) {
                    ctx.beginPath();
                    ctx.moveTo(kp1.x * canvas.width, kp1.y * canvas.height);
                    ctx.lineTo(kp2.x * canvas.width, kp2.y * canvas.height);
                    ctx.stroke();
                  }
                });

                // Draw keypoints with labels
                keypoints.forEach((kp, idx) => {
                  if (kp.score > CONFIDENCE_THRESHOLD) {
                    const isShoulder = idx === 5 || idx === 6;
                    ctx.fillStyle = isShoulder ? 'rgba(255,220,0,0.95)' : 'rgba(0,255,160,0.85)';
                    const r = isShoulder ? 9 : 6;
                    ctx.beginPath();
                    ctx.arc(kp.x * canvas.width, kp.y * canvas.height, r, 0, 2 * Math.PI);
                    ctx.fill();

                    // Label shoulders specifically
                    if (isShoulder && kp.name) {
                      ctx.fillStyle = 'white';
                      ctx.font = 'bold 11px Arial';
                      ctx.fillText(
                        idx === 5 ? 'L.Shoulder' : 'R.Shoulder',
                        kp.x * canvas.width + 10,
                        kp.y * canvas.height - 4
                      );
                    }
                  }
                });

                // Info overlay
                ctx.fillStyle = 'rgba(0,0,0,0.55)';
                ctx.fillRect(8, 8, 300, 80);
                ctx.fillStyle = 'rgba(255,255,255,0.95)';
                ctx.font = 'bold 13px Arial';
                ctx.fillText(`L.Shoulder: ${leftShoulderDetected ? '✅ Detected' : '❌ Not detected'}`, 16, 30);
                ctx.fillText(`R.Shoulder: ${rightShoulderDetected ? '✅ Detected' : '❌ Not detected'}`, 16, 50);
                ctx.fillText(`Movement: ${movementActive ? '🟢 Active' : '⚪ Not active'}`, 16, 72);
              }
            }

            onDetection?.({
              detected: true,
              confidence: Math.max(...keypoints.map(k => k.score)),
              keypoints,
              repCount,
              formScore,
              exerciseType,
              leftShoulderDetected,
              rightShoulderDetected,
              movementActive,
            });
          } else {
            onDetection?.({
              detected: false,
              confidence: 0,
              keypoints: [],
              repCount,
              formScore: 0,
              exerciseType,
              leftShoulderDetected: false,
              rightShoulderDetected: false,
              movementActive: false,
            });
          }
        } catch (err) {
          console.error('Pose detection error:', err);
        }
      }

      animationRef.current = requestAnimationFrame(detectPose);
    };

    animationRef.current = requestAnimationFrame(detectPose);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, isInitialized, showCanvas, onDetection, countReps, repCount, exerciseType]);

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

      <div className="absolute top-4 right-4 bg-black/60 px-3 py-2 rounded-lg z-10">
        <p className="text-green-400 font-bold text-sm">💪 Reps: {repCount}</p>
      </div>

      {!isInitialized && !error && (
        <div className="absolute top-4 left-4 bg-teal-500/90 px-3 py-1.5 rounded-md z-20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-900 animate-pulse" />
          <p className="text-teal-950 font-semibold text-xs">Loading pose model…</p>
        </div>
      )}

      {isInitialized && !error && (
        <div className="absolute bottom-4 right-4 bg-teal-700/80 px-2 py-1 rounded-md z-20">
          <p className="text-white font-bold text-[10px]">✅ MODEL READY</p>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 bg-red-500/90 px-3 py-1.5 rounded-md z-20">
          <p className="text-red-950 text-xs font-semibold">{error}</p>
        </div>
      )}

      {cameraError && (
        <div className="absolute top-4 left-4 bg-red-500/90 px-3 py-1.5 rounded-md z-20">
          <p className="text-red-950 text-xs font-semibold">{cameraError}</p>
        </div>
      )}
    </div>
  );
};

export default PoseDetector;
