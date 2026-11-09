export interface TokenUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export interface TokenLimitPreset {
  id: string;
  label: string;
  tokens: number;
  description: string;
}

export const TOKEN_LIMIT_PRESETS: TokenLimitPreset[] = [
  {
    id: 'compact',
    label: 'کوتاه و سریع',
    tokens: 500,
    description: 'مناسب دو بیتی، پاسخ‌های خلاصه و حداقل مصرف توکن',
  },
  {
    id: 'standard',
    label: 'استاندارد و متعادل',
    tokens: 1000,
    description: 'بهترین تعادل برای غزل ۴ بیتی، معنی و دکلمه',
  },
  {
    id: 'extended',
    label: 'جامع و کامل',
    tokens: 2000,
    description: 'مناسب اشعار ۶ بیتی، شرح ادبی مفصل و لغت‌نامه',
  },
  {
    id: 'maximum',
    label: 'حداکثر ظرفیت',
    tokens: 4000,
    description: 'برای اشعار طولانی و تحلیل همه‌جانبه زبانی',
  },
];

/**
 * Estimates token count for text.
 * For English, ~4 chars per token.
 * For Balochi / Persian / Arabic scripts (UTF-8 multi-byte), tokenizers typically produce ~1 token per 2 to 2.5 characters.
 */
export function estimateTokenCount(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  const trimmed = text.trim();
  // Count non-ASCII characters (Arabic/Balochi/Persian script)
  let nonAsciiCount = 0;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed.charCodeAt(i) > 127) {
      nonAsciiCount++;
    }
  }

  const asciiCount = trimmed.length - nonAsciiCount;
  // Non-ASCII tokens ~ 1 token per 2 characters
  const nonAsciiTokens = Math.ceil(nonAsciiCount / 2.2);
  // ASCII tokens ~ 1 token per 4 characters
  const asciiTokens = Math.ceil(asciiCount / 4.0);

  return Math.max(1, nonAsciiTokens + asciiTokens);
}

/**
 * Calculates remaining tokens and percentage of budget used.
 */
export function calculateTokenBudget(usedEstimatedTokens: number, limit: number): {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
} {
  const safeLimit = Math.max(100, limit);
  const remaining = Math.max(0, safeLimit - usedEstimatedTokens);
  const percentage = Math.min(100, Math.round((usedEstimatedTokens / safeLimit) * 100));

  return {
    used: usedEstimatedTokens,
    limit: safeLimit,
    remaining,
    percentage,
    isNearLimit: percentage >= 80 && percentage < 100,
    isOverLimit: usedEstimatedTokens > safeLimit,
  };
}

/**
 * Formats token usage metadata into a human-readable Persian string.
 */
export function formatTokenUsage(usage?: TokenUsageMetadata): string {
  if (!usage || typeof usage.totalTokenCount !== 'number') {
    return '';
  }

  const total = usage.totalTokenCount;
  const prompt = usage.promptTokenCount ?? 0;
  const candidate = usage.candidatesTokenCount ?? 0;

  if (prompt > 0 && candidate > 0) {
    return `${total.toLocaleString('fa-IR')} توکن (ورودی: ${prompt.toLocaleString('fa-IR')} | خروجی: ${candidate.toLocaleString('fa-IR')})`;
  }

  return `${total.toLocaleString('fa-IR')} توکن`;
}
