import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    await SecureStore.setItemAsync('token', token);
    setUser(user);
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { token, user } = response.data;
    await SecureStore.setItemAsync('token', token);
    setUser(user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    setUser(null);
  };

  const loginAsGuest = async () => {
    const randomGuestNum = Math.floor(Math.random() * 1000000);
    const guestEmail = `guest_${randomGuestNum}@stratai.com`;
    // Register temporary guest
    await register('Guest User', guestEmail, 'guestpass123');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};
