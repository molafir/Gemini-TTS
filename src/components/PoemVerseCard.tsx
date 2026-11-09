import React, { useState } from 'react';
import { Play, Pause, Loader2, Copy, Check, Info, BookOpen, Volume2 } from 'lucide-react';
import { Verse, GlossaryItem } from '../data/poem';

interface PoemVerseCardProps {
  verse: Verse;
  fontSize: number;
  isActive: boolean;
  isPlaying: boolean;
  isLoadingTts: boolean;
  onPlayVerse: (verse: Verse) => void;
  onSelectGlossaryWord: (word: string) => void;
  glossaryList: GlossaryItem[];
  showTransliteration: boolean;
}

export const PoemVerseCard: React.FC<PoemVerseCardProps> = ({
  verse,
  fontSize,
  isActive,
  isPlaying,
  isLoadingTts,
  onPlayVerse,
  onSelectGlossaryWord,
  glossaryList,
  showTransliteration,
}) => {
  const [copied, setCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${verse.balochi}\n${verse.transliteration}\n"${verse.english}"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      data-testid={`verse-card-${verse.id}`}
      className={`relative p-5 sm:p-6 rounded-2xl transition-all duration-300 border ${
        isActive
          ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-amber-500 shadow-xl shadow-amber-950/40 ring-1 ring-amber-500/40'
          : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800/90 hover:border-slate-700/80 shadow-md'
      }`}
    >
      {/* Top Header Bar: Verse Number & Action Buttons */}
      <div className="flex items-center justify-between gap-2 mb-4 border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-600/40 text-amber-300 font-mono text-xs font-bold flex items-center justify-center">
            {verse.id}
          </span>
          {isActive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-medium border border-amber-500/30">
              <Volume2 className="w-3 h-3 animate-pulse" />
              <span>Playing</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Play/Recite Single Verse Button */}
          <button
            onClick={() => onPlayVerse(verse)}
            disabled={isLoadingTts}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              isActive && isPlaying
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/50'
                : 'bg-slate-800 hover:bg-amber-950/80 text-slate-300 hover:text-amber-300 border border-slate-700'
            }`}
            title={`Recite verse ${verse.id} with Gemini 3.8 Flash TTS`}
            aria-label={`Recite verse ${verse.id}`}
          >
            {isLoadingTts ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : isActive && isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span className="text-xs">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xs">Recite</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy Balochi text & translation"
            aria-label="Copy verse text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Explanation Toggle */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`p-2 rounded-xl text-xs transition-colors ${
              showExplanation
                ? 'bg-amber-900/40 text-amber-300 border border-amber-600/40'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle literary commentary"
            aria-label="Toggle commentary"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Balochi Script (Right-to-Left) */}
      <div className="my-3 text-right">
        <p
          className="font-balochi text-amber-100 font-bold leading-loose select-text drop-shadow-sm transition-all"
          style={{ fontSize: `${fontSize}px` }}
        >
          {verse.balochi}
        </p>
      </div>

      {/* Romanized Balochi Transliteration (optional toggle) */}
      {showTransliteration && (
        <div className="mt-2 text-left">
          <p className="font-mono text-xs sm:text-sm text-cyan-300/90 tracking-wide bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/80 inline-block">
            {verse.transliteration}
          </p>
        </div>
      )}

      {/* English Translation */}
      <div className="mt-3 text-left">
        <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
          "{verse.english}"
        </p>
      </div>

      {/* Literary Commentary / Cultural Meaning Dropdown */}
      {showExplanation && (
        <div className="mt-4 p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs sm:text-sm text-amber-200/90 leading-relaxed text-left flex gap-2.5">
          <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300 block mb-0.5">Literary & Cultural Context:</span>
            <span>{verse.explanation}</span>
          </div>
        </div>
      )}

      {/* Key Terms / Vocabulary Chips */}
      <div className="mt-4 pt-3 border-t border-slate-800/50 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-500 font-medium mr-1">Glossary:</span>
        {verse.keywords.map((kw, idx) => (
          <button
            key={idx}
            onClick={() => onSelectGlossaryWord(kw)}
            className="px-2.5 py-0.5 rounded-md bg-slate-800/90 hover:bg-amber-900/50 text-amber-300/90 hover:text-amber-200 border border-slate-700/70 hover:border-amber-600/50 text-xs font-balochi transition-colors"
            title={`View meaning of ${kw}`}
          >
            {kw}
          </button>
        ))}
      </div>
    </article>
  );
};
