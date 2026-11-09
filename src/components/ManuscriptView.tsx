import React from 'react';
import { Play, Pause, Volume2, Sparkles, Copy, Check } from 'lucide-react';
import { Verse, POEM_TITLE } from '../data/poem';

interface ManuscriptViewProps {
  verses: Verse[];
  activeVerseId: number | null;
  isPlaying: boolean;
  onSelectVerse: (verse: Verse) => void;
  fontSize: number;
  showEnglish: boolean;
  setShowEnglish: (show: boolean) => void;
  showTransliteration: boolean;
  setShowTransliteration: (show: boolean) => void;
}

export const ManuscriptView: React.FC<ManuscriptViewProps> = ({
  verses,
  activeVerseId,
  isPlaying,
  onSelectVerse,
  fontSize,
  showEnglish,
  setShowEnglish,
  showTransliteration,
  setShowTransliteration,
}) => {
  const [copiedAll, setCopiedAll] = React.useState(false);

  const copyFullManuscript = () => {
    const text = verses.map((v) => `${v.id}. ${v.balochi}\n   ${v.english}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Manuscript Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-amber-400 font-display">Manuscript Settings:</span>
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              checked={showEnglish}
              onChange={(e) => setShowEnglish(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span>English Translation</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              checked={showTransliteration}
              onChange={(e) => setShowTransliteration(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span>Roman Transliteration</span>
          </label>
        </div>

        <button
          onClick={copyFullManuscript}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-amber-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          aria-label="Copy entire manuscript"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedAll ? 'Copied Full Poem' : 'Copy Full Poem'}</span>
        </button>
      </div>

      {/* Parchment Manuscript Container */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-[#0e1320] border-2 border-amber-900/40 shadow-2xl overflow-hidden">
        {/* Subtle decorative calligraphic watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-5">
          <span className="font-balochi text-9xl font-bold text-amber-300">
            بلوچ
          </span>
        </div>

        {/* Diwan Header */}
        <div className="text-center pb-8 border-b border-amber-900/30 mb-8 relative z-10">
          <p className="text-xs font-mono text-amber-500 tracking-widest uppercase mb-1">
            دیوان میر گل خان نصیر
          </p>
          <h2 className="font-balochi text-3xl sm:text-4xl font-bold text-amber-200 mb-2">
            {POEM_TITLE.balochi}
          </h2>
          <p className="text-sm text-slate-400 font-display">
            A Hymn to Courage, Seafaring Struggle & Human Liberty
          </p>
        </div>

        {/* Verses List */}
        <div className="space-y-6 relative z-10">
          {verses.map((verse) => {
            const isSelected = activeVerseId === verse.id;
            return (
              <div
                key={verse.id}
                onClick={() => onSelectVerse(verse)}
                className={`group cursor-pointer p-4 rounded-xl transition-all border ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-950/50'
                    : 'bg-transparent hover:bg-slate-900/50 border-transparent hover:border-slate-800'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelectVerse(verse);
                }}
                aria-label={`Verse ${verse.id}: ${verse.english}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left indicator & verse ID */}
                  <div className="flex items-center gap-2 pt-1 text-xs font-mono">
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center font-bold ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 group-hover:text-amber-300'
                      }`}
                    >
                      {verse.id}
                    </span>
                    <button
                      className="p-1 rounded hover:bg-amber-900/40 text-slate-500 group-hover:text-amber-400 transition-colors"
                      title="Play this verse"
                      aria-label="Play verse"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Right: Balochi text */}
                  <div className="text-right flex-1">
                    <p
                      className={`font-balochi font-bold leading-loose select-text transition-colors ${
                        isSelected
                          ? 'text-amber-200 drop-shadow'
                          : 'text-slate-200 group-hover:text-amber-100'
                      }`}
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {verse.balochi}
                    </p>

                    {showTransliteration && (
                      <p className="font-mono text-xs text-cyan-400/80 mt-1 select-text">
                        {verse.transliteration}
                      </p>
                    )}

                    {showEnglish && (
                      <p className="text-xs sm:text-sm text-slate-400 mt-1.5 italic select-text">
                        "{verse.english}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diwan Footer / Colophon */}
        <div className="text-center pt-8 border-t border-amber-900/30 mt-8 relative z-10">
          <p className="font-balochi text-base text-amber-400 mb-1">
            تمت بالخير • گالاں نصیرءِ گوش بدار
          </p>
          <p className="text-xs text-slate-500">
            End of Poem • Mir Gul Khan Naseer (1914 – 1983)
          </p>
        </div>
      </div>
    </div>
  );
};
