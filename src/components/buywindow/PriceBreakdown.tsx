import React from 'react';
import { MOCK_PRICE_BREAKDOWN, MOCK_PRICE_BREAKDOWN_TOTAL } from '../../data/mockBuyWindow';

export const PriceBreakdown: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4" id="price-breakdown">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">
        Price Breakdown
      </p>

      <div className="flex flex-col gap-2">
        {MOCK_PRICE_BREAKDOWN.map(item => (
          <div key={item.id} className="flex items-center justify-between">
            <span
              className={`text-[11px] font-semibold ${
                item.isDiscount ? 'text-emerald-700' : 'text-slate-600'
              }`}
            >
              {item.label}
            </span>
            <span
              className={`text-[11px] font-bold tabular-nums ${
                item.isDiscount ? 'text-emerald-700' : 'text-slate-800'
              }`}
            >
              {item.amountFormatted}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 my-2.5" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-800">Estimated total</span>
        <span className="text-sm font-black text-slate-900 tabular-nums">
          {MOCK_PRICE_BREAKDOWN_TOTAL.amountFormatted}
        </span>
      </div>
    </div>
  );
};
