export interface FeedOffer {
  id: string;
  type: 'promo-card' | 'guide-card' | 'lounge-card' | 'flight-deal' | 'stay-deal' | 'experience-deal';
  title: string;
  subtitle?: string;
  authorName?: string;
  authorAvatar?: string;
  views?: string;
  likes?: number;
  imageUrl: string;
  badge?: string;
  badgeColor?: string; // e.g. '#2563EB', '#EAB308', '#10B981'
  tagList?: string[];
  cornerTag?: string; // e.g. "9/20"
  price?: string;
  originalPrice?: string;
  savings?: string;
  partner?: string;
  redirectUrl?: string;
  description?: string;
}

export const SCREENSHOT_FEED_OFFERS: FeedOffer[] = [
  {
    id: 'feed-1',
    type: 'promo-card',
    title: 'TripShield | Maybank Mastercard',
    subtitle: 'Credit & Debit Card Deals',
    description: 'Enjoy RM250 OFF on your flight booking! Valid for international group bookings.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    cornerTag: '9/20',
    badge: '3 Sep - 31 Dec 2026',
    badgeColor: '#EAB308',
    partner: 'Maybank Mastercard',
    savings: 'Save RM250',
    views: '24.5k',
    likes: 1820,
  },
  {
    id: 'feed-2',
    type: 'guide-card',
    title: '5 Best Things to Do in Shenzhen',
    subtitle: '深圳 · A City Where Future Meets Culture',
    authorName: 'Mahmud omer',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    views: '553',
    likes: 89,
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=800&auto=format&fit=crop&q=80',
    tagList: ['Ping An Tower', 'Window of World', 'OCT Loft'],
    partner: 'TripShield Guide',
  },
  {
    id: 'feed-3',
    type: 'lounge-card',
    title: '✈️ 3 ways to get FREE airport lounge access 👀',
    subtitle: 'FREE LOUNGE ACCESS WHILE YOU WAIT',
    description: 'Relax. Refresh. Recharge. Comfort before your flight with complimentary food & drinks.',
    authorName: 'LozzaQuozza',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    views: '10.2k',
    likes: 940,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
    badge: 'FREE ACCESS GUIDE',
    badgeColor: '#2563EB',
    partner: 'Plaza Premium / Priority Pass',
  },
  {
    id: 'feed-4',
    type: 'flight-deal',
    title: 'Last-Minute Business Class Flight Deals',
    subtitle: 'Golden Lounge Exclusive · KUL ➔ CMB & Beyond',
    authorName: 'Sarah Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    views: '4.8k',
    likes: 412,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    price: '$380',
    originalPrice: '$750',
    savings: 'Save $370',
    badge: 'Special Fare',
    badgeColor: '#059669',
    partner: 'Malaysia Airlines',
  },
  {
    id: 'feed-5',
    type: 'stay-deal',
    title: 'Gion Machiya Traditional Heritage Villa',
    subtitle: 'Kyoto, Japan · Fits 6 Guests Comfortably',
    authorName: 'Kenji Sato',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    views: '18.4k',
    likes: 1205,
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
    price: '$48',
    originalPrice: '$78',
    savings: '-38% Special Rate',
    badge: 'Top Rated Villa',
    badgeColor: '#7C3AED',
    partner: 'Booking.com Stays',
  },
  {
    id: 'feed-6',
    type: 'flight-deal',
    title: 'Paris Non-Stop Flights from New York (JFK)',
    subtitle: 'Air France / Delta · 7h 25m Direct',
    authorName: 'Alex Morgan',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    views: '9.1k',
    likes: 730,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
    price: '$420',
    originalPrice: '$620',
    savings: 'Save $200/pax',
    badge: '⚡ Weekend Flash Sale',
    badgeColor: '#DC2626',
    partner: 'Skyscanner Direct',
  },
  {
    id: 'feed-7',
    type: 'experience-deal',
    title: 'Santorini Sunset Catamaran & BBQ Cruise',
    subtitle: 'Aegean Sea · 5h Open Bar & Seafood Grill',
    authorName: 'Elena V.',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    views: '14.2k',
    likes: 890,
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop&q=80',
    price: '$65',
    originalPrice: '$95',
    savings: 'Group 25% Rebate',
    badge: 'B2B Partner Deal',
    badgeColor: '#0284C7',
    partner: 'Aegean Blue Charters',
  },
  {
    id: 'feed-8',
    type: 'stay-deal',
    title: 'Amalfi Cliffside Private Panoramic Villa',
    subtitle: 'Positano, Italy · Infinity Pool & Pizza Oven',
    authorName: 'Marco Rossi',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    views: '22.8k',
    likes: 1640,
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80',
    price: '$57',
    originalPrice: '$85',
    savings: '30% Off Group',
    badge: 'Sunset Gold Tier',
    badgeColor: '#D97706',
    partner: 'Booking.com Stays',
  },
];

