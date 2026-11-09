import React, { useState, useEffect, useRef } from 'react';
import { Navbar, NavTabType } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PoemVerseCard } from './components/PoemVerseCard';
import { ManuscriptView } from './components/ManuscriptView';
import { CustomVoiceStudio } from './components/CustomVoiceStudio';
import { GeminiChatbot } from './components/GeminiChatbot';
import { CinematicVisualStudio } from './components/CinematicVisualStudio';
import { MusicStudio } from './components/MusicStudio';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { GlossaryModal } from './components/GlossaryModal';
import { PoetBioModal } from './components/PoetBioModal';
import { POEM_VERSES, GLOSSARY, Verse, TTS_VOICES } from './data/poem';
import { buildTtsPrompt, buildSingleVerseTtsPrompt, searchVerses, formatFullPoemText } from './utils/poemUtils';
import { requestSpeech } from './services/ttsService';
import { Search, Sparkles, Filter, Languages, RefreshCw, Volume2, Info, BookOpen } from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<NavTabType>('studio');
  const [fontSize, setFontSize] = useState<number>(24);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTransliteration, setShowTransliteration] = useState<boolean>(true);
  const [showEnglishInManuscript, setShowEnglishInManuscript] = useState<boolean>(true);

  // Modals state
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isBioOpen, setIsBioOpen] = useState<boolean>(false);
  const [selectedGlossaryWord, setSelectedGlossaryWord] = useState<string | null>(null);

  // Ambient sound state
  const [ambientPlaying, setAmbientPlaying] = useState<boolean>(false);

  // Audio & TTS recitation state
  const [selectedVoice, setSelectedVoice] = useState<string>('Fenrir');
  const [isLoadingTts, setIsLoadingTts] = useState<boolean>(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeVerseId, setActiveVerseId] = useState<number | null>(null);
  const [currentTrackLabel, setCurrentTrackLabel] = useState<string>('');
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.9);

  // HTML Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filtered verses based on search query
  const filteredVerses = searchVerses(searchQuery, POEM_VERSES);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Rough synchronous verse estimation for full recitation
      if (audio.duration && audio.duration > 0 && activeVerseId === null && isPlaying) {
        const progress = audio.currentTime / audio.duration;
        const estVerseIdx = Math.min(POEM_VERSES.length - 1, Math.floor(progress * POEM_VERSES.length));
        // We can highlight current progress
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setActiveVerseId(null);
    };

    const handleError = (e: any) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Update playback rate and volume when states change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = volume;
    }
  }, [playbackRate, volume]);

  /**
   * Recite the complete poem using gemini-3.8-flash-tts
   */
  const handleReciteFullPoem = async () => {
    if (isPlaying && activeVerseId === null) {
      // Pause if already playing full poem
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoadingTts(true);
    setTtsError(null);
    setCurrentTrackLabel('O Mardaaren Baloch (Complete Recitation)');
    setActiveVerseId(null);

    try {
      const voiceObj = TTS_VOICES.find((v) => v.name === selectedVoice);
      const stylePrompt = voiceObj?.stylePrompt;
      const fullText = formatFullPoemText(POEM_VERSES);

      const res = await requestSpeech(fullText, selectedVoice, stylePrompt);

      if (res.success && res.audioData && audioRef.current) {
        setAudioDataUrl(res.audioData);
        audioRef.current.src = res.audioData;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.volume = volume;
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        setTtsError(res.error || 'Failed to generate speech with Gemini 3.8 Flash TTS.');
      }
    } catch (err: any) {
      setTtsError(err.message || 'Error reciting poem.');
    } finally {
      setIsLoadingTts(false);
    }
  };

  /**
   * Recite an individual verse using gemini-3.8-flash-tts
   */
  const handlePlayVerse = async (verse: Verse) => {
    if (activeVerseId === verse.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoadingTts(true);
    setTtsError(null);
    setActiveVerseId(verse.id);
    setCurrentTrackLabel(`Verse ${verse.id}: ${verse.balochi.slice(0, 30)}...`);

    try {
      const singleVersePrompt = buildSingleVerseTtsPrompt(verse, selectedVoice);
      const res = await requestSpeech(
        singleVersePrompt.text,
        singleVersePrompt.voiceName,
        singleVersePrompt.stylePrompt
      );

      if (res.success && res.audioData && audioRef.current) {
        setAudioDataUrl(res.audioData);
        audioRef.current.src = res.audioData;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.volume = volume;
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        setTtsError(res.error || `Failed to recite verse ${verse.id}.`);
      }
    } catch (err: any) {
      setTtsError(err.message || `Error playing verse ${verse.id}`);
    } finally {
      setIsLoadingTts(false);
    }
  };

  /**
   * Play custom audio from CustomVoiceStudio
   */
  const handlePlayCustomAudio = async (url: string, label: string, voiceName: string) => {
    if (audioRef.current) {
      setAudioDataUrl(url);
      setCurrentTrackLabel(label);
      setSelectedVoice(voiceName);
      audioRef.current.src = url;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = volume;
      await audioRef.current.play();
      setIsPlaying(true);
      setActiveVerseId(null);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDismissAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setAudioDataUrl(null);
    setActiveVerseId(null);
  };

  const openGlossaryForWord = (word: string) => {
    setSelectedGlossaryWord(word);
    setIsGlossaryOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col baloch-pattern text-slate-100 pb-28">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGlossary={() => {
          setSelectedGlossaryWord(null);
          setIsGlossaryOpen(true);
        }}
        onOpenBio={() => setIsBioOpen(true)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        ambientPlaying={ambientPlaying}
        setAmbientPlaying={setAmbientPlaying}
      />

      {/* Hero Presentation & Master TTS Action */}
      <HeroSection
        onReciteFullPoem={handleReciteFullPoem}
        isPlayingFullPoem={isPlaying && activeVerseId === null}
        isLoadingTts={isLoadingTts}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        onExploreVerses={() => setActiveTab('cards')}
        onOpenStudio={() => setActiveTab('studio')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Error notification banner if any */}
        {ttsError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-700/60 text-sm text-rose-200 flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Recitation Notice</p>
                <p className="text-xs sm:text-sm text-rose-300">{ttsError}</p>
              </div>
            </div>
            <button
              onClick={() => setTtsError(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-semibold px-2 py-1 rounded bg-rose-900/40"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Couplets & Detailed Meaning */}
        {activeTab === 'cards' && (
          <section className="space-y-6">
            {/* Search & Display Options Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in Balochi, English, or terms..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Controls (Transliteration toggle, count) */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <input
                    type="checkbox"
                    checked={showTransliteration}
                    onChange={(e) => setShowTransliteration(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Roman Script</span>
                </label>

                <span className="text-xs font-mono text-slate-400">
                  Showing {filteredVerses.length} of {POEM_VERSES.length} couplets
                </span>
              </div>
            </div>

            {/* Verses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredVerses.map((verse) => (
                <PoemVerseCard
                  key={verse.id}
                  verse={verse}
                  fontSize={fontSize}
                  isActive={activeVerseId === verse.id}
                  isPlaying={isPlaying && activeVerseId === verse.id}
                  isLoadingTts={isLoadingTts && activeVerseId === verse.id}
                  onPlayVerse={handlePlayVerse}
                  onSelectGlossaryWord={openGlossaryForWord}
                  glossaryList={GLOSSARY}
                  showTransliteration={showTransliteration}
                />
              ))}
            </div>

            {filteredVerses.length === 0 && (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-base text-slate-300 font-semibold mb-1">No matching verses found</p>
                <p className="text-xs text-slate-500 mb-4">
                  Try searching with a different Balochi word or English phrase.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Reset Search
                </button>
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Classical Manuscript View */}
        {activeTab === 'manuscript' && (
          <section>
            <ManuscriptView
              verses={POEM_VERSES}
              activeVerseId={activeVerseId}
              isPlaying={isPlaying}
              onSelectVerse={handlePlayVerse}
              fontSize={fontSize}
              showEnglish={showEnglishInManuscript}
              setShowEnglish={setShowEnglishInManuscript}
              showTransliteration={showTransliteration}
              setShowTransliteration={setShowTransliteration}
            />
          </section>
        )}

        {/* Tab 3: Custom Voice Recitation Studio */}
        {activeTab === 'studio' && (
          <section>
            <CustomVoiceStudio onPlayCustomAudio={handlePlayCustomAudio} />
          </section>
        )}

        {/* Tab 4: Multi-turn Gemini Chatbot */}
        {activeTab === 'chat' && (
          <section>
            <GeminiChatbot onPlaySpeech={handlePlayCustomAudio} />
          </section>
        )}

        {/* Tab 5: Cinematic Visual Storyboard */}
        {activeTab === 'visual' && (
          <section>
            <CinematicVisualStudio
              onReciteDawnVerse={() => handlePlayVerse(POEM_VERSES[21])}
            />
          </section>
        )}

        {/* Tab 6: Balochi Traditional Music Studio */}
        {activeTab === 'music' && (
          <section>
            <MusicStudio />
          </section>
        )}
      </main>

      {/* Sticky Bottom Audio Player Bar */}
      {audioDataUrl && (
        <AudioPlayerBar
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onRestart={handleRestart}
          onClose={handleDismissAudio}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          playbackRate={playbackRate}
          onPlaybackRateChange={setPlaybackRate}
          volume={volume}
          onVolumeChange={setVolume}
          currentTrackLabel={currentTrackLabel}
          voiceName={selectedVoice}
          audioDataUrl={audioDataUrl}
        />
      )}

      {/* Modals */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        selectedWord={selectedGlossaryWord}
      />
      <PoetBioModal isOpen={isBioOpen} onClose={() => setIsBioOpen(false)} />
    </div>
  );
}
