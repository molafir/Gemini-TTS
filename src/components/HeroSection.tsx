import React from 'react';
import { Play, Pause, Loader2, Sparkles, Compass, Shield, Waves, Radio } from 'lucide-react';
import { POEM_TITLE, TTS_VOICES } from '../data/poem';

interface HeroSectionProps {
  onReciteFullPoem: () => void;
  isPlayingFullPoem: boolean;
  isLoadingTts: boolean;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  onExploreVerses: () => void;
  onOpenStudio?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onReciteFullPoem,
  isPlayingFullPoem,
  isLoadingTts,
  selectedVoice,
  setSelectedVoice,
  onExploreVerses,
  onOpenStudio,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-10 border-b border-slate-800/80 bg-gradient-to-b from-[#111728] via-[#0c0f17] to-[#0c0f17]">
      {/* Decorative celestial background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-300 text-xs font-medium mb-5 shadow-sm">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Voice Recitation Powered by Gemini 3.8 Flash TTS</span>
          </div>

          {/* Master Balochi Calligraphic Title */}
          <h1 className="font-balochi text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 drop-shadow-md mb-3 leading-relaxed tracking-wide">
            {POEM_TITLE.balochi}
          </h1>

          {/* Subtitle / Poet Attribution */}
          <p className="font-display text-lg sm:text-xl md:text-2xl text-slate-300 font-semibold tracking-wider mb-2">
            O Mardaaren Baloch — O Valiant Baloch!
          </p>
          <p className="text-sm sm:text-base text-amber-500/90 font-medium mb-6">
            By {POEM_TITLE.poet.english} ({POEM_TITLE.poet.balochi}) • {POEM_TITLE.subtitle}
          </p>

          {/* Stirring excerpt preview */}
          <div className="relative p-5 rounded-2xl bg-slate-900/60 border border-amber-900/30 backdrop-blur-md max-w-2xl mx-auto mb-8 shadow-xl">
            <p className="font-balochi text-xl sm:text-2xl text-amber-200 mb-2 leading-relaxed">
              « اے سیاهیں شپ نہ مانیت، نئے سیاهیں روزگار »
            </p>
            <p className="text-xs sm:text-sm text-slate-400 italic font-light">
              "Neither will this dark night endure, nor will this black era remain."
            </p>
          </div>

          {/* TTS Voice Selector & Recitation Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-8">
            {/* Voice Dropdown */}
            <div className="w-full sm:w-auto flex-1">
              <label htmlFor="voice-select" className="sr-only">
                Select Recitation Voice
              </label>
              <select
                id="voice-select"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 hover:border-amber-500 rounded-xl text-slate-200 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors shadow-inner"
              >
                {TTS_VOICES.map((v) => (
                  <option key={v.name} value={v.name} className="bg-slate-900 text-slate-200">
                    Voice: {v.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Recite Master Button */}
            <button
              onClick={onReciteFullPoem}
              disabled={isLoadingTts}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-amber-900/50 hover:shadow-amber-800/70 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
            >
              {isLoadingTts ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Synthesizing TTS...</span>
                </>
              ) : isPlayingFullPoem ? (
                <>
                  <Pause className="w-5 h-5 fill-slate-950 text-slate-950" />
                  <span>Pause Recitation</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                  <span>Recite Full Poem</span>
                </>
              )}
            </button>

            {onOpenStudio && (
              <button
                onClick={onOpenStudio}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-600/50 hover:border-amber-400 text-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>✍️ کارگاه سرایش و دکلمه بلوچی</span>
              </button>
            )}
          </div>

          {/* Cultural thematic tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/70 border border-slate-800">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span>Makran Coastal & Storm Allegory</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/70 border border-slate-800">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Sarmachar & Heroic Fortitude</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/70 border border-slate-800">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mastering One's Own Destiny</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
