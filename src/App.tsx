import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { FilterBar } from './components/FilterBar';
import { SchoolCard } from './components/SchoolCard';
import { SchoolDetailModal } from './components/SchoolDetailModal';
import { CompareModal } from './components/CompareModal';
import { SavedSchoolsModal } from './components/SavedSchoolsModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { AllCCAsExplorer } from './components/AllCCAsExplorer';
import { MascotWidget } from './components/MascotWidget';
import { MASCOTS, Mascot } from './data/mascots';
import { School, SearchResult } from './types';
import {
  loadSchoolDataFromCSV,
  searchSchoolsClient,
  getRandomSchoolClient,
  isDataLoaded,
} from './services/csvDataService';
import { Sparkles, AlertCircle, Database, ChevronLeft, ChevronRight, RefreshCw, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // State
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('ALL');
  const [zone, setZone] = useState('ALL');
  const [ccaCategory, setCcaCategory] = useState('ALL');
  const [nature, setNature] = useState('ALL');
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [isSap, setIsSap] = useState(false);
  const [isIp, setIsIp] = useState(false);
  const [isGifted, setIsGifted] = useState(false);
  const [page, setPage] = useState(1);

  // Search Results & Data Status
  const [results, setResults] = useState<SearchResult>({
    schools: [],
    total: 0,
    matchingCCAs: [],
    featuredSuggestions: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Mascot
  const [currentMascot, setCurrentMascot] = useState<Mascot>(MASCOTS.konata);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);

  // Modals & Drawers
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [shareWhatsAppSchool, setShareWhatsAppSchool] = useState<School | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isCCADirectoryOpen, setIsCCADirectoryOpen] = useState(false);

  // Bookmarks & Compare State (persisted in localStorage)
  const [savedSchools, setSavedSchools] = useState<School[]>(() => {
    try {
      const saved = localStorage.getItem('sg_saved_schools');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareList, setCompareList] = useState<School[]>(() => {
    try {
      const saved = localStorage.getItem('sg_compare_schools');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sg_saved_schools', JSON.stringify(savedSchools));
  }, [savedSchools]);

  useEffect(() => {
    localStorage.setItem('sg_compare_schools', JSON.stringify(compareList));
  }, [compareList]);

  // Read URL query parameters on initial load (e.g. ?q=Wushu)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQ = params.get('q');
    if (initialQ) {
      setQuery(initialQ);
    }
  }, []);

  // Fetch / Execute search from CSV data
  const executeSearch = useCallback(async () => {
    setLoading(true);
    try {
      // Ensure CSV data is loaded
      await loadSchoolDataFromCSV();
      setLoadError(null);

      const searchRes = searchSchoolsClient({
        query,
        level: level !== 'ALL' ? level : '',
        zone: zone !== 'ALL' ? zone : '',
        ccaCategory: ccaCategory !== 'ALL' ? ccaCategory : '',
        nature: nature !== 'ALL' ? nature : '',
        isAutonomous,
        isSap,
        isIp,
        isGifted,
        page,
        limit: 30,
      });

      setResults(searchRes);

      if (query.trim()) {
        setStatusMessage(
          searchRes.total > 0
            ? `Found ${searchRes.total} schools for "${query}"! Check out the activities below! ✨`
            : `No matching schools for "${query}". Try exploring popular CCAs or locations! 🌸`
        );
      }
    } catch (err: any) {
      console.error('Failed to load or parse CSV school datasets:', err);
      setLoadError(err?.message || 'Failed to fetch and parse static CSV files');
    } finally {
      setLoading(false);
    }
  }, [query, level, zone, ccaCategory, nature, isAutonomous, isSap, isIp, isGifted, page]);

  // Initial load & search execution on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch();
    }, 150);
    return () => clearTimeout(timer);
  }, [executeSearch]);

  // Handle Lucky Gacha / Random School Pick
  const handleLuckyGacha = async () => {
    try {
      let randomSchool = getRandomSchoolClient();
      if (!randomSchool) {
        await loadSchoolDataFromCSV();
        randomSchool = getRandomSchoolClient();
      }

      if (randomSchool) {
        setSelectedSchool(randomSchool);
        setStatusMessage(
          `✨ Gacha! You rolled ${randomSchool.name}! Let’s see what awesome clubs they have! (☆ω☆)`
        );
      }
    } catch (err) {
      console.error('Failed to roll random school:', err);
    }
  };

  // Toggle Save / Bookmark
  const handleToggleSave = (school: School) => {
    setSavedSchools(prev => {
      const exists = prev.some(s => s.name === school.name);
      if (exists) {
        return prev.filter(s => s.name !== school.name);
      } else {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#FFB7D5', '#FFE66D'],
        });
        return [...prev, school];
      }
    });
  };

  // Toggle Compare
  const handleToggleCompare = (school: School) => {
    setCompareList(prev => {
      const exists = prev.some(s => s.name === school.name);
      if (exists) {
        return prev.filter(s => s.name !== school.name);
      } else {
        if (prev.length >= 3) {
          alert('You can compare up to 3 schools at once! Please remove one first.');
          return prev;
        }
        return [...prev, school];
      }
    });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setQuery('');
    setLevel('ALL');
    setZone('ALL');
    setCcaCategory('ALL');
    setNature('ALL');
    setIsAutonomous(false);
    setIsSap(false);
    setIsIp(false);
    setIsGifted(false);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-pink-200 selection:text-pink-900">
      
      {/* Top Navbar */}
      <Navbar
        currentMascot={currentMascot}
        onSelectMascot={m => {
          setCurrentMascot(m);
          setStatusMessage(m.dialogues.welcome);
        }}
        savedSchoolsCount={savedSchools.length}
        onOpenSaved={() => setIsSavedOpen(true)}
        compareCount={compareList.length}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenCCADirectory={() => setIsCCADirectoryOpen(true)}
      />

      {/* Main Search Hero with Anime Aesthetics */}
      <HeroSearch
        query={query}
        onQueryChange={q => {
          setQuery(q);
          setPage(1);
        }}
        onSearch={q => {
          setQuery(q);
          executeSearch();
        }}
        onLuckyGacha={handleLuckyGacha}
        onSelectCategory={cat => {
          setCcaCategory(cat);
          setPage(1);
        }}
        activeCategory={ccaCategory}
        currentMascot={currentMascot}
        totalResults={results.total}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Visual Error State */}
        {loadError && (
          <div className="mb-8 p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-rose-900">Failed to Load CSV Datasets</h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  {loadError}. Please ensure static CSV files exist at root paths (/general-information-of-schools.csv, /co-curricular-activities.csv, etc.).
                </p>
              </div>
            </div>
            <button
              onClick={() => executeSearch()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-rose-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading CSV Data</span>
            </button>
          </div>
        )}

        {/* Filters */}
        <FilterBar
          level={level}
          onLevelChange={lvl => {
            setLevel(lvl);
            setPage(1);
          }}
          zone={zone}
          onZoneChange={z => {
            setZone(z);
            setPage(1);
          }}
          nature={nature}
          onNatureChange={n => {
            setNature(n);
            setPage(1);
          }}
          isAutonomous={isAutonomous}
          onAutonomousChange={v => {
            setIsAutonomous(v);
            setPage(1);
          }}
          isSap={isSap}
          onSapChange={v => {
            setIsSap(v);
            setPage(1);
          }}
          isIp={isIp}
          onIpChange={v => {
            setIsIp(v);
            setPage(1);
          }}
          isGifted={isGifted}
          onGiftedChange={v => {
            setIsGifted(v);
            setPage(1);
          }}
          totalResults={results.total}
          onReset={handleResetFilters}
        />

        {/* Partial Match Notice */}
        {results.isPartialMatch && query.trim() && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <span>
                No exact match for all search terms. Showing <strong>{results.total}</strong> best matching schools for <em>"{query}"</em>.
              </span>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg font-bold text-amber-800 cursor-pointer whitespace-nowrap"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Matching CCAs Quick Tags (if user typed a query) */}
        {results.matchingCCAs.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-sky-50/80 border border-sky-200/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-sky-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Matching Activities:</span>
            </span>
            {results.matchingCCAs.map(c => (
              <button
                key={c.ccaName}
                onClick={() => {
                  setQuery(c.ccaName);
                  setPage(1);
                }}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white hover:bg-sky-100 text-sky-900 border border-sky-300 shadow-2xs transition-colors cursor-pointer"
              >
                {c.ccaName} ({c.schoolCount} schools)
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Searching Singapore schools & CCAs...</p>
            <p className="text-xs text-slate-500">Querying Ministry of Education open dataset...</p>
          </div>
        ) : results.schools.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <div className="text-4xl mb-3">🌸</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Schools Found</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              We couldn't find any schools matching your current search and filters.
            </p>

            {(level !== 'ALL' || zone !== 'ALL' || ccaCategory !== 'ALL' || nature !== 'ALL' || isAutonomous || isSap || isIp || isGifted) && (
              <div className="mb-4 flex flex-wrap justify-center gap-1.5">
                {level !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700">
                    Level: {level}
                    <button onClick={() => setLevel('ALL')} className="hover:text-pink-600 font-bold ml-1">✕</button>
                  </span>
                )}
                {zone !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700">
                    Zone: {zone}
                    <button onClick={() => setZone('ALL')} className="hover:text-pink-600 font-bold ml-1">✕</button>
                  </span>
                )}
                {ccaCategory !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700">
                    CCA: {ccaCategory}
                    <button onClick={() => setCcaCategory('ALL')} className="hover:text-pink-600 font-bold ml-1">✕</button>
                  </span>
                )}
                {nature !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700">
                    Nature: {nature}
                    <button onClick={() => setNature('ALL')} className="hover:text-pink-600 font-bold ml-1">✕</button>
                  </span>
                )}
              </div>
            )}

            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-200 transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Schools Grid */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {results.schools.map(school => (
                <SchoolCard
                  key={school.name}
                  school={school}
                  onSelect={setSelectedSchool}
                  isSaved={savedSchools.some(s => s.name === school.name)}
                  onToggleSave={handleToggleSave}
                  isCompared={compareList.some(c => c.name === school.name)}
                  onToggleCompare={handleToggleCompare}
                  currentMascot={currentMascot}
                  onShareWhatsAppModal={setShareWhatsAppSchool}
                />
              ))}
            </div>

            {/* Pagination Controls if >30 results */}
            {results.total > 30 && (
              <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200">
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    setPage(prev => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-bold text-slate-600">
                  Page {page} of {Math.ceil(results.total / 30)} ({results.total} schools)
                </span>

                <button
                  disabled={page >= Math.ceil(results.total / 30)}
                  onClick={() => {
                    setPage(prev => prev + 1);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Floating Anime Mascot Companion */}
      <MascotWidget
        currentMascot={currentMascot}
        onSwitchMascot={setCurrentMascot}
        statusMessage={statusMessage}
        totalResults={results.total}
      />

      {/* Modals */}
      {selectedSchool && (
        <SchoolDetailModal
          school={selectedSchool}
          onClose={() => setSelectedSchool(null)}
          isSaved={savedSchools.some(s => s.name === selectedSchool.name)}
          onToggleSave={handleToggleSave}
          isCompared={compareList.some(c => c.name === selectedSchool.name)}
          onToggleCompare={handleToggleCompare}
          currentMascot={currentMascot}
        />
      )}

      {shareWhatsAppSchool && (
        <WhatsAppShareModal
          school={shareWhatsAppSchool}
          onClose={() => setShareWhatsAppSchool(null)}
          currentMascot={currentMascot}
        />
      )}

      {isCompareOpen && (
        <CompareModal
          schools={compareList}
          onClose={() => setIsCompareOpen(false)}
          onRemove={handleToggleCompare}
          onClear={() => setCompareList([])}
          onSelectSchool={s => {
            setIsCompareOpen(false);
            setSelectedSchool(s);
          }}
        />
      )}

      {isSavedOpen && (
        <SavedSchoolsModal
          savedSchools={savedSchools}
          onClose={() => setIsSavedOpen(false)}
          onRemove={handleToggleSave}
          onClear={() => setSavedSchools([])}
          onSelectSchool={s => {
            setIsSavedOpen(false);
            setSelectedSchool(s);
          }}
          onToggleCompare={handleToggleCompare}
          compareList={compareList}
        />
      )}

      {isCCADirectoryOpen && (
        <AllCCAsExplorer
          isOpen={isCCADirectoryOpen}
          onClose={() => setIsCCADirectoryOpen(false)}
          onSelectCCA={cca => {
            setQuery(cca);
            setPage(1);
            executeSearch();
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-700">
            <span>🌸 Singapore School & CCA Finder</span>
            <span>•</span>
            <span className="text-sky-600">Pastel Anime Edition</span>
          </div>
          <p className="flex items-center justify-center gap-1">
            <Database className="w-3.5 h-3.5 text-sky-500" />
            <span>
              Powered by Singapore Open Data API: <a href="https://data.gov.sg/datasets?topics=education&resultId=457" target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-600">data.gov.sg Collection 457</a> (Ministry of Education)
            </span>
          </p>
          <p className="text-[11px] text-slate-400">
            Easily discover schools, compare co-curricular activities, and share with your friends on WhatsApp!
          </p>
        </div>
      </footer>

    </div>
  );
}
