import React from 'react';
import { TripShieldLogo } from '../TripShieldLogo';
import { ActiveScreen } from '../../types';

interface WelcomeScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
  buttonTextColor?: string;
  isHarmonized: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigate,
  topColor,
  bottomColor,
  buttonBg,
  buttonHover,
  buttonTextColor = '#ffffff',
  isHarmonized,
}) => {
  return (
    <div className="w-full h-full flex flex-col select-none" id="welcome-screen-container">
      {/* Top Header / Branding Section */}
      <div
        className="w-full flex-1 flex items-center justify-center pt-8 pb-4 transition-colors duration-300 relative"
        style={{ backgroundColor: topColor }}
        id="screen-top-section"
      >
        <div className="transform transition-transform duration-300 hover:scale-105">
          <TripShieldLogo size={148} />
        </div>
      </div>

      {/* Bottom Card Section with Rounded Top */}
      <div
        className="w-full rounded-t-[38px] px-8 pt-9 pb-10 flex flex-col items-center text-center transition-colors duration-300 shadow-2xl relative z-10"
        style={{
          backgroundColor: bottomColor,
        }}
        id="screen-bottom-card"
      >
        {/* Headline */}
        <h1
          className="text-3xl sm:text-[34px] font-extrabold text-white tracking-tight leading-tight mb-3"
          id="welcome-title"
          style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
        >
          Welcome back
        </h1>

        {/* Subtitle */}
        <p
          className="text-white/85 text-[15px] sm:text-base font-normal leading-relaxed max-w-[280px] mb-8"
          id="welcome-subtitle"
        >
          Sign in to pick up your trip planning right where you left off.
        </p>

        {/* Action Buttons */}
        <div className="w-full max-w-[320px] flex flex-col gap-3.5 mb-6" id="welcome-action-buttons">
          {/* Sign Up Button */}
          <button
            onClick={() => onNavigate('signup')}
            id="btn-signup"
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-[16px] tracking-normal transition-all duration-200 transform active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: buttonBg,
              color: buttonTextColor,
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = buttonHover;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = buttonBg;
            }}
          >
            Sign up
          </button>

          {/* Login Button */}
          <button
            onClick={() => onNavigate('login')}
            id="btn-login"
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-[16px] tracking-normal transition-all duration-200 transform active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: buttonBg,
              color: buttonTextColor,
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = buttonHover;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = buttonBg;
            }}
          >
            Login
          </button>

          {/* Maybe Later Link */}
          <button
            onClick={() => onNavigate('home')}
            id="btn-maybe-later"
            className="mt-1 text-white font-bold text-[15px] tracking-tight underline underline-offset-4 decoration-white/70 hover:decoration-white transition-opacity duration-200 hover:opacity-90 active:opacity-75 cursor-pointer py-1"
          >
            Maybe Later
          </button>
        </div>

        {/* Terms and Privacy Policy Footer */}
        <p className="text-white/70 text-[11px] leading-relaxed max-w-[270px] mt-2" id="welcome-legal-text">
          By continuing, you agree to TripShield&apos;s{' '}
          <a
            href="#terms"
            onClick={e => {
              e.preventDefault();
            }}
            className="text-white font-semibold underline underline-offset-2 hover:text-white"
          >
            Terms of Service
          </a>{' '}
          and acknowledge our{' '}
          <a
            href="#privacy"
            onClick={e => {
              e.preventDefault();
            }}
            className="text-white font-semibold underline underline-offset-2 hover:text-white"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};
