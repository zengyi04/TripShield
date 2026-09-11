import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { APP_GRADIENT_LOCATIONS, screenGradientStops } from '../../utils/appTheme';
import { HeaderBackButton, ScreenTopBar } from '../ScreenTopBar';

export interface GlobalCondition {
  id: string;
  name: string;
  emoji: string;
  title: string;
  detail: string;
  category: 'weather' | 'transport' | 'health' | 'tech' | 'personal';
}

const GLOBAL_CONDITIONS: GlobalCondition[] = [
  {
    id: 'typhoon',
    name: 'Typhoon',
    emoji: '🌪️',
    title: 'Typhoon / Hurricane',
    detail: 'Severe wind and rain. All flights and outdoor activities cancelled.',
    category: 'weather',
  },
  {
    id: 'heatwave',
    name: 'Extreme Heatwave',
    emoji: '🔥',
    title: 'Extreme Heatwave',
    detail: 'Temperature exceeds 40°C. Outdoor tours suspended.',
    category: 'weather',
  },
  {
    id: 'flight',
    name: 'Flight Cancellation',
    emoji: '✈️',
    title: 'Flight Cancellation',
    detail: 'Airline cancels route. Requires immediate rebooking.',
    category: 'transport',
  },
  {
    id: 'strike',
    name: 'Transport Strike',
    emoji: '🚆',
    title: 'Public Transport Strike',
    detail: 'Subway and bus networks shut down. Taxis unavailable.',
    category: 'transport',
  },
  {
    id: 'medical',
    name: 'Medical Emergency',
    emoji: '🏥',
    title: 'Medical Emergency',
    detail: 'Traveler requires immediate hospitalization or clinic visit.',
    category: 'health',
  },
  {
    id: 'passport',
    name: 'Lost Passport',
    emoji: '🛂',
    title: 'Lost Passport',
    detail: 'Traveler loses identification. Requires embassy visit.',
    category: 'health',
  },
  {
    id: 'cyber',
    name: 'Cyber Attack',
    emoji: '💻',
    title: 'Cyber Attack',
    detail: 'Hotel or airline systems down. Digital bookings inaccessible.',
    category: 'tech',
  },
  {
    id: 'hotel',
    name: 'Hotel Overbooking',
    emoji: '🏨',
    title: 'Hotel Overbooking',
    detail: 'No rooms available upon arrival. Requires relocation.',
    category: 'personal',
  },
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'weather', label: 'Weather & Nature' },
  { value: 'transport', label: 'Transport & Traffic' },
  { value: 'health', label: 'Health & Safety' },
  { value: 'tech', label: 'Technology & Infrastructure' },
  { value: 'personal', label: 'Personal & Logistics' },
];

const ACTION_PLAN: Record<string, string> = {
  Typhoon: 'All outdoor activities replaced with indoor alternatives.',
  'Extreme Heatwave': 'All outdoor activities replaced with indoor alternatives.',
  'Flight Cancellation': 'Flight rebooked to next available carrier. Added buffer time.',
  'Transport Strike': 'Private car service booked for all transfers.',
  'Medical Emergency': 'Nearest international hospital mapped. Schedule cleared for 24 hours.',
  'Lost Passport': 'Embassy appointment scheduled.',
  'Cyber Attack': 'Offline backup of all reservations generated.',
  'Hotel Overbooking': 'Alternative 5-star accommodation secured.',
};

interface WhatIfSimulatorScreenProps {
  topColor: string;
  bottomColor: string;
  onBack: () => void;
  onApplyPlan?: () => void;
}

