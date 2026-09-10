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
import { WhatIfSimulatorScreen } from './WhatIfSimulatorScreen';

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
  impactScore: number;
  active: boolean;
}

interface BackupPlan {
  summary: string;
  score: number;
  activities: { time: string; place: string; note: string }[];
}

interface ComparisonItem {
  date: string;
  label: string;
  status: 'ok' | 'cancelled';
}

interface RoomPlan {
  id: string;
  name: string;
  destination: string;
  city: string;
  dateRange: string;
  members: number;
  memberNames: string[];
  emoji: string;
  accentColor: string;
  baseScore: number;
  days: TripDay[];
  conditions: RoomCondition[];
  backupPlan: BackupPlan;
  comparison: { old: ComparisonItem[]; next: ComparisonItem[] };
}

interface SelfHealingScreenProps {
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
  onNavigateHome: () => void;
  onNavigate?: (screen: ActiveScreen) => void;
}

const ROOMS: RoomPlan[] = [
  {
    id: 'room-1',
    name: 'Room 1',
    destination: 'Shenzhen Tech Tour',
    city: 'Shenzhen',
    dateRange: 'Sep 12 - Sep 15, 2026',
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
        label: 'Flight CZ3028 Delayed',
        detail: 'Inbound from KUL, tarmac hold due to weather radar.',
        impactScore: -35,
        active: true,
      },
      {
        id: 'c1-rain',
        icon: 'rainy',
        label: 'Torrential Rain',
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
      score: 85,
      activities: [
        { time: '03:30 PM', place: 'Skyline Tea & Co-working Lounge', note: 'Indoor pivot – Free artisan cold brew + 25% off' },
        { time: '05:00 PM', place: 'Shenzhen Digital Art Pavilion', note: 'Replaces outdoor park – VIP Fast-Pass' },
        { time: '07:15 PM', place: 'Bistro 1873 (Shifted +45 min)', note: 'Reservation held — zero no-show penalty' },
      ],
    },
    comparison: {
      old: [
        { date: 'Sep 12', label: 'Arrival Day', status: 'ok' },
        { date: 'Sep 13', label: 'Tech District', status: 'cancelled' },
      ],
      next: [
        { date: 'Sep 12', label: 'Arrival Day', status: 'ok' },
        { date: 'Sep 13', label: 'Indoor Tech Expo & Museum', status: 'ok' },
      ],
    },
  },
  {
    id: 'room-2',
    name: 'Room 2',
    destination: 'Tokyo Cultural Journey',
    city: 'Tokyo',
    dateRange: 'Oct 3 - Oct 8, 2026',
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
        label: 'Typhoon Warning',
        detail: 'Outdoor activities in Asakusa and Hamarikyu unsafe. JMA alert issued.',
        impactScore: -30,
        active: true,
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
        id: 'c2-rail',
        icon: 'train',
        label: 'Chuo Line Suspended',
        detail: 'Service halted due to fallen debris. 2 hrs minimum delay.',
        impactScore: -25,
        active: false,
      },
    ],
    backupPlan: {
      summary: 'Shifted to sheltered indoor experiences and nearby museum cluster.',
      score: 85,
      activities: [
        { time: '10:00 AM', place: 'Tokyo National Museum (Ueno)', note: 'Replaces outdoor Senso-ji walk' },
        { time: '01:00 PM', place: 'Mori Art Museum (Roppongi)', note: 'Indoor gallery – 52nd floor city views' },
        { time: '07:00 PM', place: 'Gonpachi Nishiazabu', note: 'Famous yakitori dinner, advance seat held' },
      ],
    },
    comparison: {
      old: [
        { date: 'Oct 3', label: 'Arrival & Akihabara', status: 'ok' },
        { date: 'Oct 4', label: 'Temples & Gardens', status: 'cancelled' },
      ],
      next: [
        { date: 'Oct 3', label: 'Arrival & Akihabara', status: 'ok' },
        { date: 'Oct 4', label: 'Indoor Museums & teamLab', status: 'ok' },
      ],
    },
  },
  {
    id: 'room-3',
    name: 'Room 3',
    destination: 'Bangkok Beach Escape',
    city: 'Bangkok',
    dateRange: 'Nov 20 - Nov 25, 2026',
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
        id: 'c3-monsoon',
        icon: 'rainy',
        label: 'Monsoon Rain Forecast',
        detail: 'Tropical downpour expected 10AM-6PM. Outdoor plans impacted.',
        impactScore: -10,
        active: true,
      },
      {
        id: 'c3-sea-rough',
        icon: 'water',
        label: 'Rough Seas — Ferry Canceled',
        detail: 'Port authority suspended Ko Samet services. Wave height 3.2m.',
        impactScore: -22,
        active: true,
      },
    ],
    backupPlan: {
      summary: 'Coastal day trip replaced with Bangkok city cultural circuit.',
      score: 85,
      activities: [
        { time: '09:00 AM', place: 'Grand Palace & Wat Phra Kaew', note: 'Air-conditioned guided tour' },
        { time: '12:00 PM', place: 'Jim Thompson House Museum', note: 'Indoor cultural heritage visit' },
        { time: '07:00 PM', place: 'Sirocco Sky Bar Dinner', note: 'Open-air high-rise — post-rain clear evening' },
      ],
    },
    comparison: {
      old: [
        { date: 'Nov 20', label: 'Arrival & Beach', status: 'ok' },
        { date: 'Nov 21', label: 'Island Day Trip', status: 'cancelled' },
      ],
      next: [
        { date: 'Nov 20', label: 'Arrival & Beach', status: 'ok' },
        { date: 'Nov 21', label: 'Bangkok City Cultural Circuit', status: 'ok' },
      ],
    },
  },
];

