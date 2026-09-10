import React from 'react';
import { Home, Timer, Sparkles, Receipt, ShieldCheck } from 'lucide-react';

export type FeatureTab = 'home' | 'buy-window' | 'consensus' | 'ledger' | 'self-healing';

interface BottomNavigationProps {
  currentTab: FeatureTab;
  onTabChange: (tab: FeatureTab) => void;
  barBgColor?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: 'home' as FeatureTab,
      label: 'Home',
      icon: Home,
      hasDot: false,
    },
    {
      id: 'buy-window' as FeatureTab,
      label: 'Buy Window',
      icon: Timer,
      hasDot: false,
    },
    {
      id: 'consensus' as FeatureTab,
      label: 'Consensus',
      icon: Sparkles,
      hasDot: false,
    },
    {
      id: 'ledger' as FeatureTab,
      label: 'Ledger',
      icon: Receipt,
      hasDot: false,
    },
    {
      id: 'self-healing' as FeatureTab,
      label: 'Self-Healing',
      icon: ShieldCheck,
      hasDot: false,
    },
  ];

  return (
    <nav
      className="w-full px-2 py-1.5 bg-white border-t border-slate-200 flex items-center justify-around select-none shrink-0 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
      id="tripshield-bottom-navigation"
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            id={`nav-tab-${tab.id}`}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 cursor-pointer min-w-[56px] ${
              isActive
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-400 hover:text-slate-600 font-semibold'
            }`}
          >
            {/* Icon + Badge */}
            <div className="relative mb-1">
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110 text-blue-600' : 'text-slate-500'
                }`}
              />

              {/* Red / Orange Dot Notification Indicator */}
              {tab.hasDot && (
                <span
                  className={`absolute -top-0.5 -right-1 w-2 h-2 rounded-full ${
                    'bg-red-500'
                  } border border-white`}
                />
              )}
            </div>

            {/* Main Label */}
            <span
              className={`text-[11px] tracking-tight leading-none ${
                isActive ? 'font-black text-blue-600' : 'font-semibold text-slate-500'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
