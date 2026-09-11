import React, { useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, Category, DraftExpense, Expense, ReceiptItem, RebalanceStrategy, SettleTiming, Traveler, Trip } from '../../types';
import { CATEGORY_COLOR, CATEGORY_ICON, STATUS_COLOR, ledgerStyles as s } from '../../utils/ledgerTheme';
import { MOCK_RECEIPTS, createDemoTrip } from '../../data/ledgerMockData';
import {
  addDays,
  buildDraftFromManual,
  buildDraftFromReceipt,
  categorySpent,
  computeOutstanding,
  computeProportionalTax,
  computeRebalance,
  computeShares,
  computeSubtotalsByTraveler,
  dayLabel,
  formatMoney,
  groupExpensesByDate,
  round2,
  suggestCategory,
  todayStr,
  totalSpent,
} from '../../utils/ledgerCalculations';
import Header from '../LedgerHeader';
import ProgressBar from '../LedgerProgressBar';
import StatusPill from '../LedgerStatusPill';
import CategoryIcon from '../LedgerCategoryIcon';
import LedgerDatePickerModal from '../LedgerDatePickerModal';

// Soft pastel blue-to-white backdrop for the Ledger pages (independent of the app-wide theme colors).
const LEDGER_BG_GRADIENT = ['#EAF2FE', '#F4F8FF', '#FFFFFF'] as const;

type LedgerView =
  | 'dashboard'
  | 'setBudget'
  | 'dailyDetail'
  | 'expenseDetail'
  | 'scanReceipt'
  | 'manualEntry'
  | 'selectTravelers'
  | 'assignItems'
  | 'taxSplit'
  | 'selectPayer'
  | 'confirmExpense'
  | 'expenseAdded'
  | 'rebalance'
  | 'rebalanceApplied';

const AI_ALLOCATION_TEMPLATE: Record<Category, number> = {
  Accommodation: 0.3,
  Dining: 0.2,
  Transport: 0.12,
  Activities: 0.24,
  Shopping: 0.08,
  Emergency: 0.06,
  Other: 0,
};

function computeAiAllocation(total: number): Record<Category, number> {
  const cats: Category[] = ['Accommodation', 'Dining', 'Transport', 'Activities', 'Shopping', 'Emergency'];
  const result: Record<string, number> = {};
  let running = 0;
  cats.forEach((cat, idx) => {
    if (idx === cats.length - 1) {
      result[cat] = round2(total - running);
    } else {
      const amount = round2(Math.round((total * AI_ALLOCATION_TEMPLATE[cat]) / 10) * 10);
      result[cat] = amount;
      running = round2(running + amount);
    }
  });
  return result as Record<Category, number>;
}

// Day-shape weights that always sum to exactly `duration`, so distributing
// (total / duration) * weight across every day always totals the full trip budget.
// Day 1 is discounted (arrival/travel day, typically lighter spending); the final
// two days are boosted (checkout costs, bigger planned activities near trip end).
function computeAiDailyWeights(duration: number): number[] {
  if (duration <= 2) return new Array(duration).fill(1);
  const weights = new Array(duration).fill(1);
  weights[0] = 0.8;
  weights[duration - 1] = 1.1;
  weights[duration - 2] = 1.1;
  return weights;
}

function computeAiDailyAllocation(total: number, duration: number, startDate: string): Record<string, number> {
  const weights = computeAiDailyWeights(duration);
  const perUnit = duration > 0 ? total / duration : 0;
  const rounded = weights.map(w => Math.round((perUnit * w) / 10) * 10);
  const roundedSum = rounded.reduce((sum, v) => sum + v, 0);
  if (rounded.length > 0) rounded[rounded.length - 1] = round2(rounded[rounded.length - 1] + (total - roundedSum));
  const result: Record<string, number> = {};
  for (let i = 0; i < duration; i++) {
    result[addDays(startDate, i)] = rounded[i];
  }
  return result;
}

