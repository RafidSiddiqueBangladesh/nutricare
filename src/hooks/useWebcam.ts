import { useCamera } from './useMedia';

export function useWebcam() {
  const { videoRef, isActive, error, startCamera, stopCamera } = useCamera({
    video: { width: 640, height: 480, facingMode: 'user' }
  });
  
  return {
    videoRef,
    isActive,
    error,
    start: startCamera,
    stop: stopCamera
  };
}
