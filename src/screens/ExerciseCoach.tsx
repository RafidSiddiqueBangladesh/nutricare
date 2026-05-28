import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Timer, Play, CheckCircle, Video, Info, Camera, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import PoseDetector, { PoseDetectionResult } from '@/src/components/PoseDetector';

export default function ExerciseCoach() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [isActive, setIsActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [poseData, setPoseData] = useState<PoseDetectionResult | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const title = id?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Exercise';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
           <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <span className="text-xs font-bold uppercase tracking-wider">{title} Coach</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      <section className="glass-card !p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">3D {title} Guide</h3>
          <button
            onClick={() => setShowCamera(!showCamera)}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-2',
              showCamera
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
            )}
          >
            <Camera size={14} />
            {showCamera ? 'Hide' : 'Show'} Camera
          </button>
        </div>

        {showCamera ? (
          <div className="aspect-square bg-black rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-inner">
            <PoseDetector
              isRunning={showCamera}
              onDetection={setPoseData}
              showCanvas={true}
              exerciseType={id || 'general'}
            />
          </div>
        ) : (
          <div className="aspect-square bg-[#002b2b] rounded-2xl flex items-center justify-center relative overflow-hidden ring-1 ring-white/10 shadow-inner">
            {/* Mock 3D Model Placeholder */}
            <div className="absolute inset-x-8 h-px bg-white/20 bottom-1/4" />
            <div className="w-6 h-6 rounded-full border-4 border-white/40 mb-12" />
            <div className="w-px h-24 bg-white/40 -rotate-45 origin-top translate-x-4" />
            <div className="w-px h-24 bg-white/40 rotate-45 origin-top -translate-x-4" />
            <p className="absolute bottom-4 left-4 right-4 text-[10px] text-white/40 italic">
              Mirror this movement before and during your set.
            </p>
          </div>
        )}

        {poseData && poseData.detected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-teal-500/20 border border-teal-500/30 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-teal-400" />
              <span className="text-xs font-bold text-teal-300">Pose Detected</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-white/60">Form Score</p>
                <p className="font-bold text-teal-300">{poseData.formScore}%</p>
              </div>
              <div>
                <p className="text-white/60">Reps Completed</p>
                <p className="font-bold text-teal-300">{poseData.repCount || 0}</p>
              </div>
            </div>
          </motion.div>
        )}

        {poseData && !poseData.detected && showCamera && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2"
          >
            <AlertCircle size={16} className="text-yellow-400" />
            <span className="text-xs font-bold text-yellow-300">Pose not detected - adjust camera</span>
          </motion.div>
        )}
      </section>

      <section className="glass-card !p-4">
         <h3 className="text-lg font-bold mb-4">YouTube Tutorial</h3>
         <div className="aspect-video rounded-2xl overflow-hidden bg-black/40 relative">
            {/* Mock Video Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Play size={48} className="text-white/40" />
            </div>
         </div>
      </section>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
        <button 
          onClick={() => {
            setIsActive(true);
            navigate('/exercises');
          }}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3 shadow-2xl"
        >
          <Play size={20} fill="currentColor" />
          Start Timer and Return to Exercise List
        </button>
      </div>
    </div>
  );
}
