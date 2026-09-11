import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MOCK_WAIT_SCENARIO } from '../../data/mockBuyWindow';

export const WaitVsBuySimulator: React.FC = () => {
  const scenario = MOCK_WAIT_SCENARIO;

  const riskColor =
    scenario.riskLevel === 'low'
      ? 'text-emerald-700'
      : scenario.riskLevel === 'medium'
        ? 'text-amber-700'
        : 'text-red-700';

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" id="wait-vs-buy">
      <div className="px-4 pt-4 pb-2">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
          What if I wait?
        </p>
      </div>

      {/* Comparison columns */}
      <div className="grid grid-cols-2 gap-0">
        {/* BUY NOW */}
        <div className="p-3.5 border-r border-slate-100">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
              Buy now
            </span>
          </div>
          <p className="text-lg font-black text-slate-900 mb-2">{scenario.buyNow.priceFormatted}</p>
          <div className="flex flex-col gap-1.5">
            {scenario.buyNow.benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[10px] text-slate-600 font-semibold leading-snug">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WAIT */}
        <div className="p-3.5 bg-slate-50/50">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Wait 7 days
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Estimated range
          </p>
          <p className="text-sm font-black text-slate-800 mb-2">{scenario.wait7Days.rangeFormatted}</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-[10px] text-slate-600 font-semibold leading-snug">
                Potential saving: {scenario.wait7Days.potentialSaving}
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
              <span className="text-[10px] text-slate-600 font-semibold leading-snug">
                Potential increase: {scenario.wait7Days.potentialIncrease}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-100 flex items-start gap-2">
        <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            TripShield recommendation
          </p>
          <p className={`text-[11px] font-semibold leading-relaxed mt-0.5 ${riskColor}`}>
            🟢 {scenario.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
