import { useState, useEffect } from 'react';
import { UserStats, SessionLog } from '../types';
import { isToday, parseISO } from 'date-fns';

const STORAGE_KEY = 'anchor_user_stats';

const INITIAL_STATS: UserStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalMinutes: 0,
  lastFocusDate: null,
  dailyGoalMinutes: 60,
  history: [],
  customSessionTypes: ['Deep Work', 'Study', 'Meditation'],
  strictMode: false,
};

export const RANKS = [
  { min: 60, name: 'Iron Anchor', color: 'text-zinc-400' },
  { min: 30, name: 'Unshakable', color: 'text-indigo-400' },
  { min: 14, name: 'Disciplined', color: 'text-emerald-400' },
  { min: 7, name: 'Steady', color: 'text-blue-400' },
  { min: 3, name: 'Grounded', color: 'text-amber-400' },
  { min: 0, name: 'Novice', color: 'text-white/40' },
];

export function getRank(streak: number) {
  return RANKS.find(r => streak >= r.min) || RANKS[RANKS.length - 1];
}

export function useStats() {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_STATS, ...parsed };
      } catch (e) {
        return INITIAL_STATS;
      }
    }
    return INITIAL_STATS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const recordSession = (minutes: number, success: boolean, type: string, warningsCount: number = 0) => {
    setStats((prev) => {
      const today = new Date().toISOString();
      const lastDate = prev.lastFocusDate ? parseISO(prev.lastFocusDate) : null;
      
      let newStreak = prev.currentStreak;
      if (success) {
        if (!lastDate || !isToday(lastDate)) {
          newStreak += 1;
        }
      } else {
        newStreak = 0;
      }

      let focusScore = 100;
      if (success) {
        if (warningsCount === 1) focusScore = 90;
        else if (warningsCount === 2) focusScore = 75;
        else if (warningsCount >= 3) focusScore = 60;
      } else {
        focusScore = 0;
      }

      const newLog: SessionLog = {
        id: Math.random().toString(36).substr(2, 9),
        date: today,
        duration: minutes,
        success,
        type,
        focusScore,
        warningsCount,
      };

      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        totalMinutes: success ? prev.totalMinutes + minutes : prev.totalMinutes,
        lastFocusDate: success ? today : prev.lastFocusDate,
        history: [newLog, ...prev.history].slice(0, 100), // Keep last 100
      };
    });
  };

  const toggleStrictMode = () => {
    setStats(prev => ({ ...prev, strictMode: !prev.strictMode }));
  };

  const addCustomSessionType = (type: string) => {
    if (!type.trim()) return;
    setStats(prev => ({
      ...prev,
      customSessionTypes: Array.from(new Set([...prev.customSessionTypes, type.trim()]))
    }));
  };

  const removeCustomSessionType = (type: string) => {
    setStats(prev => ({
      ...prev,
      customSessionTypes: prev.customSessionTypes.filter(t => t !== type)
    }));
  };

  const setDailyGoal = (minutes: number) => {
    setStats(prev => ({ ...prev, dailyGoalMinutes: minutes }));
  };

  return { stats, recordSession, setDailyGoal, addCustomSessionType, removeCustomSessionType, toggleStrictMode };
}
