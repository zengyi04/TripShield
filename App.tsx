import React, { useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { deriveButtonTones, deriveDarkerTone } from './src/utils/color';
import { SCREENSHOT_FEED_OFFERS, FeedOffer } from './src/data/mockOffers';
import type { ActiveScreen } from './src/types';

const SAFE_TOP_COLOR = '#B7D4F2';

type FeatureTab = 'home' | 'buy-window' | 'consensus' | 'ledger' | 'self-healing';

type ChipCategory = 'deals' | 'events' | 'planner' | 'pulse' | 'flights' | 'stays';

function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('welcome');
  const topColor = SAFE_TOP_COLOR;
  const harmonizedDerived = useMemo(
    () => deriveDarkerTone(topColor, { darknessDelta: 32, saturationDelta: 0 }),
    []
  );
  const bottomColor = harmonizedDerived.hex;
  const buttonTones = useMemo(() => deriveButtonTones(bottomColor, 16), [bottomColor]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.appShell}>
        <View style={styles.appGlow1} />
        <View style={styles.appGlow2} />
        <PhoneMockup
          activeScreen={activeScreen}
          onNavigate={setActiveScreen}
          topColor={topColor}
          bottomColor={bottomColor}
          buttonBg={buttonTones.bg}
          buttonHover={buttonTones.hover}
          buttonTextColor={buttonTones.text}
          isHarmonized={true}
          showPhoneFrame={false}
        />
      </View>
    </SafeAreaView>
  );
}

function PhoneMockup({
  activeScreen,
  onNavigate,
  topColor,
  bottomColor,
  buttonBg,
  buttonHover,
  buttonTextColor,
  isHarmonized,
  showPhoneFrame,
}: {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
  buttonTextColor?: string;
  isHarmonized: boolean;
  showPhoneFrame: boolean;
}) {
  const [currentTab, setCurrentTab] = useState<FeatureTab>('home');
  const [activePreviewFeature, setActivePreviewFeature] = useState<FeatureTab | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleTabChange = (tab: FeatureTab) => {
    setCurrentTab(tab);
    if (tab === 'home') {
      onNavigate('home');
    } else {
      setActivePreviewFeature(tab);
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return (
          <View style={styles.screenWrap}>
            <HomeScreen
              topColor={topColor}
              bottomColor={bottomColor}
              buttonBg={buttonBg}
              buttonHover={buttonHover}
              onNavigate={onNavigate}
            />
            <BottomNavigation currentTab={currentTab} onTabChange={handleTabChange} barBgColor={bottomColor} />
          </View>
        );
      case 'signup':
        return (
          <SignUpScreen
            onNavigate={onNavigate}
            topColor={topColor}
            bottomColor={bottomColor}
            buttonBg={buttonBg}
            buttonHover={buttonHover}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onNavigate={onNavigate}
            topColor={topColor}
            bottomColor={bottomColor}
            buttonBg={buttonBg}
            buttonHover={buttonHover}
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigate={onNavigate}
            topColor={topColor}
            bottomColor={bottomColor}
            buttonBg={buttonBg}
            buttonHover={buttonHover}
          />
        );
      case 'welcome':
      default:
        return (
          <WelcomeScreen
            onNavigate={onNavigate}
            topColor={topColor}
            bottomColor={bottomColor}
            buttonBg={buttonBg}
            buttonHover={buttonHover}
            buttonTextColor={buttonTextColor}
            isHarmonized={isHarmonized}
          />
        );
    }
  };

  if (!showPhoneFrame) {
    return (
      <View style={styles.phoneFrameless}>
        <View style={styles.content}>{renderScreen()}</View>
      </View>
    );
  }

  return (
    <View style={styles.phoneFrame}>
      <View style={[styles.phoneInner, { backgroundColor: topColor }]}>
        <View style={styles.innerContent}>{renderScreen()}</View>

        <FeaturePreviewModal featureTab={activePreviewFeature} onClose={() => setActivePreviewFeature(null)} accentColor={bottomColor} />

        {showAccountModal && (
          <Modal visible transparent animationType="fade">
            <Pressable style={styles.modalBackdrop} onPress={() => setShowAccountModal(false)}>
              <Pressable style={styles.accountCard} onPress={() => undefined}>
                <View style={styles.accountHeader}>
                  <View style={styles.avatar}>AM</View>
                  <View>
                    <Text style={styles.avatarName}>Alex Morgan</Text>
                    <Text style={styles.avatarEmail}>alex.morgan@example.com</Text>
                  </View>
                  <Pressable onPress={() => setShowAccountModal(false)} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                  </Pressable>
                </View>
                <View style={styles.accountInfoBox}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Membership Tier</Text>
                    <Text style={styles.infoPill}>TripShield PRO</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Active Group</Text>
                    <Text style={styles.infoValue}>Shenzhen & Tokyo '26</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Decision Engine</Text>
                    <Text style={styles.infoLive}><Ionicons name="shield-checkmark" size={13} color="#059669" /> Live 94/100</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    setShowAccountModal(false);
                    onNavigate('welcome');
                  }}
                  style={styles.accountLogout}
                >
                  <Ionicons name="log-out-outline" size={15} color="#dc2626" />
                  <Text style={styles.logoutText}>Log Out to Frontpage (Sign Up & Login)</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </View>
    </View>
  );
}

