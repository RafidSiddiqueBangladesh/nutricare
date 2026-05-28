import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useVideoCall } from '@/src/hooks/useVideoCall';

export default function VideoCall() {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [callDuration, setCallDuration] = useState('00:00');

  const {
    callState,
    localStreamRef,
    remoteStreamRef,
    initiateCall,
    endCall,
    toggleMic,
    toggleCamera,
  } = useVideoCall();

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localStreamRef.current?.active]);

  // Set up remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [remoteStreamRef.current?.active]);

  // Update call duration
  useEffect(() => {
    if (callState.callState !== 'connected' || !callStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      setCallDuration(
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [callState.callState, callStartTime]);

  const handleStartCall = async () => {
    try {
      await initiateCall(doctorId || 'doctor-user');
      setCallStartTime(Date.now());
    } catch (err) {
      console.error('Failed to start call:', err);
    }
  };

  const handleEndCall = () => {
    endCall();
    setCallStartTime(null);
    setCallDuration('00:00');
    navigate('/health/doctors');
  };

  return (
    <div className="flex flex-col gap-6 h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-4">
        <button
          onClick={() => navigate('/health/doctors')}
          className="p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-bold">Dr. Video Consultation</h1>
          {callState.callState === 'connected' && (
            <p className="text-xs text-teal-400 font-mono">{callDuration}</p>
          )}
        </div>
        <div className="w-8 h-8" /> {/* Spacer for alignment */}
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex gap-4 px-4 min-h-0">
        {/* Remote Video */}
        <div className="flex-1 relative rounded-lg overflow-hidden bg-black ring-1 ring-white/10">
          {callState.isRemoteStreamActive ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/60 text-center">
              <p>Waiting for doctor to join...</p>
            </div>
          )}
        </div>

        {/* Local Video (PiP) */}
        <div className="w-32 relative rounded-lg overflow-hidden bg-black ring-1 ring-white/10">
          {callState.isLocalStreamActive ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/60 text-xs text-center px-2">
              <p>Camera off</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/50 backdrop-blur border-t border-white/10 px-4 py-4 flex items-center justify-center gap-4"
      >
        {callState.callState === 'idle' ? (
          <button
            onClick={handleStartCall}
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 text-white flex items-center justify-center shadow-lg hover:shadow-green-500/50 transition-all"
          >
            <Phone size={24} fill="currentColor" />
          </button>
        ) : (
          <>
            <button
              onClick={toggleMic}
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center transition-all',
                callState.isMicEnabled
                  ? 'bg-white/20 hover:bg-white/30 text-white'
                  : 'bg-red-500/30 hover:bg-red-500/40 text-red-300'
              )}
            >
              {callState.isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              onClick={toggleCamera}
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center transition-all',
                callState.isCameraEnabled
                  ? 'bg-white/20 hover:bg-white/30 text-white'
                  : 'bg-red-500/30 hover:bg-red-500/40 text-red-300'
              )}
            >
              {callState.isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 text-white flex items-center justify-center shadow-lg hover:shadow-red-500/50 transition-all"
            >
              <PhoneOff size={24} fill="currentColor" />
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
