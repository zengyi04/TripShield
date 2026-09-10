import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConsensusScreenProps {
  topColor: string;
  bottomColor: string;
}

 type ConsensusPhase = 'hub' | 'setup' | 'join' | 'questions' | 'group' | 'suggestions' | 'itinerary' | 'dna' | 'radar' | 'tokens' | 'result';
type CalendarMode = 'days' | 'months' | 'years';

export function ConsensusScreen({ topColor, bottomColor }: ConsensusScreenProps) {
  const [phase, setPhase] = useState<ConsensusPhase>('hub');
  const [roomCreated, setRoomCreated] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState<string[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [showWhy, setShowWhy] = useState(false);
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [tripDates, setTripDates] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const today = new Date();
  const todayValue = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const [calendarMonth, setCalendarMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('days');
  const calendarPagerRef = useRef<ScrollView>(null);
  const calendarMonths = Array.from({ length: 132 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() + index, 1);
    return { year: date.getFullYear(), month: date.getMonth() };
  });
  const calendarPageIndex = calendarMonths.findIndex(item => item.year === calendarMonth.year && item.month === calendarMonth.month);

  useEffect(() => {
    if (showCalendar && calendarMode === 'days' && calendarPageIndex >= 0) {
      calendarPagerRef.current?.scrollTo({ x: calendarPageIndex * 340, animated: false });
    }
  }, [calendarMonth.year, calendarMonth.month, calendarMode, showCalendar, calendarPageIndex]);
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [travellerName, setTravellerName] = useState('');
  const [travellers, setTravellers] = useState(['Hui Min']);
  const [joinCode, setJoinCode] = useState('SEOU-2026');
  const [referralCode, setReferralCode] = useState('');

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
    const name = travellerName.trim();
    if (!name || travellers.length >= 8) return;
    setTravellers(current => [...current, name]);
    setTravellerName('');
  };

  const createRoom = () => {
    if (tripName.trim() && destination.trim() && tripDates.trim()) setRoomCreated(true);
  };

  const shareRoom = async () => {
    await Share.share({ message: `Join my TripShield room: ${tripName}\nCode: ${joinCode}\nLink: tripshield.app/join/${joinCode}` });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = new Date(calendarMonth.year, calendarMonth.month + 1, 0).getDate();
  const firstWeekday = new Date(calendarMonth.year, calendarMonth.month, 1).getDay();
  const calendarDays = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];

  const changeMonth = (offset: number) => {
    setCalendarMonth(current => {
      const next = new Date(current.year, current.month + offset, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
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

  const selectMonth = (month: number) => {
    setCalendarMonth(current => ({ ...current, month }));
    setCalendarMode('days');
  };

  const selectYear = (year: number) => {
    setCalendarMonth(current => ({ ...current, year }));
    setCalendarMode('days');
  };

  const renderMonthPage = (year: number, month: number) => {
    const pageDaysInMonth = new Date(year, month + 1, 0).getDate();
    const pageFirstWeekday = new Date(year, month, 1).getDay();
    const pageDays = [...Array(pageFirstWeekday).fill(null), ...Array.from({ length: pageDaysInMonth }, (_, index) => index + 1)];
    return <><View style={styles.weekRow}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekDay}>{day}</Text>)}</View><View style={styles.calendarGrid}>{pageDays.map((day, index) => { const value = day ? Date.UTC(year, month, day) : null; const disabled = value !== null && value < todayValue; const selected = value !== null && (value === startDate || value === endDate); const inRange = value !== null && startDate !== null && endDate !== null && value > startDate && value < endDate; return <Pressable key={`${year}-${month}-${index}`} disabled={!day || disabled} onPress={() => day && selectDate(day)} style={[styles.calendarDay, disabled && styles.calendarDayDisabled, selected && styles.calendarDaySelected, inRange && styles.calendarDayRange]}><Text style={[styles.calendarDayText, disabled && styles.calendarDayTextDisabled, selected && styles.calendarDayTextSelected]}>{day || ''}</Text></Pressable>; })}</View></>;
  };

  const answerQuestion = (answer: string) => {
    const nextAnswers = [...questionAnswers, answer];
    setQuestionAnswers(nextAnswers);
    if (questionIndex === 5) {
      setPhase('group');
    } else {
      setQuestionIndex(index => index + 1);
    }
  };

  const questions = [
    { label: 'What is your travel style?', options: ['Relaxed', 'Balanced', 'Packed'] },
    { label: 'What do you enjoy?', options: ['Food', 'Shopping', 'Culture', 'Nature', 'Nightlife', 'Cafes'] },
    { label: 'What is your spending style?', options: ['Save as much as possible', 'Balanced spending', 'Comfortable spending', 'Spend more'] },
    { label: 'How much walking feels good?', options: ['Low', 'Moderate', 'A lot'] },
    { label: 'What do you absolutely not want?', options: ['Early mornings', 'Long walking', 'Expensive activities', 'Outdoor plans in rain'] },
    { label: 'Pick your top priority', options: ['Food', 'Shopping', 'Culture', 'Nature', 'Nightlife'] },
  ];

  return (
    <View style={[styles.page, { backgroundColor: bottomColor }]}> 
      <View style={[styles.hero, { backgroundColor: topColor }]}> 
        <View style={styles.heroTitleRow}><Text style={styles.title}>{phase === 'hub' ? 'Trip rooms' : phase === 'setup' ? 'Create a room' : phase === 'join' ? 'Join a room' : phase === 'questions' ? 'Discover your Travel DNA' : phase === 'group' ? 'Your group, understood' : phase === 'suggestions' ? 'Made for your group' : phase === 'itinerary' ? 'Your trip, together' : 'Compromise Engine'}</Text>{phase === 'setup' && <Pressable onPress={() => setPhase('hub')} style={styles.backButton}><Ionicons name="arrow-back" size={17} color="#1e3a8a" /><Text style={styles.backButtonText}>Rooms</Text></Pressable>}</View>
      </View>

      <View style={styles.body}>
        {phase !== 'hub' && phase !== 'join' && <View style={styles.phaseRail}>
          {(['setup', 'questions', 'group', 'suggestions', 'itinerary'] as const).map((item, index) => <View key={item} style={styles.phaseItem}><View style={[styles.phaseDot, phase === item && styles.phaseDotActive]}><Text style={styles.phaseDotText}>{index + 1}</Text></View><Text style={[styles.phaseLabel, phase === item && styles.phaseLabelActive]}>{item === 'setup' ? 'TRIP' : item === 'questions' ? 'DNA' : item === 'group' ? 'GROUP' : item === 'suggestions' ? 'OPTIONS' : 'PLAN'}</Text></View>)}
        </View>}

        {phase === 'hub' ? (
          <View style={styles.hubPanel}>
            <Text style={styles.eyebrowDark}>YOUR TRIP ROOMS</Text>
            <Text style={styles.panelTitle}>Pick up where you left off.</Text>
            <Text style={styles.panelHint}>Create a new room or join a friend before sharing your Travel DNA.</Text>
            <View style={styles.historyCard}><View style={styles.historyTop}><View><Text style={styles.historyTitle}>Seoul Friends Trip</Text><Text style={styles.historyMeta}>Seoul · 12 - 16 December 2026</Text></View><Text style={styles.statusDone}>PLANNING</Text></View><View style={styles.historyProgress}><View style={[styles.historyProgressFill, { width: '64%' }]} /></View><Text style={styles.historyStatus}>3 of 4 preferences collected · AI analysis ready soon</Text><Pressable onPress={() => { setTripName('Seoul Friends Trip'); setRoomCreated(true); setPhase('questions'); }} style={styles.resumeButton}><Text style={styles.resumeButtonText}>Continue planning →</Text></Pressable></View>
            <View style={styles.historyCard}><View style={styles.historyTop}><View><Text style={styles.historyTitle}>Tokyo 2025</Text><Text style={styles.historyMeta}>Tokyo · Completed itinerary</Text></View><Text style={styles.statusComplete}>COMPLETE</Text></View><Text style={styles.historyStatus}>91% group satisfaction · 4 travellers</Text></View>
            <Text style={styles.sectionDivider}>START SOMETHING NEW</Text>
            <Pressable onPress={() => setPhase('setup')} style={styles.primaryRoomButton}><Ionicons name="add" size={18} color="#fff" /><Text style={styles.primaryRoomButtonText}>Create a new room</Text></Pressable>
            <Pressable onPress={() => setPhase('join')} style={styles.secondaryRoomButton}><Ionicons name="key-outline" size={17} color="#2563eb" /><Text style={styles.secondaryRoomButtonText}>Join with referral code</Text></Pressable>
          </View>
        ) : phase === 'join' ? (
          <View style={styles.joinPanel}><Text style={styles.eyebrowDark}>JOIN A TRIP ROOM</Text><Text style={styles.panelTitle}>Your friend saved you a seat.</Text><Text style={styles.panelHint}>Enter the referral code from your invite link to join the room and answer your own Travel DNA quiz.</Text><Text style={styles.fieldLabel}>REFERRAL CODE</Text><TextInput autoCapitalize="characters" value={referralCode} onChangeText={setReferralCode} placeholder="e.g. SEOU-2026" placeholderTextColor="#94a3b8" style={styles.textInput} /><View style={styles.referralHint}><Ionicons name="link-outline" size={16} color="#2563eb" /><Text style={styles.referralHintText}>You can find this code after /join/ in the shared link.</Text></View><Pressable disabled={!referralCode.trim()} onPress={joinExistingRoom} style={[styles.nextStepButton, !referralCode.trim() && styles.nextStepDisabled]}><Text style={styles.nextStepText}>Join room and start quiz →</Text></Pressable><Pressable onPress={() => setPhase('hub')} style={styles.backToRooms}><Text style={styles.backToRoomsText}>Back to trip rooms</Text></Pressable></View>
        ) : phase === 'setup' ? (
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
            <View style={styles.travellerList}>{travellers.map((traveller, index) => <View key={`${traveller}-${index}`} style={styles.travellerRow}><View style={styles.travellerAvatar}><Text style={styles.travellerAvatarText}>{traveller[0].toUpperCase()}</Text></View><Text style={styles.travellerText}>{traveller}</Text><Text style={styles.travellerRole}>{index === 0 ? 'ADMIN' : 'JOINED · READY'}</Text></View>)}</View>
            <View style={styles.addTravellerRow}><TextInput value={travellerName} onChangeText={setTravellerName} placeholder="Add person by name" placeholderTextColor="#94a3b8" style={styles.addTravellerInput} /><Pressable onPress={addTraveller} style={styles.addTravellerButton}><Text style={styles.addTravellerButtonText}>+ Add</Text></Pressable></View>
            <Text style={styles.readyHint}>Everyone can join from the link and answer their own quiz. You can start yours now.</Text>
            <Pressable disabled={travellers.length < 2} onPress={() => advance('questions')} style={[styles.nextStepButton, travellers.length < 2 && styles.nextStepDisabled]}><Text style={styles.nextStepText}>Start my Travel DNA →</Text></Pressable>
            </>}
          </View>
        ) : phase === 'questions' ? (
          <View style={styles.questionPanel}>
            <View style={styles.questionTop}><Text style={styles.eyebrowDark}>QUESTION {questionIndex + 1} OF 6</Text><Text style={styles.questionProgress}>{Math.round(((questionIndex + 1) / 6) * 100)}%</Text></View>
            <Text style={styles.questionTitle}>{questions[questionIndex].label}</Text>
            <Text style={styles.questionHint}>{questionIndex === 0 ? 'There are no wrong answers.' : questionIndex === 4 ? 'This becomes a constraint, not a vote.' : 'Your answer stays part of your private Travel DNA.'}</Text>
            <View style={styles.answerGrid}>{questions[questionIndex].options.map(option => <Pressable key={option} onPress={() => answerQuestion(option)} style={styles.answerChoice}><Text style={styles.answerChoiceText}>{option}</Text><Text style={styles.answerArrow}>›</Text></Pressable>)}</View>
          </View>
        ) : phase === 'group' ? (
          <View style={styles.groupPanel}><Text style={styles.eyebrowDark}>GROUP TRAVEL DNA</Text><Text style={styles.panelTitle}>Now TripShield understands the group.</Text><View style={styles.groupBars}>{[['Food', '91%', '#fb7185'], ['Shopping', '78%', '#f59e0b'], ['Culture', '67%', '#60a5fa'], ['Nature', '42%', '#34d399'], ['Nightlife', '61%', '#a78bfa']].map(item => <View key={item[0]} style={styles.groupBarRow}><Text style={styles.groupBarLabel}>{item[0]}</Text><View style={styles.groupBar}><View style={[styles.groupBarFill, { width: item[1] as `${number}%`, backgroundColor: item[2] }]} /></View><Text style={styles.groupBarValue}>{item[1]}</Text></View>)}</View><View style={styles.constraintBox}><Text style={styles.constraintTitle}>⚠ Important constraints</Text><Text style={styles.constraintText}>2 people dislike long walking</Text><Text style={styles.constraintText}>1 person avoids expensive activities</Text><Text style={styles.constraintText}>1 person does not want early mornings</Text></View><Pressable onPress={() => advance('suggestions')} style={styles.nextStepButton}><Text style={styles.nextStepText}>Generate group options →</Text></Pressable></View>
        ) : phase === 'suggestions' ? (
          <View style={styles.suggestionsPanel}><Text style={styles.eyebrowDark}>BUILT FROM YOUR GROUP DNA</Text><Text style={styles.panelTitle}>We filtered the city for you.</Text>{[['🍜', 'Korean Food Tour', '94%', 'Low walking · Moderate budget'], ['🛍️', 'Myeongdong + Street Food', '88%', 'High shopping · Moderate walking'], ['🏯', 'Palace + Traditional Village', '72%', 'Culture rich · Higher walking']].map(option => <Pressable key={option[1]} onPress={() => advance('itinerary')} style={styles.suggestionCard}><Text style={styles.suggestionEmoji}>{option[0]}</Text><View style={styles.suggestionCopy}><Text style={styles.suggestionTitle}>{option[1]}</Text><Text style={styles.suggestionDetail}>{option[3]}</Text></View><Text style={styles.matchScore}>{option[2]}</Text></Pressable>)}<Text style={styles.swipeNote}>Everyone can now swipe these filtered options: Want · Maybe · Skip</Text></View>
        ) : phase === 'itinerary' ? (
          <View style={styles.itineraryPanel}><Text style={styles.eyebrowDark}>AI COMPROMISE PLAN</Text><View style={styles.itineraryTitleRow}><Text style={styles.panelTitle}>Seoul · Day 2</Text><Text style={styles.satisfaction}>91% fit</Text></View>{[['10:00 AM', '🏯 Gyeongbokgung Palace', '20 min by metro'], ['1:00 PM', '🍜 Korean Food Tour', '8 min walk · Locked'], ['3:30 PM', '🛍️ Myeongdong', 'Flexible finish']].map(stop => <View key={stop[0]} style={styles.stopRow}><Text style={styles.stopTime}>{stop[0]}</Text><View style={styles.stopLine}><Text style={styles.stopTitle}>{stop[1]}</Text><Text style={styles.stopDetail}>{stop[2]}</Text></View></View>)}<View style={styles.planReason}><Text style={styles.planReasonTitle}>Why this works</Text><Text style={styles.planReasonText}>Food matches the group&apos;s top priority, walking stays low, and shopping gets a flexible afternoon slot.</Text></View><Pressable onPress={() => setPhase('setup')} style={styles.nextStepButton}><Text style={styles.nextStepText}>Plan another day →</Text></Pressable></View>
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
            <View style={styles.calendarHeader}><View><Text style={styles.eyebrowDark}>TRIP SETUP</Text><Text style={styles.calendarTitle}>Select dates</Text></View><Pressable onPress={() => setShowCalendar(false)} style={styles.calendarClose}><Text style={styles.calendarCloseText}>×</Text></Pressable></View>
            <View style={styles.monthSwitcher}><Pressable disabled={calendarMonth.year === today.getFullYear() && calendarMonth.month <= today.getMonth()} onPress={() => changeMonth(-1)} style={[styles.monthArrow, calendarMonth.year === today.getFullYear() && calendarMonth.month <= today.getMonth() && styles.monthArrowDisabled]}><Ionicons name="chevron-back" size={18} color="#2563eb" /></Pressable><View style={styles.calendarSelectors}><Pressable onPress={() => setCalendarMode(calendarMode === 'months' ? 'days' : 'months')}><Text style={styles.calendarMonth}>{monthNames[calendarMonth.month]}</Text></Pressable><Pressable onPress={() => setCalendarMode(calendarMode === 'years' ? 'days' : 'years')}><Text style={styles.calendarYear}>{calendarMonth.year}</Text></Pressable></View><Pressable onPress={() => changeMonth(1)} style={styles.monthArrow}><Ionicons name="chevron-forward" size={18} color="#2563eb" /></Pressable></View>
            <Text style={styles.calendarHint}>{startDate && !endDate ? 'Now choose your last day' : 'Choose your first day'}</Text>
            {calendarMode === 'days' && <ScrollView ref={calendarPagerRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={event => { const nextIndex = Math.round(event.nativeEvent.contentOffset.x / 340); const nextMonth = calendarMonths[nextIndex]; if (nextMonth) setCalendarMonth(nextMonth); }} style={styles.monthPager}>{calendarMonths.map(month => <View key={`${month.year}-${month.month}`} style={styles.monthPage}>{renderMonthPage(month.year, month.month)}</View>)}</ScrollView>}
            {calendarMode === 'months' && <View style={styles.choiceGrid}>{monthNames.map((month, index) => <Pressable key={month} onPress={() => selectMonth(index)} style={[styles.choiceButton, index === calendarMonth.month && styles.choiceButtonSelected]}><Text style={[styles.choiceText, index === calendarMonth.month && styles.choiceTextSelected]}>{month.slice(0, 3)}</Text></Pressable>)}</View>}
            {calendarMode === 'years' && <View style={styles.choiceGrid}>{Array.from({ length: 11 }, (_, index) => today.getFullYear() + index).map(year => <Pressable key={year} onPress={() => selectYear(year)} style={[styles.choiceButton, year === calendarMonth.year && styles.choiceButtonSelected]}><Text style={[styles.choiceText, year === calendarMonth.year && styles.choiceTextSelected]}>{year}</Text></Pressable>)}</View>}
            <View style={styles.calendarFooter}><Pressable onPress={() => { setStartDate(null); setEndDate(null); setTripDates(''); }} style={styles.clearDates}><Text style={styles.clearDatesText}>Clear dates</Text></Pressable><Pressable disabled={!startDate || !endDate} onPress={() => setShowCalendar(false)} style={[styles.doneDates, (!startDate || !endDate) && styles.doneDatesDisabled]}><Text style={styles.doneDatesText}>Done</Text></Pressable></View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#0f172a', fontSize: 20, fontWeight: '900', letterSpacing: -0.2 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  backButtonText: { color: '#1e3a8a', fontSize: 10, fontWeight: '900' },
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
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 22, paddingBottom: 18 },
  phaseRail: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  phaseItem: { alignItems: 'center', flex: 1 },
  phaseDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  phaseDotActive: { backgroundColor: '#bfdbfe' },
  phaseDotText: { color: '#1e3a8a', fontSize: 10, fontWeight: '900' },
  phaseLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: '900', marginTop: 4 },
  phaseLabelActive: { color: '#fff' },
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
  travellerText: { color: '#0f172a', fontSize: 11, fontWeight: '800', marginLeft: 9, flex: 1 },
  travellerRole: { color: '#64748b', fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  addTravellerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  addTravellerInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 12, color: '#0f172a', fontSize: 11, paddingHorizontal: 11, paddingVertical: 10 },
  addTravellerButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11 },
  addTravellerButtonText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  joinPreview: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9 },
  joinInput: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, color: '#0f172a', fontSize: 10, paddingHorizontal: 10, paddingVertical: 10 },
  joinButton: { backgroundColor: '#0f172a', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 11 },
  joinButtonText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  readyHint: { color: '#64748b', fontSize: 10, lineHeight: 15, marginTop: 10 },
  calendarBackdrop: { flex: 1, backgroundColor: '#fff' },
  calendarSheet: { flex: 1, backgroundColor: '#fff', padding: 22, paddingTop: 42 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  calendarTitle: { color: '#0f172a', fontSize: 30, fontWeight: '900', marginTop: 5 },
  monthSwitcher: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 },
  calendarMonth: { color: '#0f172a', fontSize: 16, fontWeight: '900' },
  calendarSelectors: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  calendarYear: { color: '#2563eb', fontSize: 16, fontWeight: '900' },
  monthArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  monthArrowDisabled: { opacity: 0.35 },
  calendarClose: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  calendarCloseText: { color: '#475569', fontSize: 22, lineHeight: 22 },
  calendarHint: { color: '#2563eb', fontSize: 11, fontWeight: '800', marginTop: 14 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 18, marginBottom: 8 },
  weekDay: { width: 36, color: '#94a3b8', fontSize: 10, fontWeight: '900', textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 },
  monthPager: { width: '100%' },
  monthPage: { width: 340, alignSelf: 'center' },
  calendarDay: { width: '13.3%', aspectRatio: 1, maxWidth: 48, maxHeight: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  calendarDaySelected: { backgroundColor: '#2563eb' },
  calendarDayRange: { backgroundColor: '#dbeafe' },
  calendarDayDisabled: { opacity: 0.35 },
  calendarDayText: { color: '#334155', fontSize: 12, fontWeight: '800' },
  calendarDayTextDisabled: { color: '#94a3b8' },
  calendarDayTextSelected: { color: '#fff' },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  choiceButton: { width: '30%', borderRadius: 13, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 14, alignItems: 'center' },
  choiceButtonSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  choiceText: { color: '#334155', fontSize: 12, fontWeight: '800' },
  choiceTextSelected: { color: '#fff' },
  calendarFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 18, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  clearDates: { alignItems: 'center', paddingVertical: 12 },
  clearDatesText: { color: '#64748b', fontSize: 11, fontWeight: '800' },
  doneDates: { backgroundColor: '#0f172a', borderRadius: 13, paddingHorizontal: 32, paddingVertical: 13 },
  doneDatesDisabled: { opacity: 0.4 },
  doneDatesText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  questionPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  questionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionProgress: { color: '#2563eb', fontSize: 11, fontWeight: '900' },
  questionTitle: { color: '#0f172a', fontSize: 24, lineHeight: 29, fontWeight: '900', marginTop: 22 },
  questionHint: { color: '#64748b', fontSize: 11, lineHeight: 17, marginTop: 7 },
  answerGrid: { gap: 9, marginTop: 20 },
  answerChoice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14 },
  answerChoiceText: { color: '#1e293b', fontSize: 12, fontWeight: '800' },
  answerArrow: { color: '#2563eb', fontSize: 20 },
  groupPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  groupBars: { marginTop: 18, gap: 13 },
  groupBarRow: { flexDirection: 'row', alignItems: 'center' },
  groupBarLabel: { width: 58, color: '#475569', fontSize: 10, fontWeight: '800' },
  groupBar: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0', overflow: 'hidden' },
  groupBarFill: { height: '100%', borderRadius: 4 },
  groupBarValue: { width: 36, color: '#0f172a', fontSize: 10, fontWeight: '900', textAlign: 'right' },
  constraintBox: { backgroundColor: '#fffbeb', borderRadius: 14, padding: 12, marginTop: 18 },
  constraintTitle: { color: '#92400e', fontSize: 11, fontWeight: '900', marginBottom: 5 },
  constraintText: { color: '#92400e', fontSize: 10, lineHeight: 16 },
  suggestionsPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  suggestionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 15, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  suggestionEmoji: { fontSize: 24, width: 38 },
  suggestionCopy: { flex: 1, marginLeft: 7 },
  suggestionTitle: { color: '#0f172a', fontSize: 12, fontWeight: '900' },
  suggestionDetail: { color: '#64748b', fontSize: 9, marginTop: 4 },
  matchScore: { color: '#059669', fontSize: 15, fontWeight: '900' },
  swipeNote: { color: '#64748b', fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 15 },
  itineraryPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  itineraryTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  satisfaction: { color: '#059669', backgroundColor: '#d1fae5', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, fontSize: 10, fontWeight: '900' },
  stopRow: { flexDirection: 'row', marginTop: 20 },
  stopTime: { width: 68, color: '#64748b', fontSize: 10, fontWeight: '900' },
  stopLine: { flex: 1, borderLeftWidth: 2, borderLeftColor: '#bfdbfe', paddingLeft: 12, paddingBottom: 3 },
  stopTitle: { color: '#0f172a', fontSize: 12, fontWeight: '900' },
  stopDetail: { color: '#64748b', fontSize: 10, marginTop: 4 },
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
});
