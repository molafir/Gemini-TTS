import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Play,
  Pause,
  Loader2,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  Volume2,
  Info,
  Check,
  Feather,
  BookOpen,
  Send,
  Languages,
  Copy,
  Wand2,
  VolumeX,
  Compass,
  FileText,
  Keyboard,
  Users,
  User,
  ArrowRightLeft,
  ChevronDown,
  RefreshCw,
  Radio,
  Music,
  Gauge,
  Cpu,
} from 'lucide-react';
import { TTS_VOICES, TTS_STYLES, POEM_VERSES, TtsStyle } from '../data/poem';
import {
  requestSpeech,
  downloadAudioFile,
  downloadAudioFileAsMp3,
  composeBalochiPoem,
  analyzeBalochiText,
  tagMultiSpeakerPoem,
  ComposedPoem,
  BalochiAnalysis,
  MultiSpeakerData,
  MultiSpeakerSegment,
  MultiSpeakerRole,
} from '../services/ttsService';
import {
  TOKEN_LIMIT_PRESETS,
  estimateTokenCount,
  formatTokenUsage,
  TokenUsageMetadata,
} from '../utils/tokenUtils';
import { TokenLimitControl } from './TokenLimitControl';

interface CustomVoiceStudioProps {
  onPlayCustomAudio: (audioUrl: string, trackLabel: string, voiceName: string) => void;
}

