import { Expense, ReceiptItem, Traveler, Trip } from '../types';
import { addDays, computeItemSplit, computeProportionalTax, computeShares, computeSubtotalsByTraveler, round2, todayStr } from '../utils/ledgerCalculations';

export const TRAVELERS: Traveler[] = [
  { id: 't1', name: 'Alice' },
  { id: 't2', name: 'Bob' },
  { id: 't3', name: 'Chris' },
  { id: 't4', name: 'David' },
];

const ALL_IDS = TRAVELERS.map(t => t.id);

function makeExpense(params: {
  id: string;
  date: string;
  description: string;
  category: Expense['category'];
  items: Omit<ReceiptItem, 'travelerIds'>[];
  travelerIds: string[];
  tax?: number;
  paidBy: string;
  source?: Expense['source'];
}): Expense {
  const items: ReceiptItem[] = params.items.map(item => ({ ...item, travelerIds: params.travelerIds }));
  const subtotal = round2(items.reduce((sum, i) => sum + i.price, 0));
  const tax = params.tax || 0;
  const subtotalsByTraveler = computeSubtotalsByTraveler(items, params.travelerIds);
  const taxAllocation = computeProportionalTax(tax, subtotalsByTraveler);
  const shares = computeShares(subtotalsByTraveler, taxAllocation);
  return {
    id: params.id,
    date: params.date,
    description: params.description,
    category: params.category,
    items,
    subtotal,
    tax,
    taxAllocation,
    total: round2(subtotal + tax),
    paidBy: params.paidBy,
    shares,
    settlements: {},
    source: params.source || 'manual',
  };
}

export function createDemoTrip(): { trip: Trip; expenses: Expense[] } {
  const today = todayStr();
  const startDate = addDays(today, -2);
  const day2 = addDays(today, -1);
  const day3 = today;
  const day4 = addDays(today, 1);
  const day5 = addDays(today, 2);

  const trip: Trip = {
    id: 'trip-paris-escape',
    name: 'Paris Escape',
    totalBudget: 5000,
    durationDays: 5,
    startDate,
    endDate: day5,
    travelers: TRAVELERS,
    categoryBudgets: [
      { category: 'Accommodation', amount: 1500, protectedCommitted: true },
      { category: 'Dining', amount: 1000 },
      { category: 'Transport', amount: 600 },
      { category: 'Activities', amount: 1200 },
      { category: 'Shopping', amount: 400 },
      { category: 'Emergency', amount: 300 },
    ],
    // Daily budget is a separate view of the same totalBudget (not added to categoryBudgets);
    // both independently sum to RM5,000.
    plannedDailyTargets: {
      [startDate]: 800,
      [day2]: 1000,
      [day3]: 1000,
      [day4]: 1100,
      [day5]: 1100,
    },
    strategy: 'balanced',
  };

  const expenses: Expense[] = [
    makeExpense({
      id: 'e1',
      date: startDate,
      description: 'Dinner',
      category: 'Dining',
      items: [{ id: 'e1-i1', name: 'Dinner', price: 420 }],
      travelerIds: ALL_IDS,
      paidBy: 't1',
    }),
    makeExpense({
      id: 'e2',
      date: startDate,
      description: 'Transport',
      category: 'Transport',
      items: [{ id: 'e2-i1', name: 'Airport Taxi', price: 180 }],
      travelerIds: ALL_IDS,
      paidBy: 't2',
    }),
    makeExpense({
      id: 'e3',
      date: startDate,
      description: 'Disneyland',
      category: 'Activities',
      items: [{ id: 'e3-i1', name: 'Disneyland Tickets', price: 600 }],
      travelerIds: ALL_IDS,
      paidBy: 't3',
    }),
    makeExpense({
      id: 'e4',
      date: day2,
      description: 'Breakfast Cafe',
      category: 'Dining',
      items: [{ id: 'e4-i1', name: 'Breakfast Cafe', price: 55 }],
      travelerIds: ALL_IDS,
      paidBy: 't2',
    }),
    makeExpense({
      id: 'e5',
      date: day2,
      description: 'Metro Tickets',
      category: 'Transport',
      items: [{ id: 'e5-i1', name: 'Metro Tickets', price: 100 }],
      travelerIds: ALL_IDS,
      paidBy: 't4',
    }),
    makeExpense({
      id: 'e6',
      date: day3,
      description: 'Lunch',
      category: 'Dining',
      items: [{ id: 'e6-i1', name: 'Lunch', price: 150 }],
      travelerIds: ALL_IDS,
      paidBy: 't1',
    }),
    makeExpense({
      id: 'e7',
      date: day3,
      description: 'Museum Tickets',
      category: 'Activities',
      items: [{ id: 'e7-i1', name: 'Museum Tickets', price: 200 }],
      travelerIds: ALL_IDS,
      paidBy: 't3',
    }),
    makeExpense({
      id: 'e8',
      date: day3,
      description: 'Souvenirs',
      category: 'Shopping',
      items: [{ id: 'e8-i1', name: 'Souvenirs', price: 70 }],
      travelerIds: ALL_IDS,
      paidBy: 't4',
    }),
  ];

  // Demo one already-settled debt so both states are visible in Expense Detail.
  expenses[0].settlements['t2'] = { status: 'settled', timing: 'today', date: today };

  return { trip, expenses };
}

export interface MockReceipt {
  title: string; // dynamic screen title, e.g. "Review Receipt" / "Review Ride"
  subtitle: string; // recognized merchant name, e.g. "Grab", "Unknown Merchant"
  merchantHint: string; // fed into category auto-suggestion, mimics OCR merchant/menu text
  items: { name: string; price: number }[];
  tax: number;
}

// Simulates what OCR + AI merchant recognition would return for different kinds of
// receipts. Scan Receipt cycles through these so the dynamic title/subtitle can be
// demonstrated across restaurant, ride-hailing, food delivery, hotel, and unknown cases.
export const MOCK_RECEIPTS: MockReceipt[] = [
  {
    title: 'Review Receipt',
    subtitle: 'Nasi Lemak Corner',
    merchantHint: 'restaurant receipt nasi lemak corner',
    items: [
      { name: 'Nasi Lemak', price: 25 },
      { name: 'Chicken Rice', price: 18 },
      { name: 'Drinks', price: 12 },
      { name: 'Dessert', price: 20 },
    ],
    tax: 7,
  },
  {
    title: 'Review Ride',
    subtitle: 'Grab',
    merchantHint: 'grab ride transport taxi',
    items: [{ name: 'Ride Fare', price: 18 }],
    tax: 0,
  },
  {
    title: 'Review Receipt',
    subtitle: 'GrabFood',
    merchantHint: 'grabfood delivery dining',
    items: [
      { name: 'Chicken Rice Combo', price: 15 },
      { name: 'Delivery Fee', price: 3 },
    ],
    tax: 0,
  },
  {
    title: 'Review Receipt',
    subtitle: 'Hotel Le Marais',
    merchantHint: 'hotel accommodation check-in room',
    items: [
      { name: 'Room Charge', price: 450 },
      { name: 'Breakfast', price: 40 },
    ],
    tax: 30,
  },
  {
    title: 'Review Receipt',
    subtitle: 'Unknown Merchant',
    merchantHint: 'receipt',
    items: [{ name: 'Item 1', price: 20 }],
    tax: 0,
  },
];
