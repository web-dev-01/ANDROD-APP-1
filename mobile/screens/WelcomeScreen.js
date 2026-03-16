import React, { useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import {
  ArrowRight,
  Target,
  Zap,
  CheckCircle,
  BarChart3,
  User,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// ── local asset ──
const LANDING_BG = require('../assets/landing_bg.png');

const FEATURES = [
  {
    icon: Target,
    color: '#6366F1',
    bg: '#EEF2FF',
    title: 'AI Strategy Builder',
    desc: 'AI turns any goal into a crisp 10-task action plan',
  },
  {
    icon: CheckCircle,
    color: '#10B981',
    bg: '#ECFDF5',
    title: 'Live Checklist',
    desc: 'Tick tasks — progress bar updates instantly',
  },
  {
    icon: Zap,
    color: '#F59E0B',
    bg: '#FFFBEB',
    title: 'Flexible Timelines',
    desc: '3 days to 6 months — any pace works',
  },
  {
    icon: BarChart3,
    color: '#EF4444',
    bg: '#FEF2F2',
    title: 'Progress Dashboard',
    desc: 'All plans, stats and streaks in one view',
  },
];

export default function WelcomeScreen({ navigation }) {
  const { loginAsGuest } = useContext(AuthContext);

  const heroFade  = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(24)).current;
  const bodyFade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroFade,  { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(heroSlide, { toValue: 0, duration: 550, useNativeDriver: true }),
      ]),
      Animated.timing(bodyFade, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ════════════════════════════════
          HERO — fills top portion
      ════════════════════════════════ */}
      <View style={styles.heroWrap}>
        {/* local background image */}
        <Image source={LANDING_BG} style={styles.heroBg} resizeMode="cover" />

        {/* dark scrim so text stays readable */}
        <View style={styles.scrimTop} />
        <View style={styles.scrimBottom} />

        {/* ── NAVBAR — sits inside hero, below status bar ── */}
        <SafeAreaView style={styles.navSafeArea}>
          <View style={styles.navbar}>
            <View style={styles.navBrand}>
              <View style={styles.navIconBox}>
                <BarChart3 size={15} color="#FFF" />
              </View>
              <Text style={styles.navBrandText}>StratAI</Text>
            </View>
            <TouchableOpacity
              style={styles.navLoginBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.navLoginText}>Log In</Text>
              <ChevronRight size={13} color="#6366F1" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* ── HERO TEXT ── */}
        <Animated.View
          style={[
            styles.heroContent,
            { opacity: heroFade, transform: [{ translateY: heroSlide }] },
          ]}
        >
          <View style={styles.heroPill}>
            <Sparkles size={12} color="#A5B4FC" />
            <Text style={styles.heroPillText}>AI-Powered Planning</Text>
          </View>

          <Text style={styles.heroTitle}>
            Turn Your Goals{'\n'}
            <Text style={styles.heroAccent}>Into Action</Text>
          </Text>

          <Text style={styles.heroSub}>
            Interview, exam, project or startup — get a personalized
            step-by-step roadmap in seconds.
          </Text>
        </Animated.View>
      </View>

      {/* ════════════════════════════════
          BODY — white card slides up
      ════════════════════════════════ */}
      <Animated.ScrollView
        style={{ opacity: bodyFade }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        bounces={false}
      >
        {/* ── FEATURE CARDS ── */}
        <Text style={styles.sectionLabel}>What You Get</Text>
        <View style={styles.featGrid}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <View key={i} style={styles.featCard}>
                <View style={[styles.featIcon, { backgroundColor: f.bg }]}>
                  <Icon size={19} color={f.color} />
                </View>
                <Text style={styles.featTitle}>{f.title}</Text>
                <Text style={styles.featDesc}>{f.desc}</Text>
              </View>
            );
          })}
        </View>

        {/* ── TRUST CHIPS ── */}
        <View style={styles.trustRow}>
          {['Max 10 Tasks', 'Free Forever', 'Offline Ready'].map((t, i) => (
            <View key={i} style={styles.trustChip}>
              <Text style={styles.trustText}>✓  {t}</Text>
            </View>
          ))}
        </View>

        {/* ── CTA BUTTONS ── */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.87}
        >
          <Text style={styles.btnPrimaryText}>Get Started — It's Free</Text>
          <ArrowRight size={19} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnSecondaryText}>Already have an account?</Text>
          <ChevronRight size={15} color="#6366F1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnGuest}
          onPress={loginAsGuest}
          activeOpacity={0.7}
        >
          <User size={14} color="#94A3B8" />
          <Text style={styles.btnGuestText}>Continue as Guest</Text>
        </TouchableOpacity>

      </Animated.ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────
const NAV_H = Platform.OS === 'ios' ? 44 : 56;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // ── HERO ──
  heroWrap: {
    height: height * 0.48,
    backgroundColor: '#0F172A',
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  scrimTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  scrimBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '60%',
    backgroundColor: 'rgba(8,12,28,0.78)',
  },

  // ── NAVBAR (inside hero, below status bar) ──
  navSafeArea: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navIconBox: {
    width: 30, height: 30,
    borderRadius: 9,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBrandText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  navLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 0,
  },
  navLoginText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },

  // ── HERO TEXT ──
  heroContent: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 22,
    paddingBottom: 26,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A5B4FC',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 31,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 38,
    marginBottom: 10,
  },
  heroAccent: { color: '#818CF8' },
  heroSub: {
    fontSize: 13.5,
    color: '#CBD5E1',
    lineHeight: 20,
    fontWeight: '400',
    maxWidth: width * 0.85,
  },

  // ── SCROLL BODY ──
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 36,
    backgroundColor: '#F8FAFC',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // 2×2 feature grid
  featGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  featCard: {
    width: (width - 46) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featIcon: {
    width: 38, height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  featDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    fontWeight: '400',
  },

  // trust chips
  trustRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  trustChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  trustText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#059669',
  },

  // CTA
  btnPrimary: {
    backgroundColor: '#6366F1',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  btnSecondary: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 4,
  },
  btnSecondaryText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '700',
  },
  btnGuest: {
    height: 42,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnGuestText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});