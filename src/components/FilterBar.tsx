import React from 'react';
import { Filter, RotateCcw, MapPin, GraduationCap, CheckCircle2 } from 'lucide-react';

interface FilterBarProps {
  level: string;
  onLevelChange: (lvl: string) => void;
  zone: string;
  onZoneChange: (z: string) => void;
  nature: string;
  onNatureChange: (n: string) => void;
  isAutonomous: boolean;
  onAutonomousChange: (v: boolean) => void;
  isSap: boolean;
  onSapChange: (v: boolean) => void;
  isIp: boolean;
  onIpChange: (v: boolean) => void;
  isGifted: boolean;
  onGiftedChange: (v: boolean) => void;
  totalResults: number;
  onReset: () => void;
}

const LEVELS = [
  { id: 'ALL', label: 'All Levels' },
  { id: 'PRIMARY', label: 'Primary (P1-P6) 🎒' },
  { id: 'SECONDARY', label: 'Secondary (S1-S5) 🏫' },
  { id: 'JC', label: 'Junior College (JC) 🎓' },
];

const ZONES = [
  { id: 'ALL', label: 'All Zones' },
  { id: 'NORTH', label: 'North' },
  { id: 'SOUTH', label: 'South' },
  { id: 'EAST', label: 'East' },
  { id: 'WEST', label: 'West' },
];

const NATURES = [
  { id: 'ALL', label: 'All Types' },
  { id: 'CO-ED', label: 'Co-ed 👫' },
  { id: 'GIRLS', label: 'Girls 👧' },
  { id: 'BOYS', label: 'Boys 👦' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  level,
  onLevelChange,
  zone,
  onZoneChange,
  nature,
  onNatureChange,
  isAutonomous,
  onAutonomousChange,
  isSap,
  onSapChange,
  isIp,
  onIpChange,
  isGifted,
  onGiftedChange,
  totalResults,
  onReset,
}) => {
  const hasActiveFilters =
    level !== 'ALL' ||
    zone !== 'ALL' ||
    nature !== 'ALL' ||
    isAutonomous ||
    isSap ||
    isIp ||
    isGifted;

  return (
    <div className="bg-white/80 backdrop-blur-xs border border-indigo-100 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 max-w-7xl mx-auto">
      
      {/* Top row: Levels Tabs & Reset */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        
        {/* Level Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          {LEVELS.map(lvl => {
            const active = level === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => onLevelChange(lvl.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-sky-700 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>

        {/* Results Counter & Reset Filter */}
        <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{totalResults} {totalResults === 1 ? 'School' : 'Schools'} Found</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Second row: Zone, School Nature, and Special MOE Badges */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Zone Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-sky-500" />
            <span className="font-semibold text-slate-500">Zone:</span>
            <select
              value={zone}
              onChange={e => onZoneChange(e.target.value)}
              aria-label="Filter by Zone"
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1 font-medium focus:ring-2 focus:ring-sky-200 focus:outline-hidden cursor-pointer"
            >
              {ZONES.map(z => (
                <option key={z.id} value={z.id}>
                  {z.label}
                </option>
              ))}
            </select>
          </div>

          {/* School Nature Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <GraduationCap className="w-3.5 h-3.5 text-pink-500" />
            <span className="font-semibold text-slate-500">Gender:</span>
            <select
              value={nature}
              onChange={e => onNatureChange(e.target.value)}
              aria-label="Filter by Gender"
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1 font-medium focus:ring-2 focus:ring-sky-200 focus:outline-hidden cursor-pointer"
            >
              {NATURES.map(n => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Special Badges Toggle Checkboxes */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
            Badges:
          </span>

          <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
            isIp ? 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}>
            <input
              type="checkbox"
              checked={isIp}
              onChange={e => onIpChange(e.target.checked)}
              className="sr-only"
            />
            <CheckCircle2 className={`w-3.5 h-3.5 ${isIp ? 'text-indigo-600' : 'text-slate-300'}`} />
            <span>IP (Integrated)</span>
          </label>

          <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
            isSap ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}>
            <input
              type="checkbox"
              checked={isSap}
              onChange={e => onSapChange(e.target.checked)}
              className="sr-only"
            />
            <CheckCircle2 className={`w-3.5 h-3.5 ${isSap ? 'text-amber-600' : 'text-slate-300'}`} />
            <span>SAP School</span>
          </label>

          <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
            isAutonomous ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}>
            <input
              type="checkbox"
              checked={isAutonomous}
              onChange={e => onAutonomousChange(e.target.checked)}
              className="sr-only"
            />
            <CheckCircle2 className={`w-3.5 h-3.5 ${isAutonomous ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span>Autonomous</span>
          </label>

          <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
            isGifted ? 'bg-pink-100 text-pink-800 border-pink-300 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}>
            <input
              type="checkbox"
              checked={isGifted}
              onChange={e => onGiftedChange(e.target.checked)}
              className="sr-only"
            />
            <CheckCircle2 className={`w-3.5 h-3.5 ${isGifted ? 'text-pink-600' : 'text-slate-300'}`} />
            <span>Gifted (GEP)</span>
          </label>
        </div>

      </div>

    </div>
  );
};