function WelcomeScreen({
  onNavigate,
  topColor,
  bottomColor,
  buttonBg,
  buttonHover,
  buttonTextColor = '#fff',
  isHarmonized,
}: {
  onNavigate: (screen: ActiveScreen) => void;
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
  buttonTextColor?: string;
  isHarmonized: boolean;
}) {
  return (
    <LinearGradient colors={[topColor, '#8EAFD2', bottomColor]} locations={[0, 0.46, 1]} style={styles.fullScreen}>
      <View style={styles.welcomeTop}> 
        <TripShieldLogo size={190} />
      </View>
      <View style={styles.welcomeBottom}> 
        <Text style={styles.welcomeTitle}>Welcome back</Text>
        <Text style={styles.welcomeSubtitle}>Sign in to pick up your trip planning right where you left off.</Text>
        <View style={styles.buttonStack}>
          <Pressable style={({ pressed }) => [styles.primaryButton, { backgroundColor: buttonBg, borderColor: 'rgba(255,255,255,0.15)' }, pressed && styles.pressedGlass]} onPress={() => onNavigate('signup')}>
            <Text style={[styles.primaryButtonText, { color: buttonTextColor }]}>Sign up</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.primaryButton, { backgroundColor: buttonBg, borderColor: 'rgba(255,255,255,0.15)' }, pressed && styles.pressedGlass]} onPress={() => onNavigate('login')}>
            <Text style={[styles.primaryButtonText, { color: buttonTextColor }]}>Login</Text>
          </Pressable>
          <Pressable onPress={() => onNavigate('home')}>
            <Text style={styles.maybeLater}>Maybe Later</Text>
          </Pressable>
        </View>
        <Text style={styles.legalText}>By continuing, you agree to TripShield&apos;s <Text style={styles.linkText}>Terms of Service</Text> and acknowledge our <Text style={styles.linkText}>Privacy Policy</Text>.</Text>
      </View>
    </LinearGradient>
  );
}

function SignUpScreen({ onNavigate, topColor, bottomColor, buttonBg, buttonHover }: { onNavigate: (screen: ActiveScreen) => void; topColor: string; bottomColor: string; buttonBg: string; buttonHover: string; }) {
  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = () => {
    setIsSuccess(true);
    setTimeout(() => onNavigate('home'), 900);
  };

  return (
    <LinearGradient colors={[topColor, '#8EAFD2', bottomColor]} locations={[0, 0.46, 1]} style={styles.fullScreen}>
      <View style={styles.formHeader}> 
        <Pressable onPress={() => onNavigate('welcome')} style={({ pressed }) => [styles.iconCircle, pressed && styles.pressedGlass]}><Ionicons name="arrow-back" size={20} color="#1f2937" /></Pressable>
        <Text style={styles.formTitle}>Get Started</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.formBody}> 
        <View>
          <View style={styles.inlineHeader}><Ionicons name="star" size={18} color="rgba(255,255,255,0.8)" /><Text style={styles.sectionHeading}>Create account</Text></View>
          <Text style={styles.formSubtitle}>Start saving your favorite destinations and custom routes.</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your Name" placeholderTextColor="rgba(255,255,255,0.5)" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="you@email.com" keyboardType="email-address" placeholderTextColor="rgba(255,255,255,0.5)" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry placeholderTextColor="rgba(255,255,255,0.5)" />
          </View>
          <Pressable style={({ pressed }) => [styles.primaryButton, { backgroundColor: buttonBg, borderColor: 'rgba(255,255,255,0.2)' }, pressed && styles.pressedGlass]} onPress={handleSubmit}>
            <Text style={[styles.primaryButtonText, { color: '#fff' }]}>{isSuccess ? 'Account Created!' : 'Create Account'}</Text>
          </Pressable>
        </View>
        <Text style={styles.switchText}>Already have an account? <Text onPress={() => onNavigate('login')} style={styles.switchLink}>Log in</Text></Text>
      </View>
    </LinearGradient>
  );
}

function LoginScreen({ onNavigate, topColor, bottomColor, buttonBg, buttonHover }: { onNavigate: (screen: ActiveScreen) => void; topColor: string; bottomColor: string; buttonBg: string; buttonHover: string; }) {
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = () => {
    setIsSuccess(true);
    setTimeout(() => onNavigate('home'), 700);
  };

  return (
    <LinearGradient colors={[topColor, '#8EAFD2', bottomColor]} locations={[0, 0.46, 1]} style={styles.fullScreen}>
      <View style={styles.formHeader}> 
        <Pressable onPress={() => onNavigate('welcome')} style={({ pressed }) => [styles.iconCircle, pressed && styles.pressedGlass]}><Ionicons name="arrow-back" size={20} color="#1f2937" /></Pressable>
        <Text style={styles.formTitle}>Sign In</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.formBody}> 
        <View>
          <View style={styles.inlineHeader}><Ionicons name="key-outline" size={18} color="rgba(255,255,255,0.8)" /><Text style={styles.sectionHeading}>Welcome back</Text></View>
          <Text style={styles.formSubtitle}>Enter your credentials to manage your journeys.</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" placeholderTextColor="rgba(255,255,255,0.5)" />
          </View>
          <View style={styles.inputGroup}>
            <View style={styles.rowBetween}><Text style={styles.label}>Password</Text><Text style={styles.inlineLink} onPress={() => Alert.alert('Password reset', 'Password reset link sent to ' + email)}>Forgot password?</Text></View>
            <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry placeholderTextColor="rgba(255,255,255,0.5)" />
          </View>
          <Pressable style={({ pressed }) => [styles.primaryButton, { backgroundColor: buttonBg, borderColor: 'rgba(255,255,255,0.2)' }, pressed && styles.pressedGlass]} onPress={handleLogin}>
            <Text style={[styles.primaryButtonText, { color: '#fff' }]}>{isSuccess ? 'Authenticated!' : 'Sign In'}</Text>
          </Pressable>
        </View>
        <Text style={styles.switchText}>New to Voya? <Text onPress={() => onNavigate('signup')} style={styles.switchLink}>Create an account</Text></Text>
      </View>
    </LinearGradient>
  );
}

