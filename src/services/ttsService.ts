export interface TtsResponse {
  success: boolean;
  audioData?: string; // data:audio/wav;base64,...
  mimeType?: string;
  voice?: string;
  model: string;
  error?: string;
}

// In-memory audio cache to prevent redundant API calls
const audioCache = new Map<string, string>();

export function clearAudioCache() {
  audioCache.clear();
}

export interface ComposedPoemVerse {
  balochi: string;
  transliteration: string;
  translation: string;
}

export interface ComposedPoem {
  title: string;
  poeticMeter?: string;
  dialect?: string;
  verses: ComposedPoemVerse[];
  fullBalochiText: string;
  explanation?: string;
  vocabulary?: Array<{ word: string; meaning: string }>;
}

export interface BalochiAnalysis {
  verses: ComposedPoemVerse[];
  optimizedRecitationText: string;
  phoneticGuide?: string;
  vocabulary?: Array<{ word: string; meaning: string }>;
}

export interface MultiSpeakerRole {
  id: string;
  name: string;
  voice: string;
  role: string;
  color?: string;
}

export interface MultiSpeakerSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  assignedVoice: string;
  balochiText: string;
  transliteration?: string;
  translation?: string;
  deliveryHint?: string;
}

export interface MultiSpeakerData {
  speakers: MultiSpeakerRole[];
  segments: MultiSpeakerSegment[];
}

/**
 * Request recitation audio from server-side gemini-3.8-flash-tts
 */
export async function requestSpeech(
  text: string,
  voiceName: string = 'Fenrir',
  stylePrompt?: string,
  isBalochi: boolean = true
): Promise<TtsResponse> {
  const cacheKey = `v2-pure::${voiceName}::${stylePrompt || 'default'}::${isBalochi}::${text.trim()}`;
  if (audioCache.has(cacheKey)) {
    return {
      success: true,
      audioData: audioCache.get(cacheKey)!,
      mimeType: 'audio/wav',
      voice: voiceName,
      model: 'gemini-3.8-flash-tts',
    };
  }

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceName,
        stylePrompt,
        isBalochi,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || `TTS synthesis failed with status ${res.status}`);
    }

    if (data.audioData) {
      audioCache.set(cacheKey, data.audioData);
    }

    return data;
  } catch (err: any) {
    console.error('TTS request error:', err);
    return {
      success: false,
      model: 'gemini-3.8-flash-tts',
      error: err.message || 'Failed to synthesize speech',
    };
  }
}

/**
 * Request AI Balochi poetry composition from gemini-3.8-flash
 */
export async function composeBalochiPoem(params: {
  theme: string;
  form?: string;
  dialect?: string;
  mood?: string;
  customTopic?: string;
  verseCount?: number;
}): Promise<{ success: boolean; poem?: ComposedPoem; error?: string }> {
  try {
    const res = await fetch('/api/compose-poem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to compose Balochi poetry');
    }
    return { success: true, poem: data.poem };
  } catch (err: any) {
    console.error('composeBalochiPoem error:', err);
    return { success: false, error: err.message || 'Poem generation failed' };
  }
}

/**
 * Request AI analysis, transliteration, and recitation optimization for custom Balochi text
 */
export async function analyzeBalochiText(text: string): Promise<{
  success: boolean;
  analysis?: BalochiAnalysis;
  error?: string;
}> {
  try {
    const res = await fetch('/api/analyze-balochi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to analyze Balochi text');
    }
    return { success: true, analysis: data.analysis };
  } catch (err: any) {
    console.error('analyzeBalochiText error:', err);
    return { success: false, error: err.message || 'Analysis failed' };
  }
}

/**
 * Request AI multi-speaker segmentation and tagging for Balochi poetry
 */
export async function tagMultiSpeakerPoem(params: {
  text: string;
  speakerCount?: number;
  mode?: string;
}): Promise<{ success: boolean; multiSpeakerData?: MultiSpeakerData; error?: string }> {
  try {
    const res = await fetch('/api/multi-speaker-tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to partition and tag poem for multi-speakers');
    }
    return { success: true, multiSpeakerData: data.multiSpeakerData };
  } catch (err: any) {
    console.error('tagMultiSpeakerPoem error:', err);
    return { success: false, error: err.message || 'Multi-speaker tagging failed' };
  }
}

/**
 * Downloads base64 audio data as a WAV file
 */
export function downloadAudioFile(audioDataUrl: string, filename: string = 'balochi-poetry-recitation.wav') {
  try {
    const link = document.createElement('a');
    link.href = audioDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error('Audio download failed:', e);
  }
}

/**
 * Browser Web Speech API fallback in case of missing keys or connectivity issues
 */
export function fallbackSpeechSynthesis(
  text: string,
  onEnd?: () => void,
  rate: number = 0.95
): { stop: () => void } {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return { stop: () => {} };
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 0.95;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return {
    stop: () => window.speechSynthesis.cancel(),
  };
}
