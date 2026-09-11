import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ActiveScreen } from '../../types';
import {
  APP_COLORS,
  APP_GRADIENT_LOCATIONS,
  screenGradientStops,
} from '../../utils/appTheme';
import { appThemeStyles } from '../../utils/appThemeStyles';
import { HeaderIconButton, ScreenTopBar } from '../ScreenTopBar';
import {
  ACTIVE_BUY_WINDOWS,
  AI_PROCESSING_STEPS,
  BOOKING_OPTIONS,
  MOCK_EXTRACTED_ITEMS,
  RECENTLY_IMPORTED,
  type BuyWindow,
  type ExtractedItem,
} from '../../data/mockBuyWindow';

interface BuyWindowScreenProps {
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover?: string;
  onNavigate?: (screen: ActiveScreen) => void;
  onGoHome?: () => void;
}

function useCountdown(expiresAt: number) {
  const [remaining, setRemaining] = useState(Math.max(0, expiresAt - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, expiresAt - Date.now())), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  return { hours, minutes, expired: remaining <= 0 };
}

function BuyWindowCard({
  bw,
  onCompare,
  onReset,
}: {
  bw: BuyWindow;
  onCompare: () => void;
  onReset: () => void;
}) {
  const { hours, minutes, expired } = useCountdown(bw.expiresAt);
  return (
    <View style={styles.bwCard}>
      <View style={styles.bwTop}>
        <Text style={styles.bwStatus}>{bw.statusLabel}</Text>
        <Text style={styles.bwTimer}>{expired ? 'Expired' : `${hours}h ${minutes}m left`}</Text>
      </View>
      <Text style={styles.bwRoute}>✈️ {bw.route}</Text>
      <Text style={styles.bwPrice}>{bw.price}</Text>
      <Text style={styles.bwRef}>Ref: {bw.referenceRange}</Text>
      <View style={styles.bwActions}>
        <Pressable onPress={onCompare} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Compare deals</Text>
        </Pressable>
        <Pressable onPress={onReset} style={styles.ghostBtn}>
          <Text style={styles.ghostBtnText}>Reset timer</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function BuyWindowScreen({
  topColor,
  bottomColor,
  onNavigate,
  onGoHome,
}: BuyWindowScreenProps) {
  const [linkInput, setLinkInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [buyWindows, setBuyWindows] = useState(ACTIVE_BUY_WINDOWS);
  const [bookingWindow, setBookingWindow] = useState<BuyWindow | null>(null);

  const handleAnalyze = () => {
    if (!linkInput.trim()) {
      Alert.alert('Paste a link', 'Add a travel link to analyze.');
      return;
    }
    setAnalyzing(true);
    setExtracted([]);
    setTimeout(() => {
      setAnalyzing(false);
      const items = MOCK_EXTRACTED_ITEMS;
      setExtracted(items);
      setSelectedIds(new Set(items.filter(i => i.defaultSelected).map(i => i.id)));
    }, 2000);
  };

  const toggleItem = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <LinearGradient
      colors={screenGradientStops(topColor, bottomColor)}
      locations={APP_GRADIENT_LOCATIONS}
      style={styles.root}
    >
      <ScreenTopBar
        title="Buy Window"
        left={
          <HeaderIconButton onPress={onGoHome} accessibilityLabel="Back to home">
            <Ionicons name="chevron-back" size={18} color={APP_COLORS.textPrimary} />
          </HeaderIconButton>
        }
        right={
          <HeaderIconButton onPress={() => onNavigate?.('welcome')} accessibilityLabel="Sign out">
            <Ionicons name="log-out-outline" size={16} color={APP_COLORS.textPrimary} />
          </HeaderIconButton>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={[bottomColor, '#5a8fc4']} style={styles.hero}>
          <Text style={styles.heroKicker}>Buy Window</Text>
          <Text style={styles.heroTitle}>Turn travel inspiration into action.</Text>
          <Text style={styles.heroSub}>Paste a flight, hotel, or social travel link to analyze.</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={linkInput}
              onChangeText={setLinkInput}
              placeholder="Paste a travel link…"
              placeholderTextColor="rgba(191,219,254,0.7)"
              style={styles.input}
            />
            <Pressable onPress={handleAnalyze} style={styles.analyzeBtn}>
              <Text style={styles.analyzeBtnText}>{analyzing ? '…' : 'Analyze'}</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {analyzing ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>AI analyzing…</Text>
            {AI_PROCESSING_STEPS.map(s => (
              <Text key={s.id} style={styles.step}>✓ {s.label}</Text>
            ))}
          </View>
        ) : null}

        {extracted.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Suggested items</Text>
            {extracted.map(item => (
              <Pressable key={item.id} onPress={() => toggleItem(item.id)} style={styles.row}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Ionicons
                  name={selectedIds.has(item.id) ? 'checkbox' : 'square-outline'}
                  size={20}
                  color="#2563eb"
                />
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={styles.section}>Active Buy Windows</Text>
        {buyWindows.map(bw => (
          <BuyWindowCard
            key={bw.id}
            bw={bw}
            onCompare={() => setBookingWindow(bw)}
            onReset={() =>
              setBuyWindows(prev =>
                prev.map(w =>
                  w.id === bw.id ? { ...w, expiresAt: Date.now() + (47 * 60 + 32) * 60 * 1000 } : w,
                ),
              )
            }
          />
        ))}

        <Text style={styles.section}>Recently imported</Text>
        <View style={styles.card}>
          {RECENTLY_IMPORTED.slice(0, 4).map(item => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowSub}>{item.source} · {item.importedAt}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!bookingWindow} transparent animationType="fade">
        <Pressable style={styles.modalBg} onPress={() => setBookingWindow(null)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.cardTitle}>Compare deals</Text>
            {BOOKING_OPTIONS.map(opt => (
              <Pressable
                key={opt.id}
                onPress={() => Linking.openURL(opt.url).catch(() => undefined)}
                style={styles.bookRow}
              >
                <Text>{opt.platformIcon} {opt.platform}</Text>
                <Text style={styles.bwPrice}>{opt.price}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setBookingWindow(null)} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24, gap: 12 },
  hero: { borderRadius: 20, padding: 16 },
  heroKicker: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  heroTitle: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4, lineHeight: 18 },
  inputRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 12,
  },
  analyzeBtn: {
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  analyzeBtnText: { fontWeight: '800', fontSize: 12, color: '#0f172a' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#1e293b', marginBottom: 6 },
  step: { fontSize: 12, color: '#475569', marginBottom: 2 },
  section: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  emoji: { fontSize: 20 },
  rowTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1e293b' },
  rowSub: { fontSize: 10, color: '#64748b' },
  bwCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 12,
  },
  bwTop: { flexDirection: 'row', justifyContent: 'space-between' },
  bwStatus: { fontSize: 10, fontWeight: '900', color: '#b45309' },
  bwTimer: { fontSize: 10, fontWeight: '700', color: '#92400e' },
  bwRoute: { fontSize: 13, fontWeight: '800', marginTop: 4 },
  bwPrice: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  bwRef: { fontSize: 10, color: '#64748b' },
  bwActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  ghostBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ghostBtnText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  bookRow: {
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginBottom: 8,
  },
});
