import React, { useState } from 'react';
import {
  X,
  MapPin,
  Train,
  Bus,
  Phone,
  Mail,
  Globe,
  Award,
  Sparkles,
  Share2,
  Copy,
  Check,
  Heart,
  Scale,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { School } from '../types';
import { generateWhatsAppMessage, openWhatsAppShare } from '../utils/whatsapp';
import { Mascot, MASCOTS } from '../data/mascots';

interface SchoolDetailModalProps {
  school: School;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (school: School) => void;
  isCompared: boolean;
  onToggleCompare: (school: School) => void;
  currentMascot: Mascot;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  onClose,
  isSaved,
  onToggleSave,
  isCompared,
  onToggleCompare,
  currentMascot,
}) => {
  const [selectedMascotId, setSelectedMascotId] = useState(currentMascot.id);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'ccas' | 'programmes' | 'info'>('ccas');

  const selectedMascot = MASCOTS[selectedMascotId] || currentMascot;
  const whatsappText = generateWhatsAppMessage(school, selectedMascot.name);

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FFB7D5', '#5584C8', '#FFE66D'],
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    openWhatsAppShare(whatsappText);
  };

  // Group CCAs
  const sports = school.ccas.filter(c => c.ccaCategory.toUpperCase().includes('SPORT'));
  const arts = school.ccas.filter(c => c.ccaCategory.toUpperCase().includes('PERFORMING') || c.ccaCategory.toUpperCase().includes('ART'));
  const uniform = school.ccas.filter(c => c.ccaCategory.toUpperCase().includes('UNIFORM'));
  const clubs = school.ccas.filter(c => c.ccaCategory.toUpperCase().includes('CLUB'));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Anime Header */}
        <div className="relative bg-linear-to-r from-sky-500 via-indigo-600 to-pink-500 p-6 text-white shrink-0">
          
          {/* Decorative Sailor Yellow Ribbon corner */}
          <div className="absolute top-0 right-14 w-16 h-4 bg-yellow-300 rounded-b-lg shadow-sm" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/25 backdrop-blur-xs border border-white/40">
              {school.mainLevel}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20">
              {school.nature}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20">
              Zone: {school.zone}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20">
              {school.type}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            {school.name}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-sky-100 font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{school.address} (Postal {school.postalCode})</span>
            </div>
            {school.mrt && (
              <div className="flex items-center gap-1.5">
                <Train className="w-3.5 h-3.5 text-yellow-300" />
                <span>MRT: {school.mrt}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Tabs Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ccas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ccas'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              CCAs ({school.ccas.length})
            </button>
            <button
              onClick={() => setActiveTab('programmes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'programmes'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Programmes ({school.programmes?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              School Details & Contact
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCompare(school)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer border ${
                isCompared
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'Comparing' : 'Compare'}</span>
            </button>

            <button
              onClick={() => onToggleSave(school)}
              className={`p-1.5 rounded-xl border cursor-pointer transition-colors ${
                isSaved
                  ? 'bg-pink-100 text-pink-600 border-pink-300'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-pink-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-pink-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: CCAs */}
          {activeTab === 'ccas' && (
            <div className="space-y-6">
              
              {/* Physical Sports */}
              {sports.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-900 mb-3">
                    <span className="text-lg">⚽</span>
                    <span>Physical Sports ({sports.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {sports.map((c, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-white border border-emerald-200/70 text-xs text-slate-800 shadow-2xs font-medium"
                      >
                        <div className="font-bold text-emerald-950">{c.ccaGrouping}</div>
                        {c.ccaCustomizedName && (
                          <div className="text-[11px] text-slate-500 italic">{c.ccaCustomizedName}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performing Arts */}
              {arts.length > 0 && (
                <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-pink-900 mb-3">
                    <span className="text-lg">🎭</span>
                    <span>Visual & Performing Arts ({arts.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {arts.map((c, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-white border border-pink-200/70 text-xs text-slate-800 shadow-2xs font-medium"
                      >
                        <div className="font-bold text-pink-950">{c.ccaGrouping}</div>
                        {c.ccaCustomizedName && (
                          <div className="text-[11px] text-slate-500 italic">{c.ccaCustomizedName}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uniformed Groups */}
              {uniform.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-900 mb-3">
                    <span className="text-lg">🎖️</span>
                    <span>Uniformed Groups ({uniform.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {uniform.map((c, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-white border border-amber-200/70 text-xs text-slate-800 shadow-2xs font-medium"
                      >
                        <div className="font-bold text-amber-950">{c.ccaGrouping}</div>
                        {c.ccaCustomizedName && (
                          <div className="text-[11px] text-slate-500 italic">{c.ccaCustomizedName}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clubs & Societies */}
              {clubs.length > 0 && (
                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-sky-900 mb-3">
                    <span className="text-lg">🔬</span>
                    <span>Clubs & Societies ({clubs.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {clubs.map((c, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-white border border-sky-200/70 text-xs text-slate-800 shadow-2xs font-medium"
                      >
                        <div className="font-bold text-sky-950">{c.ccaGrouping}</div>
                        {c.ccaCustomizedName && (
                          <div className="text-[11px] text-slate-500 italic">{c.ccaCustomizedName}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Distinctive Programmes */}
          {activeTab === 'programmes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 mb-3 text-sm">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>MOE Distinctive Programmes & Special Offerings</span>
                </h3>

                {school.programmes && school.programmes.length > 0 ? (
                  <div className="space-y-3">
                    {school.programmes.map((p, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white border border-indigo-200/80 shadow-2xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800">
                            {p.programmeType}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">Domain: {p.domain}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mt-1">{p.title}</h4>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No specific distinctive programmes recorded for this school in the open dataset.</p>
                )}
              </div>

              {/* Special Accreditations detail */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className={`p-3 rounded-xl border ${school.isIp ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <div className="text-xs font-bold">Integrated Prog (IP)</div>
                  <div className="text-[11px] font-medium">{school.isIp ? 'Yes (6-year direct)' : 'No'}</div>
                </div>
                <div className={`p-3 rounded-xl border ${school.isSap ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <div className="text-xs font-bold">SAP School</div>
                  <div className="text-[11px] font-medium">{school.isSap ? 'Yes (Bilingual focus)' : 'No'}</div>
                </div>
                <div className={`p-3 rounded-xl border ${school.isAutonomous ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <div className="text-xs font-bold">Autonomous</div>
                  <div className="text-[11px] font-medium">{school.isAutonomous ? 'Yes' : 'No'}</div>
                </div>
                <div className={`p-3 rounded-xl border ${school.isGifted ? 'bg-pink-50 border-pink-300 text-pink-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <div className="text-xs font-bold">Gifted (GEP)</div>
                  <div className="text-[11px] font-medium">{school.isGifted ? 'Yes (GEP Centre)' : 'No'}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Info & Contacts */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 text-sm">School Administration</h4>
                <div>
                  <div className="text-slate-500 font-medium">Principal:</div>
                  <div className="text-slate-800 font-bold">{school.principal || 'N/A'}</div>
                </div>
                {school.firstVp && (
                  <div>
                    <div className="text-slate-500 font-medium">Vice-Principal:</div>
                    <div className="text-slate-800 font-semibold">{school.firstVp}</div>
                  </div>
                )}
                <div>
                  <div className="text-slate-500 font-medium">Session:</div>
                  <div className="text-slate-800 font-semibold">{school.session}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Mother Tongues Offered:</div>
                  <div className="text-slate-800 font-semibold">{school.motherTongues.join(', ') || 'Chinese, Malay, Tamil'}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 text-sm">Contact & Transportation</h4>
                {school.url && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-600 shrink-0" />
                    <a
                      href={school.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline font-bold truncate"
                    >
                      {school.url}
                    </a>
                  </div>
                )}
                {school.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-slate-800 font-semibold">{school.telephone}</span>
                  </div>
                )}
                {school.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-pink-600 shrink-0" />
                    <span className="text-slate-800 font-semibold">{school.email}</span>
                  </div>
                )}
                {school.bus && (
                  <div className="flex items-start gap-2">
                    <Bus className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Bus: {school.bus}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WhatsApp Viral Sharing Card Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-emerald-50 via-sky-50 to-pink-50 border border-emerald-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    Viral WhatsApp Share Generator
                  </h4>
                  <p className="text-xs text-slate-600">
                    Formatted with emoji bullets, CCAs, location, and anime cheering quote!
                  </p>
                </div>
              </div>

              {/* Character Mascot Switcher for Quote */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 pl-1.5">Quote:</span>
                {Object.values(MASCOTS).map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMascotId(m.id)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedMascot.id === m.id
                        ? 'bg-sky-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Formatted Text Preview Box */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto mb-3.5 select-all">
              {whatsappText}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-emerald-200 hover:shadow-emerald-300 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>📱</span>
                <span>Send to WhatsApp Now</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