export interface FlightOffer {
  id: string;
  destination: string;
  country: string;
  airportCode: string;
  departureCity: string;
  regularPrice: number;
  lockedPrice: number;
  savings: number;
  airline: string;
  flightType: string;
  stops: string;
  lockExpiresIn: string; // e.g. "48h Lock-in Window"
  lockHoursRemaining: number;
  matchScore: number; // group vibe / DNA match %
  tag: string;
  deepLinkPartner: string; // Skyscanner / Booking.com
  deepLinkUrl: string;
}

export interface HotelOffer {
  id: string;
  title: string;
  destination: string;
  type: string; // Villa / Ryokan / Boutique Resort
  stars: number;
  rating: number;
  reviewCount: number;
  capacity: string; // "Up to 6 guests"
  totalPricePerNight: number;
  pricePerPerson: number;
  discountPct: number;
  groupPerks: string[];
  vibeTag: string;
  groupSatisfactionScore: number; // 98%
  imageUrl: string;
}

export interface ExperienceOffer {
  id: string;
  title: string;
  location: string;
  duration: string;
  pricePerPerson: number;
  originalPrice: number;
  category: 'adventure' | 'culinary' | 'relaxation' | 'culture';
  highlight: string;
  groupOfferText: string;
  partnerVendor: string; // Local B2B partner
}

export const FLIGHT_OFFERS: FlightOffer[] = [
  {
    id: 'fl-1',
    destination: 'Paris',
    country: 'France',
    airportCode: 'CDG',
    departureCity: 'New York (JFK)',
    regularPrice: 620,
    lockedPrice: 420,
    savings: 200,
    airline: 'Air France / Delta',
    flightType: 'Non-stop',
    stops: 'Direct · 7h 25m',
    lockExpiresIn: '48h Buy Window Lock',
    lockHoursRemaining: 48,
    matchScore: 98,
    tag: 'Best Paris Price Detected',
    deepLinkPartner: 'Skyscanner Direct',
    deepLinkUrl: 'https://www.skyscanner.com',
  },
  {
    id: 'fl-2',
    destination: 'Tokyo',
    country: 'Japan',
    airportCode: 'NRT',
    departureCity: 'Los Angeles (LAX)',
    regularPrice: 940,
    lockedPrice: 680,
    savings: 260,
    airline: 'All Nippon Airways (ANA)',
    flightType: 'Group Saver (4+ pax)',
    stops: 'Direct · 11h 40m',
    lockExpiresIn: '72h Buy Window Lock',
    lockHoursRemaining: 72,
    matchScore: 96,
    tag: 'Group DNA Match #1',
    deepLinkPartner: 'ANA Group Link',
    deepLinkUrl: 'https://www.ana.co.jp',
  },
  {
    id: 'fl-3',
    destination: 'Rome',
    country: 'Italy',
    airportCode: 'FCO',
    departureCity: 'Chicago (ORD)',
    regularPrice: 580,
    lockedPrice: 395,
    savings: 185,
    airline: 'ITA Airways',
    flightType: 'Weekend Deal',
    stops: '1 stop · 10h 15m',
    lockExpiresIn: '18h Flash Window',
    lockHoursRemaining: 18,
    matchScore: 92,
    tag: 'Ending Soon',
    deepLinkPartner: 'Booking.com Flights',
    deepLinkUrl: 'https://www.booking.com',
  },
  {
    id: 'fl-4',
    destination: 'Reykjavik',
    country: 'Iceland',
    airportCode: 'KEF',
    departureCity: 'Boston (BOS)',
    regularPrice: 510,
    lockedPrice: 360,
    savings: 150,
    airline: 'Icelandair',
    flightType: 'Northern Lights Special',
    stops: 'Direct · 5h 15m',
    lockExpiresIn: '36h Buy Window Lock',
    lockHoursRemaining: 36,
    matchScore: 90,
    tag: 'Budget Friendly',
    deepLinkPartner: 'Skyscanner Affiliate',
    deepLinkUrl: 'https://www.skyscanner.com',
  },
];

