// ──────────────────────────────────────────────────────────────────────────────
// TripShield · Decisive Buy Window & Smart Link Aggregator
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

// ─── Decision State ───────────────────────────────────────────────────────────

export type DecisionState = 'BUY_NOW' | 'WAIT' | 'WATCH' | 'URGENT' | 'UNKNOWN';

export interface DecisionStateConfig {
  label: string;
  shortLabel: string;
  emoji: string;
  description: string;
  dotColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
}

export const DECISION_STATE_CONFIG: Record<DecisionState, DecisionStateConfig> = {
  BUY_NOW: {
    label: 'Good time to book',
    shortLabel: 'BUY NOW',
    emoji: '🟢',
    description: 'Current price is favorable. Booking now reduces your risk.',
    dotColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  WAIT: {
    label: 'Price may improve',
    shortLabel: 'WAIT',
    emoji: '🟡',
    description: 'Prices have been trending down. Waiting may yield a better deal.',
    dotColor: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
  WATCH: {
    label: 'Keep monitoring',
    shortLabel: 'WATCH',
    emoji: '🟠',
    description: 'Price is in the middle of the reference range. Monitor for changes.',
    dotColor: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
  },
  URGENT: {
    label: 'Opportunity may expire soon',
    shortLabel: 'URGENT',
    emoji: '🔥',
    description: 'This deal is expiring soon. Act quickly to lock this price.',
    dotColor: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
  },
  UNKNOWN: {
    label: 'Not enough information',
    shortLabel: 'UNKNOWN',
    emoji: '⚪',
    description: 'TripShield needs more data to make a recommendation.',
    dotColor: 'bg-slate-400',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-600',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
  },
};

// ─── Confidence Factors ───────────────────────────────────────────────────────

export interface ConfidenceFactor {
  id: string;
  text: string;
  type: 'positive' | 'warning';
}

export const MOCK_CONFIDENCE_FACTORS: ConfidenceFactor[] = [
  { id: 'cf-1', text: 'Current price is below the recent reference range', type: 'positive' },
  { id: 'cf-2', text: 'Direct flights are currently available', type: 'positive' },
  { id: 'cf-3', text: 'Travel date is within 90 days', type: 'positive' },
  { id: 'cf-4', text: 'Trip.com has an active RM50 offer', type: 'positive' },
  { id: 'cf-5', text: 'Similar flights have recently increased in price', type: 'warning' },
];

// ─── Buy Window Status (legacy compat) ────────────────────────────────────────

export type BuyWindowStatus = 'FAVORABLE' | 'WATCH' | 'URGENT' | 'UNKNOWN';

export interface BuyWindow {
  id: string;
  route: string;
  origin: string;
  destination: string;
  price: string;
  priceNumeric: number;
  currency: string;
  status: BuyWindowStatus;
  statusLabel: string;
  statusDescription: string;
  /** Unix timestamp (ms) when this buy window expires */
  expiresAt: number;
  referenceRange: string;
  referenceRangeLow: number;
  referenceRangeHigh: number;
  // Enhanced fields
  decisionState: DecisionState;
  confidence: number;
  airline: string;
  flightDuration: string;
  stops: number;
  baggage: string;
  travelDates: string;
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
    priceNumeric: 2850,
    currency: 'MYR',
    status: 'FAVORABLE',
    statusLabel: 'FAVORABLE',
    statusDescription:
      'Current price appears favorable compared with the reference range.',
    expiresAt: Date.now() + HOURS_47_32_IN_MS,
    referenceRange: 'RM 2,900 – RM 3,300',
    referenceRangeLow: 2900,
    referenceRangeHigh: 3300,
    decisionState: 'BUY_NOW',
    confidence: 87,
    airline: 'AirAsia X',
    flightDuration: '7h 10m',
    stops: 0,
    baggage: '20kg',
    travelDates: 'Jun 14–19, 2026',
  },
];

// ─── Flight Options (Airline Comparison) ──────────────────────────────────────

export interface FlightOption {
  id: string;
  airline: string;
  airlineIcon: string;
  flightDuration: string;
  stops: number;
  stopDescription?: string;
  baggage: string;
  price: number;
  priceFormatted: string;
  priceDiff?: string;
  isBestValue?: boolean;
}

export const MOCK_FLIGHT_OPTIONS: FlightOption[] = [
  {
    id: 'fl-1',
    airline: 'AirAsia X',
    airlineIcon: '✈️',
    flightDuration: '7h 10m',
    stops: 0,
    baggage: '20kg',
    price: 2800,
    priceFormatted: 'RM 2,800',
    isBestValue: true,
  },
  {
    id: 'fl-2',
    airline: 'Malaysia Airlines',
    airlineIcon: '🛫',
    flightDuration: '7h 05m',
    stops: 0,
    baggage: '25kg',
    price: 3120,
    priceFormatted: 'RM 3,120',
    priceDiff: '+RM 320',
  },
  {
    id: 'fl-3',
    airline: 'Singapore Airlines',
    airlineIcon: '🌏',
    flightDuration: '9h 30m',
    stops: 1,
    stopDescription: 'via Singapore (SIN)',
    baggage: '25kg',
    price: 3450,
    priceFormatted: 'RM 3,450',
    priceDiff: '+RM 650',
  },
];

// ─── Booking Platforms ────────────────────────────────────────────────────────

export interface BookingPlatform {
  id: string;
  platform: string;
  platformIcon: string;
  price: number;
  priceFormatted: string;
  priceDiff?: string;
  label: string;
  tag?: string;
  voucher?: string;
  hasDirectFlight: boolean;
  baggage: string;
  url: string;
  /** Score for "Best Value" sort (higher = better) */
  valueScore: number;
  /** Flight duration in minutes for "Fastest" sort */
  durationMinutes: number;
  /** Baggage in kg for "Baggage" sort */
  baggageKg: number;
}

export const MOCK_BOOKING_PLATFORMS: BookingPlatform[] = [
  {
    id: 'bp-1',
    platform: 'Trip.com',
    platformIcon: '🌐',
    price: 2800,
    priceFormatted: 'RM 2,800',
    label: 'RM 50 cheaper than Traveloka',
    tag: 'BEST DEAL',
    voucher: 'RM50 voucher available',
    hasDirectFlight: true,
    baggage: '20kg',
    url: 'https://www.trip.com',
    valueScore: 95,
    durationMinutes: 430,
    baggageKg: 20,
  },
  {
    id: 'bp-2',
    platform: 'Traveloka',
    platformIcon: '🔵',
    price: 2850,
    priceFormatted: 'RM 2,850',
    priceDiff: '+RM 50',
    label: 'Popular choice',
    hasDirectFlight: true,
    baggage: '20kg',
    url: 'https://www.traveloka.com',
    valueScore: 82,
    durationMinutes: 430,
    baggageKg: 20,
  },
  {
    id: 'bp-3',
    platform: 'Skyscanner',
    platformIcon: '✈️',
    price: 2875,
    priceFormatted: 'RM 2,875',
    priceDiff: '+RM 75',
    label: 'Via aggregator',
    hasDirectFlight: true,
    baggage: '20kg',
    url: 'https://www.skyscanner.com',
    valueScore: 78,
    durationMinutes: 430,
    baggageKg: 20,
  },
  {
    id: 'bp-4',
    platform: 'Airline Direct',
    platformIcon: '🛫',
    price: 2920,
    priceFormatted: 'RM 2,920',
    priceDiff: '+RM 120',
    label: 'Book directly with airline',
    hasDirectFlight: true,
    baggage: '25kg',
    url: 'https://www.airasia.com',
    valueScore: 74,
    durationMinutes: 430,
    baggageKg: 25,
  },
];

// Legacy compat
export interface BookingOption {
  id: string;
  platform: string;
  platformIcon: string;
  price: string;
  label: string;
  tag?: string;
  url: string;
}

export const BOOKING_OPTIONS: BookingOption[] = MOCK_BOOKING_PLATFORMS.map(bp => ({
  id: bp.id,
  platform: bp.platform,
  platformIcon: bp.platformIcon,
  price: bp.priceFormatted,
  label: bp.label,
  tag: bp.tag,
  url: bp.url,
}));

// ─── Vouchers & Promotions ────────────────────────────────────────────────────

export interface Voucher {
  id: string;
  name: string;
  platform: string;
  discount: number;
  discountFormatted: string;
  expiresInMs: number;
  description: string;
}

export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'v-1',
    name: 'Trip.com voucher',
    platform: 'Trip.com',
    discount: 50,
    discountFormatted: 'RM 50',
    expiresInMs: (18 * 60 + 24) * 60 * 1000, // 18h 24m
    description: 'Flight booking discount — auto-applied at checkout',
  },
  {
    id: 'v-2',
    name: 'Member promotion',
    platform: 'Trip.com',
    discount: 20,
    discountFormatted: 'RM 20',
    expiresInMs: (72 * 60) * 60 * 1000, // 72h
    description: 'First-time member signup bonus',
  },
];

