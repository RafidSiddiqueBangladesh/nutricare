import React, { useEffect, useRef, useState } from 'react';
import { useCamera } from '@/src/hooks/useMedia';

export interface FaceDetectionResult {
  detected: boolean;
  confidence: number;
  landmarks: Array<{ x: number; y: number; z: number }>;
  emotion?: 'happy' | 'sad' | 'astonished' | 'neutral';
  emotionScore?: number;
}

interface FaceDetectorProps {
  onDetection?: (result: FaceDetectionResult) => void;
  isRunning?: boolean;
  showCanvas?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export const FaceDetector: React.FC<FaceDetectorProps> = ({
  onDetection,
  isRunning = true,
  showCanvas = true,
  videoRef: propVideoRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { videoRef: hookVideoRef, startCamera, error: cameraError } = useCamera();
  const videoRef = propVideoRef || hookVideoRef;
  const faceLandmarkerRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize MediaPipe Face Landmarker with real detection
  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        const vision = await import('@mediapipe/tasks-vision');
        const { FaceLandmarker, FilesetResolver } = vision;
        
        const filesetResolver = await FilesetResolver.forVisionTasks(
          '/tasks-vision/wasm/'
        );
        
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { 
            modelAssetPath: '/face_landmarker.task' 
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        
        faceLandmarkerRef.current = landmarker;
        setIsInitialized(true);
        console.log('✅ Real Face Detection Initialized');
      } catch (err) {
        console.error('❌ Face detection init error:', err);
        setError('Face detection unavailable. Check camera permissions.');
      }
    };

    initializeFaceLandmarker();
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

  /**
   * Improved emotion detection using MediaPipe face landmark indices.
   *
   * Key insight: when the mouth is open (talking / smiling with open mouth),
   * the vertical distance between lips increases significantly. A wide mouth
   * combined with raised corners is a strong smile indicator.
   *
   * Landmark indices (MediaPipe canonical):
   *   13  = upper-lip center
   *   14  = lower-lip center
   *   61  = left mouth corner
   *   291 = right mouth corner
   *   33  = left eye outer
   *   263 = right eye outer
   *   159 = left eye upper-lid center
   *   145 = left eye lower-lid center
   */
  const detectEmotion = (landmarks: any[]): { emotion: 'happy' | 'sad' | 'astonished' | 'neutral'; score: number } => {
    if (!landmarks || landmarks.length < 300) return { emotion: 'neutral', score: 0.5 };

    const mouthTop    = landmarks[13];
    const mouthBottom = landmarks[14];
    const mouthLeft   = landmarks[61];
    const mouthRight  = landmarks[291];
    const leftEyeTop  = landmarks[159];
    const leftEyeBot  = landmarks[145];
    const rightEyeTop = landmarks[386];
    const rightEyeBot = landmarks[374];

    if (!mouthTop || !mouthBottom || !mouthLeft || !mouthRight) {
      return { emotion: 'neutral', score: 0.5 };
    }

    // Normalized mouth openness (vertical gap / face width proxy)
    const mouthHeight = Math.abs(mouthBottom.y - mouthTop.y);
    const mouthWidth  = Math.abs(mouthRight.x - mouthLeft.x);
    // Mouth aspect ratio – high when open
    const mar = mouthHeight / (mouthWidth + 0.001);

    // Eye openness
    const leftEyeHeight  = leftEyeTop  && leftEyeBot  ? Math.abs(leftEyeTop.y  - leftEyeBot.y)  : 0;
    const rightEyeHeight = rightEyeTop && rightEyeBot ? Math.abs(rightEyeTop.y - rightEyeBot.y) : 0;
    const eyeHeight = (leftEyeHeight + rightEyeHeight) / 2;

    // Happy: mouth open (MAR > 0.25) OR wide mouth (>8% of normalised width)
    if (mar > 0.25 || (mouthWidth > 0.09 && mouthHeight > 0.025)) {
      return { emotion: 'happy', score: Math.min(0.95, 0.7 + mar * 0.5) };
    }

    // Astonished: eyes very wide AND mouth somewhat open
    if (eyeHeight > 0.06 && mouthHeight > 0.02) {
      return { emotion: 'astonished', score: 0.8 };
    }

    // Sad: very tight mouth (narrow, nearly closed) + small eye opening
    if (mouthHeight < 0.015 && eyeHeight < 0.03) {
      return { emotion: 'sad', score: 0.75 };
    }

    return { emotion: 'neutral', score: 0.6 };
  };

  // Real detection loop
  useEffect(() => {
    if (!isRunning || !videoRef.current || !isInitialized || !faceLandmarkerRef.current) return;

    const detectFaces = async () => {
      const video = videoRef.current;
      const landmarker = faceLandmarkerRef.current;

      if (video && video.readyState === 4) {
        try {
          const results = await landmarker.detectForVideo(video, performance.now());

          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            const { emotion, score } = detectEmotion(landmarks);

            // Draw real detections on canvas
            if (showCanvas && canvasRef.current) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw face landmarks
                ctx.fillStyle = 'rgba(0, 255, 180, 0.85)';
                landmarks.forEach((landmark: any) => {
                  ctx.beginPath();
                  ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 2.5, 0, 2 * Math.PI);
                  ctx.fill();
                });

                // Draw face contour
                ctx.strokeStyle = 'rgba(0, 255, 180, 0.55)';
                ctx.lineWidth = 1.5;
                const contourIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
                
                ctx.beginPath();
                contourIndices.forEach((idx, i) => {
                  const lm = landmarks[idx];
                  if (lm) {
                    if (i === 0) ctx.moveTo(lm.x * canvas.width, lm.y * canvas.height);
                    else ctx.lineTo(lm.x * canvas.width, lm.y * canvas.height);
                  }
                });
                ctx.stroke();

                // Draw emotion label prominently
                const emotionEmoji = emotion === 'happy' ? '😊' : emotion === 'sad' ? '😢' : emotion === 'astonished' ? '😲' : '😐';
                ctx.fillStyle = 'rgba(0, 255, 180, 0.95)';
                ctx.font = 'bold 26px Arial';
                ctx.fillText(`${emotionEmoji} ${emotion.toUpperCase()}`, 16, 44);
                ctx.font = '14px Arial';
                ctx.fillStyle = 'rgba(180, 255, 220, 0.9)';
                ctx.fillText(`Confidence: ${Math.round(score * 100)}%`, 16, 68);
                ctx.fillText(`Landmarks: ${landmarks.length}`, 16, 90);
              }
            }

            // Send real detection data
            onDetection?.({
              detected: true,
              confidence: score,
              emotion,
              emotionScore: score,
              landmarks,
            });
          } else {
            onDetection?.({
              detected: false,
              confidence: 0,
              landmarks: [],
            });
          }
        } catch (err) {
          console.error('Detection error:', err);
        }
      }

      animationRef.current = requestAnimationFrame(detectFaces);
    };

    animationRef.current = requestAnimationFrame(detectFaces);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, isInitialized, showCanvas, onDetection]);

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
          className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />
      )}

      {/* Model loading indicator */}
      {!isInitialized && !error && (
        <div className="absolute top-3 left-3 bg-teal-500/90 px-3 py-1.5 rounded-md z-20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-900 animate-pulse" />
          <p className="text-teal-950 font-semibold text-xs">Loading face model…</p>
        </div>
      )}

      {isInitialized && !error && (
        <div className="absolute top-3 right-3 bg-teal-600/80 px-2 py-1 rounded-md z-20">
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

export default FaceDetector;
