import React from 'react';
import { motion } from 'motion/react';
import { SessionLog } from '../types';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface HistoryViewProps {
  history: SessionLog[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-white/20 uppercase tracking-widest text-xs">
        No sessions yet
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {history.map((log) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center space-x-4">
            {log.success ? (
              <CheckCircle2 size={18} className="text-emerald-500" />
            ) : (
              <XCircle size={18} className="text-red-500" />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <div className="text-xs font-bold text-white/80">
                  {log.success ? 'Anchored' : 'Broken'}
                </div>
                {log.type && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/40 uppercase tracking-widest font-bold">
                    {log.type}
                  </span>
                )}
                {log.success && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                    log.focusScore >= 90 ? 'bg-emerald-500/10 text-emerald-500' : 
                    log.focusScore >= 75 ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {log.focusScore}% Score
                  </span>
                )}
              </div>
              <div className="text-[10px] text-white/30 uppercase tracking-tighter">
                {format(parseISO(log.date), 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-white/60 font-mono text-sm">
            <Clock size={12} />
            <span>{log.duration}m</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
