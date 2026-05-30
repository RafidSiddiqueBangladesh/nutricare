import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Play, Pause, Save, RotateCcw, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import PoseDetector, { PoseDetectionResult } from '@/src/components/PoseDetector';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { appendHealthResult } from '@/src/lib/healthResults';

interface ExerciseSession {
  id: string;
  exerciseType: string;
  reps: number;
  formScore: number;
  duration: number;
  timestamp: string;
  saved: boolean;
}

const EXERCISE_TYPES = [
  { id: 'push-ups', label: 'Push-ups', icon: '💪', color: 'from-blue-600 to-blue-400' },
  { id: 'squats', label: 'Squats', icon: '🦵', color: 'from-teal-600 to-teal-400' },
  { id: 'jumping-jacks', label: 'Jumping Jacks', icon: '🤸', color: 'from-purple-600 to-purple-400' },
  { id: 'pull-ups', label: 'Pull-ups', icon: '⬆️', color: 'from-red-600 to-red-400' },
  { id: 'sit-ups', label: 'Sit-ups', icon: '🏃', color: 'from-orange-600 to-orange-400' },
  { id: 'plank', label: 'Plank', icon: '📏', color: 'from-green-600 to-green-400' },
];

export default function LiveExerciseEditor() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useLocalStorage<ExerciseSession[]>('exercise-sessions', []);
  const [selectedExercise, setSelectedExercise] = useState<string>('push-ups');
  const [isTracking, setIsTracking] = useState(false);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentFormScore, setCurrentFormScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [poseData, setPoseData] = useState<PoseDetectionResult | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>('');

  // Timer effect
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking]);

  // Update reps and form score from pose detection
  const handlePoseDetection = useCallback((result: PoseDetectionResult) => {
    if (result.detected) {
      setCurrentReps(result.repCount || 0);
      setCurrentFormScore(result.formScore || 0);
    }
    setPoseData(result);
  }, []);

  const startTracking = () => {
    sessionIdRef.current = `session-${Date.now()}`;
    setCurrentReps(0);
    setCurrentFormScore(0);
    setElapsedTime(0);
    setIsTracking(true);
  };

  const pauseTracking = () => {
    setIsTracking(false);
  };

  const resetSession = () => {
    setIsTracking(false);
    setCurrentReps(0);
    setCurrentFormScore(0);
    setElapsedTime(0);
    setPoseData(null);
  };

  const saveSession = async () => {
    if (currentReps === 0 && elapsedTime === 0) {
      alert('No data to save. Start tracking first!');
      return;
    }

    const newSession: ExerciseSession = {
      id: sessionIdRef.current || `session-${Date.now()}`,
      exerciseType: selectedExercise,
      reps: currentReps,
      formScore: currentFormScore,
      duration: elapsedTime,
      timestamp: new Date().toISOString(),
      saved: true,
    };

    try {
      // Save to local storage
      setSessions([...sessions, newSession]);
      appendHealthResult({
        id: crypto.randomUUID(),
        type: 'pose',
        timestamp: newSession.timestamp,
        data: {
          confidence: poseData?.confidence || 0,
          repCount: currentReps,
          formScore: currentFormScore,
          exerciseType: selectedExercise,
          duration: elapsedTime,
        },
      });

      // Try to save to backend
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await fetch('https://nutricarebackend-2zfq.onrender.com/api/exercise/pose-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            repCount: currentReps,
            formScore: currentFormScore,
            confidence: poseData?.confidence || 0,
            timestamp: newSession.timestamp,
            exerciseType: selectedExercise,
            keypointCount: poseData?.keypoints.length || 0,
            duration: elapsedTime,
          }),
        });

        if (response.ok) {
          console.log('✅ Exercise session saved to database');
        }
      }

      alert('✅ Session saved successfully!');
      resetSession();
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Session saved locally. Backend connection issue.');
    }
  };

  const exercise = EXERCISE_TYPES.find(e => e.id === selectedExercise);
  const goalReps = 20; // Target for progress bar
  const progressPercent = Math.min((currentReps / goalReps) * 100, 100);

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <Zap size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Live Exercise Editor</span>
          </div>
        </div>
      </div>

      {/* Exercise Selection */}
      <section className="glass-card !p-4">
        <h3 className="text-sm font-bold text-white/60 uppercase mb-3">Select Exercise</h3>
        <div className="grid grid-cols-2 gap-2">
          {EXERCISE_TYPES.map(ex => (
            <motion.button
              key={ex.id}
              onClick={() => {
                setSelectedExercise(ex.id);
                resetSession();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'py-3 rounded-xl font-bold text-sm transition-all flex flex-col items-center gap-1',
                selectedExercise === ex.id
                  ? `bg-gradient-to-br ${ex.color} text-white shadow-lg shadow-teal-500/30`
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              <span className="text-2xl">{ex.icon}</span>
              <span className="text-xs">{ex.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Live Camera Feed */}
      <section className="glass-card !p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Live Detection</h3>
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1',
            isTracking ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
          )}>
            {isTracking ? (
              <>
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Recording
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                Ready
              </>
            )}
          </div>
        </div>

        {/* Camera View */}
        <div className="aspect-video bg-black rounded-2xl overflow-hidden ring-1 ring-white/10">
          {isTracking ? (
            <PoseDetector
              isRunning={isTracking}
              onDetection={handlePoseDetection}
              showCanvas={true}
              exerciseType={selectedExercise}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#002b2b]">
              <div className="text-center">
                <Play size={48} className="text-white/40 mx-auto mb-2" />
                <p className="text-white/40 text-sm">Click START to begin live tracking</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats Panel */}
      <section className="glass-card !p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Reps Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-white/60 text-xs font-bold uppercase mb-1">Reps</p>
            <p className="text-4xl font-bold text-teal-400">{currentReps}</p>
          </motion.div>

          {/* Form Score */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-white/60 text-xs font-bold uppercase mb-1">Form</p>
            <p className="text-4xl font-bold text-blue-400">{currentFormScore}%</p>
          </motion.div>

          {/* Time */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-white/60 text-xs font-bold uppercase mb-1">Time</p>
            <p className="text-4xl font-bold text-purple-400">
              {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
            </p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <p className="text-xs font-bold text-white/60">Goal Progress</p>
            <p className="text-xs font-bold text-teal-400">{currentReps}/{goalReps}</p>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
            />
          </div>
        </div>

        {/* Pose Detection Status */}
        {poseData && (
          <div className={cn(
            'p-2 rounded-lg text-xs flex items-center gap-2',
            poseData.detected
              ? 'bg-teal-500/20 text-teal-300'
              : 'bg-yellow-500/20 text-yellow-300'
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full',
              poseData.detected ? 'bg-teal-400 animate-pulse' : 'bg-yellow-400'
            )} />
            {poseData.detected ? 'Pose detected - Keep going!' : 'Adjust your position for better detection'}
          </div>
        )}
      </section>

      {/* Control Buttons */}
      <div className="fixed bottom-4 left-4 right-4 flex gap-2 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isTracking ? pauseTracking : startTracking}
          className={cn(
            'flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg',
            isTracking
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/30'
              : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-500/30'
          )}
        >
          {isTracking ? (
            <>
              <Pause size={20} fill="currentColor" />
              Pause
            </>
          ) : (
            <>
              <Play size={20} fill="currentColor" />
              Start
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetSession}
          className="py-4 px-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-all"
          title="Reset"
        >
          <RotateCcw size={20} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveSession}
          className="py-4 px-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-green-500/30"
          title="Save"
        >
          <Save size={20} />
        </motion.button>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <section className="glass-card !p-4 mt-16">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-teal-400" />
            <h3 className="text-lg font-bold">Recent Sessions</h3>
          </div>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {sessions.slice(-5).reverse().map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 p-3 rounded-lg flex justify-between items-center text-sm"
              >
                <div>
                  <p className="font-bold capitalize">{session.exerciseType}</p>
                  <p className="text-xs text-white/60">{new Date(session.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-400">{session.reps} reps</p>
                  <p className="text-xs text-white/60">Form: {session.formScore}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
