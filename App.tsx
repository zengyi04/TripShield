import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { deriveButtonTones, deriveDarkerTone } from './src/utils/color';
import { ConsensusScreen as DedicatedConsensusScreen } from './src/components/screens/ConsensusScreen';
import type { ActiveScreen } from './src/types';
import { SelfHealingScreen, LOW_TRIP_HEALTH, computeTripHealthScore } from './src/components/screens/SelfHealingScreen';

const SAFE_TOP_COLOR = '#B7D4F2';

type FeatureTab = 'home' | 'buy-window' | 'consensus' | 'ledger' | 'self-healing';

function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...Feather.font,
    ...MaterialIcons.font,
  });
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('welcome');
  const topColor = SAFE_TOP_COLOR;
  const harmonizedDerived = useMemo(
    () => deriveDarkerTone(topColor, { darknessDelta: 32, saturationDelta: 0 }),
    []
  );
  const bottomColor = harmonizedDerived.hex;
  const buttonTones = useMemo(() => deriveButtonTones(bottomColor, 16), [bottomColor]);

  if (!fontsLoaded) {
    return (
      <View style={styles.fontLoading}>
        <ActivityIndicator size="large" color="#B7D4F2" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
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
  const [tripHealthScore, setTripHealthScore] = useState(computeTripHealthScore);
  const showSelfHealBadge = tripHealthScore < LOW_TRIP_HEALTH;

  const handleTabChange = (tab: FeatureTab) => {
    setCurrentTab(tab);
    if (tab === 'home') {
      setActivePreviewFeature(null);
      if (activeScreen !== 'home') {
        onNavigate('home');
      }
    } else if (tab === 'consensus') {
      setActivePreviewFeature(null);
      if (activeScreen !== 'home') {
        onNavigate('home');
      }
    } else if (tab === 'self-healing') {
      setActivePreviewFeature(null);
      if (activeScreen !== 'home' && activeScreen !== 'self-healing') {
        onNavigate('home');
      }
    } else {
      setActivePreviewFeature(tab);
      if (activeScreen !== 'home') {
        onNavigate('home');
      }
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'self-healing':
      case 'home':
        return (
          <View style={styles.screenWrap}>
            {currentTab === 'consensus' ? (
              <DedicatedConsensusScreen topColor={topColor} bottomColor={bottomColor} />
            ) : currentTab === 'self-healing' ? (
              <SelfHealingScreen
                topColor={topColor}
                bottomColor={bottomColor}
                buttonBg={buttonBg}
                buttonHover={buttonHover}
                onNavigateHome={() => handleTabChange('home')}
                onNavigate={onNavigate}
                onHealthChange={setTripHealthScore}
              />
            ) : (
              <HomeScreen
                topColor={topColor}
                bottomColor={bottomColor}
                buttonBg={buttonBg}
                buttonHover={buttonHover}
                onNavigate={onNavigate}
                onOpenSelfHealing={() => handleTabChange('self-healing')}
              />
            )}
            <BottomNavigation
              currentTab={currentTab}
              onTabChange={handleTabChange}
              barBgColor={bottomColor}
              showSelfHealBadge={showSelfHealBadge}
            />
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
        <FeaturePreviewModal
          featureTab={activePreviewFeature}
          onClose={() => setActivePreviewFeature(null)}
          accentColor={bottomColor}
          onOpenSelfHealing={() => handleTabChange('self-healing')}
        />
      </View>
    );
  }

  return (
    <View style={styles.phoneFrame}>
      <View style={[styles.phoneInner, { backgroundColor: topColor }]}>
        <View style={styles.innerContent}>{renderScreen()}</View>

        <FeaturePreviewModal
          featureTab={activePreviewFeature}
          onClose={() => setActivePreviewFeature(null)}
          accentColor={bottomColor}
          onOpenSelfHealing={() => handleTabChange('self-healing')}
        />

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
                    <Text style={styles.infoValue}>Shenzhen & Tokyo &apos;26</Text>
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

function LegacyConsensusScreen({ topColor, bottomColor }: { topColor: string; bottomColor: string }) {
  const [phase, setPhase] = useState<'dna' | 'radar' | 'tokens' | 'result'>('dna');
  const [cardIndex, setCardIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [showWhy, setShowWhy] = useState(false);
  const [memberCount, setMemberCount] = useState(4);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const cards = [
    { title: 'Street food crawl', subtitle: 'Late-night bites in Futian', budget: 'RM45', fit: '92%', color: '#FDE68A', icon: '🍜' },
    { title: 'Rooftop dinner', subtitle: 'Skyline views and shared plates', budget: 'RM120', fit: '74%', color: '#BFDBFE', icon: '🌆' },
    { title: 'Night market', subtitle: 'Local finds, flexible timing', budget: 'RM30', fit: '88%', color: '#BBF7D0', icon: '🏮' },
  ];
  const card = cards[cardIndex];

  const nextCard = () => {
    setCardIndex(index => (index + 1) % cards.length);
  };

  const inviteMember = () => {
    setShowInvite(true);
    setInviteCopied(false);
  };

  const simulateJoin = () => {
    setMemberCount(count => Math.min(count + 1, 8));
    setShowInvite(false);
  };

  const toggleToken = (token: string) => {
    setSelectedTokens(current => current.includes(token) ? current.filter(item => item !== token) : current.length < 3 ? [...current, token] : current);
  };

  const advance = (nextPhase: 'radar' | 'tokens' | 'result') => {
    setPhase(nextPhase);
    if (nextPhase === 'result') setLocked(true);
  };

  return (
    <View style={[styles.consensusPage, { backgroundColor: bottomColor }]}> 
      <View style={[styles.consensusHero, { backgroundColor: topColor }]}> 
        <View style={styles.consensusTopRow}>
          <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.livePillText}>LIVE GROUP PULSE</Text></View>
          <Text style={styles.consensusTimer}>00:42</Text>
        </View>
        <Text style={styles.consensusTitle}>Compromise Engine</Text>
        <Text style={styles.consensusSubtitle}>{phase === 'dna' ? 'Build the fairest plan for everyone.' : phase === 'radar' ? 'Conflict detected before the group chat.' : phase === 'tokens' ? 'Private trade-offs shape the plan.' : 'A plan built around everyone.'}</Text>
        <View style={styles.memberRow}>
          <View style={styles.memberAvatar}><Text style={styles.memberInitial}>AM</Text></View>
          <View style={[styles.memberAvatar, styles.memberAvatarSecond]}><Text style={styles.memberInitial}>JL</Text></View>
          <View style={[styles.memberAvatar, styles.memberAvatarThird]}><Text style={styles.memberInitial}>SK</Text></View>
          <View style={[styles.memberAvatar, styles.memberAvatarFourth]}><Text style={styles.memberInitial}>+1</Text></View>
          <View style={styles.memberCopy}><Text style={styles.memberText}>{memberCount} travelers · {memberCount * 3} preferences mapped</Text><Text style={styles.memberSubtext}>{memberCount < 5 ? 'Waiting for one more voice' : 'Everyone is in the pulse'}</Text></View>
          <Pressable onPress={inviteMember} style={styles.addMemberButton}><Text style={styles.addMemberText}>+</Text></Pressable>
        </View>
      </View>

      <View style={styles.consensusBody}>
        <View style={styles.phaseRail}>
          {(['dna', 'radar', 'tokens', 'result'] as const).map((item, index) => <View key={item} style={styles.phaseItem}><View style={[styles.phaseDot, phase === item && styles.phaseDotActive]}><Text style={styles.phaseDotText}>{index + 1}</Text></View><Text style={[styles.phaseLabel, phase === item && styles.phaseLabelActive]}>{item === 'dna' ? 'DNA' : item === 'radar' ? 'CLASH' : item === 'tokens' ? 'SACRIFICE' : 'LOCK'}</Text></View>)}
        </View>

        {phase === 'result' ? (
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
            <View style={styles.dnaHeader}><View><Text style={styles.sectionEyebrowDark}>PRIVATE TRAVEL DNA</Text><Text style={styles.dnaTitle}>Meet your group&apos;s instincts.</Text></View><Text style={styles.dnaTimer}>0:42</Text></View>
            {[['Sarah', 'The Foodie', '95%', '#fb7185'], ['Jason', 'The Explorer', '95%', '#60a5fa'], ['Mei', 'The Planner', '80%', '#34d399']].map(person => <View key={person[0]} style={styles.dnaPerson}><View style={[styles.dnaAvatar, { backgroundColor: person[3] }]}><Text style={styles.dnaAvatarText}>{person[0][0]}</Text></View><View style={styles.dnaPersonCopy}><Text style={styles.dnaPersonName}>{person[0]} <Text style={styles.dnaPersonType}>{person[1]}</Text></Text><View style={styles.dnaBar}><View style={[styles.dnaBarFill, { width: person[2] as any, backgroundColor: person[3] }]} /></View></View><Text style={styles.dnaPercent}>{person[2]}</Text></View>)}
            <Text style={styles.dnaHint}>Your group is high-energy, food-motivated, and budget-aware.</Text>
            <Pressable onPress={() => advance('radar')} style={styles.nextStepButton}><Text style={styles.nextStepText}>Reveal conflict radar →</Text></Pressable>
          </View>
        ) : phase === 'radar' ? (
          <View style={styles.radarPanel}><View style={styles.radarTop}><Text style={styles.radarIcon}>⚠</Text><View><Text style={styles.sectionEyebrowDark}>CONFLICT RADAR</Text><Text style={styles.radarTitle}>Budget × Experience</Text></View><Text style={styles.conflictScore}>82%</Text></View><Text style={styles.radarBody}>Jason wants Disneyland. Mei needs the day under RM350. The engine caught the clash before it becomes a chat argument.</Text><View style={styles.clashRow}><View><Text style={styles.clashName}>Jason</Text><Text style={styles.clashPreference}>Maximum experience</Text></View><Text style={styles.clashVs}>VS</Text><View style={styles.clashRight}><Text style={styles.clashName}>Mei</Text><Text style={styles.clashPreference}>Protect the budget</Text></View></View><Text style={styles.radarQuestion}>What should the group protect?</Text><View style={styles.radarChoices}><Pressable onPress={() => advance('tokens')} style={styles.radarChoice}><Text style={styles.radarChoiceEmoji}>⚖</Text><Text style={styles.radarChoiceTitle}>Balanced</Text><Text style={styles.radarChoiceBody}>Good day, no budget shock</Text></Pressable><Pressable onPress={() => advance('tokens')} style={styles.radarChoice}><Text style={styles.radarChoiceEmoji}>✨</Text><Text style={styles.radarChoiceTitle}>Experiences</Text><Text style={styles.radarChoiceBody}>Spend more, remember more</Text></Pressable></View></View>
        ) : (
          <View style={styles.tokenPanel}><View style={styles.tokenHeader}><View><Text style={styles.sectionEyebrowDark}>SACRIFICE TOKENS</Text><Text style={styles.dnaTitle}>What can you give up?</Text></View><Text style={styles.tokenCount}>{selectedTokens.length}/3</Text></View><Text style={styles.tokenBody}>Private choices. No one has to defend them in the group chat.</Text><View style={styles.tokenGrid}>{['Skip shopping', 'Eat cheaper', 'Walk further', 'Wake earlier', 'Skip one stop', 'Spend less'].map(token => <Pressable key={token} onPress={() => toggleToken(token)} style={[styles.tokenChoice, selectedTokens.includes(token) && styles.tokenChoiceActive]}><Text style={styles.tokenChoiceIcon}>{selectedTokens.includes(token) ? '✓' : '＋'}</Text><Text style={[styles.tokenChoiceText, selectedTokens.includes(token) && styles.tokenChoiceTextActive]}>{token}</Text></Pressable>)}</View><Pressable onPress={() => advance('result')} style={[styles.nextStepButton, selectedTokens.length === 0 && styles.nextStepDisabled]}><Text style={styles.nextStepText}>Build fair compromise →</Text></Pressable></View>
        )}

        <View style={styles.algorithmCard}><View style={styles.algorithmIcon}><Text style={styles.algorithmIconText}>✦</Text></View><View style={styles.algorithmCopy}><Text style={styles.algorithmTitle}>Deadlock breaker is active</Text><Text style={styles.algorithmBody}>When preferences clash, TripShield chooses the highest shared satisfaction score.</Text></View></View>
        <Pressable onPress={inviteMember} style={styles.inviteCard}><View style={styles.inviteIcon}><Text style={styles.inviteIconText}>↗</Text></View><View style={styles.algorithmCopy}><Text style={styles.inviteTitle}>Bring the group in</Text><Text style={styles.inviteBody}>Invite friends to vote from their own phone.</Text></View><Text style={styles.inviteArrow}>›</Text></Pressable>
      </View>

      {showInvite && <View style={styles.inviteSheet}><View style={styles.inviteSheetTop}><View><Text style={styles.inviteSheetEyebrow}>GROUP INVITE</Text><Text style={styles.inviteSheetTitle}>Let everyone shape the plan.</Text></View><Pressable onPress={() => setShowInvite(false)} style={styles.inviteClose}><Text style={styles.inviteCloseText}>×</Text></Pressable></View><Text style={styles.inviteSheetBody}>Share this code with your travel crew. Their preferences will appear in the pulse instantly.</Text><View style={styles.joinCode}><Text style={styles.joinCodeLabel}>JOIN CODE</Text><Text style={styles.joinCodeValue}>VOYA-7K2</Text></View><Pressable onPress={() => setInviteCopied(true)} style={styles.copyInviteButton}><Text style={styles.copyInviteText}>{inviteCopied ? '✓ Code copied' : 'Copy invite code'}</Text></Pressable><Pressable onPress={simulateJoin} style={styles.simulateJoinButton}><Text style={styles.simulateJoinText}>Preview a friend joining</Text></Pressable></View>}
    </View>
  );
}

function BottomNavigation({
  currentTab,
  onTabChange,
  showSelfHealBadge,
}: {
  currentTab: FeatureTab;
  onTabChange: (tab: FeatureTab) => void;
  barBgColor?: string;
  showSelfHealBadge?: boolean;
}) {
  const tabs = [
    { id: 'home' as FeatureTab, label: 'Home', icon: 'home' },
    { id: 'buy-window' as FeatureTab, label: 'Buy Window', icon: 'timer' },
    { id: 'consensus' as FeatureTab, label: 'Consensus', icon: 'sparkles' },
    { id: 'ledger' as FeatureTab, label: 'Ledger', icon: 'receipt' },
    { id: 'self-healing' as FeatureTab, label: 'Self-Healing', icon: 'shield-checkmark' },
  ];

  return (
    <View style={[styles.navWrap, { backgroundColor: 'rgba(38,139,177,0.34)', borderTopColor: 'rgba(225,248,255,0.58)' } ]}>
      {tabs.map(tab => {
        const isActive = currentTab === tab.id;
        const iconName = tab.icon as any;
        const showHealBadge = tab.id === 'self-healing' && !!showSelfHealBadge;
        return (
          <Pressable key={tab.id} onPress={() => onTabChange(tab.id)} style={({ pressed }) => [styles.navItem, pressed && styles.pressedGlass]}>
            <View style={styles.navIconWrap}>
              <Ionicons name={iconName} size={22} color={isActive ? '#D9EEFF' : 'rgba(255,255,255,0.72)'} />
              {showHealBadge && <View style={styles.navHealBadge} />}
            </View>
            <Text style={[styles.navLabel, { color: isActive ? '#D9EEFF' : 'rgba(255,255,255,0.72)', fontWeight: isActive ? '800' : '600' }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function HomeScreen({
  topColor,
  bottomColor,
  buttonBg,
  buttonHover,
  onNavigate,
  onOpenSelfHealing,
}: {
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
  onNavigate?: (screen: ActiveScreen) => void;
  onOpenSelfHealing?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  return (
    <LinearGradient colors={[topColor, '#8EAFD2', bottomColor]} locations={[0, 0.46, 1]} style={styles.homeScreen}>
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
              <Text style={styles.notificationTitle}>Notifications</Text>
              <Pressable onPress={() => setShowNotificationPopup(false)}><Text style={styles.notificationClose}>✕</Text></Pressable>
            </View>

            <Pressable
              onPress={() => {
                setShowNotificationPopup(false);
                onOpenSelfHealing?.();
              }}
              style={({ pressed }) => [styles.notificationSelfHeal, pressed && styles.pressedGlass]}
            >
              <View style={styles.notificationSelfHealTop}>
                <View style={styles.homeHealthDial}>
                  <Text style={styles.homeHealthDialText}>34</Text>
                  <Text style={styles.homeHealthDialSub}>/100</Text>
                </View>
                <View style={styles.homeHealthInfo}>
                  <View style={styles.homeHealthBadgeRow}>
                    <View style={styles.criticalBadge}>
                      <Ionicons name="warning" size={9} color="#fff" />
                      <Text style={styles.criticalBadgeText}>DISRUPTION DETECTED</Text>
                    </View>
                  </View>
                  <Text style={styles.homeHealthApiTag}>OpenWeather · Google Maps</Text>
                  <Text style={styles.homeHealthTitle}>Flight CZ3028 Delayed 3h 15m</Text>
                  <Text style={styles.homeHealthDesc}>
                    Afternoon schedule broken · Tap to auto-reroute to partner businesses
                  </Text>
                </View>
              </View>
              <View style={styles.notificationSelfHealAction}>
                <Ionicons name="shield-checkmark" size={16} color="#bfdbfe" />
                <Text style={styles.homeHealthActionText}>Open Self-Heal</Text>
                <Ionicons name="chevron-forward" size={14} color="#93c5fd" />
              </View>
            </Pressable>

            <Text style={styles.notificationSectionLabel}>Other alerts</Text>
            <View style={styles.notificationItem}>
              <Text style={styles.notificationItemTitle}>✈️ Flight Fare Alert</Text>
              <Text style={styles.notificationText}>Kuala Lumpur to Shenzhen fares dropped to RM450.</Text>
            </View>
            <View style={styles.notificationItem}>
              <Text style={styles.notificationItemTitle}>🏨 Exclusive Hotel Discount</Text>
              <Text style={styles.notificationText}>Up to 40% off top-rated villas & stays in Tokyo.</Text>
            </View>
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

      </View>

      <ScrollView style={styles.offerScroll} contentContainerStyle={styles.offerContent} />
    </LinearGradient>
  );
}

function FeaturePreviewModal({
  featureTab,
  onClose,
  accentColor,
  onOpenSelfHealing,
}: {
  featureTab: FeatureTab | null;
  onClose: () => void;
  accentColor: string;
  onOpenSelfHealing?: () => void;
}) {
  if (!featureTab || featureTab === 'home') return null;

  const featureInfo: Record<
    string,
    { title: string; subtitle: string; tag: string; metric: string; desc: string }
  > = {
    'buy-window': {
      title: 'Decisive Buy Window & Smart Link Aggregator',
      subtitle: 'LLM Link Extraction & AI Price Countdown Lock',
      tag: 'Winning Feature 1',
      metric: 'Reduces deliberation from 4 days to 40 seconds',
      desc: 'LLMs extract flight/hotel data from pasted TikTok/IG links into itinerary cards. Dynamic deep-link redirects bypass gatekeeping for instant affiliate checkout.',
    },
    consensus: {
      title: 'Swipe-and-Lock Consensus Engine',
      subtitle: '60-Second Travel DNA Mapping & Deadlock Breaker',
      tag: 'Winning Feature 2',
      metric: 'Resolves 4 conflicting preferences in 30 seconds',
      desc: 'Group members swipe to mathematically map travel DNA. A constraint-satisfaction algorithm locks collective schedules without chat debates.',
    },
    ledger: {
      title: 'Adaptive Ledger & Dynamic Budget Splitter',
      subtitle: 'OCR Receipt Scanning & Reactive Balance Math',
      tag: 'Winning Feature 3',
      metric: 'Zero manual spreadsheets, 100% dispute elimination',
      desc: 'OCR receipt scanning parses paper bills, auto-splitting line items. If overspent on Day 1, TripShield dynamically recalibrates daily targets for Days 2–5.',
    },
    'self-healing': {
      title: 'Self-Healing Pivot & "What-If" Simulator',
      subtitle: 'Dynamic Health Score & Instant Re-routing',
      tag: 'Self-Healing Pivot (Active)',
      metric: 'Single-tap auto replan with B2B demand matching',
      desc: 'Monitors OpenWeather & Google Maps APIs. Simulates alternative timelines and reroutes to nearby partner businesses.',
    },
  };

  const current = featureInfo[featureTab] || {
    title: featureTab.toUpperCase(),
    subtitle: 'TripShield Innovation Module',
    tag: 'Feature Preview',
    metric: 'Real-time Travel Intelligence',
    desc: 'Advanced decision engine module under active deployment.',
  };

  return (
    <Modal visible transparent animationType="fade">
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={[styles.previewCard, { backgroundColor: accentColor }]} onPress={() => undefined}>
          <View style={styles.previewHeaderRow}>
            <View style={styles.previewTagPill}>
              <Text style={styles.previewTagText}>{current.tag}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.previewCloseBtn}>
              <Text style={styles.previewCloseText}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.previewTitle}>{current.title}</Text>
          <Text style={styles.previewMetric}>⚡ {current.metric}</Text>
          <Text style={styles.previewSubtitle}>{current.subtitle}</Text>
          <Text style={styles.previewDesc}>{current.desc}</Text>

          {featureTab === 'self-healing' && onOpenSelfHealing ? (
            <Pressable
              onPress={() => {
                onClose();
                onOpenSelfHealing();
              }}
              style={({ pressed }) => [styles.previewLaunchBtn, pressed && styles.pressedGlass]}
            >
              <Ionicons name="shield-checkmark" size={14} color="#0f172a" />
              <Text style={styles.previewLaunchText}>Open Self-Healing Pivot</Text>
            </Pressable>
          ) : (
            <Pressable onPress={onClose} style={styles.previewDismissBtn}>
              <Text style={styles.previewDismissText}>Back to Journey</Text>
            </Pressable>
          )}
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
  fontLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dde5eb',
  },
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
  consensusPage: { flex: 1 },
  consensusHero: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  consensusTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10b981' },
  livePillText: { color: '#164e63', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  consensusTimer: { color: '#164e63', fontSize: 15, fontWeight: '900' },
  consensusTitle: { color: '#0f172a', fontSize: 25, fontWeight: '900', marginTop: 16, letterSpacing: -0.5 },
  consensusSubtitle: { color: '#334155', fontSize: 11, lineHeight: 16, marginTop: 3 },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  memberAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0f172a', borderWidth: 2, borderColor: '#B7D4F2', alignItems: 'center', justifyContent: 'center' },
  memberAvatarSecond: { backgroundColor: '#0f766e', marginLeft: -7 },
  memberAvatarThird: { backgroundColor: '#b45309', marginLeft: -7 },
  memberAvatarFourth: { backgroundColor: '#475569', marginLeft: -7 },
  memberInitial: { color: '#fff', fontSize: 8, fontWeight: '900' },
  memberCopy: { flex: 1, marginLeft: 9 },
  memberText: { color: '#475569', fontSize: 10, fontWeight: '700' },
  memberSubtext: { color: '#64748b', fontSize: 9, marginTop: 2 },
  addMemberButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginLeft: 7 },
  addMemberText: { color: '#fff', fontSize: 20, fontWeight: '400', lineHeight: 22 },
  consensusBody: { flex: 1, paddingHorizontal: 16, paddingTop: 22, paddingBottom: 18 },
  consensusSectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  sectionEyebrow: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  sectionHeadingDark: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 4 },
  progressText: { color: '#dbeafe', fontSize: 11, fontWeight: '900' },
  swipeStage: { alignItems: 'center' },
  swipeCard: { width: '100%', minHeight: 260, borderRadius: 26, padding: 20, justifyContent: 'space-between', shadowColor: '#061b2e', shadowOpacity: 0.22, shadowRadius: 16, elevation: 6 },
  cardEmoji: { fontSize: 44 },
  cardEyebrow: { color: '#475569', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  swipeCardTitle: { color: '#0f172a', fontSize: 26, fontWeight: '900', marginTop: 4 },
  swipeCardSubtitle: { color: '#334155', fontSize: 12, marginTop: 4 },
  cardStats: { flexDirection: 'row', gap: 24, borderTopWidth: 1, borderTopColor: 'rgba(15,23,42,0.15)', paddingTop: 14 },
  cardStatLabel: { color: '#64748b', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  cardStatValue: { color: '#0f172a', fontSize: 16, fontWeight: '900', marginTop: 3 },
  swipeHint: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', marginTop: 10 },
  consensusActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  passAction: { flex: 1, borderRadius: 14, paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center' },
  passActionText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  lockAction: { flex: 1.6, borderRadius: 14, paddingVertical: 14, backgroundColor: '#0f172a', alignItems: 'center' },
  lockActionText: { color: '#fff', fontSize: 11, fontWeight: '900' },
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
  lockedCard: { backgroundColor: '#ecfdf5', borderRadius: 24, padding: 22, minHeight: 260, justifyContent: 'center', alignItems: 'center' },
  lockIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  lockIconText: { color: '#fff', fontSize: 26, fontWeight: '900' },
  lockedTitle: { color: '#065f46', fontSize: 21, fontWeight: '900', marginTop: 14, textAlign: 'center' },
  lockedBody: { color: '#047857', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  scoreLabel: { color: '#059669', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  scoreValue: { color: '#065f46', fontSize: 16, fontWeight: '900' },
  resetConsensus: { alignItems: 'center', marginTop: 15 },
  resetConsensusText: { color: '#dbeafe', fontSize: 11, fontWeight: '800', textDecorationLine: 'underline' },
  phaseRail: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  phaseItem: { alignItems: 'center', flex: 1 },
  phaseDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  phaseDotActive: { backgroundColor: '#bfdbfe' },
  phaseDotText: { color: '#1e3a8a', fontSize: 10, fontWeight: '900' },
  phaseLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: '900', marginTop: 4 },
  phaseLabelActive: { color: '#fff' },
  sectionEyebrowDark: { color: '#64748b', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
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
  lockedKicker: { color: '#059669', fontSize: 9, fontWeight: '900', letterSpacing: 1.1, marginTop: 14 },
  whyButton: { backgroundColor: '#dbeafe', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 15 },
  whyButtonText: { color: '#1e3a8a', fontSize: 10, fontWeight: '900' },
  whyPanel: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 10, marginTop: 9, alignSelf: 'stretch' },
  whyLine: { color: '#047857', fontSize: 10, lineHeight: 17 },
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
  navWrap: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, backgroundColor: 'rgba(38,139,177,0.34)', shadowColor: '#0B4D68', shadowOpacity: 0.22, shadowRadius: 12 },
  navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 56, paddingVertical: 4 },
  navIconWrap: { position: 'relative', marginBottom: 6 },
  navLabel: { fontSize: 11, letterSpacing: -0.1 },
  navHealBadge: {
    position: 'absolute',
    top: 2,
    right: -6,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  homeScreen: { flex: 1, position: 'relative' },
  topBar: {
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 14,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.22)',
  },
  topBarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  identityRow: { flexDirection: 'row', alignItems: 'center' },
  profileIcon: { marginRight: 6 },
  userText: { color: '#0f172a', fontSize: 12, fontWeight: '900' },
  proBadge: { marginLeft: 6, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 4, paddingVertical: 2 },
  proText: { color: '#1d4ed8', fontSize: 9, fontWeight: '800' },
  userSubtitle: { color: '#334155', fontSize: 10, fontWeight: '800', marginTop: 2 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', position: 'relative', shadowColor: '#0f172a', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  redDot: { position: 'absolute', top: 7, right: 4, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4, borderWidth: 1, borderColor: '#fff' },
  logoutPill: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 30, paddingHorizontal: 10, backgroundColor: '#FFFFFF', borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0', borderRadius: 999, shadowColor: '#0f172a', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  logoutText: { color: '#334155', fontSize: 10, fontWeight: '800' },
  notificationCard: {
    position: 'absolute',
    top: 56,
    right: 10,
    left: 10,
    backgroundColor: 'rgba(15,40,68,0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(190,225,255,0.45)',
    padding: 12,
    zIndex: 40,
    shadowColor: '#102f50',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  notificationSelfHeal: {
    backgroundColor: 'rgba(8,24,45,0.72)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.45)',
    padding: 10,
    marginBottom: 10,
  },
  notificationSelfHealTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  notificationSelfHealAction: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  notificationSectionLabel: {
    color: 'rgba(191,219,254,0.85)',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
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
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  previewTitle: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  previewSubtitle: { color: '#dbeafe', fontSize: 11, marginTop: 4 },
  previewClose: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  previewText: { color: '#e0f2fe', fontSize: 11, marginTop: 8 },
  demoPanel: { backgroundColor: '#fff', borderRadius: 16, padding: 13 },
  demoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  demoLabel: { color: '#94a3b8', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  demoHeading: { color: '#0f172a', fontSize: 12, fontWeight: '900', marginTop: 3 },
  demoStatus: { color: '#059669', fontSize: 10, fontWeight: '900' },
  dealBadge: { color: '#047857', backgroundColor: '#d1fae5', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, fontSize: 10, fontWeight: '900' },
  flightCard: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  flightAirline: { color: '#64748b', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  flightPrice: { color: '#0f172a', fontSize: 22, fontWeight: '900', marginTop: 4 },
  flightOldPrice: { color: '#94a3b8', fontSize: 10, fontWeight: '700', textDecorationLine: 'line-through' },
  flightDetail: { color: '#475569', fontSize: 10, marginTop: 3 },
  countdown: { color: '#b45309', fontSize: 12, fontWeight: '900', alignSelf: 'center' },
  choiceCard: { minHeight: 88, borderRadius: 12, padding: 12, justifyContent: 'flex-end', marginBottom: 10 },
  choiceLabel: { color: '#475569', fontSize: 9, fontWeight: '800' },
  choiceTitle: { color: '#0f172a', fontSize: 16, fontWeight: '900', marginTop: 3 },
  choiceDetail: { color: '#334155', fontSize: 10, fontWeight: '700', marginTop: 2 },
  demoButtonRow: { flexDirection: 'row', gap: 8 },
  secondaryDemoButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center' },
  secondaryDemoText: { color: '#475569', fontSize: 11, fontWeight: '900' },
  primaryDemoButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  primaryDemoText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  successPanel: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1, borderRadius: 12, padding: 12 },
  successTitle: { color: '#047857', fontSize: 12, fontWeight: '900', marginBottom: 4 },
  demoBody: { color: '#475569', fontSize: 11, lineHeight: 17 },
  healthScore: { color: '#059669', fontSize: 26, fontWeight: '900', marginTop: 2 },
  scoreSuffix: { color: '#94a3b8', fontSize: 11, fontWeight: '700' },
  weatherIcon: { fontSize: 24 },
  routeText: { color: '#475569', fontSize: 11, fontWeight: '700', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e2e8f0', paddingVertical: 10, marginBottom: 10 },
  warningPanel: { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, borderRadius: 12, padding: 12 },
  warningTitle: { color: '#92400e', fontSize: 11, fontWeight: '900', marginBottom: 3 },
  resetText: { color: '#94a3b8', fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 9 },
  ledgerTotal: { color: '#dc2626', fontSize: 15, fontWeight: '900' },
  receiptCard: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  receiptTitle: { color: '#0f172a', fontSize: 12, fontWeight: '900', marginBottom: 4 },
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
  homeHealthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18,50,86,0.85)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 12,
    marginBottom: 14,
    shadowColor: '#0b2344',
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  homeHealthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  homeHealthDial: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(15,23,42,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeHealthDialText: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  homeHealthDialSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 7,
    fontWeight: '700',
  },
  homeHealthInfo: {
    flex: 1,
  },
  homeHealthBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#dc2626',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  criticalBadgeText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  homeHealthApiTag: {
    color: '#93c5fd',
    fontSize: 8,
    fontWeight: '700',
  },
  homeHealthTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  homeHealthDesc: {
    color: '#e0f2fe',
    fontSize: 9,
    lineHeight: 12,
    marginTop: 1,
  },
  homeHealthArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  homeHealthActionText: {
    color: '#93c5fd',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewTagPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  previewTagText: {
    color: '#D9EEFF',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  previewCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCloseText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewMetric: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  previewDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 6,
  },
  previewLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 14,
  },
  previewLaunchText: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '900',
  },
  previewDismissBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 9,
    marginTop: 14,
  },
  previewDismissText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});

export default App;
