import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import {
  Plus,
  BrainCircuit,
  Calendar,
  TrendingUp,
  ClipboardCheck,
  CheckCircle2,
  Circle,
  User as UserIcon,
  Flame,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ── bar chart data (7 days activity mock — replace with real data later)
const CHART_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HomeScreen({ navigation }) {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchStrategies = async () => {
    try {
      const res = await api.get('/strategy/my-strategies');
      setStrategies(res.data);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchStrategies);
    return unsub;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStrategies();
  }, []);

  // ── stats
  const totalTasks     = strategies.reduce((a, s) => a + (s.tasks?.length || 0), 0);
  const completedTasks = strategies.reduce((a, s) => a + (s.tasks?.filter(t => t.completed).length || 0), 0);
  const overallPct     = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activePlans    = strategies.filter(s => {
    const done = s.tasks?.filter(t => t.completed).length || 0;
    return done < (s.tasks?.length || 1);
  }).length;

  // ── bar heights: derive from real per-strategy progress or fallback
  const barData = strategies.length >= 7
    ? strategies.slice(0, 7).map(s => {
        const t = s.tasks?.length || 1;
        const d = s.tasks?.filter(x => x.completed).length || 0;
        return d / t;
      })
    : [0.4, 0.65, 0.3, 0.8, 0.55, 0.7, overallPct / 100 || 0.5];

  const catTheme = (cat) => {
    const t = {
      project:   { bg: '#E0F2FE', text: '#0369A1', accent: '#0284C7' },
      exam:      { bg: '#FEE2E2', text: '#B91C1C', accent: '#DC2626' },
      interview: { bg: '#DCFCE7', text: '#15803D', accent: '#16A34A' },
      study:     { bg: '#FEF9C3', text: '#A16207', accent: '#CA8A04' },
      business:  { bg: '#F3E8FF', text: '#7E22CE', accent: '#9333EA' },
      fitness:   { bg: '#FFEDD5', text: '#C2410C', accent: '#EA580C' },
    };
    return t[cat] || { bg: '#F3F4F6', text: '#374151', accent: '#4B5563' };
  };

  const renderCard = ({ item }) => {
    const theme   = catTheme(item.category);
    const done    = item.tasks?.filter(t => t.completed).length || 0;
    const total   = item.tasks?.length || 0;
    const pct     = total > 0 ? done / total : 0;
    const pctNum  = Math.round(pct * 100);

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.card}
        onPress={() => navigation.navigate('StrategyDetail', { id: item._id })}
      >
        {/* top row */}
        <View style={styles.cardTop}>
          <View style={[styles.catPill, { backgroundColor: theme.bg }]}>
            <View style={[styles.catDot, { backgroundColor: theme.accent }]} />
            <Text style={[styles.catLabel, { color: theme.text }]}>
              {item.category.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.cardDate}>
            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        </View>

        {/* goal */}
        <Text style={styles.goalText} numberOfLines={2}>{item.goal}</Text>

        {/* progress bar */}
        <View style={styles.progRow}>
          <View style={styles.progTrack}>
            <View style={[styles.progFill, { width: `${pctNum}%`, backgroundColor: theme.accent }]} />
          </View>
          <Text style={[styles.progPct, { color: theme.accent }]}>{pctNum}%</Text>
        </View>

        {/* footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Calendar size={13} color="#9CA3AF" />
            <Text style={styles.footerMeta}>{item.timeframe} {item.unit}</Text>
            <Text style={styles.footerDot}>·</Text>
            <Text style={styles.footerTasks}>{done}/{total} tasks</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkBtn, { backgroundColor: theme.bg }]}
            onPress={() => navigation.navigate('StrategyDetail', { id: item._id })}
          >
            <ClipboardCheck size={14} color={theme.accent} />
            <Text style={[styles.checkBtnText, { color: theme.accent }]}>Checklist</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
        }
        contentContainerStyle={styles.scrollContent}
      >

        {/* ══ HEADER ══ */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},
            </Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'there'} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ══ STATS ROW ══ */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
            <Text style={[styles.statNum, { color: '#4F46E5' }]}>{strategies.length}</Text>
            <Text style={styles.statLabel}>Total Plans</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[styles.statNum, { color: '#059669' }]}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}>
            <Text style={[styles.statNum, { color: '#EA580C' }]}>{activePlans}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* ══ PROGRESS CHART CARD ══ */}
        <View style={styles.chartCard}>
          {/* chart header */}
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartLabel}>Overall Progress</Text>
              <Text style={styles.chartPct}>{overallPct}%</Text>
              <Text style={styles.chartSub}>{completedTasks} of {totalTasks} tasks done</Text>
            </View>
            <View style={styles.flameBadge}>
              <Flame size={16} color="#EA580C" />
              <Text style={styles.flameText}>{activePlans} active</Text>
            </View>
          </View>

          {/* master progress bar */}
          <View style={styles.masterTrack}>
            <View style={[styles.masterFill, { width: `${overallPct}%` }]} />
          </View>

          {/* ── BAR CHART ── */}
          <View style={styles.barChart}>
            {barData.map((val, i) => {
              const barH = Math.max(8, Math.round(val * 80));
              const isHighest = val === Math.max(...barData);
              return (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barWrapper}>
                    {isHighest && (
                      <View style={styles.barTooltip}>
                        <Text style={styles.barTooltipText}>{Math.round(val * 100)}%</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barH,
                          backgroundColor: isHighest ? '#4F46E5' : '#E0E7FF',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isHighest && { color: '#4F46E5', fontWeight: '800' }]}>
                    {CHART_DAYS[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ══ SECTION HEADER ══ */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Active Strategies</Text>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => navigation.navigate('CreateStrategy')}
          >
            <Plus size={15} color="#FFF" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* ══ LIST ══ */}
        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : strategies.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <BrainCircuit size={36} color="#C7D2FE" />
            </View>
            <Text style={styles.emptyTitle}>No strategies yet</Text>
            <Text style={styles.emptyDesc}>Create your first AI-powered plan</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('CreateStrategy')}
            >
              <Plus size={16} color="#FFF" />
              <Text style={styles.emptyBtnText}>Create Strategy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={strategies}
            renderItem={renderCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
          />
        )}

      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateStrategy')}
        activeOpacity={0.85}
      >
        <Plus size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { paddingBottom: 110 },

  // header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '900', color: '#111827', marginTop: 2 },
  avatarBtn: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  // stats row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statNum: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginTop: 2, textAlign: 'center' },

  // chart card
  chartCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  chartLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  chartPct: { fontSize: 38, fontWeight: '900', color: '#111827', lineHeight: 44 },
  chartSub: { fontSize: 12, color: '#9CA3AF', fontWeight: '500', marginTop: 2 },
  flameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  flameText: { fontSize: 12, fontWeight: '700', color: '#EA580C' },

  // master progress
  masterTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  masterFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },

  // bar chart
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110,
    paddingTop: 20,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 85,
    width: '100%',
  },
  bar: {
    width: '55%',
    borderRadius: 5,
    minHeight: 8,
  },
  barTooltip: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  barTooltipText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  barLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 6,
  },

  // section row
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  list: { paddingHorizontal: 20 },

  // card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  catDot: { width: 5, height: 5, borderRadius: 3 },
  catLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  cardDate: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  goalText: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12, lineHeight: 22 },

  // progress
  progRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  progTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progFill: { height: '100%', borderRadius: 3 },
  progPct: { fontSize: 12, fontWeight: '800', minWidth: 36, textAlign: 'right' },

  // footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    paddingTop: 12,
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerMeta: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  footerDot: { fontSize: 12, color: '#D1D5DB', marginHorizontal: 2 },
  footerTasks: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  checkBtnText: { fontSize: 12, fontWeight: '800' },

  // empty
  center: { padding: 40, alignItems: 'center' },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#374151', marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginBottom: 20 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 60, height: 60,
    borderRadius: 30,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
});