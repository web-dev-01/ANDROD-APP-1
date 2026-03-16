import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Share,
  StatusBar,
  Dimensions,
  TextInput,
  Platform,
  Animated,
} from 'react-native';
import api from '../api/client';
import {
  ChevronLeft,
  Save,
  Trash2,
  Share2,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  Edit2,
  Check,
  Copy,
  Target,
  TrendingUp,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

// ── category themes
const CAT_THEME = {
  project:   { color: '#4F46E5', bg: '#EEF2FF', light: '#C7D2FE' },
  exam:      { color: '#DC2626', bg: '#FEE2E2', light: '#FECACA' },
  interview: { color: '#059669', bg: '#DCFCE7', light: '#A7F3D0' },
  study:     { color: '#D97706', bg: '#FEF9C3', light: '#FDE68A' },
  business:  { color: '#7C3AED', bg: '#F3E8FF', light: '#DDD6FE' },
  fitness:   { color: '#EA580C', bg: '#FFEDD5', light: '#FED7AA' },
};
const getTheme = (cat) => CAT_THEME[cat] || { color: '#4B5563', bg: '#F3F4F6', light: '#E5E7EB' };

export default function StrategyDetailScreen({ route, navigation }) {
  const { id, generatedData } = route.params || {};
  const [strategy, setStrategy]       = useState(generatedData || null);
  const [loading, setLoading]         = useState(!generatedData);
  const [saving, setSaving]           = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [editedGoal, setEditedGoal]   = useState('');

  useEffect(() => {
    if (id) fetchStrategy();
  }, [id]);

  const fetchStrategy = async () => {
    try {
      const res = await api.get(`/strategy/${id}`);
      setStrategy(res.data);
      setEditedGoal(res.data.goal);
    } catch {
      Alert.alert('Error', 'Could not load strategy');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post('/strategy/save', strategy);
      setStrategy(res.data);
      Alert.alert('Saved!', 'Strategy saved to your dashboard.');
    } catch {
      Alert.alert('Error', 'Could not save strategy');
    } finally {
      setSaving(false);
    }
  };

  const saveGoalEdit = async () => {
    if (!strategy._id) {
      setStrategy({ ...strategy, goal: editedGoal });
      setEditingGoal(false);
      return;
    }
    try {
      await api.post('/strategy/save', { ...strategy, goal: editedGoal });
      setStrategy({ ...strategy, goal: editedGoal });
      setEditingGoal(false);
    } catch {
      Alert.alert('Error', 'Could not update goal');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Plan?', 'This will permanently remove the strategy.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/strategy/${strategy._id}`);
            navigation.popToTop();
          } catch {
            Alert.alert('Error', 'Could not delete');
          }
        },
      },
    ]);
  };

  const toggleTask = async (index) => {
    if (!strategy._id) {
      Alert.alert('Save First', 'Save this strategy to enable task tracking.');
      return;
    }
    const updated = [...strategy.tasks];
    updated[index].completed = !updated[index].completed;
    setStrategy({ ...strategy, tasks: updated });
    try {
      await api.patch(`/strategy/${strategy._id}/task/${index}`, {
        completed: updated[index].completed,
      });
    } catch {
      updated[index].completed = !updated[index].completed;
      setStrategy({ ...strategy, tasks: updated });
    }
  };

  const copyPlan = async () => {
    await Clipboard.setStringAsync(strategy.plan);
    Alert.alert('Copied!', 'Plan copied to clipboard.');
  };

  const sharePlan = async () => {
    try {
      await Share.share({ message: `Goal: ${strategy.goal}\n\nPlan:\n${strategy.plan}` });
    } catch (e) { console.log(e); }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const theme       = getTheme(strategy.category);
  const total       = strategy.tasks?.length || 0;
  const done        = strategy.tasks?.filter(t => t.completed).length || 0;
  const pct         = total > 0 ? Math.round((done / total) * 100) : 0;
  const remaining   = total - done;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Plan Detail</Text>

        <View style={styles.headerRight}>
          {!strategy._id ? (
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.bg }]} onPress={handleSave} disabled={saving}>
              {saving
                ? <ActivityIndicator size="small" color={theme.color} />
                : <Save size={19} color={theme.color} />}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#FEE2E2' }]} onPress={handleDelete}>
              <Trash2 size={19} color="#DC2626" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.bg }]} onPress={sharePlan}>
            <Share2 size={19} color={theme.color} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ── HERO CARD ── */}
        <View style={[styles.heroCard, { borderColor: theme.light }]}>
          {/* category + edit */}
          <View style={styles.heroTop}>
            <View style={[styles.catPill, { backgroundColor: theme.bg }]}>
              <View style={[styles.catDot, { backgroundColor: theme.color }]} />
              <Text style={[styles.catText, { color: theme.color }]}>
                {strategy.category?.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => { setEditingGoal(!editingGoal); setEditedGoal(strategy.goal); }}
            >
              <Edit2 size={15} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* goal */}
          {editingGoal ? (
            <View style={styles.editGoalRow}>
              <TextInput
                style={styles.goalInput}
                value={editedGoal}
                onChangeText={setEditedGoal}
                multiline
                autoFocus
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity style={[styles.doneBtn, { backgroundColor: theme.color }]} onPress={saveGoalEdit}>
                <Check size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.goalTitle}>{strategy.goal}</Text>
          )}

          {/* meta chips */}
          <View style={styles.metaRow}>
            <View style={[styles.metaChip, { backgroundColor: '#F3F4F6' }]}>
              <Clock size={13} color="#6B7280" />
              <Text style={styles.metaChipText}>{strategy.timeframe} {strategy.unit}</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: '#F3F4F6' }]}>
              <Layers size={13} color="#6B7280" />
              <Text style={styles.metaChipText}>{total} tasks</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: theme.bg }]}>
              <Target size={13} color={theme.color} />
              <Text style={[styles.metaChipText, { color: theme.color }]}>{remaining} left</Text>
            </View>
          </View>
        </View>

        {/* ── PROGRESS BLOCK ── */}
        {strategy._id && (
          <View style={styles.progressCard}>
            {/* circular-style big number */}
            <View style={styles.progressLeft}>
              <View style={[styles.progressRing, { borderColor: theme.light }]}>
                <Text style={[styles.progressPct, { color: theme.color }]}>{pct}%</Text>
                <Text style={styles.progressSub}>done</Text>
              </View>
            </View>

            <View style={styles.progressRight}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              {/* segmented bar */}
              <View style={styles.segTrack}>
                {Array.from({ length: total }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.seg,
                      {
                        backgroundColor: i < done ? theme.color : '#E5E7EB',
                        flex: 1,
                        marginHorizontal: 1.5,
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.progressStats}>
                <Text style={styles.statDone}>{done} completed</Text>
                <Text style={styles.statRemain}>{remaining} remaining</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── CHECKLIST ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Checklist</Text>
            {!strategy._id && (
              <View style={styles.savePill}>
                <Text style={styles.savePillText}>Save to track</Text>
              </View>
            )}
          </View>

          <View style={styles.taskList}>
            {strategy.tasks?.map((task, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.75}
                style={[
                  styles.taskRow,
                  task.completed && styles.taskRowDone,
                ]}
                onPress={() => toggleTask(i)}
              >
                {/* left: number */}
                <View style={[styles.taskNumBox, task.completed && { backgroundColor: theme.color }]}>
                  {task.completed
                    ? <Check size={13} color="#FFF" />
                    : <Text style={styles.taskNum}>{i + 1}</Text>
                  }
                </View>

                {/* middle: text */}
                <Text style={[styles.taskText, task.completed && styles.taskTextDone]}>
                  {task.title}
                </Text>

                {/* right: check icon */}
                <View style={styles.taskCheck}>
                  {task.completed
                    ? <CheckCircle2 size={20} color={theme.color} />
                    : <Circle size={20} color="#D1D5DB" />
                  }
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── PLAN TEXT ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Strategy Notes</Text>
            <TouchableOpacity style={[styles.copyBtn, { backgroundColor: theme.bg }]} onPress={copyPlan}>
              <Copy size={14} color={theme.color} />
              <Text style={[styles.copyBtnText, { color: theme.color }]}>Copy</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.planBox, { borderColor: theme.light }]}>
            <Text style={styles.planText}>{strategy.plan}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 60 },

  // hero card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  catDot: { width: 6, height: 6, borderRadius: 3 },
  catText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  editBtn: {
    width: 32, height: 32,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 14,
  },
  editGoalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    gap: 10,
  },
  goalInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
    paddingBottom: 6,
    lineHeight: 28,
  },
  doneBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  metaChipText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },

  // progress card
  progressCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  progressLeft: { alignItems: 'center' },
  progressRing: {
    width: 78, height: 78,
    borderRadius: 39,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  progressPct: { fontSize: 20, fontWeight: '900' },
  progressSub: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', marginTop: 1 },
  progressRight: { flex: 1 },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  segTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  seg: { height: '100%', borderRadius: 2 },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between' },
  statDone: { fontSize: 12, fontWeight: '700', color: '#059669' },
  statRemain: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },

  // section
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  savePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FEF9C3',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  savePillText: { fontSize: 11, fontWeight: '700', color: '#D97706' },

  // task rows
  taskList: { gap: 8 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  taskRowDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#D1FAE5',
  },
  taskNumBox: {
    width: 26, height: 26,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  taskNum: { fontSize: 12, fontWeight: '800', color: '#6B7280' },
  taskText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 20,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskCheck: { flexShrink: 0 },

  // plan box
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  copyBtnText: { fontSize: 12, fontWeight: '700' },
  planBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
  },
  planText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 24,
    fontWeight: '500',
  },
});