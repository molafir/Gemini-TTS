import { Verse, GlossaryItem } from '../data/poem';

export interface TtsRequestPayload {
  text: string;
  voiceName: string;
  stylePrompt: string;
  verseId?: number;
}

/**
 * Builds the text and speech guidance prompt for Gemini 3.8 Flash TTS recitation.
 * Includes natural poetic pauses, declamation cadence, and vocal cues.
 */
export function buildTtsPrompt(
  verses: Verse[],
  voiceName: string = 'Fenrir',
  customStyle?: string
): TtsRequestPayload {
  const poemLines = verses.map((v) => v.balochi).join('\n');
  const stylePrompt =
    customStyle ||
    'Declaim this classical heroic Balochi poem with deep passion, rhythmic poetic meter, authoritative pauses between couplets, and stirring vocal power.';

  return {
    text: poemLines,
    voiceName,
    stylePrompt,
  };
}

/**
 * Builds speech request for an individual verse with dramatic focus.
 */
export function buildSingleVerseTtsPrompt(
  verse: Verse,
  voiceName: string = 'Fenrir',
  customStyle?: string
): TtsRequestPayload {
  const stylePrompt =
    customStyle ||
    `Declaim this specific Balochi poetic line with clear emotional resonance and heroic cadence: ${verse.english}`;

  return {
    text: verse.balochi,
    voiceName,
    stylePrompt,
    verseId: verse.id,
  };
}

/**
 * Searches poem verses across Balochi script, transliteration, English, and keywords.
 */
export function searchVerses(query: string, verses: Verse[]): Verse[] {
  if (!query || query.trim() === '') return verses;
  const q = query.trim().toLowerCase();

  return verses.filter((v) => {
    return (
      v.balochi.includes(query.trim()) ||
      v.transliteration.toLowerCase().includes(q) ||
      v.english.toLowerCase().includes(q) ||
      v.explanation.toLowerCase().includes(q) ||
      v.keywords.some((k) => k.includes(query.trim()) || k.toLowerCase().includes(q))
    );
  });
}

/**
 * Finds all glossary items that appear in a given text or verse.
 */
export function findGlossaryMatches(text: string, glossary: GlossaryItem[]): GlossaryItem[] {
  if (!text) return [];
  return glossary.filter((item) => {
    return text.includes(item.word);
  });
}

/**
 * Generates the clean full Balochi text of the poem.
 */
export function formatFullPoemText(verses: Verse[]): string {
  return verses.map((v) => v.balochi).join('\n');
}

/**
 * Estimates recitation / reading time in seconds.
 */
export function calculateReadingTime(verses: Verse[]): { minutes: number; seconds: number; totalSeconds: number } {
  // Average heroic poetic couplet declamation is ~4.5 seconds per verse
  const totalSeconds = Math.round(verses.length * 4.5);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds, totalSeconds };
}
