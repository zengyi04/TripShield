// ──────────────────────────────────────────────────────────────────────────────
// TripShield · Feature 1: Decisive Buy Window & Smart Link Aggregator
// Mock frontend data — NO real APIs, NO backend
// ──────────────────────────────────────────────────────────────────────────────

// ─── Trip Overview ────────────────────────────────────────────────────────────

export interface MockTrip {
  id: string;
  destination: string;
  country: string;
  flag: string;
  dateRange: string;
  travelers: number;
  tripName: string;
  coverEmoji: string;
}

export const ACTIVE_TRIP: MockTrip = {
  id: 'trip-paris-2026',
  destination: 'Paris',
  country: 'France',
  flag: '🇫🇷',
  dateRange: 'Jun 14–19, 2026',
  travelers: 4,
  tripName: 'Paris with Friends',
  coverEmoji: '🗼',
};

// ─── Itinerary Items ──────────────────────────────────────────────────────────

export interface ItineraryItem {
  id: string;
  emoji: string;
  name: string;
  type: 'Activity' | 'Attraction' | 'Restaurant' | 'Area';
  location: string;
  date: string; // ISO date string
  price?: string;
  currency?: string;
}

export const ITINERARY_ITEMS: ItineraryItem[] = [
  {
    id: 'it-1',
    emoji: '🗼',
    name: 'Eiffel Tower',
    type: 'Attraction',
    location: 'Paris',
    date: '2026-06-14',
    price: '25',
    currency: '€',
  },
  {
    id: 'it-2',
    emoji: '🎨',
    name: 'Louvre Museum',
    type: 'Attraction',
    location: 'Paris',
    date: '2026-06-14',
    price: '22',
    currency: '€',
  },
  {
    id: 'it-3',
    emoji: '🚤',
    name: 'Seine River Cruise',
    type: 'Activity',
    location: 'Paris',
    date: '2026-06-15',
    price: '18',
    currency: '€',
  },
  {
    id: 'it-4',
    emoji: '🥐',
    name: 'Café de Flore',
    type: 'Restaurant',
    location: 'Saint-Germain, Paris',
    date: '2026-06-15',
  },
  {
    id: 'it-5',
    emoji: '🏘️',
    name: 'Montmartre',
    type: 'Area',
    location: 'Paris',
    date: '2026-06-16',
  },
];

// ─── AI Extraction Results (from pasted link) ─────────────────────────────────

export interface ExtractedItem {
  id: string;
  emoji: string;
  name: string;
  location: string;
  type: 'Activity' | 'Attraction' | 'Restaurant' | 'Area';
  price?: string;
  currency?: string;
  defaultSelected: boolean;
}

export const MOCK_EXTRACTED_ITEMS: ExtractedItem[] = [
  {
    id: 'ex-1',
    emoji: '🗼',
    name: 'Eiffel Tower',
    location: 'Paris',
    type: 'Activity',
    price: '25',
    currency: '€',
    defaultSelected: true,
  },
  {
    id: 'ex-2',
    emoji: '🎨',
    name: 'Louvre Museum',
    location: 'Paris',
    type: 'Attraction',
    price: '22',
    currency: '€',
    defaultSelected: true,
  },
  {
    id: 'ex-3',
    emoji: '🥐',
    name: 'Café de Flore',
    location: 'Paris',
    type: 'Restaurant',
    defaultSelected: true,
  },
  {
    id: 'ex-4',
    emoji: '🚤',
    name: 'Seine River Cruise',
    location: 'Paris',
    type: 'Activity',
    price: '18',
    currency: '€',
    defaultSelected: true,
  },
  {
    id: 'ex-5',
    emoji: '🏘️',
    name: 'Montmartre',
    location: 'Paris',
    type: 'Area',
    defaultSelected: false,
  },
];

// ─── AI Processing Steps ──────────────────────────────────────────────────────

export interface AIProcessingStep {
  id: string;
  label: string;
  durationMs: number; // cumulative ms before this step becomes 'done'
}

export const AI_PROCESSING_STEPS: AIProcessingStep[] = [
  { id: 'step-1', label: 'Link recognized', durationMs: 400 },
  { id: 'step-2', label: 'Destination identified', durationMs: 800 },
  { id: 'step-3', label: 'Travel information detected', durationMs: 1200 },
  { id: 'step-4', label: 'Building itinerary suggestions', durationMs: 1700 },
  { id: 'step-5', label: 'Checking booking opportunity', durationMs: 2100 },
];

