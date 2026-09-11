import React from 'react';
import { MOCK_PRICE_RISK } from '../../data/mockBuyWindow';

export const PriceRiskMeter: React.FC = () => {
  const risk = MOCK_PRICE_RISK;

  const labelColor =
    risk.level === 'low'
      ? 'text-emerald-700'
      : risk.level === 'moderate'
        ? 'text-amber-700'
        : 'text-red-700';

  const dotColor =
    risk.level === 'low'
      ? 'bg-emerald-500'
      : risk.level === 'moderate'
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4" id="price-risk-meter">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">
        Price Risk
      </p>

      {/* Track */}
      <div className="relative h-2 rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-red-200 mb-2">
        {/* Dot */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${dotColor} border-2 border-white shadow-md transition-all duration-500`}
          style={{ left: `calc(${risk.position}% - 8px)` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-3">
        <span>Low</span>
        <span>High</span>
      </div>

      {/* Result */}
      <p className={`text-xs font-black ${labelColor}`}>{risk.label}</p>
      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5">
        {risk.description}
      </p>
    </div>
  );
};
