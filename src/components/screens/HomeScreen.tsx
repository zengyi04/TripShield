import React, { useState } from 'react';
import {
  Bell,
  LogOut,
  Sparkles,
  Timer,
  Users,
  Receipt,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Calendar,
  ArrowRight,
  Plus,
  Link2,
} from 'lucide-react';
import { TripShieldLogo } from '../TripShieldLogo';
import { ActiveScreen } from '../../types';
import { Toast } from '../Toast';
import {
  ACTIVE_TRIP,
  ITINERARY_ITEMS,
  ACTIVE_BUY_WINDOWS,
  FEATURE_SUMMARIES,
  AI_INSIGHT,
  FeatureSummary,
} from '../../data/mockBuyWindow';

interface HomeScreenProps {
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
  onNavigate?: (screen: ActiveScreen) => void;
  onSwitchToBuyWindow?: () => void;
  onOpenConsensus?: () => void;
  onOpenSelfHealing?: () => void;
}

// ─── Greeting helper ──────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// ─── Status colour maps ───────────────────────────────────────────────────────
const statusBg: Record<FeatureSummary['statusColor'], string> = {
  emerald: 'bg-emerald-50 border-emerald-100',
  amber: 'bg-amber-50 border-amber-100',
  blue: 'bg-blue-50 border-blue-100',
  slate: 'bg-slate-50 border-slate-100',
};
const statusText: Record<FeatureSummary['statusColor'], string> = {
  emerald: 'text-emerald-700',
  amber: 'text-amber-700',
  blue: 'text-blue-700',
  slate: 'text-slate-700',
};

