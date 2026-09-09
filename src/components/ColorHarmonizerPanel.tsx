import React, { useState } from 'react';
import {
  Palette,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  Eye,
  Sparkles,
  Smartphone,
  Layers,
  Code,
} from 'lucide-react';
import { ColorPalette, ColorHarmonyConfig } from '../types';
import { COLOR_PRESETS } from '../data/colorPresets';
import { hexToHsl, calculateContrastRatio } from '../utils/color';

interface ColorHarmonizerPanelProps {
  config: ColorHarmonyConfig;
  onChangeConfig: (newConfig: ColorHarmonyConfig) => void;
  topColor: string;
  bottomColor: string;
  originalBottomColor: string;
  buttonBg: string;
  contrastRatio: number;
  showPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
}

export const ColorHarmonizerPanel: React.FC<ColorHarmonizerPanelProps> = ({
  config,
  onChangeConfig,
  topColor,
  bottomColor,
  originalBottomColor,
  buttonBg,
  contrastRatio,
  showPhoneFrame,
  onTogglePhoneFrame,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const topHsl = hexToHsl(topColor);
  const bottomHsl = hexToHsl(bottomColor);
  const originalHsl = hexToHsl(originalBottomColor);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSelectPreset = (preset: ColorPalette) => {
    onChangeConfig({
      ...config,
      topColor: preset.topHex,
    });
  };

  const codeSnippet = `/* Unified Monochromatic Theme (同一色系) */
:root {
  --voya-top-bg: ${topColor};      /* HSL(${topHsl.h}°, ${topHsl.s}%, ${topHsl.l}%) */
  --voya-bottom-bg: ${bottomColor};   /* HSL(${bottomHsl.h}°, ${bottomHsl.s}%, ${bottomHsl.l}%) */
  --voya-btn-bg: ${buttonBg};
}

/* Tailwind CSS arbitrary values */
.top-header {
  background-color: ${topColor};
}
.bottom-card {
  background-color: ${bottomColor};
  border-top-left-radius: 2.5rem;
  border-top-right-radius: 2.5rem;
}`;

  return (
    <div
      className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 shadow-xl flex flex-col gap-6 text-slate-800"
      id="color-harmonizer-panel"
    >
      {/* Panel Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                同一色系 · Color Harmonizer
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Deriving darker bottom background strictly from the top color
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <button
          onClick={onTogglePhoneFrame}
          id="toggle-phone-frame-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
        >
          <Smartphone size={14} />
          {showPhoneFrame ? 'Frameless View' : 'Phone Frame'}
        </button>
      </div>

      {/* Main Aesthetic Toggle: Harmonized vs Original */}
      <div className="flex flex-col gap-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Aesthetic Mode
          </span>
          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
            <Sparkles size={13} />
            {config.useHarmonized ? 'Harmonized Family Active' : 'Showing Screenshot Color'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => onChangeConfig({ ...config, useHarmonized: true })}
            id="toggle-harmonized-mode"
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              config.useHarmonized
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            <CheckCircle2 size={16} />
            同一色系 (Harmonized)
          </button>

          <button
            onClick={() => onChangeConfig({ ...config, useHarmonized: false })}
            id="toggle-original-mode"
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !config.useHarmonized
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 ring-2 ring-amber-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            <AlertTriangle size={16} />
            Original Screenshot
          </button>
        </div>

        {/* Explain the difference */}
        <p className="text-[12px] text-slate-600 leading-relaxed mt-1">
          {config.useHarmonized ? (
            <span className="text-emerald-700 font-medium">
              ✓ <strong>Hue matched ({topHsl.h}°)</strong>: Bottom color is darkened mathematically from the top background color, keeping saturation balanced so the entire interface stays in one coherent color family.
            </span>
          ) : (
            <span className="text-amber-800 font-medium">
              ⚠ <strong>Screenshot Discrepancy</strong>: Top is soft pastel blue (Hue {topHsl.h}°, Sat {topHsl.s}%), while original bottom was an electric cyan-blue (Hue {originalHsl.h}°, Sat {originalHsl.s}%).
            </span>
          )}
        </p>
      </div>

      {/* Live Color Chips & Contrast Inspection */}
      <div className="grid grid-cols-2 gap-3">
        {/* Top Color Chip */}
        <div className="border border-slate-200/70 rounded-2xl p-3 bg-white shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Above BG (Base)</span>
            <button
              onClick={() => copyToClipboard(topColor, 'top')}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Copy HEX"
            >
              {copiedKey === 'top' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl shadow-inner border border-black/10 shrink-0"
              style={{ backgroundColor: topColor }}
            />
            <div className="overflow-hidden">
              <div className="font-mono font-bold text-xs text-slate-900">{topColor}</div>
              <div className="text-[11px] text-slate-500 font-medium">
                H:{topHsl.h}° S:{topHsl.s}% L:{topHsl.l}%
              </div>
            </div>
          </div>
        </div>

        {/* Below Color Chip */}
        <div className="border border-slate-200/70 rounded-2xl p-3 bg-white shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Below BG (Darker)</span>
            <button
              onClick={() => copyToClipboard(bottomColor, 'bottom')}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Copy HEX"
            >
              {copiedKey === 'bottom' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl shadow-inner border border-black/10 shrink-0"
              style={{ backgroundColor: bottomColor }}
            />
            <div className="overflow-hidden">
              <div className="font-mono font-bold text-xs text-slate-900">{bottomColor}</div>
              <div className="text-[11px] text-slate-500 font-medium">
                H:{bottomHsl.h}° S:{bottomHsl.s}% L:{bottomHsl.l}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Harmony Metric Bar */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 flex items-center justify-around text-center">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Hue Shift (ΔH)
          </span>
          <span
            className={`text-sm font-extrabold ${
              Math.abs(topHsl.h - bottomHsl.h) === 0 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {Math.abs(topHsl.h - bottomHsl.h)}° {Math.abs(topHsl.h - bottomHsl.h) === 0 ? '(Pure 同一色系)' : '(Drift)'}
          </span>
        </div>
        <div className="w-[1px] h-8 bg-slate-200" />
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Lightness Drop (ΔL)
          </span>
          <span className="text-sm font-extrabold text-blue-600">
            -{topHsl.l - bottomHsl.l}% Darker
          </span>
        </div>
        <div className="w-[1px] h-8 bg-slate-200" />
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            WCAG Text Contrast
          </span>
          <span className="text-sm font-extrabold text-emerald-600">
            {contrastRatio}:1 (AA/AAA)
          </span>
        </div>
      </div>

      {/* Preset Palettes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers size={14} />
            Color Family Presets (色系预设)
          </label>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {COLOR_PRESETS.map(preset => {
            const isSelected = topColor.toLowerCase() === preset.topHex.toLowerCase();
            return (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200/70 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg shadow-sm border border-black/10"
                  style={{ backgroundColor: preset.topHex }}
                />
                <span className="text-[11px] font-semibold text-slate-700 truncate w-full text-center">
                  {preset.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fine-Tuning Controls */}
      <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sliders size={14} />
            Tonal Fine-Tuning
          </span>
          <button
            onClick={() =>
              onChangeConfig({
                ...config,
                darknessAmount: 32,
                saturationAdjust: 0,
                buttonDarkness: 16,
              })
            }
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        {/* Custom Color Input */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={topColor}
              onChange={e => onChangeConfig({ ...config, topColor: e.target.value })}
              className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
              id="custom-color-picker"
            />
            <span className="text-xs font-bold text-slate-700">Custom Base Color</span>
          </div>
          <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            {topColor}
          </span>
        </div>

        {/* Darkness Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>Darkness Level (Lightness Reduction)</span>
            <span className="font-bold text-blue-600">-{config.darknessAmount}%</span>
          </div>
          <input
            type="range"
            min="15"
            max="60"
            value={config.darknessAmount}
            onChange={e =>
              onChangeConfig({ ...config, darknessAmount: parseInt(e.target.value, 10) })
            }
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            id="darkness-slider"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Subtle (-15%)</span>
            <span>Balanced (-32%)</span>
            <span>Deep Midnight (-60%)</span>
          </div>
        </div>

        {/* Saturation Adjustment */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>Saturation Tuning</span>
            <span className="font-bold text-blue-600">
              {config.saturationAdjust > 0 ? `+${config.saturationAdjust}%` : `${config.saturationAdjust}%`}
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            value={config.saturationAdjust}
            onChange={e =>
              onChangeConfig({ ...config, saturationAdjust: parseInt(e.target.value, 10) })
            }
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            id="saturation-slider"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Muted (-20%)</span>
            <span>Strict Lock (0%)</span>
            <span>Rich (+20%)</span>
          </div>
        </div>
      </div>

      {/* Export / CSS Snippet */}
      <div className="pt-2">
        <button
          onClick={() => setShowCodeModal(!showCodeModal)}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Code size={15} />
          {showCodeModal ? 'Hide CSS & Color Tokens' : 'View CSS & Color Tokens'}
        </button>

        {showCodeModal && (
          <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto relative">
            <button
              onClick={() => copyToClipboard(codeSnippet, 'code')}
              className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'code' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              Copy
            </button>
            <pre className="text-[11px] leading-relaxed">{codeSnippet}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
