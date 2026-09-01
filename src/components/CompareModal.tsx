import React from 'react';
import { X, Scale, Train, MapPin, Award, Trash2 } from 'lucide-react';
import { School } from '../types';
import { generateWhatsAppMessage, openWhatsAppShare } from '../utils/whatsapp';

interface CompareModalProps {
  schools: School[];
  onClose: () => void;
  onRemove: (school: School) => void;
  onClear: () => void;
  onSelectSchool: (school: School) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  schools,
  onClose,
  onRemove,
  onClear,
  onSelectSchool,
}) => {
  if (schools.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div
        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-amber-500 via-pink-500 to-indigo-600 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-extrabold">School & CCA Comparison</h2>
              <p className="text-xs text-amber-100">Comparing {schools.length} Singapore schools side by side</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-semibold cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Comparison Grid */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(schools.length, 3)} gap-4`}>
            {schools.map(s => {
              const sports = s.ccas.filter(c => c.ccaCategory.toUpperCase().includes('SPORT'));
              const arts = s.ccas.filter(c => c.ccaCategory.toUpperCase().includes('PERFORMING') || c.ccaCategory.toUpperCase().includes('ART'));
              const uniform = s.ccas.filter(c => c.ccaCategory.toUpperCase().includes('UNIFORM'));
              const clubs = s.ccas.filter(c => c.ccaCategory.toUpperCase().includes('CLUB'));

              return (
                <div key={s.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">
                        {s.mainLevel}
                      </span>
                      <button
                        onClick={() => onRemove(s)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3
                      onClick={() => onSelectSchool(s)}
                      className="font-extrabold text-base text-slate-800 hover:text-sky-600 cursor-pointer mb-2 line-clamp-2"
                    >
                      {s.name}
                    </h3>

                    {/* Location & MRT */}
                    <div className="space-y-1 text-xs text-slate-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>Zone: {s.zone} • {s.dgp}</span>
                      </div>
                      {s.mrt && (
                        <div className="flex items-center gap-1 font-medium text-slate-700">
                          <Train className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{s.mrt}</span>
                        </div>
                      )}
                    </div>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {s.isIp && <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">IP</span>}
                      {s.isSap && <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">SAP</span>}
                      {s.isAutonomous && <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Autonomous</span>}
                      {s.isGifted && <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-pink-100 text-pink-800">GEP</span>}
                    </div>

                    {/* CCAs Breakdown */}
                    <div className="space-y-2 text-xs border-t border-slate-200 pt-2 mb-3">
                      <div className="font-bold text-slate-700 flex justify-between">
                        <span>Total CCAs:</span>
                        <span className="text-sky-600 font-extrabold">{s.ccas.length}</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <span className="font-semibold text-emerald-700">⚽ Sports ({sports.length}): </span>
                        {sports.slice(0, 3).map(c => c.ccaGrouping).join(', ')}{sports.length > 3 ? '...' : ''}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <span className="font-semibold text-pink-700">🎭 Arts ({arts.length}): </span>
                        {arts.slice(0, 3).map(c => c.ccaGrouping).join(', ')}{arts.length > 3 ? '...' : ''}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <span className="font-semibold text-amber-700">🎖️ Uniformed ({uniform.length}): </span>
                        {uniform.slice(0, 3).map(c => c.ccaGrouping).join(', ')}{uniform.length > 3 ? '...' : ''}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <span className="font-semibold text-sky-700">🔬 Clubs ({clubs.length}): </span>
                        {clubs.slice(0, 3).map(c => c.ccaGrouping).join(', ')}{clubs.length > 3 ? '...' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openWhatsAppShare(generateWhatsAppMessage(s))}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#25D366] text-white flex items-center gap-1 cursor-pointer w-full justify-center"
                    >
                      <span>📱</span>
                      <span>Share WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