export const WhatIfSimulatorScreen: React.FC<WhatIfSimulatorScreenProps> = ({
  topColor,
  bottomColor,
  onBack,
  onApplyPlan,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [simOpen, setSimOpen] = useState(false);
  const [simReady, setSimReady] = useState(false);
  const [simError, setSimError] = useState(false);

  const selectedNames = useMemo(
    () => GLOBAL_CONDITIONS.filter(c => selected[c.id]).map(c => c.name),
    [selected],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return GLOBAL_CONDITIONS.filter(item => {
      const matchesCategory = category === 'all' || item.category === category;
      const hay = `${item.title} ${item.detail} ${item.name}`.toLowerCase();
      const matchesSearch = !term || hay.includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const toggle = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setCategoryMenuOpen(false);
  };

  const runSimulation = () => {
    if (selectedNames.length === 0) {
      setSimError(true);
      setTimeout(() => setSimError(false), 2200);
      return;
    }
    setSimReady(false);
    setSimOpen(true);
    setTimeout(() => setSimReady(true), 1500);
  };

  const uniqueActions = useMemo(() => {
    const actions: string[] = [];
    selectedNames.forEach(name => {
      const action = ACTION_PLAN[name];
      if (action && !actions.includes(action)) actions.push(action);
    });
    return actions;
  }, [selectedNames]);

  const categoryLabel = CATEGORIES.find(c => c.value === category)?.label ?? 'All Categories';

  return (
    <LinearGradient
      colors={screenGradientStops(topColor, bottomColor)}
      locations={APP_GRADIENT_LOCATIONS}
      style={styles.container}
    >
      <ScreenTopBar
        title="What-If"
        subtitle="Try disruption scenarios"
        left={<HeaderBackButton onPress={onBack} />}
      />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Simulation Setup</Text>
          <Text style={styles.setupCopy}>
            Select the travel disruptions you want to simulate. The AI will generate a contingency plan.
          </Text>

          <Pressable onPress={() => setSheetOpen(true)} style={styles.dropdownTrigger}>
            <View style={styles.triggerLeft}>
              <Text style={styles.plus}>＋</Text>
              <Text style={styles.triggerText}>Select Disruption Conditions</Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#6b7280" />
          </Pressable>

          <View style={styles.previewRow}>
            {selectedNames.length === 0 ? (
              <Text style={styles.emptyPreview}>No conditions selected yet.</Text>
            ) : (
              selectedNames.map(name => (
                <View key={name} style={styles.previewTag}>
                  <Text style={styles.previewTagText}>{name}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {simError ? (
          <Text style={styles.errorHint}>Please select at least one condition to run the simulation.</Text>
        ) : null}

        <View style={styles.footerSpacer} />
        <Pressable onPress={runSimulation} style={({ pressed }) => [styles.simulateBtn, pressed && styles.pressed]}>
          <Ionicons name="sparkles-outline" size={18} color="#fff" />
          <Text style={styles.simulateText}>Run AI Simulation</Text>
        </Pressable>
      </View>

      <Modal visible={sheetOpen} transparent animationType="slide">
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={closeSheet} />
          <View style={styles.sheetPanel}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Global Conditions Library</Text>
              <Pressable onPress={closeSheet} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.searchSection}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search conditions (e.g., Typhoon, Strike)..."
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
              />
              <Pressable onPress={() => setCategoryMenuOpen(open => !open)} style={styles.categorySelect}>
                <Text style={styles.categorySelectText}>{categoryLabel}</Text>
                <Ionicons name={categoryMenuOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#6b7280" />
              </Pressable>
              {categoryMenuOpen ? (
                <View style={styles.categoryMenu}>
                  {CATEGORIES.map(opt => (
                    <Pressable
                      key={opt.value}
                      onPress={() => {
                        setCategory(opt.value);
                        setCategoryMenuOpen(false);
                      }}
                      style={[styles.categoryOption, category === opt.value && styles.categoryOptionActive]}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          category === opt.value && styles.categoryOptionTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            <ScrollView style={styles.conditionList} showsVerticalScrollIndicator={false}>
              {filtered.map(item => {
                const on = !!selected[item.id];
                return (
                  <View key={item.id} style={styles.conditionItem}>
                    <View style={styles.conditionInfo}>
                      <Text style={styles.conditionTitle}>
                        {item.emoji} {item.title}
                      </Text>
                      <Text style={styles.conditionDetail}>{item.detail}</Text>
                    </View>
                    <Pressable
                      onPress={() => toggle(item.id)}
                      style={[styles.switchTrack, on && styles.switchTrackOn]}
                    >
                      <View style={[styles.switchKnob, on && styles.switchKnobOn]} />
                    </Pressable>
                  </View>
                );
              })}
              {filtered.length === 0 ? (
                <Text style={styles.emptyList}>No conditions match your search.</Text>
              ) : null}
            </ScrollView>

            <View style={styles.sheetFooter}>
              <Pressable onPress={closeSheet} style={styles.doneBtn}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={simOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSimOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Pressable
              onPress={() => setSimOpen(false)}
              style={({ pressed }) => [styles.modalCloseBtn, pressed && styles.pressed]}
              accessibilityLabel="Close simulation"
            >
              <Ionicons name="close" size={22} color="#374151" />
            </Pressable>
            <Text style={styles.modalIcon}>✨</Text>
            <Text style={styles.modalTitle}>AI Simulation Complete</Text>
            {!simReady ? (
              <Text style={styles.modalBody}>
                Analyzing selected conditions...{'\n\n'}⏳ Generating optimal plan...
              </Text>
            ) : (
              <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalStrong}>Active Conditions:</Text>
                {selectedNames.map(name => (
                  <Text key={name} style={styles.modalLine}>
                    • {name}
                  </Text>
                ))}
                <Text style={[styles.modalStrong, { marginTop: 12 }]}>AI Action Plan:</Text>
                {uniqueActions.map((action, idx) => (
                  <Text key={action} style={styles.modalLine}>
                    {idx + 1}. {action}
                  </Text>
                ))}
                <Text style={styles.modalFoot}>Trip Health Score adjusted to 85/100 (Optimal).</Text>
              </ScrollView>
            )}
            <Pressable
              onPress={() => {
                setSimOpen(false);
                if (simReady) onApplyPlan?.();
              }}
              style={styles.modalBtn}
            >
              <Text style={styles.modalBtnText}>View New Itinerary</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: { opacity: 0.75 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  setupCopy: { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 16 },
  dropdownTrigger: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  plus: { fontSize: 16, color: '#1f2937', fontWeight: '600' },
  triggerText: { fontSize: 15, fontWeight: '500', color: '#1f2937' },
  previewRow: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emptyPreview: { fontSize: 12, color: '#6b7280', fontStyle: 'italic' },
  previewTag: {
    backgroundColor: '#e0e7ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewTagText: { fontSize: 11, fontWeight: '500', color: '#3b82f6' },
  errorHint: { marginTop: 10, fontSize: 12, color: '#ef4444', fontWeight: '600' },
  footerSpacer: { flex: 1 },
  simulateBtn: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  simulateText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetPanel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  sheetHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 16, color: '#374151' },
  searchSection: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 10,
  },
  categorySelect: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySelectText: { fontSize: 14, color: '#1f2937' },
  categoryMenu: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  categoryOption: { paddingHorizontal: 14, paddingVertical: 10 },
  categoryOptionActive: { backgroundColor: '#eff6ff' },
  categoryOptionText: { fontSize: 14, color: '#374151' },
  categoryOptionTextActive: { color: '#2563eb', fontWeight: '700' },
  conditionList: { flex: 1, paddingHorizontal: 16 },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 10,
  },
  conditionInfo: { flex: 1 },
  conditionTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  conditionDetail: { fontSize: 12, color: '#6b7280', lineHeight: 16 },
  switchTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  switchTrackOn: { backgroundColor: '#3b82f6' },
  switchKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  switchKnobOn: { alignSelf: 'flex-end' },
  emptyList: { textAlign: 'center', color: '#6b7280', paddingVertical: 24, fontSize: 13 },
  sheetFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  doneBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    paddingTop: 20,
    maxHeight: '80%',
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  modalIcon: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', textAlign: 'center', marginBottom: 12 },
  modalBody: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 16 },
  modalBodyScroll: { maxHeight: 280, marginBottom: 16 },
  modalStrong: { fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 6 },
  modalLine: { fontSize: 13, color: '#4b5563', lineHeight: 20 },
  modalFoot: { marginTop: 12, fontSize: 13, fontStyle: 'italic', color: '#6b7280' },
  modalBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
