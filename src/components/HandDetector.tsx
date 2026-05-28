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

  // Generate mock hand keypoints
  const generateMockHand = useCallback((): HandLandmark[] => {
    return Array.from({ length: 21 }, (_, i) => ({
      x: Math.random() * 0.3 + 0.2,
      y: Math.random() * 0.3 + 0.2,
      z: Math.random() * 0.1,
      name: HAND_NAMES[i],
    }));
  }, []);

  // Detect gesture
  const detectGesture = useCallback((keypoints: HandLandmark[]): string => {
    if (keypoints.length < 21) return 'unknown';
    const avgX = keypoints.reduce((sum, k) => sum + k.x, 0) / keypoints.length;
    const avgY = keypoints.reduce((sum, k) => sum + k.y, 0) / keypoints.length;

    if (avgX < 0.3 && avgY < 0.3) return 'thumbs-up';
    if (avgX > 0.7) return 'peace';
    return 'neutral';
  }, []);

  // Detection loop
  useEffect(() => {
    if (!isRunning || !videoRef.current || !isInitialized) return;

    let animationId: number;
    const detectHands = async () => {
      const video = videoRef.current;
      
      // Generate mock hands
      const numHands = Math.random() > 0.5 ? 1 : 0;
      const hands = Array.from({ length: numHands }, (_, i) => {
        const keypoints = generateMockHand();
        return {
          keypoints,
          label: i === 0 ? 'left' : 'right',
        };
      });

      const result: HandDetectionResult = {
        detected: hands.length > 0,
        confidence: hands.length > 0 ? 0.75 : 0,
        hands,
        gesture: hands.length > 0 ? detectGesture(hands[0].keypoints) : 'none',
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

          hands.forEach((hand, handIdx) => {
            const color = handIdx === 0 ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 255)';
            
            // Draw keypoints
            ctx.fillStyle = color;
            hand.keypoints.forEach(kp => {
              ctx.beginPath();
              ctx.arc(kp.x * canvas.width, kp.y * canvas.height, 5, 0, 2 * Math.PI);
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
          
          // Draw info text
          if (!video || video.readyState !== 4) {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
            ctx.font = '14px Arial';
            ctx.fillText('Camera not available - showing mock data', 20, canvas.height - 20);
          }
        }
      }

      animationId = requestAnimationFrame(detectHands);
    };

    animationId = requestAnimationFrame(detectHands);
    return () => cancelAnimationFrame(animationId);
  }, [isRunning, isInitialized, showCanvas, onDetection, generateMockHand, detectGesture]);

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
