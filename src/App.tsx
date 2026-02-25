/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Anchor, Play, X, Settings2, CheckCircle2, AlertTriangle, Music, Volume2, VolumeX } from 'lucide-react';
import { useStats, getRank } from './hooks/useStats';
import { useAnchorDetection } from './hooks/useAnchorDetection';
import { useSoundscape } from './hooks/useSoundscape';
import { soundService } from './services/soundService';
import { StatsHeader } from './components/StatsHeader';
import { WarningOverlay } from './components/WarningOverlay';
import { GoalProgress } from './components/GoalProgress';
import { SettingsModal } from './components/SettingsModal';
import { SessionStatus } from './types';
import { cn } from './lib/utils';

const DEFAULT_DURATION = 25 * 60; // 25 minutes
const WARNING_DURATION = 5;

export default function App() {
  const { stats, recordSession, setDailyGoal, addCustomSessionType, removeCustomSessionType, toggleStrictMode } = useStats();
  const soundscape = useSoundscape();
  
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [sessionType, setSessionType] = useState('Deep Work');
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [warningTime, setWarningTime] = useState(WARNING_DURATION);
  const [showSettings, setShowSettings] = useState(false);
  const [showMainSettings, setShowMainSettings] = useState(false);
  const [isSelectingType, setIsSelectingType] = useState(false);
  const [warningsCount, setWarningsCount] = useState(0);
  const [lastRank, setLastRank] = useState(getRank(stats.currentStreak).name);
  const [showRankUp, setShowRankUp] = useState(false);

  const currentRank = getRank(stats.currentStreak);

  useEffect(() => {
    if (currentRank.name !== lastRank) {
      setShowRankUp(true);
      setLastRank(currentRank.name);
      const timer = setTimeout(() => setShowRankUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentRank.name, lastRank]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopAllTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (warningTimerRef.current) clearInterval(warningTimerRef.current);
  }, []);

  const handleSuccess = useCallback(() => {
    stopAllTimers();
    setStatus('success');
    soundService.playSuccess();
    soundscape.togglePlay(false);
    recordSession(Math.floor(duration / 60), true, sessionType, warningsCount);
  }, [duration, recordSession, stopAllTimers, soundscape, sessionType, warningsCount]);

  const handleFailure = useCallback(() => {
    stopAllTimers();
    setStatus('failed');
    soundService.playFailure();
    soundscape.togglePlay(false);
    recordSession(Math.floor(duration / 60), false, sessionType, warningsCount);
  }, [duration, recordSession, stopAllTimers, soundscape, sessionType, warningsCount]);

  const startWarning = useCallback(() => {
    if (status !== 'focusing') return;
    
    if (stats.strictMode) {
      handleFailure();
      return;
    }

    setStatus('warning');
    setWarningsCount(prev => prev + 1);
    soundService.playWarning();
    setWarningTime(WARNING_DURATION);
  }, [status, stats.strictMode, handleFailure]);

  const cancelWarning = useCallback(() => {
    if (status !== 'warning') return;
    setStatus('focusing');
    setWarningTime(WARNING_DURATION);
  }, [status]);

  // Anchor Detection Hook
  useAnchorDetection(
    status === 'focusing' || status === 'warning',
    startWarning,
    cancelWarning
  );

  // Main Timer Logic
  useEffect(() => {
    if (status === 'focusing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, handleSuccess]);

  // Warning Timer Logic
  useEffect(() => {
    if (status === 'warning') {
      warningTimerRef.current = setInterval(() => {
        setWarningTime((prev) => {
          if (prev <= 1) {
            handleFailure();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (warningTimerRef.current) clearInterval(warningTimerRef.current);
    }

    return () => {
      if (warningTimerRef.current) clearInterval(warningTimerRef.current);
    };
  }, [status, handleFailure]);

  const startSession = () => {
    setTimeLeft(duration);
    setStatus('focusing');
    setWarningsCount(0);
    setShowSettings(false);
    setIsSelectingType(false);
    soundService.playStart();
    if (soundscape.type !== 'none') {
      soundscape.togglePlay(true);
    }
  };

  const cancelSession = () => {
    stopAllTimers();
    setStatus('idle');
    setTimeLeft(duration);
    soundscape.togglePlay(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    const newDuration = Math.min(Math.max(val, 1), 120) * 60;
    setDuration(newDuration);
    setTimeLeft(newDuration);
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-12 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Anchor className="text-white" size={20} />
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase">Anchor</h1>
          </div>
          <button 
            onClick={() => setShowMainSettings(true)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Settings2 size={20} className="text-white/60" />
          </button>
        </div>
        
        <StatsHeader stats={stats} />
        <div className="flex flex-col items-center -mt-2">
          <span className={cn("text-[10px] font-bold uppercase tracking-[0.3em]", currentRank.color)}>
            {currentRank.name}
          </span>
        </div>
        <GoalProgress stats={stats} />
      </div>

      {/* Rank Up Notification */}
      <AnimatePresence>
        {showRankUp && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-32 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3"
          >
            <Anchor size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Rank Up: {currentRank.name}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              {/* Common Clock Display for all Idle states */}
              <div className="text-center space-y-4 mb-12">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-8xl font-mono font-light tracking-tighter timer-glow hover:opacity-80 transition-opacity"
                >
                  {formatTime(duration)}
                </button>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center space-y-2"
                  >
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={duration / 60}
                      onChange={handleDurationChange}
                      className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center font-mono text-xl focus:outline-none focus:border-white/30"
                    />
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Minutes</p>
                  </motion.div>
                )}
                {!showSettings && (
                  <p className="text-white/40 text-sm uppercase tracking-widest font-medium">
                    {isSelectingType ? 'Choose Focus Type' : 'Ready to focus?'}
                  </p>
                )}
              </div>

              {!isSelectingType ? (
                <motion.div
                  key="idle-main"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center space-y-6"
                >
                  <button
                    onClick={() => setIsSelectingType(true)}
                    className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-white text-black hover:scale-105 transition-transform"
                  >
                    <Play size={32} fill="currentColor" />
                    <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
                  </button>
                  
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center space-x-2 text-white/40 hover:text-white transition-colors"
                  >
                    <Music size={18} />
                    <span className="text-xs uppercase tracking-widest font-bold">Adjust Time</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="selecting-type"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-md space-y-6"
                >
                  <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto no-scrollbar p-1">
                    {stats.customSessionTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSessionType(type);
                          startSession();
                        }}
                        className={cn(
                          "p-4 rounded-2xl border transition-all text-left flex items-center justify-between group",
                          sessionType === type 
                            ? "bg-white text-black border-white" 
                            : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"
                        )}
                      >
                        <span className="text-sm font-bold uppercase tracking-widest">{type}</span>
                        <Play size={16} className={cn(sessionType === type ? "text-black" : "text-white/20 group-hover:text-white/60")} />
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsSelectingType(false)}
                    className="w-full py-2 text-white/40 text-xs uppercase tracking-widest font-bold hover:text-white transition-colors"
                  >
                    Back
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {status === 'focusing' && (
            <motion.div
              key="focusing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8"
            >
              <div className="text-9xl font-mono font-light tracking-tighter timer-glow">
                {formatTime(timeLeft)}
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 uppercase tracking-widest font-bold">
                      {sessionType}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm uppercase tracking-widest font-medium animate-pulse">
                    Stay Anchored
                  </p>
                  <p className="text-white/20 text-[10px] uppercase tracking-widest">
                    Don't move or leave the app
                  </p>
                </div>

                {soundscape.type !== 'none' && (
                  <div className="flex items-center justify-center space-x-4 pt-4">
                    <button 
                      onClick={() => soundscape.togglePlay()}
                      className="p-3 rounded-full bg-white/5 text-white/40 hover:text-white"
                    >
                      {soundscape.isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                      {soundscape.type}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={cancelSession}
                className="mt-12 p-4 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <CheckCircle2 size={80} className="mx-auto text-emerald-500" />
              <div className="space-y-2">
                <h2 className="text-4xl font-bold tracking-tighter uppercase">Session Complete</h2>
                <p className="text-white/60">You stayed disciplined.</p>
                
                <div className="pt-4 flex flex-col items-center space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Focus Score</div>
                  <div className={cn(
                    "text-3xl font-mono font-bold",
                    warningsCount === 0 ? "text-emerald-500" : 
                    warningsCount === 1 ? "text-blue-500" :
                    warningsCount === 2 ? "text-amber-500" : "text-red-500"
                  )}>
                    {warningsCount === 0 ? '100' : 
                     warningsCount === 1 ? '90' :
                     warningsCount === 2 ? '75' : '60'}%
                  </div>
                  <div className="text-[10px] text-white/20 uppercase">
                    {warningsCount} {warningsCount === 1 ? 'warning' : 'warnings'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="px-12 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-sm"
              >
                Done
              </button>
            </motion.div>
          )}

          {status === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <AlertTriangle size={80} className="mx-auto text-red-500" />
              <div className="space-y-2">
                <h2 className="text-4xl font-bold tracking-tighter uppercase">Anchor Broken</h2>
                <p className="text-white/60">Streak has been reset.</p>
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="px-12 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-sm"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Warning Overlay */}
      <AnimatePresence>
        {status === 'warning' && (
          <WarningOverlay
            countdown={warningTime}
            onCancel={handleFailure}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showMainSettings}
        onClose={() => setShowMainSettings(false)}
        stats={stats}
        setDailyGoal={setDailyGoal}
        addCustomSessionType={addCustomSessionType}
        removeCustomSessionType={removeCustomSessionType}
        toggleStrictMode={toggleStrictMode}
        soundscape={soundscape}
      />

      {/* Footer Info */}
      <div className="flex flex-col items-center space-y-4 w-full">
        <div className="flex flex-col items-center space-y-2">
          <div className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-medium">
            Discipline is Freedom
          </div>
          <div className="text-[8px] text-white/10 uppercase tracking-[0.2em] font-bold">
            made by ABØ Studios
          </div>
        </div>

        {/* AdMob Banner Placeholder */}
        <div className="w-full h-[50px] bg-white/5 border-t border-white/5 flex items-center justify-center">
          <span className="text-[8px] text-white/10 uppercase tracking-widest font-bold">Advertisement</span>
        </div>
      </div>
    </div>
  );
}
