import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  estimateTokenCount,
  calculateTokenBudget,
  formatTokenUsage,
  TOKEN_LIMIT_PRESETS,
} from './tokenUtils';

describe('Token Utils & Budget Calculations', () => {
  it('returns 0 for empty or whitespace text', () => {
    assert.strictEqual(estimateTokenCount(''), 0);
    assert.strictEqual(estimateTokenCount('   \n\t  '), 0);
  });

  it('estimates English text appropriately', () => {
    const text = 'This is an English sentence for token estimation.';
    const tokens = estimateTokenCount(text);
    assert.ok(tokens >= 8 && tokens <= 18, `Expected reasonable token count, got ${tokens}`);
  });

  it('estimates Balochi/Persian script with higher density token weighting', () => {
    const balochiText = 'او مڑا داریں بلوچ! او سرمَچنڈیں نامدار';
    const tokens = estimateTokenCount(balochiText);
    assert.ok(tokens >= 10 && tokens <= 30, `Expected Balochi token count, got ${tokens}`);
  });

  it('calculates token budget accurately', () => {
    const budget = calculateTokenBudget(400, 1000);
    assert.strictEqual(budget.used, 400);
    assert.strictEqual(budget.limit, 1000);
    assert.strictEqual(budget.remaining, 600);
    assert.strictEqual(budget.percentage, 40);
    assert.strictEqual(budget.isNearLimit, false);
    assert.strictEqual(budget.isOverLimit, false);

    const nearLimitBudget = calculateTokenBudget(850, 1000);
    assert.strictEqual(nearLimitBudget.isNearLimit, true);
    assert.strictEqual(nearLimitBudget.isOverLimit, false);

    const overBudget = calculateTokenBudget(1100, 1000);
    assert.strictEqual(overBudget.remaining, 0);
    assert.strictEqual(overBudget.isOverLimit, true);
  });

  it('formats token usage metadata in Persian', () => {
    const usage = {
      promptTokenCount: 150,
      candidatesTokenCount: 350,
      totalTokenCount: 500,
    };
    const formatted = formatTokenUsage(usage);
    assert.ok(formatted.includes('توکن'));
    assert.ok(formatted.includes('ورودی'));
    assert.ok(formatted.includes('خروجی'));
  });

  it('provides standard token limit presets', () => {
    assert.strictEqual(TOKEN_LIMIT_PRESETS.length, 4);
    assert.strictEqual(TOKEN_LIMIT_PRESETS[0].tokens, 500);
    assert.strictEqual(TOKEN_LIMIT_PRESETS[1].tokens, 1000);
    assert.strictEqual(TOKEN_LIMIT_PRESETS[2].tokens, 2000);
    assert.strictEqual(TOKEN_LIMIT_PRESETS[3].tokens, 4000);
  });
});
