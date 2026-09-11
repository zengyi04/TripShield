import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Bell,
  Check,
  ChevronLeft,
  ExternalLink,
  Link2,
  LogOut,
  Sparkles,
  Timer,
  X,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { TripShieldLogo } from '../TripShieldLogo';
import { ActiveScreen } from '../../types';
import {
  AI_PROCESSING_STEPS,
  ACTIVE_BUY_WINDOWS,
  BOOKING_OPTIONS,
  BuyWindow,
  BuyWindowStatus,
  ExtractedItem,
  MOCK_EXTRACTED_ITEMS,
  RECENTLY_IMPORTED,
  ImportedLinkItem,
} from '../../data/mockBuyWindow';

// ─── Props ────────────────────────────────────────────────────────────────────
interface BuyWindowScreenProps {
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  onNavigate?: (screen: ActiveScreen) => void;
  onGoHome?: () => void;
}

// ─── Buy Window Status Config ─────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  BuyWindowStatus,
  { label: string; dot: string; bg: string; border: string; text: string; badgeBg: string; badgeText: string }
> = {
  FAVORABLE: {
    label: 'FAVORABLE',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  WATCH: {
    label: 'WATCH',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
  URGENT: {
    label: 'URGENT',
    dot: 'bg-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
  },
  UNKNOWN: {
    label: 'UNKNOWN',
    dot: 'bg-slate-400',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
  },
};

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(expiresAt: number) {
  const [remaining, setRemaining] = useState(Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining(prev => {
        const next = Math.max(0, expiresAt - Date.now());
        if (next <= 0) clearInterval(id);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);
  const expired = remaining <= 0;

  return { hours, minutes, seconds, expired };
}

// ─── AI Processing ────────────────────────────────────────────────────────────
type AnalysisPhase = 'idle' | 'analyzing' | 'done';

function AIProcessingView({ onDone }: { onDone: () => void }) {
  const [completedSteps, setCompletedSteps] = useState<number>(0);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    AI_PROCESSING_STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        setCompletedSteps(i + 1);
        if (i === AI_PROCESSING_STEPS.length - 1) {
          setTimeout(onDone, 300);
        }
      }, step.durationMs);
      timeouts.push(t);
    });
    return () => timeouts.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="rounded-2xl bg-blue-950 border border-blue-800 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
          <Sparkles size={16} className="text-blue-300 animate-pulse" />
        </div>
        <div>
          <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">
            ✨ TripShield is analyzing your link
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {AI_PROCESSING_STEPS.map((step, i) => {
          const isDone = i < completedSteps;
          const isActive = i === completedSteps;
          return (
            <div key={step.id} className="flex items-center gap-2.5">
              {isDone ? (
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              ) : isActive ? (
                <div className="w-[15px] h-[15px] rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0" />
              ) : (
                <Circle size={15} className="text-blue-700 shrink-0" />
              )}
              <span
                className={`text-[11px] font-semibold ${
                  isDone ? 'text-emerald-300' : isActive ? 'text-blue-200' : 'text-blue-700'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Extraction Results ───────────────────────────────────────────────────────
interface ExtractionResultsProps {
  items: ExtractedItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onAddSelected: () => void;
  onCancel: () => void;
  existingIds: Set<string>;
}

function ExtractionResults({
  items,
  selected,
  onToggle,
  onAddSelected,
  onCancel,
  existingIds,
}: ExtractionResultsProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-3.5 py-3 bg-slate-50 border-b border-slate-100">
        <p className="text-slate-800 text-xs font-extrabold">
          TripShield found {items.length} travel ideas
        </p>
        <p className="text-slate-500 text-[10px] font-semibold mt-0.5">
          Select the ones you'd like to add to your trip
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map(item => {
          const isSelected = selected.has(item.id);
          const isDuplicate = existingIds.has(item.name.toLowerCase());
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className="w-full px-3.5 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-slate-300'
                }`}
              >
                {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
              </div>
              <span className="text-base leading-none shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-slate-800 text-xs font-extrabold leading-tight truncate">
                    {item.name}
                  </p>
                  {isDuplicate && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                      SAVED
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
                  {item.location} · {item.type}
                  {item.price ? ` · ${item.currency}${item.price}` : ''}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-100 flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-extrabold cursor-pointer hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onAddSelected}
          disabled={selected.size === 0}
          className="flex-[2] py-2.5 rounded-xl bg-blue-600 text-white text-[11px] font-extrabold cursor-pointer hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
          id="buy-window-add-selected-btn"
        >
          <Check size={13} strokeWidth={3} />
          Add selected ({selected.size})
        </button>
      </div>
    </div>
  );
}

// ─── Buy Window Card ──────────────────────────────────────────────────────────
function BuyWindowCard({
  bw,
  onViewOptions,
  onReset,
}: {
  bw: BuyWindow;
  onViewOptions: () => void;
  onReset: () => void;
}) {
  const cfg = STATUS_CONFIG[bw.status];
  const { hours, minutes, seconds, expired } = useCountdown(bw.expiresAt);

  return (
    <div
      className={`rounded-2xl border ${cfg.bg} ${cfg.border} overflow-hidden shadow-sm`}
      id={`buy-window-card-${bw.id}`}
    >
      {/* Header */}
      <div className="px-3.5 pt-3.5 pb-2.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Flame size={18} className={cfg.text} />
            <div>
              <p className={`text-[10px] font-extrabold uppercase tracking-wider ${cfg.text}`}>
                Active Buy Window
              </p>
              <p className="text-slate-800 text-sm font-black leading-tight mt-0.5">
                {bw.route}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${cfg.badgeBg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            <span className={`text-[10px] font-extrabold ${cfg.badgeText}`}>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Price */}
        <p className="text-slate-900 text-2xl font-black mt-2.5 tracking-tight">
          {bw.price}
        </p>
        <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
          Ref range: {bw.referenceRange}
        </p>
      </div>

      {/* Countdown or Expired */}
      <div className="mx-3.5 rounded-xl bg-white/60 border border-white/80 px-3 py-2.5 mb-3">
        {expired ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-[10px] font-extrabold uppercase tracking-wider">
                Window Expired
              </p>
              <p className="text-slate-500 text-[10px] font-semibold mt-0.5">
                TripShield will reassess this opportunity.
              </p>
            </div>
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-blue-600 text-[10px] font-extrabold cursor-pointer hover:text-blue-700"
            >
              <RefreshCw size={12} /> Check again
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                Recommended booking window
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Clock size={12} className={cfg.text} />
                <span className={`text-sm font-black tabular-nums ${cfg.text}`}>
                  {String(hours).padStart(2, '0')}h{' '}
                  {String(minutes).padStart(2, '0')}m{' '}
                  {String(seconds).padStart(2, '0')}s
                </span>
                <span className="text-slate-400 text-[10px] font-semibold ml-0.5">
                  remaining
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="px-3.5 text-slate-600 text-[11px] font-semibold leading-relaxed mb-3">
        {bw.statusDescription}
      </p>

      {/* CTA */}
      {!expired && (
        <div className="px-3.5 pb-3.5">
          <button
            onClick={onViewOptions}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
            id="buy-window-view-options-btn"
          >
            View booking options
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Recently Imported ────────────────────────────────────────────────────────
function RecentlyImportedCard({ item }: { item: ImportedLinkItem }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <span className="text-lg leading-none shrink-0">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-slate-800 text-xs font-extrabold leading-tight truncate">
          {item.name}
        </p>
        <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
          {item.category} · {item.location}
        </p>
      </div>
      <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 shrink-0">
        {item.source}
      </span>
    </div>
  );
}

// ─── Booking Options Modal ────────────────────────────────────────────────────
function BookingOptionsModal({
  bw,
  onClose,
}: {
  bw: BuyWindow;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      id="booking-options-modal-backdrop"
    >
      <div
        className="w-full max-w-[420px] rounded-t-[32px] sm:rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        id="booking-options-modal"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <Timer size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Compare booking options
              </p>
              <h3 className="text-slate-900 text-sm font-black leading-tight">
                ✈️ {bw.route}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X size={14} className="text-slate-600" />
          </button>
        </div>

        {/* Options */}
        <div className="px-5 py-4 flex flex-col gap-3">
          {BOOKING_OPTIONS.map((opt, i) => (
            <div
              key={opt.id}
              className={`rounded-2xl border p-4 flex items-center gap-3 ${
                i === 0
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-2xl leading-none">{opt.platformIcon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-slate-800 text-xs font-extrabold">
                    {opt.platform}
                  </p>
                  {opt.tag && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {opt.tag}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[10px] font-semibold mt-0.5">
                  {opt.label}
                </p>
                <p className="text-slate-900 text-sm font-black mt-1">
                  {opt.price}
                </p>
              </div>
              <button
                onClick={() => window.open(opt.url, '_blank', 'noopener')}
                className={`px-3 py-2 rounded-xl text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${
                  i === 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                View deal <ExternalLink size={11} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <p className="text-slate-400 text-[10px] text-center font-semibold">
            Frontend simulation only · No real bookings are made
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Duplicate Confirm Modal ───────────────────────────────────────────────────
function DuplicateModal({
  itemName,
  onKeep,
  onAddAnyway,
}: {
  itemName: string;
  onKeep: () => void;
  onAddAnyway: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
      onClick={onKeep}
    >
      <div
        className="w-full max-w-xs rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 flex flex-col gap-3"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <span className="text-3xl">🔍</span>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1">
            Looks like you already saved this.
          </p>
          <p className="text-slate-900 text-sm font-black mt-1">{itemName}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onKeep}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-extrabold cursor-pointer hover:bg-slate-200 transition-colors"
          >
            Keep existing
          </button>
          <button
            onClick={onAddAnyway}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-[11px] font-extrabold cursor-pointer hover:bg-blue-700 transition-colors"
          >
            Add anyway
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const BuyWindowScreen: React.FC<BuyWindowScreenProps> = ({
  topColor,
  onNavigate,
  onGoHome,
}) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [linkInput, setLinkInput] = useState('');
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>('idle');
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importedItems, setImportedItems] = useState<ImportedLinkItem[]>(RECENTLY_IMPORTED);
  const [existingNames, setExistingNames] = useState<Set<string>>(
    new Set(RECENTLY_IMPORTED.map(i => i.name.toLowerCase()))
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [buyWindows, setBuyWindows] = useState(ACTIVE_BUY_WINDOWS);
  const [duplicateItem, setDuplicateItem] = useState<ExtractedItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Analyze link ───────────────────────────────────────────────────────────
  const handleAnalyze = () => {
    const url = linkInput.trim();
    if (!url) {
      inputRef.current?.focus();
      return;
    }
    setAnalysisPhase('analyzing');
    setExtractedItems([]);
    setSelectedIds(new Set());
  };

  const handleAnalysisDone = useCallback(() => {
    setAnalysisPhase('done');
    const items = MOCK_EXTRACTED_ITEMS;
    setExtractedItems(items);
    // Pre-select items that are not already imported
    const preselect = new Set(
      items.filter(i => i.defaultSelected).map(i => i.id)
    );
    setSelectedIds(preselect);
  }, []);

  // ── Toggle item selection ──────────────────────────────────────────────────
  const toggleItem = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Add selected items ─────────────────────────────────────────────────────
  const handleAddSelected = () => {
    const toAdd = extractedItems.filter(i => selectedIds.has(i.id));

    // Check for any duplicate
    const firstDuplicate = toAdd.find(i => existingNames.has(i.name.toLowerCase()));
    if (firstDuplicate) {
      setDuplicateItem(firstDuplicate);
      return;
    }

    addItems(toAdd);
  };

  const addItems = (items: ExtractedItem[]) => {
    const newImports: ImportedLinkItem[] = items.map(i => ({
      id: `imp-${Date.now()}-${i.id}`,
      emoji: i.emoji,
      name: i.name,
      category: i.type,
      location: i.location,
      source: 'TikTok',
      importedAt: 'Just now',
    }));

    setImportedItems(prev => [...newImports, ...prev]);
    setExistingNames(prev => {
      const next = new Set(prev);
      items.forEach(i => next.add(i.name.toLowerCase()));
      return next;
    });

    triggerToast(`✓ ${items.length} item${items.length !== 1 ? 's' : ''} added to your trip`);
    setAnalysisPhase('idle');
    setExtractedItems([]);
    setSelectedIds(new Set());
    setLinkInput('');
    setDuplicateItem(null);
  };

  // ── Reset a buy window ─────────────────────────────────────────────────────
  const handleResetWindow = (id: string) => {
    // Re-create with fresh expiry for demo purposes
    setBuyWindows(prev =>
      prev.map(bw =>
        bw.id === id
          ? { ...bw, expiresAt: Date.now() + (47 * 60 + 32) * 60 * 1000 }
          : bw
      )
    );
  };

  const activeBw = buyWindows.find(b => b.id === activeWindowId) ?? buyWindows[0];

  return (
    <div
      className="w-full h-full flex flex-col select-none overflow-hidden relative"
      id="tripshield-buy-window-screen"
    >
      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[340px] bg-slate-900 text-white p-3 rounded-2xl border border-blue-400 shadow-2xl flex items-center gap-2.5 text-xs font-semibold">
          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
            <Check size={14} strokeWidth={3} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Booking Modal ──────────────────────────────────────────────────── */}
      {showBookingModal && activeBw && (
        <BookingOptionsModal
          bw={activeBw}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {/* ── Duplicate Modal ────────────────────────────────────────────────── */}
      {duplicateItem && (
        <DuplicateModal
          itemName={duplicateItem.name}
          onKeep={() => setDuplicateItem(null)}
          onAddAnyway={() => {
            const toAdd = extractedItems.filter(i => selectedIds.has(i.id));
            addItems(toAdd);
          }}
        />
      )}

      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <div
        className="w-full pt-3 pb-3 px-3.5 flex items-center justify-between shadow-sm shrink-0 z-20"
        style={{ backgroundColor: topColor }}
        id="buy-window-top-bar"
      >
        <div className="flex items-center gap-2">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-8 h-8 rounded-full bg-white/70 hover:bg-white flex items-center justify-center cursor-pointer transition-colors"
              id="buy-window-back-btn"
            >
              <ChevronLeft size={18} className="text-slate-700" />
            </button>
          )}
          <div className="relative">
            <TripShieldLogo size={32} />
          </div>
          <div>
            <h1 className="text-xs font-black text-slate-900 tracking-tight leading-none">
              Buy Window
            </h1>
          </div>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('welcome')}
            id="buy-window-logout-btn"
            className="h-8 px-2.5 rounded-full bg-white/70 hover:bg-white flex items-center gap-1 text-[10px] font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <LogOut size={12} className="text-slate-600" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}
      </div>

      {/* ── Scrollable Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-100" id="buy-window-scroll-body">
        <div className="px-3.5 pt-4 pb-28 flex flex-col gap-5">

          {/* ── Hero / Link Importer ──────────────────────────────────────── */}
          <div id="buy-window-hero">
            <div
              className="rounded-2xl overflow-hidden shadow-md"
              style={{
                background: 'linear-gradient(135deg, #255887 0%, #1a3c5e 100%)',
              }}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={18} className="text-amber-400" />
                  <p className="text-blue-200 text-[10px] font-extrabold uppercase tracking-wider">
                    Buy Window
                  </p>
                </div>
                <h2 className="text-white text-sm font-black leading-tight">
                  Turn travel inspiration into action.
                </h2>
                <p className="text-blue-200 text-[11px] font-semibold leading-relaxed mt-1.5">
                  Paste a TikTok, Instagram, flight, hotel, or travel link and
                  TripShield will analyze it.
                </p>

                {/* ── Input Row ── */}
                <div className="mt-3 flex gap-2" id="buy-window-link-input-row">
                  <div className="flex-1 flex items-center gap-2 bg-white/15 border border-white/25 rounded-xl px-3 py-2.5 focus-within:border-white/50 transition-colors">
                    <Link2 size={14} className="text-blue-300 shrink-0" />
                    <input
                      ref={inputRef}
                      type="url"
                      value={linkInput}
                      onChange={e => setLinkInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                      placeholder="Paste a travel link…"
                      className="flex-1 bg-transparent text-white text-[11px] font-semibold placeholder-blue-300/70 focus:outline-none min-w-0"
                      id="buy-window-link-input"
                    />
                    {linkInput && (
                      <button
                        onClick={() => setLinkInput('')}
                        className="text-blue-300 hover:text-white cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={analysisPhase === 'analyzing'}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-[11px] font-extrabold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center gap-1.5 shadow-md"
                    id="buy-window-analyze-btn"
                  >
                    {analysisPhase === 'analyzing' ? (
                      <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles size={13} />
                    )}
                    Analyze Link
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── AI Processing ─────────────────────────────────────────────── */}
          {analysisPhase === 'analyzing' && (
            <AIProcessingView onDone={handleAnalysisDone} />
          )}

          {/* ── Extraction Results ────────────────────────────────────────── */}
          {analysisPhase === 'done' && extractedItems.length > 0 && (
            <ExtractionResults
              items={extractedItems}
              selected={selectedIds}
              onToggle={toggleItem}
              onAddSelected={handleAddSelected}
              onCancel={() => {
                setAnalysisPhase('idle');
                setExtractedItems([]);
                setSelectedIds(new Set());
              }}
              existingIds={existingNames}
            />
          )}

          {/* ── Active Buy Windows ────────────────────────────────────────── */}
          {buyWindows.length > 0 && (
            <div id="buy-window-active-section">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                🔥 Active Buy Windows
              </p>
              <div className="flex flex-col gap-3">
                {buyWindows.map(bw => (
                  <BuyWindowCard
                    key={bw.id}
                    bw={bw}
                    onViewOptions={() => {
                      setActiveWindowId(bw.id);
                      setShowBookingModal(true);
                    }}
                    onReset={() => handleResetWindow(bw.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Recently Imported ─────────────────────────────────────────── */}
          {importedItems.length > 0 && (
            <div id="buy-window-recently-imported">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                Recently Imported
              </p>
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {importedItems.slice(0, 6).map(item => (
                  <RecentlyImportedCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* ── Empty state: no imported items yet ────────────────────────── */}
          {importedItems.length === 0 && analysisPhase === 'idle' && (
            <div
              className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 flex flex-col items-center gap-3 text-center"
              id="buy-window-empty-state"
            >
              <span className="text-4xl">🔗</span>
              <div>
                <p className="text-slate-800 text-xs font-extrabold">
                  No active Buy Windows yet.
                </p>
                <p className="text-slate-400 text-[11px] font-semibold mt-1 leading-relaxed">
                  Paste a flight, hotel, or travel link above to find
                  opportunities.
                </p>
              </div>
              <button
                onClick={() => inputRef.current?.focus()}
                className="mt-1 px-4 py-2 rounded-xl bg-blue-600 text-white text-[11px] font-extrabold cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <Link2 size={13} /> Analyze a link
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
