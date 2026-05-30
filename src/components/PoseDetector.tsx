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

export const PoseDetector: React.FC<PoseDetectorProps> = ({
  onDetection,
  isRunning = true,
  showCanvas = true,
  exerciseType = 'general',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repCount, setRepCount] = useState(0);
  const prevPoseRef = useRef<PoseLandmark[]>([]);
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

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.moveNet.modelType.SINGLEPOSE_THUNDER }
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
    if (isInitialized && !cameraError) {
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

    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const prevLeftShoulder = prevPoseRef.current[5];

    if (!leftShoulder || !rightShoulder || !prevLeftShoulder) return 0;

    // Detect rep by shoulder movement
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
      // Throttle to 15 FPS for performance (every 67ms)
      if (now - lastDetectionRef.current < 67) {
        animationRef.current = requestAnimationFrame(detectPose);
        return;
      }
      lastDetectionRef.current = now;

      const video = videoRef.current;
      const detector = poseDetectorRef.current;

      if (video && video.readyState === 4) {
        try {
          const poses = await detector.estimatePoses(video);

          if (poses && poses.length > 0) {
            const pose = poses[0];
            const keypoints: PoseLandmark[] = pose.keypoints.map((kp: any) => ({
              x: kp.x / video.videoWidth,
              y: kp.y / video.videoHeight,
              score: kp.score || 0,
              name: kp.name,
            }));

            const repInc = countReps(keypoints);
            if (repInc > 0) {
              setRepCount(prev => prev + repInc);
            }

            const formScore = Math.round(
              (keypoints.filter(k => k.score > 0.3).length / keypoints.length) * 100
            );

            // Draw real poses on canvas overlay
            if (showCanvas && canvasRef.current && videoCanvasRef.current) {
              const canvas = canvasRef.current;
              const videoCanvas = videoCanvasRef.current;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                videoCanvas.width = video.videoWidth;
                videoCanvas.height = video.videoHeight;

                // Draw video frame to overlay
                const videoCtx = videoCanvas.getContext('2d');
                if (videoCtx) {
                  videoCtx.drawImage(video, 0, 0);
                }

                // Draw skeleton on overlay
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw keypoints
                ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
                keypoints.forEach(kp => {
                  if (kp.score > 0.3) {
                    ctx.beginPath();
                    ctx.arc(kp.x * canvas.width, kp.y * canvas.height, 8, 0, 2 * Math.PI);
                    ctx.fill();
                  }
                });

                // Draw skeleton
                ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
                ctx.lineWidth = 3;
                KEYPOINT_PAIRS.forEach(([i, j]) => {
                  const kp1 = keypoints[i];
                  const kp2 = keypoints[j];
                  if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
                    ctx.beginPath();
                    ctx.moveTo(kp1.x * canvas.width, kp1.y * canvas.height);
                    ctx.lineTo(kp2.x * canvas.width, kp2.y * canvas.height);
                    ctx.stroke();
                  }
                });

                // Draw real results
                ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
                ctx.font = 'bold 28px Arial';
                ctx.fillText(`💪 Reps: ${repCount}`, 20, 50);
                ctx.font = '16px Arial';
                ctx.fillStyle = 'rgba(100, 255, 100, 0.9)';
                const maxConf = Math.max(...keypoints.map(k => k.score));
                ctx.fillText(`Form: ${formScore}% | Confidence: ${Math.round(maxConf * 100)}%`, 20, 80);
              }
            }

            onDetection?.({
              detected: true,
              confidence: Math.max(...keypoints.map(k => k.score)),
              keypoints,
              repCount,
              formScore,
              exerciseType,
            });
          } else {
            onDetection?.({
              detected: false,
              confidence: 0,
              keypoints: [],
              repCount,
              formScore: 0,
              exerciseType,
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
        <>
          <canvas
            ref={videoCanvasRef}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
          />
        </>
      )}

      <div className="absolute top-4 right-4 bg-black/60 px-3 py-2 rounded-lg z-10">
        <p className="text-green-400 font-bold text-sm">💪 Reps: {repCount}</p>
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-20">
          <p className="text-red-400 text-sm text-center px-4">{error}</p>
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-20">
          <p className="text-red-400 text-sm text-center px-4">{cameraError}</p>
        </div>
      )}
    </div>
  );
};

export default PoseDetector;
