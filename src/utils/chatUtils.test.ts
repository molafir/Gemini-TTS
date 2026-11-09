import test from 'node:test';
import assert from 'node:assert/strict';
import { formatConversationForGemini, CHAT_PERSONAS, ChatMessage } from './chatUtils';

test('CHAT_PERSONAS includes Naseer, Scholar, and Composer', () => {
  assert.equal(CHAT_PERSONAS.length, 3);
  const ids = CHAT_PERSONAS.map((p) => p.id);
  assert.ok(ids.includes('naseer'));
  assert.ok(ids.includes('scholar'));
  assert.ok(ids.includes('composer'));
});

test('formatConversationForGemini structures multi-turn history properly', () => {
  const history: ChatMessage[] = [
    { id: '1', role: 'user', text: 'Salam Mir Sahib', timestamp: 100 },
    { id: '2', role: 'model', text: 'Waja o ba-izzat-en dost!', timestamp: 200 },
  ];

  const contents = formatConversationForGemini(history, 'Tell me about the storm');
  assert.equal(contents.length, 3);
  assert.equal(contents[0].role, 'user');
  assert.equal(contents[0].parts[0].text, 'Salam Mir Sahib');
  assert.equal(contents[1].role, 'model');
  assert.equal(contents[1].parts[0].text, 'Waja o ba-izzat-en dost!');
  assert.equal(contents[2].role, 'user');
  assert.equal(contents[2].parts[0].text, 'Tell me about the storm');
});

test('All personas have valid system instructions and suggested prompts', () => {
  for (const persona of CHAT_PERSONAS) {
    assert.ok(persona.systemInstruction.length > 50, `System instruction for ${persona.id} should be substantial`);
    assert.ok(persona.suggestedPrompts.length >= 3, `Persona ${persona.id} should have suggestions`);
  }
});
