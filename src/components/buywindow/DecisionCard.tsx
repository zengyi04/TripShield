import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  BuyWindow,
  DECISION_STATE_CONFIG,
  MOCK_CONFIDENCE_FACTORS,
  ConfidenceFactor,
} from '../../data/mockBuyWindow';

interface DecisionCardProps {
  bw: BuyWindow;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ bw }) => {
  const [showWhy, setShowWhy] = useState(false);
  const cfg = DECISION_STATE_CONFIG[bw.decisionState];

  // Confidence ring calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (bw.confidence / 100) * circumference;

  return (
    <div
      className={`rounded-2xl border ${cfg.borderColor} ${cfg.bgColor} overflow-hidden shadow-sm`}
      id="decision-card"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
          Should you book now?
        </p>

        {/* Decision badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{cfg.emoji}</span>
          <div>
            <p className={`text-sm font-black ${cfg.textColor}`}>{cfg.shortLabel}</p>
            <p className="text-slate-600 text-[11px] font-semibold">{cfg.label}</p>
          </div>
        </div>

        {/* Price + Confidence */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-900 text-2xl font-black tracking-tight">{bw.price}</p>
            <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
              {bw.route}
            </p>
          </div>

          {/* Confidence Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r={radius}
                  fill="none" stroke="currentColor"
                  strokeWidth="4"
                  className="text-slate-200"
                />
                <circle
                  cx="32" cy="32" r={radius}
                  fill="none" stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                  className={cfg.textColor}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-black text-slate-800">{bw.confidence}%</span>
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Confidence
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mt-3 pt-3 border-t border-black/5">
          <div className="flex-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current price</p>
            <p className="text-xs font-black text-slate-800 mt-0.5">{bw.price}</p>
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Typical range</p>
            <p className="text-xs font-black text-slate-800 mt-0.5">{bw.referenceRange}</p>
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Potential saving</p>
            <p className="text-xs font-black text-emerald-700 mt-0.5">
              ≈ RM {bw.referenceRangeLow - bw.priceNumeric > 0 ? (bw.referenceRangeLow - bw.priceNumeric).toLocaleString() : '50'}
            </p>
          </div>
        </div>
      </div>

      {/* See why toggle */}
      <button
        onClick={() => setShowWhy(!showWhy)}
        className="w-full px-4 py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-extrabold cursor-pointer transition-colors border-t border-black/5 hover:bg-white/60"
        style={{ color: cfg.textColor.replace('text-', '').includes('emerald') ? '#047857' : '#1d4ed8' }}
        id="decision-card-see-why-btn"
      >
        {showWhy ? 'Hide details' : 'See why'}
        {showWhy ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Explanation panel */}
      {showWhy && (
        <div className="px-4 pb-4 border-t border-black/5 animate-fade-in">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mt-3 mb-2">
            Why TripShield recommends booking now
          </p>
          <div className="flex flex-col gap-2">
            {MOCK_CONFIDENCE_FACTORS.map((factor: ConfidenceFactor) => (
              <div key={factor.id} className="flex items-start gap-2">
                {factor.type === 'positive' ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                )}
                <span className="text-[11px] text-slate-700 font-semibold leading-snug">
                  {factor.text}
                </span>
              </div>
            ))}
          </div>
          <div className={`mt-3 rounded-xl ${cfg.bgColor} border ${cfg.borderColor} p-3`}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall assessment</p>
            <p className={`text-xs font-black ${cfg.textColor} mt-0.5`}>{cfg.label.toUpperCase()}</p>
          </div>
        </div>
      )}
    </div>
  );
};
