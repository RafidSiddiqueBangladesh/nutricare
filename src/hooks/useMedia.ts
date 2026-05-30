import { useState, useEffect, useRef, useCallback } from 'react';

export interface MediaStreamOptions {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

export const useCamera = (options: MediaStreamOptions = { video: true }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(options);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          // Some browsers require an explicit play() call after setting srcObject
          // to show the preview immediately.
          // Ignore play errors (autoplay policies) since video elements elsewhere are muted.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play() failed or delayed:', playErr);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      console.error('Camera access error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    stream,
    error,
    isLoading,
    videoRef,
    startCamera,
    stopCamera,
    isActive: stream !== null,
  };
};

export const useCanvasCapture = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const context = canvasRef.current.getContext('2d');
    if (!context) return null;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    context.drawImage(videoRef.current, 0, 0);
    return canvasRef.current.toDataURL('image/jpeg', 0.8);
  }, [videoRef]);

  return {
    canvasRef,
    captureFrame,
  };
};

export const useMediaRecorder = (
  stream: MediaStream | null,
  options?: MediaRecorderOptions
) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = useCallback(() => {
    if (!stream) {
      console.error('No stream available');
      return;
    }

    const mediaRecorder = new MediaRecorder(stream, options);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      setRecordedChunks(chunks);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  }, [stream, options]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const getRecordingBlob = useCallback((): Blob | null => {
    if (recordedChunks.length === 0) return null;
    return new Blob(recordedChunks, { type: 'video/webm' });
  }, [recordedChunks]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    getRecordingBlob,
    recordedChunks,
  };
};

export const useScreenShare = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startScreenShare = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false,
      });
      setStream(mediaStream);

      // Listen for when user stops sharing
      mediaStream.getTracks()[0].onended = () => {
        setStream(null);
      };
    } catch (err) {
      if (err instanceof DOMException && err.name !== 'NotAllowedError') {
        setError(err instanceof Error ? err.message : 'Screen share failed');
      }
      console.error('Screen share error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  return {
    stream,
    error,
    isLoading,
    startScreenShare,
    stopScreenShare,
  };
};
