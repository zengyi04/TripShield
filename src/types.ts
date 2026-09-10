export interface ColorPalette {
  name: string;
  topHex: string;
  originalBottomHex: string;
  description: string;
}

export interface HSL {
  h: number; // 0 - 360
  s: number; // 0 - 100
  l: number; // 0 - 100
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorHarmonyConfig {
  topColor: string;
  darknessAmount: number; // 15 to 60 percentage points drop
  saturationAdjust: number; // -15 to +15
  buttonDarkness: number; // additional darkening for buttons
  useHarmonized: boolean; // true = 同一色系 (same color family), false = screenshot mismatch
}

export type ActiveScreen = 'home' | 'welcome' | 'signup' | 'login' | 'dashboard' | 'self-healing';