export const CustomVoiceStudio: React.FC<CustomVoiceStudioProps> = ({ onPlayCustomAudio }) => {
  // Studio Mode: 'compose' (Generate Balochi Poem) or 'recite' (Custom Text & Recitation)
  const [activeMode, setActiveMode] = useState<'compose' | 'recite'>('compose');

  // Speaker Mode: 'single' (تک بلندگو) or 'multi' (چند بلندگو)
  const [speakerMode, setSpeakerMode] = useState<'single' | 'multi'>('single');
  const [speakerCount, setSpeakerCount] = useState<number>(2);

  // ==================== COMPOSE STATE ====================
  const [theme, setTheme] = useState<string>('دلیری و غیرت بلوچ');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [poeticForm, setPoeticForm] = useState<string>('غزل و دو بیتی حماسی');
  const [dialect, setDialect] = useState<string>('مکرانی');
  const [mood, setMood] = useState<string>('حماسی و انگیزشی');
  const [verseCount, setVerseCount] = useState<number>(4);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [composedPoem, setComposedPoem] = useState<ComposedPoem | null>(null);

  // ==================== TOKEN LIMIT & USAGE STATE ====================
  const [maxOutputTokens, setMaxOutputTokens] = useState<number>(1000);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageMetadata | null>(null);

  // ==================== RECITE & TEXT STATE ====================
  const [inputText, setInputText] = useState<string>(
    'او مڑا داریں بلوچ! او سرمَچنڈیں نامدار\nنشتگئے پرچے او ورنا ! تو چو بیواک و نکار\nبئے گوں توپانءَ مُکابل، چِکّی تکدیرءِ مهار\nاے سیاهیں شپ نہ مانیت، نئے سیاهیں روزگار'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<BalochiAnalysis | null>(null);

  // ==================== MULTI-SPEAKER STATE ====================
  const [multiSpeakerData, setMultiSpeakerData] = useState<MultiSpeakerData | null>(null);
  const [isTaggingMulti, setIsTaggingMulti] = useState<boolean>(false);
  const [multiTagError, setMultiTagError] = useState<string | null>(null);
  const [activeMultiSegmentId, setActiveMultiSegmentId] = useState<string | null>(null);
  const [isMultiPlaying, setIsMultiPlaying] = useState<boolean>(false);
  const [loadingSegmentId, setLoadingSegmentId] = useState<string | null>(null);

  // Multi-speaker assigned voices dictionary { spk1: 'Charon', spk2: 'Puck', spk3: 'Aoede' }
  const [speakerVoices, setSpeakerVoices] = useState<Record<string, string>>({
    spk1: 'Charon',
    spk2: 'Puck',
    spk3: 'Aoede',
  });

  // Audio cache for segments to ensure instant playback & replay
  const segmentAudioCache = useRef<Map<string, string>>(new Map());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isMultiPlayingRef = useRef<boolean>(false);

  // ==================== SINGLE SPEAKER TTS STATE ====================
  const [selectedVoice, setSelectedVoice] = useState<string>('Fenrir');
  const [recitationStyle, setRecitationStyle] = useState<string>('epic');
  const [customStylePrompt, setCustomStylePrompt] = useState<string>(
    'Passionate, heroic Balochi master poet (شاهر) declaiming with majestic cadence, rolling r, and rhythmic dignity'
  );
  const [isLoadingSpeech, setIsLoadingSpeech] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Quick preset themes for generation
  const quickThemes = [
    { label: 'دلیری و غیرت بلوچ', prompt: 'درباره شجاعت، ایستادگی و تاریخ سرفراز قوم بلوچ' },
    { label: 'مکران و دریای چابهار', prompt: 'درباره دریای خروشان مکران، صیادان، بوجی و امواج چئول' },
    { label: 'بهار بلوچستان و کوه تفتان', prompt: 'درباره سرسبزی بهاران، نخلستان‌ها، نسیم کوهستان و شکوه تفتان' },
    { label: 'زهیروک و غربت', prompt: 'درباره سوز دلتنگی، نوای زهیروک و دوری از خاک پاک بلوچستان' },
    { label: 'پند و حکمت پیران', prompt: 'درباره اندرز بزرگان، ارزش خرد، یکدلی و غیرت جوانان' },
  ];

  // Quick Balochi special characters for easy keyboard typing
  const balochiLetters = ['ݔ', 'ۏ', 'ئے', 'ء', 'ڈ', 'ٹ', 'ڑ', 'ـہ', '،', '؟'];

  // Poetry Presets from classical bards
  const classicalPresets = [
    {
      poet: 'میر گل خان نصیر',
      title: 'او مڑا داریں بلوچ (آغاز شعر)',
      text: 'او مڑا داریں بلوچ! او سرمَچنڈیں نامدار\nنشتگئے پرچے او ورنا ! تو چو بیواک و نکار\nبئے گوں توپانءَ مُکابل، چِکّی تکدیرءِ مهار\nاے سیاهیں شپ نہ مانیت، نئے سیاهیں روزگار',
    },
    {
      poet: 'سید ظهور شاه هاشمی',
      title: 'ناکو پترو (زبان و ادب بلوچی)',
      text: 'منی زبانءَ را مَکَش اِت کہ زندگاں\nوتی ماتی زوانءِ نسیماں تْراں\nبلوچی زبان منی شرف و شان انت\nجهانءِ دیما منی نام و نشان انت',
    },
    {
      poet: 'عطا شاد',
      title: 'شپ سستگیں دار (شعر نو بلوچی)',
      text: 'شپ سستگیں دارءِ ساہ ءَ کپیت\nروچ شہمیت چو تلارءِ سر ءَ\nدلءَ تلوسیت ترانگیں امیت\nساه گوں وتی منزلءَ سر بیت',
    },
    {
      poet: 'ملا فاضل رند',
      title: 'کلاسیک مکرانی',
      text: 'شپءِ تهاریں جمبراں گوں گواتءَ یار بیت\nوتی دستءَ مدار ورنا کہ وخت چار بیت\nهمت کں و پاد آ گوں ورنائیں دلءَ\nمهرءِ چراگءَ رژنا کن گوں هوسلءَ',
    },
  ];

  // Insert special Balochi character into textarea
  const insertLetter = (char: string) => {
    setInputText((prev) => prev + char);
  };

  // Sync style prompt when recitationStyle changes
  useEffect(() => {
    const foundStyle = TTS_STYLES.find((s) => s.id === recitationStyle);
    if (foundStyle) {
      setCustomStylePrompt(foundStyle.prompt);
    }
  }, [recitationStyle]);

  // Handle switching to multi-speaker mode: Automatically tag and partition if not already done!
  const handleSpeakerModeChange = async (newMode: 'single' | 'multi') => {
    setSpeakerMode(newMode);
    if (newMode === 'multi') {
      const textToPartition =
        activeMode === 'compose' && composedPoem
          ? composedPoem.fullBalochiText
          : inputText;
      if (textToPartition.trim()) {
        await handleAutoTagMultiSpeaker(textToPartition, speakerCount);
      }
    }
  };

  // Automatic multi-speaker tagging and segmentation via AI
  const handleAutoTagMultiSpeaker = async (
    textToTag: string = inputText,
    speakers: number = speakerCount
  ) => {
    if (!textToTag.trim()) {
      setMultiTagError('متنی برای تقسیم‌بندی چند گوینده موجود نیست.');
      return;
    }

    setIsTaggingMulti(true);
    setMultiTagError(null);

    try {
      const res = await tagMultiSpeakerPoem({
        text: textToTag,
        speakerCount: speakers,
        mode: 'dialogue',
        maxOutputTokens,
      });

      if (res.success && res.multiSpeakerData) {
        setMultiSpeakerData(res.multiSpeakerData);
        if (res.usageMetadata) setTokenUsage(res.usageMetadata);
        // Initialize speaker voices map
        const newVoicesMap: Record<string, string> = {};
        res.multiSpeakerData.speakers.forEach((spk) => {
          newVoicesMap[spk.id] = spk.voice || (spk.id === 'spk1' ? 'Charon' : 'Puck');
        });
        setSpeakerVoices((prev) => ({ ...prev, ...newVoicesMap }));
      } else {
        setMultiTagError(res.error || 'خطا در تقسیم‌بندی و تگ‌گذاری شعر برای چند گوینده');
      }
    } catch (e: any) {
      setMultiTagError(e?.message || 'خطا در تحلیل چندصدایی');
    } finally {
      setIsTaggingMulti(false);
    }
  };

  // Handle AI Balochi Poetry Composition
  const handleComposePoem = async () => {
    setIsComposing(true);
    setComposeError(null);
    try {
      const res = await composeBalochiPoem({
        theme,
        customTopic,
        form: poeticForm,
        dialect,
        mood,
        verseCount,
        maxOutputTokens,
      });

      if (res.success && res.poem) {
        setComposedPoem(res.poem);
        if (res.usageMetadata) setTokenUsage(res.usageMetadata);
        setInputText(res.poem.fullBalochiText);

        // If currently in multi-speaker mode, immediately auto-tag the new poem!
        if (speakerMode === 'multi') {
          await handleAutoTagMultiSpeaker(res.poem.fullBalochiText, speakerCount);
        }
      } else {
        setComposeError(res.error || 'خطا در سرایش شعر بلوچی');
      }
    } catch (e: any) {
      setComposeError(e?.message || 'خطا در برقراری ارتباط با سرور');
    } finally {
      setIsComposing(false);
    }
  };

  // Handle Balochi text analysis (Phonetic & translation breakdown)
  const handleAnalyzeText = async () => {
    if (!inputText.trim()) {
      setAnalysisError('لطفاً ابتدا متنی برای بررسی وارد کنید.');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await analyzeBalochiText(inputText, maxOutputTokens);
      if (res.success && res.analysis) {
        setAnalysisResult(res.analysis);
        if (res.usageMetadata) setTokenUsage(res.usageMetadata);
      } else {
        setAnalysisError(res.error || 'خطا در تحلیل متن بلوچی');
      }
    } catch (e: any) {
      setAnalysisError(e?.message || 'خطا در تحلیل متن');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Synthesize and return audio data URL for a given piece of text and voice
  const getOrSynthesizeAudio = async (
    text: string,
    voice: string,
    stylePrompt?: string
  ): Promise<string> => {
    const cacheKey = `${voice}::${text.trim()}`;
    if (segmentAudioCache.current.has(cacheKey)) {
      return segmentAudioCache.current.get(cacheKey)!;
    }
    const res = await requestSpeech(text, voice, stylePrompt, true);
    if (!res.success || !res.audioData) {
      throw new Error(res.error || `خطا در تولید صوت برای صدای ${voice}`);
    }
    segmentAudioCache.current.set(cacheKey, res.audioData);
    return res.audioData;
  };

  // Play a single segment of the multi-speaker screenplay
  const handlePlaySingleSegment = async (segment: MultiSpeakerSegment) => {
    setLoadingSegmentId(segment.id);
    setMultiTagError(null);

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    setIsMultiPlaying(false);
    isMultiPlayingRef.current = false;

    try {
      const voice = speakerVoices[segment.speakerId] || segment.assignedVoice || 'Fenrir';
      const prompt = `Expressive Balochi reciter in role of ${segment.speakerName}. ${segment.deliveryHint || ''}`;
      const audioData = await getOrSynthesizeAudio(segment.balochiText, voice, prompt);

      setActiveMultiSegmentId(segment.id);
      const audio = new Audio(audioData);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setActiveMultiSegmentId(null);
      };
      audio.onerror = () => {
        setActiveMultiSegmentId(null);
      };

      await audio.play();
      onPlayCustomAudio(audioData, `${segment.speakerName}: ${segment.balochiText.slice(0, 30)}...`, voice);
    } catch (err: any) {
      setMultiTagError(err.message || 'خطا در دکلمه این بخش');
    } finally {
      setLoadingSegmentId(null);
    }
  };

  // Play all segments sequentially in multi-speaker screenplay
  const handlePlayAllMultiSegments = async () => {
    if (!multiSpeakerData || multiSpeakerData.segments.length === 0) return;

    if (isMultiPlaying) {
      // Pause
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      setIsMultiPlaying(false);
      isMultiPlayingRef.current = false;
      return;
    }

    setIsMultiPlaying(true);
    isMultiPlayingRef.current = true;
    setMultiTagError(null);

    const segments = multiSpeakerData.segments;

    for (let i = 0; i < segments.length; i++) {
      if (!isMultiPlayingRef.current) break;

      const seg = segments[i];
      setActiveMultiSegmentId(seg.id);
      setLoadingSegmentId(seg.id);

      try {
        const voice = speakerVoices[seg.speakerId] || seg.assignedVoice || 'Fenrir';
        const prompt = `Expressive Balochi poet reciting ${seg.speakerName} with cadence: ${seg.deliveryHint || 'solemn'}`;
        const audioData = await getOrSynthesizeAudio(seg.balochiText, voice, prompt);
        setLoadingSegmentId(null);

        if (!isMultiPlayingRef.current) break;

        await new Promise<void>((resolve, reject) => {
          const audio = new Audio(audioData);
          currentAudioRef.current = audio;

          audio.onended = () => resolve();
          audio.onerror = (e) => reject(e);

          audio.play().catch(reject);
          onPlayCustomAudio(audioData, `[${seg.speakerName}] ${seg.balochiText.slice(0, 30)}...`, voice);
        });
      } catch (err: any) {
        console.error('Multi recitation error on segment:', err);
        setMultiTagError(`خطا در دکلمه بخش ${i + 1}`);
        break;
      }
    }

    setIsMultiPlaying(false);
    isMultiPlayingRef.current = false;
    setActiveMultiSegmentId(null);
    setLoadingSegmentId(null);
  };

  // Toggle speaker assignment of a segment (e.g. switch spk1 <-> spk2)
  const handleToggleSegmentSpeaker = (segmentId: string) => {
    if (!multiSpeakerData) return;
    setMultiSpeakerData({
      ...multiSpeakerData,
      segments: multiSpeakerData.segments.map((seg) => {
        if (seg.id !== segmentId) return seg;
        const currentNum = parseInt(seg.speakerId.replace('spk', ''), 10) || 1;
        const nextNum = (currentNum % (multiSpeakerData.speakers.length || 2)) + 1;
        const nextSpkId = `spk${nextNum}`;
        const targetSpeaker = multiSpeakerData.speakers.find((s) => s.id === nextSpkId) || multiSpeakerData.speakers[0];
        return {
          ...seg,
          speakerId: nextSpkId,
          speakerName: targetSpeaker.name,
          assignedVoice: speakerVoices[nextSpkId] || targetSpeaker.voice,
        };
      }),
    });
  };

  // Handle Single Speaker Speech Recitation using gemini-3.8-flash-tts
  const handleReciteTextSingle = async (textToRecite: string, titleLabel: string = 'دکلمه بلوچی') => {
    if (!textToRecite.trim()) {
      setSpeechError('متن برای دکلمه نمی‌تواند خالی باشد.');
      return;
    }

    setIsLoadingSpeech(true);
    setSpeechError(null);

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    setIsPlaying(false);

    try {
      const res = await requestSpeech(textToRecite, selectedVoice, customStylePrompt, true);

      if (res.success && res.audioData) {
        setAudioUrl(res.audioData);

        const newAudio = new Audio(res.audioData);
        currentAudioRef.current = newAudio;
        newAudio.onended = () => setIsPlaying(false);
        newAudio.onerror = () => setIsPlaying(false);

        await newAudio.play();
        setIsPlaying(true);

        onPlayCustomAudio(res.audioData, titleLabel, selectedVoice);
      } else {
        setSpeechError(res.error || 'خطا در تولید دکلمه صوتی.');
      }
    } catch (err: any) {
      setSpeechError(err?.message || 'خطا در اتصال به سرور دکلمه Gemini 3.8 Flash TTS.');
    } finally {
      setIsLoadingSpeech(false);
    }
  };

  const togglePlayback = () => {
    if (!currentAudioRef.current) return;
    if (isPlaying) {
      currentAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      currentAudioRef.current.play();
      setIsPlaying(true);
    }
  };

  const [isDownloadingMp3, setIsDownloadingMp3] = useState<boolean>(false);

  const handleDownloadMp3 = async () => {
    if (!audioUrl || isDownloadingMp3) return;
    try {
      setIsDownloadingMp3(true);
      await downloadAudioFileAsMp3(audioUrl, `balochi-studio-${selectedVoice.toLowerCase()}.mp3`);
    } catch (e) {
      console.error('Download MP3 failed:', e);
      handleDownload();
    } finally {
      setIsDownloadingMp3(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      downloadAudioFile(audioUrl, `balochi-recitation-${selectedVoice.toLowerCase()}.wav`);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Studio Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-900/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>کارگاه هوشمند سرایش و دکلمه زبان بلوچی (تک گوینده و چند گوینده)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-100 flex items-center gap-3">
              <span>سرایش شعر و دکلمه دقیق به زبان بلوچی</span>
              <span className="text-sm font-normal text-amber-400 font-balochi">شاعری و وانگ</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              شعر یا متن بلوچی را بسرایید یا وارد کنید؛ با انتخاب حالت{' '}
              <strong className="text-amber-300 font-semibold">تک بلندگو</strong> یا{' '}
              <strong className="text-cyan-300 font-semibold">چند بلندگو (مناظره و همخوانی)</strong>، متن به
              صورت خودکار تقسیم‌بندی و تگ‌بندی شده و با ۶ صدای اصیل و سبک‌های گوناگون دکلمه می‌شود.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-400">موتور دکلمه آوایی</div>
              <div className="text-xs font-bold text-amber-400 font-mono">gemini-3.8-flash-tts</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>۲۴ کیلوهرتز • ۶ گوینده و ۷ سبک</span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Navigation & Speaker Mode Toggles */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main Action Mode Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveMode('compose')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeMode === 'compose'
                  ? 'bg-amber-600 text-slate-950 shadow-lg shadow-amber-900/40 ring-2 ring-amber-400/50'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>۱. سرایش شعر بلوچی (AI Composer)</span>
            </button>

            <button
              onClick={() => setActiveMode('recite')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeMode === 'recite'
                  ? 'bg-amber-600 text-slate-950 shadow-lg shadow-amber-900/40 ring-2 ring-amber-400/50'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>۲. متن و شعر دلخواه شما (Custom Text)</span>
            </button>
          </div>

          {/* SPEAKER MODE SELECTOR: تک بلندگو vs چند بلندگو */}
          <div className="flex items-center gap-2 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <span className="text-[11px] text-slate-400 px-2 font-medium">حالت دکلمه:</span>
            <button
              onClick={() => handleSpeakerModeChange('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                speakerMode === 'single'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>تک بلندگو (Single)</span>
            </button>

            <button
              onClick={() => handleSpeakerModeChange('multi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                speakerMode === 'multi'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-950/50'
                  : 'text-cyan-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>چند بلندگو (Multi-Speaker)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODE 1: BALOCHI POETRY GENERATOR (سرایش شعر بلوچی)
         ======================================================== */}
      {activeMode === 'compose' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm sm:text-base">
                <Feather className="w-4 h-4" />
                <span>تنظیمات سرایش شعر بلوچی</span>
              </div>
              <span className="text-xs text-slate-400">تولید هوشمند با زبان و اوزان اصیل بلوچی</span>
            </div>

            {/* Quick Themes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">
                موضوعات پیشنهادی و الهام‌بخش (کلیک برای انتخاب سریع):
              </label>
              <div className="flex flex-wrap gap-2">
                {quickThemes.map((qt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTheme(qt.label);
                      setCustomTopic(qt.prompt);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${
                      theme === qt.label
                        ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Topic Input */}
            <div className="space-y-2">
              <label htmlFor="custom-topic" className="text-xs font-semibold text-slate-300 block">
                موضوع یا ایده دلخواه شما برای شعر:
              </label>
              <input
                id="custom-topic"
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="مثال: درباره غیرت جوانان بلوچ در برابر طوفان حوادث و وفاداری به وطن..."
                className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 focus:outline-none placeholder:text-slate-600"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>موضوع دلخواه، واژگان خاص یا پیامی که مایلید در شعر باشد</span>
                <span className="text-amber-400">
                  تخمین توکن ورودی: ~{estimateTokenCount(customTopic || theme)} توکن
                </span>
              </div>
            </div>

            {/* Poetic Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Form */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">قالب شعری (تَهر):</label>
                <select
                  value={poeticForm}
                  onChange={(e) => setPoeticForm(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="غزل و دو بیتی حماسی">غزل و دو بیتی حماسی</option>
                  <option value="شعر چهارپاره کلاسیک بلوچی">شعر چهارپاره کلاسیک</option>
                  <option value="سرود رزمی و دلاورانه (لِیکو/حماسی)">سرود رزمی (لِیکو/حماسی)</option>
                  <option value="ترانه و تصنیف مردمی (لَری/سوت)">ترانه مردمی (لَری/سوت)</option>
                  <option value="شعر نو و آزاد بلوچی">شعر نو و آزاد بلوچی</option>
                </select>
              </div>

              {/* Dialect */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">گویش بلوچی (گوِشتن):</label>
                <select
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="مکرانی (جنوبی/ساحلی)">مکرانی (جنوبی/ساحلی)</option>
                  <option value="رخشانی و سرحدی (خاش، زاهدان، سراوان)">رخشانی و سرحدی</option>
                  <option value="سلیمانی و شرقی">سلیمانی و شرقی</option>
                </select>
              </div>

              {/* Mood */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">لحن و احساس (مُود):</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="حماسی و انگیزشی">حماسی و انگیزشی (شجاعت و غیرت)</option>
                  <option value="عاشقانه و لطیف">عاشقانه و دلنشین</option>
                  <option value="غمگنانه و سوزناک (زهیروک)">غمگنانه و سوزناک (زهیروک)</option>
                  <option value="پندآموز و خردورزانه">پندآموز و خردورزانه</option>
                </select>
              </div>

              {/* Verse Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">تعداد ابیات:</label>
                <select
                  value={verseCount}
                  onChange={(e) => setVerseCount(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value={2}>۲ بیت (دو بیتی کوتاه)</option>
                  <option value={4}>۴ بیت (قطعه متوسط)</option>
                  <option value={6}>۶ بیت (شعر بلندتر)</option>
                </select>
              </div>
            </div>

            {/* Token Limit Settings */}
            <TokenLimitControl
              value={maxOutputTokens}
              onChange={setMaxOutputTokens}
              usageMetadata={tokenUsage}
              title="محدودیت و سقف توکن سرایش شعر بلوچی (Token Limit)"
            />

            {/* Error banner */}
            {composeError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{composeError}</span>
              </div>
            )}

            {/* Compose Button */}
            <div className="flex items-center justify-end">
              <button
                onClick={handleComposePoem}
                disabled={isComposing}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all disabled:opacity-50"
              >
                {isComposing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال سرایش شعر بلوچی...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>سرایش شعر بلوچی با هوش مصنوعی</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Poem Result Display */}
          {composedPoem && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 border-2 border-amber-600/50 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-xs text-amber-500 font-semibold uppercase tracking-wider block">
                    شعر سروده شده:
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-balochi text-amber-300 mt-1">
                    {composedPoem.title}
                  </h3>
                  {composedPoem.poeticMeter && (
                    <p className="text-xs text-slate-400 mt-1">
                      وزن شعری: <span className="text-slate-300 font-mono">{composedPoem.poeticMeter}</span>
                    </p>
                  )}
                  {tokenUsage && tokenUsage.totalTokenCount && (
                    <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-emerald-400 w-fit">
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                      <span>مصرف توکن هوش مصنوعی: {formatTokenUsage(tokenUsage)}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {speakerMode === 'single' ? (
                    <button
                      onClick={() =>
                        handleReciteTextSingle(composedPoem.fullBalochiText, composedPoem.title || 'شعر بلوچی')
                      }
                      disabled={isLoadingSpeech}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
                    >
                      {isLoadingSpeech ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                      <span>دکلمه فوری این شعر (تک گوینده)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAutoTagMultiSpeaker(composedPoem.fullBalochiText, speakerCount)}
                      disabled={isTaggingMulti}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-all"
                    >
                      {isTaggingMulti ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                      <span>تگ‌بندی و دکلمه چند بلندگو</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(composedPoem.fullBalochiText, 'composed-poem')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="کپی متن شعر"
                  >
                    {copiedSection === 'composed-poem' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Verses List with Transliteration and Translation */}
              <div className="space-y-4">
                {composedPoem.verses.map((v, i) => (
                  <div
                    key={i}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-700/40 transition-all space-y-2.5"
                  >
                    {/* Verse Number & Action */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono">بیت {i + 1}</span>
                      <button
                        onClick={() => handleReciteTextSingle(v.balochi, `بیت ${i + 1} از ${composedPoem.title}`)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>شنیدن این بیت</span>
                      </button>
                    </div>

                    {/* Balochi Original Script */}
                    <div className="font-balochi text-xl sm:text-2xl text-amber-100 text-right leading-loose selection:bg-amber-600/30">
                      {v.balochi}
                    </div>

                    {/* Romanized Phonetic Transliteration */}
                    {v.transliteration && (
                      <div className="text-xs sm:text-sm text-cyan-300/80 font-mono italic text-left pl-2 border-l-2 border-cyan-800/40">
                        {v.transliteration}
                      </div>
                    )}

                    {/* Persian Translation */}
                    {v.translation && (
                      <div className="text-xs sm:text-sm text-slate-300 text-right pt-1 border-t border-slate-800/60 leading-relaxed">
                        <span className="text-slate-500 font-semibold ml-1">معنی:</span>
                        {v.translation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Poetic Commentary & Explanation */}
              {composedPoem.explanation && (
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 space-y-1 text-right">
                  <div className="font-semibold text-amber-400 flex items-center gap-1.5 justify-end">
                    <span>شرح و تشبیهات شعر</span>
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <p className="leading-relaxed text-slate-400">{composedPoem.explanation}</p>
                </div>
              )}

              {/* Vocabulary Chips */}
              {composedPoem.vocabulary && composedPoem.vocabulary.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 block text-right">
                    واژه‌نامه و لغات اصیل این شعر:
                  </label>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {composedPoem.vocabulary.map((voc, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-1.5"
                      >
                        <span className="font-balochi text-amber-300 text-sm">{voc.word}</span>
                        <span className="text-slate-500">:</span>
                        <span className="text-slate-300 text-[11px]">{voc.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODE 2: CUSTOM BALOCHI TEXT & RECITER
         ======================================================== */}
      {activeMode === 'recite' && (
        <div className="space-y-6">
          {/* Classical presets buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block">
              یا از اشعار نامدار و ماندگار بلوچستان انتخاب کنید:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {classicalPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(p.text);
                    setAnalysisResult(null);
                    setMultiSpeakerData(null);
                    if (speakerMode === 'multi') {
                      handleAutoTagMultiSpeaker(p.text, speakerCount);
                    }
                  }}
                  className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-600/40 text-right transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-amber-500 font-semibold">{p.poet}</span>
                  </div>
                  <div className="font-semibold text-xs text-slate-200 group-hover:text-amber-300 truncate">
                    {p.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Virtual Balochi Characters Bar */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-amber-400" />
                <span>حروف و نشانه‌های ویژه خط بلوچی (کلیک برای درج در متن):</span>
              </span>
              <span className="text-[11px] text-slate-500">ݔ، ۏ، ئے، ء، ڈ، ٹ، ڑ</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {balochiLetters.map((char) => (
                <button
                  key={char}
                  onClick={() => insertLetter(char)}
                  className="w-9 h-9 rounded-lg bg-slate-950 hover:bg-amber-600 hover:text-slate-950 border border-slate-700 font-balochi text-lg text-amber-200 transition-all flex items-center justify-center font-bold"
                  title={`درج ${char}`}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea for custom poem */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="custom-balochi-input" className="text-xs font-semibold text-slate-300">
                متن شعر بلوچی شما برای دکلمه و خوانش:
              </label>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-[11px] text-amber-300">
                  تخمین: ~{estimateTokenCount(inputText)} توکن
                </span>
                <span>•</span>
                <span>{inputText.split('\n').filter((l) => l.trim()).length} سطر</span>
                <span>•</span>
                <span className="font-mono">{inputText.length} کاراکتر</span>
              </div>
            </div>

            <textarea
              id="custom-balochi-input"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setMultiSpeakerData(null);
              }}
              rows={6}
              dir="rtl"
              className="w-full p-4 sm:p-5 rounded-2xl bg-slate-900/95 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 text-slate-100 font-balochi text-xl sm:text-2xl placeholder:text-slate-600 focus:outline-none transition-all leading-loose shadow-inner text-right"
              placeholder="شعر یا متن بلوچی را در این کادر بنویسید یا الصاق کنید..."
            />
          </div>

          {/* Token Limit Settings for Mode 2 */}
          <TokenLimitControl
            value={maxOutputTokens}
            onChange={setMaxOutputTokens}
            usageMetadata={tokenUsage}
            title="محدودیت و سقف توکن تحلیل، ترجمه و تقسیم‌بندی (Token Limit)"
          />

          {/* Analysis / Phonetic Helper Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleAnalyzeText}
              disabled={isAnalyzing || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>تحلیل آوایی، لاتین‌نویسی و معنی فارسی با هوش مصنوعی</span>
            </button>

            <button
              onClick={() => {
                setInputText('');
                setMultiSpeakerData(null);
              }}
              className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
            >
              پاک کردن کادر
            </button>
          </div>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-800/50 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>راهنمای آوایی و ترجمه متن شما</span>
                </span>
                {analysisResult.phoneticGuide && (
                  <span className="text-[11px] text-slate-400">{analysisResult.phoneticGuide}</span>
                )}
              </div>

              <div className="space-y-3">
                {analysisResult.verses.map((v, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <div className="font-balochi text-lg text-amber-200 text-right">{v.balochi}</div>
                    {v.transliteration && (
                      <div className="text-xs text-cyan-300 font-mono text-left">{v.transliteration}</div>
                    )}
                    {v.translation && (
                      <div className="text-xs text-slate-400 text-right border-t border-slate-800/50 pt-1">
                        معنی: {v.translation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MULTI-SPEAKER SCREENPLAY & TAGGING SECTION
          (هر موقع چند بلندگو انتخاب می‌شود خودکار تقسیم‌بندی و تگ‌بندی می‌کند)
         ======================================================== */}
      {speakerMode === 'multi' && (
        <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-2 border-cyan-600/40 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-base sm:text-lg">
                <Users className="w-5 h-5" />
                <span>دکلمه نمایشی چند بلندگو (تگ‌بندی هوشمند دیوان)</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                متن شعر به صورت خودکار به بخش‌های گفت‌وگویی، پرسش و پاسخ و مصرع‌های متقابل تقسیم‌بندی شده است.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Speaker Count Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 px-1">تعداد گویندگان:</span>
                <button
                  onClick={() => {
                    setSpeakerCount(2);
                    handleAutoTagMultiSpeaker(
                      activeMode === 'compose' && composedPoem ? composedPoem.fullBalochiText : inputText,
                      2
                    );
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    speakerCount === 2
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ۲ گوینده
                </button>
                <button
                  onClick={() => {
                    setSpeakerCount(3);
                    handleAutoTagMultiSpeaker(
                      activeMode === 'compose' && composedPoem ? composedPoem.fullBalochiText : inputText,
                      3
                    );
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    speakerCount === 3
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ۳ گوینده
                </button>
              </div>

              {/* Re-Tag Button */}
              <button
                onClick={() =>
                  handleAutoTagMultiSpeaker(
                    activeMode === 'compose' && composedPoem ? composedPoem.fullBalochiText : inputText,
                    speakerCount
                  )
                }
                disabled={isTaggingMulti}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium flex items-center gap-1.5 border border-cyan-800/50 transition-all disabled:opacity-50"
              >
                {isTaggingMulti ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>تقسیم‌بندی مجدد</span>
              </button>
            </div>
          </div>

          {/* Speakers Voice Customizer Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {multiSpeakerData?.speakers.map((spk, idx) => (
              <div
                key={spk.id}
                className={`p-3.5 rounded-2xl bg-slate-950/80 border transition-all ${
                  spk.id === 'spk1'
                    ? 'border-amber-500/40'
                    : spk.id === 'spk2'
                    ? 'border-cyan-500/40'
                    : 'border-purple-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        spk.id === 'spk1'
                          ? 'bg-amber-600 text-slate-950'
                          : spk.id === 'spk2'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{spk.name}</div>
                      <div className="text-[10px] text-slate-500">{spk.role}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">انتخاب صدای گوینده:</label>
                  <select
                    value={speakerVoices[spk.id] || spk.voice}
                    onChange={(e) => {
                      setSpeakerVoices({
                        ...speakerVoices,
                        [spk.id]: e.target.value,
                      });
                    }}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    {TTS_VOICES.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Loading or Error */}
          {isTaggingMulti && (
            <div className="p-8 rounded-2xl bg-slate-950/50 border border-slate-800 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-200">
                در حال تقسیم‌بندی و تگ‌بندی هوشمند متن برای چند بلندگو...
              </div>
              <div className="text-xs text-slate-500">
                تفکیک مصرع‌ها، تعیین لحن شاهرها و تخصیص نقش‌های پیر و جوان
              </div>
            </div>
          )}

          {multiTagError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{multiTagError}</span>
            </div>
          )}

          {/* Multi-Speaker Tagged Segments List */}
          {multiSpeakerData && !isTaggingMulti && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>تعداد بخش‌های تگ‌خورده: {multiSpeakerData.segments.length} سطر</span>
                <span className="text-[11px] text-slate-500">برای تغییر گوینده هر سطر، روی دکمه «تغییر گوینده» کلیک کنید</span>
              </div>

              {multiSpeakerData.segments.map((seg, idx) => {
                const isCurrentPlaying = activeMultiSegmentId === seg.id;
                const isCurrentLoading = loadingSegmentId === seg.id;
                const currentVoice = speakerVoices[seg.speakerId] || seg.assignedVoice;

                return (
                  <div
                    key={seg.id}
                    className={`p-4 sm:p-5 rounded-2xl transition-all border ${
                      isCurrentPlaying
                        ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-500/30'
                        : seg.speakerId === 'spk1'
                        ? 'bg-slate-950/80 border-amber-900/40 hover:border-amber-700/60'
                        : seg.speakerId === 'spk2'
                        ? 'bg-slate-950/80 border-cyan-900/40 hover:border-cyan-700/60'
                        : 'bg-slate-950/80 border-purple-900/40 hover:border-purple-700/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                            seg.speakerId === 'spk1'
                              ? 'bg-amber-600/30 text-amber-300 border border-amber-600/40'
                              : seg.speakerId === 'spk2'
                              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-600/40'
                              : 'bg-purple-600/30 text-purple-300 border border-purple-600/40'
                          }`}
                        >
                          {seg.speakerName} ({currentVoice})
                        </span>

                        {seg.deliveryHint && (
                          <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                            لحن: {seg.deliveryHint}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Speaker Button */}
                        <button
                          onClick={() => handleToggleSegmentSpeaker(seg.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition-colors"
                          title="تغییر گوینده این بخش"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>تغییر گوینده</span>
                        </button>

                        {/* Listen Single Segment Button */}
                        <button
                          onClick={() => handlePlaySingleSegment(seg)}
                          disabled={isCurrentLoading}
                          className="px-3 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-all border border-amber-600/30"
                        >
                          {isCurrentLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                          <span>دکلمه این بخش</span>
                        </button>
                      </div>
                    </div>

                    {/* Balochi Text */}
                    <div className="font-balochi text-xl sm:text-2xl text-slate-100 text-right leading-loose selection:bg-cyan-600/30">
                      {seg.balochiText}
                    </div>

                    {/* Transliteration & Translation */}
                    {seg.transliteration && (
                      <div className="text-xs text-cyan-300/80 font-mono italic text-left pl-2 border-l border-cyan-800/40 mt-2">
                        {seg.transliteration}
                      </div>
                    )}
                    {seg.translation && (
                      <div className="text-xs text-slate-400 text-right mt-1">
                        معنی: {seg.translation}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Master Play All Multi-Speaker Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handlePlayAllMultiSegments}
                  disabled={isTaggingMulti}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-700 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-cyan-950/60 transition-all disabled:opacity-50"
                >
                  {isMultiPlaying ? (
                    <>
                      <Pause className="w-5 h-5 fill-white" />
                      <span>توقف دکلمه چندصدایی</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-white" />
                      <span>پخش پیوسته و کامل دکلمه چندصدایی (نمایشی)</span>
                    </>
                  )}
                </button>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>دکلمه متناوب با صداهای تخصصی پیر و جوان</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SINGLE-SPEAKER RECITER ENGINE CONFIGURATION
          (تمام سبک‌ها و صداهای متنوع)
         ======================================================== */}
      {speakerMode === 'single' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm sm:text-base">
              <Mic className="w-4 h-4" />
              <span>تنظیمات گوینده و سبک دکلمه بلوچی (Gemini 3.8 Flash TTS)</span>
            </div>
            <span className="text-xs text-emerald-400 font-mono">طبیعی، شفاف و دقیق</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Voice Persona Selector (All 6 voices) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                <span>انتخاب صدای گوینده (۶ گوینده):</span>
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
              >
                {TTS_VOICES.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.label} — {v.tone}
                  </option>
                ))}
              </select>
            </div>

            {/* Recitation Style (All 7 styles) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>سبک و لحن خوانش (۷ سبک):</span>
              </label>
              <select
                value={recitationStyle}
                onChange={(e) => setRecitationStyle(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
              >
                {TTS_STYLES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Voice Style Prompt */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>دستور لحن (Style Prompt):</span>
              </label>
              <input
                type="text"
                value={customStylePrompt}
                onChange={(e) => setCustomStylePrompt(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                placeholder="e.g. Heroic, dramatic orator with solemn cadence"
              />
            </div>
          </div>

          {/* Style description tip */}
          {(() => {
            const currentStyleObj = TTS_STYLES.find((s) => s.id === recitationStyle);
            return currentStyleObj ? (
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <strong className="text-amber-400 ml-1">توضیح سبک:</strong>
                {currentStyleObj.description}
              </div>
            ) : null;
          })()}

          {/* Speech Error */}
          {speechError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{speechError}</span>
            </div>
          )}

          {/* Master Recite Button & Audio Deck */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              onClick={() =>
                handleReciteTextSingle(
                  activeMode === 'compose' && composedPoem ? composedPoem.fullBalochiText : inputText,
                  'دکلمه شعر بلوچی'
                )
              }
              disabled={
                isLoadingSpeech ||
                !(activeMode === 'compose' && composedPoem ? composedPoem.fullBalochiText : inputText).trim()
              }
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-amber-950/50 transition-all disabled:opacity-50"
            >
              {isLoadingSpeech ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال تولید دکلمه صوتی با Gemini 3.8 Flash TTS...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 fill-slate-950" />
                  <span>شروع دکلمه شعر با زبان و تلفظ دقیق بلوچی</span>
                </>
              )}
            </button>

            {/* Player controls if audio is ready */}
            {audioUrl && (
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2.5 rounded-2xl shadow-lg">
                <button
                  onClick={togglePlayback}
                  className="p-3 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-md"
                  title={isPlaying ? 'توقف' : 'پخش'}
                  aria-label={isPlaying ? 'توقف' : 'پخش'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-slate-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-slate-950" />
                  )}
                </button>

                <div className="px-2">
                  <div className="text-xs font-semibold text-slate-200">صوت دکلمه آماده است</div>
                  <div className="text-[10px] text-amber-400 font-mono">کیفیت استودیویی • MP3 / WAV</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleDownloadMp3}
                    disabled={isDownloadingMp3}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-75"
                    title="دانلود فایل صوتی با فرمت MP3"
                    aria-label="دانلود MP3"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloadingMp3 ? 'در حال تبدیل MP3...' : 'دانلود MP3'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors border border-slate-800 text-[11px] font-mono"
                    title="دانلود فایل صوتی خام WAV"
                    aria-label="دانلود WAV"
                  >
                    WAV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
