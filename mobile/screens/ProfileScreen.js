import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  Image
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, User, Mail, Lock, Save, Camera, LogOut } from 'lucide-react-native';

export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState(user?.avatar || null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission needed', 'You need to allow access to your photos to upload an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatarUri(base64Img);
    }
  };

  const handleUpdate = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Name and Email are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password: password || undefined,
        avatar: avatarUri,
      };

      const response = await api.patch('/auth/profile', payload);
      setUser(response.data.user);
      Alert.alert('Success', 'Profile updated successfully!');
      setPassword('');
    } catch (error) {
      Alert.alert('Update Failed', error.response?.data?.error || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarBorder} onPress={pickImage}>
            <View style={styles.avatar}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%', borderRadius: 46 }} />
              ) : (
                <Text style={styles.avatarText}>{name?.charAt(0).toUpperCase() || 'U'}</Text>
              )}
            </View>
            <View style={styles.cameraBtn}>
              <Camera size={18} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userNameHeader}>{name}</Text>
          <Text style={styles.userEmailHeader}>{email}</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your Name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email Address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Min 6 characters"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.updateBtn, loading && styles.disabledBtn]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.updateBtnText}>Save Changes</Text>
                <Save size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  content: { paddingBottom: 40 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#F9FAFB',
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 4,
    backgroundColor: '#EEF2FF',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 46,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 36, fontWeight: '800' },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#111827',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userNameHeader: { fontSize: 22, fontWeight: '800', color: '#111827' },
  userEmailHeader: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  formSection: { padding: 16, marginTop: 8 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827', fontWeight: '500' },
  updateBtn: {
    backgroundColor: '#4F46E5',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledBtn: { opacity: 0.6 },
  updateBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700', marginRight: 10 },
});
