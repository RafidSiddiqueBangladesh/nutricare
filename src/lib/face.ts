import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let landmarkerInstance: FaceLandmarker | null = null;

export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (landmarkerInstance) return landmarkerInstance;
  
  const filesetResolver = await FilesetResolver.forVisionTasks(
    '/tasks-vision/wasm/'
  );
  
  landmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: { 
      modelAssetPath: '/face_landmarker.task' 
    },
    runningMode: 'VIDEO',
    numFaces: 1,
  });
  
  return landmarkerInstance;
}

export function computeFaceMetrics(landmarks: any[], videoWidth: number, videoHeight: number) {
  if (!landmarks || landmarks.length < 400) {
    return { pdMm: 63.0 };
  }
  
  // Iris centers are landmarks 468 (left) and 473 (right). 
  // If not available, fall back to eye lid centers 159 (left) and 386 (right).
  const leftEye = landmarks[468] || landmarks[159];
  const rightEye = landmarks[473] || landmarks[386];
  
  if (!leftEye || !rightEye) {
    return { pdMm: 63.0 };
  }

  // Calculate pixel distance between eye centers
  const dx = (rightEye.x - leftEye.x) * videoWidth;
  const dy = (rightEye.y - leftEye.y) * videoHeight;
  const pixelDistance = Math.sqrt(dx * dx + dy * dy);
  
  // Human iris has a constant diameter of approximately 11.7 mm (radius 5.85 mm).
  // We can measure the radius of the iris in pixels to get the physical scale (mm/pixel).
  let scale = 0.28; // default fallback scale
  
  if (landmarks[468] && landmarks[469]) {
    const irisCenter = landmarks[468];
    const irisEdge = landmarks[469];
    const dxIris = (irisEdge.x - irisCenter.x) * videoWidth;
    const dyIris = (irisEdge.y - irisCenter.y) * videoHeight;
    const irisRadiusPx = Math.sqrt(dxIris * dxIris + dyIris * dyIris);
    
    if (irisRadiusPx > 1) {
      scale = 5.85 / irisRadiusPx;
    }
  } else {
    // Standard scaling based on expected pixel distance
    scale = 63.0 / (pixelDistance || 1);
  }
  
  const pdMm = pixelDistance * scale;
  
  // Guard values to keep pupil distance within a realistic range
  const validatedPd = pdMm > 45 && pdMm < 80 ? pdMm : 63.0;
  
  return {
    pdMm: validatedPd
  };
}