function DashboardScreen({ onNavigate, topColor, bottomColor, buttonBg, buttonHover }: { onNavigate: (screen: ActiveScreen) => void; topColor: string; bottomColor: string; buttonBg: string; buttonHover: string; }) {
  const trips = [
    { title: 'Kyoto Autumn Trail', country: 'Japan', days: '7 Days', season: 'October', status: 'Confirmed' },
    { title: 'Amalfi Coast Drive', country: 'Italy', days: '10 Days', season: 'June', status: 'Planning' },
    { title: 'Zermatt Glaciers', country: 'Switzerland', days: '5 Days', season: 'December', status: 'Idea' },
  ];

  return (
    <LinearGradient colors={[topColor, '#8EAFD2', bottomColor]} locations={[0, 0.46, 1]} style={styles.fullScreen}>
      <View style={styles.dashboardHeader}> 
        <View style={styles.titleRow}>
          <Pressable onPress={() => onNavigate('welcome')} style={({ pressed }) => [styles.iconCircle, pressed && styles.pressedGlass]}><Ionicons name="arrow-back" size={20} color="#1f2937" /></Pressable>
          <View style={styles.explorerBadge}><Ionicons name="person" size={14} color="#1f2937" /><Text style={styles.explorerText}>Explorer Mode</Text></View>
        </View>
        <Text style={styles.dashboardTitle}>Your Trips</Text>
        <Text style={styles.dashboardSubtitle}>3 journeys in your travel queue</Text>
      </View>
      <View style={styles.dashboardBody}> 
        <View style={styles.rowBetween}><Text style={styles.upcomingText}>Upcoming Itineraries</Text><Pressable style={({ pressed }) => [styles.addButton, pressed && styles.pressedGlass]} onPress={() => Alert.alert('New Trip Creator initiated!')}><Feather name="plus" size={14} color="#fff" /><Text style={styles.addText}>Add</Text></Pressable></View>
        {trips.map((trip, idx) => (
          <Pressable key={idx} onPress={() => Alert.alert('Opening itinerary', trip.title)} style={({ pressed }) => [styles.tripCard, pressed && styles.pressedGlass]}>
            <View style={styles.tripHeaderRow}>
              <View>
                <Text style={styles.tripCountry}>{trip.country}</Text>
                <Text style={styles.tripTitle}>{trip.title}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: trip.status === 'Confirmed' ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.2)' }]}><Text style={[styles.statusTextStyle, { color: trip.status === 'Confirmed' ? '#bbf7d0' : '#fff' }]}>{trip.status}</Text></View>
            </View>
            <View style={styles.tripMeta}>
              <View style={styles.metaItem}><Feather name="calendar" size={13} color="rgba(255,255,255,0.8)" /><Text style={styles.metaText}>{trip.season}</Text></View>
              <View style={styles.metaItem}><Ionicons name="compass-outline" size={13} color="rgba(255,255,255,0.8)" /><Text style={styles.metaText}>{trip.days}</Text></View>
              <View style={styles.metaItemRight}><Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" /><Text style={styles.metaText}>Details</Text></View>
            </View>
          </Pressable>
        ))}
        <Pressable style={({ pressed }) => [styles.primaryButton, { backgroundColor: buttonBg, marginTop: 8 }, pressed && styles.pressedGlass]} onPress={() => onNavigate('welcome')}>
          <Text style={[styles.primaryButtonText, { color: '#fff' }]}>Return to Welcome Screen</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

function BottomNavigation({ currentTab, onTabChange, barBgColor }: { currentTab: FeatureTab; onTabChange: (tab: FeatureTab) => void; barBgColor?: string }) {
  const tabs = [
    { id: 'home' as FeatureTab, label: 'Home', icon: 'home' },
    { id: 'buy-window' as FeatureTab, label: 'Buy Window', icon: 'timer' },
    { id: 'consensus' as FeatureTab, label: 'Consensus', icon: 'sparkles' },
    { id: 'ledger' as FeatureTab, label: 'Ledger', icon: 'receipt' },
    { id: 'self-healing' as FeatureTab, label: 'Self-Healing', icon: 'shield-checkmark' },
  ];

  return (
    <View style={[styles.navWrap, { backgroundColor: 'rgba(22, 61, 101, 0.58)', borderTopColor: 'rgba(255,255,255,0.28)' } ]}>
      {tabs.map(tab => {
        const isActive = currentTab === tab.id;
        const iconName = tab.icon as any;
        return (
          <Pressable key={tab.id} onPress={() => onTabChange(tab.id)} style={({ pressed }) => [styles.navItem, pressed && styles.pressedGlass]}>
            <View style={styles.navIconWrap}><Ionicons name={iconName} size={22} color={isActive ? '#D9EEFF' : 'rgba(255,255,255,0.72)'} /></View>
            <Text style={[styles.navLabel, { color: isActive ? '#D9EEFF' : 'rgba(255,255,255,0.72)', fontWeight: isActive ? '800' : '600' }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function HomeScreen({ topColor, bottomColor, buttonBg, buttonHover, onNavigate }: { topColor: string; bottomColor: string; buttonBg: string; buttonHover: string; onNavigate?: (screen: ActiveScreen) => void; }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState<ChipCategory>('deals');
  const [likedOffers, setLikedOffers] = useState<Record<string, boolean>>({ 'feed-3': true, 'feed-4': false });
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

  const toggleLike = (id: string) => {
    setLikedOffers(prev => {
      const next = !prev[id];
      triggerToast(next ? 'Saved to Favorites ❤️' : 'Removed from Favorites');
      return { ...prev, [id]: next };
    });
  };

  const handleAskAi = () => {
    if (!aiPrompt.trim()) return;
    setIsAiThinking(true);
    setTimeout(() => {
      setIsAiThinking(false);
      setAiResponse(`TripShield Assistant for "${aiPrompt}": Found non-stop flights from Kuala Lumpur to Shenzhen starting from RM450, plus top recommended boutique stays near Futian & Nanshan.`);
    }, 900);
  };

  const displayedOffers = SCREENSHOT_FEED_OFFERS.filter(offer => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || offer.title.toLowerCase().includes(query) || (offer.subtitle && offer.subtitle.toLowerCase().includes(query)) || (offer.partner && offer.partner.toLowerCase().includes(query));
    if (activeChip === 'flights') return matchesSearch && (offer.type === 'flight-deal' || offer.title.toLowerCase().includes('flight'));
    if (activeChip === 'stays') return matchesSearch && (offer.type === 'stay-deal' || offer.title.toLowerCase().includes('villa'));
    if (activeChip === 'deals') return matchesSearch && (offer.type === 'promo-card' || !!offer.price || !!offer.badge);
    return matchesSearch;
  });

  const chips = [
    { id: 'deals' as ChipCategory, label: 'Deals', icon: 'pricetag' },
    { id: 'events' as ChipCategory, label: 'Events', icon: 'calendar' },
    { id: 'planner' as ChipCategory, label: 'Trip.Planner', icon: 'navigate' },
    { id: 'pulse' as ChipCategory, label: 'Trip.Pulse', icon: 'trending-up' },
    { id: 'flights' as ChipCategory, label: 'Flights', icon: 'airplane' },
    { id: 'stays' as ChipCategory, label: 'Stays', icon: 'business' },
  ];

  return (
    <LinearGradient colors={[topColor, '#8EAFD2', bottomColor]} locations={[0, 0.46, 1]} style={styles.homeScreen}>
      {toastMessage && (
        <View style={styles.toast}>
          <View style={styles.toastIcon}><Ionicons name="checkmark" size={14} color="#fff" /></View>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <View style={styles.topBar}> 
        <View style={styles.topBarRow}>
          <View style={styles.userRow}>
            <View>
              <View style={styles.identityRow}>
                <Ionicons name="person-circle" size={28} color="#D9EEFF" style={styles.profileIcon} />
                <Text style={styles.userText}>Alex Morgan</Text>
                <View style={styles.proBadge}><Text style={styles.proText}>PRO</Text></View>
              </View>
            </View>
          </View>
          <View style={styles.topActions}>
            <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressedGlass]} onPress={() => setShowNotificationPopup(!showNotificationPopup)}>
              <Ionicons name="notifications" size={16} color="#1f2937" />
              <View style={styles.redDot} />
            </Pressable>
            {onNavigate && (
              <Pressable style={({ pressed }) => [styles.logoutPill, pressed && styles.pressedGlass]} onPress={() => onNavigate('welcome')}>
                <Ionicons name="log-out-outline" size={12} color="#475569" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </Pressable>
            )}
          </View>
        </View>

        {showNotificationPopup && (
          <View style={styles.notificationCard}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Travel Alerts</Text>
              <Pressable onPress={() => setShowNotificationPopup(false)}><Text style={styles.notificationClose}>✕</Text></Pressable>
            </View>
            <View style={styles.notificationItem}><Text style={styles.notificationItemTitle}>✈️ Flight Fare Alert</Text><Text style={styles.notificationText}>Kuala Lumpur to Shenzhen fares dropped to RM450.</Text></View>
            <View style={styles.notificationItem}><Text style={styles.notificationItemTitle}>🏨 Exclusive Hotel Discount</Text><Text style={styles.notificationText}>Up to 40% off top-rated villas & stays in Tokyo.</Text></View>
          </View>
        )}

        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Pressable style={({ pressed }) => [styles.searchButton, pressed && styles.pressedGlass]} onPress={() => {}}>
              <Ionicons name="search" size={15} color="#A8C7E3" />
            </Pressable>
            <TextInput value={searchQuery} onChangeText={setSearchQuery} style={styles.searchInput} placeholder="" placeholderTextColor="#64748b" />
            {searchQuery ? <Pressable onPress={() => setSearchQuery('')}><Text style={styles.clearButton}>✕</Text></Pressable> : null}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
          {chips.map(chip => {
            const selected = activeChip === chip.id;
            return (
              <Pressable key={chip.id} style={({ pressed }) => [styles.chip, selected ? styles.chipSelected : styles.chipUnselected, pressed && styles.pressedGlass]} onPress={() => setActiveChip(chip.id)}>
                <Ionicons name={chip.icon as any} size={12} color={selected ? '#fff' : '#475569'} />
                <Text style={[styles.chipText, { color: selected ? '#fff' : '#475569' }]}>{chip.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.offerScroll} contentContainerStyle={styles.offerContent}>
        <View style={styles.grid}>
          {displayedOffers.map(offer => {
            const isLiked = likedOffers[offer.id];
            if (offer.type === 'promo-card') {
              return (
                <Pressable key={offer.id} onPress={() => setSelectedOffer(offer)} style={({ pressed }) => [styles.offerCard, styles.promoCard, pressed && styles.pressedGlass]}>
                  <View style={styles.promoHeader}>
                    <Text style={styles.promoTitle}>{offer.title}</Text>
                    <View style={styles.signalGroup}><View style={styles.signalRed} /><View style={styles.signalYellow} /></View>
                  </View>
                  <Text style={styles.promoSubtitle}>{offer.subtitle}</Text>
                  <Text style={styles.promoText}>Enjoy <Text style={styles.promoTextStrong}>RM250 OFF</Text> on your flight booking!</Text>
                  <View style={styles.badgePill}><Text style={styles.badgeText}>{offer.badge}</Text></View>
                  <Image source={{ uri: offer.imageUrl }} style={styles.offerImageBig} />
                  {offer.cornerTag ? <Text style={styles.cornerTag}>{offer.cornerTag}</Text> : null}
                </Pressable>
              );
            }

            if (offer.type === 'guide-card') {
              return (
                <Pressable key={offer.id} onPress={() => setSelectedOffer(offer)} style={({ pressed }) => [styles.offerCard, pressed && styles.pressedGlass]}>
                  <Image source={{ uri: offer.imageUrl }} style={styles.offerImage} />
                  <View style={styles.overlayTitleWrap}>
                    <Text style={styles.overlayBadge}>TOP 5 IN SHENZHEN</Text>
                    <Text style={styles.overlayText}>深圳 · A City Where Future Meets Culture</Text>
                  </View>
                  <View style={styles.cardFooterWhite}>
                    <Text style={styles.cardTitle}>{offer.title}</Text>
                    <View style={styles.cardMetaRow}>
                      <View style={styles.authorRow}><Image source={{ uri: offer.authorAvatar }} style={styles.avatarSmall} /><Text style={styles.authorName}>{offer.authorName}</Text></View>
                      <View style={styles.metaEye}><Ionicons name="eye" size={11} color="#64748b" /><Text style={styles.metaTextSmall}>{offer.views}</Text></View>
                    </View>
                  </View>
                </Pressable>
              );
            }

            if (offer.type === 'lounge-card') {
              return (
                <Pressable key={offer.id} onPress={() => setSelectedOffer(offer)} style={({ pressed }) => [styles.offerCard, pressed && styles.pressedGlass]}>
                  <Image source={{ uri: offer.imageUrl }} style={styles.offerImage} />
                  <Pressable style={({ pressed }) => [styles.heartButton, pressed && styles.pressedGlass]} onPress={() => toggleLike(offer.id)}>
                    <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={14} color={isLiked ? '#ef4444' : '#fff'} />
                  </Pressable>
                  <View style={styles.bannerStrip}><Text style={styles.bannerText}>FREE LOUNGE ACCESS WHILE YOU WAIT ✈️</Text></View>
                  <View style={styles.cardFooterWhite}>
                    <Text style={styles.cardTitle}>{offer.title}</Text>
                    <View style={styles.cardMetaRow}>
                      <View style={styles.authorRow}><Image source={{ uri: offer.authorAvatar }} style={styles.avatarSmall} /><Text style={styles.authorName}>{offer.authorName}</Text></View>
                      <View style={styles.metaEye}><Ionicons name="eye" size={11} color="#64748b" /><Text style={styles.metaTextSmall}>{offer.views}</Text></View>
                    </View>
                  </View>
                </Pressable>
              );
            }

            return (
              <Pressable key={offer.id} onPress={() => setSelectedOffer(offer)} style={({ pressed }) => [styles.offerCard, pressed && styles.pressedGlass]}>
                <Image source={{ uri: offer.imageUrl }} style={styles.offerImage} />
                <Pressable style={({ pressed }) => [styles.heartButton, pressed && styles.pressedGlass]} onPress={() => toggleLike(offer.id)}>
                  <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={14} color={isLiked ? '#ef4444' : '#fff'} />
                </Pressable>
                {offer.badge ? <View style={[styles.cardBadge, { backgroundColor: offer.badgeColor || '#2563EB' }]}><Text style={styles.cardBadgeText}>{offer.badge}</Text></View> : null}
                {offer.price ? <View style={styles.pricePill}><Text style={styles.priceText}>{offer.price}</Text>{offer.originalPrice ? <Text style={styles.oldPrice}>{offer.originalPrice}</Text> : null}</View> : null}
                <View style={styles.cardFooterWhite}>
                  <Text style={styles.cardTitle}>{offer.title}</Text>
                  <Text style={styles.cardSubtitle}>{offer.subtitle}</Text>
                  <View style={styles.cardMetaRow}>
                    <View style={styles.authorRow}>{offer.authorAvatar ? <Image source={{ uri: offer.authorAvatar }} style={styles.avatarSmall} /> : null}<Text style={styles.authorName}>{offer.authorName || offer.partner}</Text></View>
                    {offer.views ? <View style={styles.metaEye}><Ionicons name="eye" size={11} color="#64748b" /><Text style={styles.metaTextSmall}>{offer.views}</Text></View> : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {selectedOffer && (
        <Modal visible transparent animationType="slide">
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedOffer(null)}>
            <Pressable style={styles.offerDetailModal} onPress={() => undefined}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalPartner}>{selectedOffer.partner || 'TripShield Verified Offer'}</Text>
                  <Text style={styles.modalTitle}>{selectedOffer.title}</Text>
                </View>
                <Pressable onPress={() => setSelectedOffer(null)} style={({ pressed }) => [styles.modalClose, pressed && styles.pressedGlass]}><Text style={styles.modalCloseText}>✕</Text></Pressable>
              </View>
              <Image source={{ uri: selectedOffer.imageUrl }} style={styles.modalImage} />
              <Text style={styles.modalSubtitle}>{selectedOffer.subtitle}</Text>
              {selectedOffer.description ? <Text style={styles.modalBody}>{selectedOffer.description}</Text> : null}
              {selectedOffer.price ? <View style={styles.priceBox}><View><Text style={styles.priceBoxLabel}>Special Offer Price</Text><Text style={styles.priceBoxValue}>{selectedOffer.price}</Text></View>{selectedOffer.savings ? <Text style={styles.savingTag}>{selectedOffer.savings}</Text> : null}</View> : null}
              <Pressable style={({ pressed }) => [styles.bookButton, pressed && styles.pressedGlass]} onPress={() => { triggerToast(`Locked in with ${selectedOffer.partner || 'Direct Partner'}!`); setSelectedOffer(null); }}>
                <Text style={styles.bookButtonText}>Book / Lock Offer</Text>
                <Ionicons name="open-outline" size={13} color="#fff" />
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {showAiModal && (
        <Modal visible transparent animationType="slide">
          <Pressable style={styles.modalBackdrop} onPress={() => setShowAiModal(false)}>
            <Pressable style={styles.aiModal} onPress={() => undefined}>
              <View style={styles.aiModalHeader}>
                <View style={styles.aiHeaderLeft}><TripShieldLogo size={24} /><Text style={styles.aiHeaderText}>TripShield Assistant</Text></View>
                <Pressable onPress={() => setShowAiModal(false)}><Text style={styles.aiClose}>✕</Text></Pressable>
              </View>
              <Text style={styles.aiHelp}>Ask anything about flight buy windows, group discounts, or hotel splits:</Text>
              {aiResponse ? <View style={styles.aiResponse}><Ionicons name="sparkles" size={16} color="#2563eb" /><Text style={styles.aiResponseText}>{aiResponse}</Text></View> : null}
              <View style={styles.aiInputRow}>
                <TextInput value={aiPrompt} onChangeText={setAiPrompt} style={styles.aiInput} placeholder="e.g. Find best flights from KL to Shenzhen..." placeholderTextColor="#64748b" />
                <Pressable style={({ pressed }) => [styles.sendButton, pressed && styles.pressedGlass]} onPress={handleAskAi}>
                  {isAiThinking ? <View style={styles.spinner} /> : <Ionicons name="send" size={14} color="#fff" />}
                </Pressable>
              </View>
              <View style={styles.aiSubRow}><Ionicons name="mic" size={12} color="#2563eb" /><Text style={styles.aiHint}>Hold button to speak voice query</Text></View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </LinearGradient>
  );
}

function FeaturePreviewModal({ featureTab, onClose, accentColor }: { featureTab: FeatureTab | null; onClose: () => void; accentColor: string; }) {
  if (!featureTab) return null;

  return (
    <Modal visible transparent animationType="fade">
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={{ ...styles.previewCard, backgroundColor: accentColor }} onPress={() => undefined}>
          <Text style={styles.previewTitle}>{featureTab.toUpperCase()}</Text>
          <Text style={styles.previewText}>Preview feature coming soon.</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TripShieldLogo({ size = 96 }: { size?: number }) {
  return (
    <View style={[styles.logoBase, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.logoCore, { width: size * 0.76, height: size * 0.76, borderRadius: size * 0.38 }]}> 
        <Ionicons name="location" size={size * 0.56} color="rgba(255,255,255,0.92)" />
        <Ionicons name="airplane" size={size * 0.26} color="#B7D4F2" style={styles.logoPlaneIcon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#dde5eb' },
  appShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dde5eb',
    position: 'relative',
    overflow: 'hidden',
  },
  appGlow1: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(185, 210, 227, 0.85)',
    top: -120,
    left: -80,
  },
  appGlow2: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(214, 223, 232, 0.9)',
    bottom: -180,
    right: -120,
  },
  phoneFrame: { flex: 1, width: '100%', height: '100%', backgroundColor: '#dfeaf3', overflow: 'hidden', zIndex: 1 },
  phoneInner: { flex: 1, overflow: 'hidden' },
  innerContent: { flex: 1 },
  screenWrap: { flex: 1 },
  fullScreen: { flex: 1 },
  pressedGlass: { backgroundColor: 'rgba(24, 58, 96, 0.42)', borderColor: 'rgba(255,255,255,0.5)' },
  welcomeTop: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 24, backgroundColor: 'rgba(255,255,255,0.05)' },
  welcomeBottom: { borderTopLeftRadius: 38, borderTopRightRadius: 38, paddingHorizontal: 32, paddingTop: 36, paddingBottom: 40, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)', shadowColor: '#17365f', shadowOpacity: 0.2, shadowRadius: 12 },
  welcomeTitle: { fontSize: 34, fontWeight: '800', color: '#fff', marginBottom: 12, letterSpacing: -0.8 },
  welcomeSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 15, textAlign: 'center', maxWidth: 280, lineHeight: 22 },
  buttonStack: { width: '100%', maxWidth: 320, marginTop: 30, marginBottom: 24 },
  primaryButton: { width: '100%', minHeight: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, paddingVertical: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8 },
  primaryButtonText: { fontSize: 16, fontWeight: '700' },
  maybeLater: { color: '#fff', fontSize: 15, fontWeight: '700', textDecorationLine: 'underline', marginTop: 10, alignSelf: 'center' },
  legalText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'center', maxWidth: 270, lineHeight: 18 },
  linkText: { color: '#fff', fontWeight: '600', textDecorationLine: 'underline' },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, backgroundColor: 'rgba(255,255,255,0.08)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.18)' },
  formTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 1.2, color: '#1f2937', textTransform: 'uppercase' },
  formBody: { flex: 1, borderTopLeftRadius: 38, borderTopRightRadius: 38, paddingHorizontal: 32, paddingTop: 28, paddingBottom: 32, justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  inlineHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionHeading: { color: '#fff', fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  formSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inlineLink: { color: 'rgba(255,255,255,0.8)', fontSize: 11, textDecorationLine: 'underline' },
  switchText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'center' },
  switchLink: { color: '#fff', fontWeight: '700', textDecorationLine: 'underline' },
  dashboardHeader: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 22, backgroundColor: 'rgba(255,255,255,0.08)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.18)' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  explorerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  explorerText: { fontSize: 12, fontWeight: '700', color: '#1f2937' },
  dashboardTitle: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -0.6 },
  dashboardSubtitle: { fontSize: 12, color: 'rgba(31,41,55,0.75)', marginTop: 4 },
  dashboardBody: { flex: 1, borderTopLeftRadius: 38, borderTopRightRadius: 38, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 32, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  upcomingText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 999 },
  addText: { color: '#fff', fontSize: 11, fontWeight: '700', marginLeft: 4 },
  tripCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderRadius: 20, padding: 16, marginTop: 14 },
  tripHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tripCountry: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.1 },
  tripTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 4 },
  statusPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  statusTextStyle: { fontSize: 10, fontWeight: '800' },
  tripMeta: { flexDirection: 'row', alignItems: 'center', gap: 16, borderTopColor: 'rgba(255,255,255,0.12)', borderTopWidth: 1, marginTop: 14, paddingTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItemRight: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  navWrap: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, backgroundColor: 'rgba(22,61,101,0.58)', shadowColor: '#102f50', shadowOpacity: 0.28, shadowRadius: 12 },
  navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 56, paddingVertical: 4 },
  navIconWrap: { position: 'relative', marginBottom: 6 },
  navLabel: { fontSize: 11, letterSpacing: -0.1 },
  navDot: { position: 'absolute', top: -2, right: -5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', borderWidth: 1, borderColor: '#fff' },
  homeScreen: { flex: 1, position: 'relative' },
  topBar: { paddingTop: 12, paddingBottom: 12, paddingHorizontal: 14, position: 'relative', backgroundColor: 'rgba(255,255,255,0.1)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.18)', shadowColor: '#17365f', shadowOpacity: 0.12, shadowRadius: 12 },
  topBarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  identityRow: { flexDirection: 'row', alignItems: 'center' },
  profileIcon: { marginRight: 6 },
  userText: { color: '#0f172a', fontSize: 12, fontWeight: '900' },
  proBadge: { marginLeft: 6, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 4, paddingVertical: 2 },
  proText: { color: '#1d4ed8', fontSize: 9, fontWeight: '800' },
  userSubtitle: { color: '#334155', fontSize: 10, fontWeight: '800', marginTop: 2 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  redDot: { position: 'absolute', top: 4, right: 5, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4, borderWidth: 1, borderColor: '#fff' },
  logoutPill: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 30, paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 999 },
  logoutText: { color: '#334155', fontSize: 10, fontWeight: '800' },
  notificationCard: { position: 'absolute', top: 60, right: 14, width: 260, backgroundColor: 'rgba(24,70,112,0.88)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(190,225,255,0.48)', padding: 12, zIndex: 40, shadowColor: '#102f50', shadowOpacity: 0.35, shadowRadius: 16, elevation: 12 },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(210,235,255,0.25)', paddingBottom: 6, marginBottom: 8 },
  notificationTitle: { color: '#D9EEFF', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 },
  notificationClose: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  notificationItem: { backgroundColor: 'rgba(126,183,231,0.18)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(210,235,255,0.2)', padding: 8, marginBottom: 8 },
  notificationItemTitle: { color: '#E3F3FF', fontSize: 11, fontWeight: '800', marginBottom: 4 },
  notificationText: { color: 'rgba(235,247,255,0.82)', fontSize: 10 },
  searchWrap: { marginTop: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.24)', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.44)', paddingHorizontal: 8, paddingVertical: 6 },
  logoBtn: { marginRight: 6 },
  searchInput: { flex: 1, color: '#fff', fontSize: 12, fontWeight: '700', paddingVertical: 6 },
  clearButton: { color: '#64748b', fontSize: 12, marginRight: 8 },
  searchButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  chipsRow: { marginTop: 10 },
  chipsContent: { paddingBottom: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginRight: 6, borderWidth: 1 },
  chipSelected: { backgroundColor: 'rgba(35, 82, 128, 0.72)', borderColor: 'rgba(255,255,255,0.46)' },
  chipUnselected: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.28)' },
  chipText: { fontSize: 11, fontWeight: '800' },
  offerScroll: { flexGrow: 1, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 30 },
  offerContent: { paddingBottom: 120 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  offerCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.38)', marginBottom: 12, position: 'relative' },
  promoCard: { backgroundColor: '#0F2C59', minHeight: 220 },
  promoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingTop: 10 },
  promoTitle: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  signalGroup: { flexDirection: 'row', alignItems: 'center' },
  signalRed: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', marginRight: -3 },
  signalYellow: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fbbf24' },
  promoSubtitle: { color: '#fbbf24', fontSize: 12, fontWeight: '900', paddingHorizontal: 10, marginTop: 4 },
  promoText: { color: 'rgba(255,255,255,0.9)', fontSize: 9, paddingHorizontal: 10, marginTop: 6, lineHeight: 14 },
  promoTextStrong: { color: '#fbbf24', fontWeight: '900' },
  badgePill: { alignSelf: 'flex-start', backgroundColor: '#fbbf24', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 4, marginHorizontal: 10, marginTop: 8 },
  badgeText: { color: '#0f172a', fontSize: 8, fontWeight: '900' },
  offerImage: { width: '100%', height: 140, resizeMode: 'cover' },
  offerImageBig: { width: '100%', height: 120, resizeMode: 'cover', marginTop: 8 },
  heartButton: { position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  cardBadge: { position: 'absolute', top: 10, left: 10, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4 },
  cardBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  pricePill: { position: 'absolute', bottom: 100, left: 10, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  priceText: { color: '#0f172a', fontSize: 11, fontWeight: '900' },
  oldPrice: { color: '#94a3b8', fontSize: 8, textDecorationLine: 'line-through' },
  overlayTitleWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.3)' },
  overlayBadge: { color: '#fbbf24', fontSize: 8, fontWeight: '900', backgroundColor: '#0f172a', alignSelf: 'flex-start', paddingHorizontal: 6, marginBottom: 6, borderRadius: 4 },
  overlayText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  bannerStrip: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.9)', paddingVertical: 6, paddingHorizontal: 8 },
  bannerText: { color: '#fbbf24', fontSize: 9, fontWeight: '900', textAlign: 'center' },
  cardFooterWhite: { backgroundColor: 'rgba(255,255,255,0.82)', padding: 10 },
  cardTitle: { color: '#0f172a', fontSize: 11, fontWeight: '900', lineHeight: 14 },
  cardSubtitle: { color: '#64748b', fontSize: 9, marginTop: 2, lineHeight: 12 },
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatarSmall: { width: 16, height: 16, borderRadius: 8 },
  authorName: { color: '#334155', fontSize: 10, fontWeight: '700' },
  metaEye: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTextSmall: { color: '#64748b', fontSize: 10, fontWeight: '700' },
  cornerTag: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 9, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 },
  aiCapsuleWrap: { position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' },
  aiCapsule: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(226,232,240,0.95)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8 },
  aiPillIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  aiCapsuleText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  offerDetailModal: { backgroundColor: 'rgba(224,242,255,0.92)', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)', padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 10 },
  modalPartner: { fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
  modalTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginTop: 4 },
  modalClose: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(54,105,151,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { color: '#475569', fontSize: 16 },
  modalImage: { width: '100%', height: 170, borderRadius: 18, marginTop: 14 },
  modalSubtitle: { fontWeight: '800', color: '#0f172a', fontSize: 12, marginTop: 12 },
  modalBody: { color: '#475569', fontSize: 11, lineHeight: 18, marginTop: 8 },
  priceBox: { backgroundColor: 'rgba(164,211,246,0.28)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', padding: 12, marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceBoxLabel: { color: '#64748b', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  priceBoxValue: { color: '#1d4ed8', fontSize: 20, fontWeight: '900', marginTop: 4 },
  savingTag: { backgroundColor: 'rgba(44,101,153,0.58)', color: '#E8F6FF', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6, fontSize: 10, fontWeight: '800' },
  bookButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(34,88,136,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 12, paddingVertical: 12, marginTop: 16 },
  bookButtonText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  aiModal: { backgroundColor: 'rgba(224,242,255,0.92)', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)', padding: 18, maxHeight: '70%' },
  aiModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8 },
  aiHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiHeaderText: { color: '#0f172a', fontSize: 12, fontWeight: '900' },
  aiClose: { color: '#64748b', fontSize: 18 },
  aiHelp: { color: '#475569', fontSize: 11, marginTop: 12 },
  aiResponse: { flexDirection: 'row', gap: 8, backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 },
  aiResponseText: { color: '#1e3a8a', fontSize: 11, flex: 1, lineHeight: 18 },
  aiInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  aiInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.42)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)', color: '#123A60', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, fontSize: 12 },
  sendButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(34,88,136,0.64)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderTopColor: '#fff', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#fff', transform: [{ rotate: '45deg' }] },
  aiSubRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 },
  aiHint: { color: '#64748b', fontSize: 10 },
  previewCard: { marginHorizontal: 18, marginBottom: 30, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', padding: 16, backgroundColor: 'rgba(35,91,140,0.76)' },
  previewTitle: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  previewText: { color: '#e0f2fe', fontSize: 11, marginTop: 8 },
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  statusText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: -0.4 },
  statusIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phoneFrameless: { flex: 1, width: '100%', height: '100%' },
  content: { flex: 1 },
  accountCard: { width: '92%', alignSelf: 'center', backgroundColor: 'rgba(224,242,255,0.92)', borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)', padding: 18, marginBottom: 20 },
  accountHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563eb', color: '#fff', fontSize: 15, fontWeight: '800', textAlign: 'center', textAlignVertical: 'center', marginRight: 12 },
  avatarName: { color: '#0f172a', fontSize: 15, fontWeight: '900' },
  avatarEmail: { color: '#64748b', fontSize: 11, marginTop: 2 },
  closeButton: { marginLeft: 'auto', width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(54,105,151,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#475569', fontSize: 16 },
  accountInfoBox: { backgroundColor: 'rgba(255,255,255,0.32)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', padding: 12, marginTop: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  infoLabel: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  infoPill: { backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '800' },
  infoValue: { color: '#0f172a', fontSize: 12, fontWeight: '700' },
  infoLive: { color: '#059669', fontSize: 12, fontWeight: '800', flexDirection: 'row', alignItems: 'center', gap: 4 },
  accountLogout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, borderRadius: 12, paddingVertical: 12, marginTop: 16 },
  toast: { position: 'absolute', top: 52, left: '50%', transform: [{ translateX: -170 }], width: 340, backgroundColor: '#0f172a', borderRadius: 18, borderWidth: 1, borderColor: '#60a5fa', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 60 },
  toastIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  toastText: { color: '#fff', fontSize: 12, fontWeight: '700', flex: 1 },
  logoBase: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', borderWidth: 0, borderColor: 'transparent', shadowOpacity: 0 },
  logoCore: { alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: 'rgba(95,145,202,0.72)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', overflow: 'hidden' },
  logoPlaneIcon: { position: 'absolute', left: '38%', top: '36%', transform: [{ rotate: '35deg' }] },
});

export default App;
