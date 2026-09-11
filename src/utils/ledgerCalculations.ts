import { Category, CATEGORIES, DraftExpense, Expense, ReceiptItem, RebalanceStrategy, Trip } from '../types';

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatMoney(n: number): string {
  const rounded = round2(n);
  const isWhole = Math.abs(rounded - Math.round(rounded)) < 0.005;
  const fixed = isWhole ? Math.round(rounded).toString() : rounded.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `RM${withCommas}${decPart ? `.${decPart}` : ''}`;
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toDateStr(date);
}

export function monthLabel(year: number, month0: number): string {
  return new Date(year, month0, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function getMonthGrid(year: number, month0: number): (string | null)[][] {
  const firstWeekday = new Date(year, month0, 1).getDay();
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toDateStr(new Date(year, month0, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export function diffDays(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((da - db) / (1000 * 60 * 60 * 24));
}

export function dayIndexOf(date: string, startDate: string): number {
  return diffDays(date, startDate) + 1;
}

export function dayLabel(date: string, startDate: string, today: string): string {
  if (date === today) return 'Today';
  if (date === addDays(today, -1)) return 'Yesterday';
  return `Day ${dayIndexOf(date, startDate)}`;
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Accommodation: ['hotel', 'hostel', 'resort', 'airbnb', 'check-in', 'checkin', 'lodging', 'room'],
  Dining: ['restaurant', 'dinner', 'lunch', 'breakfast', 'cafe', 'coffee', 'food', 'nasi', 'rice', 'meal', 'snack', 'drinks', 'dessert'],
  Transport: ['taxi', 'grab', 'uber', 'train', 'bus', 'metro', 'flight', 'airport', 'fuel', 'parking', 'ticket fare', 'transport'],
  Activities: ['museum', 'ticket', 'tour', 'disneyland', 'park', 'show', 'admission', 'zoo', 'activity', 'attraction'],
  Shopping: ['souvenir', 'shop', 'mall', 'market', 'store', 'gift'],
  Emergency: ['pharmacy', 'clinic', 'hospital', 'medicine', 'insurance', 'emergency'],
  Other: [],
};

export function suggestCategory(text: string): Category {
  const lower = text.toLowerCase();
  for (const category of CATEGORIES) {
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return 'Other';
}

export function computeItemSplit(item: ReceiptItem): Record<string, number> {
  const shares: Record<string, number> = {};
  if (item.travelerIds.length === 0) return shares;
  const each = item.price / item.travelerIds.length;
  item.travelerIds.forEach(id => {
    shares[id] = round2(each);
  });
  return shares;
}

export function computeSubtotalsByTraveler(items: ReceiptItem[], travelerIds: string[]): Record<string, number> {
  const totals: Record<string, number> = {};
  travelerIds.forEach(id => (totals[id] = 0));
  items.forEach(item => {
    const split = computeItemSplit(item);
    Object.entries(split).forEach(([id, amount]) => {
      totals[id] = round2((totals[id] || 0) + amount);
    });
  });
  return totals;
}

export function computeProportionalTax(tax: number, subtotalsByTraveler: Record<string, number>): Record<string, number> {
  const ids = Object.keys(subtotalsByTraveler);
  const subtotalSum = ids.reduce((sum, id) => sum + subtotalsByTraveler[id], 0);
  const allocation: Record<string, number> = {};
  if (subtotalSum <= 0 || tax <= 0) {
    ids.forEach(id => (allocation[id] = 0));
    return allocation;
  }
  let runningTotal = 0;
  ids.forEach((id, idx) => {
    if (idx === ids.length - 1) {
      allocation[id] = round2(tax - runningTotal);
    } else {
      const share = round2((subtotalsByTraveler[id] / subtotalSum) * tax);
      allocation[id] = share;
      runningTotal = round2(runningTotal + share);
    }
  });
  return allocation;
}

export function computeShares(subtotalsByTraveler: Record<string, number>, taxAllocation: Record<string, number>): Record<string, number> {
  const shares: Record<string, number> = {};
  Object.keys(subtotalsByTraveler).forEach(id => {
    shares[id] = round2((subtotalsByTraveler[id] || 0) + (taxAllocation[id] || 0));
  });
  return shares;
}

export interface OutstandingBalance {
  fromId: string;
  toId: string;
  amount: number;
  settlement: Expense['settlements'][string];
}

export function computeOutstanding(expense: Expense): OutstandingBalance[] {
  return Object.entries(expense.shares)
    .filter(([travelerId]) => travelerId !== expense.paidBy)
    .map(([travelerId, amount]) => ({
      fromId: travelerId,
      toId: expense.paidBy,
      amount,
      settlement: expense.settlements[travelerId] || { status: 'unsettled' as const },
    }));
}

export interface DayGroup {
  date: string;
  label: string;
  total: number;
  count: number;
  expenses: Expense[];
}

export function groupExpensesByDate(expenses: Expense[], startDate: string, today: string): DayGroup[] {
  const byDate = new Map<string, Expense[]>();
  expenses.forEach(exp => {
    const list = byDate.get(exp.date) || [];
    list.push(exp);
    byDate.set(exp.date, list);
  });
  const groups: DayGroup[] = Array.from(byDate.entries()).map(([date, exps]) => ({
    date,
    label: dayLabel(date, startDate, today),
    total: round2(exps.reduce((sum, e) => sum + e.total, 0)),
    count: exps.length,
    expenses: exps.sort((a, b) => (a.id < b.id ? 1 : -1)),
  }));
  return groups.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function totalSpent(expenses: Expense[]): number {
  return round2(expenses.reduce((sum, e) => sum + e.total, 0));
}

export function categorySpent(expenses: Expense[], category: Category): number {
  return round2(expenses.filter(e => e.category === category).reduce((sum, e) => sum + e.total, 0));
}

export function buildDraftFromReceipt(
  items: ReceiptItem[],
  tax: number,
  category: Category,
  description: string,
  receiptTitle?: string,
  receiptSubtitle?: string
): DraftExpense {
  return {
    source: 'receipt',
    description,
    category,
    items,
    tax,
    selectedTravelerIds: [],
    taxAllocation: {},
    taxManualOverride: false,
    payerId: null,
    receiptTitle,
    receiptSubtitle,
  };
}

export function buildDraftFromManual(amount: number, description: string, category: Category): DraftExpense {
  return {
    source: 'manual',
    description,
    category,
    items: [{ id: 'manual-item', name: description || 'Expense', price: amount, travelerIds: [] }],
    tax: 0,
    selectedTravelerIds: [],
    taxAllocation: {},
    taxManualOverride: false,
    payerId: null,
  };
}

export interface RebalanceResult {
  overspent: number;
  totalSpentSoFar: number;
  remainingBudget: number;
  remainingDays: number;
  protectedCommitted: number;
  flexibleRemaining: number;
  plannedFutureSpending: number; // portion of flexibleRemaining this strategy actually allocates to future days
  safetyBuffer: number; // flexibleRemaining left unallocated, held back as a buffer (0 unless the strategy reserves one)
  originalPlan: { date: string; label: string; amount: number }[];
  recommendedPlan: { date: string; label: string; amount: number }[];
  updatedAverageDailyTarget: number;
  explanation: string;
}

// Fraction of the remaining flexible budget actually put to work under Strict Saving;
// the rest is held back as an unspent safety buffer.
const STRICT_SAVING_BUFFER_RATIO = 0.2;

export function computeRebalance(trip: Trip, expenses: Expense[], strategy: RebalanceStrategy, today: string): RebalanceResult {
  const allDates = Object.keys(trip.plannedDailyTargets).sort();
  const futureDates = allDates.filter(d => diffDays(d, today) > 0);
  const elapsedDates = allDates.filter(d => diffDays(d, today) <= 0);

  // Overspend is detected per day (never netted against other days that underspent),
  // so a big day-1 overage can't be masked by later days spending less than planned.
  let overspent = 0;
  let worstOverspendDate: string | null = null;
  elapsedDates.forEach(d => {
    const planned = trip.plannedDailyTargets[d] || 0;
    const spent = totalSpent(expenses.filter(e => e.date === d));
    const overage = round2(spent - planned);
    if (overage > overspent) {
      overspent = overage;
      worstOverspendDate = d;
    }
  });

  const spentSoFar = totalSpent(expenses);
  const remainingBudget = round2(trip.totalBudget - spentSoFar);

  // Protected committed expenses = budget still earmarked for committed categories
  // (e.g. accommodation) that hasn't been spent yet. This money is off-limits to rebalancing.
  const protectedCommitted = round2(
    trip.categoryBudgets
      .filter(cb => cb.protectedCommitted)
      .reduce((sum, cb) => {
        const spentInCategory = categorySpent(expenses, cb.category);
        return sum + Math.max(0, cb.amount - spentInCategory);
      }, 0)
  );

  const flexibleRemaining = round2(Math.max(0, remainingBudget - protectedCommitted));
  const remainingDaysCount = futureDates.length;

  const originalPlan = futureDates.map(date => ({
    date,
    label: dayLabel(date, trip.startDate, today),
    amount: trip.plannedDailyTargets[date] || 0,
  }));

  // Each strategy decides how much of flexibleRemaining it actually plans to spend
  // (plannedFutureSpending) versus holds back untouched (safetyBuffer). Only Strict
  // Saving reserves a buffer — Balanced and Activity-Aware plan the full amount.
  let recommendedPlan: { date: string; label: string; amount: number }[];
  let plannedFutureSpending: number;

  if (remainingDaysCount === 0) {
    recommendedPlan = [];
    plannedFutureSpending = 0;
  } else if (strategy === 'activity-aware') {
    // Uses 100% of the flexible budget: protects the day with the biggest original
    // plan (a fallback proxy for an important upcoming activity, since no per-day
    // activity metadata exists) at its full original target, and compresses the
    // other remaining days to absorb the difference. No buffer is held back.
    plannedFutureSpending = flexibleRemaining;
    const protectedIdx = originalPlan.reduce((best, day, idx) => (day.amount > originalPlan[best].amount ? idx : best), 0);
    const protectedAmount = Math.min(originalPlan[protectedIdx].amount, plannedFutureSpending);
    const restCount = remainingDaysCount - 1;
    const restShare = restCount > 0 ? round2((plannedFutureSpending - protectedAmount) / restCount) : 0;
    recommendedPlan = originalPlan.map((day, idx) => ({
      ...day,
      amount: idx === protectedIdx ? round2(protectedAmount) : Math.max(0, restShare),
    }));
  } else if (strategy === 'strict-saving') {
    // Deliberately plans only a portion of the flexible budget as future spending;
    // the rest is reserved as an explicit, unspent safety buffer (never redistributed).
    plannedFutureSpending = round2(flexibleRemaining * (1 - STRICT_SAVING_BUFFER_RATIO));
    const perDay = round2(plannedFutureSpending / remainingDaysCount);
    recommendedPlan = originalPlan.map(day => ({ ...day, amount: perDay }));
  } else {
    // Balanced: uses 100% of the flexible budget, spread evenly across the remaining
    // days. No safety buffer.
    plannedFutureSpending = flexibleRemaining;
    const perDay = round2(plannedFutureSpending / remainingDaysCount);
    recommendedPlan = originalPlan.map(day => ({ ...day, amount: perDay }));
  }

  const safetyBuffer = round2(Math.max(0, flexibleRemaining - plannedFutureSpending));

  const updatedAverageDailyTarget =
    recommendedPlan.length > 0 ? round2(recommendedPlan.reduce((s, d) => s + d.amount, 0) / recommendedPlan.length) : 0;

  const baseExplanation =
    overspent > 0
      ? `You spent ${formatMoney(overspent)} more than planned on ${dayLabel(worstOverspendDate || today, trip.startDate, today)}. TripShield adjusted your remaining flexible spending targets while protecting your committed expenses.`
      : `Your spending is on track. TripShield kept your remaining daily targets close to your original plan.`;

  const explanation =
    safetyBuffer > 0
      ? `${baseExplanation} Strict Saving plans only ${formatMoney(plannedFutureSpending)} of your ${formatMoney(flexibleRemaining)} flexible budget and reserves ${formatMoney(safetyBuffer)} as a safety buffer.`
      : baseExplanation;

  return {
    overspent,
    totalSpentSoFar: spentSoFar,
    remainingBudget,
    remainingDays: remainingDaysCount,
    protectedCommitted,
    flexibleRemaining,
    plannedFutureSpending,
    safetyBuffer,
    originalPlan,
    recommendedPlan,
    updatedAverageDailyTarget,
    explanation,
  };
}
