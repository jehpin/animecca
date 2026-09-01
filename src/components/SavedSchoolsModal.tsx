import React from 'react';
import { X, Heart, Trash2, ExternalLink, MapPin, Scale } from 'lucide-react';
import { School } from '../types';
import { generateWhatsAppMessage, openWhatsAppShare } from '../utils/whatsapp';

interface SavedSchoolsModalProps {
  savedSchools: School[];
  onClose: () => void;
  onRemove: (school: School) => void;
  onClear: () => void;
  onSelectSchool: (school: School) => void;
  onToggleCompare: (school: School) => void;
  compareList: School[];
}

export const SavedSchoolsModal: React.FC<SavedSchoolsModalProps> = ({
  savedSchools,
  onClose,
  onRemove,
  onClear,
  onSelectSchool,
  onToggleCompare,
  compareList,
}) => {
  if (savedSchools.length === 0) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div
          className="bg-white w-full max-w-md rounded-3xl p-6 text-center shadow-2xl border border-pink-200"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-500 mx-auto flex items-center justify-center mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Saved Schools Yet</h3>
          <p className="text-xs text-slate-600 mb-5">
            Click the heart icon on any school card to save it for quick reference and easy WhatsApp sharing!
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-pink-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-pink-500 via-rose-500 to-indigo-500 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 fill-white" />
            <div>
              <h2 className="text-xl font-extrabold">My Saved Schools ({savedSchools.length})</h2>
              <p className="text-xs text-pink-100">Quick access to your favorite schools and CCAs</p>
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

        {/* List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {savedSchools.map(s => {
            const isCompared = compareList.some(c => c.name === s.name);

            return (
              <div
                key={s.name}
                className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 hover:border-pink-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-pink-800 border border-pink-200">
                      {s.mainLevel}
                    </span>
                    <span className="text-xs text-slate-500">Zone: {s.zone}</span>
                  </div>
                  <h4
                    onClick={() => onSelectSchool(s)}
                    className="font-bold text-slate-800 hover:text-pink-600 cursor-pointer text-sm"
                  >
                    {s.name}
                  </h4>
                  <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-pink-500" />
                    <span>{s.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleCompare(s)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      isCompared
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Compare"
                  >
                    <Scale className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openWhatsAppShare(generateWhatsAppMessage(s))}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#25D366] text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>📱</span>
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onRemove(s)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
