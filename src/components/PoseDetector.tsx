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
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repCount, setRepCount] = useState(0);
  const prevPoseRef = useRef<{ y: number }[]>([]);
  const { videoRef, startCamera, error: cameraError } = useCamera();
  const animationRef = useRef<number | null>(null);

  // Initialize
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Start camera
  useEffect(() => {
    if (isInitialized && !cameraError) {
      startCamera();
    }
  }, [isInitialized, startCamera, cameraError]);

  // Generate mock keypoints
  const generateMockKeypoints = useCallback((): PoseLandmark[] => {
    return Array.from({ length: 17 }, (_, i) => ({
      x: Math.random() * 0.8 + 0.1,
      y: Math.random() * 0.8 + 0.1,
      score: Math.random() > 0.3 ? Math.random() * 0.5 + 0.5 : 0,
      name: `keypoint_${i}`,
    }));
  }, []);

  // Detection loop
  useEffect(() => {
    if (!isRunning || !videoRef.current || !isInitialized) return;

    let animationId: number;
    const detectPose = async () => {
      const video = videoRef.current;
      
      // Generate mock keypoints
      const keypoints = generateMockKeypoints();
      const formScore = Math.round(
        (keypoints.filter(k => k.score > 0.3).length / keypoints.length) * 100
      );

      // Count reps based on movement
      if (prevPoseRef.current.length > 0 && keypoints[11]) {
        const yMovement = Math.abs(keypoints[11].y - (prevPoseRef.current[11]?.y || 0));
        if (yMovement > 0.15) {
          setRepCount(prev => prev + 1);
        }
      }
      prevPoseRef.current = keypoints;

      const result: PoseDetectionResult = {
        detected: keypoints.length > 0,
        confidence: formScore / 100,
        keypoints,
        repCount,
        formScore,
        exerciseType,
      };

      onDetection?.(result);

      // Draw on canvas
      if (showCanvas && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video?.videoWidth || 640;
          canvas.height = video?.videoHeight || 480;
          
          // Draw video if available, otherwise gradient
          if (video && video.readyState === 4) {
            ctx.drawImage(video, 0, 0);
          } else {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, 'rgba(0, 30, 40, 0.9)');
            gradient.addColorStop(1, 'rgba(0, 50, 60, 0.9)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Draw keypoints
          ctx.fillStyle = 'rgb(0, 255, 0)';
          keypoints.forEach(kp => {
            if (kp.score > 0.3) {
              ctx.beginPath();
              ctx.arc(kp.x * canvas.width, kp.y * canvas.height, 5, 0, 2 * Math.PI);
              ctx.fill();
            }
          });

          // Draw skeleton
          ctx.strokeStyle = 'rgb(0, 255, 0)';
          ctx.lineWidth = 2;
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
          
          // Draw rep counter
          ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
          ctx.font = 'bold 24px Arial';
          ctx.fillText(`Reps: ${repCount}`, 20, 40);
          
          // Draw info
          if (!video || video.readyState !== 4) {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
            ctx.font = '14px Arial';
            ctx.fillText('Camera not available - showing mock data', 20, canvas.height - 20);
          }
        }
      }

      animationId = requestAnimationFrame(detectPose);
    };

    animationId = requestAnimationFrame(detectPose);
    return () => cancelAnimationFrame(animationId);
  }, [isRunning, isInitialized, showCanvas, onDetection, generateMockKeypoints, repCount, exerciseType]);

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

      <div className="absolute top-4 right-4 bg-black/60 px-3 py-2 rounded-lg">
        <p className="text-green-400 font-bold text-sm">Reps: {repCount}</p>
      </div>

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

export default PoseDetector;
