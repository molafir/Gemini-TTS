import React, { useState } from 'react';
import { X, Search, Sparkles, BookOpen } from 'lucide-react';
import { GLOSSARY, GlossaryItem } from '../data/poem';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWord?: string | null;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose, selectedWord }) => {
  const [searchTerm, setSearchTerm] = useState(selectedWord || '');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Terms' },
    { id: 'courage', label: 'Courage & Valor (سرمَچاری)' },
    { id: 'maritime', label: 'Maritime & Sea (زر ءُ بوجی)' },
    { id: 'action', label: 'Action & Destiny (جدّ ءُ تکدیر)' },
    { id: 'nature', label: 'Storms & Nature (توپان ءُ گرئند)' },
    { id: 'virtue', label: 'Virtue & Epoch (مڑا ءُ روزگار)' },
  ];

  const filteredGlossary = GLOSSARY.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      item.word.includes(term) ||
      item.transliteration.toLowerCase().includes(term) ||
      item.meaning.toLowerCase().includes(term) ||
      (item.balochiMeaning && item.balochiMeaning.includes(term));
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0f1422] border border-amber-900/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="glossary-title" className="text-lg font-bold text-slate-100 font-display">
                Balochi Poetic Glossary & Lexicon
              </h3>
              <p className="text-xs text-slate-400">
                گنجینۂ لغت • Traditional maritime and heroic terminology
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close glossary modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-6 pb-2 border-b border-slate-800/60 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Balochi word, English translation, or Roman transliteration..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-1.5 pb-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === c.id
                    ? 'bg-amber-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Word Cards List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredGlossary.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <span>No matching glossary terms found.</span>
            </div>
          ) : (
            filteredGlossary.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-600/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-balochi text-xl font-bold text-amber-300">
                      {item.word}
                    </span>
                    <span className="font-mono text-xs text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {item.transliteration}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {item.meaning}
                  </p>
                </div>

                {item.balochiMeaning && (
                  <div className="text-right sm:max-w-xs shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      Balochi Explanation:
                    </span>
                    <span className="font-balochi text-xs text-amber-200/90 leading-relaxed">
                      {item.balochiMeaning}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
