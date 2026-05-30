import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Timer, Play, CheckCircle, Video, Info, Camera, AlertCircle, Pause } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import PoseDetector, { PoseDetectionResult } from '@/src/components/PoseDetector';

const EXERCISE_VIDEOS: Record<string, string> = {
  'push-ups': 'https://www.youtube.com/embed/IODxDxX7oi4?autoplay=0&modestbranding=1&rel=0',
  'squats': 'https://www.youtube.com/embed/aclHkVaku9U?autoplay=0&modestbranding=1&rel=0',
  'jumping-jacks': 'https://www.youtube.com/embed/2W4ZNSwoW_4?autoplay=0&modestbranding=1&rel=0',
};

export default function ExerciseCoach() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [isActive, setIsActive] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [poseData, setPoseData] = useState<PoseDetectionResult | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    setIsActive(true);
  }, [id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const title = useMemo(
    () => id?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Exercise',
    [id]
  );

  const videoUrl = id ? EXERCISE_VIDEOS[id] : undefined;

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
          <div className="aspect-square bg-gradient-to-br from-cyan-500/10 via-teal-500/8 to-transparent rounded-2xl flex items-center justify-center relative overflow-hidden ring-1 ring-white/10 shadow-inner">
            <div className="absolute inset-0 opacity-70">
              <div className="absolute left-1/2 top-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
              <div className="absolute left-1/2 top-1/2 w-44 h-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-300/15 animate-pulse" />
            </div>
            <div className="relative z-10 text-center px-5">
              <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full border-4 border-teal-300/70" />
              </div>
              <p className="text-sm font-semibold text-white/80">Mirror this movement before and during your set</p>
              <p className="text-[11px] text-white/45 mt-2">The coach timer starts automatically when you open this screen.</p>
            </div>
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
         <div className="aspect-video rounded-2xl overflow-hidden bg-black/40 relative ring-1 ring-white/10">
            {videoUrl ? (
              <iframe
                src={videoUrl}
                title={`${title} tutorial`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Play size={48} className="text-white/40" />
              </div>
            )}
         </div>
      </section>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
        <div className="flex gap-2">
          <button 
            onClick={() => setIsActive((value) => !value)}
            className={cn(
              'flex-1 btn-primary w-full py-4 text-base flex items-center justify-center gap-3 shadow-2xl',
              isActive ? 'bg-red-600 hover:bg-red-500' : 'bg-teal-600 hover:bg-teal-500'
            )}
          >
            {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            {isActive ? 'Pause Timer' : 'Start Timer'}
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              navigate('/exercises');
            }}
            className="px-4 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold shadow-2xl"
          >
            <CheckCircle size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
