import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Dimensions
} from 'react-native';
import api from '../api/client';
import { ChevronLeft, Sparkles, Target, Clock, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'project', label: 'Project', icon: '🚀' },
  { id: 'exam', label: 'Exam', icon: '📚' },
  { id: 'interview', label: 'Interview', icon: '💼' },
  { id: 'study', label: 'Study', icon: '📝' },
  { id: 'business', label: 'Business', icon: '📈' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'personal', label: 'Personal', icon: '🧘' },
  { id: 'finance', label: 'Finance', icon: '💸' },
  { id: 'hobby', label: 'Hobby', icon: '🎨' },
];

const TIME_UNITS = [
  { id: 'days', label: 'Days' },
  { id: 'weeks', label: 'Weeks' },
  { id: 'months', label: 'Months' },
];

export default function CreateStrategyScreen({ navigation }) {
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('project');
  const [timeframe, setTimeframe] = useState('7');
  const [unit, setUnit] = useState('days');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!goal || !timeframe) {
      alert('Bhai, please fill all fields!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/strategy/generate', {
        goal: description ? `${goal}. Details: ${description}` : goal,
        category,
        timeframe: parseInt(timeframe),
        unit,
      });
      
      const generatedData = {
        goal,
        category,
        timeframe: parseInt(timeframe),
        unit,
        plan: response.data.plan,
        tasks: response.data.tasks,
      };

      navigation.navigate('StrategyDetail', { generatedData });
    } catch (error) {
      console.error('Generation error:', error);
      alert('AI is tired. Try again in 30 seconds.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Roadmap</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.introBox}>
            <Sparkles size={32} color="#4F46E5" />
            <Text style={styles.introTitle}>What's the goal?</Text>
            <Text style={styles.introDesc}>StratAI will build a 100% actionable checklist for you.</Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Goal / Ambition</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Master React Native in 30 days"
                placeholderTextColor="#9CA3AF"
                value={goal}
                onChangeText={setGoal}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>More Context (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Add specific details, links, or constraints..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    category === cat.id && styles.catChipActive
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.catLabel,
                    category === cat.id && styles.catLabelActive
                  ]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                <Text style={styles.label}>Timeframe</Text>
                <View style={styles.miniInputWrapper}>
                  <Clock size={18} color="#4F46E5" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.miniInput}
                    value={timeframe}
                    onChangeText={setTimeframe}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1.5 }]}>
                <Text style={styles.label}>Unit</Text>
                <View style={styles.unitToggle}>
                  {TIME_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u.id}
                      style={[
                        styles.unitBtn,
                        unit === u.id && styles.unitBtnActive
                      ]}
                      onPress={() => setUnit(u.id)}
                    >
                      <Text style={[
                        styles.unitText,
                        unit === u.id && styles.unitTextActive
                      ]}>{u.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.generateBtn, loading && styles.disabledBtn]} 
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.generateBtnText}>Build Roadmap</Text>
                <Zap size={20} color="#FFF" fill="#FFF" />
              </>
            )}
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  scrollContent: { padding: 16 },
  introBox: { alignItems: 'center', marginBottom: 24 },
  introTitle: { fontSize: 24, fontWeight: '900', color: '#111827', marginTop: 16 },
  introDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, fontWeight: '500' },
  inputSection: { gap: 24 },
  inputGroup: {},
  label: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  catChipActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  catIcon: { fontSize: 18, marginRight: 8 },
  catLabel: { fontSize: 14, fontWeight: '700', color: '#4B5563' },
  catLabelActive: { color: '#4F46E5' },
  row: { flexDirection: 'row', alignItems: 'center' },
  miniInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  miniInput: { flex: 1, fontSize: 18, fontWeight: '800', color: '#111827' },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 4,
    height: 56,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  unitBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  unitBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  unitText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  unitTextActive: { color: '#4F46E5' },
  generateBtn: {
    backgroundColor: '#111827',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  disabledBtn: { opacity: 0.7 },
  generateBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800', marginRight: 10 },
});