export default function LedgerScreen({
  topColor,
  bottomColor,
  buttonBg,
  buttonHover,
}: {
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
}) {
  const demo = useMemo(() => createDemoTrip(), []);
  const [trip, setTrip] = useState<Trip | null>(demo.trip);
  const [expenses, setExpenses] = useState<Expense[]>(demo.expenses);
  const [view, setView] = useState<LedgerView>('dashboard');
  const today = todayStr();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [expenseDetailFrom, setExpenseDetailFrom] = useState<'dailyDetail' | 'dashboard'>('dailyDetail');

  const [budgetMode, setBudgetMode] = useState<'create' | 'edit'>('create');
  const [formName, setFormName] = useState('Paris Escape');
  const [formBudget, setFormBudget] = useState('5000');
  const [formDuration, setFormDuration] = useState('5');
  const [formStartDate, setFormStartDate] = useState(today);
  const [formEndDate, setFormEndDate] = useState(addDays(today, 4));
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);
  const [allocationMode, setAllocationMode] = useState<'ai' | 'manual'>('ai');
  const [manualAllocation, setManualAllocation] = useState<Record<string, string>>({});
  const [dailyAllocation, setDailyAllocation] = useState<Record<string, string>>({});

  const [wizardSource, setWizardSource] = useState<'receipt' | 'manual'>('receipt');
  const [scanState, setScanState] = useState<'idle' | 'scanning'>('idle');
  const [draft, setDraft] = useState<DraftExpense | null>(null);
  const [travelerCount, setTravelerCount] = useState(4);
  const [rosterDraft, setRosterDraft] = useState<Traveler[]>([]);

  const [manualAmount, setManualAmount] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualCategory, setManualCategory] = useState<Category>('Other');
  const [manualCategoryTouched, setManualCategoryTouched] = useState(false);

  const [settleTarget, setSettleTarget] = useState<string | null>(null);
  const [settleTiming, setSettleTiming] = useState<SettleTiming>('today');
  const [settleCustomDate, setSettleCustomDate] = useState('');

  const [categoryEditExpenseId, setCategoryEditExpenseId] = useState<string | null>(null);

  const [rebalanceStrategy, setRebalanceStrategy] = useState<RebalanceStrategy>('balanced');

  const [overspendBanner, setOverspendBanner] = useState<string | null>(null);
  const [addedExpense, setAddedExpense] = useState<Expense | null>(null);

  const spent = totalSpent(expenses);
  const remaining = trip ? round2(trip.totalBudget - spent) : 0;
  const dayGroups = trip ? groupExpensesByDate(expenses, trip.startDate, today) : [];
  const todayGroup = dayGroups.find(g => g.date === today);
  const todaySpent = todayGroup ? todayGroup.total : 0;
  const todayTarget = trip ? trip.plannedDailyTargets[today] || 0 : 0;

  const proratedBudget = trip
    ? Object.entries(trip.plannedDailyTargets)
        .filter(([date]) => date <= today)
        .reduce((sum, [, amt]) => sum + amt, 0)
    : 0;
  const overallStatus: 'onTrack' | 'warning' | 'over' =
    spent > trip!.totalBudget ? 'over' : spent > proratedBudget * 1.05 ? 'warning' : 'onTrack';

  const overspentDays = trip
    ? dayGroups.filter(g => g.date <= today && g.total > (trip.plannedDailyTargets[g.date] || 0))
    : [];

  function resetWizard() {
    setDraft(null);
    setScanState('idle');
    setManualAmount('');
    setManualDescription('');
    setManualCategory('Other');
    setManualCategoryTouched(false);
  }

  function openScanReceipt() {
    resetWizard();
    setWizardSource('receipt');
    setView('scanReceipt');
  }

  function openManualEntry() {
    resetWizard();
    setWizardSource('manual');
    setView('manualEntry');
  }

  const scanIndexRef = useRef(0);

  function performScan() {
    setScanState('scanning');
    setTimeout(() => {
      const receipt = MOCK_RECEIPTS[scanIndexRef.current % MOCK_RECEIPTS.length];
      scanIndexRef.current += 1;
      const items: ReceiptItem[] = receipt.items.map((it, idx) => ({
        id: `scan-${Date.now()}-${idx}`,
        name: it.name,
        price: it.price,
        travelerIds: [],
      }));
      const category = suggestCategory(`${receipt.merchantHint} ${items.map(i => i.name).join(' ')}`);
      setDraft(buildDraftFromReceipt(items, receipt.tax, category, receipt.subtitle, receipt.title, receipt.subtitle));
      setScanState('idle');
    }, 1100);
  }

  function updateDraftItem(itemId: string, patch: Partial<ReceiptItem>) {
    setDraft(d => (d ? { ...d, items: d.items.map(it => (it.id === itemId ? { ...it, ...patch } : it)) } : d));
  }

  function removeDraftItem(itemId: string) {
    setDraft(d => (d ? { ...d, items: d.items.filter(it => it.id !== itemId) } : d));
  }

  function addDraftItem() {
    setDraft(d => (d ? { ...d, items: [...d.items, { id: `item-${Date.now()}`, name: 'New Item', price: 0, travelerIds: [] }] } : d));
  }

  function proceedFromScanReceipt() {
    if (!draft) return;
    setRosterDraft(trip ? trip.travelers : []);
    setTravelerCount(trip ? trip.travelers.length : 4);
    setView('selectTravelers');
  }

  function proceedFromManualEntry() {
    const amount = parseFloat(manualAmount) || 0;
    if (amount <= 0) return;
    const category = manualCategoryTouched ? manualCategory : suggestCategory(manualDescription);
    setDraft(buildDraftFromManual(amount, manualDescription || 'Expense', category));
    setRosterDraft(trip ? trip.travelers : []);
    setTravelerCount(trip ? trip.travelers.length : 4);
    setView('selectTravelers');
  }

  function changeTravelerCount(delta: number) {
    setTravelerCount(c => {
      const next = Math.max(1, c + delta);
      setRosterDraft(list => {
        if (next > list.length) {
          const additions: Traveler[] = [];
          for (let i = list.length; i < next; i++) {
            additions.push({ id: `traveler-${Date.now()}-${i}`, name: `Traveler ${i + 1}` });
          }
          return [...list, ...additions];
        }
        return list.slice(0, next);
      });
      return next;
    });
  }

  function renameRosterTraveler(id: string, name: string) {
    setRosterDraft(list => list.map(t => (t.id === id ? { ...t, name } : t)));
  }

  function removeRosterTraveler(id: string) {
    setRosterDraft(list => list.filter(t => t.id !== id));
    setTravelerCount(c => Math.max(1, c - 1));
  }

  function proceedFromSelectTravelers() {
    if (!draft || rosterDraft.length === 0) return;
    if (trip) setTrip({ ...trip, travelers: rosterDraft });
    const allIds = rosterDraft.map(t => t.id);
    const itemsWithDefaults =
      draft.source === 'manual'
        ? draft.items.map(it => ({ ...it, travelerIds: allIds }))
        : draft.items.map(it => ({ ...it, travelerIds: it.travelerIds.length ? it.travelerIds : allIds }));
    setDraft({ ...draft, selectedTravelerIds: allIds, items: itemsWithDefaults });
    setView('assignItems');
  }

  function toggleItemTraveler(itemId: string, travelerId: string) {
    setDraft(d => {
      if (!d) return d;
      return {
        ...d,
        items: d.items.map(it => {
          if (it.id !== itemId) return it;
          const has = it.travelerIds.includes(travelerId);
          const nextIds = has ? it.travelerIds.filter(id => id !== travelerId) : [...it.travelerIds, travelerId];
          return { ...it, travelerIds: nextIds };
        }),
      };
    });
  }

  function proceedFromAssignItems() {
    if (!draft) return;
    if (draft.tax > 0) {
      const subtotals = computeSubtotalsByTraveler(draft.items, draft.selectedTravelerIds);
      const allocation = computeProportionalTax(draft.tax, subtotals);
      setDraft({ ...draft, taxAllocation: allocation });
      setView('taxSplit');
    } else {
      setView('selectPayer');
    }
  }

  function editTaxAllocation(travelerId: string, value: string) {
    setDraft(d => (d ? { ...d, taxAllocation: { ...d.taxAllocation, [travelerId]: parseFloat(value) || 0 }, taxManualOverride: true } : d));
  }

  function selectPayer(payerId: string) {
    setDraft(d => (d ? { ...d, payerId } : d));
  }

  function confirmAndAddExpense() {
    if (!draft || !draft.payerId || !trip) return;
    const subtotals = computeSubtotalsByTraveler(draft.items, draft.selectedTravelerIds);
    const shares = computeShares(subtotals, draft.taxAllocation);
    const subtotal = round2(draft.items.reduce((sum, it) => sum + it.price, 0));
    const expense: Expense = {
      id: `expense-${Date.now()}`,
      date: today,
      description: draft.description,
      category: draft.category,
      items: draft.items,
      subtotal,
      tax: draft.tax,
      taxAllocation: draft.taxAllocation,
      total: round2(subtotal + draft.tax),
      paidBy: draft.payerId,
      shares,
      settlements: {},
      source: draft.source,
    };
    setExpenses(prev => [...prev, expense]);
    setAddedExpense(expense);

    const newDayTotal = round2((dayGroups.find(g => g.date === today)?.total || 0) + expense.total);
    const target = trip.plannedDailyTargets[today] || 0;
    if (newDayTotal > target) {
      setOverspendBanner(dayLabel(today, trip.startDate, today));
    } else {
      setOverspendBanner(null);
    }
    setView('expenseAdded');
  }

  function openDailyDetail(date: string) {
    setSelectedDate(date);
    setView('dailyDetail');
  }

  function openExpenseDetail(expenseId: string, from: 'dailyDetail' | 'dashboard') {
    setSelectedExpenseId(expenseId);
    setExpenseDetailFrom(from);
    setView('expenseDetail');
  }

  function markSettled(expenseId: string, debtorId: string, timing: SettleTiming, customDate?: string) {
    const settleDate = timing === 'today' ? today : timing === 'tomorrow' ? addDays(today, 1) : timing === 'custom' ? customDate || today : trip?.endDate || today;
    setExpenses(prev =>
      prev.map(e =>
        e.id === expenseId
          ? { ...e, settlements: { ...e.settlements, [debtorId]: { status: 'settled', timing, date: settleDate } } }
          : e
      )
    );
    setSettleTarget(null);
  }

  function updateExpenseCategory(expenseId: string, category: Category) {
    setExpenses(prev => prev.map(e => (e.id === expenseId ? { ...e, category } : e)));
    setCategoryEditExpenseId(null);
  }

  function openSetBudget(mode: 'create' | 'edit') {
    setBudgetMode(mode);
    if (mode === 'edit' && trip) {
      setFormName(trip.name);
      setFormBudget(String(trip.totalBudget));
      setFormDuration(String(trip.durationDays));
      setFormStartDate(trip.startDate);
      setFormEndDate(trip.endDate);
      setAllocationMode('manual');
      const alloc: Record<string, string> = {};
      trip.categoryBudgets.forEach(cb => (alloc[cb.category] = String(cb.amount)));
      setManualAllocation(alloc);
      const daily: Record<string, string> = {};
      Object.entries(trip.plannedDailyTargets).forEach(([date, amount]) => (daily[date] = String(amount)));
      setDailyAllocation(daily);
    } else {
      setFormName('Paris Escape');
      setFormBudget('5000');
      setFormDuration('5');
      setFormStartDate(today);
      setFormEndDate(addDays(today, 4));
      setAllocationMode('ai');
      setManualAllocation({});
      setDailyAllocation({});
    }
    setView('setBudget');
  }

  const budgetTotalNum = parseFloat(formBudget) || 0;
  const durationNum = Math.max(1, parseInt(formDuration, 10) || 1);
  const aiAllocation = computeAiAllocation(budgetTotalNum);
  const currentAllocation: Record<string, number> =
    allocationMode === 'ai' ? aiAllocation : Object.fromEntries(Object.entries(manualAllocation).map(([k, v]) => [k, parseFloat(v) || 0]));
  const allocatedTotal = Object.values(currentAllocation).reduce((s2, v) => s2 + v, 0);

  const dayList = Array.from({ length: durationNum }, (_, i) => ({ date: addDays(formStartDate, i), label: `Day ${i + 1}` }));
  const aiDailyAllocation = computeAiDailyAllocation(budgetTotalNum, durationNum, formStartDate);
  const currentDailyAllocation: Record<string, number> =
    allocationMode === 'ai' ? aiDailyAllocation : Object.fromEntries(dayList.map(d => [d.date, parseFloat(dailyAllocation[d.date]) || 0]));
  const dailyAllocatedTotal = dayList.reduce((sum, d) => sum + (currentDailyAllocation[d.date] || 0), 0);

  function submitBudget() {
    const total = parseFloat(formBudget) || 0;
    const duration = durationNum;
    if (!formName.trim() || total <= 0 || allocatedTotal > total + 0.01 || dailyAllocatedTotal > total + 0.01) return;

    const categoryBudgets = CATEGORIES.filter(c => c !== 'Other')
      .filter(c => (currentAllocation[c] || 0) > 0)
      .map(c => ({ category: c, amount: round2(currentAllocation[c] || 0), protectedCommitted: c === 'Accommodation' }));

    const plannedDailyTargets: Record<string, number> = {};
    dayList.forEach(d => {
      plannedDailyTargets[d.date] = round2(currentDailyAllocation[d.date] || 0);
    });

    const nextTrip: Trip = {
      id: trip?.id || `trip-${Date.now()}`,
      name: formName.trim(),
      totalBudget: total,
      durationDays: duration,
      startDate: formStartDate,
      endDate: formEndDate || addDays(formStartDate, duration - 1),
      travelers: trip?.travelers || demo.trip.travelers,
      categoryBudgets,
      plannedDailyTargets,
      strategy: trip?.strategy || 'balanced',
    };
    setTrip(nextTrip);
    setView('dashboard');
  }

  function applyRebalance(recommendedPlan: { date: string; amount: number }[]) {
    if (!trip) return;
    const updatedTargets = { ...trip.plannedDailyTargets };
    recommendedPlan.forEach(day => {
      updatedTargets[day.date] = day.amount;
    });
    setTrip({ ...trip, plannedDailyTargets: updatedTargets, strategy: rebalanceStrategy });
    setView('rebalanceApplied');
  }

  if (!trip) return null;

  const selectedExpense = expenses.find(e => e.id === selectedExpenseId) || null;
  const selectedDayGroup = dayGroups.find(g => g.date === selectedDate) || null;

  function renderDashboard() {
    if (!trip) return null;
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.tripName}>{trip.name}</Text>
            <Text style={s.tripMeta}>
              {trip.durationDays} Days · {trip.travelers.length} Travelers
            </Text>
          </View>
          <Pressable onPress={openScanReceipt} style={({ pressed }) => [s.smallAction, pressed && s.pressedGlass]}>
            <Ionicons name="camera-outline" size={14} color="#0f172a" />
            <Text style={s.smallActionText}>Scan Receipt</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 140 }}>
          <View style={s.card}>
            <View style={s.rowBetween}>
              <View>
                <Text style={s.cardLabel}>Overall Trip Budget</Text>
                <Text style={s.bigAmount}>
                  {formatMoney(spent)} / {formatMoney(trip.totalBudget)}
                </Text>
              </View>
              <StatusPill status={overallStatus} />
            </View>
            <ProgressBar value={spent} max={trip.totalBudget} color={overallStatus === 'over' ? '#EF4444' : overallStatus === 'warning' ? '#FB7185' : '#3B82F6'} />
            <Text style={[s.amountSub, { marginTop: 8 }]}>{formatMoney(Math.max(0, remaining))} remaining</Text>
            <View style={[s.rowBetween, { marginTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(15,23,42,0.1)', paddingTop: 12 }]}>
              <View>
                <Text style={s.cardLabel}>Total Spent</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#0f172a', marginTop: 4 }}>{formatMoney(spent)}</Text>
              </View>
              <View>
                <Text style={s.cardLabel}>Remaining</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#0f172a', marginTop: 4 }}>{formatMoney(Math.max(0, remaining))}</Text>
              </View>
              <Pressable onPress={() => openSetBudget('edit')} style={({ pressed }) => [s.smallAction, pressed && s.pressedGlass, { backgroundColor: 'rgba(15,23,42,0.08)' }]}>
                <Ionicons name="create-outline" size={13} color="#0f172a" />
                <Text style={s.smallActionText}>Edit Budget</Text>
              </Pressable>
            </View>
          </View>

          {overspentDays.length > 0 && (
            <Pressable onPress={() => setView('rebalance')} style={({ pressed }) => [s.cardDark, pressed && s.pressedGlass, { borderColor: '#FDA4AF' }]}>
              <View style={s.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.cardLabelLight, { color: '#BE123C' }]}>Budget Needs Attention</Text>
                  <Text style={{ color: '#9F1239', fontSize: 13, fontWeight: '700', marginTop: 6 }}>
                    {overspentDays[overspentDays.length - 1].label} overspent by{' '}
                    {formatMoney(overspentDays[overspentDays.length - 1].total - (trip.plannedDailyTargets[overspentDays[overspentDays.length - 1].date] || 0))}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BE123C" />
              </View>
              <Text style={{ color: '#BE123C', fontSize: 11, fontWeight: '800', marginTop: 10 }}>Review Budget →</Text>
            </Pressable>
          )}

          <View style={s.card}>
            <Text style={s.cardLabel}>Today&apos;s Spending</Text>
            <Text style={s.bigAmount}>
              {formatMoney(todaySpent)} / {formatMoney(todayTarget)}
            </Text>
            <ProgressBar value={todaySpent} max={todayTarget} color={todaySpent > todayTarget ? '#EF4444' : '#3B82F6'} />
            <Text style={[s.amountSub, { marginTop: 8 }]}>{formatMoney(Math.max(0, todayTarget - todaySpent))} remaining today</Text>
            <View style={s.insightBox}>
              <Ionicons name="sparkles" size={16} color="#2563eb" />
              <Text style={s.insightText}>{buildAiInsight()}</Text>
            </View>
          </View>

          <Text style={s.sectionTitle}>Spending History</Text>
          {dayGroups.length === 0 && (
            <Text style={{ color: 'rgba(15,23,42,0.6)', fontSize: 12, marginTop: 8 }}>No expenses recorded yet. Scan a receipt or add one manually.</Text>
          )}
          {dayGroups.map(group => (
            <Pressable key={group.date} onPress={() => openDailyDetail(group.date)} style={({ pressed }) => [s.dateRow, pressed && s.pressedGlass]}>
              <View>
                <Text style={s.dateRowLabel}>{group.label}</Text>
                <Text style={s.dateRowSub}>
                  {formatMoney(group.total)} spent · {group.count} expense{group.count === 1 ? '' : 's'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(15,23,42,0.5)" />
            </Pressable>
          ))}

          <Pressable onPress={openManualEntry} style={({ pressed }) => [s.secondaryButton, pressed && s.pressedGlass]}>
            <Text style={s.secondaryButtonText}>+ Enter Expense Manually</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    );
  }

  function buildAiInsight(): string {
    const overToday = todaySpent > todayTarget;
    const overallOk = overallStatus !== 'over';
    if (overToday && overallOk) {
      return `You're above today's spending target, but your overall trip budget is still ${overallStatus === 'warning' ? 'close to plan' : 'on track'}.`;
    }
    if (overToday && !overallOk) {
      return `You're above today's target and your overall trip budget is over plan. Consider reviewing your budget.`;
    }
    if (!overToday && overallOk) {
      return `You're within today's target and your overall trip budget is on track. Nice pace.`;
    }
    return `Today's spending is under control, but your overall trip budget needs attention.`;
  }

  function renderDailyDetail() {
    if (!selectedDayGroup || !trip) return null;
    const planned = trip.plannedDailyTargets[selectedDayGroup.date] || 0;
    const overspent = round2(selectedDayGroup.total - planned);
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <Header title={`${selectedDayGroup.label} Spending`} onBack={() => setView('dashboard')} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 140 }}>
          <View style={s.card}>
            <View style={s.rowBetween}>
              <View>
                <Text style={s.cardLabel}>Total Spent</Text>
                <Text style={s.bigAmount}>{formatMoney(selectedDayGroup.total)}</Text>
              </View>
              <View>
                <Text style={s.cardLabel}>Planned</Text>
                <Text style={[s.bigAmount, { fontSize: 16 }]}>{formatMoney(planned)}</Text>
              </View>
            </View>
            {overspent > 0 ? (
              <Text style={{ marginTop: 10, color: '#dc2626', fontWeight: '800', fontSize: 13 }}>Overspent: +{formatMoney(overspent)}</Text>
            ) : (
              <Text style={{ marginTop: 10, color: '#059669', fontWeight: '800', fontSize: 13 }}>Under Plan: -{formatMoney(Math.abs(overspent))}</Text>
            )}
          </View>

          <Text style={s.sectionTitle}>Expenses</Text>
          {selectedDayGroup.expenses.map(exp => {
            const payer = trip.travelers.find(t => t.id === exp.paidBy);
            return (
              <Pressable key={exp.id} onPress={() => openExpenseDetail(exp.id, 'dailyDetail')} style={({ pressed }) => [s.expenseRow, pressed && s.pressedGlass]}>
                <CategoryIcon category={exp.category} />
                <View style={{ flex: 1 }}>
                  <Text style={s.expenseName}>{exp.description}</Text>
                  <Text style={s.expenseSub}>
                    Paid by {payer?.name || 'Unknown'} · {exp.category}
                  </Text>
                </View>
                <Text style={s.expenseAmount}>{formatMoney(exp.total)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </LinearGradient>
    );
  }

  function renderExpenseDetail() {
    if (!selectedExpense || !trip) return null;
    const payer = trip.travelers.find(t => t.id === selectedExpense.paidBy);
    const outstanding = computeOutstanding(selectedExpense);
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <Header title={selectedExpense.description} onBack={() => setView(expenseDetailFrom)} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 140 }}>
          <View style={s.card}>
            <View style={s.rowBetween}>
              <Text style={s.cardLabel}>Total</Text>
              <Pressable onPress={() => setCategoryEditExpenseId(selectedExpense.id)} style={({ pressed }) => [s.chip, s.chipUnselected, pressed && s.pressedGlass]}>
                <Ionicons name={CATEGORY_ICON[selectedExpense.category] as any} size={13} color={CATEGORY_COLOR[selectedExpense.category]} />
                <Text style={[s.chipText, { color: '#0f172a' }]}>{selectedExpense.category}</Text>
                <Ionicons name="chevron-down" size={12} color="#0f172a" />
              </Pressable>
            </View>
            <Text style={s.bigAmount}>{formatMoney(selectedExpense.total)}</Text>
            <Text style={[s.amountSub, { marginTop: 4 }]}>Paid by {payer?.name || 'Unknown'}</Text>
          </View>

          <Text style={s.sectionTitle}>Individual Shares</Text>
          <View style={s.card}>
            {Object.entries(selectedExpense.shares).map(([travelerId, amount]) => {
              const traveler = trip.travelers.find(t => t.id === travelerId);
              return (
                <View key={travelerId} style={[s.rowBetween, { marginTop: 8 }]}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>
                    {traveler?.name || 'Unknown'}
                    {travelerId === selectedExpense.paidBy ? ' (payer)' : ''}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(amount)}</Text>
                </View>
              );
            })}
          </View>

          <Text style={s.sectionTitle}>Outstanding Balances</Text>
          {outstanding.length === 0 && <Text style={{ color: 'rgba(15,23,42,0.6)', fontSize: 12, marginTop: 6 }}>Nothing owed on this expense.</Text>}
          {outstanding.map(ob => {
            const from = trip.travelers.find(t => t.id === ob.fromId);
            const to = trip.travelers.find(t => t.id === ob.toId);
            const isSettled = ob.settlement.status === 'settled';
            return (
              <View key={ob.fromId} style={[s.expenseRow, { justifyContent: 'space-between' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.expenseName}>
                    {from?.name} → {to?.name}
                  </Text>
                  <Text style={s.expenseSub}>{formatMoney(ob.amount)}</Text>
                </View>
                {isSettled ? (
                  <View style={[s.statPill, { backgroundColor: STATUS_COLOR.onTrack.bg }]}>
                    <Ionicons name="checkmark" size={12} color={STATUS_COLOR.onTrack.dot} />
                    <Text style={[s.statPillText, { color: '#166534' }]}>Settled</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => {
                      setSettleTarget(ob.fromId);
                      setSettleTiming('today');
                    }}
                    style={({ pressed }) => [s.smallAction, pressed && s.pressedGlass]}
                  >
                    <Text style={s.smallActionText}>Mark as Settled</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </ScrollView>

        {settleTarget && (
          <Modal visible transparent animationType="slide">
            <Pressable style={s.modalBackdrop} onPress={() => setSettleTarget(null)}>
              <Pressable style={s.modalSheet} onPress={() => undefined}>
                <Text style={s.modalTitle}>Settlement Timing</Text>
                <View style={s.chipRow}>
                  {(['today', 'tomorrow', 'end-of-trip', 'custom'] as SettleTiming[]).map(timing => (
                    <Pressable
                      key={timing}
                      onPress={() => setSettleTiming(timing)}
                      style={({ pressed }) => [s.chip, settleTiming === timing ? s.chipSelected : s.chipUnselected, pressed && s.pressedGlass]}
                    >
                      <Text style={[s.chipText, { color: settleTiming === timing ? '#fff' : '#0f172a' }]}>
                        {timing === 'today' ? 'Today' : timing === 'tomorrow' ? 'Tomorrow' : timing === 'end-of-trip' ? 'End of Trip' : 'Custom Date'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {settleTiming === 'custom' && (
                  <TextInput
                    value={settleCustomDate}
                    onChangeText={setSettleCustomDate}
                    placeholder="YYYY-MM-DD"
                    style={[s.input, { marginTop: 12 }]}
                    placeholderTextColor="rgba(15,23,42,0.4)"
                  />
                )}
                <Pressable
                  onPress={() => selectedExpense && settleTarget && markSettled(selectedExpense.id, settleTarget, settleTiming, settleCustomDate)}
                  style={({ pressed }) => [s.primaryButton, { backgroundColor: buttonBg }, pressed && s.pressedGlass]}
                >
                  <Text style={s.primaryButtonText}>Mark as Settled</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        )}

        {categoryEditExpenseId && (
          <Modal visible transparent animationType="slide">
            <Pressable style={s.modalBackdrop} onPress={() => setCategoryEditExpenseId(null)}>
              <Pressable style={s.modalSheet} onPress={() => undefined}>
                <Text style={s.modalTitle}>Edit Category</Text>
                <View style={s.chipRow}>
                  {CATEGORIES.map(cat => (
                    <Pressable
                      key={cat}
                      onPress={() => updateExpenseCategory(categoryEditExpenseId, cat)}
                      style={({ pressed }) => [s.chip, s.chipUnselected, pressed && s.pressedGlass]}
                    >
                      <Ionicons name={CATEGORY_ICON[cat] as any} size={13} color={CATEGORY_COLOR[cat]} />
                      <Text style={[s.chipText, { color: '#0f172a' }]}>{cat}</Text>
                    </Pressable>
                  ))}
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </LinearGradient>
    );
  }

  function renderSetBudget() {
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <Header title={budgetMode === 'edit' ? 'Edit Trip Budget' : 'Set Your Trip Budget'} onBack={budgetMode === 'edit' ? () => setView('dashboard') : undefined} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 160 }}>
          <Text style={s.label}>Trip Name</Text>
          <TextInput value={formName} onChangeText={setFormName} style={s.input} placeholder="e.g. Paris Escape" placeholderTextColor="rgba(15,23,42,0.4)" />

          <Text style={s.label}>Total Trip Budget (RM)</Text>
          <TextInput value={formBudget} onChangeText={setFormBudget} keyboardType="numeric" style={s.input} placeholder="5000" placeholderTextColor="rgba(15,23,42,0.4)" />

          <Text style={s.label}>Trip Duration (Days)</Text>
          <TextInput value={formDuration} onChangeText={setFormDuration} keyboardType="numeric" style={s.input} placeholder="5" placeholderTextColor="rgba(15,23,42,0.4)" />

          <Text style={s.label}>Start Date</Text>
          <View style={s.inputRow}>
            <TextInput
              value={formStartDate}
              onChangeText={setFormStartDate}
              style={[s.input, { flex: 1 }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="rgba(15,23,42,0.4)"
            />
            <Pressable onPress={() => setDatePickerTarget('start')} style={({ pressed }) => [s.calendarButton, pressed && s.pressedGlass]}>
              <Ionicons name="calendar-outline" size={18} color="#0f172a" />
            </Pressable>
          </View>

          <Text style={s.label}>End Date</Text>
          <View style={s.inputRow}>
            <TextInput
              value={formEndDate}
              onChangeText={setFormEndDate}
              style={[s.input, { flex: 1 }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="rgba(15,23,42,0.4)"
            />
            <Pressable onPress={() => setDatePickerTarget('end')} style={({ pressed }) => [s.calendarButton, pressed && s.pressedGlass]}>
              <Ionicons name="calendar-outline" size={18} color="#0f172a" />
            </Pressable>
          </View>

          <Text style={s.sectionTitle}>Budget Allocation</Text>
          <View style={s.chipRow}>
            <Pressable onPress={() => setAllocationMode('ai')} style={({ pressed }) => [s.chip, allocationMode === 'ai' ? s.chipSelected : s.chipUnselected, pressed && s.pressedGlass]}>
              <Ionicons name="sparkles" size={13} color={allocationMode === 'ai' ? '#fff' : '#0f172a'} />
              <Text style={[s.chipText, { color: allocationMode === 'ai' ? '#fff' : '#0f172a' }]}>AI Recommended</Text>
            </Pressable>
            <Pressable onPress={() => setAllocationMode('manual')} style={({ pressed }) => [s.chip, allocationMode === 'manual' ? s.chipSelected : s.chipUnselected, pressed && s.pressedGlass]}>
              <Ionicons name="create-outline" size={13} color={allocationMode === 'manual' ? '#fff' : '#0f172a'} />
              <Text style={[s.chipText, { color: allocationMode === 'manual' ? '#fff' : '#0f172a' }]}>Set Manually</Text>
            </Pressable>
          </View>

          <Text style={[s.cardLabel, { marginTop: 16 }]}>Category Budget</Text>
          <View style={s.card}>
            {(['Accommodation', 'Dining', 'Transport', 'Activities', 'Shopping', 'Emergency'] as Category[]).map(cat => (
              <View key={cat} style={[s.rowBetween, { marginTop: 10 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name={CATEGORY_ICON[cat] as any} size={15} color={CATEGORY_COLOR[cat]} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a' }}>{cat}</Text>
                </View>
                {allocationMode === 'ai' ? (
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(aiAllocation[cat] || 0)}</Text>
                ) : (
                  <TextInput
                    value={manualAllocation[cat] ?? ''}
                    onChangeText={v => setManualAllocation(prev => ({ ...prev, [cat]: v }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="rgba(15,23,42,0.35)"
                    style={{ width: 90, textAlign: 'right', fontSize: 13, fontWeight: '800', color: '#0f172a' }}
                  />
                )}
              </View>
            ))}
            <View style={[s.rowBetween, { marginTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(15,23,42,0.12)', paddingTop: 10 }]}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#0f172a' }}>Total Allocated</Text>
              <Text style={{ fontSize: 13, fontWeight: '900', color: allocatedTotal > budgetTotalNum ? '#dc2626' : '#0f172a' }}>
                {formatMoney(allocatedTotal)} / {formatMoney(budgetTotalNum)}
              </Text>
            </View>
            {allocatedTotal > budgetTotalNum + 0.01 && (
              <Text style={{ color: '#dc2626', fontSize: 11, fontWeight: '700', marginTop: 6 }}>Allocation cannot exceed your total trip budget.</Text>
            )}
          </View>

          <Text style={[s.cardLabel, { marginTop: 16 }]}>Daily Budget</Text>
          <View style={s.card}>
            {dayList.map(day => (
              <View key={day.date} style={[s.rowBetween, { marginTop: 10 }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a' }}>{day.label}</Text>
                {allocationMode === 'ai' ? (
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(aiDailyAllocation[day.date] || 0)}</Text>
                ) : (
                  <TextInput
                    value={dailyAllocation[day.date] ?? ''}
                    onChangeText={v => setDailyAllocation(prev => ({ ...prev, [day.date]: v }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="rgba(15,23,42,0.35)"
                    style={{ width: 90, textAlign: 'right', fontSize: 13, fontWeight: '800', color: '#0f172a' }}
                  />
                )}
              </View>
            ))}
            <View style={[s.rowBetween, { marginTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(15,23,42,0.12)', paddingTop: 10 }]}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#0f172a' }}>Total Daily Budget</Text>
              <Text style={{ fontSize: 13, fontWeight: '900', color: dailyAllocatedTotal > budgetTotalNum ? '#dc2626' : '#0f172a' }}>
                {formatMoney(dailyAllocatedTotal)} / {formatMoney(budgetTotalNum)}
              </Text>
            </View>
            {dailyAllocatedTotal > budgetTotalNum + 0.01 && (
              <Text style={{ color: '#dc2626', fontSize: 11, fontWeight: '700', marginTop: 6 }}>Daily budget cannot exceed your total trip budget.</Text>
            )}
          </View>

          <Pressable
            disabled={!formName.trim() || budgetTotalNum <= 0 || allocatedTotal > budgetTotalNum + 0.01 || dailyAllocatedTotal > budgetTotalNum + 0.01}
            onPress={submitBudget}
            style={({ pressed }) => [
              s.primaryButton,
              {
                backgroundColor: buttonBg,
                opacity: !formName.trim() || budgetTotalNum <= 0 || allocatedTotal > budgetTotalNum + 0.01 || dailyAllocatedTotal > budgetTotalNum + 0.01 ? 0.5 : 1,
              },
              pressed && s.pressedGlass,
            ]}
          >
            <Text style={s.primaryButtonText}>Set Budget</Text>
          </Pressable>
        </ScrollView>

        <LedgerDatePickerModal
          visible={datePickerTarget !== null}
          initialDate={datePickerTarget === 'start' ? formStartDate : formEndDate}
          minDate={datePickerTarget === 'end' ? formStartDate : undefined}
          onSelect={date => {
            if (datePickerTarget === 'start') setFormStartDate(date);
            else if (datePickerTarget === 'end') setFormEndDate(date);
          }}
          onClose={() => setDatePickerTarget(null)}
        />
      </LinearGradient>
    );
  }

  function renderScanReceipt() {
    if (!draft) {
      return (
        <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
          <Header title="Scan Receipt" onBack={() => setView('dashboard')} />
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 140 }}>
            <Pressable onPress={performScan} style={({ pressed }) => [s.scanArea, pressed && { opacity: 0.85 }]}>
              {scanState === 'scanning' ? (
                <Text style={{ color: '#0f172a', fontWeight: '800' }}>Scanning receipt…</Text>
              ) : (
                <>
                  <Ionicons name="camera" size={40} color="#2563EB" />
                  <Text style={{ color: '#0f172a', fontWeight: '800', marginTop: 10 }}>Tap to Scan Receipt</Text>
                  <Text style={{ color: 'rgba(15,23,42,0.6)', fontSize: 11, marginTop: 4 }}>AI will extract items automatically</Text>
                </>
              )}
            </Pressable>
            <Pressable onPress={openManualEntry} style={({ pressed }) => [s.secondaryButton, pressed && s.pressedGlass]}>
              <Text style={s.secondaryButtonText}>Enter Manually</Text>
            </Pressable>
          </ScrollView>
        </LinearGradient>
      );
    }

    const total = round2(draft.items.reduce((sum, it) => sum + it.price, 0) + draft.tax);
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <Header
          title={draft.receiptTitle || 'Scan Receipt'}
          subtitle={draft.receiptSubtitle}
          onSubtitleChange={v => setDraft(d => (d ? { ...d, receiptSubtitle: v, description: v } : d))}
          onBack={() => setDraft(null)}
        />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 160 }}>
          <View style={[s.rowBetween, { marginTop: 4 }]}>
            <Text style={s.sectionTitle}>AI Extracted</Text>
            <Pressable onPress={addDraftItem} style={({ pressed }) => [s.smallAction, pressed && s.pressedGlass]}>
              <Ionicons name="add" size={14} color="#0f172a" />
              <Text style={s.smallActionText}>Add Item</Text>
            </Pressable>
          </View>
          {draft.items.map(item => (
            <View key={item.id} style={s.itemRow}>
              <TextInput
                value={item.name}
                onChangeText={v => updateDraftItem(item.id, { name: v })}
                style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#0f172a' }}
              />
              <TextInput
                value={String(item.price)}
                onChangeText={v => updateDraftItem(item.id, { price: parseFloat(v) || 0 })}
                keyboardType="numeric"
                style={{ width: 64, fontSize: 13, fontWeight: '800', color: '#0f172a', textAlign: 'right' }}
              />
              <Pressable onPress={() => removeDraftItem(item.id)}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </Pressable>
            </View>
          ))}
          <View style={[s.rowBetween, { marginTop: 14 }]}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a' }}>Tax</Text>
            <TextInput
              value={String(draft.tax)}
              onChangeText={v => setDraft(d => (d ? { ...d, tax: parseFloat(v) || 0 } : d))}
              keyboardType="numeric"
              style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}
            />
          </View>
          <View style={[s.rowBetween, { marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(15,23,42,0.15)', paddingTop: 10 }]}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>Total</Text>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#0f172a' }}>{formatMoney(total)}</Text>
          </View>

          <Text style={s.label}>Category</Text>
          <View style={s.chipRow}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat}
                onPress={() => setDraft(d => (d ? { ...d, category: cat } : d))}
                style={({ pressed }) => [s.chip, draft.category === cat ? s.chipSelected : s.chipUnselected, pressed && s.pressedGlass]}
              >
                <Text style={[s.chipText, { color: draft.category === cat ? '#fff' : '#0f172a' }]}>{cat}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={proceedFromScanReceipt} style={({ pressed }) => [s.primaryButton, { backgroundColor: buttonBg }, pressed && s.pressedGlass]}>
            <Text style={s.primaryButtonText}>Continue</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    );
  }

  function renderManualEntry() {
    const suggested = manualDescription ? suggestCategory(manualDescription) : null;
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <Header title="Enter Expense" onBack={() => setView('dashboard')} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 160 }}>
          <Text style={s.label}>Amount (RM)</Text>
          <TextInput value={manualAmount} onChangeText={setManualAmount} keyboardType="numeric" style={s.input} placeholder="0.00" placeholderTextColor="rgba(15,23,42,0.4)" />

          <Text style={s.label}>Description</Text>
          <TextInput
            value={manualDescription}
            onChangeText={v => {
              setManualDescription(v);
              if (!manualCategoryTouched) setManualCategory(suggestCategory(v));
            }}
            style={s.input}
            placeholder="e.g. Dinner"
            placeholderTextColor="rgba(15,23,42,0.4)"
          />
          {suggested && !manualCategoryTouched && (
            <Text style={{ fontSize: 11, color: 'rgba(15,23,42,0.6)', marginTop: 6, fontWeight: '600' }}>
              TripShield suggests: <Text style={{ fontWeight: '800' }}>{suggested}</Text>
            </Text>
          )}

          <Text style={s.label}>Category</Text>
          <View style={s.chipRow}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat}
                onPress={() => {
                  setManualCategory(cat);
                  setManualCategoryTouched(true);
                }}
                style={({ pressed }) => [s.chip, manualCategory === cat ? s.chipSelected : s.chipUnselected, pressed && s.pressedGlass]}
              >
                <Text style={[s.chipText, { color: manualCategory === cat ? '#fff' : '#0f172a' }]}>{cat}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            disabled={(parseFloat(manualAmount) || 0) <= 0}
            onPress={proceedFromManualEntry}
            style={({ pressed }) => [s.primaryButton, { backgroundColor: buttonBg, opacity: (parseFloat(manualAmount) || 0) <= 0 ? 0.5 : 1 }, pressed && s.pressedGlass]}
          >
            <Text style={s.primaryButtonText}>Continue</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    );
  }

  function renderSelectTravelers() {
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <Header title="Who's in this expense?" onBack={() => setView(wizardSource === 'receipt' ? 'scanReceipt' : 'manualEntry')} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 160 }}>
          <View style={s.stepperRow}>
            <Pressable onPress={() => changeTravelerCount(-1)} style={({ pressed }) => [s.stepperButton, pressed && { opacity: 0.7 }]}>
              <Ionicons name="remove" size={20} color="#2563eb" />
            </Pressable>
            <Text style={s.stepperValue}>{rosterDraft.length}</Text>
            <Pressable onPress={() => changeTravelerCount(1)} style={({ pressed }) => [s.stepperButton, pressed && { opacity: 0.7 }]}>
              <Ionicons name="add" size={20} color="#2563eb" />
            </Pressable>
          </View>

          {rosterDraft.map(t => (
            <View key={t.id} style={s.travelerRow}>
              <TextInput value={t.name} onChangeText={v => renameRosterTraveler(t.id, v)} style={[s.travelerName, { flex: 1 }]} />
              {rosterDraft.length > 1 && (
                <Pressable onPress={() => removeRosterTraveler(t.id)}>
                  <Ionicons name="close-circle" size={20} color="#dc2626" />
                </Pressable>
              )}
            </View>
          ))}

          <Pressable onPress={proceedFromSelectTravelers} style={({ pressed }) => [s.primaryButton, { backgroundColor: buttonBg }, pressed && s.pressedGlass]}>
            <Text style={s.primaryButtonText}>Continue</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    );
  }

  function renderAssignItems() {
    if (!draft) return null;
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <Header title="Who Had What?" onBack={() => setView('selectTravelers')} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 160 }}>
          {draft.items.map(item => {
            const each = item.travelerIds.length > 0 ? round2(item.price / item.travelerIds.length) : 0;
            return (
              <View key={item.id} style={s.card}>
                <View style={s.rowBetween}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{item.name}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(item.price)}</Text>
                </View>
                <View style={s.chipRow}>
                  {draft.selectedTravelerIds.map(travelerId => {
                    const traveler = rosterDraft.find(t => t.id === travelerId);
                    const selected = item.travelerIds.includes(travelerId);
                    return (
                      <Pressable
                        key={travelerId}
                        onPress={() => toggleItemTraveler(item.id, travelerId)}
                        style={({ pressed }) => [s.chip, selected ? s.chipSelected : s.chipUnselected, pressed && s.pressedGlass]}
                      >
                        {selected && <Ionicons name="checkmark" size={12} color="#fff" />}
                        <Text style={[s.chipText, { color: selected ? '#fff' : '#0f172a' }]}>{traveler?.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {item.travelerIds.length > 1 && (
                  <Text style={{ fontSize: 11, color: 'rgba(15,23,42,0.6)', marginTop: 8, fontWeight: '600' }}>
                    Split equally: {formatMoney(item.price)} / {item.travelerIds.length} = {formatMoney(each)} each
                  </Text>
                )}
              </View>
            );
          })}

          <Pressable
            disabled={draft.items.some(it => it.travelerIds.length === 0)}
            onPress={proceedFromAssignItems}
            style={({ pressed }) => [
              s.primaryButton,
              { backgroundColor: buttonBg, opacity: draft.items.some(it => it.travelerIds.length === 0) ? 0.5 : 1 },
              pressed && s.pressedGlass,
            ]}
          >
            <Text style={s.primaryButtonText}>Continue</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    );
  }

  function renderTaxSplit() {
    if (!draft) return null;
    const subtotals = computeSubtotalsByTraveler(draft.items, draft.selectedTravelerIds);
    const allocatedTax = Object.values(draft.taxAllocation).reduce((sum, v) => sum + v, 0);
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <Header title="Tax & Service Charge" onBack={() => setView('assignItems')} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 160 }}>
          <View style={s.card}>
            <Text style={s.cardLabel}>Tax</Text>
            <Text style={s.bigAmount}>{formatMoney(draft.tax)}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(15,23,42,0.6)', marginTop: 6, fontWeight: '600' }}>
              Split automatically based on each person&apos;s subtotal.
            </Text>
          </View>

          {draft.selectedTravelerIds.map(travelerId => {
            const traveler = rosterDraft.find(t => t.id === travelerId);
            return (
              <View key={travelerId} style={[s.rowBetween, s.card, { marginTop: 10 }]}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>{traveler?.name}</Text>
                  <Text style={{ fontSize: 11, color: 'rgba(15,23,42,0.55)', fontWeight: '600' }}>Subtotal {formatMoney(subtotals[travelerId] || 0)}</Text>
                </View>
                <TextInput
                  value={String(draft.taxAllocation[travelerId] ?? 0)}
                  onChangeText={v => editTaxAllocation(travelerId, v)}
                  keyboardType="numeric"
                  style={{ fontSize: 14, fontWeight: '800', color: '#0f172a', width: 70, textAlign: 'right' }}
                />
              </View>
            );
          })}
          <Text style={{ fontSize: 11, color: allocatedTax > draft.tax + 0.01 ? '#dc2626' : 'rgba(15,23,42,0.55)', marginTop: 8, fontWeight: '700' }}>
            Allocated {formatMoney(allocatedTax)} of {formatMoney(draft.tax)}
          </Text>

          <Pressable onPress={() => setView('selectPayer')} style={({ pressed }) => [s.primaryButton, { backgroundColor: buttonBg }, pressed && s.pressedGlass]}>
            <Text style={s.primaryButtonText}>Continue</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    );
  }

  function renderSelectPayer() {
    if (!draft) return null;
    const subtotals = computeSubtotalsByTraveler(draft.items, draft.selectedTravelerIds);
    const total = round2(draft.items.reduce((sum, it) => sum + it.price, 0) + draft.tax);
    const shares = computeShares(subtotals, draft.taxAllocation);
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <Header title="Who Paid?" onBack={() => setView(draft.tax > 0 ? 'taxSplit' : 'assignItems')} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 160 }}>
          {draft.selectedTravelerIds.map(travelerId => {
            const traveler = rosterDraft.find(t => t.id === travelerId);
            const selected = draft.payerId === travelerId;
            return (
              <Pressable key={travelerId} onPress={() => selectPayer(travelerId)} style={({ pressed }) => [s.travelerRow, selected && { borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.12)' }, pressed && s.pressedGlass]}>
                <Text style={s.travelerName}>{traveler?.name}</Text>
                {selected && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
              </Pressable>
            );
          })}

          {draft.payerId && (
            <View style={s.card}>
              <Text style={s.sectionTitle}>Expense Summary</Text>
              <View style={s.rowBetween}>
                <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Total</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(total)}</Text>
              </View>
              <View style={[s.rowBetween, { marginTop: 6 }]}>
                <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Payer</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{rosterDraft.find(t => t.id === draft.payerId)?.name}</Text>
              </View>
              <View style={[s.rowBetween, { marginTop: 6 }]}>
                <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Payer&apos;s Own Share</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(shares[draft.payerId] || 0)}</Text>
              </View>
              {Object.entries(shares)
                .filter(([id]) => id !== draft.payerId)
                .map(([id, amount]) => (
                  <View key={id} style={[s.rowBetween, { marginTop: 6 }]}>
                    <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>
                      {rosterDraft.find(t => t.id === id)?.name} → {rosterDraft.find(t => t.id === draft.payerId)?.name}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(amount)}</Text>
                  </View>
                ))}
            </View>
          )}

          <Pressable
            disabled={!draft.payerId}
            onPress={() => setView('confirmExpense')}
            style={({ pressed }) => [s.primaryButton, { backgroundColor: buttonBg, opacity: draft.payerId ? 1 : 0.5 }, pressed && s.pressedGlass]}
          >
            <Text style={s.primaryButtonText}>Calculate Split</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    );
  }

  function renderConfirmExpense() {
    if (!draft || !draft.payerId) return null;
    const subtotals = computeSubtotalsByTraveler(draft.items, draft.selectedTravelerIds);
    const shares = computeShares(subtotals, draft.taxAllocation);
    const total = round2(draft.items.reduce((sum, it) => sum + it.price, 0) + draft.tax);
    const payer = rosterDraft.find(t => t.id === draft.payerId);
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <Header title="Confirm Expense" onBack={() => setView('selectPayer')} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 160 }}>
          <View style={s.card}>
            <Text style={s.cardLabel}>{draft.category}</Text>
            <Text style={s.bigAmount}>{formatMoney(total)}</Text>
            <Text style={[s.amountSub, { marginTop: 4 }]}>Paid by {payer?.name}</Text>
          </View>

          <Text style={s.sectionTitle}>Items</Text>
          {draft.items.map(item => (
            <View key={item.id} style={[s.rowBetween, { marginTop: 6 }]}>
              <Text style={{ fontSize: 12, color: '#0f172a', fontWeight: '600' }}>
                {item.name} ({item.travelerIds.map(id => rosterDraft.find(t => t.id === id)?.name).join(', ')})
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#0f172a' }}>{formatMoney(item.price)}</Text>
            </View>
          ))}

          {draft.tax > 0 && (
            <>
              <Text style={s.sectionTitle}>Tax Allocation</Text>
              {Object.entries(draft.taxAllocation).map(([id, amount]) => (
                <View key={id} style={[s.rowBetween, { marginTop: 6 }]}>
                  <Text style={{ fontSize: 12, color: '#0f172a', fontWeight: '600' }}>{rosterDraft.find(t => t.id === id)?.name}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#0f172a' }}>{formatMoney(amount)}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={s.sectionTitle}>Who Owes Whom</Text>
          {Object.entries(shares)
            .filter(([id]) => id !== draft.payerId)
            .map(([id, amount]) => (
              <View key={id} style={[s.rowBetween, { marginTop: 6 }]}>
                <Text style={{ fontSize: 12, color: '#0f172a', fontWeight: '600' }}>
                  {rosterDraft.find(t => t.id === id)?.name} owes {payer?.name}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(amount)}</Text>
              </View>
            ))}

          <Text style={{ fontSize: 11, color: 'rgba(15,23,42,0.6)', marginTop: 16, fontWeight: '600' }}>
            Once confirmed, this expense will be added to your trip ledger.
          </Text>

          <Pressable onPress={confirmAndAddExpense} style={({ pressed }) => [s.primaryButton, { backgroundColor: buttonBg }, pressed && s.pressedGlass]}>
            <Text style={s.primaryButtonText}>Confirm Expense</Text>
          </Pressable>
          <Pressable onPress={() => setView('selectPayer')} style={({ pressed }) => [s.secondaryButton, pressed && s.pressedGlass]}>
            <Text style={s.secondaryButtonText}>Edit</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    );
  }

  function renderExpenseAdded() {
    if (!addedExpense || !trip) return null;
    const payer = trip.travelers.find(t => t.id === addedExpense.paidBy);
    const outstanding = computeOutstanding(addedExpense);
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(74,222,128,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name="checkmark" size={36} color="#22c55e" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#0f172a' }}>Expense Added</Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: 'rgba(15,23,42,0.65)', marginTop: 6 }}>
            {formatMoney(addedExpense.total)} {addedExpense.category} Expense
          </Text>

          <View style={[s.card, { width: '100%' }]}>
            <Text style={s.sectionTitle}>Who Owes Whom</Text>
            {outstanding.map(ob => (
              <View key={ob.fromId} style={[s.rowBetween, { marginTop: 8 }]}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>
                  {trip.travelers.find(t => t.id === ob.fromId)?.name} → {payer?.name}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(ob.amount)}</Text>
              </View>
            ))}
          </View>

          {overspendBanner && (
            <View style={[s.cardDark, { width: '100%', borderColor: '#FDA4AF' }]}>
              <Text style={{ color: '#9F1239', fontSize: 12, fontWeight: '700' }}>Your {overspendBanner} spending is now above target.</Text>
              <Pressable onPress={() => setView('rebalance')} style={({ pressed }) => [s.secondaryButton, { backgroundColor: '#FFFFFF' }, pressed && s.pressedGlass]}>
                <Text style={s.secondaryButtonText}>Review Budget</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            onPress={() => {
              openDailyDetail(addedExpense.date);
            }}
            style={({ pressed }) => [s.primaryButton, { backgroundColor: buttonBg, width: '100%' }, pressed && s.pressedGlass]}
          >
            <Text style={s.primaryButtonText}>View Ledger</Text>
          </Pressable>
          <Pressable onPress={() => setView('dashboard')} style={({ pressed }) => [s.secondaryButton, { width: '100%' }, pressed && s.pressedGlass]}>
            <Text style={s.secondaryButtonText}>Back to Budget</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  function renderRebalance() {
    if (!trip) return null;
    const strategyResults = (['balanced', 'activity-aware', 'strict-saving'] as RebalanceStrategy[]).map(strat => ({
      strat,
      result: computeRebalance(trip, expenses, strat, today),
    }));
    const result = strategyResults.find(r => r.strat === rebalanceStrategy)!.result;
    const strategyLabel = (strat: RebalanceStrategy) => (strat === 'balanced' ? 'Balanced' : strat === 'activity-aware' ? 'Activity-Aware' : 'Strict Saving');
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <Header title="Adaptive Budget Rebalance" onBack={() => setView('dashboard')} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 160 }}>
          <View style={s.card}>
            <Text style={s.sectionTitle}>Current Situation</Text>
            <View style={[s.rowBetween, { marginTop: 8 }]}>
              <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Total Trip Budget</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(trip.totalBudget)}</Text>
            </View>
            <View style={[s.rowBetween, { marginTop: 6 }]}>
              <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Total Spent</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(result.totalSpentSoFar)}</Text>
            </View>
            <View style={[s.rowBetween, { marginTop: 6 }]}>
              <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Remaining</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(result.remainingBudget)}</Text>
            </View>
            <View style={[s.rowBetween, { marginTop: 6 }]}>
              <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Remaining Days</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{result.remainingDays}</Text>
            </View>
            <View style={[s.rowBetween, { marginTop: 6 }]}>
              <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Overspent</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: result.overspent > 0 ? '#dc2626' : '#0f172a' }}>{formatMoney(result.overspent)}</Text>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.sectionTitle}>Choose a rebalancing strategy</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
              {strategyResults.map(({ strat }) => {
                const selected = rebalanceStrategy === strat;
                return (
                  <Pressable
                    key={strat}
                    onPress={() => setRebalanceStrategy(strat)}
                    style={({ pressed }) => [
                      s.secondaryButton,
                      { width: '48%', marginTop: 0, backgroundColor: selected ? buttonBg : 'rgba(255,255,255,0.4)', borderColor: selected ? buttonBg : 'rgba(15,23,42,0.18)' },
                      pressed && s.pressedGlass,
                    ]}
                  >
                    <Text style={[s.secondaryButtonText, selected && { color: '#fff' }]}>{strategyLabel(strat)}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ fontSize: 11, color: 'rgba(15,23,42,0.6)', marginTop: 12, fontWeight: '600' }}>
              {rebalanceStrategy === 'balanced'
                ? 'Small reductions spread evenly across your remaining days.'
                : rebalanceStrategy === 'activity-aware'
                ? 'Protect important upcoming activities and reduce more flexible spending.'
                : 'More aggressive reductions to help stay safely within the total budget.'}
            </Text>

            <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(15,23,42,0.1)', paddingTop: 10 }}>
              {strategyResults.map(({ strat, result: r }) => {
                const selected = strat === rebalanceStrategy;
                return (
                  <View key={strat} style={[s.rowBetween, { marginTop: 6 }]}>
                    <Text style={{ fontSize: 12, fontWeight: selected ? '800' : '600', color: selected ? '#0f172a' : 'rgba(15,23,42,0.6)' }}>{strategyLabel(strat)}</Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: selected ? '#2563eb' : 'rgba(15,23,42,0.6)' }}>{formatMoney(r.updatedAverageDailyTarget)} / day avg</Text>
                      {r.safetyBuffer > 0 && (
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#b45309', marginTop: 1 }}>+{formatMoney(r.safetyBuffer)} buffer held back</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={s.card}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardLabel}>Original Plan</Text>
                {result.originalPlan.map(day => (
                  <View key={day.date} style={[s.rowBetween, { marginTop: 8 }]}>
                    <Text style={{ fontSize: 11, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>{day.label}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a' }}>{formatMoney(day.amount)}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(37,99,235,0.08)', borderRadius: 12, padding: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="sparkles" size={12} color="#2563eb" />
                  <Text style={[s.cardLabel, { color: '#2563eb' }]}>AI Recommendation</Text>
                </View>
                {result.recommendedPlan.map(day => (
                  <View key={day.date} style={[s.rowBetween, { marginTop: 8 }]}>
                    <Text style={{ fontSize: 11, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>{day.label}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '900', color: '#2563eb' }}>{formatMoney(day.amount)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[s.rowBetween, { marginTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(15,23,42,0.1)', paddingTop: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="lock-closed" size={13} color="rgba(15,23,42,0.6)" />
                <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Protected committed expenses</Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(result.protectedCommitted)}</Text>
            </View>
            <View style={[s.rowBetween, { marginTop: 8 }]}>
              <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Flexible budget remaining</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(result.flexibleRemaining)}</Text>
            </View>
            <View style={[s.rowBetween, { marginTop: 8 }]}>
              <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Planned future spending ({strategyLabel(rebalanceStrategy)})</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(result.plannedFutureSpending)}</Text>
            </View>
            <View style={[s.rowBetween, { marginTop: 8 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="shield-checkmark-outline" size={13} color={result.safetyBuffer > 0 ? '#b45309' : 'rgba(15,23,42,0.6)'} />
                <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Safety buffer</Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: result.safetyBuffer > 0 ? '#b45309' : '#0f172a' }}>{formatMoney(result.safetyBuffer)}</Text>
            </View>

            <View style={s.insightBox}>
              <Ionicons name="sparkles" size={16} color="#2563eb" />
              <Text style={s.insightText}>{result.explanation}</Text>
            </View>
          </View>

          <Text style={{ fontSize: 11, color: 'rgba(15,23,42,0.6)', marginTop: 16, fontWeight: '600' }}>
            Accept TripShield&apos;s recommended budget adjustments and update your future spending targets.
          </Text>

          <Pressable onPress={() => applyRebalance(result.recommendedPlan)} style={({ pressed }) => [s.primaryButton, { backgroundColor: buttonBg }, pressed && s.pressedGlass]}>
            <Text style={s.primaryButtonText}>Apply Recommendation</Text>
          </Pressable>
          <Pressable onPress={() => openSetBudget('edit')} style={({ pressed }) => [s.secondaryButton, pressed && s.pressedGlass]}>
            <Text style={s.secondaryButtonText}>Edit Manually</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    );
  }

  function renderRebalanceApplied() {
    if (!trip) return null;
    const result = computeRebalance(trip, expenses, rebalanceStrategy, today);
    return (
      <LinearGradient colors={LEDGER_BG_GRADIENT} locations={[0, 0.46, 1]} style={s.fullScreen}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(74,222,128,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name="checkmark-done" size={36} color="#22c55e" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#0f172a' }}>Budget Updated</Text>
          <Text style={{ fontSize: 13, color: 'rgba(15,23,42,0.65)', marginTop: 6, textAlign: 'center' }}>
            Your remaining budget has been rebalanced.
          </Text>

          <View style={[s.card, { width: '100%' }]}>
            <View style={s.rowBetween}>
              <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Remaining Budget</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(result.remainingBudget)}</Text>
            </View>
            <View style={[s.rowBetween, { marginTop: 8 }]}>
              <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Updated Average Daily Target</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(result.updatedAverageDailyTarget)}</Text>
            </View>
            <View style={[s.rowBetween, { marginTop: 8 }]}>
              <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Protected Committed Expenses</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(result.protectedCommitted)}</Text>
            </View>
            <View style={[s.rowBetween, { marginTop: 8 }]}>
              <Text style={{ fontSize: 12, color: 'rgba(15,23,42,0.6)', fontWeight: '700' }}>Flexible Budget Remaining</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{formatMoney(result.flexibleRemaining)}</Text>
            </View>
            {result.safetyBuffer > 0 && (
              <View style={[s.rowBetween, { marginTop: 8 }]}>
                <Text style={{ fontSize: 12, color: '#b45309', fontWeight: '700' }}>Safety Buffer Reserved</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#b45309' }}>{formatMoney(result.safetyBuffer)}</Text>
              </View>
            )}
          </View>

          <Pressable onPress={() => setView('dashboard')} style={({ pressed }) => [s.primaryButton, { backgroundColor: buttonBg, width: '100%' }, pressed && s.pressedGlass]}>
            <Text style={s.primaryButtonText}>Back to Budget</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  switch (view) {
    case 'dashboard':
      return renderDashboard();
    case 'setBudget':
      return renderSetBudget();
    case 'dailyDetail':
      return renderDailyDetail();
    case 'expenseDetail':
      return renderExpenseDetail();
    case 'scanReceipt':
      return renderScanReceipt();
    case 'manualEntry':
      return renderManualEntry();
    case 'selectTravelers':
      return renderSelectTravelers();
    case 'assignItems':
      return renderAssignItems();
    case 'taxSplit':
      return renderTaxSplit();
    case 'selectPayer':
      return renderSelectPayer();
    case 'confirmExpense':
      return renderConfirmExpense();
    case 'expenseAdded':
      return renderExpenseAdded();
    case 'rebalance':
      return renderRebalance();
    case 'rebalanceApplied':
      return renderRebalanceApplied();
    default:
      return renderDashboard();
  }
}
