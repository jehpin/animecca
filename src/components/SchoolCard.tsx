import React, { useState } from 'react';
import {
  MapPin,
  Train,
  Share2,
  Copy,
  Check,
  Heart,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Award,
  Bus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { School, CCAItem } from '../types';
import { generateWhatsAppMessage, openWhatsAppShare } from '../utils/whatsapp';
import { Mascot } from '../data/mascots';

interface SchoolCardProps {
  school: School;
  onSelect: (school: School) => void;
  isSaved: boolean;
  onToggleSave: (school: School) => void;
  isCompared: boolean;
  onToggleCompare: (school: School) => void;
  currentMascot: Mascot;
  onShareWhatsAppModal: (school: School) => void;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  onSelect,
  isSaved,
  onToggleSave,
  isCompared,
  onToggleCompare,
  currentMascot,
  onShareWhatsAppModal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = generateWhatsAppMessage(school, currentMascot.name);
    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#FFB7D5', '#5584C8', '#FFE66D'],
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = generateWhatsAppMessage(school, currentMascot.name);
    openWhatsAppShare(text);
  };

  // Group CCAs by category
  const sports = school.ccas.filter(c => c.ccaCategory.toUpperCase().includes('SPORT'));
  const arts = school.ccas.filter(c => c.ccaCategory.toUpperCase().includes('PERFORMING') || c.ccaCategory.toUpperCase().includes('ART'));
  const uniform = school.ccas.filter(c => c.ccaCategory.toUpperCase().includes('UNIFORM'));
  const clubs = school.ccas.filter(c => c.ccaCategory.toUpperCase().includes('CLUB'));

  // Determine Level badge styling
  const isPrimary = school.mainLevel.includes('PRIMARY');
  const isJC = school.mainLevel.includes('JUNIOR COLLEGE') || school.mainLevel.includes('JC');
  const levelColor = isPrimary
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : isJC
    ? 'bg-purple-100 text-purple-800 border-purple-200'
    : 'bg-sky-100 text-sky-800 border-sky-200';

  return (
    <div
      onClick={() => onSelect(school)}
      className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-sky-300 p-5 sm:p-6 shadow-xs hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      {/* Decorative sailor collar corner accent */}
      <div className="absolute top-0 right-8 w-12 h-2 bg-linear-to-r from-sky-400 to-indigo-500 rounded-b-md opacity-80 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Top badges row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${levelColor}`}>
              {school.mainLevel}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {school.nature}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Zone: {school.zone}
            </span>
          </div>

          {/* Save & Compare Quick Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleCompare(school);
              }}
              title={isCompared ? 'Remove from compare' : 'Add to compare'}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isCompared
                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                onToggleSave(school);
              }}
              title={isSaved ? 'Remove from saved' : 'Save school'}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-pink-100 border-pink-300 text-pink-600'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-pink-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-pink-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* School Name */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-sky-700 transition-colors tracking-tight mb-2">
          {school.name}
        </h3>

        {/* Location & Transport */}
        <div className="space-y-1 text-xs text-slate-600 mb-4">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{school.address} (Area: {school.dgp})</span>
          </div>
          {school.mrt && (
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Train className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="line-clamp-1">MRT: {school.mrt}</span>
            </div>
          )}
        </div>

        {/* Special Accreditations (IP, SAP, Autonomous, GEP) */}
        {(school.isAutonomous || school.isSap || school.isIp || school.isGifted) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {school.isIp && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                ✨ Integrated Programme (IP)
              </span>
            )}
            {school.isSap && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                🏮 SAP School
              </span>
            )}
            {school.isAutonomous && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                🌟 Autonomous
              </span>
            )}
            {school.isGifted && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                💡 Gifted (GEP)
              </span>
            )}
          </div>
        )}

        {/* Distinctive Programmes Preview */}
        {school.programmes && school.programmes.length > 0 && (
          <div className="mb-4 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
              <Award className="w-3 h-3 text-amber-500" />
              <span>Distinctive Programmes:</span>
            </div>
            <p className="text-xs text-slate-700 font-medium line-clamp-2">
              {school.programmes[0].programmeType}: {school.programmes[0].title}
            </p>
          </div>
        )}

        {/* CCAs Highlights */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>CCAs Offered ({school.ccas.length}):</span>
            </span>
            <span className="text-[11px] font-medium text-sky-600 group-hover:translate-x-0.5 transition-transform flex items-center">
              All details <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {school.ccas.slice(0, 6).map((cca, idx) => (
              <span
                key={idx}
                className="px-2 py-0.8 rounded-lg text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-200 transition-colors"
              >
                {cca.ccaGrouping}
                {cca.ccaCustomizedName ? ` (${cca.ccaCustomizedName})` : ''}
              </span>
            ))}
            {school.ccas.length > 6 && (
              <span className="px-2 py-0.8 rounded-lg text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                +{school.ccas.length - 6} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer: WhatsApp Viral Share & Copy */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Quick 1-Tap WhatsApp Share */}
          <button
            onClick={handleQuickWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs shadow-emerald-200 transition-all cursor-pointer"
            title="Send formatted school & CCA summary to WhatsApp chat"
          >
            <span>📱</span>
            <span>Share WhatsApp</span>
          </button>

          {/* Copy Text */}
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Copy formatted summary with emojis & link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Detailed WhatsApp Modal / Customizer */}
        <button
          onClick={e => {
            e.stopPropagation();
            onShareWhatsAppModal(school);
          }}
          className="p-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-500 hover:text-sky-700 border border-slate-200 transition-colors cursor-pointer"
          title="Customize WhatsApp message with mascot quotes"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
