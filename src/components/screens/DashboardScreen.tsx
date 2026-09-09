import React from 'react';
import { ArrowLeft, Compass, Calendar, MapPin, Plus, UserCheck } from 'lucide-react';
import { ActiveScreen } from '../../types';

interface DashboardScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  topColor,
  bottomColor,
  buttonBg,
  buttonHover,
}) => {
  const trips = [
    {
      title: 'Kyoto Autumn Trail',
      country: 'Japan',
      days: '7 Days',
      season: 'October',
      status: 'Confirmed',
    },
    {
      title: 'Amalfi Coast Drive',
      country: 'Italy',
      days: '10 Days',
      season: 'June',
      status: 'Planning',
    },
    {
      title: 'Zermatt Glaciers',
      country: 'Switzerland',
      days: '5 Days',
      season: 'December',
      status: 'Idea',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col select-none overflow-y-auto" id="dashboard-screen">
      {/* Top Header */}
      <div
        className="w-full pt-4 pb-6 px-6 transition-colors duration-300 flex flex-col"
        style={{ backgroundColor: topColor }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigate('welcome')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/30 backdrop-blur-md text-slate-800 hover:bg-white/50 transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 text-slate-800 text-xs font-bold">
            <UserCheck size={14} /> Explorer Mode
          </div>
        </div>

        <div className="px-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Your Trips
          </h2>
          <p className="text-slate-800/80 text-xs font-medium">
            3 journeys in your travel queue
          </p>
        </div>
      </div>

      {/* Main Content Area in Darker Harmonious Background */}
      <div
        className="flex-1 rounded-t-[38px] px-6 pt-7 pb-8 flex flex-col gap-4 transition-colors duration-300"
        style={{ backgroundColor: bottomColor }}
      >
        <div className="flex items-center justify-between text-white mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">
            Upcoming Itineraries
          </span>
          <button
            onClick={() => alert('New Trip Creator initiated!')}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-all cursor-pointer"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {trips.map((trip, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-4 transition-all duration-200 border border-white/15 cursor-pointer shadow-sm hover:shadow-md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => alert(`Opening itinerary for ${trip.title}`)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                  {trip.country}
                </span>
                <h4 className="text-white font-bold text-base tracking-tight">
                  {trip.title}
                </h4>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: trip.status === 'Confirmed' ? 'rgba(74, 222, 128, 0.25)' : 'rgba(255, 255, 255, 0.2)',
                  color: trip.status === 'Confirmed' ? '#BBF7D0' : '#FFFFFF',
                }}
              >
                {trip.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-white/80 text-xs mt-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1">
                <Calendar size={13} className="opacity-80" />
                <span>{trip.season}</span>
              </div>
              <div className="flex items-center gap-1">
                <Compass size={13} className="opacity-80" />
                <span>{trip.days}</span>
              </div>
              <div className="flex items-center gap-1 ml-auto text-white font-semibold">
                <MapPin size={13} /> Details
              </div>
            </div>
          </div>
        ))}

        {/* Back to Auth screen button */}
        <div className="mt-auto pt-4">
          <button
            onClick={() => onNavigate('welcome')}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide uppercase text-white transition-all cursor-pointer"
            style={{
              backgroundColor: buttonBg,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = buttonHover;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = buttonBg;
            }}
          >
            Return to Welcome Screen
          </button>
        </div>
      </div>
    </div>
  );
};