// ─── Price History ────────────────────────────────────────────────────────────

export interface PricePoint {
  day: number; // days ago (0 = today)
  price: number;
}

export const MOCK_PRICE_HISTORY: PricePoint[] = [
  { day: 30, price: 3050 },
  { day: 28, price: 3020 },
  { day: 26, price: 3100 },
  { day: 24, price: 3150 },
  { day: 22, price: 3200 },
  { day: 20, price: 3350 },
  { day: 18, price: 3400 },
  { day: 16, price: 3380 },
  { day: 14, price: 3300 },
  { day: 12, price: 3250 },
  { day: 10, price: 3100 },
  { day: 8, price: 3000 },
  { day: 7, price: 2950 },
  { day: 6, price: 2920 },
  { day: 5, price: 2900 },
  { day: 4, price: 2880 },
  { day: 3, price: 2870 },
  { day: 2, price: 2860 },
  { day: 1, price: 2840 },
  { day: 0, price: 2800 },
];

// ─── Price Breakdown ──────────────────────────────────────────────────────────

export interface PriceBreakdownItem {
  id: string;
  label: string;
  amount: number;
  amountFormatted: string;
  isDiscount?: boolean;
}

export const MOCK_PRICE_BREAKDOWN: PriceBreakdownItem[] = [
  { id: 'pb-1', label: 'Base fare', amount: 2430, amountFormatted: 'RM 2,430' },
  { id: 'pb-2', label: 'Taxes & fees', amount: 320, amountFormatted: 'RM 320' },
  { id: 'pb-3', label: 'Baggage (20kg)', amount: 100, amountFormatted: 'RM 100' },
  { id: 'pb-4', label: 'Trip.com voucher', amount: -50, amountFormatted: '-RM 50', isDiscount: true },
];

