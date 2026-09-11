import React from 'react';
import { Sparkles } from 'lucide-react';
import { MOCK_DEAL_STACK } from '../../data/mockBuyWindow';

export const DealStack: React.FC = () => {
  const deal = MOCK_DEAL_STACK;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4" id="deal-stack">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
          Deal Stack
        </p>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
          Best combination
        </span>
      </div>

      {/* Current price */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-slate-600">Current price</span>
        <span className="text-[11px] font-bold text-slate-800 tabular-nums">
          {deal.originalPriceFormatted}
        </span>
      </div>

      {/* Discounts */}
      {deal.items.map(item => (
        <div key={item.id} className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-emerald-700">{item.label}</span>
          <span className="text-[11px] font-bold text-emerald-700 tabular-nums">
            {item.discountFormatted}
          </span>
        </div>
      ))}

      {/* Divider */}
      <div className="border-t border-slate-200 my-2.5" />

      {/* Final price */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-800">Estimated final price</span>
        <span className="text-sm font-black text-slate-900 tabular-nums">
          🔥 {deal.finalPriceFormatted}
        </span>
      </div>

      {/* Savings highlight */}
      <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-center gap-2">
        <Sparkles size={14} className="text-emerald-600 shrink-0" />
        <span className="text-[11px] font-bold text-emerald-700">
          You save {deal.totalSavingFormatted}
        </span>
      </div>
    </div>
  );
};
