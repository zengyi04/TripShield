/** Canonical TripShield sky palette (matches Voya Sky preset). */
export const APP_TOP_HEX = '#9BBFE3';
export const APP_GRADIENT_MID_HEX = '#8EAFD2';

export const APP_GRADIENT_LOCATIONS: [number, number, number] = [0, 0.46, 1];

export function screenGradientStops(topColor: string, bottomColor: string): [string, string, string] {
  return [topColor, APP_GRADIENT_MID_HEX, bottomColor];
}

export const APP_TYPO = {
  screenTitle: 17,
  screenSubtitle: 11,
  sectionTitle: 16,
  body: 14,
  bodySmall: 13,
  caption: 12,
  micro: 11,
  labelCaps: 11,
} as const;

export const APP_COLORS = {
  textPrimary: '#0f172a',
  textSecondary: '#1f2937',
  textMuted: '#6b7280',
  textSoft: 'rgba(15,23,42,0.65)',
  accent: '#2563eb',
  accentDark: '#1e3a8a',
  border: '#E1EAF9',
  cardBorder: '#E6EEF5',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  chipBg: '#EFF6FF',
  chipBorder: '#DBEAFE',
} as const;
