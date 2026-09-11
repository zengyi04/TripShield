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

// --- Ledger (Feature 3: Adaptive Ledger & Dynamic Budget Splitter) ---

export type Category =
  | 'Accommodation'
  | 'Dining'
  | 'Transport'
  | 'Activities'
  | 'Shopping'
  | 'Emergency'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Accommodation',
  'Dining',
  'Transport',
  'Activities',
  'Shopping',
  'Emergency',
  'Other',
];

export interface Traveler {
  id: string;
  name: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  travelerIds: string[];
}

export type SettleTiming = 'today' | 'tomorrow' | 'end-of-trip' | 'custom';

export interface Settlement {
  status: 'unsettled' | 'settled';
  timing?: SettleTiming;
  date?: string;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: Category;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  taxAllocation: Record<string, number>;
  total: number;
  paidBy: string;
  shares: Record<string, number>; // travelerId -> total owed (items + tax)
  settlements: Record<string, Settlement>; // debtor travelerId -> settlement
  source: 'receipt' | 'manual';
}

export interface CategoryBudget {
  category: Category;
  amount: number;
  protectedCommitted?: boolean;
}

export type RebalanceStrategy = 'balanced' | 'activity-aware' | 'strict-saving';

export interface Trip {
  id: string;
  name: string;
  totalBudget: number;
  durationDays: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  travelers: Traveler[];
  categoryBudgets: CategoryBudget[];
  plannedDailyTargets: Record<string, number>; // date -> planned RM for that day
  strategy: RebalanceStrategy;
}

export interface DraftExpense {
  source: 'receipt' | 'manual';
  description: string;
  category: Category;
  items: ReceiptItem[];
  tax: number;
  selectedTravelerIds: string[];
  taxAllocation: Record<string, number>;
  taxManualOverride: boolean;
  payerId: string | null;
  receiptTitle?: string; // e.g. "Review Receipt" / "Review Ride", detected from the scanned receipt
  receiptSubtitle?: string; // e.g. merchant name, or "Unknown Merchant"
}
export type ActiveScreen = 'home' | 'welcome' | 'signup' | 'login' | 'dashboard' | 'self-healing';
