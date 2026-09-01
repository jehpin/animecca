import React, { useState, useEffect } from 'react';
import { X, Search, Sparkles, Trophy, Music, Shield, Cpu } from 'lucide-react';
import { getAllCCAsClient } from '../services/csvDataService';

interface AllCCAsExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCCA: (ccaName: string) => void;
}

interface CCAItemSummary {
  name: string;
  category: string;
  count: number;
}

export const AllCCAsExplorer: React.FC<AllCCAsExplorerProps> = ({
  isOpen,
  onClose,
  onSelectCCA,
}) => {
  const [ccas, setCcas] = useState<CCAItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const clientList = getAllCCAsClient();
      if (clientList.length > 0) {
        setCcas(clientList);
        setLoading(false);
        return;
      }
      // Fallback to fetch if client cache is empty
      fetch('/api/ccas')
        .then(r => r.json())
        .then(data => {
          setCcas(data);
          setLoading(false);
        })
        .catch(e => {
          console.error('Failed to load CCAs:', e);
          setLoading(false);
        });
    } catch (e) {
      console.error('Error getting CCAs:', e);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'All CCAs' },
    { id: 'PHYSICAL SPORTS', label: '⚽ Sports' },
    { id: 'VISUAL AND PERFORMING ARTS', label: '🎭 Arts & Music' },
    { id: 'UNIFORMED GROUPS', label: '🎖️ Uniformed' },
    { id: 'CLUBS AND SOCIETIES', label: '🔬 Clubs' },
  ];

  const filtered = ccas.filter(c => {
    if (selectedCategory !== 'ALL' && !c.category.toUpperCase().includes(selectedCategory)) {
      return false;
    }
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-sky-500 via-indigo-600 to-pink-500 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-white/20 text-xl">🌸</div>
            <div>
              <h2 className="text-xl font-extrabold">Singapore CCAs Directory</h2>
              <p className="text-xs text-sky-100">Explore all {ccas.length} official Co-Curricular Activities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search CCA name (e.g. Wushu, Floorball, Guzheng, Robotics, Scouts)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-200 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* CCAs Grid */}
        <div className="p-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading Singapore CCAs...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No CCAs found matching "{search}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filtered.map(cca => (
                <button
                  key={cca.name}
                  onClick={() => {
                    onSelectCCA(cca.name);
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-sky-700">
                      {cca.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {cca.category}
                    </div>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 group-hover:bg-sky-100 group-hover:text-sky-800 text-slate-600 shrink-0">
                    {cca.count} {cca.count === 1 ? 'school' : 'schools'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
