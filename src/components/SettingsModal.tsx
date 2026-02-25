import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, Target, History, Music, Info, BarChart3, ShieldAlert } from 'lucide-react';
import { Logo } from './Logo';
import { UserStats } from '../types';
import { HistoryView } from './HistoryView';
import { StatsDashboard } from './StatsDashboard';
import { SoundscapeType } from '../hooks/useSoundscape';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  setDailyGoal: (mins: number) => void;
  addCustomSessionType: (type: string) => void;
  removeCustomSessionType: (type: string) => void;
  toggleStrictMode: () => void;
  soundscape: {
    type: SoundscapeType;
    setType: (t: SoundscapeType) => void;
    volume: number;
    setVolume: (v: number) => void;
  };
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  stats,
  setDailyGoal,
  addCustomSessionType,
  removeCustomSessionType,
  toggleStrictMode,
  soundscape,
}) => {
  const [activeTab, setActiveTab] = React.useState<'goals' | 'sounds' | 'history' | 'types' | 'stats'>('goals');
  const [newType, setNewType] = React.useState('');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-bottom border-white/10">
            <h2 className="text-xl font-bold uppercase tracking-widest">Settings</h2>
            <button onClick={onClose} className="p-2 rounded-full bg-white/5">
              <X size={24} />
            </button>
          </div>

          <div className="flex border-b border-white/5 px-6 overflow-x-auto no-scrollbar">
            <TabButton active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} icon={<Target size={16} />} label="Goals" />
            <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={16} />} label="Stats" />
            <TabButton active={activeTab === 'sounds'} onClick={() => setActiveTab('sounds')} icon={<Music size={16} />} label="Sounds" />
            <TabButton active={activeTab === 'types'} onClick={() => setActiveTab('types')} icon={<Logo size={16} />} label="Types" />
            <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={16} />} label="History" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {activeTab === 'goals' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Daily Focus Goal (Minutes)</label>
                  <input
                    type="range"
                    min="15"
                    max="480"
                    step="15"
                    value={stats.dailyGoalMinutes}
                    onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                    className="w-full accent-white"
                  />
                  <div className="text-center font-mono text-3xl font-bold">{stats.dailyGoalMinutes}m</div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert size={14} className={stats.strictMode ? "text-red-500" : "text-white/40"} />
                        <label className="text-sm font-bold uppercase tracking-widest">Strict Mode</label>
                      </div>
                      <p className="text-[10px] text-white/30 leading-relaxed max-w-[200px]">
                        Any movement instantly fails the session. No warning countdown.
                      </p>
                    </div>
                    <button
                      onClick={toggleStrictMode}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        stats.strictMode ? 'bg-red-500' : 'bg-white/10'
                      }`}
                    >
                      <motion.div
                        animate={{ x: stats.strictMode ? 26 : 2 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <StatsDashboard stats={stats} />
            )}

            {activeTab === 'sounds' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Soundscape</label>
                  <div className="grid grid-cols-2 gap-3">
                    <SoundscapeOption active={soundscape.type === 'none'} onClick={() => soundscape.setType('none')} label="None" />
                    <SoundscapeOption active={soundscape.type === 'rain'} onClick={() => soundscape.setType('rain')} label="Rain" />
                    <SoundscapeOption active={soundscape.type === 'forest'} onClick={() => soundscape.setType('forest')} label="Forest" />
                    <SoundscapeOption active={soundscape.type === 'white-noise'} onClick={() => soundscape.setType('white-noise')} label="White Noise" />
                  </div>
                </div>

                {soundscape.type !== 'none' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Volume</label>
                      <Volume2 size={14} className="text-white/40" />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={soundscape.volume}
                      onChange={(e) => soundscape.setVolume(parseFloat(e.target.value))}
                      className="w-full accent-white"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'types' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Session Types</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="New Type..."
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                    />
                    <button
                      onClick={() => {
                        addCustomSessionType(newType);
                        setNewType('');
                      }}
                      className="px-4 py-2 bg-white text-black rounded-xl text-xs font-bold uppercase"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {stats.customSessionTypes.map((type) => (
                      <div key={type} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-sm font-medium">{type}</span>
                        <button
                          onClick={() => removeCustomSessionType(type)}
                          className="p-1 text-white/20 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <HistoryView history={stats.history} />
            )}
          </div>

          <div className="p-8 border-t border-white/5 text-center space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Anchor',
                      text: 'Check out Anchor - The most disciplined focus timer.',
                      url: window.location.href,
                    });
                  }
                }}
                className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-white/5 text-white/60 hover:text-white transition-colors"
              >
                <span className="text-[10px] uppercase tracking-widest font-bold">Share App</span>
              </button>
              <button 
                className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-white/5 text-white/60 hover:text-white transition-colors"
              >
                <span className="text-[10px] uppercase tracking-widest font-bold">Rate App</span>
              </button>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-white/20">
                <Info size={14} />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">made by ABØ Studios</span>
              </div>
              <button className="text-[8px] text-white/10 uppercase tracking-widest hover:text-white/30 transition-colors">
                Privacy Policy
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 py-4 px-4 border-b-2 transition-all ${
      active ? 'border-white text-white' : 'border-transparent text-white/30'
    }`}
  >
    {icon}
    <span className="text-[10px] uppercase tracking-widest font-bold">{label}</span>
  </button>
);

const SoundscapeOption = ({ active, onClick, label }: any) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-2xl border transition-all text-center ${
      active ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10'
    }`}
  >
    <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
  </button>
);
