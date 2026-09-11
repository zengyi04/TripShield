import React from 'react';
import { MOCK_SEASON_INFO } from '../../data/mockBuyWindow';

export const SeasonInsight: React.FC<{ currentPrice?: number }> = ({ currentPrice = 2800 }) => {
  const season = MOCK_SEASON_INFO;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4" id="season-insight">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">
        Travel Timing
      </p>

      {/* Season badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{season.emoji}</span>
        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${season.badgeBg} ${season.badgeText}`}>
          {season.label.toUpperCase()}
        </span>
      </div>

      <p className="text-[11px] text-slate-600 font-semibold leading-relaxed mb-3">
        {season.description}
      </p>

      {/* Price comparison */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Typical price</p>
          <p className="text-xs font-black text-slate-800 mt-0.5">{season.typicalRange}</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current</p>
          <p className="text-xs font-black text-slate-800 mt-0.5">RM {currentPrice.toLocaleString()}</p>
        </div>
      </div>

      {/* Reasons */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {season.reasons.map((reason, i) => (
          <span
            key={i}
            className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
          >
            {reason}
          </span>
        ))}
      </div>

      {/* Insight */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 flex items-start gap-2">
        <span className="text-sm leading-none">💡</span>
        <span className="text-[11px] text-blue-800 font-semibold leading-relaxed">
          {season.insight}
        </span>
      </div>
    </div>
  );
};
