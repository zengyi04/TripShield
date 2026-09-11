import React, { useRef, useState, useEffect } from 'react';
import { Alert, Image, Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_USERS, MockUser } from '../../data/mockUsers';
import { APP_GRADIENT_LOCATIONS, screenGradientStops } from '../../utils/appTheme';
import { HeaderBackButton, ScreenTopBar } from '../ScreenTopBar';

const modeLabel: Record<string, string> = { walk: 'Walk', metro: 'Subway', bus: 'Bus', taxi: 'Taxi', flight: 'Flight', ferry: 'Ferry', rail: 'Rail' };
const mapsDir = (from: string, to: string) => `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=transit`;
const osmMap = (lat: number, lng: number) => `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=640x280&markers=${lat},${lng},red-pushpin`;
const openMaps = (url: string) => { Linking.openURL(url).catch(() => undefined); };

interface ConsensusScreenProps {
  topColor: string;
  bottomColor: string;
  onGoHome?: () => void;
}

 type ConsensusPhase = 'hub' | 'setup' | 'join' | 'questions' | 'group' | 'itinerary' | 'dna' | 'radar' | 'tokens' | 'result';

export function ConsensusScreen({ topColor, bottomColor, onGoHome }: ConsensusScreenProps) {
  const [phase, setPhase] = useState<ConsensusPhase>('hub');
  const [roomCreated, setRoomCreated] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState<string[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [showWhy, setShowWhy] = useState(false);
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [tripDates, setTripDates] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const today = new Date();
  const todayValue = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const [calendarMonth, setCalendarMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [travellerName, setTravellerName] = useState('');
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [travellers, setTravellers] = useState<(MockUser & { status: 'pending' | 'joined' | 'declined'; quizDone?: boolean })[]>([
    { id: 'user-huimin', username: '@huimin', displayName: 'Hui Min', initials: 'H', accent: '#2563eb', city: 'Kuala Lumpur', status: 'joined', quizDone: true },
  ]);
  const [joinCode, setJoinCode] = useState('SEOU-2026');
  const [referralCode, setReferralCode] = useState('');
  const [inviteNotification, setInviteNotification] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [memberVotes, setMemberVotes] = useState<Record<string, Record<string, 'want' | 'maybe' | 'skip'>>>({
    'Korean Food Tour': { 'Hui Min': 'want', 'Sarah': 'want', 'Jason': 'maybe', 'Mei': 'want' },
    'Myeongdong + Street Food': { 'Hui Min': 'want', 'Sarah': 'maybe', 'Jason': 'want', 'Mei': 'skip' },
    'Palace + Traditional Village': { 'Hui Min': 'maybe', 'Sarah': 'want', 'Jason': 'skip', 'Mei': 'want' },
    'DMZ + Han River Experience': { 'Hui Min': 'skip', 'Sarah': 'want', 'Jason': 'want', 'Mei': 'maybe' },
    'Hongdae Nightlife Tour': { 'Hui Min': 'maybe', 'Sarah': 'skip', 'Jason': 'want', 'Mei': 'skip' },
  });
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<any | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [tripComplete, setTripComplete] = useState(false);
  const [viewingCompleted, setViewingCompleted] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiThinkingProgress, setAiThinkingProgress] = useState(0);

  // Mock flow: simulate pending people joining and answering quizzes
  useEffect(() => {
    if (phase !== 'setup' || !roomCreated) return;
    const pendingMembers = travellers.filter(t => t.status === 'pending');
    if (pendingMembers.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    pendingMembers.forEach((member, i) => {
      const joinDelay = 3000 + i * 3000;
      const quizDelay = joinDelay + 4000;

      timers.push(setTimeout(() => {
        setTravellers(prev => prev.map(t => t.id === member.id ? { ...t, status: 'joined' as const } : t));
        setInviteNotification(`${member.displayName} just joined the room!`);
        setTimeout(() => setInviteNotification(null), 3000);
      }, joinDelay));

      timers.push(setTimeout(() => {
        setTravellers(prev => prev.map(t => t.id === member.id ? { ...t, quizDone: true } : t));
      }, quizDelay));
    });

    return () => timers.forEach(clearTimeout);
  }, [phase, roomCreated, travellers.filter(t => t.status === 'pending').map(t => t.id).join(',')]);

  // AI thinking animation on group page
  useEffect(() => {
    if (phase !== 'group') { setAiThinking(false); setAiThinkingProgress(0); return; }
    setAiThinking(true);
    setAiThinkingProgress(0);
    const steps = [15, 35, 55, 75, 90, 100];
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((pct, i) => {
      stepTimers.push(setTimeout(() => setAiThinkingProgress(pct), 600 * (i + 1)));
    });
    stepTimers.push(setTimeout(() => setAiThinking(false), 600 * (steps.length + 1)));
    return () => stepTimers.forEach(clearTimeout);
  }, [phase]);

  const toggleToken = (token: string) => {
    setSelectedTokens(current =>
      current.includes(token)
        ? current.filter(item => item !== token)
        : current.length < 3
          ? [...current, token]
          : current
    );
  };
 
   const joinExistingRoom = () => {
     if (!referralCode.trim()) return;
     setJoinCode(referralCode.trim().toUpperCase());
     setTripName('Seoul Friends Trip');
     setRoomCreated(true);
     setPhase('questions');
   };

  const advance = (nextPhase: ConsensusPhase) => {
    setPhase(nextPhase);
  };

  const addTraveller = () => {
    if (!selectedUser || travellers.length >= 8) return;
    setTravellers(current => [...current, { ...selectedUser, status: 'pending' as const }]);
    setInviteNotification(`${selectedUser.displayName} has been invited`);
    setTravellerName('');
    setSelectedUser(null);
  };

  const removeTraveller = (id: string) => {
    const traveller = travellers.find(t => t.id === id);
    if (traveller && traveller.status === 'joined' && travellers.indexOf(traveller) === 0) return;
    Alert.alert('Remove member', `Remove ${traveller?.displayName} from the trip?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setTravellers(current => current.filter(t => t.id !== id)) },
    ]);
  };

  const matchingUsers = MOCK_USERS.filter(user => {
    const query = travellerName.trim().toLowerCase();
    if (!query) return false;
    return `${user.displayName} ${user.username} ${user.city}`.toLowerCase().includes(query) && !travellers.some(traveller => traveller.id === user.id);
  }).slice(0, 4);

  const createRoom = () => {
    if (tripName.trim() && destination.trim() && tripDates.trim()) setRoomCreated(true);
  };

  const shareRoom = async () => {
    await Share.share({ message: `Join my TripShield room: ${tripName}\nCode: ${joinCode}\nLink: tripshield.app/join/${joinCode}` });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const changeMonth = (offset: number) => {
    const next = new Date(calendarMonth.year, calendarMonth.month + offset, 1);
    setCalendarMonth({ year: next.getFullYear(), month: next.getMonth() });
  };

  const formatDate = (value: number) => {
    const date = new Date(value);
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const selectDate = (day: number) => {
    const value = Date.UTC(calendarMonth.year, calendarMonth.month, day);
    if (value < todayValue) return;
    if (!startDate || endDate) {
      setStartDate(value);
      setEndDate(null);
      setTripDates(`${day} ${monthNames[calendarMonth.month]} ${calendarMonth.year} - select end date`);
      return;
    }
    if (value < startDate) {
      setStartDate(value);
      setTripDates(`${formatDate(value)} - select end date`);
    } else {
      setEndDate(value);
      setTripDates(`${formatDate(startDate)} - ${formatDate(value)}`);
    }
  };

  const renderCalendarDays = (day: number, index: number) => {
    const value = Date.UTC(calendarMonth.year, calendarMonth.month, day);
    const disabled = value < todayValue;
    const selected = value === startDate || value === endDate;
    const inRange = startDate !== null && endDate !== null && value > startDate && value < endDate;
    return (
      <Pressable
        key={index}
        disabled={disabled}
        onPress={() => selectDate(day)}
        style={[styles.calendarDay, disabled && styles.calendarDayDisabled, selected && styles.calendarDaySelected, inRange && styles.calendarDayRange]}
      >
        <Text style={[styles.calendarDayText, disabled && styles.calendarDayTextDisabled, selected && styles.calendarDayTextSelected, inRange && styles.calendarDayTextRange]}>{day}</Text>
      </Pressable>
    );
  };

  const selectAnswer = (answer: string) => {
    setCurrentSelection(answer);
  };

  const goToNextQuestion = () => {
    if (!currentSelection) return;
    const nextAnswers = [...questionAnswers];
    nextAnswers[questionIndex] = currentSelection;
    setQuestionAnswers(nextAnswers);
    setCurrentSelection(null);
    if (questionIndex < 5) {
      setQuestionIndex(index => index + 1);
    }
  };

  const castVote = (optionName: string, memberName: string, vote: 'want' | 'maybe' | 'skip') => {
    setMemberVotes(prev => {
      const optionVotes = { ...(prev[optionName] || {}) };
      optionVotes[memberName] = vote;
      return { ...prev, [optionName]: optionVotes };
    });
  };

  const goBackQuestion = () => {
    if (questionIndex > 0) {
      setCurrentSelection(questionAnswers[questionIndex] || null);
      setQuestionIndex(index => index - 1);
    }
  };

  const questions = [
    { label: 'What is your travel style?', emoji: '🧳', options: [{ text: 'Relaxed', emoji: '🏖️' }, { text: 'Balanced', emoji: '⚖️' }, { text: 'Packed', emoji: '🏃' }] },
    { label: 'What do you enjoy?', emoji: '✨', options: [{ text: 'Food', emoji: '🍜' }, { text: 'Shopping', emoji: '🛍️' }, { text: 'Culture', emoji: '🏯' }, { text: 'Nature', emoji: '🌿' }, { text: 'Nightlife', emoji: '🌃' }, { text: 'Cafes', emoji: '☕' }] },
    { label: 'What is your spending style?', emoji: '💰', options: [{ text: 'Save as much as possible', emoji: '🐷' }, { text: 'Balanced spending', emoji: '⚖️' }, { text: 'Comfortable spending', emoji: '💳' }, { text: 'Spend more', emoji: '💎' }] },
    { label: 'How much walking feels good?', emoji: '🚶', options: [{ text: 'Low', emoji: '🛋' }, { text: 'Moderate', emoji: '🚶' }, { text: 'A lot', emoji: '🥾' }] },
    { label: 'What do you absolutely not want?', emoji: '🚫', options: [{ text: 'Early mornings', emoji: '⏰' }, { text: 'Long walking', emoji: '🦶' }, { text: 'Expensive activities', emoji: '💸' }, { text: 'Outdoor plans in rain', emoji: '🌧️' }] },
    { label: 'Pick your top priority', emoji: '⭐', options: [{ text: 'Food', emoji: '🍜' }, { text: 'Shopping', emoji: '🛍️' }, { text: 'Culture', emoji: '🏯' }, { text: 'Nature', emoji: '🌿' }, { text: 'Nightlife', emoji: '🎵' }] },
  ];
  const tripInfo = {
    destination: 'Shenzhen Tech Tour',
    city: 'Shenzhen',
    dates: 'Sep 12 - Sep 14, 2026',
    hotel: 'Renaissance Shenzhen Hotel',
    hotelPrice: 'RM380/night',
    hotelRating: '4.6',
    hotelAddress: 'Futian CBD, Shenzhen',
    totalBudget: 'RM2,450',
    budgetPerPerson: 'RM612',
    currency: '¥',
    satisfaction: 91,
  };

  const itineraryData: Record<number, Array<{
    time: string;
    place: string;
    emoji: string;
    description: string;
    duration: string;
    price: string;
    transport: string;
    transportTime: string;
    rating: string;
    type: string;
    address: string;
    tips?: string;
    highlights?: string[];
    image?: string;
    lat: number;
    lng: number;
    routeFrom: string;
    routeSummary: string;
    routeFare: string;
    routeLegs: { mode: string; instruction: string; line?: string; durationMin: number }[];
    photoUrl: string;
  }>> = {
    1: [
      {
        time: '11:30 AM',
        place: 'Flight CZ3028 \u2192 SZX Airport',
        emoji: '\u2708\ufe0f',
        description: 'Direct flight from Kuala Lumpur to Shenzhen Baoan International Airport. Terminal 3 arrival.',
        duration: '3h 35m',
        price: 'RM450',
        transport: 'Flight CZ3028',
        transportTime: '3h 35m',
        rating: '4.5',
        type: 'Flight',
        address: 'Shenzhen Baoan International Airport, Terminal 3',
        tips: 'Check in at KLIA T1, gate B22',
        highlights: ['Direct flight', 'Terminal 3', 'Metro connection'],
        image: 'flight',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Shenzhen_Bao%27an_Airport.jpg',
        lat: 22.6393, lng: 113.8107,
        routeFrom: 'Kuala Lumpur International Airport (KUL)',
        routeSummary: 'Direct flight CZ3028, then Airport Metro Line 11 into Futian.',
        routeFare: 'Flight booked + Metro \u00a510',
        routeLegs: [{ mode: 'flight', instruction: 'Check in at KLIA T1, board CZ3028 to SZX T3.', line: 'CZ3028', durationMin: 215 }, { mode: 'walk', instruction: 'Follow signs to Airport East Metro (Line 11), 8 min walk inside T3.', durationMin: 8 }, { mode: 'metro', instruction: 'Ride Line 11 (toward Futian) to Futian Station.', line: 'Metro Line 11', durationMin: 32 }],
      },
      {
        time: '01:00 PM',
        place: 'Renaissance Shenzhen Hotel',
        emoji: '\ud83c\udfe8',
        description: 'Premium 5-star hotel in Futian CBD. Modern rooms with city skyline views, rooftop pool and fitness center.',
        duration: 'Check-in',
        price: 'RM380/night',
        transport: 'Metro Line 11',
        transportTime: '38 min',
        rating: '4.6',
        type: 'Hotel',
        address: 'Renaissance Shenzhen Hotel, Futian',
        tips: '3F lobby for check-in, free WiFi',
        highlights: ['5-star hotel', 'Rooftop pool', 'City views', 'Free breakfast'],
        image: 'hotel',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/SZ_%E6%B7%B1%E5%9C%B3_Shenzhen_%E7%BE%85%E6%B9%96_Luohu_Dongmen_South_Road_Jiabin_Road_%E5%BD%AD%E5%B9%B4%E8%90%AC%E9%BA%97%E9%85%92%E5%BA%97_Panglin_Renaissance_Hotel_Hotel_1252pm_February_2025_R12S_08.jpg',
        lat: 22.5369, lng: 114.058,
        routeFrom: 'SZX Airport T3',
        routeSummary: 'Airport Metro Line 11 to Futian, then 6-min walk to hotel.',
        routeFare: '\u00a510 metro',
        routeLegs: [{ mode: 'metro', instruction: 'Line 11 Airport East \u2192 Futian. Stay in car 4 for the B2 exit.', line: 'Metro Line 11', durationMin: 32 }, { mode: 'walk', instruction: 'Exit 15, walk 450m along Zhongxin 4th Rd to Renaissance lobby.', durationMin: 6 }],
      },
      {
        time: '03:00 PM',
        place: 'OCT-LOFT Creative Park',
        emoji: '\ud83c\udfa8',
        description: 'Vibrant arts district in converted industrial warehouses. Gallery tours, indie caf\u00e9s, street art, and design studios.',
        duration: '2.5 hours',
        price: '\u00a50 (Free)',
        transport: 'Metro Line 3',
        transportTime: '36 min',
        rating: '4.7',
        type: 'Culture',
        address: 'OCT-LOFT, Nanshan, Shenzhen',
        tips: 'North District has the best galleries',
        highlights: ['Art galleries', 'Street art', 'Indie caf\u00e9s', 'Photo spots'],
        image: 'octloft',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/59/OCT_LOFT%2C_SHENZHEN_%2822%29.jpg',
        lat: 22.5362, lng: 113.9854,
        routeFrom: 'Renaissance Shenzhen Hotel',
        routeSummary: 'Metro Line 3 + 10-min walk into the loft lanes.',
        routeFare: '\u00a54 metro',
        routeLegs: [{ mode: 'walk', instruction: 'Walk to Shopping Park Station (Line 1/3), Exit C.', durationMin: 8 }, { mode: 'metro', instruction: 'Line 3 toward Yitian, alight at Qiaocheng East.', line: 'Metro Line 3', durationMin: 18 }, { mode: 'walk', instruction: 'Exit B, walk Enping St into North District galleries.', durationMin: 10 }],
      },
      {
        time: '07:00 PM',
        place: 'Bistro 1873 Cantonese Fusion',
        emoji: '\ud83c\udf7d\ufe0f',
        description: 'Award-winning Cantonese fusion restaurant in Xiangmihu. Signature dishes include truffle dim sum and wagyu char siu.',
        duration: '1.5 hours',
        price: '\u00a5280/person',
        transport: 'Metro Line 2',
        transportTime: '20 min',
        rating: '4.8',
        type: 'Food',
        address: 'Bistro 1873, Xiangmihu, Futian',
        tips: 'Reservation for 4 pax confirmed',
        highlights: ['Truffle dim sum', 'Wagyu char siu', 'Ambient lighting', 'Group friendly'],
        image: 'dinner',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Summer_Pavilion_restaurant%2C_The_Ritz-Carlton_Millenia_Singapore_-_20110928.jpg',
        lat: 22.547, lng: 114.034,
        routeFrom: 'OCT-LOFT Creative Park',
        routeSummary: 'Line 2 to Xiangmihu, then 4-min walk. Taxi backup if rain peaks.',
        routeFare: '\u00a55 metro / taxi ~\u00a522',
        routeLegs: [{ mode: 'metro', instruction: 'Walk to Qiaocheng East, Line 2 toward Xinxiu, alight Xiangmihu.', line: 'Metro Line 2', durationMin: 16 }, { mode: 'walk', instruction: 'Exit A, 280m to restaurant porch (covered walkway).', durationMin: 4 }],
      }
    ],
    2: [
      {
        time: '09:00 AM',
        place: 'Huaqiangbei Electronics Market',
        emoji: '\ud83d\udcbb',
        description: 'World\'s largest electronics market. Explore SEG Plaza\'s 7 floors of tech gadgets, drones, components, and accessories.',
        duration: '2.5 hours',
        price: '\u00a5200 (shopping)',
        transport: 'Metro Line 7',
        transportTime: '22 min',
        rating: '4.5',
        type: 'Tech',
        address: 'Huaqiangbei Road, Futian',
        tips: 'SEG Plaza floors 1-3 are best for gadgets',
        highlights: ['7 floors of tech', 'Drone demos', 'Custom PC builds', 'Best prices'],
        image: 'huaqiangbei',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Entrance_of_Huaqiangbei%2C_2017.jpg',
        lat: 22.546, lng: 114.0857,
        routeFrom: 'Renaissance Shenzhen Hotel',
        routeSummary: 'Line 7 direct to Huaqiang North. Covered mall access.',
        routeFare: '\u00a53 metro',
        routeLegs: [{ mode: 'walk', instruction: 'Walk to Futian Station, transfer hall to Line 7.', durationMin: 6 }, { mode: 'metro', instruction: 'Line 7 toward Tai\u0101n, alight Huaqiang North.', line: 'Metro Line 7', durationMin: 12 }, { mode: 'walk', instruction: 'Exit A1 into SEG Plaza (fully indoor).', durationMin: 4 }],
      },
      {
        time: '12:00 PM',
        place: 'Lianhuashan Park',
        emoji: '\ud83c\udf3f',
        description: 'Beautiful urban park with Deng Xiaoping statue at the peak. Panoramic views of Shenzhen\'s skyline and CBD.',
        duration: '1.5 hours',
        price: '\u00a50 (Free)',
        transport: 'Metro Line 3',
        transportTime: '24 min',
        rating: '4.6',
        type: 'Nature',
        address: 'Lianhuashan Park, Futian',
        tips: 'Hike to the statue for the best city view',
        highlights: ['Deng Xiaoping statue', 'City panorama', 'Peaceful trails', 'Photo ops'],
        image: 'park',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Statue_of_Deng_Xiaoping_in_Lianhuashan_Park_Shenzen_China_1310759.jpg',
        lat: 22.5536, lng: 114.0542,
        routeFrom: 'Huaqiangbei Electronics Market',
        routeSummary: "Line 3 to Children\u2019s Palace, then 12-min uphill walk.",
        routeFare: '\u00a53 metro',
        routeLegs: [{ mode: 'metro', instruction: "Line 3 one stop to Children\u2019s Palace.", line: 'Metro Line 3', durationMin: 6 }, { mode: 'walk', instruction: 'Exit B, enter south gate, hike main trail to the statue.', durationMin: 18 }],
      },
      {
        time: '02:30 PM',
        place: 'Tencent HQ Visitor Center',
        emoji: '\ud83c\udfe2',
        description: 'Visit the iconic Tencent Binhai Building. Tech exhibition hall, AI demos, and WeChat ecosystem showcase.',
        duration: '2 hours',
        price: '\u00a50 (Free)',
        transport: 'Metro + Bus M486',
        transportTime: '47 min',
        rating: '4.4',
        type: 'Tech',
        address: 'Tencent Binhai Building, Nanshan',
        tips: 'Booking required \u2014 confirm at front desk',
        highlights: ['AI demos', 'WeChat showcase', 'Tech gallery', 'Souvenir shop'],
        image: 'tencent',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Tencent_binghai_building202012.jpg',
        lat: 22.525, lng: 113.935,
        routeFrom: 'Lianhuashan Park',
        routeSummary: 'Line 2 to Window of the World, then Bus M486 to Tencent.',
        routeFare: '\u00a56 metro + \u00a52 bus',
        routeLegs: [{ mode: 'metro', instruction: "Children\u2019s Palace Line 4 \u2192 Convention & Exhibition Center, transfer Line 2.", line: 'Metro Line 4 + 2', durationMin: 28 }, { mode: 'bus', instruction: 'At Window of the World Exit H, board M486 toward Qianhai.', line: 'Bus M486', durationMin: 14 }, { mode: 'walk', instruction: 'Alight Tencent Binhai, security desk on L1.', durationMin: 5 }],
      },
      {
        time: '06:00 PM',
        place: 'Shenzhen Bay Seafood Dinner',
        emoji: '\ud83e\udd90',
        description: 'Fresh seafood at Sea World plaza in Shekou. Pick your seafood live, cooked to your style. Stunning waterfront sunset views.',
        duration: '2 hours',
        price: '\u00a5350/person',
        transport: 'Bus 72',
        transportTime: '20 min',
        rating: '4.7',
        type: 'Food',
        address: 'Sea World, Shekou, Nanshan',
        tips: 'Pick seafood live at the tanks',
        highlights: ['Live seafood selection', 'Waterfront dining', 'Sunset views', 'Local beer'],
        image: 'seafood',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Sea_World_in_Shekou_Shenzhen2021.jpg',
        lat: 22.4818, lng: 113.913,
        routeFrom: 'Tencent Binhai Building',
        routeSummary: 'Bus 72 to Sea World Station, 3-min walk to the plaza.',
        routeFare: '\u00a52 bus',
        routeLegs: [{ mode: 'bus', instruction: 'Board Bus 72 toward Shekou, alight Sea World Metro.', line: 'Bus 72', durationMin: 16 }, { mode: 'walk', instruction: 'Cross the plaza to the outdoor seafood street.', durationMin: 4 }],
      }
    ],
    3: [
      {
        time: '09:30 AM',
        place: 'Shenzhen Museum of Contemporary Art',
        emoji: '\ud83c\udfdb\ufe0f',
        description: 'Stunning modern art museum with rotating exhibitions. Digital art installations and interactive galleries.',
        duration: '2 hours',
        price: '\u00a50 (Free)',
        transport: 'Metro Line 3',
        transportTime: '12 min',
        rating: '4.6',
        type: 'Culture',
        address: 'Shenzhen Museum of Contemporary Art, Futian',
        tips: 'VIP fast-pass available at entrance',
        highlights: ['Digital art', 'Interactive galleries', 'Rotating exhibits', 'Gift shop'],
        image: 'museum',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/75/SZ_%E6%B7%B1%E5%9C%B3_Shenzhen_Futian_Fuzhong_Road_MOCAPE_Museum_of_Contemporary_Art_%26_Planning_Exhibition_facade_Sept_2017_IX1_03.jpg',
        lat: 22.5478, lng: 114.0595,
        routeFrom: 'Renaissance Shenzhen Hotel',
        routeSummary: "Line 3 two stops to Children\u2019s Palace, Exit D into MOCAE.",
        routeFare: '\u00a52 metro',
        routeLegs: [{ mode: 'metro', instruction: "Shopping Park Line 3 \u2192 Children\u2019s Palace.", line: 'Metro Line 3', durationMin: 8 }, { mode: 'walk', instruction: 'Exit D, 3 min through Civic Center underpass (dry).', durationMin: 4 }],
      },
      {
        time: '12:00 PM',
        place: 'Ping An Finance Center Observation',
        emoji: '\ud83c\udfd9\ufe0f',
        description: '116th floor observation deck with 360\u00b0 views of Shenzhen. One of the tallest buildings in the world at 599m.',
        duration: '1.5 hours',
        price: '\u00a5200/person',
        transport: 'Walk',
        transportTime: '5 min',
        rating: '4.8',
        type: 'Sightseeing',
        address: 'Ping An Finance Center, 116F, Futian',
        tips: 'Go on clear day for best views',
        highlights: ['360\u00b0 city views', '599m height', 'Glass floor section', 'Sky caf\u00e9'],
        image: 'observation',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/%E4%BA%91%E9%99%85%E8%A7%82%E5%85%89%E5%B1%82_2019_-_03.jpg',
        lat: 22.533, lng: 114.055,
        routeFrom: 'Shenzhen Museum of Contemporary Art',
        routeSummary: 'Short walk to Ping An Finance Center.',
        routeFare: 'Walk',
        routeLegs: [{ mode: 'walk', instruction: 'Exit museum, walk 5 min along Zhongxin 4th Rd to PAFC tower lobby.', durationMin: 5 }],
      },
      {
        time: '02:00 PM',
        place: 'Coco Park Shopping Mall',
        emoji: '\ud83d\udecd\ufe0f',
        description: 'Premium shopping destination with international brands, local designers, and a vibrant food court.',
        duration: '2.5 hours',
        price: '\u00a5500 (shopping)',
        transport: 'Walk',
        transportTime: '10 min',
        rating: '4.3',
        type: 'Shopping',
        address: 'Coco Park, Futian',
        tips: 'Tax refund available for tourists',
        highlights: ['International brands', 'Local designers', 'Food court', 'Tax refund'],
        image: 'shopping',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/SZ_Shenzhen_Futian_Galaxy_CoCo_Park_Shopping_mall_shop_SnowWhite_Wig_July_2025_R12S.jpg',
        lat: 22.5345, lng: 114.0565,
        routeFrom: 'Ping An Finance Center',
        routeSummary: 'Walk to Shopping Park / Coco Park link.',
        routeFare: 'Walk',
        routeLegs: [{ mode: 'walk', instruction: 'Walk through the mall link-bridge into Coco Park.', durationMin: 10 }],
      },
      {
        time: '05:30 PM',
        place: 'Farewell Dinner \u2014 Hai Di Lao Hotpot',
        emoji: '\ud83c\udf72',
        description: 'China\'s most famous hotpot chain. Premium broth bases, fresh ingredients, and interactive dining experience.',
        duration: '2 hours',
        price: '\u00a5180/person',
        transport: 'Metro Line 1+2',
        transportTime: '25 min',
        rating: '4.7',
        type: 'Food',
        address: 'Hai Di Lao, MixC, Luohu',
        tips: 'Try the tomato broth base \u2014 signature',
        highlights: ['Premium broth', 'Fresh ingredients', 'Interactive dining', 'Group fun'],
        image: 'hotpot',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/SZ_%E6%B7%B1%E5%9C%B3_Shenzhen_%E7%A6%8F%E7%94%B0_Futian_%E7%9F%B3%E5%BB%88%E6%99%82%E4%BB%A3%E5%BB%A3%E5%A0%B4_Shixia_Times_Square_mall_shop_%E6%B5%B7%E5%BA%95%E6%92%88_Hai_Hot_Pot_Restaurant_July_2025_R12S_02.jpg',
        lat: 22.5465, lng: 114.112,
        routeFrom: 'Coco Park Shopping Mall',
        routeSummary: 'Line 1 to Grand Theater, transfer Line 2 to Luohu / MixC link.',
        routeFare: '\u00a56 metro',
        routeLegs: [{ mode: 'metro', instruction: 'Shopping Park Line 1 \u2192 Grand Theater, transfer Line 2.', line: 'Metro Line 1 + 2', durationMin: 22 }, { mode: 'walk', instruction: 'Exit B, walk 200m to Hai Di Lao MixC entrance.', durationMin: 3 }],
      }
    ]
  };

  return (
    <LinearGradient colors={screenGradientStops(topColor, bottomColor)} locations={APP_GRADIENT_LOCATIONS} style={styles.page}>
      {/* Header - only show for hub */}
      {phase === 'hub' && (
        <ScreenTopBar
          title="Trip rooms"
          left={onGoHome ? <HeaderBackButton onPress={onGoHome} /> : undefined}
        />
      )}

      {/* Floating back button for room phases */}
      {phase !== 'hub' && phase !== 'join' && !viewingCompleted && (
        <Pressable onPress={() => { setPhase('hub'); setViewingCompleted(false); }} style={styles.floatingBack}>
          <Ionicons name="arrow-back" size={18} color="#1e3a8a" />
        </Pressable>
      )}

      {/* Back button for join page */}
      {phase === 'join' && (
        <Pressable onPress={() => setPhase('hub')} style={styles.floatingBack}>
          <Ionicons name="arrow-back" size={18} color="#1e3a8a" />
        </Pressable>
      )}

      <View style={styles.body}>
        {phase !== 'hub' && phase !== 'join' && (
          <View style={styles.phaseRail}>
            {(['setup', 'questions', 'group', 'itinerary'] as const).map((item, index) => {
              const phases = ['setup', 'questions', 'group', 'itinerary'];
              const currentIndex = phases.indexOf(phase);
              const isCompleted = index < currentIndex;
              const isActive = index === currentIndex;
              return (
                <View key={item} style={styles.phaseItem}>
                  <View style={styles.phaseDotWrapper}>
                    {index > 0 && <View style={[styles.phaseLine, isCompleted ? styles.phaseLineCompleted : styles.phaseLineInactive]} />}
                    <View style={[styles.phaseDot, isActive ? styles.phaseDotActive : isCompleted ? styles.phaseDotCompleted : styles.phaseDotInactive]}>
                      <Text style={[styles.phaseDotText, isActive ? styles.phaseDotTextActive : isCompleted ? styles.phaseDotTextCompleted : styles.phaseDotTextInactive]}>{isCompleted ? '✓' : index + 1}</Text>
                    </View>
                  </View>
                  <Text style={[styles.phaseLabel, isActive ? styles.phaseLabelActive : isCompleted ? styles.phaseLabelCompleted : styles.phaseLabelInactive]}>{item === 'setup' ? 'TRIP' : item === 'questions' ? 'DNA' : item === 'group' ? 'GROUP' : 'PLAN'}</Text>
                </View>
              );
            })}
          </View>
        )}

        {phase === 'hub' ? (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={styles.hubPanel}>
            <Text style={styles.eyebrowDark}>YOUR TRIP ROOMS</Text>
            <Text style={styles.panelTitle}>Pick up where you left off.</Text>

            {/* Action Buttons */}
            <View style={styles.hubActions}>
              <Pressable onPress={() => setPhase('setup')} style={styles.hubActionButton}>
                <View style={styles.hubActionIcon}><Ionicons name="add" size={20} color="#fff" /></View>
                <View style={styles.hubActionText}>
                  <Text style={styles.hubActionTitle}>Create new room</Text>
                  <Text style={styles.hubActionSub}>Start a new trip</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </Pressable>
              <Pressable onPress={() => setPhase('join')} style={styles.hubActionButton}>
                <View style={[styles.hubActionIcon, { backgroundColor: '#7c3aed' }]}><Ionicons name="key-outline" size={20} color="#fff" /></View>
                <View style={styles.hubActionText}>
                  <Text style={styles.hubActionTitle}>Join a room</Text>
                  <Text style={styles.hubActionSub}>Enter referral code</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </Pressable>
            </View>

            {/* History Rooms */}
            <Text style={styles.sectionDivider}>RECENT ROOMS</Text>
            <View style={styles.historyCard}><View style={styles.historyTop}><View><Text style={styles.historyTitle}>Seoul Friends Trip</Text><Text style={styles.historyMeta}>Seoul · 12 - 16 December 2026</Text></View><Text style={styles.statusDone}>PLANNING</Text></View><View style={styles.historyProgress}><View style={[styles.historyProgressFill, { width: '64%' }]} /></View><Text style={styles.historyStatus}>3 of 4 preferences collected · AI analysis ready soon</Text><Pressable onPress={() => { setTripName('Seoul Friends Trip'); setRoomCreated(true); setPhase('questions'); }} style={styles.resumeButton}><Text style={styles.resumeButtonText}>Continue planning →</Text></Pressable></View>
            <View style={styles.historyCard}><View style={styles.historyTop}><View><Text style={styles.historyTitle}>Tokyo 2025</Text><Text style={styles.historyMeta}>Tokyo · Completed itinerary</Text></View><Text style={styles.statusComplete}>COMPLETE</Text></View><Text style={styles.historyStatus}>91% group satisfaction · 4 travellers</Text><Pressable onPress={() => { setTripName('Tokyo 2025'); setViewingCompleted(true); setPhase('itinerary'); }} style={styles.resumeButton}><Text style={styles.resumeButtonText}>View plan →</Text></Pressable></View>
            <View style={styles.historyCard}><View style={styles.historyTop}><View><Text style={styles.historyTitle}>Bali Beach Escape</Text><Text style={styles.historyMeta}>Bali · 8 - 14 March 2026</Text></View><Text style={styles.statusDone}>PLANNING</Text></View><View style={styles.historyProgress}><View style={[styles.historyProgressFill, { width: '40%' }]} /></View><Text style={styles.historyStatus}>2 of 5 preferences collected · Waiting on 3 members</Text><Pressable onPress={() => { setTripName('Bali Beach Escape'); setRoomCreated(true); setPhase('questions'); }} style={styles.resumeButton}><Text style={styles.resumeButtonText}>Continue planning →</Text></Pressable></View>
            <View style={styles.historyCard}><View style={styles.historyTop}><View><Text style={styles.historyTitle}>London Weekend</Text><Text style={styles.historyMeta}>London · 20 - 22 January 2026</Text></View><Text style={styles.statusComplete}>COMPLETE</Text></View><Text style={styles.historyStatus}>87% group satisfaction · 2 travellers</Text><Pressable onPress={() => { setTripName('London Weekend'); setViewingCompleted(true); setPhase('itinerary'); }} style={styles.resumeButton}><Text style={styles.resumeButtonText}>View plan →</Text></Pressable></View>
            <View style={styles.historyCard}><View style={styles.historyTop}><View><Text style={styles.historyTitle}>Singapore Food Trail</Text><Text style={styles.historyMeta}>Singapore · 5 - 7 February 2026</Text></View><Text style={styles.statusDone}>PLANNING</Text></View><View style={styles.historyProgress}><View style={[styles.historyProgressFill, { width: '80%' }]} /></View><Text style={styles.historyStatus}>4 of 5 preferences collected · AI analysis ready soon</Text><Pressable onPress={() => { setTripName('Singapore Food Trail'); setRoomCreated(true); setPhase('questions'); }} style={styles.resumeButton}><Text style={styles.resumeButtonText}>Continue planning →</Text></Pressable></View>
            <View style={styles.historyCard}><View style={styles.historyTop}><View><Text style={styles.historyTitle}>Bangkok Adventure</Text><Text style={styles.historyMeta}>Bangkok · 10 - 15 April 2025</Text></View><Text style={styles.statusComplete}>COMPLETE</Text></View><Text style={styles.historyStatus}>95% group satisfaction · 6 travellers</Text><Pressable onPress={() => { setTripName('Bangkok Adventure'); setViewingCompleted(true); setPhase('itinerary'); }} style={styles.resumeButton}><Text style={styles.resumeButtonText}>View plan →</Text></Pressable></View>
            <View style={styles.historyCard}><View style={styles.historyTop}><View><Text style={styles.historyTitle}>Paris Honeymoon</Text><Text style={styles.historyMeta}>Paris · 18 - 25 June 2025</Text></View><Text style={styles.statusComplete}>COMPLETE</Text></View><Text style={styles.historyStatus}>98% group satisfaction · 2 travellers</Text><Pressable onPress={() => { setTripName('Paris Honeymoon'); setViewingCompleted(true); setPhase('itinerary'); }} style={styles.resumeButton}><Text style={styles.resumeButtonText}>View plan →</Text></Pressable></View>
          </View>
          </ScrollView>
        ) : phase === 'join' ? (
          <View style={styles.joinPanel}><Text style={styles.eyebrowDark}>JOIN A TRIP ROOM</Text><Text style={styles.panelTitle}>Your friend saved you a seat.</Text><Text style={styles.panelHint}>Enter the referral code from your invite link to join the room and answer your own Travel DNA quiz.</Text><Text style={styles.fieldLabel}>REFERRAL CODE</Text><TextInput autoCapitalize="characters" value={referralCode} onChangeText={setReferralCode} placeholder="e.g. SEOU-2026" placeholderTextColor="#94a3b8" style={styles.textInput} /><View style={styles.referralHint}><Ionicons name="link-outline" size={16} color="#2563eb" /><Text style={styles.referralHintText}>You can find this code after /join/ in the shared link.</Text></View><Pressable disabled={!referralCode.trim()} onPress={joinExistingRoom} style={[styles.nextStepButton, !referralCode.trim() && styles.nextStepDisabled]}><Text style={styles.nextStepText}>Join room and start quiz →</Text></Pressable><Pressable onPress={() => setPhase('hub')} style={styles.backToRooms}><Text style={styles.backToRoomsText}>Back to trip rooms</Text></Pressable></View>
        ) : phase === 'setup' ? (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.setupScroll} contentContainerStyle={{ paddingBottom: 16 }}>
          <View style={styles.setupPanel}>
            <Text style={styles.eyebrowDark}>{roomCreated ? 'TRIP ROOM' : 'CREATE A NEW TRIP'}</Text>
            <Text style={styles.panelTitle}>{roomCreated ? tripName : 'Set up the trip'}</Text>
            <Text style={styles.panelHint}>{roomCreated ? 'Your room is open. People can join and answer their quiz as soon as they arrive.' : 'You are the group leader. Create a room, invite everyone, and let each person answer privately.'}</Text>
            {!roomCreated ? <>
            <Text style={styles.fieldLabel}>TRIP NAME</Text>
            <TextInput value={tripName} onChangeText={setTripName} placeholder="e.g. Seoul Trip" placeholderTextColor="#94a3b8" style={styles.textInput} />
            <Text style={styles.fieldLabel}>DESTINATION</Text>
            <TextInput value={destination} onChangeText={setDestination} placeholder="e.g. Seoul, South Korea" placeholderTextColor="#94a3b8" style={styles.textInput} />
            <Text style={styles.fieldLabel}>DATES</Text>
            <Pressable onPress={() => setShowCalendar(true)} style={styles.datePickerField}><Text style={tripDates ? styles.dateValue : styles.datePlaceholder}>{tripDates || 'Select start and end date'}</Text><Ionicons name="calendar-outline" size={20} color="#2563eb" /></Pressable>
            <Pressable onPress={createRoom} disabled={!tripName.trim() || !destination.trim() || !tripDates.trim()} style={[styles.nextStepButton, (!tripName.trim() || !destination.trim() || !tripDates.trim()) && styles.nextStepDisabled]}><Text style={styles.nextStepText}>Create invite room →</Text></Pressable>
            </> : <>
            <View style={styles.roomCodeCard}><View><Text style={styles.fieldLabel}>ROOM CODE</Text><Text style={styles.roomCode}>{joinCode}</Text></View><Pressable onPress={shareRoom} style={styles.shareButton}><Ionicons name="share-outline" size={16} color="#fff" /><Text style={styles.shareButtonText}>Share room</Text></Pressable></View>
            <View style={styles.shareLinkBox}><Ionicons name="link-outline" size={15} color="#2563eb" /><Text style={styles.linkText}>tripshield.app/join/{joinCode}</Text></View>
            <View style={styles.membersBox}><View><Text style={styles.fieldLabel}>TRIP MEMBERS</Text><Text style={styles.fieldValue}>{travellers.length} joined</Text></View><Text style={styles.joinedText}>{travellers.length < 2 ? 'Waiting for people' : 'People can start their quiz'}</Text></View>
            {inviteNotification && <View style={styles.inviteNotificationBox}><Ionicons name="notifications" size={16} color="#2563eb" /><Text style={styles.inviteNotificationText}>{inviteNotification}</Text><Pressable onPress={() => setInviteNotification(null)}><Ionicons name="close" size={16} color="#94a3b8" /></Pressable></View>}
            <View style={styles.addTravellerSection}>
              <View style={styles.addTravellerHeader}><Text style={styles.fieldLabel}>INVITE PEOPLE</Text><Text style={styles.inviteCount}>{travellers.length}/8</Text></View>
              <View style={styles.addTravellerRow}>
                <TextInput value={travellerName} onChangeText={value => { setTravellerName(value); setSelectedUser(null); }} placeholder="Search by name or @username" placeholderTextColor="#94a3b8" style={styles.addTravellerInput} />
                <Pressable disabled={!selectedUser} onPress={addTraveller} style={[styles.addTravellerButton, !selectedUser && styles.nextStepDisabled]}><Text style={styles.addTravellerButtonText}>Invite</Text></Pressable>
              </View>
              {selectedUser && <View style={styles.invitePreviewBox}><Ionicons name="mail-outline" size={14} color="#2563eb" /><Text style={styles.invitePreviewText}>{selectedUser.displayName} will receive an invitation notification</Text></View>}
              {matchingUsers.length > 0 && <View style={styles.userResults}>{matchingUsers.map(user => <Pressable key={user.id} onPress={() => { setSelectedUser(user); setTravellerName(user.username); }} style={[styles.userResult, selectedUser?.id === user.id && styles.userResultSelected]}><View style={[styles.resultAvatar, { backgroundColor: user.accent }]}><Text style={styles.travellerAvatarText}>{user.initials}</Text></View><View style={styles.travellerIdentity}><Text style={styles.resultName}>{user.displayName}</Text><Text style={styles.resultMeta}>{user.username} · {user.city}</Text></View><Ionicons name={selectedUser?.id === user.id ? 'checkmark-circle' : 'person-add-outline'} size={18} color="#2563eb" /></Pressable>)}</View>}
            </View>
            {(() => {
              const joined = travellers.filter(t => t.status === 'joined');
              const pending = travellers.filter(t => t.status === 'pending');
              const declined = travellers.filter(t => t.status === 'declined');
              return <>
              {joined.length > 0 && <>
                <View style={styles.memberSectionHeader}><View style={styles.memberSectionDotJoined} /><Text style={styles.memberSectionTitle}>IN THE ROOM</Text><Text style={styles.memberSectionCount}>{joined.length}</Text></View>
                <View style={styles.travellerList}>{joined.map((traveller, index) => (
                  <View key={`${traveller.id}-${index}`} style={styles.travellerRow}>
                    <View style={[styles.travellerAvatar, { backgroundColor: traveller.accent }]}><Text style={styles.travellerAvatarText}>{traveller.initials}</Text></View>
                    <View style={styles.travellerIdentity}>
                      <Text style={styles.travellerText}>{traveller.displayName}</Text>
                      <View style={styles.travellerStatusRow}><View style={styles.statusDotJoined} /><Text style={styles.statusTextJoined}>In the room</Text></View>
                    </View>
                    {index !== 0 && <Pressable onPress={() => removeTraveller(traveller.id)} style={styles.kickButton}><Ionicons name="close-circle" size={20} color="#ef4444" /></Pressable>}
                  </View>
                ))}</View>
              </>}
              {pending.length > 0 && <>
                <View style={styles.memberSectionHeader}><View style={styles.memberSectionDotPending} /><Text style={styles.memberSectionTitle}>INVITED — PENDING</Text><Text style={styles.memberSectionCount}>{pending.length}</Text></View>
                <View style={styles.travellerList}>{pending.map((traveller, index) => (
                  <View key={`${traveller.id}-${index}`} style={styles.travellerRow}>
                    <View style={[styles.travellerAvatar, { backgroundColor: traveller.accent }]}><Text style={styles.travellerAvatarText}>{traveller.initials}</Text></View>
                    <View style={styles.travellerIdentity}>
                      <Text style={styles.travellerText}>{traveller.displayName}</Text>
                      <View style={styles.travellerStatusRow}><View style={styles.statusDotPending} /><Text style={styles.statusTextPending}>Waiting to join</Text></View>
                    </View>
                    <Pressable onPress={() => removeTraveller(traveller.id)} style={styles.kickButton}><Ionicons name="close-circle" size={20} color="#ef4444" /></Pressable>
                  </View>
                ))}</View>
              </>}
              {declined.length > 0 && <>
                <View style={styles.memberSectionHeader}><View style={styles.memberSectionDotDeclined} /><Text style={styles.memberSectionTitle}>DECLINED</Text><Text style={styles.memberSectionCount}>{declined.length}</Text></View>
                <View style={styles.travellerList}>{declined.map((traveller, index) => (
                  <View key={`${traveller.id}-${index}`} style={styles.travellerRow}>
                    <View style={[styles.travellerAvatar, { backgroundColor: traveller.accent }]}><Text style={styles.travellerAvatarText}>{traveller.initials}</Text></View>
                    <View style={styles.travellerIdentity}>
                      <Text style={styles.travellerText}>{traveller.displayName}</Text>
                      <View style={styles.travellerStatusRow}><View style={styles.statusDotDeclined} /><Text style={styles.statusTextDeclined}>Declined invite</Text></View>
                    </View>
                    <Pressable onPress={() => removeTraveller(traveller.id)} style={styles.kickButton}><Ionicons name="close-circle" size={20} color="#ef4444" /></Pressable>
                  </View>
                ))}</View>
              </>}
              {travellers.length === 0 && <View style={styles.travellerList}><Text style={styles.emptyTravellerText}>No members yet. Invite people above.</Text></View>}
              </>;
            })()}
            <Text style={styles.readyHint}>Everyone can join from the link and answer their own quiz. You can start yours now.</Text>
            <Pressable disabled={travellers.length < 2} onPress={() => advance('questions')} style={[styles.nextStepButton, travellers.length < 2 && styles.nextStepDisabled]}><Text style={styles.nextStepText}>Start my Travel DNA →</Text></Pressable>
            </>}
          </View>
          </ScrollView>
        ) : phase === 'questions' ? (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>
          <View style={styles.questionPanel}>
            <View style={styles.questionCard}>
              <View style={styles.questionCardInner}>
                <View style={styles.questionProgressRow}>
                  {[0,1,2,3,4,5].map(i => (
                    <Pressable key={i} onPress={() => { if (i < questionIndex || questionAnswers[i]) { setCurrentSelection(questionAnswers[i] || null); setQuestionIndex(i); } }} style={[styles.progressDotOuter, i <= questionIndex && { backgroundColor: getQuestionColor(questionIndex) }]}>
                      <Text style={[styles.progressDotInner, i <= questionIndex && styles.progressDotInnerActive]}>{i + 1}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.questionBigEmoji}>{questions[questionIndex].emoji}</Text>
                <Text style={styles.questionLabel}>QUESTION {questionIndex + 1} OF 6</Text>
                <Text style={styles.questionTitle}>{questions[questionIndex].label}</Text>
                <Text style={styles.questionHint}>{questionIndex === 0 ? 'There are no wrong answers.' : questionIndex === 4 ? 'This becomes a constraint, not a vote.' : 'Your answer stays part of your private Travel DNA.'}</Text>
              </View>
            </View>
            <View style={styles.answerGrid}>
              {questions[questionIndex].options.map((option, idx) => {
                const isSelected = currentSelection === option.text;
                return (
                  <Pressable key={option.text} onPress={() => selectAnswer(option.text)} style={[styles.answerChoiceNew, { backgroundColor: isSelected ? '#eff6ff' : '#fff', borderColor: isSelected ? '#2563eb' : '#e2e8f0', borderWidth: isSelected ? 2 : 1 }]}>
                    <View style={[styles.answerEmojiCircle, { backgroundColor: isSelected ? '#2563eb' : '#f1f5f9' }]}>
                      <Text style={styles.answerEmoji}>{option.emoji}</Text>
                    </View>
                    <Text style={[styles.answerChoiceText, isSelected && { color: '#1e40af', fontWeight: '700' }]}>{option.text}</Text>
                    {isSelected ? <Ionicons name="checkmark-circle" size={22} color="#2563eb" /> : <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.questionNavRow}>
              <Pressable onPress={goBackQuestion} disabled={questionIndex === 0} style={[styles.questionNavButton, questionIndex === 0 && styles.questionNavDisabled]}>
                <Ionicons name="arrow-back" size={16} color={questionIndex === 0 ? '#cbd5e1' : '#0f172a'} />
                <Text style={[styles.questionNavText, questionIndex === 0 && styles.questionNavTextDisabled]}>Back</Text>
              </Pressable>
              <Text style={styles.questionNavHint}>{questionAnswers.filter(a => a).length + (currentSelection ? 1 : 0)} of 6 answered</Text>
              {questionIndex < 5 && (
                <Pressable onPress={goToNextQuestion} disabled={!currentSelection} style={[styles.questionNavButton, !currentSelection && styles.questionNavDisabled]}>
                  <Text style={[styles.questionNavText, !currentSelection && styles.questionNavTextDisabled]}>Next</Text>
                  <Ionicons name="arrow-forward" size={16} color={!currentSelection ? '#cbd5e1' : '#0f172a'} />
                </Pressable>
              )}
              {questionIndex === 5 && <View style={{ width: 80 }} />}
            </View>
            {(questionAnswers.filter(a => a).length === 6 || (questionIndex === 5 && currentSelection)) && (
              <Pressable onPress={() => {
                const finalAnswers = [...questionAnswers];
                finalAnswers[5] = currentSelection || finalAnswers[5];
                setQuestionAnswers(finalAnswers);
                setPhase('group');
              }} style={[styles.nextStepButton, { backgroundColor: '#2563eb', marginTop: 16 }]}>
                <Text style={styles.nextStepText}>✓ Submit my Travel DNA →</Text>
              </Pressable>
            )}
          </View>
          </ScrollView>
        ) : phase === 'group' ? (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={styles.groupPanel}>
            <Text style={styles.eyebrowDark}>GROUP TRAVEL DNA ANALYSIS</Text>
            <Text style={styles.panelTitle}>Now TripShield understands the group.</Text>

            {aiThinking && (
              <View style={styles.aiThinkingCard}>
                <View style={styles.aiThinkingHeader}>
                  <View style={styles.aiThinkingIcon}>
                    <Ionicons name="sparkles" size={24} color="#2563eb" />
                  </View>
                  <View style={styles.aiThinkingInfo}>
                    <Text style={styles.aiThinkingTitle}>AI is analyzing your group</Text>
                    <Text style={styles.aiThinkingSubtitle}>
                      {aiThinkingProgress < 30 ? 'Reading travel preferences...' : aiThinkingProgress < 60 ? 'Finding common interests...' : aiThinkingProgress < 90 ? 'Building recommendations...' : 'Almost ready!'}
                    </Text>
                  </View>
                </View>
                <View style={styles.aiThinkingBarBg}>
                  <View style={[styles.aiThinkingBarFill, { width: `${aiThinkingProgress}%` }]} />
                </View>
                <Text style={styles.aiThinkingPercent}>{aiThinkingProgress}%</Text>
              </View>
            )}

            {!aiThinking && <>
            {/* Compatibility Score */}
            <View style={styles.compatibilityCard}>
              <View style={styles.compatibilityScoreRing}>
                <Text style={styles.compatibilityScoreValue}>87</Text>
                <Text style={styles.compatibilityScoreLabel}>COMPATIBILITY</Text>
              </View>
              <View style={styles.compatibilityInfo}>
                <Text style={styles.compatibilityTitle}>Strong Group Harmony</Text>
                <Text style={styles.compatibilityBody}>Your group shares strong food & shopping interests. Minor differences in nature & nightlife preferences are easily balanced.</Text>
              </View>
            </View>

            {/* Member Profiles */}
            <Text style={styles.groupSectionTitle}>MEMBER PROFILES</Text>
            <View style={styles.memberProfiles}>
              {travellers.filter(t => t.status === 'joined').map((member, i) => {
                const profileTypes = ['The Foodie Explorer', 'The Culture Seeker', 'The Night Owl', 'The Careful Planner', 'The Adventure Seeker', 'The Luxury Traveller', 'The Budget Backpacker', 'The Local Explorer'];
                const profileEmojis = ['\U0001F35C', '\U0001F3EF', '', '\U0001F4CB', '\U0001F97E', '\U0001F48E', '\U0001F392', ''];
                const profileTraits = ['High energy \u00b7 Moderate budget', 'Relaxed pace \u00b7 Premium budget', 'High energy \u00b7 Flexible budget', 'Balanced \u00b7 Budget-conscious', 'Active \u00b7 Moderate budget', 'Leisurely \u00b7 Premium budget', 'Active \u00b7 Low budget', 'Balanced \u00b7 Moderate budget'];
                const typeIdx = i % profileTypes.length;
                return (
                  <View key={member.id} style={styles.memberProfileCard}>
                    <View style={[styles.memberProfileAvatar, { backgroundColor: member.accent }]}><Text style={styles.memberProfileAvatarText}>{member.initials}</Text></View>
                    <View style={styles.memberProfileInfo}>
                      <Text style={styles.memberProfileName}>{member.displayName} <Text style={styles.memberProfileEmoji}>{profileEmojis[typeIdx]}</Text></Text>
                      <Text style={styles.memberProfileType}>{profileTypes[typeIdx]}</Text>
                      <Text style={styles.memberProfileMeta}>{profileTraits[typeIdx]}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Interest Analysis */}
            <Text style={styles.groupSectionTitle}>INTEREST ANALYSIS</Text>
            <View style={styles.interestGrid}>
              {[['Food', '91%', '#fb7185', '🍜', 'Top Priority'], ['Shopping', '78%', '#f59e0b', '🛍️', 'High Interest'], ['Culture', '67%', '#60a5fa', '🏯', 'Moderate'], ['Nightlife', '61%', '#a78bfa', '🎵', 'Moderate'], ['Nature', '42%', '#34d399', '🌿', 'Low Interest']].map(item => (
                <View key={item[0]} style={styles.interestCard}>
                  <View style={styles.interestHeader}>
                    <Text style={styles.interestEmoji}>{item[3]}</Text>
                    <View style={styles.interestTextWrap}>
                      <Text style={styles.interestName}>{item[0]}</Text>
                      <Text style={styles.interestTag}>{item[4]}</Text>
                    </View>
                    <Text style={[styles.interestPercent, { color: item[2] }]}>{item[1]}</Text>
                  </View>
                  <View style={styles.interestBarBg}><View style={[styles.interestBarFill, { width: item[1] as `${number}%`, backgroundColor: item[2] }]} /></View>
                </View>
              ))}
            </View>

            {/* Travel Style Breakdown */}
            <Text style={styles.groupSectionTitle}>TRAVEL STYLE BREAKDOWN</Text>
            <View style={styles.styleGrid}>
              {[['Pace', 'Balanced', '⚡', 'Mix of relaxed & active days', '#60a5fa'], ['Budget', 'Moderate-High', '', 'RM150-250/day per person', '#fbbf24'], ['Risk', 'Low-Medium', '🛡️', 'Mostly safe with some adventure', '#34d399'], ['Social', 'High', '', 'Group activities preferred', '#fb7185']].map(item => (
                <View key={item[0]} style={styles.styleCard}>
                  <Text style={styles.styleCardIcon}>{item[2]}</Text>
                  <Text style={styles.styleCardLabel}>{item[0]}</Text>
                  <Text style={styles.styleCardValue}>{item[1]}</Text>
                  <Text style={styles.styleCardDesc}>{item[3]}</Text>
                  <View style={[styles.styleCardAccent, { backgroundColor: item[4] }]} />
                </View>
              ))}
            </View>

            {/* AI Insights */}
            <Text style={styles.groupSectionTitle}>AI INSIGHTS</Text>
            <View style={styles.insightCard}>
              <View style={styles.insightRow}>
                <Ionicons name="bulb" size={16} color="#2563eb" />
                <Text style={styles.insightText}>Schedule food experiences in the morning when energy is highest</Text>
              </View>
              <View style={styles.insightDivider} />
              <View style={styles.insightRow}>
                <Ionicons name="walk" size={16} color="#2563eb" />
                <Text style={styles.insightText}>Limit walking to under 8,000 steps/day — 2 members prefer low activity</Text>
              </View>
              <View style={styles.insightDivider} />
              <View style={styles.insightRow}>
                <Ionicons name="cash" size={16} color="#2563eb" />
                <Text style={styles.insightText}>Keep 60% activities under ₩30,000 to respect budget constraints</Text>
              </View>
              <View style={styles.insightDivider} />
              <View style={styles.insightRow}>
                <Ionicons name="moon" size={16} color="#2563eb" />
                <Text style={styles.insightText}>Start days after 9 AM — no early morning plans needed</Text>
              </View>
            </View>

            {/* Constraints */}
            <Text style={styles.groupSectionTitle}>CONSTRAINTS & PREFERENCES</Text>
            <View style={styles.constraintBox}>
              <View style={styles.constraintRow}>
                <View style={styles.constraintIcon}><Ionicons name="footsteps" size={14} color="#92400e" /></View>
                <Text style={styles.constraintText}>2 people dislike long walking — keep distances short</Text>
              </View>
              <View style={styles.constraintRow}>
                <View style={styles.constraintIcon}><Ionicons name="wallet" size={14} color="#92400e" /></View>
                <Text style={styles.constraintText}>1 person avoids expensive activities — budget-friendly options needed</Text>
              </View>
              <View style={styles.constraintRow}>
                <View style={styles.constraintIcon}><Ionicons name="alarm" size={14} color="#92400e" /></View>
                <Text style={styles.constraintText}>1 person does not want early mornings — start after 9 AM</Text>
              </View>
              <View style={styles.constraintRow}>
                <View style={styles.constraintIcon}><Ionicons name="umbrella" size={14} color="#92400e" /></View>
                <Text style={styles.constraintText}>1 person avoids outdoor plans in rain — have indoor backups</Text>
              </View>
            </View>

            <View style={{ gap: 10 }}>
              <Pressable onPress={() => advance('itinerary')} style={styles.nextStepButton}><Text style={styles.nextStepText}>Build trip plan →</Text></Pressable>
              <Pressable onPress={() => {
                setTripComplete(true);
                Alert.alert('Analysis saved!', 'This group analysis has been saved to your trip room. You can always come back to review it.', [
                  { text: 'Continue to plan', onPress: () => advance('itinerary') },
                  { text: 'Back to rooms', onPress: () => { setPhase('hub'); setViewingCompleted(true); } },
                ]);
              }} style={[styles.nextStepButton, { backgroundColor: '#2563eb' }]}><Text style={styles.nextStepText}>💾 Keep this analysis</Text></Pressable>
            </View>
            </>}
          </View>
          </ScrollView>
        ) : phase === 'itinerary' ? (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={styles.itineraryPanel}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={styles.eyebrowDark}>AI-CURATED TRIP PLAN</Text>
              {viewingCompleted && <View style={{ backgroundColor: '#059669', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>✓ COMPLETED</Text></View>}
            </View>
            <View style={styles.itineraryHeader}>
              <View>
                <Text style={styles.itineraryDestination}>{tripInfo.destination}</Text>
                <Text style={styles.itineraryDates}>{tripInfo.dates}</Text>
              </View>
              <View style={styles.itineraryBadge}>
                <Text style={styles.itineraryBadgeValue}>{tripInfo.satisfaction}%</Text>
                <Text style={styles.itineraryBadgeLabel}>group fit</Text>
              </View>
            </View>

            {/* Hotel Card */}
            <View style={styles.hotelCard}>
              <View style={styles.hotelHeader}>
                <View style={styles.hotelIcon}><Ionicons name="bed-outline" size={18} color="#2563eb" /></View>
                <View style={styles.hotelInfo}>
                  <Text style={styles.hotelName}>{tripInfo.hotel}</Text>
                  <Text style={styles.hotelAddress}>{tripInfo.hotelAddress}</Text>
                </View>
                <View style={styles.hotelRating}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.hotelRatingText}>{tripInfo.hotelRating}</Text>
                </View>
              </View>
              <View style={styles.hotelPriceRow}>
                <Text style={styles.hotelPrice}>{tripInfo.hotelPrice}</Text>
                <Text style={styles.hotelPriceNote}>per night · 2 rooms</Text>
              </View>
            </View>

            {/* Day Selector */}
            <View style={styles.daySelector}>
              {[1, 2, 3].map(day => (
                <Pressable key={day} onPress={() => setSelectedDay(day)} style={[styles.dayButton, selectedDay === day && styles.dayButtonActive]}>
                  <Text style={[styles.dayButtonText, selectedDay === day && styles.dayButtonTextActive]}>Day {day}</Text>
                  <Text style={[styles.dayButtonSub, selectedDay === day && styles.dayButtonTextActive]}>{day === 1 ? 'Arrival' : day === 2 ? 'Tech Tour' : 'Culture'}</Text>
                </Pressable>
              ))}
            </View>

            {/* Stops */}
            {itineraryData[selectedDay].map((stop, index) => (
              <View key={index}>
                {index > 0 && <View style={styles.transportConnector}><Ionicons name="navigate" size={12} color="#2563eb" /><Text style={styles.transportText}>{stop.transport} · {stop.transportTime}</Text></View>}
                <Pressable onPress={() => setSelectedStop(stop)}>
                  <View style={styles.stopCard}>
                    <View style={styles.stopHeader}>
                      <View style={styles.stopPhotoWrap}>
                        {failedImages.has(stop.photoUrl) ? (
                          <View style={[styles.stopPhotoThumb, { backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }]}><Text style={{ fontSize: 24 }}>{stop.emoji}</Text></View>
                        ) : (
                          <Image source={{ uri: stop.photoUrl }} style={styles.stopPhotoThumb} onError={() => setFailedImages(prev => new Set(prev).add(stop.photoUrl))} />
                        )}
                      </View>
                      <View style={styles.stopInfo}>
                        <Text style={styles.stopTime}>{stop.time}</Text>
                        <Text style={styles.stopTitle}>{stop.place}</Text>
                        <Text style={styles.stopAddress}>{stop.address}</Text>
                      </View>
                      <View style={[styles.stopTypeBadge, stop.type === 'Flight' ? styles.badgeFlight : stop.type === 'Hotel' ? styles.badgeHotel : stop.type === 'Food' ? styles.badgeFood : stop.type === 'Tech' ? styles.badgeTech : stop.type === 'Culture' ? styles.badgeCulture : stop.type === 'Nature' ? styles.badgeNature : stop.type === 'Shopping' ? styles.badgeShopping : styles.badgeDefault]}><Text style={styles.stopTypeText}>{stop.type}</Text></View>
                    </View>
                    <Text style={styles.stopDescription}>{stop.description}</Text>
                    {stop.highlights && (
                      <View style={styles.stopHighlights}>
                        {stop.highlights.map((h, hi) => <Text key={hi} style={styles.stopHighlightTag}>{h}</Text>)}
                      </View>
                    )}
                    <View style={styles.stopDetails}>
                      <View style={styles.stopDetailItem}><Ionicons name="time-outline" size={14} color="#64748b" /><Text style={styles.stopDetailText}>{stop.duration}</Text></View>
                      <View style={styles.stopDetailItem}><Ionicons name="cash-outline" size={14} color="#64748b" /><Text style={styles.stopDetailText}>{stop.price}</Text></View>
                      <View style={styles.stopDetailItem}><Ionicons name="star" size={14} color="#f59e0b" /><Text style={styles.stopDetailText}>{stop.rating}</Text></View>
                    </View>
                    {stop.tips && <View style={styles.stopTips}><Ionicons name="bulb" size={12} color="#2563eb" /><Text style={styles.stopTipsText}>{stop.tips}</Text></View>}
                    <View style={styles.stopViewDetails}><Ionicons name="chevron-forward" size={14} color="#2563eb" /><Text style={styles.stopViewDetailsText}>Tap for details</Text></View>
                  </View>
                </Pressable>
              </View>
            ))}

            {/* Day Summary */}
            <View style={styles.daySummary}>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Day estimated cost</Text><Text style={styles.summaryValue}>{tripInfo.currency}{itineraryData[selectedDay].reduce((sum, stop) => sum + (parseInt(stop.price.replace(/[^0-9]/g, '')) || 0), 0).toLocaleString()}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Total duration</Text><Text style={styles.summaryValue}>{itineraryData[selectedDay].reduce((sum, stop) => sum + (parseFloat(stop.duration) || 0), 0).toFixed(1)} hours</Text></View>
            </View>

            {/* Trip Budget Overview */}
            <View style={styles.budgetCard}>
              <Text style={styles.budgetTitle}>TRIP BUDGET OVERVIEW</Text>
              <View style={styles.budgetRow}><Text style={styles.budgetLabel}>Total estimated budget</Text><Text style={styles.budgetValue}>{tripInfo.totalBudget}</Text></View>
              <View style={styles.budgetRow}><Text style={styles.budgetLabel}>Per person (4 travellers)</Text><Text style={styles.budgetValue}>{tripInfo.budgetPerPerson}</Text></View>
              <View style={styles.budgetRow}><Text style={styles.budgetLabel}>Accommodation</Text><Text style={styles.budgetValue}>{tripInfo.hotelPrice} x 2 nights</Text></View>
            </View>

            <View style={styles.planReason}><Text style={styles.planReasonTitle}>Why this plan works</Text><Text style={styles.planReasonText}>Tech visits match the group\'s interests, food experiences are prioritized, and walking stays comfortable. Indoor options available for rainy days.</Text></View>
            {!tripComplete ? (
              <Pressable onPress={() => setTripComplete(true)} style={[styles.nextStepButton, { backgroundColor: '#059669' }]}><Text style={styles.nextStepText}>✓ Mark trip as complete</Text></Pressable>
            ) : (
              <Pressable onPress={() => { setPhase('hub'); setViewingCompleted(true); }} style={styles.nextStepButton}><Text style={styles.nextStepText}>Back to rooms →</Text></Pressable>
            )}
          </View>
          </ScrollView>
        ) : phase === 'result' ? (
          <View style={styles.lockedCard}>
            <View style={styles.lockIcon}><Text style={styles.lockIconText}>✓</Text></View>
            <Text style={styles.lockedKicker}>TRIPSHIELD DECISION</Text>
            <Text style={styles.lockedTitle}>Louvre + food tour</Text>
            <Text style={styles.lockedBody}>Not the most popular choice. The fairest choice.</Text>
            <View style={styles.scoreRow}><Text style={styles.scoreLabel}>GROUP SATISFACTION</Text><Text style={styles.scoreValue}>91%</Text></View>
            <Pressable onPress={() => setShowWhy(value => !value)} style={styles.whyButton}><Text style={styles.whyButtonText}>⌕ {showWhy ? 'Hide decision logic' : 'Why did AI choose this?'}</Text></Pressable>
            {showWhy && <View style={styles.whyPanel}><Text style={styles.whyLine}>✓ Fits 3/4 budget limits</Text><Text style={styles.whyLine}>✓ Protects everyone&apos;s non-negotiable</Text><Text style={styles.whyLine}>✓ Combines Sarah&apos;s food priority with Jason&apos;s sightseeing</Text><Text style={styles.whyLine}>✓ Leaves 2 hours for shopping</Text></View>}
          </View>
        ) : phase === 'dna' ? (
          <View style={styles.dnaPanel}>
            <View style={styles.dnaHeader}><View><Text style={styles.eyebrowDark}>PRIVATE TRAVEL DNA</Text><Text style={styles.dnaTitle}>Meet your group&apos;s instincts.</Text></View><Text style={styles.dnaTimer}>0:42</Text></View>
            {[['Sarah', 'The Foodie', '95%', '#fb7185'], ['Jason', 'The Explorer', '95%', '#60a5fa'], ['Mei', 'The Planner', '80%', '#34d399']].map(person => <View key={person[0]} style={styles.dnaPerson}><View style={[styles.dnaAvatar, { backgroundColor: person[3] }]}><Text style={styles.dnaAvatarText}>{person[0][0]}</Text></View><View style={styles.dnaPersonCopy}><Text style={styles.dnaPersonName}>{person[0]} <Text style={styles.dnaPersonType}>{person[1]}</Text></Text><View style={styles.dnaBar}><View style={[styles.dnaBarFill, { width: person[2] as `${number}%`, backgroundColor: person[3] }]} /></View></View><Text style={styles.dnaPercent}>{person[2]}</Text></View>)}
            <Text style={styles.dnaHint}>Your group is high-energy, food-motivated, and budget-aware.</Text>
            <Pressable onPress={() => advance('radar')} style={styles.nextStepButton}><Text style={styles.nextStepText}>Reveal conflict radar →</Text></Pressable>
          </View>
        ) : phase === 'radar' ? (
          <View style={styles.radarPanel}><View style={styles.radarTop}><Text style={styles.radarIcon}>⚠</Text><View><Text style={styles.eyebrowDark}>CONFLICT RADAR</Text><Text style={styles.radarTitle}>Budget × Experience</Text></View><Text style={styles.conflictScore}>82%</Text></View><Text style={styles.radarBody}>Jason wants Disneyland. Mei needs the day under RM350. The engine caught the clash before it becomes a chat argument.</Text><View style={styles.clashRow}><View><Text style={styles.clashName}>Jason</Text><Text style={styles.clashPreference}>Maximum experience</Text></View><Text style={styles.clashVs}>VS</Text><View style={styles.clashRight}><Text style={styles.clashName}>Mei</Text><Text style={styles.clashPreference}>Protect the budget</Text></View></View><Text style={styles.radarQuestion}>What should the group protect?</Text><View style={styles.radarChoices}><Pressable onPress={() => advance('tokens')} style={styles.radarChoice}><Text style={styles.radarChoiceEmoji}>⚖</Text><Text style={styles.radarChoiceTitle}>Balanced</Text><Text style={styles.radarChoiceBody}>Good day, no budget shock</Text></Pressable><Pressable onPress={() => advance('tokens')} style={styles.radarChoice}><Text style={styles.radarChoiceEmoji}>✨</Text><Text style={styles.radarChoiceTitle}>Experiences</Text><Text style={styles.radarChoiceBody}>Spend more, remember more</Text></Pressable></View></View>
        ) : (
          <View style={styles.tokenPanel}><View style={styles.tokenHeader}><View><Text style={styles.eyebrowDark}>SACRIFICE TOKENS</Text><Text style={styles.dnaTitle}>What can you give up?</Text></View><Text style={styles.tokenCount}>{selectedTokens.length}/3</Text></View><Text style={styles.tokenBody}>Private choices. No one has to defend them in the group chat.</Text><View style={styles.tokenGrid}>{['Skip shopping', 'Eat cheaper', 'Walk further', 'Wake earlier', 'Skip one stop', 'Spend less'].map(token => <Pressable key={token} onPress={() => toggleToken(token)} style={[styles.tokenChoice, selectedTokens.includes(token) && styles.tokenChoiceActive]}><Text style={styles.tokenChoiceIcon}>{selectedTokens.includes(token) ? '✓' : '＋'}</Text><Text style={[styles.tokenChoiceText, selectedTokens.includes(token) && styles.tokenChoiceTextActive]}>{token}</Text></Pressable>)}</View><Pressable onPress={() => advance('result')} style={[styles.nextStepButton, selectedTokens.length === 0 && styles.nextStepDisabled]}><Text style={styles.nextStepText}>Build fair compromise →</Text></Pressable></View>
        )}

      </View>

      <Modal visible={showCalendar} transparent animationType="slide" onRequestClose={() => setShowCalendar(false)}>
        <Pressable style={styles.calendarBackdrop} onPress={() => setShowCalendar(false)}>
          <Pressable style={styles.calendarSheet} onPress={() => undefined}>
            <View style={styles.calendarHandle} />
            <View style={styles.calendarHeader}><Text style={styles.calendarTitle}>Choose your dates</Text><Pressable onPress={() => setShowCalendar(false)} style={styles.calendarClose}><Ionicons name="close" size={18} color="#475569" /></Pressable></View>
            <View style={styles.monthSwitcher}><Pressable disabled={calendarMonth.year === today.getFullYear() && calendarMonth.month <= today.getMonth()} onPress={() => changeMonth(-1)} style={[styles.monthArrow, calendarMonth.year === today.getFullYear() && calendarMonth.month <= today.getMonth() && styles.monthArrowDisabled]}><Ionicons name="chevron-back" size={16} color="#0f172a" /></Pressable><Text style={styles.calendarMonthYear}>{monthNames[calendarMonth.month]} {calendarMonth.year}</Text><Pressable onPress={() => changeMonth(1)} style={styles.monthArrow}><Ionicons name="chevron-forward" size={16} color="#0f172a" /></Pressable></View>
            <Text style={styles.calendarHint}>{startDate && !endDate ? 'Tap your end date' : 'Tap your start date'}</Text>
            <View style={styles.weekRow}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <Text key={`wd-${index}`} style={styles.weekDay}>{day}</Text>)}</View>
            {(() => { const daysInMonth = new Date(calendarMonth.year, calendarMonth.month + 1, 0).getDate(); const firstWeekday = new Date(calendarMonth.year, calendarMonth.month, 1).getDay(); const days = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]; return <View style={styles.calendarGrid}>{days.map((day, index) => day ? renderCalendarDays(day, index) : <View key={`e-${index}`} style={styles.calendarDay} />)}</View>; })()}
            {(startDate || endDate) && <View style={styles.selectedDateDisplay}><View style={styles.selectedDatePill}><Ionicons name="calendar-outline" size={14} color="#2563eb" /><Text style={styles.selectedDateText}>{startDate ? formatDate(startDate) : '—'} {endDate ? `→ ${formatDate(endDate)}` : ''}</Text></View></View>}
            <View style={styles.calendarFooter}><Pressable onPress={() => { setStartDate(null); setEndDate(null); setTripDates(''); }} style={styles.clearDates}><Text style={styles.clearDatesText}>Clear</Text></Pressable><Pressable disabled={!startDate || !endDate} onPress={() => setShowCalendar(false)} style={[styles.doneDates, (!startDate || !endDate) && styles.doneDatesDisabled]}><Text style={styles.doneDatesText}>Confirm dates</Text></Pressable></View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Place Detail Modal */}
      <Modal visible={selectedStop !== null} transparent animationType="slide" onRequestClose={() => setSelectedStop(null)}>
        <Pressable style={styles.detailBackdrop} onPress={() => setSelectedStop(null)}>
          <Pressable style={styles.detailSheet} onPress={() => undefined}>
            <View style={styles.detailHandle} />
            <Pressable onPress={() => setSelectedStop(null)} style={styles.detailClose}><Ionicons name="close" size={20} color="#475569" /></Pressable>
            {selectedStop && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Place Image Placeholder */}
                {/* Real Place Photo */}
                {failedImages.has(selectedStop.photoUrl) ? (
                  <View style={[styles.detailPhoto, { backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }]}><Text style={{ fontSize: 64 }}>{selectedStop.emoji}</Text></View>
                ) : (
                  <Image source={{ uri: selectedStop.photoUrl }} style={styles.detailPhoto} onError={() => setFailedImages(prev => new Set(prev).add(selectedStop.photoUrl))} />
                )}
                <View style={[styles.detailImageStrip, selectedStop.type === 'Flight' ? { backgroundColor: '#1e3a8a' } : selectedStop.type === 'Hotel' ? { backgroundColor: '#7c3aed' } : selectedStop.type === 'Food' ? { backgroundColor: '#dc2626' } : selectedStop.type === 'Tech' ? { backgroundColor: '#0891b2' } : selectedStop.type === 'Culture' ? { backgroundColor: '#b45309' } : selectedStop.type === 'Nature' ? { backgroundColor: '#059669' } : selectedStop.type === 'Shopping' ? { backgroundColor: '#db2777' } : { backgroundColor: '#2563eb' }]}>
                  <Text style={styles.detailImageEmoji}>{selectedStop.emoji}</Text>
                  <Text style={styles.detailImageLabel}>{selectedStop.type} · {selectedStop.time}</Text>
                </View>

                {/* Title & Type */}
                <View style={styles.detailTitleSection}>
                  <View style={styles.detailTitleRow}>
                    <Text style={styles.detailPlaceName}>{selectedStop.place}</Text>
                    <View style={styles.detailRating}><Ionicons name="star" size={14} color="#f59e0b" /><Text style={styles.detailRatingText}>{selectedStop.rating}</Text></View>
                  </View>
                  <View style={styles.detailTypeRow}>
                    <Text style={styles.detailAddress}>{selectedStop.address}</Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>About this place</Text>
                  <Text style={styles.detailDescription}>{selectedStop.description}</Text>
                </View>

                {/* Highlights */}
                {selectedStop.highlights && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Highlights</Text>
                    <View style={styles.detailHighlightGrid}>
                      {selectedStop.highlights.map((h: string, i: number) => (
                        <View key={i} style={styles.detailHighlightCard}>
                          <Ionicons name="checkmark-circle" size={16} color="#059669" />
                          <Text style={styles.detailHighlightText}>{h}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Details Grid */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Details</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailGridItem}><Ionicons name="location-outline" size={18} color="#2563eb" /><Text style={styles.detailGridLabel}>Address</Text><Text style={styles.detailGridValue}>{selectedStop.address}</Text></View>
                    <View style={styles.detailGridItem}><Ionicons name="time-outline" size={18} color="#2563eb" /><Text style={styles.detailGridLabel}>Duration</Text><Text style={styles.detailGridValue}>{selectedStop.duration}</Text></View>
                    <View style={styles.detailGridItem}><Ionicons name="cash-outline" size={18} color="#2563eb" /><Text style={styles.detailGridLabel}>Cost</Text><Text style={styles.detailGridValue}>{selectedStop.price}</Text></View>
                    <View style={styles.detailGridItem}><Ionicons name="navigate-outline" size={18} color="#2563eb" /><Text style={styles.detailGridLabel}>Getting there</Text><Text style={styles.detailGridValue}>{selectedStop.transport} · {selectedStop.transportTime}</Text></View>
                  </View>
                </View>

                {/* How to get there */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>How to get there</Text>
                  <Text style={styles.detailRouteSummary}>{selectedStop.routeSummary}</Text>
                  <Text style={styles.detailRouteFrom}>From {selectedStop.routeFrom} · {selectedStop.routeFare}</Text>
                  {selectedStop.routeLegs.map((leg: any, idx: number) => (
                    <View key={idx} style={styles.detailLegCard}>
                      <View style={styles.detailLegBadge}><Text style={styles.detailLegBadgeText}>{modeLabel[leg.mode] || leg.mode}</Text></View>
                      {leg.line ? <Text style={styles.detailLegLine}>{leg.line}</Text> : null}
                      <Text style={styles.detailLegInstruction}>{leg.instruction}</Text>
                      <Text style={styles.detailLegDuration}>{leg.durationMin} min</Text>
                    </View>
                  ))}
                  <Pressable onPress={() => openMaps(mapsDir(selectedStop.routeFrom, selectedStop.address))} style={styles.detailMapsButton}>
                    <Ionicons name="navigate" size={16} color="#fff" />
                    <Text style={styles.detailMapsButtonText}>Open in Google Maps</Text>
                  </Pressable>
                </View>

                {/* Tips */}
                {selectedStop.tips && (
                  <View style={styles.detailTips}>
                    <Ionicons name="bulb-outline" size={16} color="#2563eb" />
                    <Text style={styles.detailTipsText}>{selectedStop.tips}</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const getQuestionColor = (index: number) => ['#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb923c'][index] || '#60a5fa';

const styles = StyleSheet.create({
  page: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#0f172a', fontSize: 20, fontWeight: '900', letterSpacing: -0.2 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  backButtonText: { color: '#1e3a8a', fontSize: 10, fontWeight: '900' },
  floatingBack: { position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4 },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0f172a', borderWidth: 2, borderColor: '#B7D4F2', alignItems: 'center', justifyContent: 'center' },
  avatarSecond: { backgroundColor: '#0f766e', marginLeft: -7 },
  avatarThird: { backgroundColor: '#b45309', marginLeft: -7 },
  avatarFourth: { backgroundColor: '#475569', marginLeft: -7 },
  avatarText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  memberCopy: { flex: 1, marginLeft: 9 },
  memberText: { color: '#475569', fontSize: 10, fontWeight: '700' },
  memberSubtext: { color: '#64748b', fontSize: 9, marginTop: 2 },
  addMemberButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginLeft: 7 },
  addMemberText: { color: '#fff', fontSize: 20, fontWeight: '400', lineHeight: 22 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 72, paddingBottom: 18 },
  phaseRail: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 12 },
  phaseItem: { alignItems: 'center', flex: 1 },
  phaseDotWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' },
  phaseLine: { position: 'absolute', left: -32, width: 64, height: 2, borderRadius: 1 },
  phaseLineCompleted: { backgroundColor: '#2563eb' },
  phaseLineInactive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  phaseDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  phaseDotActive: { backgroundColor: '#fff', borderWidth: 2.5, borderColor: '#2563eb', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  phaseDotCompleted: { backgroundColor: '#2563eb' },
  phaseDotInactive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  phaseDotText: { fontSize: 12, fontWeight: '900' },
  phaseDotTextActive: { color: '#2563eb' },
  phaseDotTextCompleted: { color: '#fff', fontSize: 14 },
  phaseDotTextInactive: { color: 'rgba(255,255,255,0.6)' },
  phaseLabel: { fontSize: 9, fontWeight: '800', marginTop: 6, letterSpacing: 0.5 },
  phaseLabelActive: { color: '#fff' },
  phaseLabelCompleted: { color: 'rgba(255,255,255,0.75)' },
  phaseLabelInactive: { color: 'rgba(255,255,255,0.45)' },
  eyebrowDark: { color: '#64748b', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  dnaPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  dnaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  dnaTitle: { color: '#0f172a', fontSize: 19, fontWeight: '900', marginTop: 4 },
  dnaTimer: { color: '#2563eb', fontSize: 13, fontWeight: '900' },
  dnaPerson: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  dnaAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dnaAvatarText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  dnaPersonCopy: { flex: 1, marginLeft: 10 },
  dnaPersonName: { color: '#0f172a', fontSize: 11, fontWeight: '900' },
  dnaPersonType: { color: '#64748b', fontWeight: '600' },
  dnaBar: { height: 7, borderRadius: 4, backgroundColor: '#e2e8f0', marginTop: 6, overflow: 'hidden' },
  dnaBarFill: { height: '100%', borderRadius: 4 },
  dnaPercent: { color: '#0f172a', fontSize: 11, fontWeight: '900', marginLeft: 9 },
  dnaHint: { color: '#475569', backgroundColor: '#f8fafc', borderRadius: 12, padding: 10, fontSize: 10, lineHeight: 15, marginTop: 2 },
  nextStepButton: { backgroundColor: '#0f172a', borderRadius: 13, alignItems: 'center', paddingVertical: 13, marginTop: 14 },
  nextStepDisabled: { opacity: 0.45 },
  nextStepText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  radarPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  radarTop: { flexDirection: 'row', alignItems: 'center' },
  radarIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fef3c7', textAlign: 'center', textAlignVertical: 'center', color: '#b45309', fontSize: 20, marginRight: 10 },
  radarTitle: { color: '#0f172a', fontSize: 18, fontWeight: '900', marginTop: 4 },
  conflictScore: { color: '#dc2626', fontSize: 18, fontWeight: '900', marginLeft: 'auto' },
  radarBody: { color: '#475569', fontSize: 11, lineHeight: 17, marginTop: 15 },
  clashRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderRadius: 14, padding: 12, marginTop: 14 },
  clashName: { color: '#0f172a', fontSize: 11, fontWeight: '900' },
  clashPreference: { color: '#64748b', fontSize: 9, marginTop: 3 },
  clashRight: { alignItems: 'flex-end' },
  clashVs: { color: '#ef4444', fontSize: 10, fontWeight: '900' },
  radarQuestion: { color: '#0f172a', fontSize: 12, fontWeight: '900', marginTop: 18 },
  radarChoices: { flexDirection: 'row', gap: 8, marginTop: 9 },
  radarChoice: { flex: 1, borderWidth: 1, borderColor: '#bfdbfe', backgroundColor: '#eff6ff', borderRadius: 13, padding: 10 },
  radarChoiceEmoji: { fontSize: 18 },
  radarChoiceTitle: { color: '#1e3a8a', fontSize: 11, fontWeight: '900', marginTop: 5 },
  radarChoiceBody: { color: '#475569', fontSize: 9, lineHeight: 13, marginTop: 3 },
  tokenPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  tokenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tokenCount: { color: '#2563eb', fontSize: 18, fontWeight: '900' },
  tokenBody: { color: '#475569', fontSize: 11, lineHeight: 17, marginTop: 10 },
  tokenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
  tokenChoice: { width: '31%', minHeight: 68, borderRadius: 13, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', padding: 9 },
  tokenChoiceActive: { backgroundColor: '#dbeafe', borderColor: '#60a5fa' },
  tokenChoiceIcon: { color: '#2563eb', fontSize: 16, fontWeight: '900' },
  tokenChoiceText: { color: '#475569', fontSize: 9, fontWeight: '800', lineHeight: 12, marginTop: 5 },
  tokenChoiceTextActive: { color: '#1e3a8a' },
  hubPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  hubActions: { marginTop: 14, gap: 10 },
  hubActionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  hubActionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  hubActionText: { flex: 1, marginLeft: 12 },
  hubActionTitle: { color: '#0f172a', fontSize: 14, fontWeight: '800' },
  hubActionSub: { color: '#94a3b8', fontSize: 11, marginTop: 1 },
  historyCard: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 17, padding: 14, marginTop: 14 },
  historyTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  historyTitle: { color: '#0f172a', fontSize: 14, fontWeight: '900' },
  historyMeta: { color: '#64748b', fontSize: 10, marginTop: 4 },
  statusDone: { color: '#2563eb', backgroundColor: '#dbeafe', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4, fontSize: 8, fontWeight: '900' },
  statusComplete: { color: '#059669', backgroundColor: '#d1fae5', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4, fontSize: 8, fontWeight: '900' },
  historyProgress: { height: 7, borderRadius: 4, backgroundColor: '#e2e8f0', overflow: 'hidden', marginTop: 14 },
  historyProgressFill: { height: '100%', borderRadius: 4, backgroundColor: '#2563eb' },
  historyStatus: { color: '#64748b', fontSize: 10, lineHeight: 15, marginTop: 8 },
  resumeButton: { alignSelf: 'flex-start', backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9, marginTop: 11 },
  resumeButtonText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  sectionDivider: { color: '#94a3b8', fontSize: 9, fontWeight: '900', letterSpacing: 1.1, marginTop: 22 },
  primaryRoomButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#2563eb', borderRadius: 13, paddingVertical: 13, marginTop: 10 },
  primaryRoomButtonText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  secondaryRoomButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 13, paddingVertical: 12, marginTop: 9 },
  secondaryRoomButtonText: { color: '#2563eb', fontSize: 12, fontWeight: '900' },
  joinPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  referralHint: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#eff6ff', borderRadius: 12, padding: 11, marginTop: 2 },
  referralHintText: { flex: 1, color: '#475569', fontSize: 10, lineHeight: 15 },
  backToRooms: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  backToRoomsText: { color: '#64748b', fontSize: 11, fontWeight: '800' },
  setupPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  setupScroll: { flex: 1 },
  panelTitle: { color: '#0f172a', fontSize: 20, fontWeight: '900', marginTop: 5 },
  panelHint: { color: '#64748b', fontSize: 11, lineHeight: 17, marginTop: 7 },
  textInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 13, color: '#0f172a', fontSize: 13, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 11, marginTop: 6, marginBottom: 12 },
  datePickerField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 13, paddingHorizontal: 12, paddingVertical: 13, marginTop: 6, marginBottom: 12 },
  dateValue: { color: '#0f172a', fontSize: 13, fontWeight: '800' },
  datePlaceholder: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  tripField: { backgroundColor: '#f8fafc', borderRadius: 13, padding: 12, marginTop: 12 },
  fieldLabel: { color: '#94a3b8', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  fieldValue: { color: '#0f172a', fontSize: 13, fontWeight: '800', marginTop: 4 },
  membersBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eff6ff', borderRadius: 13, padding: 12, marginTop: 12 },
  joinedText: { color: '#059669', fontSize: 10, fontWeight: '900' },
  roomCodeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 15, padding: 13, marginTop: 14 },
  roomCode: { color: '#1e3a8a', fontSize: 22, fontWeight: '900', letterSpacing: 1.5, marginTop: 3 },
  shareButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2563eb', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10 },
  shareButtonText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  shareLinkBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', borderRadius: 11, paddingHorizontal: 10, paddingVertical: 9, marginTop: 8 },
  linkText: { color: '#2563eb', fontSize: 10, fontWeight: '700' },
  travellerList: { backgroundColor: '#f8fafc', borderRadius: 13, padding: 9, marginTop: 10 },
  travellerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  travellerAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  travellerAvatarText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  travellerIdentity: { flex: 1, marginLeft: 9 },
  travellerText: { color: '#0f172a', fontSize: 11, fontWeight: '800' },
  travellerUsername: { color: '#64748b', fontSize: 9, marginTop: 2 },
  travellerRole: { color: '#64748b', fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  addTravellerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  addTravellerInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 12, color: '#0f172a', fontSize: 11, paddingHorizontal: 11, paddingVertical: 10 },
  addTravellerButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11 },
  addTravellerButtonText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  userResults: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 13, marginTop: 6, overflow: 'hidden' },
  userResult: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  userResultSelected: { backgroundColor: '#eff6ff' },
  resultAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  resultName: { color: '#0f172a', fontSize: 11, fontWeight: '900' },
  resultMeta: { color: '#64748b', fontSize: 9, marginTop: 2 },
  joinPreview: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9 },
  joinInput: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, color: '#0f172a', fontSize: 10, paddingHorizontal: 10, paddingVertical: 10 },
  joinButton: { backgroundColor: '#0f172a', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 11 },
  joinButtonText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  readyHint: { color: '#64748b', fontSize: 10, lineHeight: 15, marginTop: 10 },
  calendarBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  calendarSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, maxHeight: '88%' },
  calendarHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#d1d5db', alignSelf: 'center', marginBottom: 16 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calendarTitle: { color: '#0f172a', fontSize: 20, fontWeight: '800' },
  monthSwitcher: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  calendarMonthYear: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  monthArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  monthArrowDisabled: { opacity: 0.25 },
  calendarClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  calendarHint: { color: '#64748b', fontSize: 12, fontWeight: '700', marginBottom: 14 },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekDay: { flex: 1, color: '#94a3b8', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDay: { width: `${100/7}%`, height: 42, alignItems: 'center', justifyContent: 'center' },
  calendarDaySelected: { backgroundColor: '#2563eb', borderRadius: 21 },
  calendarDayRange: { backgroundColor: '#dbeafe' },
  calendarDayRangeEdge: { borderRadius: 21 },
  calendarDayDisabled: { opacity: 0.25 },
  calendarDayText: { color: '#0f172a', fontSize: 14, fontWeight: '700' },
  calendarDayTextDisabled: { color: '#cbd5e1' },
  calendarDayTextSelected: { color: '#fff' },
  calendarDayTextRange: { color: '#1e3a8a', fontWeight: '800' },
  selectedDateDisplay: { marginTop: 16, alignItems: 'center' },
  selectedDatePill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0f9ff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  selectedDateText: { color: '#0f172a', fontSize: 12, fontWeight: '800' },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  choiceButton: { width: '30%', borderRadius: 13, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 14, alignItems: 'center' },
  choiceButtonSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  choiceText: { color: '#334155', fontSize: 12, fontWeight: '800' },
  choiceTextSelected: { color: '#fff' },
  calendarFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  clearDates: { alignItems: 'center', paddingVertical: 12 },
  clearDatesText: { color: '#64748b', fontSize: 11, fontWeight: '800' },
  doneDates: { backgroundColor: '#0f172a', borderRadius: 13, paddingHorizontal: 32, paddingVertical: 13 },
  doneDatesDisabled: { opacity: 0.4 },
  doneDatesText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  questionPanel: { gap: 14 },
  questionTitle: { color: '#0f172a', fontSize: 22, lineHeight: 28, fontWeight: '900', marginTop: 10, textAlign: 'center' },
  questionHint: { color: '#64748b', fontSize: 11, lineHeight: 17, marginTop: 8, textAlign: 'center' },
  questionCard: { borderRadius: 22, backgroundColor: '#fff', shadowColor: '#0f172a', shadowOpacity: 0.07, shadowRadius: 16, elevation: 4, overflow: 'hidden' },
  questionCardInner: { padding: 20, alignItems: 'center' },
  questionProgressRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 18 },
  progressDotOuter: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  progressDotInner: { color: '#94a3b8', fontSize: 10, fontWeight: '900' },
  progressDotInnerActive: { color: '#fff' },
  questionBigEmoji: { fontSize: 52, marginBottom: 14 },
  questionLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  answerGrid: { gap: 10 },
  answerChoiceNew: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, borderLeftWidth: 4, borderLeftColor: '#60a5fa', shadowColor: '#0f172a', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  answerEmoji: { fontSize: 22 },
  answerEmojiCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  answerChoiceText: { flex: 1, color: '#1e293b', fontSize: 13, fontWeight: '800' },
  questionNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingHorizontal: 4 },
  questionNavButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  questionNavDisabled: { opacity: 0.35 },
  questionNavText: { color: '#0f172a', fontSize: 12, fontWeight: '900' },
  questionNavTextDisabled: { color: '#cbd5e1' },
  questionNavHint: { color: '#94a3b8', fontSize: 10, fontWeight: '700' },
  groupPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  compatibilityCard: { flexDirection: 'row', backgroundColor: '#f0fdf4', borderRadius: 18, padding: 16, marginTop: 14, borderWidth: 1, borderColor: '#bbf7d0' },
  compatibilityScoreRing: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  compatibilityScoreValue: { color: '#fff', fontSize: 22, fontWeight: '900' },
  compatibilityScoreLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },
  compatibilityInfo: { flex: 1 },
  compatibilityTitle: { color: '#065f46', fontSize: 14, fontWeight: '900', marginBottom: 4 },
  compatibilityBody: { color: '#047857', fontSize: 10, lineHeight: 15 },
  waitingCard: { flexDirection: 'row', backgroundColor: '#fffbeb', borderRadius: 18, padding: 16, marginTop: 14, borderWidth: 1, borderColor: '#fde68a' },
  waitingIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  waitingIconText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  waitingInfo: { flex: 1 },
  waitingTitle: { color: '#92400e', fontSize: 14, fontWeight: '900', marginBottom: 4 },
  waitingBody: { color: '#a16207', fontSize: 10, lineHeight: 15 },
  waitingMemberRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 14, padding: 11, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  waitingMemberInfo: { flex: 1, marginLeft: 10 },
  aiThinkingCard: { backgroundColor: '#eff6ff', borderRadius: 18, padding: 18, marginTop: 14, borderWidth: 1, borderColor: '#bfdbfe' },
  aiThinkingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  aiThinkingIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  aiThinkingInfo: { flex: 1 },
  aiThinkingTitle: { color: '#1e3a8a', fontSize: 14, fontWeight: '900', marginBottom: 3 },
  aiThinkingSubtitle: { color: '#3b82f6', fontSize: 10, lineHeight: 15 },
  aiThinkingBarBg: { height: 8, borderRadius: 4, backgroundColor: '#dbeafe', overflow: 'hidden' },
  aiThinkingBarFill: { height: 8, borderRadius: 4, backgroundColor: '#2563eb' },
  aiThinkingPercent: { color: '#2563eb', fontSize: 11, fontWeight: '900', textAlign: 'right', marginTop: 6 },
  groupSectionTitle: { color: '#94a3b8', fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginTop: 20, marginBottom: 10 },
  memberProfiles: { gap: 8 },
  memberProfileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 14, padding: 11, borderWidth: 1, borderColor: '#e2e8f0' },
  memberProfileAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  memberProfileAvatarText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  memberProfileInfo: { flex: 1, marginLeft: 10 },
  memberProfileName: { color: '#0f172a', fontSize: 12, fontWeight: '900' },
  memberProfileEmoji: { fontSize: 14 },
  memberProfileType: { color: '#2563eb', fontSize: 9, fontWeight: '800', marginTop: 2 },
  memberProfileMeta: { color: '#64748b', fontSize: 9, marginTop: 2 },
  interestGrid: { gap: 10 },
  interestCard: { backgroundColor: '#f8fafc', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  interestHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  interestEmoji: { fontSize: 20, width: 30 },
  interestTextWrap: { flex: 1 },
  interestName: { color: '#0f172a', fontSize: 12, fontWeight: '900' },
  interestTag: { color: '#94a3b8', fontSize: 8, fontWeight: '700', marginTop: 1 },
  interestPercent: { fontSize: 16, fontWeight: '900' },
  interestBarBg: { height: 6, borderRadius: 3, backgroundColor: '#e2e8f0', overflow: 'hidden' },
  interestBarFill: { height: '100%', borderRadius: 3 },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  styleCard: { width: '47%', backgroundColor: '#f8fafc', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', position: 'relative', overflow: 'hidden' },
  styleCardIcon: { fontSize: 18, marginBottom: 4 },
  styleCardLabel: { color: '#94a3b8', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  styleCardValue: { color: '#0f172a', fontSize: 13, fontWeight: '900', marginTop: 2 },
  styleCardDesc: { color: '#64748b', fontSize: 8, lineHeight: 12, marginTop: 4 },
  styleCardAccent: { position: 'absolute', top: 0, right: 0, width: 24, height: 4, borderBottomLeftRadius: 4 },
  insightCard: { backgroundColor: '#eff6ff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#bfdbfe' },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  insightText: { flex: 1, color: '#1e3a8a', fontSize: 10, lineHeight: 15, fontWeight: '600' },
  insightDivider: { height: 1, backgroundColor: '#bfdbfe', marginVertical: 10 },
  constraintBox: { backgroundColor: '#fffbeb', borderRadius: 14, padding: 14, marginTop: 4, borderWidth: 1, borderColor: '#fde68a' },
  constraintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  constraintIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' },
  constraintText: { flex: 1, color: '#92400e', fontSize: 10, lineHeight: 15 },
  suggestionsPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  consensusOverview: { flexDirection: 'row', backgroundColor: '#f0fdf4', borderRadius: 16, padding: 14, marginTop: 14, borderWidth: 1, borderColor: '#bbf7d0' },
  consensusStat: { flex: 1, alignItems: 'center' },
  consensusStatValue: { color: '#065f46', fontSize: 20, fontWeight: '900' },
  consensusStatLabel: { color: '#047857', fontSize: 8, fontWeight: '800', marginTop: 2 },
  consensusDivider: { width: 1, backgroundColor: '#bbf7d0', marginHorizontal: 4 },
  optionCard: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  optionHeader: { flexDirection: 'row', alignItems: 'center' },
  optionEmoji: { fontSize: 28, width: 40 },
  optionInfo: { flex: 1 },
  optionName: { color: '#0f172a', fontSize: 14, fontWeight: '900' },
  optionTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  optionTag: { backgroundColor: '#eff6ff', color: '#1e3a8a', fontSize: 8, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  optionScoreWrap: { alignItems: 'center' },
  optionScore: { fontSize: 18, fontWeight: '900' },
  optionScoreLabel: { color: '#94a3b8', fontSize: 7, fontWeight: '800' },
  voteSummary: { marginTop: 10 },
  voteBarBg: { height: 6, borderRadius: 3, backgroundColor: '#fee2e2', overflow: 'hidden', flexDirection: 'row' },
  voteBarWant: { height: '100%', backgroundColor: '#10b981' },
  voteBarMaybe: { height: '100%', backgroundColor: '#fbbf24' },
  voteCounts: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  voteCountWant: { color: '#059669', fontSize: 9, fontWeight: '800' },
  voteCountMaybe: { color: '#b45309', fontSize: 9, fontWeight: '800' },
  voteCountSkip: { color: '#dc2626', fontSize: 9, fontWeight: '800' },
  optionDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  optionDetailText: { color: '#475569', fontSize: 11, lineHeight: 16 },
  optionMetaRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  optionMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  optionMetaText: { color: '#64748b', fontSize: 10, fontWeight: '700' },
  memberVoteTitle: { color: '#94a3b8', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 14, marginBottom: 8 },
  memberVoteRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  memberVoteAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  memberVoteAvatarText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  memberVoteName: { flex: 1, color: '#0f172a', fontSize: 11, fontWeight: '800', marginLeft: 8 },
  voteButtons: { flexDirection: 'row', gap: 6 },
  voteButton: { width: 32, height: 28, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  voteButtonWant: { backgroundColor: '#d1fae5' },
  voteButtonMaybe: { backgroundColor: '#fef3c7' },
  voteButtonSkip: { backgroundColor: '#fee2e2' },
  voteButtonText: { fontSize: 12 },
  voteButtonTextActive: { fontSize: 14 },
  swipeNote: { color: '#64748b', fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 15 },
  itineraryPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  itineraryTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  satisfaction: { color: '#059669', backgroundColor: '#d1fae5', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, fontSize: 10, fontWeight: '900' },
  stopRow: { flexDirection: 'row', marginTop: 20 },
  stopTime: { width: 68, color: '#64748b', fontSize: 10, fontWeight: '900' },
  stopLine: { flex: 1, borderLeftWidth: 2, borderLeftColor: '#bfdbfe', paddingLeft: 12, paddingBottom: 3 },
  stopTitle: { color: '#0f172a', fontSize: 12, fontWeight: '900' },
  stopDetail: { color: '#64748b', fontSize: 10, marginTop: 4 },
  daySelector: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 12 },
  dayButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center' },
  dayButtonActive: { backgroundColor: '#2563eb' },
  dayButtonText: { color: '#64748b', fontSize: 11, fontWeight: '900' },
  dayButtonTextActive: { color: '#fff' },
  itineraryScroll: { maxHeight: 420, marginTop: 8 },
  transportConnector: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingLeft: 20 },
  transportText: { color: '#2563eb', fontSize: 10, fontWeight: '700' },
  stopCard: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, marginTop: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  stopHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stopEmoji: { fontSize: 28, width: 40 },
  stopInfo: { flex: 1 },
  stopTypeBadge: { backgroundColor: '#dbeafe', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  stopTypeText: { color: '#1e3a8a', fontSize: 8, fontWeight: '900' },
  stopDescription: { color: '#475569', fontSize: 10, lineHeight: 15, marginTop: 10 },
  stopDetails: { flexDirection: 'row', gap: 16, marginTop: 10 },
  stopDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stopDetailText: { color: '#64748b', fontSize: 10, fontWeight: '700' },
  stopTips: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eff6ff', borderRadius: 10, padding: 8, marginTop: 10 },
  stopTipsText: { flex: 1, color: '#1e3a8a', fontSize: 9, fontWeight: '700' },
  daySummary: { backgroundColor: '#f0fdf4', borderRadius: 14, padding: 12, marginTop: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { color: '#047857', fontSize: 10, fontWeight: '800' },
  summaryValue: { color: '#065f46', fontSize: 11, fontWeight: '900' },
  planReason: { backgroundColor: '#eff6ff', borderRadius: 14, padding: 12, marginTop: 18 },
  planReasonTitle: { color: '#1e3a8a', fontSize: 11, fontWeight: '900' },
  planReasonText: { color: '#475569', fontSize: 10, lineHeight: 15, marginTop: 4 },
  lockedCard: { backgroundColor: '#ecfdf5', borderRadius: 24, padding: 22, minHeight: 260, justifyContent: 'center', alignItems: 'center' },
  lockIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  lockIconText: { color: '#fff', fontSize: 26, fontWeight: '900' },
  lockedKicker: { color: '#059669', fontSize: 9, fontWeight: '900', letterSpacing: 1.1, marginTop: 14 },
  lockedTitle: { color: '#065f46', fontSize: 21, fontWeight: '900', marginTop: 5, textAlign: 'center' },
  lockedBody: { color: '#047857', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  scoreLabel: { color: '#059669', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  scoreValue: { color: '#065f46', fontSize: 16, fontWeight: '900' },
  whyButton: { backgroundColor: '#dbeafe', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 15 },
  whyButtonText: { color: '#1e3a8a', fontSize: 10, fontWeight: '900' },
  whyPanel: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 10, marginTop: 9, alignSelf: 'stretch' },
  whyLine: { color: '#047857', fontSize: 10, lineHeight: 17 },
  algorithmCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 16, padding: 12, marginTop: 18 },
  algorithmIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  algorithmIconText: { color: '#2563eb', fontSize: 16, fontWeight: '900' },
  algorithmCopy: { flex: 1, marginLeft: 10 },
  algorithmTitle: { color: '#fff', fontSize: 11, fontWeight: '900' },
  algorithmBody: { color: 'rgba(255,255,255,0.7)', fontSize: 10, lineHeight: 15, marginTop: 2 },
  inviteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dbeafe', borderRadius: 16, padding: 12, marginTop: 10 },
  inviteIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  inviteIconText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  inviteTitle: { color: '#1e3a8a', fontSize: 11, fontWeight: '900' },
  inviteBody: { color: '#1d4ed8', fontSize: 10, lineHeight: 15, marginTop: 2 },
  inviteArrow: { color: '#2563eb', fontSize: 24, fontWeight: '300' },
  inviteSheet: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: '#fff', borderRadius: 24, padding: 18, shadowColor: '#04111e', shadowOpacity: 0.3, shadowRadius: 18, elevation: 12 },
  inviteSheetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  inviteSheetEyebrow: { color: '#2563eb', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  inviteSheetTitle: { color: '#0f172a', fontSize: 20, fontWeight: '900', marginTop: 4 },
  inviteClose: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  inviteCloseText: { color: '#475569', fontSize: 22, lineHeight: 22 },
  inviteSheetBody: { color: '#475569', fontSize: 12, lineHeight: 18, marginTop: 12 },
  joinCode: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 16, alignItems: 'center', paddingVertical: 13, marginTop: 14 },
  joinCodeLabel: { color: '#60a5fa', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  joinCodeValue: { color: '#1e3a8a', fontSize: 25, fontWeight: '900', letterSpacing: 2, marginTop: 4 },
  copyInviteButton: { backgroundColor: '#0f172a', borderRadius: 13, alignItems: 'center', paddingVertical: 13, marginTop: 12 },
  copyInviteText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  simulateJoinButton: { alignItems: 'center', paddingVertical: 11, marginTop: 4 },
  simulateJoinText: { color: '#2563eb', fontSize: 11, fontWeight: '800' },
  inviteNotificationBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dbeafe', borderRadius: 12, padding: 10, marginTop: 10 },
  inviteNotificationText: { flex: 1, color: '#1e3a8a', fontSize: 11, fontWeight: '700' },
  emptyTravellerText: { color: '#94a3b8', fontSize: 11, textAlign: 'center', paddingVertical: 16 },
  statusBadgeJoined: { backgroundColor: '#d1fae5', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgePending: { backgroundColor: '#fef3c7', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeDeclined: { backgroundColor: '#fee2e2', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 8, fontWeight: '900', color: '#065f46' },
  travellerStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  statusDotJoined: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10b981', marginRight: 5 },
  statusDotPending: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#f59e0b', marginRight: 5 },
  statusDotDeclined: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef4444', marginRight: 5 },
  statusTextJoined: { color: '#059669', fontSize: 9, fontWeight: '800' },
  statusTextPending: { color: '#b45309', fontSize: 9, fontWeight: '800' },
  quizDoneText: { color: '#059669', fontSize: 9, fontWeight: '700', marginLeft: 3 },
  quizPendingText: { color: '#b45309', fontSize: 9, fontWeight: '700', marginLeft: 3 },
  statusTextDeclined: { color: '#ef4444', fontSize: 9, fontWeight: '800' },
  kickButton: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  memberSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 8 },
  memberSectionDotJoined: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  memberSectionDotPending: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b' },
  memberSectionDotDeclined: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  memberSectionTitle: { color: '#94a3b8', fontSize: 9, fontWeight: '900', letterSpacing: 1, flex: 1 },
  memberSectionCount: { color: '#64748b', fontSize: 10, fontWeight: '900', backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  addTravellerSection: { marginTop: 14 },
  addTravellerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  inviteCount: { color: '#2563eb', fontSize: 10, fontWeight: '900' },
  invitePreviewBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eff6ff', borderRadius: 10, padding: 8, marginTop: 6 },
  invitePreviewText: { flex: 1, color: '#1e3a8a', fontSize: 10, fontWeight: '600' },
  // Itinerary header & hotel
  itineraryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10 },
  itineraryDestination: { color: '#0f172a', fontSize: 22, fontWeight: '900' },
  itineraryDates: { color: '#64748b', fontSize: 11, marginTop: 3 },
  itineraryBadge: { backgroundColor: '#eff6ff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  itineraryBadgeValue: { color: '#2563eb', fontSize: 18, fontWeight: '900' },
  itineraryBadgeLabel: { color: '#3b82f6', fontSize: 9, fontWeight: '700' },
  hotelCard: { backgroundColor: '#f5f3ff', borderRadius: 16, padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#e9d5ff' },
  hotelHeader: { flexDirection: 'row', alignItems: 'center' },
  hotelIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center' },
  hotelInfo: { flex: 1, marginLeft: 12 },
  hotelName: { color: '#1e1b4b', fontSize: 13, fontWeight: '800' },
  hotelAddress: { color: '#6b7280', fontSize: 10, marginTop: 2 },
  hotelRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  hotelRatingText: { color: '#92400e', fontSize: 12, fontWeight: '800' },
  hotelPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 10, gap: 6 },
  hotelPrice: { color: '#5b21b6', fontSize: 16, fontWeight: '900' },
  hotelPriceNote: { color: '#7c3aed', fontSize: 10 },
  // Day button sub label
  dayButtonSub: { color: '#94a3b8', fontSize: 8, fontWeight: '700', marginTop: 1 },
  // Stop card enhancements
  stopEmojiWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  stopPhotoWrap: { width: 52, height: 52, borderRadius: 12, overflow: 'hidden' },
  stopPhotoThumb: { width: 52, height: 52, borderRadius: 12 },
  stopAddress: { color: '#94a3b8', fontSize: 9, marginTop: 2 },
  stopHighlights: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  stopHighlightTag: { backgroundColor: '#f0fdf4', color: '#166534', fontSize: 9, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  stopViewDetails: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 3 },
  stopViewDetailsText: { color: '#2563eb', fontSize: 10, fontWeight: '700' },
  // Type badges
  badgeFlight: { backgroundColor: '#dbeafe' },
  badgeHotel: { backgroundColor: '#ede9fe' },
  badgeFood: { backgroundColor: '#fef2f2' },
  badgeTech: { backgroundColor: '#ecfeff' },
  badgeCulture: { backgroundColor: '#fef3c7' },
  badgeNature: { backgroundColor: '#ecfdf5' },
  badgeShopping: { backgroundColor: '#fdf2f8' },
  badgeDefault: { backgroundColor: '#f1f5f9' },
  // Budget card
  budgetCard: { backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16, marginTop: 18, borderWidth: 1, borderColor: '#bbf7d0' },
  budgetTitle: { color: '#166534', fontSize: 10, fontWeight: '900', letterSpacing: 0.8, marginBottom: 10 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  budgetLabel: { color: '#475569', fontSize: 11 },
  budgetValue: { color: '#059669', fontSize: 12, fontWeight: '800' },
  // Place detail modal
  detailBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  detailSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingBottom: 30 },
  detailHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1', alignSelf: 'center', marginTop: 10 },
  detailClose: { position: 'absolute', top: 14, right: 16, zIndex: 10 },
  detailImage: { height: 180, alignItems: 'center', justifyContent: 'center', marginTop: 14, marginHorizontal: 16, borderRadius: 18 },
  detailImageEmoji: { fontSize: 52 },
  detailImageLabel: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
  detailTitleSection: { paddingHorizontal: 20, marginTop: 16 },
  detailTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailPlaceName: { color: '#0f172a', fontSize: 20, fontWeight: '900', flex: 1 },
  detailRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  detailRatingText: { color: '#92400e', fontSize: 14, fontWeight: '800' },
  detailTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  detailType: { color: '#2563eb', fontSize: 11, fontWeight: '700' },
  detailTime: { color: '#64748b', fontSize: 11 },
  detailAddress: { color: '#64748b', fontSize: 10 },
  detailSection: { paddingHorizontal: 20, marginTop: 18 },
  detailSectionTitle: { color: '#0f172a', fontSize: 13, fontWeight: '900', marginBottom: 8 },
  detailDescription: { color: '#475569', fontSize: 12, lineHeight: 18 },
  detailHighlightGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailHighlightCard: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', borderRadius: 10, padding: 8, width: '48%' },
  detailHighlightText: { color: '#334155', fontSize: 10, fontWeight: '600', flex: 1 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailGridItem: { width: '48%', backgroundColor: '#f8fafc', borderRadius: 12, padding: 12 },
  detailGridLabel: { color: '#64748b', fontSize: 9, fontWeight: '700', marginTop: 6 },
  detailGridValue: { color: '#0f172a', fontSize: 11, fontWeight: '600', marginTop: 2 },
  detailTips: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, marginHorizontal: 20, marginTop: 18 },
  detailTipsText: { flex: 1, color: '#1e3a8a', fontSize: 11, fontWeight: '600' },
  // Map & transport in detail modal
  detailMapImage: { height: 180, marginHorizontal: 16, marginTop: 14, borderRadius: 18, backgroundColor: '#e2e8f0' },
  detailPhoto: { height: 220, marginHorizontal: 16, marginTop: 14, borderRadius: 18, backgroundColor: '#e2e8f0' },
  detailImageStrip: { height: 56, marginHorizontal: 16, marginTop: -28, marginBottom: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  detailRouteSummary: { color: '#0f172a', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  detailRouteFrom: { color: '#64748b', fontSize: 10, marginBottom: 10 },
  detailLegCard: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 10, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#2563eb' },
  detailLegBadge: { backgroundColor: '#dbeafe', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  detailLegBadgeText: { color: '#1e3a8a', fontSize: 9, fontWeight: '800' },
  detailLegLine: { color: '#2563eb', fontSize: 10, fontWeight: '700', marginBottom: 2 },
  detailLegInstruction: { color: '#334155', fontSize: 11, lineHeight: 16 },
  detailLegDuration: { color: '#64748b', fontSize: 9, fontWeight: '700', marginTop: 4 },
  detailMapsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 12, marginTop: 12 },
  detailMapsButtonText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
