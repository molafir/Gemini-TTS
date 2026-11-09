import React from 'react';
import {
  Volume2,
  VolumeX,
  BookOpen,
  User,
  Sparkles,
  Feather,
  ScrollText,
  Mic,
  MessageSquare,
  Film,
  Music,
} from 'lucide-react';
import { ambientSound } from '../utils/ambientSound';

export type NavTabType = 'cards' | 'manuscript' | 'studio' | 'chat' | 'visual' | 'music';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenGlossary: () => void;
  onOpenBio: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  ambientPlaying: boolean;
  setAmbientPlaying: (playing: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenGlossary,
  onOpenBio,
  fontSize,
  setFontSize,
  ambientPlaying,
  setAmbientPlaying,
}) => {
  const toggleAmbient = () => {
    const isNowPlaying = ambientSound.toggle();
    setAmbientPlaying(isNowPlaying);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0c0f17]/90 border-b border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Poetic Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse min-w-0 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950 flex items-center justify-center shadow-lg shadow-amber-900/30 border border-amber-500/40 shrink-0">
              <Feather className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-xs sm:text-base lg:text-lg text-amber-400 tracking-wide truncate">
                  Mardaaren Baloch
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-300">
                  او مڑا داریں بلوچ
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">
                Mir Gul Khan Naseer • Gemini 3.8 Flash TTS & Chat
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-[55vw] sm:max-w-none">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeTab === 'studio'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-bold shadow-md shadow-amber-900/40 ring-1 ring-amber-400'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800 border border-amber-600/30'
              }`}
              aria-label="Balochi Poetry & Reciter Studio"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>سرایش و دکلمه بلوچی (Studio)</span>
            </button>

            <button
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeTab === 'cards'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-label="Couplet Cards View"
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">دیوان شعر نصیر</span>
              <span className="lg:hidden">اشعار نصیر</span>
            </button>

            <button
              onClick={() => setActiveTab('manuscript')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeTab === 'manuscript'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-label="Manuscript Recitation View"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>نسخه خطی</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeTab === 'chat'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-label="Gemini Chatbot"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gemini Chat</span>
              <span className="sm:hidden">Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeTab === 'visual'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-label="Cinematic Visual Storyboard"
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Visual Story</span>
              <span className="sm:hidden">Visual</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeTab === 'music'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-label="Balochi Music Studio"
            >
              <Music className="w-3.5 h-3.5" />
              <span>Music</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Font zoom buttons */}
            <div className="hidden lg:flex items-center bg-slate-900/70 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-300">
              <button
                onClick={() => setFontSize(Math.max(18, fontSize - 2))}
                className="px-2 py-1 hover:text-amber-400 hover:bg-slate-800 rounded"
                title="Decrease font size"
                aria-label="Decrease font size"
              >
                A-
              </button>
              <span className="px-1 text-slate-500 font-mono text-[11px]">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(36, fontSize + 2))}
                className="px-2 py-1 hover:text-amber-400 hover:bg-slate-800 rounded"
                title="Increase font size"
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Ambient Soundscape Toggle */}
            <button
              onClick={toggleAmbient}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                ambientPlaying
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-900/40'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Ocean Storm & Drone Soundscape"
              aria-label="Toggle atmospheric soundscape"
            >
              {ambientPlaying ? (
                <>
                  <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="hidden xl:inline text-[11px] font-medium">Ambient Storm</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden xl:inline text-[11px] font-medium">Sea Ambience</span>
                </>
              )}
            </button>

            {/* Glossary Button */}
            <button
              onClick={onOpenGlossary}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Balochi Poetic Glossary"
              aria-label="Open poetic glossary dictionary"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Glossary</span>
            </button>

            {/* Poet Bio Button */}
            <button
              onClick={onOpenBio}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="About Mir Gul Khan Naseer"
              aria-label="About the poet"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">The Poet</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
