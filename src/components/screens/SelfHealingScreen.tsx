import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ActiveScreen } from '../../types';

export type DisruptionScenario = 'flight-delay' | 'rainstorm' | 'transit-gridlock' | 'optimal';
export type PivotStrategy = 'balanced' | 'indoor' | 'culinary' | 'budget';

interface TripActivity {
  time: string;
  place: string;
  type: 'flight' | 'hotel' | 'food' | 'attraction' | 'transport';
  note?: string;
}

interface TripDay {
  date: string;
  label: string;
  activities: TripActivity[];
}

interface RoomCondition {
  id: string;
  icon: string;
  label: string;
  detail: string;
  impactScore: number; // negative = score reduction
  active: boolean;
}

interface BackupPlan {
  summary: string;
  score: number;
  activities: { time: string; place: string; note: string }[];
}

interface RoomPlan {
  id: string;
  name: string;
  destination: string;
  dateRange: string;
  members: number;
  memberNames: string[];
  emoji: string;
  accentColor: string;
  baseScore: number;
  days: TripDay[];
  conditions: RoomCondition[];
  backupPlan: BackupPlan;
}

interface SelfHealingScreenProps {
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
  onNavigateHome: () => void;
  onNavigate?: (screen: ActiveScreen) => void;
}

// ────────────────────────────────────────────────────────────────────────────
// ROOM DATA
// ────────────────────────────────────────────────────────────────────────────
const ROOMS: RoomPlan[] = [
  {
    id: 'room-1',
    name: 'Room 1',
    destination: 'Shenzhen Tech Tour',
    dateRange: 'Sep 12 – Sep 15, 2026',
    members: 4,
    memberNames: ['Alex M.', 'Jamie T.', 'Sam L.', 'Taylor K.'],
    emoji: '🏙️',
    accentColor: '#3b82f6',
    baseScore: 100,
    days: [
      {
        date: 'Sep 12',
        label: 'Arrival Day',
        activities: [
          { time: '11:30 AM', place: 'Flight CZ3028 → SZX Airport', type: 'flight', note: 'Terminal 3, Gate B22' },
          { time: '01:00 PM', place: 'Futian CBD Hotel Check-In', type: 'hotel', note: 'Renaissance Shenzhen' },
          { time: '03:00 PM', place: 'OCT-LOFT Creative Park', type: 'attraction', note: 'Gallery District Tour' },
          { time: '07:00 PM', place: 'Bistro 1873 Cantonese Fusion', type: 'food', note: 'Group dinner reservation' },
        ],
      },
      {
        date: 'Sep 13',
        label: 'Tech District',
        activities: [
          { time: '09:00 AM', place: 'Huaqiangbei Electronics Market', type: 'attraction', note: 'Self-guided tour' },
          { time: '12:00 PM', place: 'Lianhuashan Park Hike', type: 'attraction', note: 'Outdoor activity' },
          { time: '02:30 PM', place: 'Tencent HQ Visitor Center', type: 'attraction', note: 'Tech tour booking required' },
          { time: '06:00 PM', place: 'Shenzhen Bay Seafood Night', type: 'food', note: 'Outdoor dining' },
        ],
      },
    ],
    conditions: [
      {
        id: 'c1-flight',
        icon: 'airplane',
        label: 'Flight CZ3028 Delayed +3h',
        detail: 'Inbound from KUL, tarmac hold due to weather radar.',
        impactScore: -35,
        active: true,
      },
      {
        id: 'c1-rain',
        icon: 'thunderstorm',
        label: 'Torrential Rain (28mm/h)',
        detail: 'Outdoor activities compromised. OCT-LOFT & park canceled.',
        impactScore: -20,
        active: true,
      },
      {
        id: 'c1-hotel',
        icon: 'bed',
        label: 'Hotel Check-In Delayed',
        detail: 'Room not ready until 3PM due to prior guest late check-out.',
        impactScore: -12,
        active: false,
      },
      {
        id: 'c1-traffic',
        icon: 'car',
        label: 'CBD Traffic Gridlock',
        detail: '+45min on major interchange. Dinner reservation at risk.',
        impactScore: -10,
        active: false,
      },
    ],
    backupPlan: {
      summary: 'Auto-rerouted to indoor venues. Recovered 180 min of lost travel time.',
      score: 78,
      activities: [
        { time: '03:30 PM', place: 'Skyline Tea & Co-working Lounge', note: 'Indoor pivot – Free artisan cold brew + 25% off' },
        { time: '05:00 PM', place: 'Shenzhen Digital Art Pavilion', note: 'Replaces outdoor park – VIP Fast-Pass' },
        { time: '07:15 PM', place: 'Bistro 1873 (Shifted +45 min)', note: 'Reservation held — zero no-show penalty' },
      ],
    },
  },
  {
    id: 'room-2',
    name: 'Room 2',
    destination: 'Tokyo Cultural Journey',
    dateRange: 'Oct 3 – Oct 8, 2026',
    members: 3,
    memberNames: ['Morgan R.', 'Jordan B.', 'Casey W.'],
    emoji: '⛩️',
    accentColor: '#f43f5e',
    baseScore: 100,
    days: [
      {
        date: 'Oct 3',
        label: 'Arrival & Akihabara',
        activities: [
          { time: '10:15 AM', place: 'Flight JL711 → NRT Airport', type: 'flight', note: 'Terminal 2' },
          { time: '12:30 PM', place: 'Shinjuku Granbell Hotel', type: 'hotel', note: 'Check-in + luggage drop' },
          { time: '02:00 PM', place: 'Akihabara Electric Town', type: 'attraction', note: 'Anime + Electronics District' },
          { time: '07:00 PM', place: 'Omoide Yokocho Yakitori', type: 'food', note: 'Street food alley dinner' },
        ],
      },
      {
        date: 'Oct 4',
        label: 'Temples & Gardens',
        activities: [
          { time: '08:00 AM', place: 'Senso-ji Temple, Asakusa', type: 'attraction', note: 'Morning walk + prayers' },
          { time: '11:00 AM', place: 'Hamarikyu Gardens', type: 'attraction', note: 'Outdoor garden stroll' },
          { time: '01:00 PM', place: 'Tsukiji Outer Market Lunch', type: 'food', note: 'Sushi omakase' },
          { time: '04:00 PM', place: 'Teamlab Planets (Odaiba)', type: 'attraction', note: 'Digital art immersive' },
        ],
      },
    ],
    conditions: [
      {
        id: 'c2-typhoon',
        icon: 'thunderstorm',
        label: 'Typhoon Warning Level 2',
        detail: 'Outdoor activities in Asakusa and Hamarikyu unsafe. JMA alert issued.',
        impactScore: -30,
        active: true,
      },
      {
        id: 'c2-rail',
        icon: 'train',
        label: 'Chuo Line Suspended',
        detail: 'Service halted due to fallen debris. 2 hrs minimum delay.',
        impactScore: -25,
        active: false,
      },
      {
        id: 'c2-sold-out',
        icon: 'ticket',
        label: 'Teamlab Tickets Sold Out',
        detail: 'Unexpected weekend demand. All slots booked through Oct 6.',
        impactScore: -15,
        active: true,
      },
      {
        id: 'c2-closure',
        icon: 'storefront',
        label: 'Tsukiji Market Closed',
        detail: 'Emergency inspection — all stalls closed for the day.',
        impactScore: -8,
        active: false,
      },
    ],
    backupPlan: {
      summary: 'Shifted to sheltered indoor experiences and nearby museum cluster.',
      score: 71,
      activities: [
        { time: '10:00 AM', place: 'Tokyo National Museum (Ueno)', note: 'Replaces outdoor Senso-ji walk' },
        { time: '01:00 PM', place: 'Mori Art Museum (Roppongi)', note: 'Indoor gallery – 52nd floor city views' },
        { time: '03:30 PM', place: 'teamLab Future Park (Azabudai)', note: 'Alternative Teamlab venue – same experience' },
        { time: '07:00 PM', place: 'Gonpachi Nishiazabu', note: 'Famous yakitori dinner, advance seat held' },
      ],
    },
  },
  {
    id: 'room-3',
    name: 'Room 3',
    destination: 'Bangkok Beach Escape',
    dateRange: 'Nov 20 – Nov 25, 2026',
    members: 6,
    memberNames: ['Riley S.', 'Parker N.', 'Quinn A.', 'Drew H.', 'Skyler P.', 'Avery J.'],
    emoji: '🌴',
    accentColor: '#10b981',
    baseScore: 100,
    days: [
      {
        date: 'Nov 20',
        label: 'Arrival & Beach',
        activities: [
          { time: '09:00 AM', place: 'Flight TG201 → BKK Suvarnabhumi', type: 'flight', note: 'Terminal A, Gate G9' },
          { time: '11:00 AM', place: 'Anantara Riverside Hotel', type: 'hotel', note: 'River-view suite check-in' },
          { time: '01:00 PM', place: 'Asiatique The Riverfront', type: 'attraction', note: 'Shopping & street food' },
          { time: '06:00 PM', place: 'Rooftop Bar — Octave Marriott', type: 'food', note: 'Sunset cocktails' },
        ],
      },
      {
        date: 'Nov 21',
        label: 'Island Day Trip',
        activities: [
          { time: '07:00 AM', place: 'Ko Samet Ferry Departure', type: 'transport', note: 'From Ban Phe pier' },
          { time: '10:00 AM', place: 'Ko Samet Beach Day', type: 'attraction', note: 'Snorkeling & water sports' },
          { time: '03:00 PM', place: 'Kayak to Ao Hin Khok Cove', type: 'attraction', note: 'Optional water activity' },
          { time: '06:00 PM', place: 'Return Ferry + Dinner', type: 'transport', note: 'Beachside seafood BBQ on return' },
        ],
      },
    ],
    conditions: [
      {
        id: 'c3-sea-rough',
        icon: 'water',
        label: 'Rough Seas — Ferry Canceled',
        detail: 'Port authority suspended Ko Samet services. Wave height 3.2m.',
        impactScore: -22,
        active: false,
      },
      {
        id: 'c3-monsoon',
        icon: 'rainy',
        label: 'Monsoon Rain Forecast',
        detail: 'Tropical downpour expected 10AM-6PM. Outdoor plans impacted.',
        impactScore: -10,
        active: false,
      },
      {
        id: 'c3-visa',
        icon: 'document-text',
        label: 'Visa Extension Required',
        detail: 'Group member passport valid until Nov 22. Admin delay risk.',
        impactScore: -5,
        active: false,
      },
      {
        id: 'c3-hotel-overbooking',
        icon: 'home',
        label: 'Hotel Overbooking Alert',
        detail: 'System flagged double-booking. Room allocation not confirmed.',
        impactScore: -8,
        active: false,
      },
    ],
    backupPlan: {
      summary: 'Coastal day trip replaced with Bangkok city cultural circuit.',
      score: 82,
      activities: [
        { time: '09:00 AM', place: 'Grand Palace & Wat Phra Kaew', note: 'Air-conditioned guided tour' },
        { time: '12:00 PM', place: 'Jim Thompson House Museum', note: 'Indoor cultural heritage visit' },
        { time: '02:30 PM', place: 'Central Embassy Spa & Lounge', note: 'Premium spa — group booking secured' },
        { time: '07:00 PM', place: 'Sirocco Sky Bar Dinner', note: 'Open-air high-rise — post-rain clear evening' },
      ],
    },
  },
];

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────
export const SelfHealingScreen: React.FC<SelfHealingScreenProps> = ({
  topColor,
  bottomColor,
  buttonBg,
  onNavigateHome,
  onNavigate,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-1');
  const [roomConditions, setRoomConditions] = useState<Record<string, RoomCondition[]>>(() =>
    Object.fromEntries(ROOMS.map(r => [r.id, r.conditions.map(c => ({ ...c }))])),
  );
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const selectedRoom = ROOMS.find(r => r.id === selectedRoomId)!;
  const currentConditions = roomConditions[selectedRoomId] ?? selectedRoom.conditions;

  const tripHealthScore = useMemo(() => {
    const totalPenalty = currentConditions
      .filter(c => c.active)
      .reduce((sum, c) => sum + c.impactScore, 0);
    return Math.max(0, Math.min(100, selectedRoom.baseScore + totalPenalty));
  }, [selectedRoomId, currentConditions, selectedRoom]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const healthColor = getHealthColor(tripHealthScore);

  const toggleCondition = (conditionId: string) => {
    setRoomConditions(prev => ({
      ...prev,
      [selectedRoomId]: prev[selectedRoomId].map(c =>
        c.id === conditionId ? { ...c, active: !c.active } : c,
      ),
    }));
  };

  const activeConditions = currentConditions.filter(c => c.active);

  const activityIcon = (type: TripActivity['type']) => {
    switch (type) {
      case 'flight': return 'airplane';
      case 'hotel': return 'bed';
      case 'food': return 'restaurant';
      case 'attraction': return 'camera';
      case 'transport': return 'bus';
      default: return 'location';
    }
  };

  return (
    <LinearGradient
      colors={[topColor, '#8EAFD2', bottomColor]}
      locations={[0, 0.46, 1]}
      style={styles.container}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toast}>
          <Ionicons name="sparkles" size={14} color="#fff" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={onNavigateHome}
            style={({ pressed }) => [styles.iconCircle, pressed && styles.pressedGlass]}
          >
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </Pressable>
          <View style={styles.headerTitleCenter}>
            <View style={styles.featureBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#1d4ed8" />
              <Text style={styles.featureBadgeText}>FEATURE 4</Text>
            </View>
            <Text style={styles.headerTitle}>Self-Healing Pivot</Text>
          </View>
          <Pressable
            onPress={() => showToast('Syncing real-time OpenWeather & Maps telemetry...')}
            style={({ pressed }) => [styles.iconCircle, pressed && styles.pressedGlass]}
          >
            <Ionicons name="refresh-outline" size={19} color="#0f172a" />
          </Pressable>
        </View>

        {/* Live telemetry bar */}
        <View style={styles.telemetryRow}>
          <View style={styles.telemetryPill}>
            <Ionicons name="thunderstorm-outline" size={11} color="#fbbf24" />
            <Text style={styles.telemetryLabel}>OpenWeather:</Text>
            <Text style={styles.telemetryValue}>
              {activeConditions.some(c => c.icon === 'thunderstorm' || c.icon === 'rainy')
                ? 'Storm Alert'
                : 'Clear · Good'}
            </Text>
          </View>
          <View style={styles.telemetryPill}>
            <Ionicons name="map-outline" size={11} color="#60a5fa" />
            <Text style={styles.telemetryLabel}>Google Maps:</Text>
            <Text style={styles.telemetryValue}>
              {activeConditions.some(c => c.icon === 'car' || c.icon === 'train')
                ? 'Disruptions'
                : 'Traffic Normal'}
            </Text>
          </View>
          <View style={[styles.livePulsePill]}>
            <View style={styles.pulseDot} />
            <Text style={styles.livePulseText}>LIVE</Text>
          </View>
        </View>
      </View>

      {/* Main Scroll */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SECTION 1: Room Selector ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Travel Room</Text>
          <Text style={styles.sectionSub}>Each room has a unique plan, destination & conditions</Text>
          <View style={styles.roomTabsRow}>
            {ROOMS.map(room => (
              <Pressable
                key={room.id}
                onPress={() => {
                  setSelectedRoomId(room.id);
                  setShowBackupModal(false);
                }}
                style={[
                  styles.roomTab,
                  selectedRoomId === room.id && {
                    borderColor: room.accentColor,
                    backgroundColor: `${room.accentColor}22`,
                  },
                ]}
              >
                <Text style={styles.roomEmoji}>{room.emoji}</Text>
                <Text
                  style={[
                    styles.roomTabName,
                    selectedRoomId === room.id && { color: room.accentColor },
                  ]}
                >
                  {room.name}
                </Text>
                <Text style={styles.roomTabDest} numberOfLines={1}>
                  {room.destination.split(' ').slice(0, 1).join(' ')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── SECTION 2: Room Plan Summary ── */}
        <View style={styles.sectionCard}>
          <View style={styles.roomPlanHeader}>
            <View style={styles.roomPlanLeft}>
              <Text style={styles.roomPlanEmoji}>{selectedRoom.emoji}</Text>
              <View>
                <Text style={styles.roomPlanTitle}>{selectedRoom.destination}</Text>
                <Text style={styles.roomPlanDate}>{selectedRoom.dateRange}</Text>
              </View>
            </View>
            <View style={[styles.membersBadge, { backgroundColor: `${selectedRoom.accentColor}22` }]}>
              <Ionicons name="people" size={13} color={selectedRoom.accentColor} />
              <Text style={[styles.membersText, { color: selectedRoom.accentColor }]}>
                {selectedRoom.members} members
              </Text>
            </View>
          </View>
          <View style={styles.memberNamesRow}>
            {selectedRoom.memberNames.map(name => (
              <View key={name} style={styles.memberPill}>
                <Text style={styles.memberPillText}>{name}</Text>
              </View>
            ))}
          </View>

          {/* Day plans */}
          {selectedRoom.days.map(day => (
            <View key={day.date} style={styles.dayBlock}>
              <Pressable
                onPress={() =>
                  setExpandedDay(expandedDay === `${selectedRoomId}-${day.date}` ? null : `${selectedRoomId}-${day.date}`)
                }
                style={styles.dayHeader}
              >
                <View style={styles.dayHeaderLeft}>
                  <Text style={styles.dayDate}>{day.date}</Text>
                  <Text style={styles.dayLabel}>{day.label}</Text>
                </View>
                <Ionicons
                  name={expandedDay === `${selectedRoomId}-${day.date}` ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#94a3b8"
                />
              </Pressable>
              {expandedDay === `${selectedRoomId}-${day.date}` && (
                <View style={styles.activityList}>
                  {day.activities.map((act, idx) => (
                    <View key={idx} style={styles.activityRow}>
                      <View style={[styles.activityIconBubble, { backgroundColor: `${selectedRoom.accentColor}22` }]}>
                        <Ionicons name={activityIcon(act.type) as any} size={13} color={selectedRoom.accentColor} />
                      </View>
                      <View style={styles.activityInfo}>
                        <View style={styles.activityTimePlaceRow}>
                          <Text style={styles.activityTime}>{act.time}</Text>
                          <Text style={styles.activityPlace}>{act.place}</Text>
                        </View>
                        {act.note && <Text style={styles.activityNote}>{act.note}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* ── SECTION 3: Trip Health Score ── */}
        <View style={[styles.sectionCard, styles.healthCard]}>
          <View style={styles.healthHeaderRow}>
            <View>
              <Text style={styles.healthLabel}>TRIP HEALTH SCORE</Text>
              <Text style={styles.healthTitle}>Current Equilibrium</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    tripHealthScore >= 80
                      ? 'rgba(16,185,129,0.2)'
                      : tripHealthScore >= 60
                      ? 'rgba(245,158,11,0.2)'
                      : 'rgba(239,68,68,0.2)',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color:
                      tripHealthScore >= 80
                        ? '#10b981'
                        : tripHealthScore >= 60
                        ? '#f59e0b'
                        : '#ef4444',
                  },
                ]}
              >
                {tripHealthScore >= 80 ? '✅ OPTIMAL' : tripHealthScore >= 60 ? '⚠️ AT RISK' : '🚨 CRITICAL'}
              </Text>
            </View>
          </View>

          {/* Score Dial */}
          <View style={styles.scoreRow}>
            <View style={[styles.scoreCircle, { borderColor: healthColor }]}>
              <Text style={[styles.scoreValue, { color: healthColor }]}>{tripHealthScore}</Text>
              <Text style={styles.scoreMax}>/ 100</Text>
            </View>
            <View style={styles.scoreBreakdown}>
              <Text style={styles.breakdownTitle}>Active Disruptions:</Text>
              {activeConditions.length === 0 ? (
                <Text style={styles.noDisruption}>✅ No active disruptions</Text>
              ) : (
                activeConditions.map(c => (
                  <View key={c.id} style={styles.breakdownRow}>
                    <Ionicons name={c.icon as any} size={12} color="#f87171" />
                    <Text style={styles.breakdownText}>
                      {c.label}: <Text style={styles.breakdownImpact}>{c.impactScore}</Text>
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Score bar */}
          <View style={styles.scoreBarBg}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${tripHealthScore}%` as any, backgroundColor: healthColor },
              ]}
            />
          </View>

          {/* Low score warning banner */}
          {tripHealthScore < 60 && (
            <Pressable
              onPress={() => setShowBackupModal(true)}
              style={styles.criticalBanner}
            >
              <Ionicons name="warning" size={16} color="#f87171" />
              <Text style={styles.criticalBannerText}>
                Score below 60! Backup plan available — tap to view
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#f87171" />
            </Pressable>
          )}

          {tripHealthScore >= 60 && tripHealthScore < 80 && (
            <View style={styles.warningBanner}>
              <Ionicons name="alert-circle" size={15} color="#f59e0b" />
              <Text style={styles.warningBannerText}>
                Trip is at risk. Enable more disruptions below to stress-test.
              </Text>
            </View>
          )}

          {tripHealthScore >= 80 && (
            <View style={styles.goodBanner}>
              <Ionicons name="checkmark-circle" size={15} color="#10b981" />
              <Text style={styles.goodBannerText}>
                All systems optimal. Your trip is on track!
              </Text>
            </View>
          )}
        </View>

        {/* ── SECTION 4: Condition Toggles ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Live Disruption Conditions</Text>
          <Text style={styles.sectionSub}>Toggle conditions to see their impact on your trip score</Text>
          {currentConditions.map(condition => (
            <Pressable
              key={condition.id}
              onPress={() => toggleCondition(condition.id)}
              style={[styles.conditionRow, condition.active && styles.conditionRowActive]}
            >
              <View
                style={[
                  styles.conditionIconBubble,
                  condition.active && { backgroundColor: 'rgba(239,68,68,0.15)' },
                ]}
              >
                <Ionicons
                  name={condition.icon as any}
                  size={16}
                  color={condition.active ? '#f87171' : '#94a3b8'}
                />
              </View>
              <View style={styles.conditionInfo}>
                <Text style={[styles.conditionLabel, condition.active && { color: '#f87171' }]}>
                  {condition.label}
                </Text>
                <Text style={styles.conditionDetail}>{condition.detail}</Text>
              </View>
              <View style={styles.conditionRight}>
                <Text style={[styles.conditionImpact, condition.active && { color: '#f87171' }]}>
                  {condition.impactScore}
                </Text>
                <View style={[styles.toggleSwitch, condition.active && styles.toggleSwitchOn]}>
                  <View style={[styles.toggleKnob, condition.active && styles.toggleKnobOn]} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── SECTION 5: What-If Simulator CTA ── */}
        <Pressable
          onPress={() => onNavigate?.('what-if-simulator')}
          style={({ pressed }) => [styles.whatIfCard, pressed && styles.pressedGlass]}
        >
          <LinearGradient
            colors={['#1e3a5f', '#0f172a']}
            style={styles.whatIfGradient}
          >
            <View style={styles.whatIfLeft}>
              <View style={styles.whatIfIconWrap}>
                <Ionicons name="options" size={22} color="#60a5fa" />
              </View>
              <View>
                <Text style={styles.whatIfTitle}>"What-If" Simulator</Text>
                <Text style={styles.whatIfSub}>Select conditions · See timeline effects</Text>
              </View>
            </View>
            <View style={styles.whatIfArrow}>
              <Ionicons name="arrow-forward-circle" size={26} color="#60a5fa" />
            </View>
          </LinearGradient>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── BACKUP PLAN MODAL ── */}
      <Modal visible={showBackupModal} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setShowBackupModal(false)}>
          <Pressable style={styles.backupModal} onPress={() => undefined}>
            {/* Modal Header */}
            <View style={styles.backupModalHeader}>
              <View>
                <Text style={styles.backupModalPill}>🛡️ BACKUP PLAN ACTIVATED</Text>
                <Text style={styles.backupModalTitle}>Auto-Recovery Detected</Text>
              </View>
              <Pressable onPress={() => setShowBackupModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#94a3b8" />
              </Pressable>
            </View>

            {/* Current vs Backup Score */}
            <View style={styles.scoreCompareRow}>
              <View style={styles.scoreCompareItem}>
                <Text style={styles.scoreCompareLabel}>Current Score</Text>
                <Text style={[styles.scoreCompareValue, { color: '#ef4444' }]}>
                  {tripHealthScore}
                </Text>
                <Text style={styles.scoreCompareSub}>⚠️ Critical</Text>
              </View>
              <Ionicons name="arrow-forward" size={22} color="#60a5fa" style={{ marginTop: 12 }} />
              <View style={styles.scoreCompareItem}>
                <Text style={styles.scoreCompareLabel}>Backup Score</Text>
                <Text style={[styles.scoreCompareValue, { color: '#10b981' }]}>
                  {selectedRoom.backupPlan.score}
                </Text>
                <Text style={styles.scoreCompareSub}>✅ Recovered</Text>
              </View>
            </View>

            <Text style={styles.backupSummaryText}>{selectedRoom.backupPlan.summary}</Text>

            {/* Backup Activities */}
            <Text style={styles.backupActivitiesLabel}>Suggested Backup Schedule:</Text>
            {selectedRoom.backupPlan.activities.map((act, idx) => (
              <View key={idx} style={styles.backupActivityRow}>
                <View style={styles.backupActivityBullet}>
                  <Text style={styles.backupActivityIdx}>{idx + 1}</Text>
                </View>
                <View style={styles.backupActivityInfo}>
                  <Text style={styles.backupActivityTime}>{act.time}</Text>
                  <Text style={styles.backupActivityPlace}>{act.place}</Text>
                  <Text style={styles.backupActivityNote}>{act.note}</Text>
                </View>
              </View>
            ))}

            <Pressable
              onPress={() => {
                setShowBackupModal(false);
                showToast('✅ Backup plan accepted & synced to group!');
              }}
              style={styles.acceptBackupBtn}
            >
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
              <Text style={styles.acceptBackupText}>Accept Backup Plan</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// STYLES
// ────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Toast
  toast: {
    position: 'absolute',
    top: 14,
    left: 20,
    right: 20,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.3)',
  },
  toastText: { color: '#e2e8f0', fontSize: 12, flex: 1, fontWeight: '600' },

  // Header
  header: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'rgba(183,212,242,0.35)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedGlass: { opacity: 0.7 },
  headerTitleCenter: { flex: 1, alignItems: 'center' },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(29,78,216,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 2,
  },
  featureBadgeText: { fontSize: 9, color: '#1d4ed8', fontWeight: '800', letterSpacing: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  telemetryRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15,23,42,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  telemetryLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  telemetryValue: { fontSize: 10, color: '#e2e8f0', fontWeight: '700' },
  livePulsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16,185,129,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  livePulseText: { fontSize: 9, color: '#10b981', fontWeight: '800', letterSpacing: 1 },

  // Scroll
  scrollArea: { flex: 1 },
  scrollContent: { padding: 14, gap: 12 },

  // Shared card
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  sectionSub: { fontSize: 11, color: '#475569', marginBottom: 12 },

  // Room Tabs
  roomTabsRow: { flexDirection: 'row', gap: 8 },
  roomTab: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roomEmoji: { fontSize: 20, marginBottom: 3 },
  roomTabName: { fontSize: 12, fontWeight: '800', color: '#1e293b', marginBottom: 1 },
  roomTabDest: { fontSize: 9, color: '#64748b', textAlign: 'center' },

  // Room Plan Header
  roomPlanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  roomPlanLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roomPlanEmoji: { fontSize: 28 },
  roomPlanTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  roomPlanDate: { fontSize: 11, color: '#475569', marginTop: 1 },
  membersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  membersText: { fontSize: 11, fontWeight: '700' },
  memberNamesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 12 },
  memberPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  memberPillText: { fontSize: 10, color: '#334155', fontWeight: '600' },

  // Day blocks
  dayBlock: {
    marginBottom: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 10,
  },
  dayHeaderLeft: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dayDate: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  dayLabel: { fontSize: 11, color: '#475569' },
  activityList: { paddingHorizontal: 10, paddingVertical: 8, gap: 8 },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  activityIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  activityInfo: { flex: 1 },
  activityTimePlaceRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  activityTime: { fontSize: 10, color: '#64748b', fontWeight: '700' },
  activityPlace: { fontSize: 11, color: '#1e293b', fontWeight: '700', flex: 1 },
  activityNote: { fontSize: 10, color: '#64748b', marginTop: 1 },

  // Health Card
  healthCard: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  healthHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  healthLabel: { fontSize: 9, color: '#64748b', fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  healthTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scoreValue: { fontSize: 26, fontWeight: '900', lineHeight: 28 },
  scoreMax: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  scoreBreakdown: { flex: 1 },
  breakdownTitle: { fontSize: 11, fontWeight: '700', color: '#334155', marginBottom: 6 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  breakdownText: { fontSize: 10, color: '#475569', flex: 1 },
  breakdownImpact: { color: '#ef4444', fontWeight: '800' },
  noDisruption: { fontSize: 11, color: '#10b981', fontWeight: '600' },
  scoreBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  criticalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    marginTop: 4,
  },
  criticalBannerText: { flex: 1, fontSize: 11, color: '#f87171', fontWeight: '700' },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    marginTop: 4,
  },
  warningBannerText: { flex: 1, fontSize: 11, color: '#fbbf24', fontWeight: '600' },
  goodBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    marginTop: 4,
  },
  goodBannerText: { flex: 1, fontSize: 11, color: '#34d399', fontWeight: '600' },

  // Conditions
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  conditionRowActive: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.25)',
  },
  conditionIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionInfo: { flex: 1 },
  conditionLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 2 },
  conditionDetail: { fontSize: 10, color: '#64748b', lineHeight: 14 },
  conditionRight: { alignItems: 'center', gap: 4 },
  conditionImpact: { fontSize: 11, fontWeight: '800', color: '#94a3b8' },
  toggleSwitch: {
    width: 34,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchOn: { backgroundColor: 'rgba(239,68,68,0.6)' },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleKnobOn: { alignSelf: 'flex-end' },

  // What-If CTA
  whatIfCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(96,165,250,0.3)',
  },
  whatIfGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  whatIfLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  whatIfIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(96,165,250,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatIfTitle: { fontSize: 16, fontWeight: '800', color: '#e2e8f0' },
  whatIfSub: { fontSize: 11, color: '#64748b', marginTop: 1 },
  whatIfArrow: {},

  // Backup Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  backupModal: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  backupModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  backupModalPill: { fontSize: 10, color: '#2563eb', fontWeight: '800', letterSpacing: 0.5 },
  backupModalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  scoreCompareItem: { alignItems: 'center' },
  scoreCompareLabel: { fontSize: 10, color: '#64748b', fontWeight: '700', marginBottom: 4 },
  scoreCompareValue: { fontSize: 32, fontWeight: '900', lineHeight: 36 },
  scoreCompareSub: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  backupSummaryText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  backupActivitiesLabel: { fontSize: 12, fontWeight: '800', color: '#0f172a', marginBottom: 10 },
  backupActivityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  backupActivityBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  backupActivityIdx: { fontSize: 11, fontWeight: '800', color: '#fff' },
  backupActivityInfo: { flex: 1 },
  backupActivityTime: { fontSize: 10, color: '#64748b', fontWeight: '700' },
  backupActivityPlace: { fontSize: 12, fontWeight: '700', color: '#1e293b', marginBottom: 1 },
  backupActivityNote: { fontSize: 10, color: '#10b981', fontWeight: '600' },
  acceptBackupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  acceptBackupText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
