import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, Flame } from 'lucide-react';
import { UserStats } from '../types';

interface StatsHeaderProps {
  stats: UserStats;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-md mx-auto px-4">
      <StatItem
        icon={<Flame className="text-orange-500" size={14} />}
        label="Streak"
        value={stats.currentStreak}
      />
      <StatItem
        icon={<Trophy className="text-yellow-500" size={14} />}
        label="Best"
        value={stats.longestStreak}
      />
      <StatItem
        icon={<Clock className="text-blue-500" size={14} />}
        label="Mins"
        value={stats.totalMinutes}
      />
    </div>
  );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10"
  >
    <div className="mb-0.5">{icon}</div>
    <span className="text-[8px] uppercase tracking-widest text-white/40 font-medium">{label}</span>
    <span className="text-base font-mono font-bold text-white">{value}</span>
  </motion.div>
);