export const HOTEL_OFFERS: HotelOffer[] = [
  {
    id: 'ht-1',
    title: 'Gion Machiya Traditional Heritage Villa',
    destination: 'Kyoto, Japan',
    type: 'Exclusive 4-Bedroom House',
    stars: 4.9,
    rating: 4.94,
    reviewCount: 184,
    capacity: 'Fits 6 friends comfortably',
    totalPricePerNight: 288,
    pricePerPerson: 48,
    discountPct: 35,
    groupPerks: ['Private hinoki onsen', 'Tatami lounge', 'Tea ceremony courtyard', 'Free luggage transfer'],
    vibeTag: '98% Group Vibe Match',
    groupSatisfactionScore: 98,
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'ht-2',
    title: 'Amalfi Cliffside Private Panoramic Villa',
    destination: 'Positano, Italy',
    type: 'Luxury Sea-view Estate',
    stars: 4.9,
    rating: 4.98,
    reviewCount: 92,
    capacity: 'Fits 8 friends (4 suites)',
    totalPricePerNight: 460,
    pricePerPerson: 57,
    discountPct: 30,
    groupPerks: ['Infinity pool', 'Chef pizza oven', 'Private boat dock access', 'Welcome limoncello'],
    vibeTag: 'Sunset Gold Tier',
    groupSatisfactionScore: 95,
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'ht-3',
    title: 'Zermatt Alpine Glass Panorama Chalet',
    destination: 'Zermatt, Switzerland',
    type: 'Ski-in Ski-out Lodge',
    stars: 4.8,
    rating: 4.89,
    reviewCount: 110,
    capacity: 'Fits 6 friends (3 lofts)',
    totalPricePerNight: 390,
    pricePerPerson: 65,
    discountPct: 25,
    groupPerks: ['Direct ski storage', 'Matterhorn view sauna', 'Fondue kit included'],
    vibeTag: 'Winter Adventure',
    groupSatisfactionScore: 94,
    imageUrl: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'ht-4',
    title: 'Seminyak Lush Palm Oasis Compound',
    destination: 'Bali, Indonesia',
    type: 'Private Pool Retreat',
    stars: 4.9,
    rating: 4.96,
    reviewCount: 245,
    capacity: 'Fits 8 friends (4 pavilions)',
    totalPricePerNight: 240,
    pricePerPerson: 30,
    discountPct: 40,
    groupPerks: ['Daily floating breakfast', '24h concierge', 'Motorbike rentals included'],
    vibeTag: 'Ultra Value Pick',
    groupSatisfactionScore: 99,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80',
  },
];

export const EXPERIENCE_OFFERS: ExperienceOffer[] = [
  {
    id: 'ex-1',
    title: 'Santorini Sunset Catamaran & BBQ Cruise',
    location: 'Santorini, Greece',
    duration: '5 hours',
    pricePerPerson: 65,
    originalPrice: 95,
    category: 'adventure',
    highlight: 'Includes open Greek wine bar & fresh seafood grill',
    groupOfferText: 'Buy 4 get 25% group rebate',
    partnerVendor: 'Aegean Blue Charters (B2B Partner)',
  },
  {
    id: 'ex-2',
    title: 'Swiss Glacier Express Panoramic Day Rail',
    location: 'St. Moritz - Zermatt',
    duration: 'Full Day',
    pricePerPerson: 85,
    originalPrice: 120,
    category: 'adventure',
    highlight: 'Over 291 bridges & 91 tunnels in luxury dome cars',
    groupOfferText: 'Exclusive group seat reservation block',
    partnerVendor: 'Rhaetian Railway Group Desk',
  },
  {
    id: 'ex-3',
    title: 'Kyoto Gion Kaiseki 9-Course Secret Tasting',
    location: 'Gion District, Kyoto',
    duration: '2.5 hours',
    pricePerPerson: 58,
    originalPrice: 90,
    category: 'culinary',
    highlight: 'Private tea room reservation with sake pairing',
    groupOfferText: 'TripShield Off-Peak Fallback Deal',
    partnerVendor: 'Gion Kura Dining (Merchant Network)',
  },
];
