import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ActiveScreen } from '../../types';
import { WhatIfSimulatorScreen } from './WhatIfSimulatorScreen';
import { ROOMS, type TripActivity, type TripDay } from '../../data/tripRooms';
import { fetchPlaceWeather, type WeatherSnapshot } from '../../utils/weather';
import { resolvePlacePreviewUrl } from '../../utils/mapPreview';
import { RouteMapPreview } from '../RouteMapPreview';
import {
  APP_COLORS,
  APP_GRADIENT_LOCATIONS,
  APP_TYPO,
  screenGradientStops,
} from '../../utils/appTheme';
import { appThemeStyles } from '../../utils/appThemeStyles';
import { HeaderBackButton, HeaderIconButton, ScreenTopBar } from '../ScreenTopBar';

interface SelfHealingScreenProps {
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
  onNavigateHome: () => void;
  onNavigate?: (screen: ActiveScreen) => void;
  onHealthChange?: (score: number) => void;
}

export const LOW_TRIP_HEALTH = 50;

let savedAutoFixed: Record<string, boolean> = {};
let savedRoomId = 'room-1';

export function computeTripHealthScore(
  roomId: string = savedRoomId,
  autoFixed: Record<string, boolean> = savedAutoFixed,
) {
  const room = ROOMS.find(r => r.id === roomId);
  if (!room) return 100;
  if (autoFixed[roomId]) return 85;
  const totalPenalty = room.conditions
    .filter(c => c.active)
    .reduce((sum, c) => sum + c.impactScore, 0);
  return Math.max(0, Math.min(100, room.baseScore + totalPenalty));
}

const disruptionIcon = (icon: string) => {
  if (icon === 'airplane') return '✈️';
  if (icon === 'rainy' || icon === 'thunderstorm') return '🌧️';
  if (icon === 'ticket') return '🎟️';
  if (icon === 'water') return '🌊';
  return '⚠️';
};

const modeLabel: Record<string, string> = {
  walk: 'Walk',
  metro: 'Subway',
  bus: 'Bus',
  taxi: 'Taxi',
  flight: 'Flight',
  ferry: 'Ferry',
  rail: 'Rail',
};

