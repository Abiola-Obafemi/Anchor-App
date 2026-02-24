export interface SessionLog {
  id: string;
  date: string;
  duration: number;
  success: boolean;
  type: string;
  focusScore: number;
  warningsCount: number;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  lastFocusDate: string | null;
  dailyGoalMinutes: number;
  history: SessionLog[];
  customSessionTypes: string[];
  strictMode: boolean;
}

export type SessionStatus = 'idle' | 'focusing' | 'warning' | 'failed' | 'success';

export interface TimerState {
  timeLeft: number;
  duration: number;
  status: SessionStatus;
}
