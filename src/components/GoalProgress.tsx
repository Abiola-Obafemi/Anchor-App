import React from 'react';
import { motion } from 'motion/react';
import { UserStats } from '../types';
import { isToday, parseISO } from 'date-fns';

interface GoalProgressProps {
  stats: UserStats;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ stats }) => {
  const todayMinutes = stats.history
    .filter(log => log.success && isToday(parseISO(log.date)))
    .reduce((acc, log) => acc + log.duration, 0);

  const progress = Math.min(todayMinutes / stats.dailyGoalMinutes, 1);

  return (
    <div className="w-full max-w-md mx-auto px-4 space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Daily Goal</span>
        <span className="text-xs font-mono text-white/60">
          {todayMinutes} / {stats.dailyGoalMinutes}m
        </span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"
        />
      </div>
    </div>
  );
};