// ─── Component ────────────────────────────────────────────────────────────────
export const HomeScreen: React.FC<HomeScreenProps> = ({
  topColor,
  onNavigate,
  onSwitchToBuyWindow,
  onOpenConsensus,
  onOpenSelfHealing,
}) => {
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Today's itinerary items
  const today = new Date().toISOString().split('T')[0];
  const todayItems = ITINERARY_ITEMS.filter(i => i.date === today);
  // If none match today (demo data is Jun 2026), show first 2 as preview
  const previewItems =
    todayItems.length > 0 ? todayItems : ITINERARY_ITEMS.slice(0, 2);

  const activeBuyWindow = ACTIVE_BUY_WINDOWS[0];

  // Feature card handler — routes to existing screens when available
  const handleFeatureCard = (id: FeatureSummary['id']) => {
    if (id === 'buy-window' && onSwitchToBuyWindow) {
      onSwitchToBuyWindow();
    } else if (id === 'consensus' && onOpenConsensus) {
      onOpenConsensus();
    } else if (id === 'self-healing' && onOpenSelfHealing) {
      onOpenSelfHealing();
    } else if (id === 'ledger') {
      triggerToast('💰 Ledger is coming soon!');
    } else {
      triggerToast('Opening ' + id + '…');
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col select-none overflow-hidden relative"
      id="tripshield-home-screen"
    >
      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      <Toast message={toastMessage} />

      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <div
        className="w-full pt-3 pb-3 px-3.5 flex flex-col gap-2 shadow-sm shrink-0 relative z-20"
        style={{ backgroundColor: topColor }}
        id="home-top-bar"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <TripShieldLogo size={28} />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">
                TripShield
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-slate-700 leading-none">
                  Alex Morgan
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white text-blue-900 leading-none shadow-xs">
                  PRO
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotificationPopup(!showNotificationPopup)}
              id="notifications-bell-btn"
              className="w-8 h-8 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-slate-800 transition-colors relative cursor-pointer shadow-xs"
              title="Notifications"
            >
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('welcome')}
                id="home-logout-btn"
                className="h-8 px-2.5 rounded-full bg-white/70 hover:bg-white flex items-center gap-1 text-[10px] font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
                title="Log out back to frontpage"
              >
                <LogOut size={12} className="text-slate-600" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Dropdown */}
        {showNotificationPopup && (
          <div className="absolute top-14 right-3 z-40 w-72 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
              <span className="font-bold text-[11px] uppercase tracking-wider text-blue-300">
                Travel Alerts
              </span>
              <button
                onClick={() => setShowNotificationPopup(false)}
                className="text-white/60 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="bg-amber-950/60 border border-amber-700/50 p-2.5 rounded-xl text-[11px]">
              <span className="font-bold text-amber-300 block">🔥 Buy Window Active</span>
              <span className="text-slate-300 text-[10px]">
                KL → Paris flight opportunity detected. 47h remaining.
              </span>
            </div>
            <div className="bg-slate-800 p-2 rounded-xl text-[11px]">
              <span className="font-bold text-emerald-300 block">✈️ Flight Fare Alert</span>
              <span className="text-slate-300 text-[10px]">Kuala Lumpur to Paris fares dropped to RM 2,850.</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Scrollable Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-100" id="home-scroll-body">
        <div className="px-3.5 pt-4 pb-28 flex flex-col gap-4">

          {/* ── Greeting ──────────────────────────────────────────────────── */}
          <div>
            <p className="text-slate-500 text-[11px] font-semibold">
              {getGreeting()} 👋
            </p>
            <h2 className="text-slate-800 text-sm font-black mt-0.5 leading-tight">
              Here's what's happening with your trip.
            </h2>
          </div>

          {/* ── Trip Overview Card ────────────────────────────────────────── */}
          <div
            className="rounded-2xl overflow-hidden shadow-md border border-slate-200"
            style={{
              background: 'linear-gradient(135deg, #255887 0%, #1a3c5e 100%)',
            }}
            id="home-trip-overview-card"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl">
                    {ACTIVE_TRIP.flag}
                  </div>
                  <div>
                    <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">
                      Active Trip
                    </p>
                    <h3 className="text-white text-sm font-black leading-tight">
                      {ACTIVE_TRIP.tripName}
                    </h3>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                  PLANNED
                </span>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-blue-300" />
                  <span className="text-blue-100 text-[11px] font-semibold">
                    {ACTIVE_TRIP.dateRange}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-blue-300" />
                  <span className="text-blue-100 text-[11px] font-semibold">
                    {ACTIVE_TRIP.travelers} travelers
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-blue-300" />
                  <span className="text-blue-100 text-[11px] font-semibold">
                    {ACTIVE_TRIP.destination}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Attention Alert: Buy Window ───────────────────────────────── */}
          {activeBuyWindow && (
            <div id="home-buy-window-alert">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                What needs your attention?
              </p>
              <button
                onClick={() => onSwitchToBuyWindow?.()}
                className="w-full text-left rounded-2xl bg-amber-50 border border-amber-200 p-3.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                id="home-buy-window-alert-card"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Timer size={18} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-600">
                        🔥 Buy Window
                      </span>
                    </div>
                    <p className="text-slate-900 text-xs font-black leading-tight mt-0.5">
                      Flight opportunity detected
                    </p>
                    <p className="text-slate-500 text-[10px] font-semibold mt-0.5">
                      47h remaining · {activeBuyWindow.route}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-amber-600 group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight size={16} />
                  </div>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-amber-200 flex items-center justify-between">
                  <span className="text-[10px] text-amber-700 font-semibold">
                    {activeBuyWindow.price} · Favorable price detected
                  </span>
                  <span className="text-[10px] font-extrabold text-amber-700 flex items-center gap-0.5">
                    View Buy Window <ArrowRight size={11} className="inline ml-0.5" />
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* ── AI Insight ────────────────────────────────────────────────── */}
          <div
            className="rounded-2xl bg-blue-600 p-3.5 shadow-md flex items-start gap-3"
            id="home-ai-insight"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">
                ✨ TripShield Insight
              </p>
              <p className="text-white text-xs font-bold leading-snug mt-0.5">
                {AI_INSIGHT.message}
              </p>
              <p className="text-blue-200 text-[10px] mt-0.5 leading-snug">
                {AI_INSIGHT.detail}
              </p>
            </div>
          </div>

          {/* ── Quick Actions ─────────────────────────────────────────────── */}
          <div id="home-quick-actions">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
              Quick Actions
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSwitchToBuyWindow?.()}
                className="rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2 shadow-xs hover:shadow-sm transition-shadow cursor-pointer text-left"
                id="quick-action-buy-window"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Link2 size={15} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-slate-800 text-[11px] font-extrabold leading-tight">
                    Add travel inspiration
                  </p>
                  <p className="text-slate-400 text-[9px] font-semibold mt-0.5">
                    Paste a link
                  </p>
                </div>
              </button>

              <button
                onClick={() => onSwitchToBuyWindow?.()}
                className="rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2 shadow-xs hover:shadow-sm transition-shadow cursor-pointer text-left"
                id="quick-action-view-buy-window"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Timer size={15} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-slate-800 text-[11px] font-extrabold leading-tight">
                    View Buy Window
                  </p>
                  <p className="text-slate-400 text-[9px] font-semibold mt-0.5">
                    2 opportunities
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* ── Itinerary Preview ─────────────────────────────────────────── */}
          <div id="home-itinerary-preview">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Your Itinerary
              </p>
              <button
                onClick={() => triggerToast('Full itinerary coming soon!')}
                className="text-blue-600 text-[10px] font-extrabold flex items-center gap-0.5 cursor-pointer hover:text-blue-700"
              >
                View all <ChevronRight size={12} />
              </button>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
              {/* Day label */}
              <div className="px-3.5 py-2 bg-slate-50">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {today === ITINERARY_ITEMS[0].date ? 'Today' : 'Jun 14'} · Paris
                </span>
              </div>
              {previewItems.map(item => (
                <div
                  key={item.id}
                  className="px-3.5 py-2.5 flex items-center gap-3"
                >
                  <span className="text-lg leading-none">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-xs font-extrabold leading-tight truncate">
                      {item.name}
                    </p>
                    <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
                      {item.location} · {item.type}
                      {item.price && ` · ${item.currency}${item.price}`}
                    </p>
                  </div>
                </div>
              ))}
              <button
                onClick={() => triggerToast('Full itinerary coming soon!')}
                className="w-full px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-blue-600 text-[11px] font-extrabold cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <Plus size={13} />
                View full itinerary
              </button>
            </div>
          </div>

          {/* ── TripShield at a Glance ────────────────────────────────────── */}
          <div id="home-feature-glance">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
              TripShield at a glance
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FEATURE_SUMMARIES.map(feat => (
                <button
                  key={feat.id}
                  onClick={() => handleFeatureCard(feat.id)}
                  id={`feature-card-${feat.id}`}
                  className={`rounded-2xl border p-3 flex flex-col gap-1.5 shadow-xs hover:shadow-sm transition-shadow cursor-pointer text-left ${statusBg[feat.statusColor]}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base leading-none">{feat.emoji}</span>
                    <ChevronRight size={13} className={statusText[feat.statusColor]} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-extrabold uppercase tracking-wider ${statusText[feat.statusColor]}`}>
                      {feat.label}
                    </p>
                    <p className="text-slate-700 text-xs font-black leading-tight mt-0.5">
                      {feat.metric}
                    </p>
                    {feat.sub && (
                      <p className="text-slate-500 text-[10px] font-semibold mt-0.5">
                        {feat.sub}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