export const SelfHealingScreen: React.FC<SelfHealingScreenProps> = ({
  topColor,
  bottomColor,
  onNavigateHome,
  onHealthChange,
}) => {
  const [view, setView] = useState<'pivot' | 'simulator'>('pivot');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(savedRoomId);
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const [autoFixed, setAutoFixed] = useState<Record<string, boolean>>(() => ({ ...savedAutoFixed }));
  const [mediumKeptOriginal, setMediumKeptOriginal] = useState<Record<string, boolean>>({});
  const [mediumAwaitingConfirm, setMediumAwaitingConfirm] = useState<Record<string, boolean>>({});
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [itineraryGlow, setItineraryGlow] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [weatherTarget, setWeatherTarget] = useState<{
    activity: TripActivity;
    day: TripDay;
    weather: WeatherSnapshot;
    loading: boolean;
  } | null>(null);
  const [routeTarget, setRouteTarget] = useState<{ activity: TripActivity; day: TripDay } | null>(null);

  useEffect(() => {
    savedAutoFixed = autoFixed;
    savedRoomId = selectedRoomId;
  }, [autoFixed, selectedRoomId]);

  useEffect(() => {
    onHealthChange?.(computeTripHealthScore(selectedRoomId, autoFixed));
  }, [autoFixed, selectedRoomId, onHealthChange]);

  const selectedRoom = ROOMS.find(r => r.id === selectedRoomId)!;
  const isFixed = !!autoFixed[selectedRoomId];
  const visibleDays = isFixed ? selectedRoom.optimizedDays : selectedRoom.days;

  useEffect(() => {
    const days = isFixed ? selectedRoom.optimizedDays : selectedRoom.days;
    const prefix = isFixed ? 'new' : 'live';
    const first = days[0];
    if (first) {
      setExpandedDay(`${selectedRoomId}-${prefix}-${first.date}`);
    }
  }, [selectedRoomId, isFixed, selectedRoom.optimizedDays, selectedRoom.days]);

  const tripHealthScore = useMemo(
    () => computeTripHealthScore(selectedRoomId, autoFixed),
    [selectedRoomId, autoFixed],
  );
  const getHealthColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };
  const healthColor = getHealthColor(tripHealthScore);
  const isLow = tripHealthScore < LOW_TRIP_HEALTH;
  const isOptimal = tripHealthScore >= 80;
  const isMedium = !isFixed && !isLow && !isOptimal;
  const keptOriginalPlan = !!mediumKeptOriginal[selectedRoomId];
  const awaitingMediumConfirm = !!mediumAwaitingConfirm[selectedRoomId];
  const activeConditions = selectedRoom.conditions.filter(c => c.active);

  const runAutoFix = () => {
    setAutoFixed(prev => ({ ...prev, [selectedRoomId]: true }));
    setItineraryGlow(true);
    setExpandedDay(`${selectedRoomId}-new-${selectedRoom.optimizedDays[0]?.date}`);
    setTimeout(() => setItineraryGlow(false), 1500);
  };

  const applyMediumReplacement = () => {
    runAutoFix();
    setMediumAwaitingConfirm(prev => ({ ...prev, [selectedRoomId]: true }));
    setMediumKeptOriginal(prev => ({ ...prev, [selectedRoomId]: false }));
  };

  const keepCurrentPlan = () => {
    setMediumKeptOriginal(prev => ({ ...prev, [selectedRoomId]: true }));
    setMediumAwaitingConfirm(prev => ({ ...prev, [selectedRoomId]: false }));
  };

  const revertToPreviousPlan = () => {
    setAutoFixed(prev => ({ ...prev, [selectedRoomId]: false }));
    setMediumAwaitingConfirm(prev => ({ ...prev, [selectedRoomId]: false }));
    setExpandedDay(null);
  };

  const confirmOptimizedPlan = () => {
    setMediumAwaitingConfirm(prev => ({ ...prev, [selectedRoomId]: false }));
  };

  const openWeather = async (activity: TripActivity, day: TripDay) => {
    setWeatherTarget({ activity, day, weather: activity.weather, loading: true });
    const live = await fetchPlaceWeather(
      activity.lat,
      activity.lng,
      day.isoDate,
      activity.time,
      selectedRoom.timezone,
      activity.weather,
    );
    setWeatherTarget({ activity, day, weather: live, loading: false });
  };

  const openMaps = (url: string) => {
    Linking.openURL(url).catch(() => undefined);
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

  const renderActivity = (act: TripActivity, day: TripDay, muted = false) => (
    <View key={`${day.date}-${act.time}-${act.place}`} style={[styles.activityCard, muted && styles.activityMuted]}>
      <View style={styles.activityTop}>
        <Text style={styles.activityTime}>{act.time}</Text>
        <Pressable onPress={() => openWeather(act, day)} style={styles.weatherChip} hitSlop={8}>
          <Text style={styles.weatherEmoji}>{act.weather.emoji}</Text>
        </Pressable>
      </View>
      <Text style={[styles.activityPlace, muted && styles.strike]}>{act.place}</Text>
      {act.note ? <Text style={styles.activityNote}>{act.note}</Text> : null}
      <Text style={styles.activityMeta}>
        {day.weekday} · {day.date} · {act.time}
      </Text>
      <View style={styles.activityActions}>
        <Pressable onPress={() => setRouteTarget({ activity: act, day })} style={styles.miniBtn}>
          <Ionicons name="map-outline" size={13} color="#1e3a8a" />
          <Text style={styles.miniBtnText}>Route</Text>
        </Pressable>
        <Pressable onPress={() => openMaps(act.route.mapsUrl)} style={styles.miniBtn}>
          <Ionicons name="navigate" size={13} color="#1e3a8a" />
          <Text style={styles.miniBtnText}>Google Maps</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderDayBlock = (day: TripDay, prefix: string, muted = false) => {
    const key = `${selectedRoomId}-${prefix}-${day.date}`;
    const open = expandedDay === key;
    return (
      <View key={key}>
        <Pressable onPress={() => setExpandedDay(open ? null : key)} style={styles.itineraryItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dayDate}>
              {day.date} · {day.weekday}
            </Text>
            <Text style={styles.dayLabel}>{day.label}</Text>
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#6b7280" />
        </Pressable>
        {open ? day.activities.map(act => renderActivity(act, day, muted)) : null}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={screenGradientStops(topColor, bottomColor)}
      locations={APP_GRADIENT_LOCATIONS}
      style={styles.container}
    >
      <ScreenTopBar
        title="Self-Healing Pivot"
        left={onNavigateHome ? <HeaderBackButton onPress={onNavigateHome} /> : undefined}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={appThemeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[appThemeStyles.card, styles.healthCard]}>
          <Text style={appThemeStyles.sectionEyebrow}>Step 1 · Trip health</Text>
          <View style={styles.healthHeader}>
            <Text style={styles.healthCardTitle}>Trip Health Score</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isOptimal ? '#d1fae5' : isLow ? '#fee2e2' : '#fef3c7' },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: healthColor }]} />
              <Text style={[styles.statusBadgeText, { color: healthColor }]}>
                {isOptimal ? 'High' : isLow ? 'Low' : 'Medium'}
              </Text>
            </View>
          </View>
          <Text style={styles.monitorTag}>OpenWeather · Google Maps live monitor</Text>

          <View style={styles.scoreRow}>
            <View style={[styles.scoreCircle, { borderColor: healthColor }]}>
              <Text style={[styles.scoreNumber, { color: healthColor }]}>{tripHealthScore}</Text>
              <Text style={styles.scoreTotal}>/ 100</Text>
            </View>
            <View style={styles.disruptionPanel}>
              <Text style={styles.breakdownTitle}>Active disruptions</Text>
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
                      {disruptionIcon(c.icon)} {c.label}
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
              <Text style={styles.legendText}>High (80–100)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Med (50–79)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Low (0–49)</Text>
            </View>
          </View>

          {isLow && !isFixed ? (
            <View style={styles.suggestionBox}>
              <Text style={styles.suggestionText}>
                ⚠️ Your trip score is <Text style={{ fontWeight: '700' }}>Low</Text>. The AI suggests adjusting your
                itinerary to avoid the heavy rain and flight delays.
              </Text>
              <Pressable onPress={runAutoFix} style={({ pressed }) => [styles.autoFixBtn, pressed && styles.pressed]}>
                <Text style={styles.autoFixText}>⚡ Auto-Fix Plan</Text>
              </Pressable>
            </View>
          ) : null}

          {isMedium && !keptOriginalPlan ? (
            <View style={[styles.suggestionBox, styles.mediumSuggestionBox]}>
              <Text style={styles.mediumSuggestionText}>
                Your trip score is <Text style={{ fontWeight: '700' }}>Medium</Text>. Minor disruptions are building
                up — you can keep your current plan or let TripShield suggest a stronger replacement itinerary.
              </Text>
              <View style={styles.mediumActionRow}>
                <Pressable
                  onPress={applyMediumReplacement}
                  style={({ pressed }) => [styles.mediumPrimaryBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.mediumPrimaryBtnText}>Change plan</Text>
                </Pressable>
                <Pressable
                  onPress={keepCurrentPlan}
                  style={({ pressed }) => [styles.mediumSecondaryBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.mediumSecondaryBtnText}>Don&apos;t change plan</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {isMedium && keptOriginalPlan ? (
            <View style={styles.keptPlanBox}>
              <Text style={styles.keptPlanText}>
                ✓ You chose to keep your current plan. We&apos;ll keep monitoring OpenWeather and Google Maps.
              </Text>
              <Pressable
                onPress={() => setMediumKeptOriginal(prev => ({ ...prev, [selectedRoomId]: false }))}
                style={({ pressed }) => [styles.mediumLinkBtn, pressed && styles.pressed]}
              >
                <Text style={styles.mediumLinkBtnText}>Review replacement plan anyway</Text>
              </Pressable>
            </View>
          ) : null}

          {isFixed && awaitingMediumConfirm ? (
            <View style={[styles.suggestionBox, styles.mediumConfirmBox]}>
              <Text style={styles.mediumSuggestionText}>
                Review the updated itinerary below. Keep the optimized plan or revert to your previous one anytime.
              </Text>
              <View style={styles.mediumActionRow}>
                <Pressable
                  onPress={confirmOptimizedPlan}
                  style={({ pressed }) => [styles.mediumPrimaryBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.mediumPrimaryBtnText}>Keep optimized plan</Text>
                </Pressable>
                <Pressable
                  onPress={revertToPreviousPlan}
                  style={({ pressed }) => [styles.mediumSecondaryBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.mediumSecondaryBtnText}>Revert plan</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>

        <View style={appThemeStyles.card}>
          <Text style={appThemeStyles.sectionEyebrow}>Step 2 · Travel room</Text>
          <Text style={appThemeStyles.cardTitle}>Select travel room</Text>
          <Pressable onPress={() => setRoomMenuOpen(true)} style={styles.roomTrigger}>
            <View style={styles.roomTriggerLeft}>
              <Text style={styles.roomEmoji}>{selectedRoom.emoji}</Text>
              <View>
                <Text style={styles.roomName}>{selectedRoom.name}</Text>
                <Text style={styles.roomCity}>{selectedRoom.city}</Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={16} color={APP_COLORS.textMuted} />
          </Pressable>
        </View>

        <View style={[appThemeStyles.card, itineraryGlow && styles.cardGlow]}>
          <Text style={appThemeStyles.sectionEyebrow}>Step 3 · Itinerary</Text>
          <View style={styles.tripHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tripTitle}>{selectedRoom.destination}</Text>
              <Text style={styles.tripDate}>{selectedRoom.dateRange}</Text>
            </View>
            <View style={styles.membersBadge}>
              <Text style={styles.membersText}>👥 {selectedRoom.members} members</Text>
            </View>
          </View>

          <Pressable onPress={() => setPlanModalOpen(true)} style={styles.fullPlanBtn}>
            <Ionicons name="newspaper-outline" size={16} color={APP_COLORS.accentDark} />
            <Text style={styles.fullPlanBtnText}>Open full detailed plan</Text>
          </Pressable>

          {isFixed ? (
            <>
              <View style={styles.optimizedPill}>
                <Text style={styles.optimizedPillText}>✨ AI plan optimized</Text>
              </View>
              <Text style={styles.compareHint}>
                Expand each day to compare old vs new stops. Tap weather icons for live conditions.
              </Text>
              <View style={[styles.planBlock, styles.oldPlan]}>
                <Text style={styles.oldPlanLabel}>Previous plan (disrupted)</Text>
                {selectedRoom.days.map(day => renderDayBlock(day, 'old', true))}
              </View>
              <View style={styles.aiArrow}>
                <View style={styles.aiLine} />
                <Text style={styles.aiArrowText}>AI re-routed</Text>
                <View style={styles.aiLine} />
              </View>
              <View style={[styles.planBlock, styles.newPlan]}>
                <Text style={styles.newPlanLabel}>Updated plan (optimal)</Text>
                {selectedRoom.optimizedDays.map(day => renderDayBlock(day, 'new'))}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.compareHint}>Tap a day to expand activities, routes, and weather.</Text>
              {selectedRoom.days.map(day => renderDayBlock(day, 'live'))}
            </>
          )}
        </View>

        <Pressable onPress={() => setView('simulator')} style={[appThemeStyles.card, styles.whatIfEntry]}>
          <View>
            <Text style={styles.whatIfTitle}>What-If Simulator</Text>
            <Text style={styles.whatIfSub}>Try other disruption conditions</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={APP_COLORS.accentDark} />
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

      <Modal visible={planModalOpen} transparent animationType="slide">
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setPlanModalOpen(false)} />
          <View style={styles.planSheet}>
            <View style={styles.planSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.planSheetKicker}>{isFixed ? 'Updated full plan' : 'Room itinerary'}</Text>
                <Text style={styles.planSheetTitle}>{selectedRoom.destination}</Text>
                <Text style={styles.planSheetSub}>
                  {selectedRoom.dateRange} · {selectedRoom.city}
                </Text>
              </View>
              <Pressable onPress={() => setPlanModalOpen(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.planSheetBody} showsVerticalScrollIndicator={false}>
              {visibleDays.map(day => (
                <View key={`full-${day.isoDate}`} style={styles.fullDayCard}>
                  <Text style={styles.fullDayTitle}>
                    {day.weekday}, {day.date} · {day.label}
                  </Text>
                  {day.activities.map(act => (
                    <View key={`full-${act.time}-${act.place}`} style={styles.fullStop}>
                      <View style={styles.fullStopHead}>
                        <Text style={styles.fullStopTime}>{act.time}</Text>
                        <Pressable onPress={() => openWeather(act, day)}>
                          <Text style={styles.weatherEmoji}>{act.weather.emoji}</Text>
                        </Pressable>
                      </View>
                      <Text style={styles.activityPlace}>{act.place}</Text>
                      <Text style={styles.activityNote}>{act.address}</Text>
                      <Text style={styles.routeSummary}>{act.route.summary}</Text>
                      {act.route.legs.map((leg, idx) => (
                        <Text key={idx} style={styles.legLine}>
                          {idx + 1}. {modeLabel[leg.mode]}
                          {leg.line ? ` · ${leg.line}` : ''} — {leg.instruction} ({leg.durationMin} min)
                        </Text>
                      ))}
                      <Pressable onPress={() => openMaps(act.route.mapsUrl)} style={styles.mapsLink}>
                        <Ionicons name="navigate" size={14} color="#1d4ed8" />
                        <Text style={styles.mapsLinkText}>Open Google Maps transit route</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={!!weatherTarget} transparent animationType="fade">
        <Pressable style={styles.menuBackdrop} onPress={() => setWeatherTarget(null)}>
          <Pressable style={styles.detailModal} onPress={() => undefined}>
            {weatherTarget ? (
              <>
                <Text style={styles.detailKicker}>Place weather · {weatherTarget.weather.source}</Text>
                <Text style={styles.detailTitle}>{weatherTarget.activity.place}</Text>
                <Text style={styles.detailSub}>
                  {weatherTarget.day.weekday}, {weatherTarget.day.date} · {weatherTarget.activity.time}
                </Text>
                <Text style={styles.weatherHero}>
                  {weatherTarget.weather.emoji} {weatherTarget.loading ? 'Updating live…' : weatherTarget.weather.condition}
                </Text>
                <View style={styles.weatherGrid}>
                  <Text style={styles.weatherStat}>{weatherTarget.weather.tempC}°C</Text>
                  <Text style={styles.weatherStatLabel}>Temp</Text>
                </View>
                <Text style={styles.activityNote}>
                  Feels like {weatherTarget.weather.feelsLikeC}°C · Humidity {weatherTarget.weather.humidity}% · Wind{' '}
                  {weatherTarget.weather.windKph} km/h · Rain chance {weatherTarget.weather.precipChance}%
                </Text>
                <Text style={styles.activityNote}>{weatherTarget.activity.address}</Text>
                <Pressable onPress={() => setWeatherTarget(null)} style={styles.modalBtn}>
                  <Text style={styles.modalBtnText}>Close</Text>
                </Pressable>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!routeTarget} transparent animationType="fade">
        <Pressable style={styles.menuBackdrop} onPress={() => setRouteTarget(null)}>
          <Pressable style={styles.detailModal} onPress={() => undefined}>
            {routeTarget ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.detailKicker}>How to get there · Google Maps</Text>
                <Text style={styles.detailTitle}>{routeTarget.activity.place}</Text>
                <Text style={styles.detailSub}>
                  {routeTarget.day.weekday}, {routeTarget.day.date} · {routeTarget.activity.time}
                </Text>
                <RouteMapPreview
                  lat={routeTarget.activity.lat}
                  lng={routeTarget.activity.lng}
                  previewImageUrl={resolvePlacePreviewUrl(
                    routeTarget.activity.mapsQuery,
                    routeTarget.activity.previewImageUrl,
                  )}
                />
                <Text style={styles.routeSummary}>{routeTarget.activity.route.summary}</Text>
                <Text style={styles.activityNote}>
                  From {routeTarget.activity.route.from} · {routeTarget.activity.route.durationMin} min ·{' '}
                  {routeTarget.activity.route.fare}
                </Text>
                {routeTarget.activity.route.legs.map((leg, idx) => (
                  <View key={idx} style={styles.legCard}>
                    <Text style={styles.legBadge}>{modeLabel[leg.mode]}</Text>
                    {leg.line ? <Text style={styles.legLineName}>{leg.line}</Text> : null}
                    <Text style={styles.legLine}>{leg.instruction}</Text>
                    <Text style={styles.activityNote}>{leg.durationMin} min</Text>
                  </View>
                ))}
                <Pressable onPress={() => openMaps(routeTarget.activity.route.mapsUrl)} style={styles.modalBtn}>
                  <Text style={styles.modalBtnText}>Open in Google Maps</Text>
                </Pressable>
                <Pressable onPress={() => setRouteTarget(null)} style={styles.ghostBtn}>
                  <Text style={styles.ghostBtnText}>Close</Text>
                </Pressable>
              </ScrollView>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pressed: { opacity: 0.75 },
  scrollArea: { flex: 1 },
  healthCard: { gap: 4 },
  healthCardTitle: {
    fontSize: APP_TYPO.sectionTitle,
    fontWeight: '700',
    color: APP_COLORS.textSecondary,
    flex: 1,
  },
  disruptionPanel: { flex: 1, minWidth: 0 },
  cardGlow: {
    shadowColor: '#10b981',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: { fontSize: APP_TYPO.sectionTitle, fontWeight: '600', color: APP_COLORS.textSecondary, marginBottom: 12 },
  roomTrigger: {
    backgroundColor: APP_COLORS.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomTriggerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roomEmoji: { fontSize: 24 },
  roomName: { fontSize: APP_TYPO.bodySmall, fontWeight: '600', color: APP_COLORS.textSecondary },
  roomCity: { fontSize: APP_TYPO.caption, color: APP_COLORS.textMuted, marginTop: 1 },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  tripTitle: { fontSize: APP_TYPO.sectionTitle + 2, fontWeight: '700', color: APP_COLORS.textSecondary },
  tripDate: { fontSize: APP_TYPO.bodySmall, color: APP_COLORS.textMuted, marginTop: 4 },
  membersBadge: {
    backgroundColor: APP_COLORS.chipBg,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: APP_COLORS.chipBorder,
  },
  membersText: { fontSize: APP_TYPO.caption, fontWeight: '600', color: APP_COLORS.accent },
  fullPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: APP_COLORS.chipBorder,
    backgroundColor: APP_COLORS.chipBg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  fullPlanBtnText: { fontSize: APP_TYPO.bodySmall, fontWeight: '700', color: APP_COLORS.accentDark },
  itineraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_COLORS.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.cardBorder,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  dayDate: { fontSize: 13, fontWeight: '700', color: '#1f2937' },
  dayLabel: { flex: 1, fontSize: 13, color: '#4b5563', marginTop: 2 },
  activityCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    marginLeft: 4,
    backgroundColor: '#FFFFFF',
  },
  activityMuted: { opacity: 0.72, backgroundColor: '#F8FAFC' },
  activityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityTime: { fontSize: 11, color: '#6b7280', fontWeight: '700' },
  weatherChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherEmoji: { fontSize: 18 },
  activityPlace: { fontSize: 13, fontWeight: '700', color: '#1f2937', marginTop: 4 },
  strike: { textDecorationLine: 'line-through', color: '#6b7280' },
  activityNote: { fontSize: 11, color: '#6b7280', marginTop: 3, lineHeight: 16 },
  activityMeta: { fontSize: 10, color: '#3b82f6', fontWeight: '600', marginTop: 4 },
  activityActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  miniBtnText: { fontSize: 11, fontWeight: '700', color: '#1e3a8a' },
  optimizedPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  optimizedPillText: { fontSize: 14, fontWeight: '700', color: '#10b981' },
  compareHint: { fontSize: 11, color: '#6b7280', marginBottom: 10, lineHeight: 16 },
  planBlock: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  oldPlan: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  newPlan: {
    backgroundColor: '#ecfdf5',
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
  aiArrow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  aiArrowText: { fontSize: 12, fontWeight: '600', color: '#9ca3af' },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  monitorTag: { fontSize: APP_TYPO.micro, color: APP_COLORS.accent, fontWeight: '700', marginBottom: 8 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
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
  mediumSuggestionBox: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
  },
  mediumSuggestionText: { fontSize: 12, color: '#9a3412', lineHeight: 18 },
  mediumActionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  mediumPrimaryBtn: {
    flex: 1,
    backgroundColor: '#ea580c',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  mediumPrimaryBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  mediumSecondaryBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  mediumSecondaryBtnText: { color: '#c2410c', fontSize: 12, fontWeight: '700' },
  keptPlanBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    gap: 8,
  },
  keptPlanText: { fontSize: 12, color: '#166534', lineHeight: 18 },
  mediumLinkBtn: { alignSelf: 'flex-start' },
  mediumLinkBtnText: { fontSize: 12, fontWeight: '700', color: '#2563eb', textDecorationLine: 'underline' },
  mediumConfirmBox: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
  },
  whatIfEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  whatIfTitle: { fontSize: APP_TYPO.sectionTitle, fontWeight: '600', color: APP_COLORS.textSecondary },
  whatIfSub: { fontSize: APP_TYPO.caption, color: APP_COLORS.textMuted, marginTop: 2 },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E6EEF5',
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
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
  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  planSheet: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '88%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E6EEF5',
    shadowColor: '#0f172a',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  planSheetHeader: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  planSheetKicker: { fontSize: 10, fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' },
  planSheetTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginTop: 2 },
  planSheetSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  planSheetBody: { padding: 16, paddingBottom: 32, gap: 12 },
  fullDayCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E6EEF5',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  fullDayTitle: { fontSize: 14, fontWeight: '800', color: '#1e3a8a', marginBottom: 8 },
  fullStop: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    marginTop: 8,
  },
  fullStopHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fullStopTime: { fontSize: 12, fontWeight: '800', color: '#334155' },
  routeSummary: { fontSize: 12, color: '#334155', marginTop: 6, lineHeight: 17, fontWeight: '600' },
  legLine: { fontSize: 11, color: '#475569', marginTop: 4, lineHeight: 16 },
  mapsLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  mapsLinkText: { fontSize: 12, fontWeight: '700', color: '#1d4ed8' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 16, color: '#374151' },
  detailModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E6EEF5',
    maxHeight: '82%',
    shadowColor: '#0f172a',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  detailKicker: { fontSize: 10, fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' },
  detailTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginTop: 4 },
  detailSub: { fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 10 },
  weatherHero: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  weatherGrid: { marginBottom: 8 },
  weatherStat: { fontSize: 32, fontWeight: '900', color: '#1d4ed8' },
  weatherStatLabel: { fontSize: 11, color: '#64748b', fontWeight: '700' },
  mapPreview: { marginBottom: 0 },
  legCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  legBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  legLineName: { fontSize: 12, fontWeight: '800', color: '#1e3a8a', marginBottom: 2 },
  modalBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  modalBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  ghostBtn: { alignItems: 'center', paddingVertical: 10 },
  ghostBtnText: { color: '#64748b', fontSize: 13, fontWeight: '700' },
});
