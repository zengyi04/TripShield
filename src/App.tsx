import React, { useState } from 'react';
import { ActiveScreen } from './types';
import { deriveDarkerTone, deriveButtonTones } from './utils/color';
import { PhoneMockup } from './components/PhoneMockup';

export default function App() {
  // Frontpage MUST be Sign Up & Login (welcome screen)
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('welcome');

  // Same-family monochromatic palette (同一个色系)
  const topColor = '#9BBFE3'; // Soft periwinkle sky blue
  const harmonizedDerived = deriveDarkerTone(topColor, {
    darknessDelta: 32,
    saturationDelta: 0,
  });
  const bottomColor = harmonizedDerived.hex; // Harmonized darker blue
  const buttonTones = deriveButtonTones(bottomColor, 16);

  return (
    <div
      className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 select-none overflow-x-hidden"
      id="mobile-app-root"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #1e293b 0%, #090d16 100%)',
      }}
    >
      {/* Centered Native Mobile Application Container */}
      <div className="w-full flex flex-col items-center justify-center">
        <PhoneMockup
          activeScreen={activeScreen}
          onNavigate={setActiveScreen}
          topColor={topColor}
          bottomColor={bottomColor}
          buttonBg={buttonTones.bg}
          buttonHover={buttonTones.hover}
          buttonTextColor={buttonTones.text}
          isHarmonized={true}
          showPhoneFrame={true}
        />
      </div>
    </div>
  );
}
