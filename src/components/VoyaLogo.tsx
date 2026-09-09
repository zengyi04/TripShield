import React from 'react';

interface VoyaLogoProps {
  size?: number;
  className?: string;
  pinColor?: string;
  arrowColor?: string;
}

export const VoyaLogo: React.FC<VoyaLogoProps> = ({
  size = 110,
  className = '',
  pinColor = '#ffffff',
  arrowColor = '#94B7DC',
}) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(100% 100% at 50% 18%, rgba(255,255,255,0.92) 0%, rgba(230,240,250,0.85) 100%)',
        boxShadow:
          '0 12px 36px -4px rgba(30, 60, 100, 0.16), 0 2px 8px rgba(30, 60, 100, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.9)',
      }}
      id="voya-brand-logo-medallion"
    >
      <svg
        width={size * 0.58}
        height={size * 0.65}
        viewBox="0 0 72 82"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform -translate-y-0.5 filter drop-shadow-sm"
      >
        {/* Outer Pin Outline / Solid Body */}
        <path
          d="M36 2C17.7746 2 3 16.7746 3 35C3 49.8 24.5 73.5 33.8 80.8C35.1 81.8 36.9 81.8 38.2 80.8C47.5 73.5 69 49.8 69 35C69 16.7746 54.2254 2 36 2Z"
          fill={pinColor}
        />
        
        {/* Inner Circle cutout / disc */}
        <circle
          cx="36"
          cy="34"
          r="19"
          fill={arrowColor}
          opacity="0.88"
        />

        {/* Flight Arrow / Compass with fletching */}
        <g stroke="#ffffff" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
          {/* Main diagonal shaft */}
          <line x1="25" y1="23" x2="45" y2="43" />
          {/* Arrowhead */}
          <polyline points="45,35 45,43 37,43" />
          {/* Top fletching wings */}
          <line x1="26" y1="29" x2="31" y2="24" />
          <line x1="30" y1="33" x2="35" y2="28" />
        </g>
      </svg>
    </div>
  );
};
