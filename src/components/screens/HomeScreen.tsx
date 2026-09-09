import React, { useState } from 'react';
import {
  Search,
  Bell,
  Check,
  Heart,
  Eye,
  Sparkles,
  ExternalLink,
  Mic,
  SlidersHorizontal,
  LogOut,
  Plane,
  Building,
  Calendar,
  Tag,
  TrendingUp,
  X,
  Send,
  Volume2,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import { TripShieldLogo } from '../TripShieldLogo';
import { SCREENSHOT_FEED_OFFERS, FeedOffer } from '../../data/mockOffers';
import { ActiveScreen } from '../../types';

interface HomeScreenProps {
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
  onNavigate?: (screen: ActiveScreen) => void;
}

type ChipCategory = 'deals' | 'events' | 'planner' | 'pulse' | 'flights' | 'stays';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  topColor,
  bottomColor,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('Flights from Kuala Lumpur to Shenzhen');
  const [activeChip, setActiveChip] = useState<ChipCategory>('deals');
  const [likedOffers, setLikedOffers] = useState<Record<string, boolean>>({
    'feed-3': true,
    'feed-4': false,
  });
  const [selectedOffer, setSelectedOffer] = useState<FeedOffer | null>(null);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedOffers(prev => {
      const nextState = !prev[id];
      triggerToast(nextState ? 'Saved to Favorites ❤️' : 'Removed from Favorites');
      return { ...prev, [id]: nextState };
    });
  };

  const handleAskAi = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiThinking(true);
    setTimeout(() => {
      setIsAiThinking(false);
      setAiResponse(
        `TripShield Travel Assistant for "${aiPrompt}": Found non-stop flights from Kuala Lumpur to Shenzhen starting from RM450, plus top recommended boutique stays near Futian & Nanshan.`
      );
    }, 900);
  };

  // Filter offers based on search and selected category
  const displayedOffers = SCREENSHOT_FEED_OFFERS.filter(offer => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      offer.title.toLowerCase().includes(query) ||
      (offer.subtitle && offer.subtitle.toLowerCase().includes(query)) ||
      (offer.partner && offer.partner.toLowerCase().includes(query));

    if (activeChip === 'flights') {
      return matchesSearch && (offer.type === 'flight-deal' || offer.title.toLowerCase().includes('flight'));
    }
    if (activeChip === 'stays') {
      return matchesSearch && (offer.type === 'stay-deal' || offer.title.toLowerCase().includes('villa'));
    }
    if (activeChip === 'deals') {
      return matchesSearch && (offer.type === 'promo-card' || offer.price || offer.badge);
    }
    return matchesSearch;
  });

  return (
    <div
      className="w-full h-full flex flex-col select-none overflow-y-auto relative scroll-smooth bg-slate-100"
      id="tripshield-home-screen"
      style={{ backgroundColor: bottomColor }}
    >
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[340px] bg-slate-900 text-white p-3 rounded-2xl border border-blue-400 shadow-2xl flex items-center gap-2.5 text-xs font-semibold">
          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
            <Check size={14} strokeWidth={3} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* TOP HEADER SECTION IN SOFT SKY BLUE (同一个色系)          */}
      {/* ========================================================= */}
      <div
        className="w-full pt-3 pb-3 px-3.5 flex flex-col gap-2.5 transition-colors duration-300 shadow-sm shrink-0 relative z-20"
        style={{ backgroundColor: topColor }}
        id="home-top-bar"
      >
        {/* Top Profile / Engine Title Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              {/* TripShield 3D Round Medallion Logo */}
              <TripShieldLogo size={36} />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-none">
                  Alex Morgan
                </h1>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white text-blue-900 leading-none shadow-xs">
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-700 leading-tight mt-0.5">
                TripShield Travel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotificationPopup(!showNotificationPopup)}
              id="notifications-bell-btn"
              className="w-8 h-8 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-slate-800 transition-colors relative cursor-pointer shadow-xs"
              title="Notifications"
            >
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </button>

            {/* Logout / Switch User back to Frontpage (Sign Up & Login) */}
            {onNavigate && (
              <button
                onClick={() => onNavigate('welcome')}
                id="home-logout-btn"
                className="h-8 px-2.5 rounded-full bg-white/70 hover:bg-white flex items-center gap-1 text-[10px] font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
                title="Log out back to frontpage"
              >
                <LogOut size={12} className="text-slate-600" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Dropdown */}
        {showNotificationPopup && (
          <div className="absolute top-14 right-3 z-40 w-72 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
              <span className="font-bold text-[11px] uppercase tracking-wider text-blue-300">
                Travel Alerts
              </span>
              <button
                onClick={() => setShowNotificationPopup(false)}
                className="text-white/60 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-800 p-2 rounded-xl text-[11px]">
              <span className="font-bold text-emerald-300 block">✈️ Flight Fare Alert</span>
              <span className="text-slate-300 text-[10px]">Kuala Lumpur to Shenzhen fares dropped to RM450.</span>
            </div>
            <div className="bg-slate-800 p-2 rounded-xl text-[11px]">
              <span className="font-bold text-amber-300 block">🏨 Exclusive Hotel Discount</span>
              <span className="text-slate-300 text-[10px]">Up to 40% off top-rated villas & stays in Tokyo.</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* REQUIREMENT 1: SEARCH BAR WITH APP LOGO ON LEFT & SEARCH ICON ON RIGHT */}
        {/* ========================================================= */}
        <div className="w-full flex items-center gap-2" id="home-top-search-bar-container">
          <div className="w-full h-11 bg-white rounded-full border-2 border-blue-500 shadow-sm flex items-center px-2.5 py-1 transition-all focus-within:ring-2 focus-within:ring-blue-400">
            {/* Left Hand Side: Small App Logo */}
            <div
              className="shrink-0 mr-1.5 flex items-center justify-center cursor-pointer transform hover:scale-105 transition-transform"
              title="TripShield"
              onClick={() => triggerToast('TripShield Travel')}
            >
              <TripShieldLogo size={26} />
            </div>

            {/* Middle: Search Input Field */}
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Flights from Kuala Lumpur to Shenzhen"
              className="flex-1 bg-transparent text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none min-w-0"
              id="home-search-bar-input"
            />

            {/* Clear button if text exists */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-1 mr-1 text-xs cursor-pointer"
                title="Clear"
              >
                ✕
              </button>
            )}

            {/* Right Hand Side: Circular Blue Search Icon Button */}
            <button
              onClick={() => triggerToast(`Searching: ${searchQuery || 'Popular Destinations'}`)}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 flex items-center justify-center text-white shadow-sm shrink-0 cursor-pointer transition-transform"
              id="home-search-button-icon"
              title="Search"
            >
              <Search size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Quick Category Chips from Screenshot */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          {[
            { id: 'deals' as ChipCategory, label: 'Deals', icon: Tag },
            { id: 'events' as ChipCategory, label: 'Events', icon: Calendar },
            { id: 'planner' as ChipCategory, label: 'Trip.Planner', icon: Navigation },
            { id: 'pulse' as ChipCategory, label: 'Trip.Pulse', icon: TrendingUp },
            { id: 'flights' as ChipCategory, label: 'Flights', icon: Plane },
            { id: 'stays' as ChipCategory, label: 'Stays', icon: Building },
          ].map(chip => {
            const Icon = chip.icon;
            const isSelected = activeChip === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveChip(chip.id)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all duration-200 cursor-pointer text-[11px] flex items-center gap-1 shadow-xs ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Icon size={12} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* REQUIREMENT 2: NON-TRANSPARENT OFFERS FEED (REAL IMAGE STYLE) */}
      {/* ========================================================= */}
      <div className="flex-1 w-full px-3 pt-3 pb-28 flex flex-col gap-3">
        {/* 2-Column Pinterest/Trip.com Style Masonry Grid with 100% NON-TRANSPARENT CARDS */}
        <div className="w-full grid grid-cols-2 gap-2.5" id="offers-grid-container">
          {displayedOffers.map(offer => {
            const isLiked = likedOffers[offer.id];

            // Card 1: Promotional Poster Card (Trip.com | Maybank style)
            if (offer.type === 'promo-card') {
              return (
                <div
                  key={offer.id}
                  onClick={() => setSelectedOffer(offer)}
                  className="col-span-1 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-0.5 relative group"
                  style={{ backgroundColor: '#0F2C59' }} // Solid deep navy non-transparent
                >
                  {/* Top Branding Banner */}
                  <div className="p-3 text-white flex flex-col gap-1 z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold tracking-tight text-white/90">
                        {offer.title}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block -ml-1" />
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-black text-amber-300 leading-tight">
                      {offer.subtitle}
                    </h3>
                    <p className="text-[9px] text-white/90 leading-tight font-medium">
                      Enjoy <span className="font-extrabold text-amber-300">RM250 OFF</span> on your flight booking!
                    </p>

                    {/* Date badge */}
                    <div className="mt-1 inline-block self-start px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[8px]">
                      {offer.badge}
                    </div>
                  </div>

                  {/* Real Image of Family on Beach */}
                  <div className="relative w-full h-32 overflow-hidden">
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {/* Corner Tag: "9/20" */}
                    {offer.cornerTag && (
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-bold">
                        {offer.cornerTag}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Card 2: 5 Best Things to Do Guide Card (Shenzhen style)
            if (offer.type === 'guide-card') {
              return (
                <div
                  key={offer.id}
                  onClick={() => setSelectedOffer(offer)}
                  className="col-span-1 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md flex flex-col cursor-pointer transition-transform hover:-translate-y-0.5 group"
                >
                  {/* Real Cover Image */}
                  <div className="relative w-full h-36 overflow-hidden">
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {/* Floating Title Graphic Strip */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-2 flex flex-col justify-between text-white">
                      <span className="text-[8px] font-extrabold tracking-wider bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded self-start">
                        TOP 5 IN SHENZHEN
                      </span>
                      <div className="text-[10px] font-black leading-tight text-white drop-shadow">
                        深圳 · A City Where Future Meets Culture
                      </div>
                    </div>
                  </div>

                  {/* Solid White Non-Transparent Information Bottom */}
                  <div className="p-2.5 bg-white flex flex-col gap-1.5">
                    <h4 className="text-[11px] font-extrabold text-slate-900 leading-snug line-clamp-2">
                      {offer.title}
                    </h4>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <img
                          src={offer.authorAvatar}
                          alt={offer.authorName}
                          className="w-4 h-4 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-semibold text-slate-700 truncate max-w-[65px]">
                          {offer.authorName}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-slate-400 font-bold">
                        <Eye size={11} />
                        <span>{offer.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Card 3: Free Lounge Access Offer (Airport Lounge photo with yellow callout)
            if (offer.type === 'lounge-card') {
              return (
                <div
                  key={offer.id}
                  onClick={() => setSelectedOffer(offer)}
                  className="col-span-1 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md flex flex-col cursor-pointer transition-transform hover:-translate-y-0.5 group relative"
                >
                  {/* Real Image of Luxury Airport Lounge */}
                  <div className="relative w-full h-36 overflow-hidden">
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Like Heart Button */}
                    <button
                      onClick={e => toggleLike(offer.id, e)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white cursor-pointer z-10 transition-colors"
                      title="Favorite"
                    >
                      <Heart
                        size={14}
                        className={isLiked ? 'fill-red-500 text-red-500' : 'text-white'}
                      />
                    </button>

                    {/* Solid Banner Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-amber-300 text-[9px] font-black px-2 py-1 text-center">
                      FREE LOUNGE ACCESS WHILE YOU WAIT ✈️
                    </div>
                  </div>

                  {/* Solid White Non-Transparent Information Bottom */}
                  <div className="p-2.5 bg-white flex flex-col gap-1.5">
                    <h4 className="text-[11px] font-extrabold text-slate-900 leading-snug line-clamp-2">
                      {offer.title}
                    </h4>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <img
                          src={offer.authorAvatar}
                          alt={offer.authorName}
                          className="w-4 h-4 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-semibold text-slate-700 truncate max-w-[65px]">
                          {offer.authorName}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-slate-400 font-bold">
                        <Eye size={11} />
                        <span>{offer.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Standard Flight / Stay / Experience Offer Card (All 100% Non-Transparent Solid White)
            return (
              <div
                key={offer.id}
                onClick={() => setSelectedOffer(offer)}
                className="col-span-1 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md flex flex-col cursor-pointer transition-transform hover:-translate-y-0.5 group relative"
              >
                {/* Real Photo */}
                <div className="relative w-full h-36 overflow-hidden">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Like Button */}
                  <button
                    onClick={e => toggleLike(offer.id, e)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white cursor-pointer z-10 transition-colors"
                    title="Favorite"
                  >
                    <Heart
                      size={14}
                      className={isLiked ? 'fill-red-500 text-red-500' : 'text-white'}
                    />
                  </button>

                  {/* Solid Badge */}
                  {offer.badge && (
                    <span
                      className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-black text-white shadow-sm"
                      style={{ backgroundColor: offer.badgeColor || '#2563EB' }}
                    >
                      {offer.badge}
                    </span>
                  )}

                  {/* Solid Price Pill */}
                  {offer.price && (
                    <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-md bg-white text-slate-900 font-black text-[10px] shadow-sm flex items-center gap-1">
                      <span>{offer.price}</span>
                      {offer.originalPrice && (
                        <span className="text-[8px] text-slate-400 line-through font-medium">
                          {offer.originalPrice}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Solid White Non-Transparent Bottom Information */}
                <div className="p-2.5 bg-white flex flex-col gap-1">
                  <h4 className="text-[11px] font-extrabold text-slate-900 leading-snug line-clamp-2">
                    {offer.title}
                  </h4>

                  <p className="text-[9px] text-slate-500 line-clamp-1 font-medium">
                    {offer.subtitle}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      {offer.authorAvatar && (
                        <img
                          src={offer.authorAvatar}
                          alt={offer.authorName}
                          className="w-4 h-4 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <span className="font-semibold text-slate-700 truncate max-w-[65px]">
                        {offer.authorName || offer.partner}
                      </span>
                    </div>
                    {offer.views && (
                      <div className="flex items-center gap-0.5 text-slate-400 font-bold">
                        <Eye size={11} />
                        <span>{offer.views}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* FLOATING AI VOICE / ASSISTANT CAPSULE (AS SEEN IN SCREENSHOT) */}
      {/* ========================================================= */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-30 w-auto">
        <button
          onClick={() => setShowAiModal(true)}
          className="px-4 py-2 rounded-full bg-blue-600/95 hover:bg-blue-700 text-white font-black text-xs shadow-xl flex items-center gap-2 border border-blue-400 active:scale-95 transition-all cursor-pointer"
          id="ask-ai-floating-capsule"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Mic size={12} className="text-white animate-pulse" />
          </div>
          <span>Ask AI or hold to speak</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SOLID OFFER DETAILS MODAL (100% NON-TRANSPARENT)          */}
      {/* ========================================================= */}
      {selectedOffer && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75"
          onClick={() => setSelectedOffer(null)}
        >
          <div
            className="w-full max-w-[390px] rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 bg-white text-slate-900 relative max-h-[85vh] overflow-y-auto border border-slate-200"
            onClick={e => e.stopPropagation()}
            id="offer-detail-modal"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600">
                  {selectedOffer.partner || 'TripShield Verified Offer'}
                </span>
                <h3 className="text-sm font-black text-slate-900 leading-tight">
                  {selectedOffer.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Image */}
            <div className="rounded-xl overflow-hidden h-44 relative bg-slate-100">
              <img
                src={selectedOffer.imageUrl}
                alt={selectedOffer.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {selectedOffer.badge && (
                <span
                  className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black text-white"
                  style={{ backgroundColor: selectedOffer.badgeColor || '#2563EB' }}
                >
                  {selectedOffer.badge}
                </span>
              )}
            </div>

            {/* Offer Body */}
            <div className="flex flex-col gap-2 text-xs">
              {selectedOffer.subtitle && (
                <p className="font-bold text-slate-800 text-xs">
                  {selectedOffer.subtitle}
                </p>
              )}
              {selectedOffer.description && (
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {selectedOffer.description}
                </p>
              )}

              {/* Price & Savings Pill */}
              {selectedOffer.price && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Special Offer Price</span>
                    <span className="text-base font-black text-blue-700">{selectedOffer.price}</span>
                  </div>
                  {selectedOffer.savings && (
                    <span className="px-2 py-1 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                      {selectedOffer.savings}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  triggerToast(`Locked in with ${selectedOffer.partner || 'Direct Partner'}!`);
                  setSelectedOffer(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <span>Book / Lock Offer</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ASK AI OR HOLD TO SPEAK DIALOG (AS SHOWN IN SCREENSHOT)     */}
      {/* ========================================================= */}
      {showAiModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70"
          onClick={() => setShowAiModal(false)}
        >
          <div
            className="w-full max-w-[390px] rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-3 bg-white text-slate-900 border border-slate-200"
            onClick={e => e.stopPropagation()}
            id="ai-speech-assistant-modal"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <TripShieldLogo size={24} />
                <h3 className="text-xs font-black text-slate-900">
                  TripShield Travel Assistant
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-600">
              Ask anything about flight buy windows, group discounts, or hotel splits:
            </p>

            {/* AI Response Box */}
            {aiResponse && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 leading-relaxed flex items-start gap-2">
                <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span>{aiResponse}</span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleAskAi} className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. Find best flights from KL to Shenzhen..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isAiThinking}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {isAiThinking ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-slate-400">
              <Mic size={12} className="text-blue-500" />
              <span>Hold button to speak voice query</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
