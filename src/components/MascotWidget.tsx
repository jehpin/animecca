import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, X, RefreshCw } from 'lucide-react';
import { Mascot, MASCOTS } from '../data/mascots';

interface MascotWidgetProps {
  currentMascot: Mascot;
  onSwitchMascot: (m: Mascot) => void;
  statusMessage?: string;
  totalResults: number;
}

export const MascotWidget: React.FC<MascotWidgetProps> = ({
  currentMascot,
  onSwitchMascot,
  statusMessage,
  totalResults,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [dialogue, setDialogue] = useState(currentMascot.dialogues.welcome);

  useEffect(() => {
    if (statusMessage) {
      setDialogue(statusMessage);
    } else if (totalResults === 0) {
      setDialogue(currentMascot.dialogues.noResults);
    } else if (totalResults > 0) {
      setDialogue(currentMascot.dialogues.resultsFound);
    }
  }, [statusMessage, totalResults, currentMascot]);

  const handleNextMascot = () => {
    const list = Object.values(MASCOTS);
    const currentIndex = list.findIndex(m => m.id === currentMascot.id);
    const nextMascot = list[(currentIndex + 1) % list.length];
    onSwitchMascot(nextMascot);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-2.5 rounded-full bg-white shadow-xl border-2 border-sky-400 hover:scale-110 transition-all cursor-pointer flex items-center gap-1.5"
        title="Open Mascot Companion"
      >
        <img
          src={currentMascot.avatar}
          alt={currentMascot.name}
          className="w-8 h-8 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
        <span className="text-xs font-bold text-sky-700 hidden sm:inline pr-1">
          {currentMascot.name}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-xs sm:max-w-sm flex items-end gap-2 pointer-events-auto animate-in slide-in-from-bottom-5 duration-300">
      
      {/* Speech Bubble */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border-2 border-sky-200 text-xs text-slate-700">
        
        {/* Tail pointing to character */}
        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r-2 border-b-2 border-sky-200 transform rotate-45" />

        <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-slate-100">
          <span className="font-extrabold text-sky-700 flex items-center gap-1">
            <span>🌸</span>
            <span>{currentMascot.name}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNextMascot}
              className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Switch Mascot Character"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Minimize"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        <p className="font-medium leading-relaxed text-slate-800">
          {dialogue}
        </p>
      </div>

      {/* Mascot Avatar Icon */}
      <button
        onClick={handleNextMascot}
        className="shrink-0 w-12 h-12 rounded-2xl overflow-hidden border-2 border-sky-400 shadow-lg hover:scale-105 transition-transform cursor-pointer bg-white"
        title={`Current Mascot: ${currentMascot.name} (Click to switch)`}
      >
        <img
          src={currentMascot.avatar}
          alt={currentMascot.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </button>

    </div>
  );
};
