import React, { useState } from 'react';
import { X, Send, Copy, Check, Sparkles, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { School } from '../types';
import { generateWhatsAppMessage, openWhatsAppShare } from '../utils/whatsapp';
import { Mascot, MASCOTS } from '../data/mascots';

interface WhatsAppShareModalProps {
  school: School;
  onClose: () => void;
  currentMascot: Mascot;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  school,
  onClose,
  currentMascot,
}) => {
  const [selectedMascotId, setSelectedMascotId] = useState(currentMascot.id);
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedMascot = MASCOTS[selectedMascotId] || currentMascot;
  let text = generateWhatsAppMessage(school, selectedMascot.name);

  if (customNote.trim()) {
    text = `💬 *My Note:* "${customNote.trim()}"\n\n` + text;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#25D366', '#5584C8', '#FFB7D5', '#FFE66D'],
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    openWhatsAppShare(text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-[#25D366] via-emerald-600 to-teal-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-white/20 text-xl">📱</div>
            <div>
              <h3 className="font-extrabold text-lg">WhatsApp Viral Share</h3>
              <p className="text-xs text-emerald-100">Send formatted {school.name} breakdown to friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Mascot character quote selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Choose Anime Mascot Quote:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(MASCOTS).map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMascotId(m.id)}
                  className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    selectedMascot.id === m.id
                      ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 opacity-80'
                  }`}
                >
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="w-7 h-7 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800">{m.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional custom note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Add Personal Note to Friends (Optional):
            </label>
            <input
              type="text"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="e.g. Hey guys check out this school's Robotics & Badminton CCAs!"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-200 focus:outline-hidden"
            />
          </div>

          {/* Message Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              WhatsApp Message Preview:
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto select-all">
              {text}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleSend}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>📱</span>
              <span>Open in WhatsApp</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
