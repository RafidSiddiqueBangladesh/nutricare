import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_SERVER_URL?.trim() ||
  'https://nutricarebackend-2zfq.onrender.com';

export interface RTCConfig {
  iceServers: Array<{ urls: string[] }>;
}

export interface CallState {
  isConnected: boolean;
  isLocalStreamActive: boolean;
  isRemoteStreamActive: boolean;
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  callState: 'idle' | 'calling' | 'connected' | 'ended';
}

export const useVideoCall = () => {
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isLocalStreamActive: false,
    isRemoteStreamActive: false,
    isMicEnabled: true,
    isCameraEnabled: true,
    callState: 'idle',
  });

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setCallState((prev) => ({ ...prev, isConnected: true }));
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setCallState((prev) => ({ ...prev, isConnected: false }));
    });

    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleIceCandidate);
    socketRef.current.on('call-ended', handleCallEnded);

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const createPeerConnection = useCallback(async () => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] },
      ],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', event.candidate);
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('Remote stream received', event.streams);
      remoteStreamRef.current = event.streams[0];
      setCallState((prev) => ({ ...prev, isRemoteStreamActive: true }));
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        setCallState((prev) => ({ ...prev, callState: 'ended' }));
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, []);

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      localStreamRef.current = stream;
      setCallState((prev) => ({ ...prev, isLocalStreamActive: true }));

      const peerConnection = await createPeerConnection();

      // Add audio and video tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      throw err;
    }
  }, [createPeerConnection]);

  const initiateCall = useCallback(
    async (remoteUserId: string) => {
      try {
        const stream = await startLocalStream();
        setCallState((prev) => ({ ...prev, callState: 'calling' }));

        const peerConnection = peerConnectionRef.current;
        if (!peerConnection) throw new Error('Peer connection not established');

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socketRef.current?.emit('call', {
          to: remoteUserId,
          offer,
        });
      } catch (err) {
        console.error('Error initiating call:', err);
        throw err;
      }
    },
    [startLocalStream]
  );

  const handleAnswer = useCallback(async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      const remoteDesc = new RTCSessionDescription(data.answer);
      await peerConnection.setRemoteDescription(remoteDesc);
      setCallState((prev) => ({ ...prev, callState: 'connected' }));
    } catch (err) {
      console.error('Error handling answer:', err);
    }
  }, []);

  const handleIceCandidate = useCallback(
    async (data: { candidate: RTCIceCandidateInit }) => {
      try {
        const peerConnection = peerConnectionRef.current;
        if (!peerConnection) return;

        const candidate = new RTCIceCandidate(data.candidate);
        await peerConnection.addIceCandidate(candidate);
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    },
    []
  );

  const handleCallEnded = useCallback(() => {
    endCall();
  }, []);

  const endCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    remoteStreamRef.current = null;

    setCallState({
      isConnected: false,
      isLocalStreamActive: false,
      isRemoteStreamActive: false,
      isMicEnabled: true,
      isCameraEnabled: true,
      callState: 'idle',
    });

    socketRef.current?.emit('end-call');
  }, []);

  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setCallState((prev) => ({ ...prev, isMicEnabled: !prev.isMicEnabled }));
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setCallState((prev) => ({ ...prev, isCameraEnabled: !prev.isCameraEnabled }));
    }
  }, []);

  return {
    callState,
    localStreamRef,
    remoteStreamRef,
    initiateCall,
    endCall,
    toggleMic,
    toggleCamera,
    socket: socketRef.current,
  };
};
