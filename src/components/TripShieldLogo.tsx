import React from 'react';

interface TripShieldLogoProps {
  size?: number;
  className?: string;
}

/**
 * Recreates the round 3D medallion logo from image 2:
 * - Circular coin base with soft sky-blue tone and 3D beveled rim
 * - Matte 3D white teardrop location pin with a wake cut-out on the left
 * - Stylized white airplane flying diagonally up-right with wings and tail fin
 * - Streamline wake trail slicing through the left of the pin
 * - Gentle wave contour in the lower hole of the pin
 * - Red border has been removed as requested!
 */
export const TripShieldLogo: React.FC<TripShieldLogoProps> = ({
  size = 96,
  className = '',
}) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full select-none shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: 'transparent',
        boxShadow: 'none',
      }}
      id="tripshield-round-medallion-logo"
    >
      {/* Recessed Coin Groove / Embossed Bevel Ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: `${Math.max(2, size * 0.05)}px`,
          border: `${Math.max(1.5, size * 0.03)}px solid rgba(255, 255, 255, 0.45)`,
          boxShadow: 'inset 0 2px 4px rgba(20, 50, 90, 0.25), 0 1px 2px rgba(255, 255, 255, 0.5)',
          background: 'radial-gradient(circle at 40% 30%, #A0C5EE 0%, #8AB4E2 60%, #7AA4D4 100%)',
        }}
      />

      {/* Center 3D Sculpture: Location Pin + Airplane + Wake Trails */}
      <svg
        width={size * 0.76}
        height={size * 0.76}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 filter drop-shadow-[0_5px_8px_rgba(20,50,90,0.35)]"
      >
        <defs>
          {/* Subtle 3D gradient for the white relief */}
          <linearGradient id="reliefWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Wake Trail subtle gradient */}
          <linearGradient id="wakeGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>

          {/* Inner hole ocean / sky tint */}
          <linearGradient id="innerDepth" x1="50%" y1="20%" x2="50%" y2="80%">
            <stop offset="0%" stopColor="#89B3E2" />
            <stop offset="100%" stopColor="#6C97C7" />
          </linearGradient>
        </defs>

        {/* Outer Pin Body with Left Wake Cutout Gap */}
        {/* Main upper teardrop arc + lower pointer */}
        <path
          d="
            M 50 18
            C 64.5 18 76 29.5 76 44
            C 76 56.5 59.5 76.5 51.8 84.8
            C 50.8 85.9 49.2 85.9 48.2 84.8
            C 43.5 79.8 35.2 69.5 29.8 59.5
            L 38.5 56
            C 41.5 62.5 46.5 69.5 50 73.5
            C 56 66.5 66 52 66 44
            C 66 35.2 58.8 28 50 28
            C 41.8 28 35 34.2 34.1 42.2
            L 24 43.5
            C 24.5 29.5 35.8 18 50 18
            Z
          "
          fill="url(#reliefWhiteGrad)"
        />

        {/* Lower Left Pin Segment below the wake gap */}
        <path
          d="
            M 24.5 49
            L 34.5 48
            C 34.8 50.5 35.8 53 37.2 55.2
            L 28.5 58.5
            C 26.5 55.5 25.2 52.3 24.5 49
            Z
          "
          fill="url(#reliefWhiteGrad)"
        />

        {/* Upper Jet Trail slicing through the left gap */}
        <path
          d="
            M 22 45.5
            C 28 45.2 34 44.8 41 44.5
            C 41 47 41 47 34 47.5
            C 28 48 23 48.2 22 48.2
            Z
          "
          fill="url(#wakeGrad)"
        />

        {/* Second Lower Jet Wake Curve */}
        <path
          d="
            M 25 51.5
            C 30 51.2 35 51 40 51.5
            C 39.5 53.5 35 53.5 30 53.8
            C 27 54 25.5 53.8 25 51.5
            Z
          "
          fill="url(#wakeGrad)"
          opacity="0.95"
        />

        {/* Subtle Wave Ripple under airplane in pin hole */}
        <path
          d="
            M 42 62
            C 46 63.5 51 63.5 55 60.5
            C 57 59 60 59.5 62 61
          "
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Airplane: High-relief white plane flying diagonally up-right */}
        <g transform="translate(50, 43.5) rotate(-22) scale(0.95)">
          {/* Plane Fuselage / Body */}
          <path
            d="
              M 0 -19
              C 2 -19 4 -16 4 -12
              L 4 9
              C 4 13 2 15 0 16
              C -2 15 -4 13 -4 9
              L -4 -12
              C -4 -16 -2 -19 0 -19
              Z
            "
            fill="url(#reliefWhiteGrad)"
          />

          {/* Left Wing (stretching out towards left/bottom) */}
          <path
            d="
              M -3 -4
              L -22 6
              C -24 7 -24 8.5 -22 9
              L -3 4
              Z
            "
            fill="url(#reliefWhiteGrad)"
          />

          {/* Right Wing (stretching out towards right/top) */}
          <path
            d="
              M 3 -4
              L 22 6
              C 24 7 24 8.5 22 9
              L 3 4
              Z
            "
            fill="url(#reliefWhiteGrad)"
          />

          {/* Horizontal Tail Fins */}
          <path
            d="
              M -1.5 11
              L -10 16
              L -10 18
              L -1 15
              L 1 15
              L 10 18
              L 10 16
              L 1.5 11
              Z
            "
            fill="url(#reliefWhiteGrad)"
          />

          {/* Cockpit Glass subtle hint */}
          <ellipse
            cx="0"
            cy="-11"
            rx="1.6"
            ry="2.6"
            fill="#85AFD9"
            opacity="0.6"
          />
        </g>
      </svg>
    </div>
  );
};