// ─── Recently Imported Items ──────────────────────────────────────────────────

export interface ImportedLinkItem {
  id: string;
  emoji: string;
  name: string;
  category: string;
  location: string;
  source: string; // 'TikTok' | 'Instagram' | 'Skyscanner' | etc.
  importedAt: string; // relative time label
}

export const RECENTLY_IMPORTED: ImportedLinkItem[] = [
  {
    id: 'imp-1',
    emoji: '🗼',
    name: 'Eiffel Tower',
    category: 'Activity',
    location: 'Paris',
    source: 'TikTok',
    importedAt: '2 min ago',
  },
  {
    id: 'imp-2',
    emoji: '🎨',
    name: 'Louvre Museum',
    category: 'Attraction',
    location: 'Paris',
    source: 'TikTok',
    importedAt: '2 min ago',
  },
  {
    id: 'imp-3',
    emoji: '🚤',
    name: 'Seine River Cruise',
    category: 'Activity',
    location: 'Paris',
    source: 'TikTok',
    importedAt: '2 min ago',
  },
];

// ─── Buy Window Status ────────────────────────────────────────────────────────

export type BuyWindowStatus = 'FAVORABLE' | 'WATCH' | 'URGENT' | 'UNKNOWN';

export interface BuyWindow {
  id: string;
  route: string;
  origin: string;
  destination: string;
  price: string;
  currency: string;
  status: BuyWindowStatus;
  statusLabel: string;
  statusDescription: string;
  /** Unix timestamp (ms) when this buy window expires */
  expiresAt: number;
  referenceRange: string;
}

// Expires 47 hours + 32 minutes from "now" at demo time
const HOURS_47_32_IN_MS = (47 * 60 + 32) * 60 * 1000;

export const ACTIVE_BUY_WINDOWS: BuyWindow[] = [
  {
    id: 'bw-1',
    route: 'Kuala Lumpur → Paris',
    origin: 'KUL',
    destination: 'CDG',
    price: 'RM 2,850',
    currency: 'MYR',
    status: 'FAVORABLE',
    statusLabel: 'FAVORABLE',
    statusDescription:
      'Current price appears favorable compared with the reference range.',
    expiresAt: Date.now() + HOURS_47_32_IN_MS,
    referenceRange: 'RM 2,900 – RM 3,400',
  },
];

// ─── Booking Options ──────────────────────────────────────────────────────────

export interface BookingOption {
  id: string;
  platform: string;
  platformIcon: string;
  price: string;
  label: string;
  tag?: string;
  url: string; // frontend-only, no real navigation
}

export const BOOKING_OPTIONS: BookingOption[] = [
  {
    id: 'book-1',
    platform: 'Skyscanner',
    platformIcon: '✈️',
    price: 'RM 2,850',
    label: 'Best rate detected',
    tag: 'BEST DEAL',
    url: 'https://www.skyscanner.com',
  },
  {
    id: 'book-2',
    platform: 'Alternative option',
    platformIcon: '🛫',
    price: 'RM 2,910',
    label: 'Via third-party aggregator',
    url: 'https://www.booking.com/flights',
  },
];

// ─── Feature Summaries (for Home glance section) ──────────────────────────────

export interface FeatureSummary {
  id: 'buy-window' | 'consensus' | 'ledger' | 'self-healing';
  emoji: string;
  label: string;
  metric: string;
  sub?: string;
  statusColor: 'emerald' | 'amber' | 'blue' | 'slate';
}

export const FEATURE_SUMMARIES: FeatureSummary[] = [
  {
    id: 'buy-window',
    emoji: '🔥',
    label: 'Buy Window',
    metric: '2 opportunities',
    sub: '47h remaining',
    statusColor: 'amber',
  },
  {
    id: 'consensus',
    emoji: '👥',
    label: 'Consensus',
    metric: '3 decisions pending',
    statusColor: 'blue',
  },
  {
    id: 'ledger',
    emoji: '💰',
    label: 'Ledger',
    metric: 'RM 1,240 tracked',
    statusColor: 'emerald',
  },
  {
    id: 'self-healing',
    emoji: '🛟',
    label: 'Self-Healing',
    metric: 'Trip health 94',
    statusColor: 'emerald',
  },
];

// ─── AI Insight ───────────────────────────────────────────────────────────────

export const AI_INSIGHT = {
  message: '2 booking opportunities need your attention.',
  detail: 'Paris flights are at a 6-month low. The buy window closes in 47h.',
};
