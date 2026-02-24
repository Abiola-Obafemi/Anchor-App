import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface WarningOverlayProps {
  countdown: number;
  onCancel: () => void;
}

export const WarningOverlay: React.FC<WarningOverlayProps> = ({ countdown, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-red-600 flex flex-col items-center justify-center p-6 text-white"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-center space-y-8"
      >
        <AlertCircle size={80} className="mx-auto animate-pulse" />
        
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tighter uppercase">Return to Anchor</h2>
          <p className="text-white/80 text-lg">Keep your phone still and stay in the app.</p>
        </div>

        <div className="text-9xl font-mono font-bold">
          {countdown}
        </div>

        <button
          onClick={onCancel}
          className="px-8 py-4 border-2 border-white/30 rounded-full text-sm font-medium uppercase tracking-widest hover:bg-white/10 transition-colors"
        >
          Give Up
        </button>
      </motion.div>
    </motion.div>
  );
};
