import React, { useState } from 'react';
import { Wifi, Battery, Signal, User, LogOut, ShieldCheck, ArrowRight, Settings } from 'lucide-react';
import { ActiveScreen } from '../types';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { HomeScreen } from './screens/HomeScreen';
import { BottomNavigation, FeatureTab } from './BottomNavigation';
import { FeaturePreviewModal } from './FeaturePreviewModal';

interface PhoneMockupProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
  buttonTextColor?: string;
  isHarmonized: boolean;
  showPhoneFrame: boolean;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  activeScreen,
  onNavigate,
  topColor,
  bottomColor,
  buttonBg,
  buttonHover,
  buttonTextColor,
  isHarmonized,
  showPhoneFrame,
}) => {
  const [currentTab, setCurrentTab] = useState<FeatureTab>('home');
  const [activePreviewFeature, setActivePreviewFeature] = useState<FeatureTab | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleTabChange = (tab: FeatureTab) => {
    setCurrentTab(tab);
    if (tab === 'home') {
      onNavigate('home');
    } else if (tab === 'consensus') {
      setActivePreviewFeature(tab);
    } else {
      setActivePreviewFeature(null);
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return (
          <div className="w-full h-full flex flex-col justify-between overflow-hidden relative">
            <div className="flex-1 w-full overflow-hidden">
              <HomeScreen
                topColor={topColor}
                bottomColor={bottomColor}
                buttonBg={buttonBg}
                buttonHover={buttonHover}
                onNavigate={onNavigate}
              />
            </div>
            {/* Bottom navigation bar: Home + 4 Features */}
            <BottomNavigation
              currentTab={currentTab}
              onTabChange={handleTabChange}
              barBgColor={bottomColor}
            />
          </div>
        );
      case 'signup':
        return (
          <SignUpScreen
            onNavigate={onNavigate}
            topColor={topColor}
            bottomColor={bottomColor}
            buttonBg={buttonBg}
            buttonHover={buttonHover}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onNavigate={onNavigate}
            topColor={topColor}
            bottomColor={bottomColor}
            buttonBg={buttonBg}
            buttonHover={buttonHover}
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigate={onNavigate}
            topColor={topColor}
            bottomColor={bottomColor}
            buttonBg={buttonBg}
            buttonHover={buttonHover}
          />
        );
      case 'welcome':
      default:
        return (
          <WelcomeScreen
            onNavigate={onNavigate}
            topColor={topColor}
            bottomColor={bottomColor}
            buttonBg={buttonBg}
            buttonHover={buttonHover}
            buttonTextColor={buttonTextColor}
            isHarmonized={isHarmonized}
          />
        );
    }
  };

  if (!showPhoneFrame) {
    // Borderless / Seamless Mode
    return (
      <div
        className="w-full max-w-[390px] h-[780px] rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col transition-all duration-300"
        id="phone-screen-frameless"
      >
        {/* Simple Status Bar */}
        <div
          className="w-full px-7 pt-3 pb-1 flex items-center justify-between text-slate-800 text-xs font-bold transition-colors duration-300 z-20"
          style={{ backgroundColor: topColor }}
        >
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal size={14} />
            <Wifi size={14} />
            <Battery size={16} />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 w-full overflow-hidden flex flex-col">
          {renderScreen()}
        </div>

        {/* 4-Feature Next Phase Preview Modal */}
        <FeaturePreviewModal
          featureTab={activePreviewFeature}
          onClose={() => setActivePreviewFeature(null)}
          accentColor={bottomColor}
        />
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto transition-all duration-300 w-full h-[100dvh] flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #1e2530 0%, #0d1117 100%)',
      }}
      id="phone-mockup-frame"
    >
      <div
        className="w-full h-full overflow-hidden flex flex-col relative select-none"
        style={{
          backgroundColor: topColor,
        }}
        id="phone-inner-screen"
      >
        <div className="flex-1 w-full overflow-hidden flex flex-col relative">
          {renderScreen()}
        </div>

        {/* 4-Feature Next Phase Preview Modal */}
        <FeaturePreviewModal
          featureTab={activePreviewFeature}
          onClose={() => {
            setActivePreviewFeature(null);
            setCurrentTab('home');
          }}
          accentColor={bottomColor}
        />

        {/* Account Modal (Solid Non-Transparent) */}
        {showAccountModal && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70"
            onClick={() => setShowAccountModal(false)}
          >
            <div
              className="w-full max-w-[370px] rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 bg-white text-slate-900 border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow">
                    AM
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Alex Morgan</h3>
                    <p className="text-[11px] text-slate-500 font-semibold">alex.morgan@example.com</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Membership Tier</span>
                  <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">TripShield PRO</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Active Group</span>
                  <span className="font-bold text-slate-800">Shenzhen &amp; Tokyo &apos;26</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Decision Engine</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck size={13} />
                    Live 94/100
                  </span>
                </div>
              </div>

              {/* Log Out to Frontpage Button */}
              <button
                onClick={() => {
                  setShowAccountModal(false);
                  onNavigate('welcome');
                }}
                className="w-full py-3 px-4 rounded-xl font-black text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                id="account-modal-logout-btn"
              >
                <LogOut size={15} />
                <span>Log Out to Frontpage (Sign Up &amp; Login)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
