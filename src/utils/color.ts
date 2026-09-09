import { HSL, RGB } from '../types';

/**
 * Converts HEX string to RGB object
 */
export function hexToRgb(hex: string): RGB {
  let cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB to HEX string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Converts RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function hexToHsl(hex: string): HSL {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Derives a darker tone in the exact SAME color family (同一色系)
 * Strictly preserves the Hue (H), while reducing Lightness (L)
 * and slightly tuning Saturation (S) to maintain rich chroma without oversaturation.
 */
export function deriveDarkerTone(
  baseHex: string,
  options: {
    darknessDelta: number; // e.g. 32
    saturationDelta?: number; // e.g. -2 to +6
    targetHueShift?: number; // strictly 0 for same color family!
  }
): {
  hex: string;
  hsl: HSL;
} {
  const baseHsl = hexToHsl(baseHex);
  
  // Exact same color family: hue remains identically locked
  const hue = (baseHsl.h + (options.targetHueShift || 0) + 360) % 360;
  
  // Decrease lightness to make it darker
  const targetLightness = Math.max(12, Math.min(85, baseHsl.l - options.darknessDelta));
  
  // Keep saturation in the same aesthetic gamut
  const targetSaturation = Math.max(
    10,
    Math.min(95, baseHsl.s + (options.saturationDelta || 0))
  );

  const hex = hslToHex(hue, targetSaturation, targetLightness);
  return {
    hex,
    hsl: { h: hue, s: targetSaturation, l: targetLightness },
  };
}

/**
 * Derives a button color in the same color family
 */
export function deriveButtonTones(
  bottomHex: string,
  extraDarkness: number = 16
): {
  bg: string;
  hover: string;
  active: string;
  border: string;
  text: string;
} {
  const hsl = hexToHsl(bottomHex);
  const btnL = Math.max(10, hsl.l - extraDarkness);
  const btnSat = Math.max(15, hsl.s - 4); // slightly muted for button elegance
  
  const bg = hslToHex(hsl.h, btnSat, btnL);
  const hover = hslToHex(hsl.h, btnSat, Math.max(8, btnL - 5));
  const active = hslToHex(hsl.h, btnSat, Math.max(6, btnL - 8));
  const border = hslToHex(hsl.h, Math.min(90, btnSat + 10), Math.min(80, btnL + 10));

  return {
    bg,
    hover,
    active,
    border,
    text: '#FFFFFF',
  };
}

/**
 * Calculates WCAG 2.1 relative luminance
 */
function getRelativeLuminance(rgb: RGB): number {
  const a = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Computes contrast ratio between two hex colors (1:1 to 21:1)
 */
export function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Math.round(ratio * 10) / 10;
}