export const MOCK_PRICE_BREAKDOWN_TOTAL = {
  amount: 2800,
  amountFormatted: 'RM 2,800',
};

// ─── Season Info ──────────────────────────────────────────────────────────────

export type SeasonType = 'PEAK' | 'SHOULDER' | 'OFF_PEAK';

export interface SeasonInfo {
  type: SeasonType;
  label: string;
  emoji: string;
  description: string;
  typicalRange: string;
  typicalRangeLow: number;
  typicalRangeHigh: number;
  reasons: string[];
  insight: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export const MOCK_SEASON_INFO: SeasonInfo = {
  type: 'SHOULDER',
  label: 'Shoulder Season',
  emoji: '🟡',
  description: 'Your dates fall outside the busiest travel period.',
  typicalRange: 'RM 2,700 – RM 3,100',
  typicalRangeLow: 2700,
  typicalRangeHigh: 3100,
  reasons: ['European summer shoulder period', 'Before peak July/August season'],
  insight: 'Your current price is within a favorable range for this season.',
  badgeBg: 'bg-amber-100',
  badgeText: 'text-amber-800',
  borderColor: 'border-amber-200',
};

// ─── Wait vs Buy Scenario ─────────────────────────────────────────────────────

export interface WaitScenario {
  buyNow: {
    price: number;
    priceFormatted: string;
    benefits: string[];
  };
  wait7Days: {
    rangeLow: number;
    rangeHigh: number;
    rangeFormatted: string;
    potentialSaving: string;
    potentialIncrease: string;
  };
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export const MOCK_WAIT_SCENARIO: WaitScenario = {
  buyNow: {
    price: 2800,
    priceFormatted: 'RM 2,800',
    benefits: [
      'Price locked in',
      'Current voucher available',
      'Direct flight available',
    ],
  },
  wait7Days: {
    rangeLow: 2750,
    rangeHigh: 3250,
    rangeFormatted: 'RM 2,750 – RM 3,250',
    potentialSaving: 'up to RM 50',
    potentialIncrease: 'up to RM 450',
  },
  recommendation: 'Buying now reduces your risk. The potential saving from waiting is small compared with the potential increase.',
  riskLevel: 'medium',
};

// ─── Price Risk ───────────────────────────────────────────────────────────────

export interface PriceRisk {
  level: 'low' | 'moderate' | 'high';
  label: string;
  description: string;
  /** 0-100 position on the meter */
  position: number;
}

export const MOCK_PRICE_RISK: PriceRisk = {
  level: 'low',
  label: 'LOW RISK',
  description: 'Current price is relatively favorable compared with the reference range.',
  position: 30,
};

// ─── Alternative Dates ────────────────────────────────────────────────────────

export interface AlternativeDate {
  id: string;
  label: string;
  dateShift: string;
  price: number;
  priceFormatted: string;
  saving?: string;
  isBest?: boolean;
}

export const MOCK_ALTERNATIVE_DATES: AlternativeDate[] = [
  {
    id: 'alt-1',
    label: '1 day earlier',
    dateShift: 'Jun 13–18',
    price: 2670,
    priceFormatted: 'RM 2,670',
    saving: 'Save RM 130',
  },
  {
    id: 'alt-2',
    label: 'Your dates',
    dateShift: 'Jun 14–19',
    price: 2800,
    priceFormatted: 'RM 2,800',
  },
  {
    id: 'alt-3',
    label: '1 day later',
    dateShift: 'Jun 15–20',
    price: 2750,
    priceFormatted: 'RM 2,750',
    saving: 'Save RM 50',
  },
  {
    id: 'alt-4',
    label: '2 days later',
    dateShift: 'Jun 16–21',
    price: 2590,
    priceFormatted: 'RM 2,590',
    saving: 'Save RM 210',
    isBest: true,
  },
];

// ─── Flexibility Score ────────────────────────────────────────────────────────

export interface FlexibilityScore {
  score: number; // 0-10
  label: string;
  description: string;
  recommendation: string;
}

export const MOCK_FLEXIBILITY_SCORE: FlexibilityScore = {
  score: 6,
  label: 'Good flexibility',
  description: 'Moving your trip by 2 days could save approximately RM 210.',
  recommendation: 'Try ±1–2 days to potentially find better prices.',
};

// ─── Deal Stack ───────────────────────────────────────────────────────────────

export interface DealStackItem {
  id: string;
  label: string;
  discount: number;
  discountFormatted: string;
}

export const MOCK_DEAL_STACK: {
  originalPrice: number;
  originalPriceFormatted: string;
  items: DealStackItem[];
  finalPrice: number;
  finalPriceFormatted: string;
  totalSaving: number;
  totalSavingFormatted: string;
} = {
  originalPrice: 2850,
  originalPriceFormatted: 'RM 2,850',
  items: [
    { id: 'ds-1', label: 'Trip.com voucher', discount: 50, discountFormatted: '− RM 50' },
    { id: 'ds-2', label: 'Member promotion', discount: 20, discountFormatted: '− RM 20' },
  ],
  finalPrice: 2780,
  finalPriceFormatted: 'RM 2,780',
  totalSaving: 70,
  totalSavingFormatted: 'RM 70',
};

// ─── Micro-Explanations ──────────────────────────────────────────────────────

export interface MicroExplanation {
  id: string;
  subject: string;
  explanation: string;
}

export const MOCK_MICRO_EXPLANATIONS: MicroExplanation[] = [
  { id: 'me-1', subject: 'RM 2,800', explanation: '9% below the reference range' },
  { id: 'me-2', subject: 'Direct flight', explanation: 'Only RM80 more than the cheapest 1-stop option' },
  { id: 'me-3', subject: 'RM50 voucher', explanation: 'Currently the best available promotion' },
  { id: 'me-4', subject: 'Shoulder season', explanation: 'Prices typically stabilize during this period' },
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