const disruptionIcon = (icon: string) => {
  if (icon === 'airplane') return '✈️';
  if (icon === 'rainy' || icon === 'thunderstorm') return '🌧️';
  if (icon === 'ticket') return '🎟️';
  if (icon === 'water') return '🌊';
  return '⚠️';
};

export const SelfHealingScreen: React.FC<SelfHealingScreenProps> = ({
  topColor,
  bottomColor,
  onNavigateHome,
}) => {
  const [view, setView] = useState<'pivot' | 'simulator'>('pivot');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-1');
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const [autoFixed, setAutoFixed] = useState<Record<string, boolean>>({});
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [itineraryGlow, setItineraryGlow] = useState(false);

  const selectedRoom = ROOMS.find(r => r.id === selectedRoomId)!;
  const isFixed = !!autoFixed[selectedRoomId];

  const liveScore = useMemo(() => {
    const totalPenalty = selectedRoom.conditions
      .filter(c => c.active)
      .reduce((sum, c) => sum + c.impactScore, 0);
    return Math.max(0, Math.min(100, selectedRoom.baseScore + totalPenalty));
  }, [selectedRoom]);

  const tripHealthScore = isFixed ? 85 : liveScore;

  const getHealthColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const healthColor = getHealthColor(tripHealthScore);
  const isLow = tripHealthScore < 50;
  const isOptimal = tripHealthScore >= 80;
  const activeConditions = selectedRoom.conditions.filter(c => c.active);

  const runAutoFix = () => {
    setAutoFixed(prev => ({ ...prev, [selectedRoomId]: true }));
    setItineraryGlow(true);
    setTimeout(() => setItineraryGlow(false), 1500);
  };

  if (view === 'simulator') {
    return (
      <WhatIfSimulatorScreen
        topColor={topColor}
        bottomColor={bottomColor}
        onBack={() => setView('pivot')}
        onApplyPlan={() => {
          setAutoFixed(prev => ({ ...prev, [selectedRoomId]: true }));
          setView('pivot');
        }}
      />
    );
  }

  return (
    <LinearGradient
      colors={[topColor, '#8EAFD2', bottomColor]}
      locations={[0, 0.46, 1]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable onPress={onNavigateHome} style={({ pressed }) => [styles.iconCircle, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>Self-Healing Pivot</Text>
        <Pressable
          onPress={() => {
            setAutoFixed({});
            setRoomMenuOpen(false);
          }}
          style={({ pressed }) => [styles.iconCircle, pressed && styles.pressed]}
        >
          <Ionicons name="refresh-outline" size={19} color="#0f172a" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Travel Room</Text>
          <Pressable onPress={() => setRoomMenuOpen(true)} style={styles.roomTrigger}>
            <View style={styles.roomTriggerLeft}>
              <Text style={styles.roomEmoji}>{selectedRoom.emoji}</Text>
              <View>
                <Text style={styles.roomName}>{selectedRoom.name}</Text>
                <Text style={styles.roomCity}>{selectedRoom.city}</Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={16} color="#6b7280" />
          </Pressable>
        </View>

        <View style={[styles.card, itineraryGlow && styles.cardGlow]}>
          <View style={styles.tripHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tripTitle}>{selectedRoom.destination}</Text>
              <Text style={styles.tripDate}>{selectedRoom.dateRange}</Text>
            </View>
            <View style={styles.membersBadge}>
              <Text style={styles.membersText}>👥 {selectedRoom.members} members</Text>
            </View>
          </View>

          {isFixed ? (
            <>
              <View style={styles.optimizedPill}>
                <Text style={styles.optimizedPillText}>✨  AI Plan Optimized</Text>
              </View>

              <View style={[styles.planBlock, styles.oldPlan]}>
                <Text style={styles.oldPlanLabel}>PREVIOUS PLAN (DISRUPTED)</Text>
                {selectedRoom.comparison.old.map(item => (
                  <View key={`old-${item.date}`} style={styles.planItem}>
                    <Text style={styles.oldPlanText}>
                      {item.date} - {item.label}
                    </Text>
                    <Text style={styles.statusIcon}>
                      {item.status === 'cancelled' ? '❌ Cancelled' : '🟢'}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.aiArrow}>
                <View style={styles.aiLine} />
                <Text style={styles.aiArrowText}>AI Re-routed</Text>
                <View style={styles.aiLine} />
              </View>

              <View style={[styles.planBlock, styles.newPlan]}>
                <Text style={styles.newPlanLabel}>UPDATED PLAN (OPTIMAL)</Text>
                {selectedRoom.comparison.next.map(item => (
                  <View key={`new-${item.date}`} style={styles.planItem}>
                    <Text style={styles.newPlanText}>
                      {item.date} - {item.label}
                    </Text>
                    <Text style={styles.newCheck}>✅</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            selectedRoom.days.map(day => {
              const key = `${selectedRoomId}-${day.date}`;
              const open = expandedDay === key;
              return (
                <View key={day.date}>
                  <Pressable
                    onPress={() => setExpandedDay(open ? null : key)}
                    style={styles.itineraryItem}
                  >
                    <Text style={styles.dayDate}>{day.date}</Text>
                    <Text style={styles.dayLabel}>{day.label}</Text>
                    <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#6b7280" />
                  </Pressable>
                  {open
                    ? day.activities.map((act, idx) => (
                        <View key={idx} style={styles.activityRow}>
                          <Text style={styles.activityTime}>{act.time}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.activityPlace}>{act.place}</Text>
                            {act.note ? <Text style={styles.activityNote}>{act.note}</Text> : null}
                          </View>
                        </View>
                      ))
                    : null}
                </View>
              );
            })
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.healthHeader}>
            <Text style={styles.cardTitle}>Trip Health Score</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isOptimal ? '#d1fae5' : isLow ? '#fee2e2' : '#fef3c7' },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: healthColor }]}>
                {isOptimal ? '🟢 OPTIMAL' : isLow ? '🔴 CRITICAL' : '🟠 AT RISK'}
              </Text>
            </View>
          </View>

          <View style={styles.scoreRow}>
            <View style={[styles.scoreCircle, { borderColor: healthColor }]}>
              <Text style={[styles.scoreNumber, { color: healthColor }]}>{tripHealthScore}</Text>
              <Text style={styles.scoreTotal}>/ 100</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.breakdownTitle}>Active Disruptions:</Text>
              {isFixed || activeConditions.length === 0 ? (
                <>
                  <Text style={styles.noDisruption}>✔ No active disruptions</Text>
                  {isFixed ? (
                    <Text style={styles.noDisruptionSub}>Plan successfully adjusted for weather and traffic.</Text>
                  ) : null}
                </>
              ) : (
                activeConditions.map(c => (
                  <View key={c.id} style={styles.disruptionItem}>
                    <Text style={styles.disruptionLabel}>
                      {disruptionIcon(c.icon)} {c.label}:
                    </Text>
                    <Text style={styles.disruptionImpact}>{c.impactScore}</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>High (80-100)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Med (50-79)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Low (0-49)</Text>
            </View>
          </View>

          {isLow && !isFixed ? (
            <View style={styles.suggestionBox}>
              <Text style={styles.suggestionText}>
                ⚠️ Your trip score is <Text style={{ fontWeight: '700' }}>Low</Text>. The AI suggests adjusting your
                itinerary to avoid the heavy rain and flight delays.
              </Text>
              <Pressable onPress={runAutoFix} style={({ pressed }) => [styles.autoFixBtn, pressed && styles.pressed]}>
                <Text style={styles.autoFixText}>⚡  Auto-Fix Plan</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <Pressable onPress={() => setView('simulator')} style={styles.whatIfEntry}>
          <View>
            <Text style={styles.whatIfTitle}>What-If Simulator</Text>
            <Text style={styles.whatIfSub}>Try other disruption conditions</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#1e3a8a" />
        </Pressable>
      </ScrollView>

      <Modal visible={roomMenuOpen} transparent animationType="fade">
        <Pressable style={styles.menuBackdrop} onPress={() => setRoomMenuOpen(false)}>
          <View style={styles.menuCard}>
            <Text style={styles.cardTitle}>Select Travel Room</Text>
            {ROOMS.map(room => (
              <Pressable
                key={room.id}
                onPress={() => {
                  setSelectedRoomId(room.id);
                  setRoomMenuOpen(false);
                  setExpandedDay(null);
                }}
                style={[styles.menuRow, selectedRoomId === room.id && styles.menuRowActive]}
              >
                <Text style={styles.roomEmoji}>{room.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomCity}>{room.city}</Text>
                </View>
                {selectedRoomId === room.id ? <Ionicons name="checkmark" size={18} color="#3b82f6" /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: { opacity: 0.75 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardGlow: {
    shadowColor: '#10b981',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  roomTrigger: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomTriggerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roomEmoji: { fontSize: 24 },
  roomName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  roomCity: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  tripTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  tripDate: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  membersBadge: {
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  membersText: { fontSize: 12, fontWeight: '500', color: '#3b82f6' },
  itineraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  dayDate: { fontSize: 14, fontWeight: '600', color: '#1f2937', width: 64 },
  dayLabel: { flex: 1, fontSize: 14, color: '#1f2937' },
  activityRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  activityTime: { fontSize: 11, color: '#6b7280', fontWeight: '600', width: 72, paddingTop: 2 },
  activityPlace: { fontSize: 12, fontWeight: '600', color: '#1f2937' },
  activityNote: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  optimizedPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  optimizedPillText: { fontSize: 14, fontWeight: '700', color: '#10b981' },
  planBlock: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  oldPlan: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  newPlan: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  oldPlanLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  newPlanLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  planItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  oldPlanText: { fontSize: 13, color: '#6b7280', textDecorationLine: 'line-through' },
  newPlanText: { fontSize: 13, color: '#065f46', fontWeight: '500' },
  statusIcon: { fontSize: 12, color: '#ef4444' },
  newCheck: { fontSize: 14, color: '#10b981' },
  aiArrow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  aiArrowText: { fontSize: 12, fontWeight: '600', color: '#9ca3af' },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 12 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 8 },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: { fontSize: 28, fontWeight: '700', lineHeight: 30 },
  scoreTotal: { fontSize: 12, color: '#6b7280' },
  breakdownTitle: { fontSize: 13, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  disruptionItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  disruptionLabel: { fontSize: 13, color: '#1f2937', flex: 1, paddingRight: 8 },
  disruptionImpact: { fontSize: 13, fontWeight: '600', color: '#ef4444' },
  noDisruption: { fontSize: 13, color: '#10b981' },
  noDisruptionSub: { fontSize: 12, color: '#10b981', marginTop: 4 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '500', color: '#6b7280' },
  suggestionBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 10,
    gap: 8,
  },
  suggestionText: { fontSize: 12, color: '#92400e', lineHeight: 18 },
  autoFixBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  autoFixText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  whatIfEntry: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  whatIfTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  whatIfSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  menuRowActive: { backgroundColor: '#eff6ff' },
});
