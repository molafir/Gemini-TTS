import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTtsPrompt,
  buildSingleVerseTtsPrompt,
  searchVerses,
  findGlossaryMatches,
  calculateReadingTime,
} from './poemUtils';
import { POEM_VERSES, GLOSSARY } from '../data/poem';

test('buildTtsPrompt aggregates all poem lines and sets voice', () => {
  const result = buildTtsPrompt(POEM_VERSES.slice(0, 3), 'Fenrir');
  assert.equal(result.voiceName, 'Fenrir');
  assert.ok(result.text.includes('او مڑا داریں بلوچ'));
  assert.ok(result.text.includes('نشتگئے پرچے او ورنا'));
  assert.ok(result.text.includes('بستگئے دستان وتی'));
  assert.ok(result.stylePrompt.length > 10);
});

test('buildSingleVerseTtsPrompt creates targeted request for a verse', () => {
  const verse = POEM_VERSES[0];
  const result = buildSingleVerseTtsPrompt(verse, 'Puck');
  assert.equal(result.verseId, 1);
  assert.equal(result.voiceName, 'Puck');
  assert.equal(result.text, 'او مڑا داریں بلوچ! او سرمَچنڈیں نامدار');
});

test('searchVerses filters correctly by English keyword', () => {
  const matches = searchVerses('destiny', POEM_VERSES);
  assert.ok(matches.length >= 2, 'Should find destiny verses');
  assert.ok(matches.some((v) => v.id === 12));
  assert.ok(matches.some((v) => v.id === 20));
});

test('searchVerses filters correctly by Balochi word', () => {
  const matches = searchVerses('توپان', POEM_VERSES);
  assert.ok(matches.length >= 2, 'Should find storm (toofan) verses');
  assert.ok(matches.some((v) => v.id === 4));
});

test('findGlossaryMatches identifies words present in verse', () => {
  const verseText = POEM_VERSES[0].balochi; // "او مڑا داریں بلوچ! او سرمَچنڈیں نامدار"
  const matches = findGlossaryMatches(verseText, GLOSSARY);
  assert.ok(matches.length >= 2);
  const words = matches.map((m) => m.word);
  assert.ok(words.includes('مڑا داریں'));
  assert.ok(words.includes('سرمَچنڈیں'));
});

test('calculateReadingTime returns sensible duration', () => {
  const { minutes, seconds, totalSeconds } = calculateReadingTime(POEM_VERSES);
  assert.ok(totalSeconds > 60);
  assert.equal(minutes, Math.floor(totalSeconds / 60));
  assert.equal(seconds, totalSeconds % 60);
});
