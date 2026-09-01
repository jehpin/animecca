import React from 'react';
import { Sparkles, Heart, Scale, Database } from 'lucide-react';
import { Mascot, MASCOTS } from '../data/mascots';

interface NavbarProps {
  currentMascot: Mascot;
  onSelectMascot: (m: Mascot) => void;
  savedSchoolsCount: number;
  onOpenSaved: () => void;
  compareCount: number;
  onOpenCompare: () => void;
  onOpenCCADirectory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMascot,
  onSelectMascot,
  savedSchoolsCount,
  onOpenSaved,
  compareCount,
  onOpenCompare,
  onOpenCCADirectory,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-indigo-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-br from-sky-400 to-indigo-500 text-white shadow-md shadow-sky-200">
            <span className="text-xl">🌸</span>
            {/* Sailor ribbon cute corner tag */}
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-yellow-300 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-800 tracking-tight flex items-center gap-1.5">
                SG School & CCA <span className="bg-linear-to-r from-sky-600 to-pink-500 bg-clip-text text-transparent">Finder</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 border border-pink-200">
                Anime Pastel Edition ✨
              </span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Database className="w-3 h-3 text-sky-500" />
              <span>MOE Collection 457 • Live API</span>
            </p>
          </div>
        </div>

        {/* Right: Actions, Mascot Switcher, Bookmarks & Compare */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Explore All CCAs Directory button */}
          <button
            onClick={onOpenCCADirectory}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>All CCAs Directory</span>
          </button>

          {/* Compare Button */}
          <button
            onClick={onOpenCompare}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              compareCount > 0
                ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
            {compareCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {compareCount}
              </span>
            )}
          </button>

          {/* Bookmarks */}
          <button
            onClick={onOpenSaved}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              savedSchoolsCount > 0
                ? 'bg-pink-100 text-pink-700 border border-pink-300 shadow-xs'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 border border-slate-200'
            }`}
            title="Saved Schools"
          >
            <Heart className={`w-3.5 h-3.5 ${savedSchoolsCount > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
            <span className="hidden sm:inline">Saved</span>
            {savedSchoolsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-pink-500 text-white rounded-full text-[10px] font-bold">
                {savedSchoolsCount}
              </span>
            )}
          </button>

          {/* Mascot Selector Dropdown / Switcher */}
          <div className="flex items-center gap-1 bg-sky-50/80 p-1 rounded-2xl border border-sky-200/70">
            {Object.values(MASCOTS).map(m => (
              <button
                key={m.id}
                onClick={() => onSelectMascot(m)}
                title={`Guide: ${m.name} (${m.role})`}
                className={`relative w-8 h-8 rounded-xl overflow-hidden border-2 transition-transform cursor-pointer ${
                  currentMascot.id === m.id
                    ? 'border-sky-500 scale-110 shadow-sm ring-2 ring-sky-300'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                }`}
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>

        </div>

      </div>
    </header>
  );
};
