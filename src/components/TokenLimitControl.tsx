import React from 'react';
import { Gauge, Cpu, Check, Sparkles, Sliders } from 'lucide-react';
import {
  TOKEN_LIMIT_PRESETS,
  TokenUsageMetadata,
  formatTokenUsage,
} from '../utils/tokenUtils';

interface TokenLimitControlProps {
  value: number;
  onChange: (val: number) => void;
  usageMetadata?: TokenUsageMetadata | null;
  title?: string;
  className?: string;
}

export const TokenLimitControl: React.FC<TokenLimitControlProps> = ({
  value,
  onChange,
  usageMetadata,
  title = 'محدودیت توکن خروجی هوش مصنوعی (Token Limit)',
  className = '',
}) => {
  const currentPreset = TOKEN_LIMIT_PRESETS.find((p) => p.tokens === value);

  return (
    <div className={`p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 ${className}`} dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{title}</span>
        </div>

        {/* Current Value Badge & Actual Usage */}
        <div className="flex items-center gap-2">
          {usageMetadata && usageMetadata.totalTokenCount && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-medium text-emerald-300">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>مصرف واقعی: {formatTokenUsage(usageMetadata)}</span>
            </div>
          )}

          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 font-mono text-xs font-bold text-amber-300">
            {value.toLocaleString('fa-IR')} توکن
          </span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TOKEN_LIMIT_PRESETS.map((preset) => {
          const isSelected = value === preset.tokens;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.tokens)}
              className={`p-2 rounded-xl text-right transition-all border flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-600/20 border-amber-500/70 text-amber-200 shadow-sm shadow-amber-950/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs">{preset.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-500">
                <span>{preset.tokens.toLocaleString('fa-IR')} توکن</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Slider Control */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>حداقل (۲۵۰ توکن)</span>
          <span className="text-slate-500 text-[10px]">
            {currentPreset ? currentPreset.description : `سقف اختصاصی ${value} توکن خروجی`}
          </span>
          <span>حداکثر (۴۰۰۰ توکن)</span>
        </div>
        <input
          type="range"
          min={250}
          max={4000}
          step={50}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          aria-label="سقف توکن هوش مصنوعی"
        />
      </div>
    </div>
  );
};
