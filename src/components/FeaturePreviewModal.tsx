import React, { useState } from 'react';
import { FeatureTab } from './BottomNavigation';
import { Timer, Sparkles, Receipt, ShieldAlert, CheckCircle2, ArrowRight, X, Users, Zap, CloudRain, MapPin, RotateCcw } from 'lucide-react';

export type DecisionFeature = 'buy-window' | 'consensus' | 'ledger' | 'self-healing';

interface FeaturePreviewModalProps {
  featureTab: DecisionFeature | FeatureTab | null;
  onClose: () => void;
  accentColor: string;
}

export const FeaturePreviewModal: React.FC<FeaturePreviewModalProps> = ({
  featureTab,
  onClose,
  accentColor,
}) => {
  const [consensusStep, setConsensusStep] = useState(0);
  const [consensusLocked, setConsensusLocked] = useState(false);
  const [pivotSimulated, setPivotSimulated] = useState(false);

  if (!featureTab || featureTab === 'home') return null;

  const activeKey: DecisionFeature = featureTab as DecisionFeature;

  const featureDetails: Record<
    DecisionFeature,
    {
      title: string;
      subtitle: string;
      tag: string;
      icon: React.ComponentType<{ size?: number; className?: string }>;
      mechanism: string;
      execution: string;
      pitchMetric: string;
      speedImpact: string;
      techStack: string;
    }
  > = {
    'buy-window': {
      title: 'Decisive Buy Window & Smart Link Aggregator',
      subtitle: 'LLM Link Extraction & AI Price Countdown Lock',
      tag: 'Decisive Buy Window',
      icon: Timer,
      mechanism:
        'LLMs (Gemini/OpenAI) extract location and flight data from pasted TikTok/IG links directly into interactive itinerary cards. An AI price engine sets decisive group countdown timers ("Best Paris flight price detected: 48h lock-in window").',
      execution:
        'Bypasses complex booking engine gatekeeping by utilizing dynamic deep-link redirects (Skyscanner & Booking.com) to drive fast affiliate conversions without payment UX friction.',
      pitchMetric: 'Reduces flight deliberation from 4 days to 40 seconds',
      speedImpact: 'Stops hesitation with decisive lock-in push alerts',
      techStack: 'Gemini API (JSON Mode), Skyscanner Affiliate Engine',
    },
    'consensus': {
      title: 'Compromise Engine',
      subtitle: 'Travel DNA, conflict radar, and fair group decisions',
      tag: 'Travel DNA + Compromise',
      icon: Sparkles,
      mechanism:
        'Group members complete a rapid 60-second swipe deck capturing budget limits, vibe choices, and non-negotiables to mathematically map everyone’s "Travel DNA."',
      execution:
        'A constraint-satisfaction algorithm calculates mathematical overlaps to instantly build a locked schedule. Features a Deadlock Breaker: if opinions clash, it selects the option that maximizes collective group satisfaction—no endless chat debates.',
      pitchMetric: 'Resolves 4 conflicting preferences in under 30 seconds',
      speedImpact: 'Turns hours of WhatsApp debates into instant lock-in',
      techStack: 'Node.js / Python Constraint Satisfaction Engine',
    },
    'ledger': {
      title: 'Adaptive Ledger & Dynamic Budget Splitter',
      subtitle: 'OCR Receipt Scanning & Reactive Balance Math',
      tag: 'Winning Feature 3',
      icon: Receipt,
      mechanism:
        'Integrated OCR receipt scanning (Google Cloud Vision API) parses paper bills and restaurant checks, automatically splitting line items across members into a real-time net IOUs balance.',
      execution:
        'Features reactive ledger math logic: if the group overspends on Day 1, TripShield dynamically recalibrates and rebalances recommended daily spend targets for Days 2–5 to prevent awkward financial disputes.',
      pitchMetric: 'Zero manual spreadsheets, 100% dispute elimination',
      speedImpact: 'Instant paper-to-net balance with auto-rebalancing caps',
      techStack: 'Google Cloud Vision API, Firebase Realtime Database',
    },
    'self-healing': {
      title: 'Self-Healing Pivot & "What-If" Simulator',
      subtitle: 'Live Trip Health Score (0–100) & Instant Re-routing',
      tag: 'Self-Healing Pivot',
      icon: ShieldAlert,
      mechanism:
        'Continuously monitors route delays, transit congestion, and weather shifts via OpenWeather and Google Maps APIs to maintain an active Trip Health Score (0–100).',
      execution:
        'When disruptions strike (such as a 3-hour flight delay or sudden thunderstorm), users tap once to simulate alternative timelines. The system auto-reroutes the afternoon to nearby partner businesses, saving lost time while filling off-peak merchant tables.',
      pitchMetric: 'Single-tap auto replan with B2B demand matching',
      speedImpact: '"Something went wrong. Don\'t worry—I already fixed your trip."',
      techStack: 'OpenWeather API, Google Places & Distance Matrix API',
    },
  };

  const current = featureDetails[activeKey];
  if (!current) return null;
  const Icon = current.icon;

  const consensusOptions = [
    { label: 'Street food crawl', meta: 'RM45 - 92% group fit', color: '#FDE68A' },
    { label: 'Rooftop dinner', meta: 'RM120 - 74% group fit', color: '#BFDBFE' },
    { label: 'Night market', meta: 'RM30 - 88% group fit', color: '#BBF7D0' },
  ];

  const renderConceptDemo = () => {
    if (activeKey === 'consensus') {
      const option = consensusOptions[consensusStep];
      return (
        <div className="rounded-2xl bg-white p-3.5 text-slate-900 shadow-lg border border-white/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center"><Users size={16} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Group pulse</p>
                <p className="text-xs font-black">4 travelers · 60 sec left</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-600">{consensusLocked ? 'LOCKED' : `${consensusStep + 1}/3`}</span>
          </div>
          {consensusLocked ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
              <div className="flex items-center gap-2 text-emerald-700 mb-1"><CheckCircle2 size={16} /><span className="text-xs font-black">Consensus reached</span></div>
              <p className="text-[11px] text-slate-600 leading-relaxed">Night market wins with the highest shared satisfaction score.</p>
            </div>
          ) : (
            <>
              <div className="rounded-xl p-3 mb-2.5 min-h-[92px] flex flex-col justify-end" style={{ backgroundColor: option.color }}>
                <span className="text-[10px] font-bold text-slate-600">Tonight&apos;s best overlap</span>
                <span className="text-base font-black text-slate-900">{option.label}</span>
                <span className="text-[10px] font-bold text-slate-700">{option.meta}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setConsensusStep(step => (step + 1) % consensusOptions.length)} className="py-2 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-black cursor-pointer">Pass</button>
                <button onClick={() => consensusStep === consensusOptions.length - 1 ? setConsensusLocked(true) : setConsensusStep(step => step + 1)} className="py-2 rounded-xl bg-slate-900 text-white text-[11px] font-black cursor-pointer flex items-center justify-center gap-1"><Zap size={13} /> Lock fit</button>
              </div>
            </>
          )}
        </div>
      );
    }

    if (activeKey === 'self-healing') {
      return (
        <div className="rounded-2xl bg-white p-3.5 text-slate-900 shadow-lg border border-white/70">
          <div className="flex items-center justify-between mb-3">
            <div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Trip health</p><p className="text-2xl font-black text-emerald-600">{pivotSimulated ? '91' : '94'}<span className="text-xs text-slate-400">/100</span></p></div>
            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${pivotSimulated ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}><CloudRain size={20} /></div>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 border-y border-slate-100 py-2.5 mb-2.5"><MapPin size={14} className="text-blue-600" /> Afternoon plan - Futian, Shenzhen</div>
          {pivotSimulated ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
              <div className="flex items-center gap-2 text-emerald-700 mb-1"><CheckCircle2 size={16} /><span className="text-xs font-black">Plan recovered</span></div>
              <p className="text-[11px] text-slate-600 leading-relaxed">Rain rerouted your rooftop stop to an indoor market 8 minutes away.</p>
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-2.5"><p className="text-[11px] font-black text-amber-800">Storm detected at 3:20 PM</p><p className="text-[10px] text-amber-700 mt-0.5">Your rooftop booking is at risk.</p></div>
              <button onClick={() => setPivotSimulated(true)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-black cursor-pointer flex items-center justify-center gap-1.5"><Zap size={13} /> Simulate safer afternoon</button>
            </>
          )}
          {pivotSimulated && <button onClick={() => setPivotSimulated(false)} className="w-full mt-2 py-1.5 text-[10px] font-bold text-slate-400 cursor-pointer flex items-center justify-center gap-1"><RotateCcw size={11} /> Reset simulation</button>}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white relative max-h-[85vh] overflow-y-auto border border-white/20"
        style={{
          backgroundColor: '#1E4871',
          background: 'linear-gradient(165deg, #255887 0%, #173B5E 100%)',
        }}
        onClick={e => e.stopPropagation()}
        id="feature-preview-drawer"
      >
        {/* Top Handle / Close */}
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Icon size={18} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">
                {current.tag}
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                {current.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Feature Subtitle */}
        <div className="bg-white/10 rounded-2xl p-3.5 border border-white/15">
          <div className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={14} />
            {current.pitchMetric}
          </div>
          <p className="text-xs text-white/90 leading-relaxed font-medium">
            {current.subtitle}
          </p>
        </div>

        {renderConceptDemo()}

        {/* Mechanism & Execution */}
        <div className="flex flex-col gap-3 text-xs">
          <div>
            <h4 className="font-bold text-blue-200 uppercase tracking-wider text-[10px] mb-1">
              Core Mechanism
            </h4>
            <p className="text-white/80 leading-relaxed">
              {current.mechanism}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-blue-200 uppercase tracking-wider text-[10px] mb-1">
              Execution & Monetization Strategy
            </h4>
            <p className="text-white/80 leading-relaxed">
              {current.execution}
            </p>
          </div>

          <div className="bg-black/25 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-blue-300 font-bold block mb-0.5">
              Primary Tech Stack:
            </span>
            <span className="text-white font-mono text-[11px]">
              {current.techStack}
            </span>
          </div>
        </div>

        {/* Action Button: Return to Home Deals */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-900 bg-white hover:bg-slate-100 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg cursor-pointer"
          >
            <span>Back to Home Offers Feed</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
