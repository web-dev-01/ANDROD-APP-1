import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, ChevronLeft, ArrowRight } from 'lucide-react-native';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Every field is a building block. Fill them all!');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.error || 'Could not create account.');
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <Text style={styles.title}>Start your journey</Text>
            <Text style={styles.subtitle}>Join thousands using AI to reach their goals.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Choose Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Min 6 characters"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.regBtn, loading && styles.disabledBtn]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.regBtnText}>Create Account</Text>
                  <ArrowRight size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 30, flexGrow: 1 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerSection: { marginBottom: 35 },
  title: { fontSize: 32, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 10, fontWeight: '500' },
  form: { gap: 24 },
  inputGroup: {},
  label: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: 16,
    height: 64,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827', fontWeight: '600' },
  regBtn: {
    backgroundColor: '#111827',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledBtn: { opacity: 0.7 },
  regBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800', marginRight: 10 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, paddingVertical: 20 },
  footerText: { color: '#6B7280', fontSize: 15, fontWeight: '500' },
  linkText: { color: '#4F46E5', fontSize: 15, fontWeight: '800' },
});
