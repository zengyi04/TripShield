import React, { useState } from 'react';
import { MOCK_PRICE_HISTORY, PricePoint } from '../../data/mockBuyWindow';

type RangeFilter = 30 | 14 | 7;

export const PriceTrendChart: React.FC = () => {
  const [range, setRange] = useState<RangeFilter>(30);

  const filtered = MOCK_PRICE_HISTORY.filter(p => p.day <= range);

  // SVG dimensions
  const W = 320;
  const H = 120;
  const PAD_X = 10;
  const PAD_Y = 16;

  const prices = filtered.map(p => p.price);
  const minP = Math.min(...prices) - 50;
  const maxP = Math.max(...prices) + 50;

  const toX = (i: number) => PAD_X + (i / (filtered.length - 1)) * (W - PAD_X * 2);
  const toY = (price: number) => PAD_Y + ((maxP - price) / (maxP - minP)) * (H - PAD_Y * 2);

  const polyline = filtered.map((p, i) => `${toX(i)},${toY(p.price)}`).join(' ');

  // Area fill
  const areaPath = filtered.length > 0
    ? `M${toX(0)},${H - PAD_Y} ` +
      filtered.map((p, i) => `L${toX(i)},${toY(p.price)}`).join(' ') +
      ` L${toX(filtered.length - 1)},${H - PAD_Y} Z`
    : '';

  const todayPoint = filtered[filtered.length - 1];
  const todayX = toX(filtered.length - 1);
  const todayY = toY(todayPoint?.price ?? 0);

  // Price labels
  const labelPrices = [maxP - 50, Math.round((maxP + minP) / 2), minP + 50];

  const ranges: { value: RangeFilter; label: string }[] = [
    { value: 30, label: '30 days' },
    { value: 14, label: '14 days' },
    { value: 7, label: '7 days' },
  ];

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4" id="price-trend-chart">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
          Price Trend
        </p>
        <div className="flex gap-1">
          {ranges.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                range === r.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
          {/* Area fill */}
          <path d={areaPath} fill="url(#priceGradient)" opacity="0.15" />

          {/* Grid lines */}
          {labelPrices.map((p, i) => (
            <line
              key={i}
              x1={PAD_X} y1={toY(p)}
              x2={W - PAD_X} y2={toY(p)}
              stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3,3"
            />
          ))}

          {/* Price line */}
          <polyline
            points={polyline}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Today dot */}
          {todayPoint && (
            <>
              <circle cx={todayX} cy={todayY} r="5" fill="#3b82f6" stroke="white" strokeWidth="2" />
              <circle cx={todayX} cy={todayY} r="8" fill="#3b82f6" opacity="0.2" />
            </>
          )}

          {/* Gradient def */}
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-3 pointer-events-none">
          {labelPrices.map((p, i) => (
            <span key={i} className="text-[8px] font-bold text-slate-400 leading-none">
              RM {p.toLocaleString()}
            </span>
          ))}
        </div>

        {/* Today label */}
        {todayPoint && (
          <div
            className="absolute text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200"
            style={{
              right: '4px',
              bottom: '4px',
            }}
          >
            TODAY · RM {todayPoint.price.toLocaleString()}
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1.5 px-2">
        <span className="text-[9px] font-bold text-slate-400">{range}d ago</span>
        <span className="text-[9px] font-bold text-slate-400">{Math.round(range / 2)}d</span>
        <span className="text-[9px] font-bold text-slate-400">Today</span>
      </div>
    </div>
  );
};
