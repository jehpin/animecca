import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Dices, Flame, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Mascot } from '../data/mascots';

interface HeroSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: (q: string) => void;
  onLuckyGacha: () => void;
  onSelectCategory: (cat: string) => void;
  activeCategory: string;
  currentMascot: Mascot;
  totalResults: number;
}

const PLACEHOLDERS = [
  'Wushu',
  'Badminton',
  'Robotics Club',
  'Symphonic Band',
  'Raffles Institution',
  'Nanyang Girls\' High',
  'Victoria School',
  'National Cadet Corps (NCC)',
  'Floorball',
  'Tampines',
  'Bishan',
  'Archery',
  'Choir',
  'Applied Learning Programme (ALP)',
];

const TRENDING_TAGS = [
  { label: 'Wushu', icon: '🥋' },
  { label: 'Badminton', icon: '🏸' },
  { label: 'Robotics', icon: '🤖' },
  { label: 'Symphonic Band', icon: '🎺' },
  { label: 'Floorball', icon: '🏑' },
  { label: 'Choir', icon: '🎵' },
  { label: 'NCC (Cadet Corps)', icon: '🎖️' },
  { label: 'Scouts', icon: '🏕️' },
  { label: 'Raffles Institution', icon: '🏫' },
  { label: 'Hwa Chong', icon: '🎓' },
];

const CCA_CATEGORIES = [
  { id: 'ALL', label: 'All CCAs', icon: '✨', color: 'border-slate-300 bg-white text-slate-700' },
  { id: 'PHYSICAL SPORTS', label: 'Physical Sports', icon: '⚽', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  { id: 'VISUAL AND PERFORMING ARTS', label: 'Performing Arts', icon: '🎭', color: 'border-pink-300 bg-pink-50 text-pink-800' },
  { id: 'UNIFORMED GROUPS', label: 'Uniformed Groups', icon: '🎖️', color: 'border-amber-300 bg-amber-50 text-amber-800' },
  { id: 'CLUBS AND SOCIETIES', label: 'Clubs & Societies', icon: '🔬', color: 'border-sky-300 bg-sky-50 text-sky-800' },
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  query,
  onQueryChange,
  onSearch,
  onLuckyGacha,
  onSelectCategory,
  activeCategory,
  currentMascot,
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate animated placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  const triggerGacha = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#5584C8', '#FFB7D5', '#FFE66D', '#B8C3F5'],
    });
    onLuckyGacha();
  };

  return (
    <div className="relative overflow-hidden pt-6 pb-8 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-sky-50/70 via-indigo-50/40 to-transparent">
      
      {/* Decorative anime sailor ribbons in background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none opacity-40">
        <div className="absolute top-2 left-6 w-32 h-32 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute top-4 right-8 w-40 h-40 rounded-full bg-pink-200/50 blur-3xl" />
        <div className="absolute bottom-2 left-1/3 w-36 h-36 rounded-full bg-yellow-200/40 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        
        {/* Cute Mascot Greeting & Title */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-sky-200/80 shadow-xs mb-3">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="text-xs font-medium text-slate-700">
            Official Singapore MOE School & CCA Directory
          </span>
          <span className="text-xs text-sky-600 font-bold">#DataGovSG</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-2">
          Find Your Dream <span className="bg-linear-to-r from-sky-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">School & CCA</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-6">
          Search over <span className="font-semibold text-sky-700">330+ Singapore Schools</span> and <span className="font-semibold text-pink-600">7,000+ CCAs</span>. Instant results, deep insights, and 1-tap WhatsApp sharing for your squad! ✨
        </p>

        {/* Google-Style Centered Search Box */}
        <div className="max-w-2xl mx-auto mb-4">
          <div
            className={`relative flex items-center bg-white rounded-2xl sm:rounded-3xl border-2 transition-all shadow-lg ${
              isFocused
                ? 'border-sky-400 shadow-sky-100 ring-4 ring-sky-100'
                : 'border-slate-200 hover:border-sky-300 shadow-slate-100'
            }`}
          >
            <div className="pl-4 sm:pl-5 text-sky-500 flex items-center">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={`Try searching "${PLACEHOLDERS[placeholderIndex]}"...`}
              className="w-full py-3.5 sm:py-4 px-3 sm:px-4 text-slate-800 placeholder-slate-400 bg-transparent text-sm sm:text-base focus:outline-hidden font-medium"
            />

            {query && (
              <button
                onClick={() => {
                  onQueryChange('');
                  inputRef.current?.focus();
                }}
                className="p-1.5 mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onSearch(query)}
              className="mr-2 sm:mr-3 px-4 sm:px-5 py-2 sm:py-2.5 bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm shadow-md shadow-sky-200 hover:shadow-sky-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Search</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Buttons Row: Direct Search & I'm Feeling Lucky Gacha */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <button
            onClick={() => onSearch(query)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-sky-500" />
            <span>Search Schools & CCAs</span>
          </button>

          <button
            onClick={triggerGacha}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-linear-to-r from-amber-400 via-pink-400 to-sky-400 hover:from-amber-500 hover:via-pink-500 hover:to-sky-500 text-white shadow-sm shadow-amber-200 hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            title="Pick a random Singapore school and explore its CCAs!"
          >
            <Dices className="w-4 h-4 animate-spin" />
            <span>✨ I'm Feeling Lucky (School Gacha)</span>
          </button>
        </div>

        {/* Trending Search Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-5">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-pink-500" />
            <span>Popular:</span>
          </span>
          {TRENDING_TAGS.map(tag => (
            <button
              key={tag.label}
              onClick={() => {
                onQueryChange(tag.label);
                onSearch(tag.label);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 shadow-2xs transition-all cursor-pointer"
            >
              <span>{tag.icon}</span>
              <span>{tag.label}</span>
            </button>
          ))}
        </div>

        {/* CCA Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-200/60">
          {CCA_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                  isActive
                    ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-200'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
