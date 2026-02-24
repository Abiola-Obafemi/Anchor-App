import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Cell,
  Tooltip
} from 'recharts';
import { UserStats } from '../types';
import { subDays, format, isSameDay, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface StatsDashboardProps {
  stats: UserStats;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  // 1. Prepare Chart Data (Last 7 Days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayMinutes = stats.history
      .filter(log => log.success && isSameDay(parseISO(log.date), date))
      .reduce((acc, log) => acc + log.duration, 0);
    
    return {
      name: format(date, 'EEE'),
      minutes: dayMinutes,
      fullDate: format(date, 'MMM d'),
    };
  });

  // 2. Weekly Stats
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  
  const weeklySessions = stats.history.filter(log => 
    isWithinInterval(parseISO(log.date), { start: weekStart, end: weekEnd })
  );
  
  const weeklySuccessMinutes = weeklySessions
    .filter(s => s.success)
    .reduce((acc, s) => acc + s.duration, 0);
    
  const weeklyGoalTotal = stats.dailyGoalMinutes * 7;
  const weeklyCompletion = Math.min(Math.round((weeklySuccessMinutes / weeklyGoalTotal) * 100), 100);

  return (
    <div className="space-y-8">
      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="This Week" value={`${weeklySuccessMinutes}m`} subValue={`${weeklySessions.length} sessions`} />
        <StatCard label="Completion" value={`${weeklyCompletion}%`} subValue="of weekly goal" />
        <StatCard label="Best Streak" value={`${stats.longestStreak}d`} subValue="all time" />
        <StatCard label="Lifetime" value={`${stats.totalMinutes}m`} subValue="total focus" />
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Focus Minutes (Last 7 Days)</label>
        <div className="h-48 w-full bg-white/5 rounded-2xl p-4 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-zinc-900 border border-white/10 p-2 rounded-lg shadow-xl">
                        <p className="text-[10px] text-white/40 uppercase font-bold">{payload[0].payload.fullDate}</p>
                        <p className="text-xs font-mono text-white">{payload[0].value} minutes</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.minutes > 0 ? '#ffffff' : 'rgba(255,255,255,0.1)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, subValue }: { label: string; value: string; subValue: string }) => (
  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
    <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</div>
    <div className="text-xl font-mono font-bold text-white">{value}</div>
    <div className="text-[10px] text-white/20 uppercase tracking-tighter">{subValue}</div>
  </div>
);
